import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function BottomNav() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const isAdmin = user && user.user_type === 'admin';

  if (isAdmin) {
    return null;
  }

  const navItems = [
    { to: '/home', icon: 'home', text: 'Inicio' },
    { to: '/explore', icon: 'explore', text: 'Explorar' },
    { to: '/chats', icon: 'forum', text: 'Chats' },
    { to: '/my-profile', icon: 'person', text: 'Perfil' },
  ];
  const activeIndex = navItems.findIndex(item => {
    const baseTo = item.to.split('?')[0];
    if (item.to.includes('?')) {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = new URLSearchParams(item.to.split('?')[1]).get('tab');
      return location.pathname === baseTo && searchParams.get('tab') === tabParam;
    }
    return location.pathname === baseTo;
  });

  const activeBgColor = theme === 'dark' ? '#120F1A' : '#FCF9F0';

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 p-4">
      <div className="w-full max-w-sm h-[70px] bg-primary/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 dark:border-slate-800">
        <ul className="relative flex h-full">
          <div
            className="absolute -top-1/2 w-[70px] h-[70px] bg-primary rounded-full transition-all duration-300 ease-in-out bottom-nav-circle"
            style={{
              left: `calc(${(activeIndex * 25) + 12.5}% - 35px)`,
              display: activeIndex === -1 ? 'none' : 'block',
            }}
          >
            <span className="absolute top-1/2 left-[-22px] w-[20px] h-[20px] bg-transparent rounded-tr-[20px] bottom-nav-cutout-left"></span>
            <span className="absolute top-1/2 right-[-22px] w-[20px] h-[20px] bg-transparent rounded-tl-[20px] bottom-nav-cutout-right"></span>
          </div>

          {navItems.map((item) => (
            <li key={item.to} className="relative flex-1 h-full list-none z-10">
              <NavLink
                to={item.to}
                className="relative flex flex-col justify-center items-center w-full h-full text-center font-semibold group"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined !text-3xl transition-transform duration-300 ease-in-out ${isActive
                          ? 'text-white -translate-y-[35px]'
                          : 'text-white group-hover:text-white/80'
                        }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-xs font-normal tracking-wide transition-opacity duration-300 ease-in-out ${isActive
                          ? 'opacity-0 pointer-events-none absolute'
                          : 'text-white opacity-100'
                        }`}
                    >
                      {item.text}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BottomNav;