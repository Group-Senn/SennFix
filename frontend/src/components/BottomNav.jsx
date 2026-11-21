import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Dock flotante de celular: el indicador amarillo se desliza a la pestaña activa y el mapa
// (lo que más se usa para encontrar a alguien cerca) es el botón central, el más fácil de alcanzar con el pulgar
const TABS = [
  { to: '/home', icon: 'home', text: 'Inicio' },
  { to: '/explore', icon: 'explore', text: 'Explorar' },
  { to: '/map', icon: 'location_on', text: 'Cerca', center: true },
  { to: '/chats', icon: 'forum', text: 'Chats' },
  { to: '/my-profile', icon: 'person', text: 'Perfil' },
];

function BottomNav() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { pathname } = useLocation();

  if (user && user.user_type === 'admin') {
    return null;
  }

  const unreadChats = notifications.filter(n => !n.is_read && n.type === 'new_message').length;
  const activeIndex = TABS.findIndex(t => pathname === t.to || pathname.startsWith(`${t.to}/`));
  const showIndicator = activeIndex >= 0 && !TABS[activeIndex].center;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[1100] md:hidden rounded-[26px] bg-primary ring-1 ring-white/10 shadow-[0_10px_30px_rgba(4,63,59,0.35)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
    >
      {/* Indicador deslizante: se mueve con un pequeño rebote al cambiar de pestaña */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-2 flex w-1/5 justify-center transition-[left,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showIndicator ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: `${Math.max(activeIndex, 0) * 20}%` }}
      >
        <span className="h-8 w-14 rounded-full bg-casco" />
      </span>

      <ul className="relative grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const badge = tab.to === '/chats' ? unreadChats : 0;
          return (
            <li key={tab.to} className="list-none">
              <NavLink
                to={tab.to}
                aria-label={badge > 0 ? `${tab.text}, ${badge} sin leer` : tab.text}
                className="group flex h-full flex-col items-center justify-end gap-0.5 pb-2"
              >
                {({ isActive }) => (
                  <>
                    {tab.center ? (
                      <span
                        className={`-mt-7 mb-0.5 flex size-14 items-center justify-center rounded-full bg-casco text-primary ring-[5px] ring-surface dark:ring-background-dark shadow-lg transition-transform duration-150 group-active:scale-90 ${isActive ? 'animate-nav-pop' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[30px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                          {tab.icon}
                        </span>
                      </span>
                    ) : (
                      <span className="relative flex h-8 w-14 items-center justify-center transition-transform duration-150 group-active:scale-90">
                        <span
                          className={`material-symbols-outlined text-[26px] ${isActive ? 'text-primary animate-nav-pop' : 'text-white/75'}`}
                          aria-hidden="true"
                          style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 600 : 400}` }}
                        >
                          {tab.icon}
                        </span>
                        {badge > 0 && (
                          <span className="absolute right-1 -top-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-xs font-bold leading-[18px] text-center ring-2 ring-primary">
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </span>
                    )}
                    <span className={`text-xs leading-none ${isActive ? 'font-extrabold text-white' : 'font-semibold text-white/75'}`}>
                      {tab.text}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
