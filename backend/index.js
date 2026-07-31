import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import db from './db.js';
import { watermarkAndSave } from './imageService.js';
import { containsBlacklistedWords } from './validationService.js';
import { startGoldSealCron } from './cronService.js';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000; // Usa el puerto del .env o 3000 por defecto

// Middlewares
app.use(cors()); // Permite la comunicación entre frontend y backend
app.use(express.json()); // Permite al servidor entender JSON

// --- Configuración para subida de archivos ---

// Definir el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear el directorio 'uploads' si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Crear el directorio 'private_uploads' si no existe (fuera del acceso público)
const privateUploadsDir = path.join(__dirname, 'private_uploads');
if (!fs.existsSync(privateUploadsDir)) {
  fs.mkdirSync(privateUploadsDir, { recursive: true });
}

// Configuración de Multer para guardar archivos en memoria para poder procesarlos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use('/uploads', express.static(uploadsDir)); // Servir archivos estáticos desde la carpeta 'uploads'

// --- Auth Constants ---
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-secreto-cambiar-en-produccion-12345'; // ¡IMPORTANTE! Cambia esto por una frase larga y aleatoria en .env

// --- Auth Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Añade la info del usuario al request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// --- Admin Middleware ---
const adminMiddleware = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Añade la info del usuario al request

    // Verificación de rol de administrador
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
// --- Admin Notification Function ---
/**
 * Simula el envío de una alerta a los administradores.
 * En una aplicación real, esto se integraría con un servicio de email (Nodemailer),
 * SMS (Twilio), o un webhook para Slack/Discord.
 * @param {string} type - Tipo de alerta (ej: 'dispute', 'incident').
 * @param {object} details - Objeto con detalles relevantes para la alerta.
 */
async function notifyAdmins(type, details) {
  console.log(`--- 🚨 ALERTA DE ADMINISTRADOR: ${type.toUpperCase()} 🚨 ---`);
  console.log(details);
  console.log('Se requiere intervención inmediata del equipo de SENN.');
  console.log('--- FIN DE ALERTA ---');
}

// --- File Upload Security Validations ---
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function isValidImage(file) {
  if (!file) return false;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext) && ALLOWED_IMAGE_MIMETYPES.includes(mime);
}

const ALLOWED_PRIVATE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_PRIVATE_MIMETYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function isValidPrivateFile(file) {
  if (!file) return false;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  return ALLOWED_PRIVATE_EXTENSIONS.includes(ext) && ALLOWED_PRIVATE_MIMETYPES.includes(mime);
}

// Endpoint para servir archivos privados con verificación de token de administrador (CPE Art. 21)
app.get('/private_uploads/:filename', adminMiddleware, (req, res) => {
  const { filename } = req.params;

  // Prevención de ataques de path traversal para asegurar que no se lean archivos fuera de private_uploads/
  const safeFilename = path.basename(filename);
  const filePath = path.join(privateUploadsDir, safeFilename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Archivo no encontrado.' });
  }
});


// Fuzzing function para desenfocar coordenadas
function fuzzCoordinates(latitude, longitude, maxOffsetDegrees = 0.005) { // ~500m de radio
  if (latitude === null || longitude === null) {
    return { latitude: null, longitude: null };
  }
  const offsetLat = (Math.random() * 2 - 1) * maxOffsetDegrees; // Random between -maxOffsetDegrees and +maxOffsetDegrees
  const offsetLon = (Math.random() * 2 - 1) * maxOffsetDegrees;
  return {
    latitude: latitude + offsetLat,
    longitude: longitude + offsetLon
  };
}

// --- API Endpoints ---

// Endpoint para obtener todos los profesionales
app.get('/api/professionals', async (req, res) => {
  const { specialty } = req.query;
  try {
    let queryText = `
        SELECT 
          p.id, u.name, p.specialty, p.rating, p.reviews, p.is_verified as verified, 
          p.has_gold_seal, p.bio, u."imageUrl", p.services_offered, p.has_store, 
          p.store_address, p.latitude, p.longitude, p.action_radius, p.is_online, 
          p.current_latitude, p.current_longitude, p.is_minor, u.phone_number, p.hashtags 
        FROM professionals p
        JOIN users u ON p.id = u.id
        WHERE u.account_status = 'active'
      `;
    const queryParams = [];
    if (specialty) {
      queryText += ' AND p.specialty = $1';
      queryParams.push(specialty);
    }
    queryText += ' ORDER BY p.has_gold_seal DESC, p.rating DESC';
    const { rows } = await db.query(queryText, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Helper function para calcular edad
function calculateAge(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function para normalizar hashtags
function normalizeHashtags(str) {
  if (!str) return '';
  return str
    .split(/[\s,]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tag.startsWith('#') ? tag : '#' + tag)
    .join(' ');
}

// Endpoint para obtener profesionales cercanos (cerca de mí) con Privacidad y Fuzzing
app.get('/api/professionals/nearby', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitud (lat) y longitud (lon) son requeridas.' });
  }

  const clientLat = parseFloat(lat);
  const clientLon = parseFloat(lon);

  try {
    // Haversine formula in Postgres:
    // R = 6371 (Earth radius in km)
    // d = 2 * R * asin(sqrt(sin(dLat/2)^2 + cos(lat1)*cos(lat2)*sin(dLon/2)^2))
    // We use acos(LEAST(1.0, GREATEST(-1.0, ...))) to protect against floating point precision errors
    const { rows } = await db.query(`
      SELECT 
        p.id, u.name, p.specialty, p.rating, p.reviews, p.is_verified as verified, 
        p.has_gold_seal, p.bio, u."imageUrl", p.services_offered, p.has_store, 
        p.store_address, p.latitude, p.longitude, p.action_radius, p.is_online, 
        p.current_latitude, p.current_longitude, p.is_minor, u.phone_number,
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0, 
            cos(radians($1)) * cos(radians(COALESCE(p.current_latitude, p.latitude))) * 
            cos(radians(COALESCE(p.current_longitude, p.longitude)) - radians($2)) + 
            sin(radians($1)) * sin(radians(COALESCE(p.current_latitude, p.latitude)))
          ))
        )) AS distance
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE u.account_status = 'active'
        AND COALESCE(p.current_latitude, p.latitude) IS NOT NULL 
        AND COALESCE(p.current_longitude, p.longitude) IS NOT NULL
        AND (6371 * acos(
          LEAST(1.0, GREATEST(-1.0, 
            cos(radians($1)) * cos(radians(COALESCE(p.current_latitude, p.latitude))) * 
            cos(radians(COALESCE(p.current_longitude, p.longitude)) - radians($2)) + 
            sin(radians($1)) * sin(radians(COALESCE(p.current_latitude, p.latitude)))
          ))
        )) <= COALESCE(p.action_radius, 10)
      ORDER BY distance ASC
    `, [clientLat, clientLon]);

    // Opcionalmente parsear token del solicitante y registrar su ubicación en la base de datos
    let requester = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        requester = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (requester && requester.user_type === 'client') {
          await db.query(
            'UPDATE users SET last_latitude = $1, last_longitude = $2 WHERE id = $3',
            [clientLat, clientLon, requester.id]
          );
        }
      } catch (e) {
        // Ignorar token no válido
      }
    }

    // Aplicar fuzzing de coordenadas para profesionales que estén online y agregar coordenadas de visualización
    const fuzzedRows = rows.map(prof => {
      let displayLat = prof.latitude;
      let displayLon = prof.longitude;

      if (prof.is_online && prof.current_latitude !== null && prof.current_longitude !== null) {
        const fuzzed = fuzzCoordinates(prof.current_latitude, prof.current_longitude);
        displayLat = fuzzed.latitude;
        displayLon = fuzzed.longitude;
        return {
          ...prof,
          current_latitude: fuzzed.latitude,
          current_longitude: fuzzed.longitude,
          display_latitude: displayLat,
          display_longitude: displayLon
        };
      }
      return {
        ...prof,
        display_latitude: displayLat,
        display_longitude: displayLon
      };
    });

    res.json(fuzzedRows);
  } catch (error) {
    console.error('Error al obtener profesionales cercanos:', error);
    res.status(500).json({ message: 'Error en el servidor al buscar profesionales cercanos.' });
  }
});

// Endpoint para obtener un profesional por su ID
app.get('/api/professionals/:id', async (req, res, next) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return next();
  }
  try {
    const { rows: [professional] } = await db.query(`
      SELECT 
        p.id, u.name, p.specialty, p.rating, p.reviews, p.is_verified as verified, 
        p.has_gold_seal, p.bio, u."imageUrl", p.services_offered, p.has_store, 
        p.store_address, p.latitude, p.longitude, p.action_radius, p.is_online, 
        p.current_latitude, p.current_longitude, p.is_minor, u.phone_number, u.email, u.birth_date,
        u.account_status, p.hashtags
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE p.id = $1
    `, [id]);

    if (professional) {
      // Intentar descodificar opcionalmente el token para saber si el solicitante es un cliente
      let requester = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          requester = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        } catch (e) {
          // Ignorar token no válido
        }
      }

      // Aplicar fuzzing si el solicitante es un cliente y el profesional está online
      if (requester?.user_type === 'client' && professional.account_status === 'active' && professional.is_online && professional.current_latitude !== null && professional.current_longitude !== null) {
        const fuzzed = fuzzCoordinates(professional.current_latitude, professional.current_longitude);
        return res.json({ ...professional, current_latitude: fuzzed.latitude, current_longitude: fuzzed.longitude });
      }
      res.json(professional);
    } else {
      res.status(404).json({ message: 'Profesional no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener profesional:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Endpoint para OBTENER las reseñas de un profesional
app.get('/api/professionals/:id/reviews', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: reviews } = await db.query(`
      SELECT r.*, u.name as clientName, u."imageUrl" as clientImageUrl 
      FROM reviews r 
      JOIN users u ON r.reviewer_id = u.id 
      WHERE r.reviewee_id = $1 
      ORDER BY r.created_at DESC
    `, [id]);
    res.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener reseñas.' });
  }
});




