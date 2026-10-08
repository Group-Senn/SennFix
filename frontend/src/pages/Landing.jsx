import React from 'react';
import { Link } from 'react-router-dom';
import logoNav from '../assets/logoNav.svg';
import logoNavDark from '../assets/logoNavDark.svg';
import letra from '../assets/letra.svg';
import letraDark from '../assets/letraDark.svg';
import heroHouse from '../assets/hero-house.jpg';
import ThemeSwitcher from '../components/ThemeSwitcher';

function Landing() {
  return (
    <div className="min-h-screen w-full bg-[#F5F8F6] dark:bg-[#120F1A] text-[#2C2B27] dark:text-[#C0C9C4] flex flex-col justify-between relative overflow-x-hidden transition-colors duration-300 font-sans selection:bg-[#043F3B] selection:text-white">
      
      {/* Glows y fondos orgánicos sutiles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#043F3B]/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#2F6E63]/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/4" />

      {/* ============================================================ */}
      {/* 1. NAVBAR / HEADER                                          */}
      {/* ============================================================ */}
      <header className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5 sm:py-6 flex items-center justify-between z-20 relative">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={logoNav} 
            alt="SENN Fix Logo" 
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden" 
          />
          <img 
            src={logoNavDark} 
            alt="SENN Fix Logo" 
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block" 
          />
          <img 
            src={letra} 
            alt="SENN Fix" 
            className="h-5 sm:h-6 w-auto object-contain dark:hidden" 
          />
          <img 
            src={letraDark} 
            alt="SENN Fix" 
            className="h-5 sm:h-6 w-auto object-contain hidden dark:block" 
          />
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Badge Cobertura Santa Cruz */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3EF] dark:bg-[#1E293B] border border-[#043F3B]/10 dark:border-slate-700 text-xs font-semibold text-[#043F3B] dark:text-[#A1D9CD] shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-[#043F3B] dark:text-teal-400">location_on</span>
            <span>Plataforma líder en Santa Cruz</span>
          </div>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Iniciar Sesión Button */}
          <Link 
            to="/login" 
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white dark:bg-[#1E293B] text-[#043F3B] dark:text-[#A1D9CD] font-bold text-xs sm:text-sm border border-[#043F3B]/15 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 cursor-pointer no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Iniciar Sesión</span>
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT                                             */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4 sm:py-6 flex flex-col justify-center z-10 relative">
        
        {/* ========================================================== */}
        {/* HERO SECTION (Text on left, Luxury House graphic on right) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10 lg:mb-14 pt-2">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 sm:space-y-5">
            
            {/* Tag Pill */}
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E5EFEA] dark:bg-teal-500/10 text-[#043F3B] dark:text-[#A1D9CD] text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] border border-[#043F3B]/10 dark:border-teal-500/20 shadow-sm">
              Soluciones a un toque
            </span>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#043F3B] dark:text-white tracking-tight leading-[1.15] font-display">
              ¿Qué deseas hacer hoy en <span className="text-[#043F3B] dark:text-[#53A599]">SENN Fix</span>?
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#043F3B]/75 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Conectamos las necesidades de tu hogar y oficina con los mejores profesionales y técnicos especializados.
            </p>

            {/* 3 Trust Badges Inline */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[#043F3B]/80 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">shield</span>
                <span>Profesionales verificados</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#043F3B]/30 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">bolt</span>
                <span>Respuestas rápidas</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#043F3B]/30 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">location_on</span>
                <span>Cobertura en toda Santa Cruz</span>
              </div>
            </div>
          </div>

          {/* Right Visual Graphic (Luxury House + Doodles + Badges) */}
          <div className="lg:col-span-5 relative flex items-center justify-end pt-12 pb-6 lg:py-6">
            
            {/* Organic background aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#043F3B]/10 to-teal-500/10 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-[3rem] filter blur-2xl -z-10"></div>

            {/* Handwritten Label + Curved Arrow (Floating neatly outside and above house roof) */}
            <div className="absolute -top-6 sm:-top-8 -left-2 sm:-left-6 lg:-left-10 z-30 flex flex-col items-start select-none pointer-events-none">
              <span className="font-handwriting text-2xl sm:text-3xl text-[#043F3B] dark:text-[#A1D9CD] font-bold -rotate-6 drop-shadow-sm leading-tight">
                Tu hogar <br />
                <span className="ml-3">en buenas manos</span>
              </span>
              <svg 
                className="w-14 h-9 text-[#043F3B] dark:text-[#A1D9CD] ml-16 -mt-1 opacity-85" 
                viewBox="0 0 60 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path d="M 8 5 C 22 22, 38 28, 52 24" />
                <path d="M 42 16 L 53 24 L 44 32" />
              </svg>
            </div>

            {/* House Container with Modern Rounded Curve */}
            <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-[2.2rem] sm:rounded-[2.8rem] overflow-hidden shadow-2xl border-4 border-white/90 dark:border-slate-700/90 group mt-4 sm:mt-0">
              <img 
                src={heroHouse} 
                alt="Tu hogar en buenas manos" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#043F3B]/25 via-transparent to-transparent"></div>
            </div>

            {/* Floating Badge: "Profesionales confiables ✔" (Top-right corner overlap) */}
            <div className="absolute -top-2 sm:top-1 -right-2 sm:-right-4 z-30 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl border border-[#043F3B]/10 dark:border-slate-700 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EF] dark:bg-teal-500/20 flex items-center justify-center text-[#043F3B] dark:text-teal-400">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] sm:text-xs font-extrabold text-[#043F3B] dark:text-white leading-tight">Profesionales</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-[#043F3B]/70 dark:text-slate-400 leading-tight">confiables</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                ✓
              </div>
            </div>

            {/* Map Pin on bottom right of house with ripples */}
            <div className="absolute -bottom-5 sm:-bottom-6 right-8 sm:right-12 z-30 flex flex-col items-center">
              {/* Concentric rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-8 rounded-full border-2 border-[#043F3B]/30 dark:border-teal-400/40 animate-ping"></div>
                <div className="w-14 h-7 rounded-full bg-[#E5EFEA] dark:bg-teal-900/60 border border-[#043F3B]/20 dark:border-teal-500/40 flex items-center justify-center shadow-inner">
                  <div className="w-8 h-4 rounded-full bg-[#043F3B]/20 dark:bg-teal-400/30"></div>
                </div>
                {/* Pin Icon */}
                <div className="absolute -top-4 w-9 h-9 rounded-full bg-[#043F3B] text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
              </div>
            </div>

            {/* Floating botanical & sparkle doodles */}
            <div className="absolute -bottom-2 -left-3 text-[#043F3B]/35 dark:text-teal-400/35 pointer-events-none">
              <svg width="45" height="45" viewBox="0 0 50 50" fill="currentColor">
                <path d="M10,40 Q25,35 30,15 Q15,20 10,40 Z" />
                <path d="M15,42 Q32,45 42,28 Q28,28 15,42 Z" opacity="0.6" />
              </svg>
            </div>
            <div className="absolute top-2 right-1/2 text-[#043F3B]/30 dark:text-teal-400/30 pointer-events-none">
              <svg width="30" height="30" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 5 L20 15 M30 10 L25 15 M35 20 L25 20" strokeLinecap="round" />
              </svg>
            </div>
          </div>

        </div>


        {/* ========================================================== */}
        {/* 3. TWO BIG ACTION CARDS (Para Clientes vs Para Especialistas) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
          
          {/* -------------------------------------------------------- */}
          {/* TARJETA 1: BUSCAR AYUDA (Para Clientes)                  */}
          {/* -------------------------------------------------------- */}
          <div className="group bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-[2.2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-9 border border-[#E2EBE5] dark:border-slate-700 shadow-[0_8px_30px_rgba(4,63,59,0.04)] hover:shadow-xl hover:border-[#043F3B]/30 dark:hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle corner decorative circle */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#EAF3EF] dark:bg-teal-500/5 rounded-full pointer-events-none"></div>

            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3EF] dark:bg-slate-700 text-[#043F3B] dark:text-[#A1D9CD] text-[11px] font-bold uppercase tracking-wider border border-[#043F3B]/10 dark:border-slate-600">
                  <span className="material-symbols-outlined text-[15px]">person</span>
                  <span>Para Clientes</span>
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#043F3B] dark:text-white mb-2 sm:mb-3 font-display">
                Buscar Ayuda y Servicios
              </h2>
              <p className="text-xs sm:text-sm text-[#043F3B]/75 dark:text-slate-300 mb-6 leading-relaxed">
                Encuentra plomeros, electricistas, pintores, arquitectos y expertos calificados cerca de ti con presupuestos transparentes y reseñas verificadas.
              </p>

              {/* Card Body: Checklist + Illustration side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center mb-6 sm:mb-8">
                
                {/* Left: Checklist */}
                <div className="sm:col-span-7 space-y-3 sm:space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      Mapa y ubicación en tiempo real cerca de ti
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      Profesionales con perfiles y reseñas reales
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      Chat directo y cotización inmediata
                    </span>
                  </div>
                </div>

                {/* Right: Modern SVG Graphic (Phone + Plumber/Electrician/Painter tools) */}
                <div className="sm:col-span-5 flex items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                    {/* Mint organic blob */}
                    <div className="absolute inset-0 bg-[#E8F3EE] dark:bg-teal-900/20 rounded-full scale-95 transform group-hover:scale-105 transition-transform duration-500"></div>

                    {/* SVG Smartphone & Floating Tools */}
                    <svg viewBox="0 0 160 160" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Floating Water Tap (Plumbing) */}
                      <g className="transform -translate-y-1 transition-transform group-hover:translate-y-0">
                        <circle cx="125" cy="35" r="16" fill="#D2E8DE" />
                        <path d="M120 30 H130 V34 H120 Z M122 34 V38 H125 M127 42 C127 44 125 45 125 45 C125 45 123 44 123 42 C123 41 125 39 125 39 C125 39 127 41 127 42 Z" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#043F3B" />
                      </g>

                      {/* Floating Lightning (Electricity) */}
                      <g className="transform translate-x-1 transition-transform group-hover:translate-x-0">
                        <circle cx="140" cy="80" r="14" fill="#D2E8DE" />
                        <path d="M141 72 L136 81 H141 L139 88 L145 79 H140 L141 72 Z" fill="#043F3B" />
                      </g>

                      {/* Floating Paint Roller */}
                      <g className="transform translate-y-1 transition-transform group-hover:translate-y-0">
                        <circle cx="130" cy="122" r="15" fill="#D2E8DE" />
                        <rect x="123" y="115" width="14" height="6" rx="2" fill="#043F3B" />
                        <path d="M130 121 V129 M127 129 H133" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Smartphone Body */}
                      <rect x="38" y="24" width="62" height="112" rx="12" fill="#043F3B" stroke="#043F3B" strokeWidth="3" />
                      <rect x="42" y="32" width="54" height="96" rx="8" fill="#FFFFFF" />
                      
                      {/* Speaker pill */}
                      <rect x="62" y="27" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.6" />
                      
                      {/* Map routes on phone screen */}
                      <path d="M46 60 Q65 75 75 55 T90 90" stroke="#E2EBE5" strokeWidth="4" strokeLinecap="round" fill="none" />
                      <path d="M46 95 Q65 90 70 110" stroke="#E2EBE5" strokeWidth="3" strokeLinecap="round" fill="none" />
                      
                      {/* Location Pin inside screen */}
                      <g transform="translate(62, 60)">
                        <circle cx="7" cy="7" r="7" fill="#043F3B" />
                        <path d="M7 14 L3.5 8.5 A4 4 0 0 1 10.5 8.5 Z" fill="#043F3B" />
                        <circle cx="7" cy="6" r="2.5" fill="#FFFFFF" />
                      </g>

                      {/* Sparkle lines */}
                      <path d="M24 100 L28 102 M22 108 L27 106 M25 116 L29 112" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Button */}
            <Link 
              to="/home" 
              className="w-full py-4 rounded-2xl bg-[#043F3B] hover:bg-[#07534E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl hover:shadow-[#043F3B]/20 transition-all active:scale-[0.99] cursor-pointer no-underline group-hover:bg-[#054C46]"
            >
              <span>Explorar Profesionales</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>


          {/* -------------------------------------------------------- */}
          {/* TARJETA 2: CONSEGUIR TRABAJO (Para Especialistas)        */}
          {/* -------------------------------------------------------- */}
          <div className="group bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-[2.2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-9 border border-[#E2EBE5] dark:border-slate-700 shadow-[0_8px_30px_rgba(4,63,59,0.04)] hover:shadow-xl hover:border-[#10594F]/40 dark:hover:border-teal-400/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle corner decorative circle */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#EAF3EF] dark:bg-teal-500/5 rounded-full pointer-events-none"></div>

            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3EF] dark:bg-slate-700 text-[#043F3B] dark:text-[#A1D9CD] text-[11px] font-bold uppercase tracking-wider border border-[#043F3B]/10 dark:border-slate-600">
                  <span className="material-symbols-outlined text-[15px]">construction</span>
                  <span>Para Especialistas</span>
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#043F3B] dark:text-white mb-2 sm:mb-3 font-display">
                Conseguir Trabajo y Clientes
              </h2>
              <p className="text-xs sm:text-sm text-[#043F3B]/75 dark:text-slate-300 mb-6 leading-relaxed">
                Únete a la mayor red de técnicos y profesionales. Recibe solicitudes de clientes de tu zona, aumenta tus ingresos y haz crecer tu negocio.
              </p>

              {/* Card Body: Checklist + Illustration side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center mb-6 sm:mb-8">
                
                {/* Left: Checklist */}
                <div className="sm:col-span-7 space-y-3 sm:space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      100% de tus ingresos acordados sin intermediarios
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      Insignia de verificación y portafolio de trabajos
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#043F3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-[#043F3B]/85 dark:text-slate-200">
                      Notificaciones de clientes en tu radio de trabajo
                    </span>
                  </div>
                </div>

                {/* Right: Modern SVG Graphic (Worker with Cap & Rosette Verified Badge) */}
                <div className="sm:col-span-5 flex items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                    {/* Mint organic blob */}
                    <div className="absolute inset-0 bg-[#E8F3EE] dark:bg-teal-900/20 rounded-full scale-95 transform group-hover:scale-105 transition-transform duration-500"></div>

                    {/* SVG Worker Avatar & Rosette Badge */}
                    <svg viewBox="0 0 160 160" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Worker Torso / Apron */}
                      <path d="M42 145 C42 118 55 106 72 104 L88 104 C105 106 118 118 118 145 Z" fill="#043F3B" />
                      {/* Suspenders / straps */}
                      <path d="M58 106 V145" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.5" />
                      <path d="M102 106 V145" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.5" />
                      
                      {/* Neck */}
                      <rect x="73" y="88" width="14" height="18" fill="#F3D5B5" />

                      {/* Head */}
                      <ellipse cx="80" cy="74" rx="18" ry="20" fill="#F3D5B5" />

                      {/* Eyes and friendly smile */}
                      <circle cx="74" cy="74" r="2" fill="#043F3B" />
                      <circle cx="86" cy="74" r="2" fill="#043F3B" />
                      <path d="M76 82 Q80 86 84 82" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" fill="none" />

                      {/* Worker Cap / Gorra */}
                      <path d="M60 65 C60 50 100 50 100 65 Z" fill="#043F3B" />
                      <path d="M56 65 Q80 58 108 65 Q114 67 106 70 Q80 66 56 65 Z" fill="#043F3B" />
                      <circle cx="80" cy="53" r="2.5" fill="#53A599" />

                      {/* Rosette Verified Badge floating */}
                      <g className="transform translate-x-1 -translate-y-1 transition-transform group-hover:translate-x-0 group-hover:translate-y-0">
                        {/* Rosette ribbons */}
                        <path d="M124 104 L121 122 L128 118 L135 122 L132 104 Z" fill="#043F3B" opacity="0.8" />
                        {/* Rosette Scalloped Circle */}
                        <circle cx="128" cy="98" r="16" fill="#043F3B" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx="128" cy="98" r="12" fill="#043F3B" />
                        {/* Checkmark */}
                        <path d="M123 98 L126.5 101.5 L133.5 94.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </g>

                      {/* Sparkle accents */}
                      <path d="M38 68 L42 70 M35 76 L40 74" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      <path d="M120 48 L123 44 M128 48 L132 50" stroke="#043F3B" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Button */}
            <Link 
              to="/register-professional" 
              className="w-full py-4 rounded-2xl bg-[#10594F] hover:bg-[#0D4A41] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl hover:shadow-[#10594F]/20 transition-all active:scale-[0.99] cursor-pointer no-underline"
            >
              <span>Registrarme como Profesional</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>

        </div>


        {/* ========================================================== */}
        {/* 4. VALUE PROPOSITION ROW                                   */}
        {/* ========================================================== */}
        <div className="mt-10 lg:mt-14 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-semibold text-[#043F3B]/70 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">verified_user</span>
            <span>Perfiles verificados y seguros</span>
          </div>

          <div className="h-4 w-px bg-[#043F3B]/15 dark:bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">bolt</span>
            <span>Respuestas y cotizaciones rápidas</span>
          </div>

          <div className="h-4 w-px bg-[#043F3B]/15 dark:bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#043F3B] dark:text-teal-400 text-lg">location_on</span>
            <span>Cobertura en toda Santa Cruz</span>
          </div>
        </div>

      </main>


      {/* ============================================================ */}
      {/* 5. FOOTER & ORGANIC BOTTOM WAVES                            */}
      {/* ============================================================ */}
      <footer className="w-full pt-6 pb-12 text-center text-[#043F3B]/60 dark:text-slate-500 z-10 relative">
        <div className="flex justify-center items-center gap-3">
          <span className="h-px w-12 bg-[#043F3B]/20 dark:bg-slate-700"></span>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#043F3B]/70 dark:text-slate-300">By Group Senn</span>
          <span className="h-px w-12 bg-[#043F3B]/20 dark:bg-slate-700"></span>
        </div>
        <span className="text-[11px] italic font-medium tracking-wider dark:text-slate-400 mt-1 block">
          The limit is yourself
        </span>
      </footer>

      {/* Organic Bottom Wave Accents (Matching mockup bottom flourishes) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-32 overflow-hidden z-0 opacity-90">
        <svg 
          viewBox="0 0 1440 180" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover transform translate-y-6 sm:translate-y-8"
          preserveAspectRatio="none"
        >
          {/* Back Wave Layer */}
          <path 
            d="M-50,140 C150,100 280,180 500,120 C750,50 950,180 1200,100 C1350,50 1450,130 1500,150 L1500,220 L-50,220 Z" 
            fill="#2F6E63" 
            opacity="0.35"
          />
          {/* Front Deep Wave Layer */}
          <path 
            d="M-50,170 C100,120 220,130 380,160 C600,200 780,110 1020,130 C1250,150 1380,80 1500,110 L1500,220 L-50,220 Z" 
            fill="#043F3B" 
            opacity="0.85"
          />
        </svg>
      </div>

    </div>
  );
}

export default Landing;