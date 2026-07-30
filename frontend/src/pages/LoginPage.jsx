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
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Iniciar Sesión</h1>
            <p className="text-primary/70">Bienvenido de vuelta a SENN Fix</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-primary/80 block mb-2">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">alternate_email</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 block mb-2">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">lock</span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-11 pr-12 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/80 transition-colors">
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

            {pendingMessage && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">pending_actions</span>
                <span>{pendingMessage}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-lg transition-all active:scale-95">
              Entrar
            </button>
          </form>

          <p className="text-sm text-center text-primary/60">
            ¿No tienes una cuenta? <Link to="/register" className="font-bold text-primary hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;