// Endpoint para PUBLICAR una reseña para un profesional
app.post('/api/professionals/:id/reviews', authMiddleware, async (req, res) => {
  const revieweeId = req.params.id;
  const reviewerId = req.user.id;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe ser un número entre 1 y 5.' });
  }

  if (Number(reviewerId) === Number(revieweeId)) {
    return res.status(400).json({ message: 'No puedes calificarte a ti mismo.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar la nueva reseña
    await client.query(
      'INSERT INTO reviews (reviewee_id, reviewer_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [revieweeId, reviewerId, rating, comment]
    );

    // 2. Comprobar si el calificado es un profesional (existe en la tabla de profesionales)
    const { rows: [isProf] } = await client.query('SELECT id FROM professionals WHERE id = $1', [revieweeId]);
    let isSuspended = false;
    if (isProf) {
      // Recalcular el rating promedio y el conteo de reseñas
      const { rows: [stats] } = await client.query('SELECT AVG(rating) as "avgRating", COUNT(*) as "reviewCount" FROM reviews WHERE reviewee_id = $1', [revieweeId]);
      const avg = parseFloat(stats.avgRating);
      
      // Actualizar la tabla de profesionales
      await client.query('UPDATE professionals SET rating = $1, reviews = $2 WHERE id = $3', [avg, stats.reviewCount, revieweeId]);

      // 3. Comprobar si baja de un promedio de 3 estrellas
      if (avg < 3.0) {
        // Obtener detalles del profesional para la alerta
        const { rows: [userToSuspend] } = await client.query('SELECT name, email, account_status FROM users WHERE id = $1', [revieweeId]);
        
        if (userToSuspend && userToSuspend.account_status !== 'suspended') {
          // Suspender de forma automática
          await client.query("UPDATE users SET account_status = 'suspended' WHERE id = $1", [revieweeId]);
          await client.query("UPDATE professionals SET is_verified = false WHERE id = $1", [revieweeId]);
          isSuspended = true;

          const alertDetails = `El profesional ${userToSuspend.name} (${userToSuspend.email}, ID: ${revieweeId}) ha sido suspendido automáticamente por registrar una calificación promedio de ${avg.toFixed(2)} estrellas (mínimo requerido: 3.0 estrellas).`;
          await client.query(
            "INSERT INTO admin_alerts (alert_type, user_id, details) VALUES ('low_rating', $1, $2)",
            [revieweeId, alertDetails]
          );
          await notifyAdmins('security_filter', { user_id: revieweeId, details: alertDetails });
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: isSuspended 
        ? 'Reseña publicada con éxito. El profesional ha sido suspendido automáticamente por tener un promedio menor a 3 estrellas.' 
        : 'Reseña publicada con éxito.' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al publicar reseña:', error);
    res.status(500).json({ message: 'Error en el servidor al publicar la reseña.' });
  } finally {
    client.release();
  }
});

// Endpoint para búsqueda general
app.get('/api/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'El parámetro de búsqueda "q" es requerido' });
  }

  const searchTerm = `%${q}%`;

  try {
    const { rows: professionals } = await db.query(`
        SELECT p.*, u.phone_number FROM professionals p
        JOIN users u ON p.id = u.id
        WHERE p.name ILIKE $1 
           OR p.specialty ILIKE $1 
           OR p.bio ILIKE $1 
           OR p.services_offered ILIKE $1 
           OR p.hashtags ILIKE $1
        ORDER BY p.has_gold_seal DESC, p.rating DESC
      `,
      [searchTerm]
    );

    const { rows: services } = await db.query(
      'SELECT id, name, category, is_high_risk, is_main, icon_name as icon FROM services WHERE name ILIKE $1 OR category ILIKE $1',
      [searchTerm]
    );

    // Obtener recomendaciones según la categoría de las profesiones/servicios encontrados
    const categories = new Set();
    services.forEach(s => { if (s.category) categories.add(s.category); });
    professionals.forEach(p => { if (p.specialty) categories.add(p.specialty); });

    let recommendations = [];
    if (categories.size > 0) {
      const categoriesArray = Array.from(categories);
      const { rows: recServices } = await db.query(
        'SELECT id, name, category, is_high_risk, is_main, icon_name as icon FROM services WHERE category = ANY($1)',
        [categoriesArray]
      );
      // Filtrar servicios que ya están en los resultados principales
      const searchServiceIds = new Set(services.map(s => s.id));
      recommendations = recServices.filter(s => !searchServiceIds.has(s.id));
    }

    res.json({ professionals, services, recommendations });
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ message: 'Error al realizar la búsqueda en la base de datos' });
  }
});

// Endpoint para obtener los servicios
app.get('/api/services', async (req, res) => {
  const { main } = req.query;
  let queryText = 'SELECT id, name, category, is_high_risk, is_main, icon_name as icon FROM services';
  if (main === 'true') {
    queryText += ' WHERE is_main = true';
  } else {
    queryText += ' ORDER BY category, name';
  }
  const { rows } = await db.query(queryText);
  res.json(rows);
});

// Endpoint para solicitar mediación explícitamente
app.post('/api/jobs/:id/request-mediation', authMiddleware, async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.id;
  const userName = req.user.name;

  try {
    // Busca el trabajo y verifica que el usuario sea parte de él (cliente o profesional)
    const { rows: [job] } = await db.query('SELECT * FROM jobs WHERE id = $1 AND (client_id = $2 OR professional_id = $2)', [jobId, userId]);
    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado o no tienes permiso para esta acción.' });
    }

    // Cambia el estado a 'dispute' y notifica a los administradores
    await db.query("UPDATE jobs SET status = 'dispute', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [jobId]);
    await notifyAdmins('dispute', {
      jobId: jobId, // Corregido: jobId en lugar de job_id
      reporterName: userName
    });

    res.json({ status: 'dispute', message: 'Solicitud de mediación enviada. Un administrador se pondrá en contacto a la brevedad.' });
  } catch (error) {
    console.error(`Error al solicitar mediación para el trabajo ${jobId}:`, error);
    res.status(500).json({ message: 'Error en el servidor al procesar la solicitud.' });
  }
});

// Endpoint para que el profesional marque el trabajo como finalizado (Check-out Fase 1)
// Permite subir fotos opcionales del "Antes" y "Después"
app.post('/api/jobs/:id/worker-complete', authMiddleware, upload.fields([
  { name: 'photoBefore', maxCount: 1 },
  { name: 'photoAfter', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Verificar que el trabajo existe y que el usuario es el profesional del trabajo
    const { rows: [job] } = await db.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    if (job.professional_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para marcar este trabajo como finalizado.' });
    }

    // 2. Procesar las fotos de antes y después si existen
    let photoBeforeUrl = job.photo_before;
    let photoAfterUrl = job.photo_after;

    if (req.files) {
      if (req.files.photoBefore) {
        const file = req.files.photoBefore[0];
        if (!isValidImage(file)) {
          return res.status(400).json({ message: 'El archivo de la foto del antes no es una imagen válida.' });
        }
        const filename = `before-${Date.now()}${path.extname(file.originalname)}`;
        await fs.promises.writeFile(path.join(uploadsDir, filename), file.buffer);
        photoBeforeUrl = `uploads/${filename}`;
      }
      if (req.files.photoAfter) {
        const file = req.files.photoAfter[0];
        if (!isValidImage(file)) {
          return res.status(400).json({ message: 'El archivo de la foto del después no es una imagen válida.' });
        }
        const filename = `after-${Date.now()}${path.extname(file.originalname)}`;
        await fs.promises.writeFile(path.join(uploadsDir, filename), file.buffer);
        photoAfterUrl = `uploads/${filename}`;
      }
    }

    // 3. Actualizar el estado del trabajo a 'waiting_confirmation'
    await db.query(
      "UPDATE jobs SET status = 'waiting_confirmation', photo_before = $1, photo_after = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [photoBeforeUrl, photoAfterUrl, id]
    );

    res.json({
      status: 'waiting_confirmation',
      message: 'Trabajo marcado como finalizado por el profesional. Esperando confirmación del cliente.',
      photo_before: photoBeforeUrl,
      photo_after: photoAfterUrl
    });
  } catch (error) {
    console.error('Error al marcar trabajo como finalizado por profesional:', error);
    res.status(500).json({ message: 'Error en el servidor al procesar la finalización del trabajo.' });
  }
});

// Endpoint para que el cliente confirme la finalización y deje su reseña (Check-out Fase 2 - Camino A)
app.post('/api/jobs/:id/client-confirm', authMiddleware, upload.single('reviewPhoto'), async (req, res) => {
  const { id } = req.params;
  const { rating, comment, tags } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La calificación es obligatoria y debe estar entre 1 y 5.' });
  }

  const client = await db.connect();
  try {
    // 1. Verificar que el trabajo existe y que el usuario es el cliente del trabajo
    const { rows: [job] } = await client.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    if (job.client_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para confirmar este trabajo.' });
    }

    await client.query('BEGIN');

    // 2. Procesar la foto de la reseña si se sube
    let reviewPhotoUrl = null;
    if (req.file) {
      const file = req.file;
      if (!isValidImage(file)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'El archivo de la reseña no es una imagen válida.' });
      }
      const filename = `review-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), file.buffer);
      reviewPhotoUrl = `uploads/${filename}`;
    }

    // 3. Actualizar el estado del trabajo a 'completed'
    await client.query(
      "UPDATE jobs SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    // 4. Crear la reseña del cliente al profesional
    let parsedTags = null;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // Si no es JSON válido, guardarlo como un arreglo simple dividiendo por comas si es cadena
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [tags];
      }
    }

    await client.query(
      `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment, review_photo, tags, brought_peace)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        job.client_id,
        job.professional_id,
        parseInt(rating),
        comment || '',
        reviewPhotoUrl,
        parsedTags ? JSON.stringify(parsedTags) : null,
        true // brought_peace = true para el flujo de confirmación exitosa
      ]
    );

    // 5. Recalcular valoración promedio del profesional
    const { rows: [stats] } = await client.query(
      'SELECT AVG(rating) as "avgRating", COUNT(*) as "reviewCount" FROM reviews WHERE reviewee_id = $1',
      [job.professional_id]
    );
    const avg = parseFloat(stats.avgRating);

    await client.query(
      'UPDATE professionals SET rating = $1, reviews = $2 WHERE id = $3',
      [avg, stats.reviewCount, job.professional_id]
    );

    // 6. Si la calificación promedio cae por debajo de 3 estrellas, suspender al profesional
    let professionalSuspended = false;
    if (avg < 3.0 && stats.reviewCount >= 5) {
      const { rows: [userToSuspend] } = await client.query('SELECT name, email FROM users WHERE id = $1', [job.professional_id]);
      await client.query("UPDATE users SET account_status = 'suspended' WHERE id = $1", [job.professional_id]);
      professionalSuspended = true;

      const alertDetails = `El profesional ${userToSuspend.name} (${userToSuspend.email}) ha sido suspendido automáticamente tras una nueva reseña que bajó su promedio general a ${avg.toFixed(2)} estrellas.`;
      await client.query(
        "INSERT INTO admin_alerts (alert_type, user_id, details) VALUES ('low_rating', $1, $2)",
        [job.professional_id, alertDetails]
      );
      await notifyAdmins('security_filter', { user_id: job.professional_id, details: alertDetails });
    }

    await client.query('COMMIT');

    res.json({
      status: 'completed',
      message: '¡Misión cumplida! Gracias por confiar en SENN FIX. Tu espacio está en orden y nosotros estamos en paz.',
      brand_message: 'Trabajo terminado, problema solucionado. Estás en paz con SENN FIX.',
      professional_suspended: professionalSuspended
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al confirmar y completar trabajo:', error);
    res.status(500).json({ message: 'Error en el servidor al completar el trabajo.' });
  } finally {
    client.release();
  }
});

