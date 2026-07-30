import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BottomNav() {
  const { user } = useAuth();
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

  // Encontramos el índice del ítem activo para saber dónde posicionar el indicador.
  const activeIndex = navItems.findIndex(item => {
    const baseTo = item.to.split('?')[0];
    if (item.to.includes('?')) {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = new URLSearchParams(item.to.split('?')[1]).get('tab');
      return location.pathname === baseTo && searchParams.get('tab') === tabParam;
    }
    return location.pathname === baseTo;
  });

  return (
    // Contenedor principal que se fija en la parte inferior en móviles
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 p-4">
      <div className="w-full max-w-sm h-[70px] bg-primary rounded-xl shadow-lg"> {/* La barra en sí */}
        <ul className="relative flex h-full">
          {/* El indicador circular "mágico" */}
          <div
            className="absolute -top-1/2 w-[70px] h-[70px] bg-primary rounded-full border-[6px] border-background-light dark:border-background-dark transition-all duration-300 ease-in-out"
            style={{
              // Calculamos la posición para centrar el círculo debajo del ítem activo
              left: `calc(${(activeIndex * 25) + 12.5}% - 35px)`,
              // Ocultamos el indicador si no estamos en ninguna de las rutas principales
              display: activeIndex === -1 ? 'none' : 'block',
            }}
          >
            {/* Estos spans crean el efecto de "inmersión" usando sombras que imitan el color de fondo */}
            <span className="absolute top-1/2 left-[-22px] w-[20px] h-[20px] bg-transparent rounded-tr-[20px] shadow-[1px_-10px_0_0_var(--color-background-light)] dark:shadow-[1px_-10px_0_0_var(--color-background-dark)]"></span>
            <span className="absolute top-1/2 right-[-22px] w-[20px] h-[20px] bg-transparent rounded-tl-[20px] shadow-[-1px_-10px_0_0_var(--color-background-light)] dark:shadow-[-1px_-10px_0_0_var(--color-background-dark)]"></span>
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
                      className={`material-symbols-outlined !text-3xl transition-transform duration-300 ease-in-out ${
                        isActive
                          ? 'text-white -translate-y-[35px]' // El ícono activo sube y cambia de color
                          : 'text-white group-hover:text-white/80'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-xs font-normal tracking-wide transition-opacity duration-300 ease-in-out ${
                        isActive
                          ? 'absolute opacity-100 translate-y-[10px] text-primary' // El texto activo aparece
                          : 'text-white' // El texto inactivo ahora es visible
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