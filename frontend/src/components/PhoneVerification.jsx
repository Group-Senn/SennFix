import React, { useState, useEffect, useRef } from 'react';

// Verificación del celular con un código de 6 dígitos enviado por WhatsApp (validado en el backend).
// Al verificarse, llama a onVerified(phoneVerificationToken); el backend exige ese token para registrar.
function PhoneVerificationModal({ phoneNumber, onVerified, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(true);

  const inputRefs = useRef([]);
  const isMountedRef = useRef(true);

  const fullPhoneNumber = `+591${phoneNumber}`;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-focus el primer casillero al completarse el envío del código
  useEffect(() => {
    if (!sendingCode && codeSent && inputRefs.current[0]) {
      setTimeout(() => {
        if (isMountedRef.current && inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [sendingCode, codeSent]);

  // Enviar el código automáticamente al abrir el modal
  useEffect(() => {
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown del reenvío
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendCode = async () => {
    setSendingCode(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const response = await fetch(`${window.API_URL}/api/phone/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: fullPhoneNumber })
      });
      const data = await response.json().catch(() => ({}));
      if (!isMountedRef.current) return;

      if (response.ok && data.verification_required === false) {
        // WhatsApp aún no está configurado en el servidor: se continúa sin código
        if (onVerified) onVerified(null);
      } else if (response.ok) {
        setCodeSent(true);
        setCooldown(data.resend_in || 60);
      } else if (response.status === 429 && data.retry_after) {
        // Ya se envió un código hace poco (ej: doble montaje en desarrollo): se usa ese mismo código
        setCodeSent(true);
        setCooldown(data.retry_after);
      } else {
        setError(data.message || 'No se pudo enviar el código por WhatsApp.');
      }
    } catch (err) {
      console.error('Error al solicitar código:', err);
      if (isMountedRef.current) {
        setError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      if (isMountedRef.current) {
        setSendingCode(false);
      }
    }
  };

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const verificationCode = otp.join('');
    if (verificationCode.length !== 6) {
      setError('Por favor, ingresa los 6 dígitos del código.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${window.API_URL}/api/phone/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: fullPhoneNumber, code: verificationCode })
      });
      const data = await response.json().catch(() => ({}));
      if (!isMountedRef.current) return;

      if (!response.ok) {
        setError(data.message || 'Error de validación. Inténtalo de nuevo.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (onVerified) {
        onVerified(data.phone_verification_token);
      }
    } catch (err) {
      console.error('Error al verificar código:', err);
      if (isMountedRef.current) {
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Manejador para ingresar dígitos individuales
  const handleOtpChange = (index, value) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (!numeric) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const lastChar = numeric[numeric.length - 1];
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-focus al siguiente casillero
    if (index < 5 && lastChar) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Manejo de retroceso (Backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'Enter') {
      handleVerifyCode();
    }
  };

  // Pegar código completo de 6 dígitos
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-feedback">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
          <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">
            <span>Verificación por WhatsApp</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {sendingCode ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <svg className="animate-spin h-10 w-10 text-primary dark:text-teal-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold text-primary/80 dark:text-slate-350 text-center">
              Enviando código por WhatsApp a +591 {phoneNumber}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs sm:text-sm text-primary/70 dark:text-slate-400">
                {codeSent
                  ? 'Ingresa el código de 6 dígitos que te enviamos por WhatsApp al número:'
                  : 'Enviaremos un código de verificación por WhatsApp al número:'}
              </p>
              <p className="font-mono text-base font-bold text-primary dark:text-slate-100">
                +591 {phoneNumber}
              </p>
            </div>

            {codeSent && (
              <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => inputRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    disabled={loading}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center font-bold text-xl sm:text-2xl rounded-xl border-2 bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 focus:outline-none transition-all border-slate-200 dark:border-slate-600 focus:border-primary dark:focus:border-teal-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-teal-400/20"
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs leading-relaxed font-semibold animate-feedback">
                <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              {codeSent && (
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/40 text-white py-3 rounded-lg font-bold text-sm sm:text-base transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg sm:text-xl">verified_user</span>
                      <span>Confirmar Código</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex flex-col items-center justify-center pt-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={cooldown > 0 || loading}
                  className="font-bold text-primary dark:text-teal-400 hover:underline disabled:text-primary/40 disabled:no-underline cursor-pointer bg-transparent border-none p-0"
                >
                  {cooldown > 0
                    ? `Reenviar código en ${cooldown}s`
                    : codeSent ? 'Reenviar código por WhatsApp' : 'Enviar código por WhatsApp'}
                </button>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  El número debe tener WhatsApp activo. El código vence en 10 minutos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhoneVerificationModal;
