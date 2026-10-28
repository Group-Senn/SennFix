import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from './db.js';

// --- Verificación de celular por WhatsApp (OTP propio + WhatsApp Cloud API de Meta) ---

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_SENDS_PER_HOUR = 5;
const PHONE_TOKEN_TTL = '30m';

const BOLIVIA_MOBILE_REGEX = /^\+591[67]\d{7}$/;

// Secretos derivados: los tokens de verificación NO sirven como token de sesión (y viceversa)
function deriveSecret(baseSecret, purpose) {
  return crypto.createHmac('sha256', baseSecret).update(purpose).digest('hex');
}

/**
 * Normaliza un celular boliviano a formato E.164 (+591XXXXXXXX).
 * Acepta "77338754", "59177338754" o "+591 773 38754". Devuelve null si no es válido.
 */
export function normalizeBolivianPhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.length === 8) digits = `591${digits}`;
  const phone = `+${digits}`;
  return BOLIVIA_MOBILE_REGEX.test(phone) ? phone : null;
}

export async function ensurePhoneVerificationSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS phone_verifications (
      id SERIAL PRIMARY KEY,
      phone_number VARCHAR(20) NOT NULL,
      code_hash VARCHAR(128) NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications (phone_number, created_at DESC)');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE');
  // Limpieza de códigos viejos (más de 1 día)
  await db.query("DELETE FROM phone_verifications WHERE created_at < NOW() - INTERVAL '1 day'");
}

function hashCode(secret, phone, code) {
  return crypto.createHmac('sha256', secret).update(`${phone}:${code}`).digest('hex');
}

function safeEqualHex(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// La verificación es obligatoria solo cuando hay cómo enviar el código (Meta configurado o modo dev).
// Mientras tanto el registro funciona y la cuenta queda con phone_verified = false.
export function isPhoneVerificationRequired() {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, OTP_DEV_MODE, NODE_ENV } = process.env;
  return Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) || (OTP_DEV_MODE === 'true' && NODE_ENV !== 'production');
}

