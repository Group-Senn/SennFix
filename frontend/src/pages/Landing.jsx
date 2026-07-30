import React from 'react';
import { Link } from 'react-router-dom';
import isotipo from '../assets/logo verde.svg'; // Isotipo (símbolo)
import logotipo from '../assets/logotipo verde.svg'; // Logotipo (texto)

// Componente interno para los botones de acción principales
const LandingButton = ({ to, children, primary = false, className = '' }) => {
  const baseClasses = "w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 text-lg font-bold";
  
  const variantClasses = primary
    ? "bg-primary hover:bg-primary/90 text-white shadow-xl"
    : "bg-white/80 dark:bg-slate-800/80 border border-primary/20 hover:bg-white dark:hover:bg-slate-800 text-primary";

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
      <div className="flex flex-col items-center justify-center grow">
        <div className="flex flex-col items-center gap-6">
          <img src={isotipo} alt="SENN Fix Isotipo" className="h-48 w-48" />
          <img src={logotipo} alt="SENN Fix Logotipo" className="h-52" />
          {/* 1. Lema actualizado */}
          <p className="text-primary/60 text-sm font-medium tracking-[0.2em] mt-2 text-center uppercase">Soluciones a un toque</p>
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

        {/* 2. Footer "By SENN INDUSTRIES" */}
        <div className="flex justify-center items-center gap-2 text-primary/40 pt-8">
          <span className="h-px w-8 bg-primary/20"></span>
          <span className="text-xs font-semibold uppercase tracking-widest">By SENN industries</span>
          <span className="h-px w-8 bg-primary/20"></span>
        </div>
      </div>
    </div>
  );
}

export default Landing;