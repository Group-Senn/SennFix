import React from 'react';
import { Link } from 'react-router-dom';
import logoNav from '../assets/logoNav.svg';
import logoNavDark from '../assets/logoNavDark.svg';
import letra from '../assets/letra.svg';
import letraDark from '../assets/letraDark.svg';

function DesktopFooter() {
  return (
    <footer className="w-full bg-[#032e2b] text-[#f1eee6]/80 dark:bg-slate-950 dark:text-slate-400 border-t border-primary/10 dark:border-slate-800 py-12 px-8 hidden md:block mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Description */}
        <div className="flex flex-col gap-4">
          <Link to="/home" className="flex items-center gap-2 group">
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
              className="h-4.5 w-auto object-contain dark:hidden" 
            />
            <img 
              src={letraDark} 
              alt="SENN Fix" 
              className="h-4.5 w-auto object-contain hidden dark:block" 
            />
          </Link>
          <p className="text-xs leading-relaxed max-w-[200px] text-[#f1eee6]/60 dark:text-slate-450 mt-1">
            Soluciones profesionales para el hogar y la oficina a un solo toque. Conectamos los mejores profesionales con tus necesidades diarias.
          </p>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="text-sm font-bold text-white dark:text-slate-200 tracking-wide uppercase">Navegación</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/home" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Inicio</Link>
            <Link to="/explore" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Explorar</Link>
            <Link to="/chats" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Chats</Link>
            <Link to="/my-profile" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Perfil</Link>
          </nav>
        </div>

        {/* Legal links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="text-sm font-bold text-white dark:text-slate-200 tracking-wide uppercase">Legal</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/legal/terms-and-conditions" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Términos y Condiciones</Link>
            <Link to="/legal/privacy-policy" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Políticas de Privacidad</Link>
            <Link to="/legal/no-labor-relationship" className="text-xs hover:text-white dark:hover:text-teal-400 transition-colors">Deslinde Laboral</Link>
          </nav>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="text-sm font-bold text-white dark:text-slate-200 tracking-wide uppercase">Soporte y Contacto</h4>
          <div className="flex flex-col gap-2 text-xs text-[#f1eee6]/60 dark:text-slate-450 leading-loose">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] shrink-0 text-white dark:text-slate-400">mail</span>
              soporte@sennfix.com
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] shrink-0 text-white dark:text-slate-400">phone</span>
              +591 71055317
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] shrink-0 text-white dark:text-slate-400">location_on</span>
              Santa Cruz - Bolivia
            </span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto border-t border-white/10 dark:border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#f1eee6]/40 dark:text-slate-500 font-medium">
        <span>&copy; {new Date().getFullYear()} Group Senn. Todos los derechos reservados.</span>
        <span className="italic tracking-wider uppercase">The limit is yourself</span>
      </div>
    </footer>
  );
}

export default DesktopFooter;
