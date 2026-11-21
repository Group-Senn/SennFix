import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Barra de pestañas de celular: sólida y elevada, con la pestaña activa dentro de una píldora de color
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
      className="fixed bottom-0 inset-x-0 z-[1100] md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-6px_20px_rgba(4,63,59,0.10)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-[68px]">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1 list-none">
            <NavLink to={item.to} className="flex h-full flex-col items-center justify-center gap-1">
              {({ isActive }) => (
                <>
                  <span
                    className={`relative flex h-8 w-16 items-center justify-center rounded-full transition-colors ${isActive
                      ? 'bg-primary text-white dark:bg-teal-400 dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {/* Activa: ícono relleno; inactiva: solo contorno */}
                    <span
                      className="material-symbols-outlined text-[26px]"
                      aria-hidden="true"
                      style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 500` }}
                    >
                      {item.icon}
                    </span>
                    {item.badge > 0 && (
                      <span className="absolute -right-0.5 top-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-700 text-white text-xs font-bold leading-[18px] text-center ring-2 ring-white dark:ring-slate-900">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  <span className={`text-xs ${isActive ? 'font-extrabold text-primary dark:text-teal-400' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                    {item.text}
                  </span>
                  {item.badge > 0 && <span className="sr-only">, {item.badge} sin leer</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
