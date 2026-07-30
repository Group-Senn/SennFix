import React from 'react';

function AdBanner() {
  return (
    <section className="mt-6 mb-8">
      <div className="relative flex items-center gap-4 bg-primary/5 dark:bg-slate-700/30 p-4 rounded-xl border-2 border-dashed border-primary/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary/10 px-2 py-0.5 rounded-bl-lg">
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Anuncio</span>
        </div>
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-primary dark:text-slate-100 text-sm">Pollo Loco</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">"Disfruta tu cuarto de pollo con tu salsa en botella"</p>
          <button className="mt-2 text-primary font-bold text-[10px] uppercase tracking-widest border-b border-primary">Visitar tienda</button>
        </div>
      </div>
    </section>
  );
}

export default AdBanner;