import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');

    try {
      const response = await fetch(window.API_URL + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'ACCOUNT_PENDING') {
          setPendingMessage(data.message || 'Su cuenta está pendiente a aprobación.');
          return;
        }
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      login(data.token);
      
      try {
        const decoded = jwtDecode(data.token);
        if (decoded.user_type === 'admin') {
          navigate('/admin/dashboard?tab=stats', { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error decoding token in login page:", err);
      }
      
      navigate(from, { replace: true });

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
        <div className="w-full max-w-md p-6 sm:p-8 space-y-5 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-primary/5 dark:shadow-black/20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary dark:text-slate-100">Iniciar Sesión</h1>
            <p className="text-sm text-primary/60 dark:text-slate-400 mt-2 font-medium">Bienvenido de vuelta a SENN Fix</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Correo Electrónico</label>
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
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Contraseña</label>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-450 hover:text-primary dark:hover:text-slate-200 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span>{error}</span>
              </div>
            )}

            {pendingMessage && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">pending_actions</span>
                <span>{pendingMessage}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-teal-800 dark:from-teal-600 dark:to-teal-700 text-white rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-teal-500/10 active:scale-95 border-none cursor-pointer"
            >
              Entrar
            </button>
          </form>

          <div className="text-sm text-center space-y-3">
            <p className="text-xs font-semibold text-primary/50 dark:text-slate-450 uppercase tracking-wider">¿No tienes una cuenta?</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link 
                to="/register" 
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-primary/10 dark:border-slate-700 hover:border-primary/20 dark:hover:border-teal-500/35 hover:bg-primary/5 dark:hover:bg-teal-500/5 transition-all text-center no-underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl text-primary dark:text-teal-400 mb-1">person</span>
                <span className="font-bold text-xs text-primary dark:text-slate-200">Cliente</span>
              </Link>
              <Link 
                to="/register-professional" 
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-primary/10 dark:border-slate-700 hover:border-primary/20 dark:hover:border-teal-500/35 hover:bg-primary/5 dark:hover:bg-teal-500/5 transition-all text-center no-underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl text-primary dark:text-teal-400 mb-1">construction</span>
                <span className="font-bold text-xs text-primary dark:text-slate-200">Profesional</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;