// Endpoint para completar un trabajo (para clientes - Check-out Fase 2 - Compatibilidad)
app.post('/api/jobs/:id/complete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { broughtPeace } = req.body;
  const userId = req.user.id;

  try {
    // 1. Verificar que el trabajo existe y que el usuario es el cliente del trabajo
    const { rows: [job] } = await db.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );

    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    if (job.client_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para completar este trabajo.' });
    }

    // 2. Determinar el nuevo estado
    // Si broughtPeace === 'yes', pasa a 'completed'. Si es 'no', pasa a 'dispute' (Mediación)
    const newStatus = broughtPeace === 'yes' ? 'completed' : 'dispute';

    // 3. Actualizar el trabajo en la base de datos
    await db.query(
      'UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, id]
    );

    let message = '';
    if (newStatus === 'completed') {
      message = 'El trabajo ha sido marcado como completado con éxito. Gracias por usar SENN.';
    } else {
      message = 'Lamentamos que el servicio no haya traído satisfacción. Se ha abierto un proceso de mediación para que nuestro equipo te ayude.';
      // Notificar a los administradores de la mediación / disputa
      await notifyAdmins('dispute', {
        jobId: id,
        reporterName: req.user.name,
        reason: 'El cliente rechazó el cierre del trabajo y marcó: No satisfecho'
      });
    }

    res.json({ status: newStatus, message });
  } catch (error) {
    console.error('Error al completar el trabajo:', error);
    res.status(500).json({ message: 'Error en el servidor al completar el trabajo.' });
  }
});

// Endpoint para registro continuo de ubicación GPS del profesional durante el trabajo (Evidencia Operativa)
app.post('/api/jobs/:id/work-order-gps', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  const professionalId = req.user.id;

  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) {
    return res.status(400).json({ message: 'ID de trabajo inválido.' });
  }

  if (latitude === undefined || longitude === undefined || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
    return res.status(400).json({ message: 'Coordenadas GPS válidas (latitude y longitude) son obligatorias.' });
  }

  try {
    // Consulta directa y ligera sin JOINs innecesarios para validar estado y propiedad
    const { rows: [job] } = await db.query(
      'SELECT professional_id, status FROM jobs WHERE id = $1',
      [jobId]
    );

    if (!job) {
      return res.status(404).json({ message: 'Orden de trabajo no encontrada.' });
    }

    // Seguridad: Validar que el emisor sea el profesional asignado
    if (job.professional_id !== professionalId) {
      return res.status(403).json({ message: 'Acceso denegado. No eres el profesional asignado a este trabajo.' });
    }

    // Regla de negocio: El tracking solo es válido para trabajos en estado 'in_progress'
    if (job.status !== 'in_progress') {
      return res.status(403).json({ message: 'Acceso denegado. El rastreo GPS solo está activo para trabajos en progreso.' });
    }

    // Inserción directa y ligera
    await db.query(
      'INSERT INTO work_order_gps (job_id, latitude, longitude) VALUES ($1, $2, $3)',
      [jobId, parseFloat(latitude), parseFloat(longitude)]
    );

    // Respuesta rápida de baja latencia
    res.json({ success: true });
  } catch (error) {
    console.error(`Error al registrar ubicación GPS para trabajo ${jobId}:`, error);
    res.status(500).json({ message: 'Error interno en el servidor al registrar ubicación GPS.' });
  }
});

// Endpoint para crear un nuevo trabajo (para clientes)
app.post('/api/jobs', authMiddleware, async (req, res) => {
  if (req.user.user_type !== 'client') {
    return res.status(403).json({ message: 'Solo los clientes pueden publicar trabajos.' });
  }
  const { service_id, description, address_exact, latitude, longitude, approximate_zone } = req.body;
  const clientId = req.user.id;

  if (!service_id || !description || !approximate_zone) {
    return res.status(400).json({ message: 'ID del servicio, descripción y zona aproximada son requeridos.' });
  }

  try {
    const { rows: [newJob] } = await db.query(
      `INSERT INTO jobs (client_id, service_id, description, address_exact, latitude, longitude, approximate_zone, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'requested') RETURNING *`,
      [clientId, service_id, description, address_exact, latitude, longitude, approximate_zone]
    );
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error al crear el trabajo:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ message: 'El ID del servicio proporcionado no es válido.' });
    }
    res.status(500).json({ message: 'Error en el servidor al crear el trabajo.' });
  }
});

// Endpoint para obtener detalles de un trabajo con Privacidad Selectiva
app.get('/api/jobs/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const query = `
            SELECT 
                j.*, 
                u.phone_number as client_phone_number 
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            WHERE j.id = $1
        `;
    const { rows: [job] } = await db.query(query, [id]);

    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado.' });
    }

    // Autorización: solo el cliente, el profesional asignado o un admin pueden ver detalles.
    // Si el trabajo está en 'requested', cualquier profesional puede verlo (con restricciones).
    if (user.user_type !== 'admin' && job.client_id !== user.id && job.professional_id !== user.id) {
      if (!(user.user_type === 'professional' && job.status === 'requested')) {
        return res.status(403).json({ message: 'No tienes permiso para ver este trabajo.' });
      }
    }

    // Lógica de Privacidad Selectiva (Art. 21 CPE)
    // Si el usuario es un profesional Y el trabajo está solo 'solicitado', ocultamos datos sensibles.
    if (user.user_type === 'professional' && job.status === 'requested') {
      const { address_exact, latitude, longitude, client_phone_number, ...filteredJob } = job;
      return res.json(filteredJob);
    }

    // Si el usuario es el cliente, o un profesional en un trabajo ya aceptado, se devuelve el trabajo completo.
    res.json(job);
  } catch (error) {
    console.error(`Error al obtener el trabajo ${id}:`, error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// --- Admin Dashboard Endpoints (Solo para Administradores) ---

// Endpoint para obtener profesionales pendientes de aprobación (con todos sus campos privados)
app.get('/api/admin/pending-professionals', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id, u.name, u.email, u.user_type, p.specialty, p.identity_card_num, p.is_minor, 
        p.tutor_name, p.tutor_phone, p.defensoria_permit_url, p.felcc_rejap_url, 
        p.ci_front_url, p.ci_back_url, u."imageUrl", u.phone_number, u.birth_date, u.account_status,
        p.bio, p.services_offered, p.has_store, p.store_address, p.latitude, p.longitude, p.action_radius
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE u.account_status = 'pending'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener profesionales pendientes:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener profesionales pendientes.' });
  }
});

// Endpoint para verificar y aprobar a un profesional
app.put('/api/admin/verify-professional/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Activar la cuenta del usuario
    await client.query(
      "UPDATE users SET account_status = 'active' WHERE id = $1",
      [id]
    );

    // 2. Establecer is_verified = true en la tabla professionals
    await client.query(
      "UPDATE professionals SET is_verified = true WHERE id = $1",
      [id]
    );

    await client.query('COMMIT');
    // Notificar a clientes cercanos de que este profesional ya está disponible
    notifyClientsOfNearbyProfessional(id);
    res.json({ message: 'Profesional verificado y aprobado con éxito.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al verificar profesional ${id}:`, error);
    res.status(500).json({ message: 'Error interno en el servidor al verificar profesional.' });
  } finally {
    client.release();
  }
});

// Endpoint para obtener clientes pendientes de aprobación (menores de edad)
app.get('/api/admin/pending-clients', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, email, phone_number, birth_date, identity_card, "imageUrl", account_status, user_type
      FROM users
      WHERE user_type = 'client' AND account_status = 'pending'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes pendientes:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener clientes pendientes.' });
  }
});

// Endpoint para verificar y aprobar a un cliente
app.put('/api/admin/verify-client/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE users SET account_status = 'active' WHERE id = $1", [id]);
    res.json({ message: 'Cliente verificado y aprobado con éxito.' });
  } catch (error) {
    console.error(`Error al verificar cliente ${id}:`, error);
    res.status(500).json({ message: 'Error interno en el servidor al verificar cliente.' });
  }
});

// Endpoint para obtener todos los trabajos registrados en la plataforma
app.get('/api/admin/jobs', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        j.id, 
        j.description, 
        j.status, 
        j.created_at,
        j.updated_at,
        uc.name as client_name,
        uc.email as client_email,
        up.name as professional_name,
        up.email as professional_email
      FROM jobs j
      LEFT JOIN users uc ON j.client_id = uc.id
      LEFT JOIN users up ON j.professional_id = up.id
      ORDER BY j.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener trabajos para admin:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener trabajos.' });
  }
});

// Endpoint para obtener profesionales ya verificados y aprobados
app.get('/api/admin/verified-professionals', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.id, u.name, u.email, u.user_type, p.specialty, u."imageUrl", u.phone_number, u.birth_date, u.account_status, p.identity_card_num
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE u.account_status = 'active'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener profesionales verificados:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener profesionales.' });
  }
});

// Endpoint para obtener usuarios suspendidos (clientes o profesionales)
app.get('/api/admin/suspended-users', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, email, phone_number, birth_date, user_type, "imageUrl", account_status
      FROM users
      WHERE account_status = 'suspended'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios suspendidos:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Endpoint para obtener todos los clientes activos (para administración/suspensión)
app.get('/api/admin/active-clients', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, email, phone_number, birth_date, user_type, "imageUrl", account_status
      FROM users
      WHERE user_type = 'client' AND account_status = 'active'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes activos:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener clientes activos.' });
  }
});

