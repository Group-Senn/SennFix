import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Barra de pestañas estándar: fija, a ancho completo y con nombre visible en cada pestaña
function BottomNav() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  if (user && user.user_type === 'admin') {
    return null;
  }

  const unreadChats = notifications.filter(n => !n.is_read && n.type === 'new_message').length;

  const navItems = [
    { to: '/home', icon: 'home', text: 'Inicio' },
    { to: '/explore', icon: 'explore', text: 'Explorar' },
    { to: '/chats', icon: 'forum', text: 'Chats', badge: unreadChats },
    { to: '/my-profile', icon: 'person', text: 'Perfil' },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-16">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1 list-none">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${isActive
                  ? 'text-primary dark:text-teal-400 font-bold'
                  : 'text-muted dark:text-slate-400 font-medium'
                }`
              }
            >
              <span className="relative">
                <span className="material-symbols-outlined text-2xl block" aria-hidden="true">{item.icon}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-700 text-white text-xs font-bold leading-[18px] text-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              {item.text}
              {item.badge > 0 && <span className="sr-only">, {item.badge} sin leer</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
