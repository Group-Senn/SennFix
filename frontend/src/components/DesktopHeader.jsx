import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import logoNav from '../assets/logoNav.svg';

function DesktopHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        <img 
          src={logoNav} 
          alt="SENN Fix Logo" 
          className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
        />
        <span className="font-display font-bold text-lg tracking-tight text-primary dark:text-slate-100">
          SENN Fix
        </span>
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
      <div className="flex items-center gap-5">
        {isAuthenticated && (
          <div className="flex items-center">
            <NotificationBell />
          </div>
        )}
        
        <ThemeSwitcher />

        <div className="h-4 w-px bg-primary/10 dark:bg-slate-700" />

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-xs text-primary/70 dark:text-slate-350 max-w-[120px] truncate">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs font-bold text-primary dark:text-teal-400 hover:underline flex items-center gap-1"
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