// Endpoint para obtener todos los profesionales (para búsqueda y chat del admin)
app.get('/api/admin/professionals', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.id, u.name, u.email, p.specialty, u."imageUrl", u.phone_number
      FROM professionals p
      JOIN users u ON p.id = u.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener profesionales para admin:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Endpoint para suspender / rechazar la cuenta de cualquier usuario
app.put('/api/admin/suspend-user/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // 1. Marcar usuario como suspendido
    await client.query(
      "UPDATE users SET account_status = 'suspended' WHERE id = $1",
      [id]
    );
    // 2. Si es profesional, desmarcar is_verified
    await client.query(
      "UPDATE professionals SET is_verified = false WHERE id = $1",
      [id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Cuenta suspendida / rechazada con éxito.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al suspender usuario ${id}:`, error);
    res.status(500).json({ message: 'Error en el servidor al suspender la cuenta.' });
  } finally {
    client.release();
  }
});

// Endpoint para registrar/enviar un reclamo de soporte
app.post('/api/complaints', authMiddleware, async (req, res) => {
  const { reported_id, job_id, reason, details } = req.body;
  const reporter_id = req.user.id;

  if (!reported_id || !reason || !details) {
    return res.status(400).json({ message: 'El ID de la persona reportada, la razón y los detalles son obligatorios.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar la denuncia
    await client.query(
      'INSERT INTO complaints (reporter_id, reported_id, job_id, reason, details) VALUES ($1, $2, $3, $4, $5)',
      [reporter_id, reported_id, job_id || null, reason, details]
    );

    // 2. Contar denuncias acumuladas contra el usuario
    const { rows: [complaintCount] } = await client.query(
      'SELECT COUNT(*) FROM complaints WHERE reported_id = $1',
      [reported_id]
    );
    const count = parseInt(complaintCount.count);

    let isSuspended = false;
    if (count >= 3) {
      // Obtener detalles del usuario para la alerta
      const { rows: [userToSuspend] } = await client.query('SELECT name, email, account_status FROM users WHERE id = $1', [reported_id]);
      
      if (userToSuspend && userToSuspend.account_status !== 'suspended') {
        // Suspender de forma automática
        await client.query("UPDATE users SET account_status = 'suspended' WHERE id = $1", [reported_id]);
        await client.query("UPDATE professionals SET is_verified = false WHERE id = $1", [reported_id]);
        isSuspended = true;

        const alertDetails = `El usuario ${userToSuspend.name} (${userToSuspend.email}, ID: ${reported_id}) ha sido suspendido automáticamente al acumular ${count} denuncias.`;
        await client.query(
          "INSERT INTO admin_alerts (alert_type, user_id, details) VALUES ('three_complaints', $1, $2)",
          [reported_id, alertDetails]
        );
        await notifyAdmins('security_filter', { user_id: reported_id, details: alertDetails });
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: isSuspended 
        ? 'Reclamo enviado con éxito. El usuario reportado ha sido suspendido automáticamente por acumular 3 o más denuncias.' 
        : 'Reclamo enviado con éxito.' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al enviar reclamo:', error);
    res.status(500).json({ message: 'Error en el servidor al enviar el reclamo.' });
  } finally {
    client.release();
  }
});

// Endpoint para que el admin obtenga todos los reclamos
app.get('/api/admin/complaints', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        c.id, 
        c.reason, 
        c.details, 
        c.status, 
        c.created_at,
        c.reporter_id,
        c.reported_id,
        j.description as job_title,
        ur.name as reporter_name,
        ur.email as reporter_email,
        ur.user_type as reporter_type,
        ud.name as reported_name,
        ud.email as reported_email,
        ud.user_type as reported_type
      FROM complaints c
      JOIN users ur ON c.reporter_id = ur.id
      JOIN users ud ON c.reported_id = ud.id
      LEFT JOIN jobs j ON c.job_id = j.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reclamos:', error);
    res.status(500).json({ message: 'Error al obtener reclamos.' });
  }
});

// Endpoint para marcar un reclamo como resuelto
app.put('/api/admin/complaints/:id/resolve', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE complaints SET status = 'resolved' WHERE id = $1", [id]);
    res.json({ message: 'Reclamo resuelto con éxito.' });
  } catch (error) {
    console.error('Error al resolver reclamo:', error);
    res.status(500).json({ message: 'Error al resolver el reclamo.' });
  }
});

// Endpoint para que el admin obtenga las alertas de seguridad
app.get('/api/admin/security-alerts', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        a.id, 
        a.alert_type, 
        a.details, 
        a.status, 
        a.created_at,
        a.user_id,
        u.name as user_name,
        u.email as user_email,
        u.user_type
      FROM admin_alerts a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener alertas de seguridad:', error);
    res.status(500).json({ message: 'Error al obtener alertas de seguridad.' });
  }
});

// Endpoint para marcar una alerta de seguridad como resuelta
app.put('/api/admin/security-alerts/:id/resolve', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE admin_alerts SET status = 'resolved' WHERE id = $1", [id]);
    res.json({ message: 'Alerta de seguridad marcada como resuelta.' });
  } catch (error) {
    console.error('Error al resolver alerta de seguridad:', error);
    res.status(500).json({ message: 'Error al resolver la alerta.' });
  }
});

// Endpoint para estadísticas generales y de geolocalización de admin
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    // Profesionales por especialidad
    const { rows: specialtyStats } = await db.query(`
      SELECT specialty, COUNT(*) as count 
      FROM professionals 
      GROUP BY specialty
    `);

    // Total de usuarios
    const { rows: [userCounts] } = await db.query(`
      SELECT 
        COUNT(CASE WHEN user_type = 'client' THEN 1 END) as clients,
        COUNT(CASE WHEN user_type = 'professional' THEN 1 END) as professionals
      FROM users
    `);

    // Estadísticas de zonas de búsqueda reales de los trabajos
    const { rows: dbJobZones } = await db.query(`
      SELECT approximate_zone as zone, COUNT(*) as count 
      FROM jobs 
      WHERE approximate_zone IS NOT NULL AND approximate_zone != ''
      GROUP BY approximate_zone 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Calcular porcentaje total
    const totalJobsCount = dbJobZones.reduce((acc, curr) => acc + parseInt(curr.count), 0);

    const zoneSearchStats = dbJobZones.map(r => ({
      zone: r.zone,
      count: parseInt(r.count),
      percentage: totalJobsCount > 0 ? Math.round((parseInt(r.count) / totalJobsCount) * 100) : 0
    }));

    // Obtener las zonas reales de los profesionales basados en su store_address
    const { rows: proAddresses } = await db.query(`
      SELECT store_address FROM professionals 
      WHERE store_address IS NOT NULL AND store_address != ''
    `);
    
    const zoneCounts = {};
    proAddresses.forEach(row => {
      const zone = row.store_address.split(',')[0].trim();
      if (zone) {
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      }
    });

    const clientZoneStats = Object.entries(zoneCounts)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const { rows: professionalLocations } = await db.query(`
      SELECT p.id, u.name, p.specialty, p.latitude, p.longitude, p.current_latitude, p.current_longitude, p.is_online, p.has_store
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE u.account_status = 'active'
    `);

    res.json({
      specialtyStats,
      userCounts: {
        clients: parseInt(userCounts.clients) || 0,
        professionals: parseInt(userCounts.professionals) || 0
      },
      zoneSearchStats,
      clientZoneStats,
      professionalLocations
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas.' });
  }
});

// Endpoint para actualizar el perfil del administrador (exclusivo)
app.put('/api/admin/profile', adminMiddleware, upload.single('adminAvatar'), async (req, res) => {
  const { name, email, phone_number, password } = req.body;
  const adminId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y correo electrónico son requeridos.' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      if (!isValidImage(req.file)) {
        return res.status(400).json({ message: 'El archivo del avatar no es una imagen válida.' });
      }
      const filename = `admin-${adminId}-${Date.now()}${path.extname(req.file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), req.file.buffer);
      imageUrl = `uploads/${filename}`;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      if (imageUrl) {
        await db.query(
          `UPDATE users SET name = $1, email = $2, phone_number = $3, password_hash = $4, "imageUrl" = $5 WHERE id = $6`,
          [name, email, phone_number || '00000000', passwordHash, imageUrl, adminId]
        );
      } else {
        await db.query(
          `UPDATE users SET name = $1, email = $2, phone_number = $3, password_hash = $4 WHERE id = $5`,
          [name, email, phone_number || '00000000', passwordHash, adminId]
        );
      }
    } else {
      if (imageUrl) {
        await db.query(
          `UPDATE users SET name = $1, email = $2, phone_number = $3, "imageUrl" = $4 WHERE id = $5`,
          [name, email, phone_number || '00000000', imageUrl, adminId]
        );
      } else {
        await db.query(
          `UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4`,
          [name, email, phone_number || '00000000', adminId]
        );
      }
    }

    // Obtener los datos actualizados
    const { rows: [updated] } = await db.query('SELECT id, name, email, user_type, "imageUrl" FROM users WHERE id = $1', [adminId]);

    // Generar un nuevo JWT Token
    const newToken = jwt.sign(
      { id: updated.id, name: updated.name, email: updated.email, user_type: updated.user_type, imageUrl: updated.imageUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Perfil de administrador actualizado con éxito.', token: newToken, user: updated });
  } catch (error) {
    console.error('Error al actualizar perfil de administrador:', error);
    res.status(500).json({ message: 'Error interno en el servidor al actualizar perfil.' });
  }
});

// Endpoint para actualizar el perfil de un usuario cliente regular (CPE)
app.put('/api/users/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone_number } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y correo electrónico son requeridos.' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      if (!isValidImage(req.file)) {
        return res.status(400).json({ message: 'El archivo del avatar no es una imagen válida.' });
      }
      const filename = `avatar-${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), req.file.buffer);
      imageUrl = `uploads/${filename}`;
    }

    if (imageUrl) {
      await db.query(
        `UPDATE users SET name = $1, email = $2, phone_number = $3, "imageUrl" = $4 WHERE id = $5`,
        [name, email, phone_number || '', imageUrl, userId]
      );
      // Si el usuario es un profesional, también actualizamos su nombre e imagen en la tabla professionals por consistencia
      await db.query(
        `UPDATE professionals SET name = $1, "imageUrl" = $2 WHERE id = $3`,
        [name, imageUrl, userId]
      ).catch(() => {});
    } else {
      await db.query(
        `UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4`,
        [name, email, phone_number || '', userId]
      );
      await db.query(
        `UPDATE professionals SET name = $1 WHERE id = $2`,
        [name, userId]
      ).catch(() => {});
    }

    // Obtener los datos actualizados del usuario
    const { rows: [updated] } = await db.query('SELECT id, name, email, user_type, "imageUrl" FROM users WHERE id = $1', [userId]);

    // Generar un nuevo JWT Token
    const newToken = jwt.sign(
      { id: updated.id, name: updated.name, email: updated.email, user_type: updated.user_type, imageUrl: updated.imageUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Perfil actualizado con éxito.', token: newToken, user: updated });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({ message: 'Error interno en el servidor al actualizar perfil.' });
  }
});

// Endpoint para que un usuario elimine su propia cuenta (Derecho ARCO de revocación de datos - Art. 21 CPE)
app.delete('/api/users/delete-account', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    // Eliminamos el usuario. Al estar configuradas las claves foráneas con ON DELETE CASCADE,
    // esto eliminará automáticamente las entradas en professionals, wallets, etc.
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Tu cuenta y todos tus datos personales asociados han sido eliminados de forma definitiva de SENN FIX.' });
  } catch (error) {
    console.error(`Error al eliminar la cuenta del usuario ${userId}:`, error);
    res.status(500).json({ message: 'Error interno en el servidor al procesar la eliminación de la cuenta.' });
  }
});

