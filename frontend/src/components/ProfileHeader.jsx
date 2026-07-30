import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
      {/* Cambiamos el Link por un botón que navega hacia atrás en el historial */}
      <button onClick={() => navigate(-1)} className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Perfil Profesional</h2>
    </header>
  );
}

export default ProfileHeader;