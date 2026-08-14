import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import logoNav from '../assets/logoNav.svg';
import logoNavDark from '../assets/logoNavDark.svg';
import letra from '../assets/letra.svg';
import letraDark from '../assets/letraDark.svg';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

function DesktopHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [locationName, setLocationName] = useState(() => localStorage.getItem('locationName') || 'Buscando ubicación...');
  const menuRef = useRef(null);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleContactSupport = async () => {
    setIsMenuOpen(false);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(window.API_URL + '/api/chats/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo iniciar el chat de soporte.');
      navigate(`/chats/${data.conversationId}`);
    } catch (err) {
      alert(`Error al abrir soporte: ${err.message}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const cached = localStorage.getItem('locationName');
    if (cached) {
      setLocationName(cached);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`);
          const geoData = await geoResponse.json();
          const city = geoData.address.city || geoData.address.town || geoData.address.state;
          const country = geoData.address.country;
          const name = `${city}, ${country}`;
          setLocationName(name);
          localStorage.setItem('locationName', name);
        } catch (error) {
          console.error("Error in reverse geocoding header:", error);
          setLocationName('Ubicación no disponible');
        }
      },
      (error) => {
        console.error("Error getting location in header:", error);
        setLocationName('Ubicación no permitida');
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
    );
  }, [isAuthenticated]);

  const navItems = [
    { to: '/home', text: 'Inicio' },
    { to: '/explore', text: 'Explorar' },
    { to: '/chats', text: 'Chats' },
    { to: '/my-profile', text: 'Perfil' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/10 dark:border-slate-800 hidden md:flex items-center justify-between px-8">
      {/* Brand Identity / Logo */}
      <Link to="/home" className="flex items-center gap-2.5 group">
        {/* Logo image responsive to dark mode */}
        <img 
          src={logoNav} 
          alt="SENN Fix Logo" 
          className="h-8 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden" 
        />
        <img 
          src={logoNavDark} 
          alt="SENN Fix Logo" 
          className="h-8 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block" 
        />
        
        {/* Brand Text image responsive to dark mode */}
        <img 
          src={letra} 
          alt="SENN Fix" 
          className="h-5 w-auto object-contain dark:hidden" 
        />
        <img 
          src={letraDark} 
          alt="SENN Fix" 
          className="h-5 w-auto object-contain hidden dark:block" 
        />
      </Link>

      {/* Centered Navigation Links */}
      <nav className="flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-sm font-semibold transition-all relative py-1.5 px-1 hover:text-primary dark:hover:text-teal-400 ${
                isActive
                  ? 'text-primary dark:text-teal-400'
                  : 'text-primary/65 dark:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.text}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-teal-400 rounded-full animate-scale-up" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Location Display */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-primary/60 dark:text-slate-400 font-semibold max-w-[150px] mr-1">
              <span className="material-symbols-outlined !text-[14px] shrink-0 text-primary dark:text-teal-400">location_on</span>
              <span className="truncate" title={locationName}>{locationName}</span>
            </div>

            <NotificationBell />
          </>
        ) : null}
        
        <ThemeSwitcher />

        {/* Menu Dropdown next to ThemeSwitcher */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full hover:bg-primary/5 dark:hover:bg-slate-800 text-primary dark:text-slate-200 transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
            title="Menú de opciones"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-outline-variant/10 dark:border-slate-700 overflow-hidden z-50 flex flex-col py-1 animate-scale-up">
              <Link
                to="/legal/terms-and-conditions"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                Términos y Condiciones
              </Link>
              <Link
                to="/legal/privacy-policy"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">policy</span>
                Políticas de Privacidad
              </Link>
              <Link
                to="/legal/no-labor-relationship"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Deslinde Laboral
              </Link>
              
              {isAuthenticated && (
                <button
                  onClick={handleContactSupport}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  Soporte Técnico
                </button>
              )}
              
              {user && user.user_type === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/5 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Consola de Administración
                </Link>
              )}
              
              <hr className="border-outline-variant/10 dark:border-slate-700 my-1" />
              
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/5 flex items-center gap-2.5 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-primary dark:text-teal-400 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Iniciar sesión
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-primary/10 dark:bg-slate-700" />

        {isAuthenticated ? (
          /* User Profile Card - links directly to my-profile */
          <Link
            to="/my-profile"
            className="flex items-center gap-2.5 text-left group p-1 rounded-xl hover:bg-primary/5 dark:hover:bg-slate-800 transition-colors"
          >
            {user?.imageUrl ? (
              <img
                src={getAbsoluteImageUrl(user.imageUrl)}
                onError={handleImageError}
                alt={user.name}
                className="w-9 h-9 rounded-full border border-primary/10 object-cover shrink-0 transition-transform group-hover:scale-105"
              />
            ) : (
              <span className="material-symbols-outlined text-[36px] text-primary/60 dark:text-slate-400 shrink-0">
                account_circle
              </span>
            )}
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-primary dark:text-slate-100 leading-tight">
                {user?.name}
              </span>
              <span className="text-[9px] text-primary/50 dark:text-slate-400 font-medium">
                {user?.user_type === 'professional' ? 'Profesional' : user?.user_type === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </Link>
        ) : (
          /* Iniciar sesión message in the navbar, shown ONLY when unauthenticated */
          <Link
            to="/login"
            className="text-xs font-bold text-primary dark:text-teal-400 hover:underline flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

export default DesktopHeader;
