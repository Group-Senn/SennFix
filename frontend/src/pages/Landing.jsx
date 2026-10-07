import React from 'react';
import { Link } from 'react-router-dom';
import javaLogo from '../assets/JAVA LOGO.svg';
import javaLogoV2 from '../assets/JAVA LOGO V2.svg';
import logoNav from '../assets/logoNav.svg';
import logoNavDark from '../assets/logoNavDark.svg';
import letra from '../assets/letra.svg';
import letraDark from '../assets/letraDark.svg';
import ThemeSwitcher from '../components/ThemeSwitcher';

// Componente interno para los botones de acción principales (Mobile)
const LandingButton = ({ to, children, primary = false, className = '' }) => {
  const baseClasses = "w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 text-lg font-bold text-white";
  
  const variantClasses = primary
    ? "bg-primary dark:bg-inverse-primary hover:bg-primary/90 dark:hover:bg-inverse-primary/90"
    : "bg-inverse-primary dark:bg-primary-container hover:bg-inverse-primary/90 dark:hover:bg-primary-container/90";

  return (
    <Link to={to} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </Link>
  );
};

function Landing() {
  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex flex-col justify-between transition-colors duration-300">
      
      {/* ============================================================ */}
      {/* 📱 VISTA MÓVIL (Se mantiene idéntica para pantallas < md)      */}
      {/* ============================================================ */}
      <div className="flex md:hidden flex-col items-center justify-between min-h-screen p-8 text-center">
        {/* Middle Content */}
        <div className="flex flex-col items-center justify-center grow w-full">
          <div className="flex flex-col items-center gap-6 w-full">
            <img 
              src={javaLogo} 
              alt="SENN Fix Logo" 
              className="w-4/5 max-w-[280px] sm:max-w-[360px] aspect-square object-contain mx-auto transition-all dark:hidden" 
            />
            <img 
              src={javaLogoV2} 
              alt="SENN Fix Logo" 
              className="w-4/5 max-w-[280px] sm:max-w-[360px] aspect-square object-contain mx-auto transition-all hidden dark:block" 
            />
            <p className="text-primary/60 dark:text-[#C0C9C4]/80 text-sm font-medium tracking-[0.2em] mt-2 text-center uppercase">
              Soluciones a un toque
            </p>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="w-full max-w-xs">
          <div className="space-y-4">
            <LandingButton to="/home" primary>
              <span className="material-symbols-outlined">search</span>
              <span>Buscar Ayuda</span>
            </LandingButton>
            <LandingButton to="/register-professional">
              <span className="material-symbols-outlined">construction</span>
              <span>Conseguir Trabajo</span>
            </LandingButton>
          </div>

          <div className="flex flex-col items-center gap-1 pt-8 text-primary/40 dark:text-white/40">
            <div className="flex justify-center items-center gap-2 w-full">
              <span className="h-px w-8 bg-primary/20 dark:bg-white/20"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/60 dark:text-white">By Group Senn</span>
              <span className="h-px w-8 bg-primary/20 dark:bg-white/20"></span>
            </div>
            <span className="text-[10px] italic font-medium tracking-wider dark:text-white/70">The limit is yourself</span>
          </div>
        </div>
      </div>


      {/* ============================================================ */}
      {/* 💻 VISTA DESKTOP (Ultra moderna, espaciosa y atractiva >= md) */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col min-h-screen w-full relative overflow-hidden">
        
        {/* Glows de fondo decorativos */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-inverse-primary/15 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Desktop */}
        <header className="w-full max-w-7xl mx-auto px-10 py-6 flex items-center justify-between z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoNav} alt="SENN Fix Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden" />
            <img src={logoNavDark} alt="SENN Fix Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block" />
            <img src={letra} alt="SENN Fix" className="h-6 w-auto object-contain dark:hidden" />
            <img src={letraDark} alt="SENN Fix" className="h-6 w-auto object-contain hidden dark:block" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 dark:bg-slate-800 border border-primary/10 dark:border-slate-700 text-xs font-semibold text-primary/80 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Plataforma líder en Bolivia</span>
            </div>

            <ThemeSwitcher />

            <Link 
              to="/login" 
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-primary dark:text-teal-400 font-bold text-xs border border-primary/10 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-primary/5 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 cursor-pointer no-underline"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </header>

        {/* 2. Hero & Selector Principal */}
        <main className="flex-1 max-w-6xl mx-auto px-8 py-8 flex flex-col items-center justify-center z-10 w-full">
          
          {/* Título y Lema Central */}
          <div className="text-center max-w-2xl mb-12 space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-primary/70 dark:text-teal-400 bg-primary/5 dark:bg-teal-500/10 px-4 py-1.5 rounded-full border border-primary/10 dark:border-teal-500/20">
              Soluciones a un toque
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-primary dark:text-slate-100 tracking-tight leading-tight">
              ¿Qué deseas hacer hoy en <span className="text-primary dark:text-teal-400">SENN Fix</span>?
            </h1>
            <p className="text-base text-primary/65 dark:text-slate-400 leading-relaxed font-medium">
              Conectamos las necesidades de tu hogar y oficina con los mejores profesionales y técnicos especializados.
            </p>
          </div>

          {/* 3. Las 2 Tarjetas Interactivas Lado a Lado (Grid Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* TARJETA 1: BUSCAR AYUDA (Para Clientes) */}
            <div className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-8 border border-primary/10 dark:border-slate-700/80 shadow-lg hover:shadow-2xl hover:border-primary/40 dark:hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Icono + Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-teal-500/20 flex items-center justify-center text-primary dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">search</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-teal-400 bg-primary/5 dark:bg-slate-700 px-3 py-1 rounded-full border border-primary/10 dark:border-slate-600">
                    Para Clientes
                  </span>
                </div>

                {/* Textos */}
                <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mb-2">
                  Buscar Ayuda y Servicios
                </h2>
                <p className="text-sm text-primary/70 dark:text-slate-400 mb-6 leading-relaxed">
                  Encuentra plomeros, electricistas, pintores, arquitectos y expertos calificados cerca de ti con presupuestos transparentes y reseñas verificadas.
                </p>

                {/* Beneficios */}
                <ul className="space-y-2.5 mb-8 text-xs font-semibold text-primary/80 dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">check_circle</span>
                    <span>Mapa y ubicación en tiempo real cerca de ti</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">check_circle</span>
                    <span>Profesionales con perfiles y reseñas reales</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">check_circle</span>
                    <span>Chat directo y cotización inmediata</span>
                  </li>
                </ul>
              </div>

              {/* Botón Acción */}
              <Link 
                to="/home" 
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm lg:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-98 cursor-pointer no-underline group-hover:bg-primary/95"
              >
                <span>Explorar Profesionales</span>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>

            {/* TARJETA 2: CONSEGUIR TRABAJO (Para Profesionales) */}
            <div className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-8 border border-primary/10 dark:border-slate-700/80 shadow-lg hover:shadow-2xl hover:border-secondary/40 dark:hover:border-teal-400/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Icono + Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 dark:bg-emerald-500/20 flex items-center justify-center text-secondary dark:text-teal-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">construction</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-teal-300 bg-secondary/5 dark:bg-slate-700 px-3 py-1 rounded-full border border-secondary/15 dark:border-slate-600">
                    Para Especialistas
                  </span>
                </div>

                {/* Textos */}
                <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mb-2">
                  Conseguir Trabajo y Clientes
                </h2>
                <p className="text-sm text-primary/70 dark:text-slate-400 mb-6 leading-relaxed">
                  Únete a la mayor red de técnicos y profesionales. Recibe solicitudes de clientes de tu zona, aumenta tus ingresos y haz crecer tu negocio.
                </p>

                {/* Beneficios */}
                <ul className="space-y-2.5 mb-8 text-xs font-semibold text-primary/80 dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400">check_circle</span>
                    <span>100% de tus ingresos acordados sin intermediarios</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400">check_circle</span>
                    <span>Insignia de verificación y portafolio de trabajos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400">check_circle</span>
                    <span>Notificaciones de clientes en tu radio de trabajo</span>
                  </li>
                </ul>
              </div>

              {/* Botón Acción */}
              <Link 
                to="/register-professional" 
                className="w-full py-4 rounded-2xl bg-secondary hover:bg-secondary/90 dark:bg-primary-container dark:hover:bg-primary-container/90 text-white font-bold text-sm lg:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:shadow-secondary/20 transition-all active:scale-98 cursor-pointer no-underline"
              >
                <span>Registrarme como Profesional</span>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>

          </div>

          {/* 4. Trust Badges en Desktop */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-primary/60 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">verified_user</span>
              <span>Perfiles verificados y seguros</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary/20 dark:bg-slate-600 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg">bolt</span>
              <span>Respuestas y cotizaciones rápidas</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-primary/20 dark:bg-slate-600 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">location_on</span>
              <span>Cobertura en toda Bolivia</span>
            </div>
          </div>

        </main>

        {/* 5. Footer Desktop */}
        <footer className="w-full py-6 text-center text-primary/40 dark:text-slate-500 z-10 border-t border-primary/5 dark:border-slate-800">
          <div className="flex justify-center items-center gap-3">
            <span className="h-px w-12 bg-primary/15 dark:bg-slate-700"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/60 dark:text-slate-300">By Group Senn</span>
            <span className="h-px w-12 bg-primary/15 dark:bg-slate-700"></span>
          </div>
          <span className="text-[11px] italic font-medium tracking-wider dark:text-slate-400 mt-1 block">The limit is yourself</span>
        </footer>

      </div>

    </div>
  );
}

export default Landing;