async function sendWhatsAppCode(phone, code) {
  const {
    WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_TEMPLATE_NAME = 'codigo_verificacion',
    WHATSAPP_TEMPLATE_LANG = 'es',
    WHATSAPP_API_VERSION = 'v23.0',
    OTP_DEV_MODE,
    NODE_ENV
  } = process.env;

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    // Solo para desarrollo local: muestra el código en la consola del servidor
    if (OTP_DEV_MODE === 'true' && NODE_ENV !== 'production') {
      console.log(`[OTP_DEV_MODE] Código para ${phone}: ${code}`);
      return;
    }
    throw new Error('WhatsApp Cloud API no configurada (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).');
  }

  // Plantilla de categoría "Autenticación" con botón "Copiar código"
  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace('+', ''),
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,
        language: { code: WHATSAPP_TEMPLATE_LANG },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] }
        ]
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp API respondió ${response.status}: ${body}`);
  }
}

/**
 * Crea las rutas de verificación y el validador de tokens usando el secreto JWT del servidor.
 */
export function createPhoneVerification(jwtSecret) {
  const otpSecret = deriveSecret(jwtSecret, 'otp-hash');
  const phoneTokenSecret = deriveSecret(jwtSecret, 'phone-verification-token');

  const sendCode = async (req, res) => {
    const phone = normalizeBolivianPhone(req.body?.phone_number);
    if (!phone) {
      return res.status(400).json({ message: 'El número debe ser un celular válido de Bolivia (8 dígitos, empezando con 6 o 7).' });
    }
    if (!isPhoneVerificationRequired()) {
      return res.json({ verification_required: false });
    }

    try {
      const { rows: [existingPhone] } = await db.query('SELECT 1 FROM users WHERE phone_number = $1', [phone]);
      if (existingPhone) {
        return res.status(409).json({ message: 'El número de teléfono ya está en uso.' });
      }

      const { rows: [stats] } = await db.query(
        `SELECT
           COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour')::int AS sends_last_hour,
           EXTRACT(EPOCH FROM (NOW() - MAX(created_at)))::int AS seconds_since_last
         FROM phone_verifications WHERE phone_number = $1`,
        [phone]
      );

      if (stats.seconds_since_last !== null && stats.seconds_since_last < RESEND_COOLDOWN_SECONDS) {
        const retryAfter = RESEND_COOLDOWN_SECONDS - stats.seconds_since_last;
        return res.status(429).json({ message: `Espera ${retryAfter}s antes de pedir otro código.`, retry_after: retryAfter });
      }
      if (stats.sends_last_hour >= MAX_SENDS_PER_HOUR) {
        return res.status(429).json({ message: 'Demasiados códigos solicitados para este número. Intenta en una hora.' });
      }

      const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
      const { rows: [row] } = await db.query(
        `INSERT INTO phone_verifications (phone_number, code_hash, expires_at)
         VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval) RETURNING id`,
        [phone, hashCode(otpSecret, phone, code), OTP_TTL_MINUTES]
      );

      try {
        await sendWhatsAppCode(phone, code);
      } catch (sendError) {
        console.error('Error al enviar código por WhatsApp:', sendError.message);
        await db.query('DELETE FROM phone_verifications WHERE id = $1', [row.id]);
        return res.status(502).json({ message: 'No pudimos enviar el código por WhatsApp. Verifica que el número tenga WhatsApp e inténtalo de nuevo.' });
      }

      res.json({
        message: 'Código enviado por WhatsApp.',
        expires_in: OTP_TTL_MINUTES * 60,
        resend_in: RESEND_COOLDOWN_SECONDS
      });
    } catch (error) {
      console.error('Error en send-code:', error);
      res.status(500).json({ message: 'Error en el servidor al enviar el código.' });
    }
  };

  const verifyCode = async (req, res) => {
    const phone = normalizeBolivianPhone(req.body?.phone_number);
    const code = String(req.body?.code || '').trim();
    if (!phone || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Número o código inválido.' });
    }

    try {
      const { rows: [pending] } = await db.query(
        `SELECT id, code_hash, expires_at > NOW() AS is_valid
         FROM phone_verifications
         WHERE phone_number = $1 AND verified_at IS NULL
         ORDER BY created_at DESC LIMIT 1`,
        [phone]
      );

      if (!pending || !pending.is_valid) {
        return res.status(400).json({ message: 'El código expiró o no existe. Solicita uno nuevo.' });
      }

      // Se consume un intento de forma atómica ANTES de comparar (evita fuerza bruta en paralelo)
      const { rows: [attempt] } = await db.query(
        'UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = $1 AND attempts < $2 RETURNING attempts',
        [pending.id, MAX_ATTEMPTS]
      );
      if (!attempt) {
        return res.status(429).json({ message: 'Demasiados intentos fallidos. Solicita un código nuevo.' });
      }

      if (!safeEqualHex(hashCode(otpSecret, phone, code), pending.code_hash)) {
        const remaining = MAX_ATTEMPTS - attempt.attempts;
        return res.status(400).json({
          message: remaining > 0
            ? `El código ingresado es incorrecto. Te quedan ${remaining} intento(s).`
            : 'Demasiados intentos fallidos. Solicita un código nuevo.'
        });
      }

      await db.query('UPDATE phone_verifications SET verified_at = NOW() WHERE id = $1', [pending.id]);

      const phoneVerificationToken = jwt.sign(
        { phone_number: phone, purpose: 'phone_verification' },
        phoneTokenSecret,
        { expiresIn: PHONE_TOKEN_TTL }
      );
      res.json({ message: 'Celular verificado.', phone_verification_token: phoneVerificationToken });
    } catch (error) {
      console.error('Error en verify-code:', error);
      res.status(500).json({ message: 'Error en el servidor al verificar el código.' });
    }
  };

  /** Devuelve true si el token prueba que `phone` fue verificado recientemente. */
  const isPhoneVerified = (token, phone) => {
    if (!token || !phone) return false;
    try {
      const decoded = jwt.verify(token, phoneTokenSecret);
      return decoded.purpose === 'phone_verification' && decoded.phone_number === phone;
    } catch {
      return false;
    }
  };

  return { sendCode, verifyCode, isPhoneVerified };
}
