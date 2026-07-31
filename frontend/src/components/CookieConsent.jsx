import React, { useState, useEffect } from 'react';

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const consent = localStorage.getItem('senn_cookies_consent');
    if (!consent) {
      // Retrasar la aparición del banner para una transición más elegante
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('senn_cookies_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('senn_cookies_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999] animate-slide-up">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-primary/10 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
        
        {/* Adorno brillante de fondo */}
        <div className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 size-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Cabecera y Contenido */}
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 dark:bg-teal-500/10 text-primary dark:text-teal-400 flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-2xl animate-spin-slow">cookie</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-primary dark:text-slate-100 flex items-center gap-1.5">
              Uso de Cookies
            </h4>
            <p className="text-xs leading-relaxed text-primary/70 dark:text-slate-350">
              En <strong>SENN FIX</strong> utilizamos cookies propias y de terceros (como Google AdSense y analíticas) para personalizar tu experiencia, recordar tus preferencias y mostrarte anuncios relevantes según tu perfil profesional o de cliente.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 mt-1 justify-end">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-bold text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 transition-colors bg-transparent border-none cursor-pointer"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 bg-primary dark:bg-teal-600 hover:bg-primary/95 dark:hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Aceptar Cookies
          </button>
        </div>

      </div>
    </div>
  );
}

export default CookieConsent;