// --- Endpoints de Portafolio Profesional (Trabajos Realizados) ---

// 1. Subir una foto al portafolio (Profesionales solamente)
app.post('/api/professionals/portfolio', authMiddleware, upload.single('portfolioPhoto'), async (req, res) => {
  const professionalId = req.user.id;

  if (req.user.user_type !== 'professional') {
    return res.status(403).json({ message: 'Solo los profesionales pueden subir imágenes a su portafolio.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Se requiere subir un archivo de imagen.' });
  }

  if (!isValidImage(req.file)) {
    return res.status(400).json({ message: 'El archivo subido no es una imagen válida.' });
  }

  try {
    // Validar límite máximo de 6 fotos
    const { rows: [{ count }] } = await db.query(
      'SELECT COUNT(*) FROM portfolio_photos WHERE professional_id = $1',
      [professionalId]
    );

    if (parseInt(count) >= 6) {
      return res.status(400).json({ message: 'Has alcanzado el límite máximo de 6 fotos para tu portafolio.' });
    }

    // Guardar el archivo en la carpeta 'uploads' (como se configuró multer.memoryStorage)
    const filename = `portfolio-${Date.now()}${path.extname(req.file.originalname)}`;
    await fs.promises.writeFile(path.join(uploadsDir, filename), req.file.buffer);
    const imageUrl = `uploads/${filename}`;

    const { rows: [newPhoto] } = await db.query(
      "INSERT INTO portfolio_photos (professional_id, image_url, status) VALUES ($1, $2, 'pending') RETURNING *",
      [professionalId, imageUrl]
    );

    res.status(201).json({
      message: 'Foto de portafolio subida con éxito. Está en espera de aprobación por el administrador.',
      photo: newPhoto
    });
  } catch (error) {
    console.error('Error al guardar foto en portafolio:', error);
    res.status(500).json({ message: 'Error interno en el servidor al guardar la foto.' });
  }
});

// 2. Obtener fotos aprobadas de un profesional específico (Público)
app.get('/api/professionals/:id/portfolio', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT id, image_url, status, created_at FROM portfolio_photos WHERE professional_id = $1 AND status = 'approved' ORDER BY created_at DESC",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener portafolio del profesional:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener portafolio.' });
  }
});

// 3. Obtener todas las fotos del portafolio del profesional logueado (Privado)
app.get('/api/professionals/my-portfolio', authMiddleware, async (req, res) => {
  const professionalId = req.user.id;
  try {
    const { rows } = await db.query(
      "SELECT id, image_url, status, created_at FROM portfolio_photos WHERE professional_id = $1 ORDER BY created_at DESC",
      [professionalId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener portafolio propio:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener tu portafolio.' });
  }
});

// 4. Eliminar una foto de portafolio propio
app.delete('/api/professionals/portfolio/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const professionalId = req.user.id;
  try {
    const { rows: [photo] } = await db.query(
      "SELECT * FROM portfolio_photos WHERE id = $1",
      [id]
    );

    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada.' });
    }

    if (photo.professional_id !== professionalId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta foto.' });
    }

    await db.query("DELETE FROM portfolio_photos WHERE id = $1", [id]);
    res.json({ message: 'Foto eliminada de tu portafolio con éxito.' });
  } catch (error) {
    console.error('Error al eliminar foto de portafolio:', error);
    res.status(500).json({ message: 'Error interno al eliminar la foto.' });
  }
});

// 5. Listar fotos de portafolio pendientes (Exclusivo Admin)
app.get('/api/admin/pending-portfolio', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.id, p.image_url, p.status, p.created_at, u.name as professional_name, u.email as professional_email
      FROM portfolio_photos p
      JOIN users u ON p.professional_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener portafolios pendientes:', error);
    res.status(500).json({ message: 'Error al obtener portafolios pendientes.' });
  }
});

// 6. Aprobar o rechazar fotos de portafolio (Exclusivo Admin)
app.put('/api/admin/portfolio/:id/verify', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ message: 'El estado debe ser approved o rejected.' });
  }

  try {
    const { rows: [photo] } = await db.query(
      "SELECT professional_id FROM portfolio_photos WHERE id = $1",
      [id]
    );
    if (!photo) {
      return res.status(404).json({ message: 'Foto de portafolio no encontrada.' });
    }

    await db.query(
      "UPDATE portfolio_photos SET status = $1 WHERE id = $2",
      [status, id]
    );

    const statusText = status === 'approved' ? 'aprobada' : 'rechazada';
    await db.query(
      "INSERT INTO notifications (user_id, title, content, type, related_id) VALUES ($1, $2, $3, $4, $5)",
      [
        photo.professional_id,
        'Galería de fotos actualizada',
        `Tu foto de portafolio ha sido ${statusText} por el administrador.`,
        'photo_verified',
        id
      ]
    );

    res.json({ message: `Foto de portafolio marcada como ${status === 'approved' ? 'aprobada' : 'rechazada'}.` });
  } catch (error) {
    console.error('Error al verificar foto de portafolio:', error);
    res.status(500).json({ message: 'Error al cambiar estado de verificación de foto.' });
  }
});

// 7. Listar publicaciones de explorar pendientes (Exclusivo Admin)
app.get('/api/admin/pending-posts', adminMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT 
        pt.id,
        pt.professional_id,
        pt.image_url,
        pt.description,
        pt.likes_count,
        pt.created_at,
        pt.status,
        p.specialty,
        u.name AS professional_name,
        u.email AS professional_email
      FROM professional_posts pt
      JOIN professionals p ON pt.professional_id = p.id
      JOIN users u ON p.id = u.id
      WHERE pt.status = 'pending'
      ORDER BY pt.created_at DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener publicaciones pendientes:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones pendientes.' });
  }
});

// 8. Aprobar o rechazar publicaciones de explorar (Exclusivo Admin)
app.put('/api/admin/posts/:id/verify', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' o 'rejected'

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ message: 'El estado debe ser approved o rejected.' });
  }

  try {
    const { rows: [post] } = await db.query(
      "SELECT professional_id, image_url FROM professional_posts WHERE id = $1",
      [id]
    );
    if (!post) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }

    if (status === 'rejected') {
      const filePath = path.join(uploadsDir, path.basename(post.image_url));
      try {
        await fs.promises.unlink(filePath);
      } catch (fileErr) {
        console.warn('No se pudo borrar el archivo de imagen de publicación rechazada:', fileErr.message);
      }
      await db.query('DELETE FROM professional_posts WHERE id = $1', [id]);
    } else {
      await db.query(
        "UPDATE professional_posts SET status = 'approved' WHERE id = $1",
        [id]
      );
    }

    const statusText = status === 'approved' ? 'aprobada' : 'rechazada';
    await db.query(
      "INSERT INTO notifications (user_id, title, content, type, related_id) VALUES ($1, $2, $3, $4, $5)",
      [
        post.professional_id,
        'Publicación en Explorar moderada',
        `Tu publicación de promoción ha sido ${statusText} por el administrador.`,
        'post_verified',
        id
      ]
    );

    res.json({ message: `Publicación marcada como ${statusText}.` });
  } catch (error) {
    console.error('Error al verificar publicación de explorar:', error);
    res.status(500).json({ message: 'Error al cambiar estado de verificación de publicación.' });
  }
});

// --- Auth Endpoints ---

// Endpoint para registrar un nuevo usuario (Cliente)
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone_number, birth_date, identity_card, user_type = 'client' } = req.body;

  if (!name || !email || !password || !phone_number || !birth_date) {
    return res.status(400).json({ message: 'Nombre, email, contraseña, teléfono y fecha de nacimiento son requeridos.' });
  }

  try {
    // Verificar si el usuario ya existe
    const { rows: [existingUser] } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }
    // Verificar si el teléfono ya existe
    const { rows: [existingPhone] } = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (existingPhone) {
      return res.status(409).json({ message: 'El número de teléfono ya está en uso.' });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar una URL de avatar por defecto para el nuevo usuario
    const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    // Regla: Aprobación automática de clientes mayores de edad. Menores quedan pendientes.
    const age = calculateAge(birth_date);
    const account_status = age < 18 ? 'pending' : 'active';

    // Insertar el nuevo usuario
    const { rows: [newUser] } = await db.query(
      'INSERT INTO users (name, email, password_hash, user_type, "imageUrl", phone_number, birth_date, identity_card, account_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [name, email, passwordHash, user_type, imageUrl, phone_number, birth_date, identity_card || null, account_status]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito.', userId: newUser.id });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
});

// Endpoint para registrar un nuevo profesional (usuario + perfil)
app.post('/api/register-professional', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'defensoriaPermit', maxCount: 1 },
  { name: 'ci_front', maxCount: 1 },
  { name: 'ci_back', maxCount: 1 },
  { name: 'felcc_rejap', maxCount: 1 },
  { name: 'academic_certificate', maxCount: 1 }
]), async (req, res) => {
  const {
    name, email, password, specialty, bio, identity_card, phone_number, birth_date,
    services_offered, has_store, store_address, latitude, longitude,
    legal_accepted, tutor_name, tutor_phone, action_radius, hashtags
  } = req.body;

  // --- Validación de Contenido ---
  const contentToValidate = `${bio || ''} ${services_offered || ''} ${specialty || ''}`;
  const hasBlacklistedContent = containsBlacklistedWords(contentToValidate);

  // Regla: Asegurarse de que el usuario marque como aceptadas las políticas.
  if (legal_accepted !== 'true') {
    return res.status(400).json({ message: 'Debes aceptar las políticas de "No Relación Laboral" para registrarte.' });
  }

  if (!name || !email || !password || !specialty || !bio || !identity_card || !phone_number || !birth_date) {
    return res.status(400).json({ message: 'Por favor, completa todos los campos obligatorios.' });
  }

  // Nueva validación para imágenes de CI
  if (!req.files || !req.files.ci_front || !req.files.ci_back) {
    return res.status(400).json({ message: 'Se requieren las imágenes del anverso y reverso del carnet de identidad.' });
  }

  // Regla: Si es menor de 18, exigir campos de tutor y permiso.
  const age = calculateAge(birth_date);

  const client = await db.connect();
  try {
    // Lógica de Menores (Ley 548): Validar rango de edad y requisitos.
    if (age < 14) {
      return res.status(403).json({ message: 'Debes tener al menos 14 años para registrarte como profesional.' });
    }
    if (age >= 14 && age < 18) {
      if (!tutor_name || !tutor_phone || !req.files || !req.files.defensoriaPermit) {
        return res.status(400).json({ message: 'Para menores de edad, se requiere el nombre y teléfono del tutor, y adjuntar el permiso de la defensoría.' });
      }
      if (specialty) {
        const { rows: [service] } = await client.query('SELECT is_high_risk FROM services WHERE name = $1', [specialty]);
        if (service && service.is_high_risk) {
          return res.status(403).json({ message: `Registro bloqueado. Según la Ley 548, los menores de edad no pueden realizar trabajos de alto riesgo como "${specialty}".` });
        }
      }
    }

    // --- VALIDACIÓN DE ARCHIVOS SUBIDOS (Seguridad y Mimetypes) ---
    if (req.files) {
      if (req.files.profileImage) {
        if (!isValidImage(req.files.profileImage[0])) {
          return res.status(400).json({ message: 'El archivo de la foto de perfil no es una imagen válida.' });
        }
      }
      if (req.files.defensoriaPermit) {
        if (!isValidPrivateFile(req.files.defensoriaPermit[0])) {
          return res.status(400).json({ message: 'El archivo del permiso de la defensoría debe ser un documento PDF o una imagen válida.' });
        }
      }
      if (req.files.ci_front) {
        if (!isValidImage(req.files.ci_front[0])) {
          return res.status(400).json({ message: 'El archivo del anverso del carnet no es una imagen válida.' });
        }
      }
      if (req.files.ci_back) {
        if (!isValidImage(req.files.ci_back[0])) {
          return res.status(400).json({ message: 'El archivo del reverso del carnet no es una imagen válida.' });
        }
      }
      if (req.files.felcc_rejap) {
        if (!isValidPrivateFile(req.files.felcc_rejap[0])) {
          return res.status(400).json({ message: 'El archivo del certificado FELCC/REJAP debe ser un documento PDF o una imagen válida.' });
        }
      }
      if (req.files.academic_certificate) {
        if (!isValidPrivateFile(req.files.academic_certificate[0])) {
          return res.status(400).json({ message: 'El archivo del certificado académico debe ser un documento PDF o una imagen válida.' });
        }
      }
    }

    // Iniciar transacción
    await client.query('BEGIN');

    // Verificar duplicados
    const { rows: [existingUser] } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }
    const { rows: [existingPhone] } = await client.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (existingPhone) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'El número de teléfono ya está en uso.' });
    }

    // --- PROCESAMIENTO DE ARCHIVOS ---

    // 1. Procesar imagen de perfil (pública)
    let imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
    if (req.files.profileImage) {
      const file = req.files.profileImage[0];
      const filename = `profile-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), file.buffer);
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    // 2. Procesar permiso de la defensoría (público)
    let defensoriaPermitUrl = null;
    if (age < 18 && req.files.defensoriaPermit) {
      const file = req.files.defensoriaPermit[0];
      const filename = `permit-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(privateUploadsDir, filename), file.buffer);
      defensoriaPermitUrl = `private_uploads/${filename}`;
    }

    // 3. Procesar imágenes de CI con marca de agua (privado)
    const ciFrontUrl = await watermarkAndSave(req.files.ci_front[0].buffer, `ci-front-${identity_card}`);
    const ciBackUrl = await watermarkAndSave(req.files.ci_back[0].buffer, `ci-back-${identity_card}`);

    // 4. Procesar certificado FELCC/REJAP (privado, opcional)
    let felccRejapUrl = null;
    if (req.files.felcc_rejap) {
      const file = req.files.felcc_rejap[0];
      const filename = `felcc-rejap-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(privateUploadsDir, filename), file.buffer);
      felccRejapUrl = `private_uploads/${filename}`;
    }

    // 5. Procesar Título Académico / Certificado (privado, opcional)
    let academicCertificateUrl = null;
    if (req.files && req.files.academic_certificate) {
      const file = req.files.academic_certificate[0];
      const filename = `academic-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(privateUploadsDir, filename), file.buffer);
      academicCertificateUrl = `private_uploads/${filename}`;
    }

    // Crear registro en la tabla 'users'
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user_type = 'professional';
    const account_status = hasBlacklistedContent ? 'suspended' : 'pending'; // Regla: El estado de cuenta se determina por el contenido.
    const is_online = false; // Por defecto, un nuevo profesional no está online.

    const userInsertQuery = `
      INSERT INTO users (
          name, email, password_hash, user_type, phone_number, birth_date, legal_accepted, "imageUrl", account_status, identity_card
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, "imageUrl"
    `;
    const userInsertParams = [
      name, email, passwordHash, 'professional', phone_number, birth_date,
      true, // legal_accepted
      imageUrl,
      account_status,
      identity_card
    ];

    const { rows: [userResult] } = await client.query(
      userInsertQuery,
      userInsertParams
    );
    const newUserId = userResult.id;

    // Crear registro en la tabla 'professionals'
    // Se inicializan is_online, current_latitude, current_longitude, action_radius
    const normalizedHashtags = normalizeHashtags(hashtags);
    await client.query(
      `INSERT INTO professionals (id, name, specialty, bio, "imageUrl", services_offered, has_store, store_address, latitude, longitude, identity_card_num, ci_front_url, ci_back_url, is_minor, defensoria_permit_url, tutor_name, tutor_phone, felcc_rejap_url, academic_certificate_url, is_online, current_latitude, current_longitude, action_radius, hashtags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        newUserId,
        name,
        specialty,
        bio,
        userResult.imageUrl,
        services_offered || '',
        has_store === 'true' || has_store === true,
        store_address || '',
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        identity_card,
        ciFrontUrl, ciBackUrl,
        age < 18,
        defensoriaPermitUrl,
        tutor_name || null,
        tutor_phone || null,
        felccRejapUrl,
        academicCertificateUrl,
        is_online,
        null,
        null,
        parseInt(action_radius) || 10,
        normalizedHashtags
      ]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    let responseMessage = 'Perfil profesional creado con éxito. Su cuenta está pendiente de aprobación.';
    if (hasBlacklistedContent) {
      responseMessage = 'Perfil creado, pero ha sido suspendido para revisión por contenido no permitido.';
    }

    res.status(201).json({ message: responseMessage, userId: newUserId });

  } catch (error) {
    await client.query('ROLLBACK'); // Revertir en caso de error
    console.error('Error en el registro profesional:', error);
    if (error.code === '42703') { // 'undefined_column' en postgres, indica un posible desajuste del esquema
      return res.status(500).json({ message: `Error en el servidor. La columna '${error.column}' no existe. Verifica que la estructura de la base de datos (Neon) coincida con el código.` });
    }
    res.status(500).json({ message: 'Error interno al registrar el perfil profesional.' });
  } finally {
    client.release();
  }
});

// Endpoint para ACTUALIZAR un perfil profesional
app.put('/api/professionals/:id', authMiddleware, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'felcc_rejap', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verificación de autorización: solo el propio usuario puede editar su perfil
  if (parseInt(id) !== userId) {
    return res.status(403).json({ message: 'No tienes permiso para editar este perfil.' });
  }

  const { name, specialty, bio, phone_number, services_offered, has_store, store_address, latitude, longitude, felcc_rejap_url: existingFelccRejapUrl, action_radius, hashtags } = req.body;

  const client = await db.connect();
  // --- Validación de Contenido ---
  const contentToValidate = `${bio || ''} ${services_offered || ''} ${specialty || ''}`;
  const hasBlacklistedContent = containsBlacklistedWords(contentToValidate);

  try {
    // --- VALIDACIÓN DE ARCHIVOS SUBIDOS (Seguridad y Mimetypes) ---
    if (req.files) {
      if (req.files.profileImage) {
        if (!isValidImage(req.files.profileImage[0])) {
          return res.status(400).json({ message: 'El archivo de la foto de perfil no es una imagen válida.' });
        }
      }
      if (req.files.felcc_rejap) {
        if (!isValidPrivateFile(req.files.felcc_rejap[0])) {
          return res.status(400).json({ message: 'El archivo del certificado FELCC/REJAP debe ser un documento PDF o una imagen válida.' });
        }
      }
    }

    await client.query('BEGIN');

    // --- Validación Ley 548: Menores y especialidades de alto riesgo ---
    if (specialty) {
      const { rows: [service] } = await client.query('SELECT is_high_risk FROM services WHERE name = $1', [specialty]);
      if (service && service.is_high_risk) {
        // Obtener la fecha de nacimiento de la tabla users
        const { rows: [usr] } = await client.query('SELECT birth_date FROM users WHERE id = $1', [id]);
        if (usr) {
          const age = calculateAge(usr.birth_date);
          if (age < 18) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: `Actualización bloqueada. Según la Ley 548, los menores de edad no pueden realizar trabajos de alto riesgo como "${specialty}".` });
          }
        }
      }
    }

    const { rows: [professional] } = await client.query('SELECT "imageUrl", felcc_rejap_url, is_online, current_latitude, current_longitude FROM professionals WHERE id = $1', [id]);
    if (!professional) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Perfil profesional no encontrado.' });
    }

    // --- Procesamiento de profileImage ---
    let newImageUrl = professional.imageUrl;
    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage[0];
      // Opcional: Borrar la imagen anterior si es un archivo local
      if (professional.imageUrl && professional.imageUrl.includes('/uploads/')) {
        const oldImageName = professional.imageUrl.split('/uploads/')[1];
        const oldImagePath = path.join(uploadsDir, oldImageName);
        if (fs.existsSync(oldImagePath)) {
          fs.promises.unlink(oldImagePath).catch((err) => {
            if (err) console.error("Error al borrar la imagen anterior:", err);
          });
        }
      }
      const newImageFilename = `profile-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, newImageFilename), file.buffer);
      newImageUrl = `${req.protocol}://${req.get('host')}/uploads/${newImageFilename}`;
    }

    // --- Procesamiento de felcc_rejap ---
    let newFelccRejapUrl = existingFelccRejapUrl === 'null' ? null : professional.felcc_rejap_url; // Si el frontend envía 'null' o se elimina
    if (req.files && req.files.felcc_rejap) {
      const file = req.files.felcc_rejap[0];
      // Opcional: Borrar el archivo anterior si existe
      if (professional.felcc_rejap_url) {
        let oldFileName = null;
        let oldFilePath = null;
        if (professional.felcc_rejap_url.includes('/uploads/')) {
          oldFileName = professional.felcc_rejap_url.split('/uploads/')[1];
          oldFilePath = path.join(uploadsDir, oldFileName);
        } else if (professional.felcc_rejap_url.includes('private_uploads/')) {
          oldFileName = professional.felcc_rejap_url.split('private_uploads/')[1];
          oldFilePath = path.join(privateUploadsDir, oldFileName);
        }
        if (oldFilePath && fs.existsSync(oldFilePath)) {
          fs.promises.unlink(oldFilePath).catch(err => console.error("Error al borrar el archivo FELCC/REJAP anterior:", err));
        }
      }
      const newFileName = `felcc-rejap-${Date.now()}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(privateUploadsDir, newFileName), file.buffer);
      newFelccRejapUrl = `private_uploads/${newFileName}`;
    }

    // 1. Actualizar la tabla 'professionals'
    const normalizedHashtags = normalizeHashtags(hashtags);
    await client.query(
      `UPDATE professionals SET 
        name = $1, specialty = $2, bio = $3, services_offered = $4, 
        has_store = $5, store_address = $6, latitude = $7, longitude = $8, "imageUrl" = $9,
        felcc_rejap_url = $10, action_radius = $11, hashtags = $12 WHERE id = $13`,
      [name, specialty, bio, services_offered, has_store === 'true', store_address, latitude, longitude, newImageUrl, newFelccRejapUrl, parseInt(action_radius) || 10, normalizedHashtags, id]
    );

    // 2. Actualizar la tabla 'users' para mantener la consistencia
    // Si se detecta contenido prohibido, se suspende la cuenta.
    if (hasBlacklistedContent) {
      await client.query(
        `UPDATE users SET name = $1, "imageUrl" = $2, phone_number = $3, account_status = 'suspended' WHERE id = $4`,
        [name, newImageUrl, phone_number, id]
      );
    } else {
      await client.query(
        `UPDATE users SET name = $1, "imageUrl" = $2, phone_number = $3 WHERE id = $4`,
        [name, newImageUrl, phone_number, id]
      );
    }

    await client.query('COMMIT');

    // Si la cuenta fue suspendida, no se debe generar un nuevo token válido para la sesión.
    if (hasBlacklistedContent) {
      return res.json({
        message: 'Tu perfil ha sido suspendido para revisión por contener términos no permitidos.',
        suspended: true
      });
    }

    // Después de una actualización exitosa, genera un nuevo token con la información actualizada
    const { rows: [updatedUser] } = await client.query('SELECT id, name, user_type, "imageUrl" FROM users WHERE id = $1', [id]);
    const newToken = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, user_type: updatedUser.user_type, imageUrl: updatedUser.imageUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Perfil actualizado con éxito', imageUrl: newImageUrl, token: newToken });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar el perfil profesional:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar el perfil.' });
  } finally {
    client.release();
  }
});

// Endpoint para actualizar el estado online/offline del profesional
app.put('/api/professionals/:id/online-status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { is_online } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil.' });
  }

  try {
    await db.query(
      'UPDATE professionals SET is_online = $1 WHERE id = $2',
      [is_online, id]
    );
    if (is_online === true || is_online === 'true') {
      notifyClientsOfNearbyProfessional(id);
    }
    res.json({ message: 'Estado online actualizado.' });
  } catch (error) {
    console.error('Error al actualizar estado online:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar estado online.' });
  }
});

// Endpoint para registrar la ubicación en tiempo real de un profesional
app.put('/api/professionals/:id/location', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ message: 'No tienes permiso para actualizar esta ubicación.' });
  }

  try {
    await db.query(
      'UPDATE professionals SET current_latitude = $1, current_longitude = $2, last_location_update = CURRENT_TIMESTAMP WHERE id = $3',
      [latitude, longitude, id]
    );
    res.json({ message: 'Ubicación en tiempo real actualizada.' });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar ubicación.' });
  }
});


// Endpoint para iniciar sesión
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    const { rows: [user] } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'El correo o la contraseña son incorrectos.' });
    }

    // Verificar estado de la cuenta
    if (user.account_status === 'pending') {
      return res.status(403).json({ code: 'ACCOUNT_PENDING', message: 'Su cuenta está pendiente a aprobación.' });
    }
    if (user.account_status !== 'active') {
      return res.status(403).json({ message: `Tu cuenta está ${user.account_status}. Contacta a soporte.` });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, user_type: user.user_type, imageUrl: user.imageUrl },
      JWT_SECRET,
      { expiresIn: '7d' } // El token expira en 7 días
    );

    res.json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// --- Chat Endpoints (Protegidos) ---

// Endpoint para obtener la lista de conversaciones del usuario logueado
app.get('/api/chats', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // Esta consulta es compleja: une conversaciones con usuarios para obtener los datos del "otro" participante.
    // También obtiene el último mensaje de cada conversación para la vista previa.
    const { rows: conversations } = await db.query(`
      SELECT
        c.id,
        c.updated_at,
        u.id as other_user_id,
        u.name as other_user_name,
        u."imageUrl" as other_user_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      JOIN users u ON (u.id = c.user1_id OR u.id = c.user2_id) AND u.id != $1
      WHERE c.user1_id = $2 OR c.user2_id = $3
      ORDER BY c.updated_at DESC
    `, [userId, userId, userId]);
    res.json(conversations);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Endpoint para iniciar una conversación (o encontrar una existente)
app.post('/api/chats/start', authMiddleware, async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user.id;

  const targetId = parseInt(recipientId);

  if (!targetId || senderId == targetId) {
    return res.status(400).json({ message: 'ID de destinatario inválido.' });
  }

  try {
    const user1 = Math.min(senderId, targetId);
    const user2 = Math.max(senderId, targetId);

    let { rows: [conversation] } = await db.query('SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2', [user1, user2]);

    if (!conversation) {
      const { rows: [newConversation] } = await db.query('INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id', [user1, user2]);
      conversation = { id: newConversation.id };
    }
    res.status(201).json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error al iniciar conversación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Endpoint para iniciar o recuperar un chat de soporte con el administrador
app.post('/api/chats/support', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  try {
    // Buscar al usuario administrador con correo admin@gmail.com para soporte
    const { rows: [adminUser] } = await db.query("SELECT id FROM users WHERE email = 'admin@gmail.com' LIMIT 1");
    if (!adminUser) {
      return res.status(404).json({ message: 'No se encontró el administrador con correo admin@gmail.com para soporte.' });
    }

    const recipientId = adminUser.id;
    if (senderId === recipientId) {
      return res.status(400).json({ message: 'No puedes abrir un chat de soporte contigo mismo.' });
    }

    const user1 = Math.min(senderId, recipientId);
    const user2 = Math.max(senderId, recipientId);

    let { rows: [conversation] } = await db.query('SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2', [user1, user2]);

    if (!conversation) {
      const { rows: [newConversation] } = await db.query('INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id', [user1, user2]);
      conversation = { id: newConversation.id };
    }
    res.status(201).json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error al iniciar conversación de soporte:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Endpoint para obtener los mensajes de una conversación
app.get('/api/chats/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que el usuario es parte de la conversación
    const { rows: [conversation] } = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $3)',
      [conversationId, userId, userId]
    );

    if (!conversation) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta conversación.' });
    }

    const { rows: messages } = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    // Obtener datos del otro usuario para la cabecera del chat
    const otherUserId = userId == conversation.user1_id ? conversation.user2_id : conversation.user1_id;
    const { rows: [otherUser] } = await db.query('SELECT id, name, "imageUrl", birth_date, user_type FROM users WHERE id = $1', [otherUserId]);

    res.json({ messages, otherUser });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Endpoint para enviar un mensaje
app.post('/api/chats/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'El contenido del mensaje no puede estar vacío.' });
  }

  const client = await db.connect();
  try {
    const { rows: [conversation] } = await client.query(
      'SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $3)',
      [conversationId, senderId, senderId]
    );

    if (!conversation) {
      return res.status(403).json({ message: 'No tienes permiso para enviar mensajes a esta conversación.' });
    }

    // Usamos una transacción para asegurar que ambas operaciones (insertar y actualizar) se completen
    await client.query('BEGIN');
    const { rows: [newMessage] } = await client.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [conversationId, senderId, content]
    );
    await client.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    // Crear notificación para el destinatario
    const otherUserId = senderId == conversation.user1_id ? conversation.user2_id : conversation.user1_id;
    await client.query(
      "INSERT INTO notifications (user_id, title, content, type, related_id) VALUES ($1, $2, $3, $4, $5)",
      [otherUserId, 'Nuevo mensaje', `Has recibido un nuevo mensaje de ${req.user.name}`, 'new_message', conversationId]
    );

    await client.query('COMMIT');

    res.status(201).json(newMessage);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    client.release();
  }
});

// --- Database and Notifications Setup ---

// --- Database and Notifications Setup ---

async function initDatabase() {
  try {
    // 1. Verificar si existen last_latitude y last_longitude en la tabla 'users'
    const { rows: columns } = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('last_latitude', 'last_longitude')
    `);

    if (columns.length < 2) {
      console.log('Migración: Agregando coordenadas last_latitude y last_longitude a la tabla users...');
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_latitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS last_longitude DOUBLE PRECISION
      `);
    }

    // 2. Crear la tabla de notificaciones si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Verificar si existe la columna sponsorship_level en professionals
    const { rows: proCols } = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'professionals' AND column_name = 'sponsorship_level'
    `);

    if (proCols.length === 0) {
      console.log('Migración: Agregando columna sponsorship_level a professionals...');
      await db.query(`
        ALTER TABLE professionals 
        ADD COLUMN IF NOT EXISTS sponsorship_level INTEGER DEFAULT 0
      `);
    }

    // 3b. Verificar si existe la columna hashtags en professionals
    const { rows: hashCols } = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'professionals' AND column_name = 'hashtags'
    `);

    if (hashCols.length === 0) {
      console.log('Migración: Agregando columna hashtags a professionals...');
      await db.query(`
        ALTER TABLE professionals 
        ADD COLUMN IF NOT EXISTS hashtags TEXT
      `);
      
      try {
        await db.query(`CREATE INDEX IF NOT EXISTS idx_professionals_hashtags ON professionals(hashtags)`);
      } catch (indexErr) {
        console.warn('Advertencia al crear índice idx_professionals_hashtags:', indexErr.message);
      }
    }

    // 4. Crear la tabla de publicaciones de profesionales
    await db.query(`
      CREATE TABLE IF NOT EXISTS professional_posts (
        id SERIAL PRIMARY KEY,
        professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        description TEXT,
        likes_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migración: Asegurarse de que exista la columna status en professional_posts
    const { rows: postCols } = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'professional_posts' AND column_name = 'status'
    `);

    if (postCols.length === 0) {
      console.log('Migración: Agregando columna status a professional_posts...');
      await db.query(`
        ALTER TABLE professional_posts 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
      `);
      // Marcar los de prueba sembrados como aprobados
      await db.query(`UPDATE professional_posts SET status = 'approved'`);
    }

    // 4b. Crear la tabla de alertas de seguridad administrativa
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(50) NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        details TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Sembrar publicaciones de prueba si la tabla está vacía
    const { rows: postCount } = await db.query('SELECT COUNT(*) FROM professional_posts');
    if (parseInt(postCount[0].count) === 0) {
      console.log('Migración: Sembrando publicaciones de prueba para la pestaña Explorar...');

      const { rows: pros } = await db.query('SELECT id, specialty FROM professionals');

      if (pros.length > 0) {
        // Asignar niveles de patrocinio de prueba para tener variedad de posicionamiento
        for (let i = 0; i < pros.length; i++) {
          const sponsorship = i % 3 === 0 ? 100 : (i % 3 === 1 ? 50 : 0);
          await db.query('UPDATE professionals SET sponsorship_level = $1 WHERE id = $2', [sponsorship, pros[i].id]);
        }

        const mockImages = [
          'uploads/portfolio-1783130284683.png',
          'uploads/portfolio-1783130381860.png',
          'uploads/profile-1783129205869.png',
          'uploads/profile-1783107324365.jpeg',
          'uploads/profile-1774276652846.jpeg'
        ];

        const mockPosts = [
          {
            image: mockImages[0],
            description: 'Instalación de grifería premium completada hoy en zona central. Trabajo con garantía de 1 año y materiales de primera calidad. #plomeria #hogar'
          },
          {
            image: mockImages[1],
            description: 'Renovación de cableado general y tablero de disyuntores de seguridad. Previene fallas y protege tu hogar. Electricista certificado disponible. #electricidad'
          },
          {
            image: mockImages[2],
            description: 'Cambio de look completo: pintura de interiores con acabado mate de fácil limpieza. Cotiza tu espacio sin compromiso. #decoracion #pintura'
          },
          {
            image: mockImages[3],
            description: 'Construcción y nivelación de muro perimetral reforzado. Cimientos sólidos para tu tranquilidad. #construccion #albañileria'
          },
          {
            image: mockImages[4],
            description: 'Servicio de limpieza profunda de alfombras y desinfección de salas a domicilio. Especial para dueños de mascotas. #limpieza #salud'
          }
        ];

        for (let i = 0; i < Math.min(pros.length, mockPosts.length); i++) {
          const proId = pros[i].id;
          const post = mockPosts[i];

          await db.query(
            "INSERT INTO professional_posts (professional_id, image_url, description, likes_count, status) VALUES ($1, $2, $3, $4, 'approved')",
            [proId, post.image, post.description, Math.floor(Math.random() * 80) + 10]
          );
        }
      }
    }

    console.log('Base de datos inicializada y migrada correctamente (Notificaciones y Explorar habilitados).');
  } catch (error) {
    console.error('Error al inicializar la base de datos de notificaciones:', error);
  }
}

// Helper para notificar a clientes cuando un profesional está cerca y activo/online
async function notifyClientsOfNearbyProfessional(professionalId) {
  try {
    const { rows: [pro] } = await db.query(
      'SELECT name, specialty, latitude, longitude, action_radius FROM professionals WHERE id = $1',
      [professionalId]
    );

    if (!pro || pro.latitude === null || pro.longitude === null) return;

    const actionRadius = pro.action_radius || 10;

    // Buscar clientes activos con coordenadas válidas registradas en el radio de acción
    const { rows: clients } = await db.query(`
      SELECT id FROM users 
      WHERE user_type = 'client' 
        AND last_latitude IS NOT NULL 
        AND last_longitude IS NOT NULL
        AND (6371 * acos(
          LEAST(1.0, GREATEST(-1.0, 
            cos(radians($1)) * cos(radians(last_latitude)) * 
            cos(radians(last_longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(last_latitude))
          ))
        )) <= $3
    `, [pro.latitude, pro.longitude, actionRadius]);

    for (const client of clients) {
      // Evitar spam: no enviar más de una notificación del mismo pro en las últimas 2 horas
      const { rows: [recent] } = await db.query(`
        SELECT id FROM notifications 
        WHERE user_id = $1 AND type = 'nearby_pro' AND related_id = $2 
          AND created_at > NOW() - INTERVAL '2 hours'
      `, [client.id, professionalId]);

      if (!recent) {
        await db.query(`
          INSERT INTO notifications (user_id, title, content, type, related_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          client.id,
          '¡Profesional disponible cerca!',
          `${pro.name} (${pro.specialty}) ahora está disponible cerca de ti.`,
          'nearby_pro',
          professionalId
        ]);
      }
    }
  } catch (error) {
    console.error('Error en notifyClientsOfNearbyProfessional:', error);
  }
}

