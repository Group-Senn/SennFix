import React from 'react';
import { Link } from 'react-router-dom';
import logoNavDark from '../assets/logoNavDark.svg';
import letraDark from '../assets/letraDark.svg';

const linkClass = 'text-sm text-white/80 hover:text-white hover:underline transition-colors';

// Pie de página de escritorio: en celular no existe (ahí está la barra de pestañas)
function DesktopFooter() {
  return (
    <footer className="hidden md:block w-full bg-primary dark:bg-slate-950 text-white/80 border-t border-white/10">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-8 px-8 py-10">
        <div>
          <Link to="/home" className="inline-flex items-center gap-2" aria-label="SENN Fix, inicio">
            <img src={logoNavDark} alt="" className="h-9 w-auto" />
            <img src={letraDark} alt="" className="h-6 w-auto" />
          </Link>
          <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-white/70">
            Soluciones profesionales para el hogar y la oficina a un solo toque. Conectamos a los mejores profesionales con tus necesidades diarias.
          </p>
        </div>

        <nav aria-label="Navegación del pie de página">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">Navegación</h2>
          <ul className="mt-3 space-y-2">
            <li><Link to="/home" className={linkClass}>Inicio</Link></li>
            <li><Link to="/explore" className={linkClass}>Explorar</Link></li>
            <li><Link to="/map" className={linkClass}>Mapa</Link></li>
            <li><Link to="/services" className={linkClass}>Todos los oficios</Link></li>
            <li><Link to="/chats" className={linkClass}>Chats</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">Legal</h2>
          <ul className="mt-3 space-y-2">
            <li><Link to="/legal/terms-and-conditions" className={linkClass}>Términos y Condiciones</Link></li>
            <li><Link to="/legal/privacy-policy" className={linkClass}>Políticas de Privacidad</Link></li>
            <li><Link to="/legal/no-labor-relationship" className={linkClass}>Deslinde Laboral</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">Soporte y contacto</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
              <a href="mailto:soporte@sennfix.com" className={linkClass}>soporte@sennfix.com</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" aria-hidden="true">call</span>
              <a href="tel:+59171055317" className={linkClass}>+591 71055317</a>
            </li>
            <li className="flex items-center gap-2 text-white/80">
              <span className="material-symbols-outlined text-lg" aria-hidden="true">location_on</span>
              Santa Cruz, Bolivia
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-4 text-xs text-white/70">
          <span>© {new Date().getFullYear()} Group Senn. Todos los derechos reservados.</span>
          <span className="italic tracking-wider">The limit is yourself</span>
        </div>
      </div>
    </footer>
  );
}

export default DesktopFooter;
