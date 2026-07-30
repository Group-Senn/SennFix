import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

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
  const [birthDate, setBirthDate] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'client';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación del lado del cliente para una mejor UX
    if (!name.trim()) return setError('El campo "Nombre Completo" es obligatorio.');
    if (!email.trim()) return setError('El campo "Correo Electrónico" es obligatorio.');
    if (!phoneNumber.trim()) return setError('El campo "Celular" es obligatorio.');
    if (!birthDate) return setError('El campo "Fecha de Nacimiento" es obligatorio.');
    if (!password) return setError('El campo "Contraseña" es obligatorio.');

    const pwdError = validatePassword(password);
    if (pwdError) return setError(pwdError);

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone_number: phoneNumber, birth_date: birthDate, identity_card: identityCard, user_type: userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro.');
      }

      setSuccess('¡Registro exitoso! Te estamos llevando al inicio de sesión...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
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
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Crear Cuenta</h1>
            <p className="text-primary/70 dark:text-slate-350">
              {userType === 'professional' ? 'Regístrate para ofrecer tus servicios' : 'Únete a SENN Fix para encontrar ayuda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">Nombre Completo <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">person</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">Correo Electrónico <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">alternate_email</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">Celular <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">call</span>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <DatePicker value={birthDate} onChange={setBirthDate} />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">Carnet de Identidad (Opcional)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">badge</span>
                <input type="text" value={identityCard} onChange={e => setIdentityCard(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">lock</span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-11 pr-12 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400 hover:text-primary/80 dark:hover:text-slate-200 transition-colors">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-lg transition-all active:scale-95">
              Registrarse
            </button>
          </form>

          <p className="text-sm text-center text-primary/60 dark:text-slate-400">
            ¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-primary dark:text-teal-400 hover:underline">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;