// --- Endpoints de Notificaciones ---

// Obtener todas las notificaciones del usuario autenticado
app.get('/api/notifications', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error interno en el servidor al obtener notificaciones.' });
  }
});

// Marcar todas las notificaciones como leídas
app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas.' });
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    res.status(500).json({ message: 'Error en el servidor al marcar notificaciones.' });
  }
});

// Marcar una notificación individual como leída
app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const { rows: [notif] } = await db.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!notif) {
      return res.status(404).json({ message: 'Notificación no encontrada o acceso denegado.' });
    }
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1',
      [id]
    );
    res.json({ message: 'Notificación marcada como leída.' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Obtener publicaciones de profesionales para la pestaña Explorar (ordenados por patrocinio)
app.get('/api/explore/posts', async (req, res) => {
  try {
    const query = `
      SELECT 
        pt.id,
        pt.professional_id,
        pt.image_url,
        pt.description,
        pt.likes_count,
        pt.created_at,
        p.specialty,
        p.has_gold_seal,
        p.sponsorship_level,
        u.name AS professional_name,
        u."imageUrl" AS professional_image
      FROM professional_posts pt
      JOIN professionals p ON pt.professional_id = p.id
      JOIN users u ON p.id = u.id
      WHERE pt.status = 'approved'
      ORDER BY p.sponsorship_level DESC, p.has_gold_seal DESC, pt.created_at DESC
      LIMIT 100
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener publicaciones de explorar:', error);
    res.status(500).json({ message: 'Error interno en el servidor al obtener las publicaciones.' });
  }
});

// Endpoint para dar like a una publicación en Explorar
app.post('/api/explore/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [post] } = await db.query(
      'UPDATE professional_posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [id]
    );
    if (!post) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }
    res.json({ likes_count: post.likes_count });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ message: 'Error interno en el servidor.' });
  }
});

// Endpoint para crear una nueva publicación en Explorar (sólo profesionales)
app.post('/api/explore/posts', authMiddleware, upload.single('image'), async (req, res) => {
  const professionalId = req.user.id;
  const { description } = req.body;

  if (req.user.user_type !== 'professional') {
    return res.status(403).json({ message: 'Solo los profesionales pueden crear publicaciones.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'La imagen de la publicación es requerida.' });
  }

  if (!isValidImage(req.file)) {
    return res.status(400).json({ message: 'El archivo de la publicación no es una imagen válida.' });
  }

  try {
    const filename = `explore-${professionalId}-${Date.now()}${path.extname(req.file.originalname)}`;
    await fs.promises.writeFile(path.join(uploadsDir, filename), req.file.buffer);
    const imageUrl = `uploads/${filename}`;

    const { rows: [newPost] } = await db.query(
      "INSERT INTO professional_posts (professional_id, image_url, description, likes_count, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
      [professionalId, imageUrl, description || '', 0]
    );

    // Obtener información adicional para devolver un objeto completo de publicación
    const { rows: [fullPost] } = await db.query(`
      SELECT 
        pt.id,
        pt.professional_id,
        pt.image_url,
        pt.description,
        pt.likes_count,
        pt.created_at,
        p.specialty,
        p.has_gold_seal,
        p.sponsorship_level,
        u.name AS professional_name,
        u."imageUrl" AS professional_image
      FROM professional_posts pt
      JOIN professionals p ON pt.professional_id = p.id
      JOIN users u ON p.id = u.id
      WHERE pt.id = $1
    `, [newPost.id]);

    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ message: 'Error al subir la publicación.' });
  }
});

// Ruta raíz para evitar el Cannot GET /
app.get('/', (req, res) => {
  res.status(200).json({
    app: "SENN FIX API",
    status: "Online",
    message: "Trabajo terminado, problema solucionado. Estás en paz con SENN FIX.",
    version: "1.0.0"
  });
});

app.listen(port, async () => {
  console.log(`Backend server corriendo en http://localhost:${port}`);
  await initDatabase();
  startGoldSealCron();
});