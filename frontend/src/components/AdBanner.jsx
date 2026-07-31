import React, { useEffect } from 'react';

function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Ignorar errores si no se ha cargado AdSense en producción
    }
  }, []);

  return (
    <section className="mt-6 mb-8 w-full flex justify-center">
      <div className="w-full bg-slate-50 dark:bg-slate-900 border border-primary/10 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-4 relative min-h-[90px] flex flex-col items-center justify-center">
        <span className="absolute top-1 right-2 text-[9px] font-bold uppercase tracking-wider text-primary/40 dark:text-slate-500 z-10">Publicidad</span>
        
        {/* Google AdSense Responsive Slot */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '90px' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Reemplazar con ID de cliente real en producción
             data-ad-slot="XXXXXXXXXX"               // Reemplazar con ID de slot real
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        
        {/* Marcador de posición visual si Adsense no carga */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 pointer-events-none border border-dashed border-primary/20 dark:border-slate-700 rounded-xl">
          <div className="flex items-center gap-2 text-primary/40 dark:text-slate-500 text-xs">
            <span className="material-symbols-outlined text-sm">ads_click</span>
            <span>Espacio para Google Ads</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdBanner;