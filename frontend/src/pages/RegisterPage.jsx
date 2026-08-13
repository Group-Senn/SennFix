import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import PhoneVerification from '../components/PhoneVerification';

const validatePassword = (pwd) => {
  if (pwd.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Z]/.test(pwd)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.';
  }
  if (!/[a-z]/.test(pwd)) {
    return 'La contraseña debe incluir al menos una letra minúscula.';
  }
  if (!/\d/.test(pwd)) {
    return 'La contraseña debe incluir al menos un número.';
  }
  if (!/[@$!%*?&._-]/.test(pwd)) {
    return 'La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -).';
  }
  return null;
};

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'client';

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [showNoLaborModal, setShowNoLaborModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) return setError('El campo "Nombre Completo" es obligatorio.');
    if (!email.trim()) return setError('El campo "Correo Electrónico" es obligatorio.');
    if (!phoneNumber.trim()) return setError('El campo "Celular" es obligatorio.');

    if (phoneNumber.length !== 8 || !/^[67]\d{7}$/.test(phoneNumber)) {
      return setError('El número debe ser un celular válido de Bolivia (8 dígitos, empezando con 6 o 7).');
    }

    if (!birthDate) return setError('El campo "Fecha de Nacimiento" es obligatorio.');
    if (!password) return setError('El campo "Contraseña" es obligatorio.');

    const pwdError = validatePassword(password);
    if (pwdError) return setError(pwdError);

    // Abrir el modal de verificación (enviará el SMS automáticamente)
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = async () => {
    setShowVerificationModal(false);
    setError('');
    setSuccess('Celular verificado. Procesando registro...');

    try {
      const fullPhoneNumber = `+591${phoneNumber}`;
      const response = await fetch(window.API_URL + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone_number: fullPhoneNumber, 
          birth_date: birthDate, 
          identity_card: identityCard || null, 
          user_type: userType 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro.');
      }

      setSuccess('¡Registro exitoso! Te estamos llevando al inicio de sesión...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <Link to="/home" className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 backdrop-blur-sm transition-colors">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-md p-6 sm:p-8 space-y-5 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-primary/5 dark:shadow-black/20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary dark:text-slate-100">Crear Cuenta</h1>
            <p className="text-sm text-primary/60 dark:text-slate-400 mt-2 font-medium">
              {userType === 'professional' ? 'Regístrate para ofrecer tus servicios' : 'Únete a SENN Fix para encontrar ayuda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Nombre Completo <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">person</span>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Correo Electrónico <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">alternate_email</span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">
                  Celular <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 focus-within:ring-4 focus-within:ring-primary/10 dark:focus-within:ring-teal-500/10 focus-within:border-primary dark:focus-within:border-teal-500 transition-all overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 bg-slate-200/40 dark:bg-slate-700 border-r border-primary/10 text-primary dark:text-slate-100 font-bold select-none text-sm sm:text-base">
                    <span className="text-lg">🇧🇴</span>
                    <span>+591</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/[^0-9]/g, '');
                      if (numeric.length <= 8) setPhoneNumber(numeric);
                    }}
                    placeholder="7XXXXXXX"
                    required
                    className="w-full px-4 py-3 bg-transparent text-primary dark:text-slate-100 border-none outline-none focus:ring-0 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DatePicker value={birthDate} onChange={setBirthDate} />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">C.I. (Opcional)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">badge</span>
                    <input 
                      type="text" 
                      maxLength={8} 
                      value={identityCard} 
                      onChange={e => setIdentityCard(e.target.value.replace(/[^0-9]/g, ''))} 
                      placeholder="12345678"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">lock</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-455 hover:text-primary dark:hover:text-slate-200 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              
              {password.length > 0 && (
                <div className="mt-2 text-xs space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-primary/5 dark:border-slate-700 animate-feedback">
                  <p className="font-semibold text-primary/80 dark:text-slate-300 mb-1">Requisitos de la contraseña:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{password.length >= 8 ? 'check' : 'close'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[A-Z]/.test(password) ? 'check' : 'close'}</span>
                      <span>Una mayúscula (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[a-z]/.test(password) ? 'check' : 'close'}</span>
                      <span>Una minúscula (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/\d/.test(password) ? 'check' : 'close'}</span>
                      <span>Un número (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[@$!%*?&._-]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[@$!%*?&._-]/.test(password) ? 'check' : 'close'}</span>
                      <span>Carácter especial (@$!%*?&._-)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/5 dark:border-slate-750">
              <input type="checkbox" id="legal_accepted" required className="size-5 rounded text-primary focus:ring-primary mt-0.5 shrink-0" />
              <label htmlFor="legal_accepted" className="text-sm text-primary/70 dark:text-slate-350">
                He leído y acepto la{' '}
                <button type="button" onClick={() => setShowPrivacyModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Política de Privacidad (Art. 21 CPE)
                </button>
                , los{' '}
                <button type="button" onClick={() => setShowConditionsModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Términos y Condiciones
                </button>{' '}
                y los{' '}
                <button type="button" onClick={() => setShowNoLaborModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Términos de Deslinde Laboral
                </button>{' '}
                de SENN FIX. <span className="text-red-500">*</span>
              </label>
            </div>

            {error && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-teal-800 dark:from-teal-600 dark:to-teal-700 text-white rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-teal-500/10 active:scale-95 border-none cursor-pointer"
            >
              Registrarse
            </button>
          </form>

          <div className="text-sm text-center space-y-3">
            <p className="text-primary/60 dark:text-slate-400">¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-primary dark:text-teal-400 hover:underline">Inicia Sesión</Link></p>
            <p className="text-xs text-primary/50 dark:text-slate-455">¿Eres un profesional? <Link to="/register-professional" className="font-bold text-primary dark:text-teal-400 hover:underline">Regístrate como Profesional aquí</Link></p>
          </div>
        </div>
      </div>

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Política de Privacidad</h3>
              <button 
                type="button" 
                onClick={() => setShowPrivacyModal(false)} 
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh] text-left">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Política de Privacidad y Protección de Datos Personales
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-400">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">1. Compromiso de Privacidad (Art. 21 CPE)</h5>
                <p>
                  De conformidad con el Artículo 21 de la Constitución Política del Estado Plurinacional de Bolivia, <strong>SENN FIX</strong> (Senn soluciones) se compromete a salvaguardar la intimidad, privacidad, honra y propia imagen de sus usuarios. Este documento describe cómo recolectamos, procesamos y resguardamos la información personal recopilada a través de la aplicación.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">2. Datos recopilados</h5>
                <p>
                  Para registrarse y utilizar el servicio de manera segura, recabamos los siguientes datos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Identificación:</strong> Nombre completo, correo electrónico, cédula de identidad y fecha de nacimiento.</li>
                  <li><strong>Contacto:</strong> Número de celular.</li>
                  <li><strong>Ubicación:</strong> Coordenadas geográficas a fin de ubicar profesionales locales cercanos en el mapa.</li>
                  <li><strong>Verificación KYC (Profesionales):</strong> Fotos del carnet de identidad, certificados de antecedentes (FELCC/REJAP) y foto de perfil del rostro.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">3. Finalidad del tratamiento de datos</h5>
                <p>
                  Los datos personales proporcionados se procesan con los siguientes fines exclusivos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Facilitar la intermediación y contratación de servicios autónomos entre clientes y profesionales.</li>
                  <li>Cumplir con las obligaciones legales de verificación de identidad KYC para prevenir fraudes e inseguridad.</li>
                  <li>Enviar alertas, notificaciones transaccionales y actualizaciones sobre el estado de las solicitudes.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">4. Resguardo y Seguridad de los Datos</h5>
                <p>
                  Los archivos de verificación de identidad (fotos de cédulas de identidad, certificados de antecedentes) se almacenan de manera encriptada y segura, y solo están accesibles para auditorías internas de seguridad administrativa por parte de nuestro equipo autorizado. <strong>SENN FIX</strong> no venderá, cederá ni distribuirá sus datos personales a terceros sin su consentimiento expreso, excepto por mandamiento de ley de autoridad judicial competente.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setShowPrivacyModal(false)} 
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Términos y Condiciones */}
      {showConditionsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowConditionsModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Términos y Condiciones</h3>
              <button 
                type="button" 
                onClick={() => setShowConditionsModal(false)} 
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh] text-left">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Términos y Condiciones de Uso
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-440">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">1. Aceptación de los Términos</h5>
                <p>
                  Al descargar, registrarse o utilizar la plataforma tecnológica <strong>SENN FIX</strong> (Senn soluciones), usted acepta quedar vinculado de manera incondicional por los presentes Términos y Condiciones de Uso. Si usted no está de acuerdo con alguno de los puntos establecidos aquí, debe abstenerse de utilizar o acceder a los servicios de la plataforma.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">2. Objeto de la Plataforma</h5>
                <p>
                  <strong>SENN FIX</strong> actúa como un mero intermediario tecnológico facilitando el contacto entre clientes que buscan contratar asistencia y profesionales independientes debidamente calificados que ofrecen sus servicios de forma autónoma. <strong>SENN FIX</strong> no asume responsabilidad directa por el servicio prestado, la calidad del mismo ni los acuerdos privados a los que lleguen ambas partes.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">3. Cuentas de Usuario y Seguridad</h5>
                <p>
                  Al registrarse, usted se compromete a proporcionar información verídica, exacta y actualizada. Es su responsabilidad salvaguardar la confidencialidad de su contraseña y notificar inmediatamente a soporte técnico ante cualquier uso no autorizado de su cuenta.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">4. Regulación para Menores de Edad (Ley 548)</h5>
                <p>
                  Conforme a la Ley 548 del Código Niña, Niño y Adolescente del Estado Plurinacional de Bolivia, los menores entre 14 y 17 años podrán ofrecer sus servicios únicamente si cuentan con la autorización legal correspondiente de sus padres, madres o tutores legales y de la Defensoría de la Niñez. Los menores tienen prohibido registrarse para realizar cualquier tipo de trabajo considerado de alto riesgo (construcción pesada, alta tensión, etc.).
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">5. Modificaciones y Actualizaciones</h5>
                <p>
                  Nos reservamos el derecho de enmendar o actualizar estos Términos y Condiciones en cualquier momento. El uso continuado de la plataforma tras dichas modificaciones constituirá su pleno consentimiento a las mismas.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setShowConditionsModal(false)} 
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de No Relación Laboral */}
      {showNoLaborModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowNoLaborModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Política de No Relación Laboral</h3>
              <button 
                type="button" 
                onClick={() => setShowNoLaborModal(false)} 
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh] text-left">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Política de No Relación Laboral y Términos de Servicio Independiente
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-400">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">1. Declaración de Independencia</h5>
                <p>
                  El presente documento regula los términos y condiciones de la relación entre los profesionales independientes y la plataforma <strong>SENN</strong> (Senn soluciones). Al registrarse como profesional, usted reconoce y acepta expresamente que <strong>SENN</strong> actúa únicamente como una plataforma de intermediación tecnológica que conecta a prestadores de servicios independientes con clientes que demandan dichos servicios.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">2. Ausencia de Vínculo Laboral (No Relación de Dependencia)</h5>
                <p>
                  Bajo ninguna circunstancia se considerará que existe un contrato de trabajo, relación de dependencia, subordinación ni vínculo laboral de ningún tipo entre el profesional y <strong>SENN</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Autonomía Técnica:</strong> El profesional tiene absoluta libertad para decidir el método, los materiales y la forma de ejecución de los servicios solicitados por el cliente.</li>
                  <li><strong>Autonomía de Horarios:</strong> El profesional define libremente sus horas de disponibilidad, el número de horas que permanece en línea y los trabajos que decide aceptar o rechazar.</li>
                  <li><strong>Herramientas Propias:</strong> El profesional deberá proveerse de sus propias herramientas, vehículos, equipos y recursos necesarios para ejecutar el servicio acordado.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">3. Pagos y Responsabilidades Fiscales</h5>
                <p>
                  Los precios o tarifas del servicio son pactados de mutuo acuerdo entre el profesional y el cliente. El profesional es el único responsable de declarar y pagar cualquier impuesto, arancel o contribución social que corresponda según la legislación vigente en Bolivia. <strong>SENN</strong> no realiza retenciones de ley asociadas a salarios ni provee seguro médico, beneficios sociales, aguinaldos o vacaciones.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">4. Deslinde de Responsabilidad Legal</h5>
                <p>
                  Dado que <strong>SENN</strong> no tiene control directo sobre la calidad, el tiempo, la seguridad o la legalidad de los servicios provistos, la plataforma queda exonerada de toda responsabilidad por daños civiles, penales, laborales o comerciales que surjan de la interacción, negociación o contratación directa entre el cliente y el profesional.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setShowNoLaborModal(false)} 
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {showVerificationModal && (
        <PhoneVerification
          phoneNumber={phoneNumber}
          onVerified={handleVerificationSuccess}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </>
  );
}

export default RegisterPage;