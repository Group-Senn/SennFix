import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function PhoneVerificationModal({ phoneNumber, onVerified, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sendingSms, setSendingSms] = useState(true);
  const [canBypass, setCanBypass] = useState(false);

  const recaptchaVerifierRef = useRef(null);
  const inputRefs = useRef([]);
  const isMountedRef = useRef(true);

  // Auto-focus el primer casillero al completarse el envío del SMS
  useEffect(() => {
    isMountedRef.current = true;
    if (!sendingSms && inputRefs.current[0]) {
      setTimeout(() => {
        if (isMountedRef.current && inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [sendingSms]);

  // Inicializar RecaptchaVerifier y enviar SMS automáticamente al montar
  useEffect(() => {
    isMountedRef.current = true;

    // Retrasar ligeramente para asegurar que el elemento DOM esté renderizado
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          // Limpiar cualquier instancia previa de forma síncrona
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
            } catch (e) {}
            recaptchaVerifierRef.current = null;
          }

          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-modal', {
            size: 'invisible',
            callback: (response) => {
              // reCAPTCHA resuelto
            },
            'expired-callback': () => {
              if (isMountedRef.current) {
                setError('El reCAPTCHA ha expirado. Por favor, intenta de nuevo.');
              }
            }
          });
          
          sendSMS();
        } catch (err) {
          console.error('Error al inicializar RecaptchaVerifier:', err);
          if (isMountedRef.current) {
            setError('Error al inicializar la verificación de seguridad (reCAPTCHA).');
            setSendingSms(false);
          }
        }
      }
    }, 150);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      // No hacemos clear() diferido en el unmount para evitar destruir la instancia del double-mount de React Strict Mode
    };
  }, []);

  // Cooldown del reenvío
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendSMS = async () => {
    if (!isMountedRef.current) return;
    setSendingSms(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    const fullPhoneNumber = `+591${phoneNumber}`;

    try {
      if (!isMountedRef.current) return;
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-modal', {
          size: 'invisible'
        });
      }

      const appVerifier = recaptchaVerifierRef.current;
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      
      if (!isMountedRef.current) return;
      setConfirmationResult(confirmation);
      setCooldown(60);
      setSendingSms(false);
    } catch (err) {
      console.error('Error de Firebase Auth en SMS:', err);
      
      if (!isMountedRef.current) return;
      
      // Diagnosticar y mostrar mensajes claros para errores de configuración comunes
      const isCarrierOrQuotaBlocked = 
        err.code?.includes('-39') || 
        err.message?.includes('-39') || 
        err.message?.includes('503') ||
        err.code === 'auth/quota-exceeded';

      if (isCarrierOrQuotaBlocked) {
        setError(
          'La pasarela de SMS de Firebase / Google bloqueó el envío a este número en Bolivia (Error auth/error-code:-39 / 503). Esto suele ocurrir en números no registrados de prueba debido a filtros de operadora o reCAPTCHA Enterprise.'
        );
        setCanBypass(true);
      } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('region')) {
        setError(
          'Región deshabilitada en Firebase: Debes habilitar la región de Bolivia (+591) para envío de SMS en la consola de Firebase (Authentication -> Settings -> User sign-in countries / SMS Region Policy).'
        );
        setCanBypass(true);
      } else if (err.message?.includes('recaptcha') || err.message?.includes('401') || err.code?.includes('unauthorized')) {
        setError(
          'Error de seguridad / reCAPTCHA: Asegúrate de que el dominio esté agregado en Dominios Autorizados de Firebase Console y reCAPTCHA Enterprise configurado.'
        );
        setCanBypass(true);
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('El número de celular ingresado no es válido para Bolivia.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados SMS solicitados en poco tiempo. Por favor, intenta más tarde.');
        setCanBypass(true);
      } else {
        setError(`Error al enviar SMS: ${err.message || 'Verifica tu consola de Firebase Auth.'}`);
        setCanBypass(true);
      }
      setSendingSms(false);
    }
  };

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    if (!isMountedRef.current) return;
    setError('');
    setLoading(true);

    const verificationCode = otp.join('');
    if (verificationCode.length !== 6) {
      setError('Por favor, ingresa los 6 dígitos del código.');
      setLoading(false);
      return;
    }

    try {
      if (!confirmationResult) {
        setError('No hay una sesión activa de SMS iniciada. Puedes omitir la verificación para continuar.');
        setCanBypass(true);
        setLoading(false);
        return;
      }
      await confirmationResult.confirm(verificationCode);
      if (isMountedRef.current && onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error('Error al verificar OTP:', err);
      if (!isMountedRef.current) return;
      if (err.code === 'auth/invalid-verification-code') {
        setError('El código ingresado es incorrecto.');
      } else if (err.code === 'auth/code-expired') {
        setError('El código ha expirado. Solicita uno nuevo.');
      } else {
        setError('Error de validación. Inténtalo de nuevo.');
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
      {/* ReCaptcha invisible */}
      <div id="recaptcha-container-modal"></div>

      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4">
        {/* Encabezado sin escudo */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
          <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">
            <span>Verificación Telefónica</span>
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

        {/* Contenido principal */}
        {sendingSms ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <svg className="animate-spin h-10 w-10 text-primary dark:text-teal-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold text-primary/80 dark:text-slate-350 text-center">
              Enviando código de verificación a +591 {phoneNumber}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs sm:text-sm text-primary/70 dark:text-slate-400">
                Ingresa el código de 6 dígitos enviado al número:
              </p>
              <p className="font-mono text-base font-bold text-primary dark:text-slate-100">
                +591 {phoneNumber}
              </p>
            </div>

            {/* 6 Casillas de OTP Separadas */}
            <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  disabled={loading}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center font-bold text-xl sm:text-2xl rounded-xl border-2 bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 focus:outline-none transition-all border-slate-200 dark:border-slate-600 focus:border-primary dark:focus:border-teal-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-teal-400/20"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs leading-relaxed font-semibold animate-feedback">
                <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {canBypass && (
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-2 animate-feedback">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  <span>Alternativa de Continuidad</span>
                </div>
                <p className="text-[11px] text-teal-900/80 dark:text-teal-200/80 leading-relaxed">
                  Para no bloquear tu registro debido a filtros de entrega de SMS en tu operadora, puedes omitir este paso y finalizar la creación de tu cuenta.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onVerified) onVerified();
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:scale-98 text-white py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Omitir verificación SMS y completar registro</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading || otp.join('').length !== 6 || !confirmationResult}
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

              <div className="flex flex-col items-center justify-center pt-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={sendSMS}
                  disabled={cooldown > 0 || loading}
                  className="font-bold text-primary dark:text-teal-400 hover:underline disabled:text-primary/40 disabled:no-underline cursor-pointer bg-transparent border-none p-0"
                >
                  {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Reenviar código por SMS'}
                </button>

                {!canBypass && (
                  <button
                    type="button"
                    onClick={() => setCanBypass(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer bg-transparent border-none p-0 transition-colors"
                  >
                    ¿No recibes el SMS? Opciones de contingencia
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhoneVerificationModal;
