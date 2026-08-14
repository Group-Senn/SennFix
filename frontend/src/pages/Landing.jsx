import React from 'react';
import { Link } from 'react-router-dom';
import javaLogo from '../assets/JAVA LOGO.svg';
import javaLogoV2 from '../assets/JAVA LOGO V2.svg';

// Componente interno para los botones de acción principales
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
    <div className="flex flex-col items-center justify-between min-h-screen p-8 text-center bg-background-light dark:bg-background-dark">
      {/* Middle Content (grows to fill space) */}
      <div className="flex flex-col items-center justify-center grow w-full">
        <div className="flex flex-col items-center gap-6 w-full">
          <img src={javaLogo} alt="SENN Fix Logo" className="w-4/5 max-w-[280px] sm:max-w-[360px] md:max-w-[420px] aspect-square object-contain mx-auto transition-all dark:hidden" />
          <img src={javaLogoV2} alt="SENN Fix Logo" className="w-4/5 max-w-[280px] sm:max-w-[360px] md:max-w-[420px] aspect-square object-contain mx-auto transition-all hidden dark:block" />
          {/* 1. Lema actualizado */}
          <p className="text-primary/60 dark:text-[#C0C9C4]/80 text-sm font-medium tracking-[0.2em] mt-2 text-center uppercase">Soluciones a un toque</p>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="w-full max-w-xs">
        {/* Action Buttons Section */}
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

        {/* 2. Footer "By Group Senn" */}
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
  );
}

export default Landing;