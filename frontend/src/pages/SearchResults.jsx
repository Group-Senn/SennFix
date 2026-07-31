import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProfessionalCard from '../components/ProfessionalCard';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState({ professionals: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${window.API_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Error en la búsqueda');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Ejecutar inserción de Google Ads cuando finalice la carga sin errores
  useEffect(() => {
    if (!loading && !error) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Ignorar
      }
    }
  }, [loading, error]);

  const hasResults = results.professionals.length > 0 || results.services.length > 0;

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <Link to="/home" className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 truncate">
          Resultados para "{query}"
        </h2>
      </header>

      <main className="flex-1 pb-16 px-4 lg:px-8">
        {loading && <div className="text-center p-10 text-primary/70">Buscando...</div>}
        {error && <div className="text-center p-10 text-red-500">Error: {error}</div>}

        {/* Banner de Publicidad Externa / Google Ads */}
        {!loading && !error && (
          <div className="my-6 flex justify-center">
            <div className="w-full bg-slate-50 dark:bg-slate-900 border border-primary/10 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-4 relative min-h-[90px] flex flex-col items-center justify-center">
              <span className="absolute top-1 right-2 text-[9px] font-bold uppercase tracking-wider text-primary/40 dark:text-slate-500 z-10">Publicidad</span>
              
              <ins className="adsbygoogle"
                   style={{ display: 'block', width: '100%', minHeight: '90px' }}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="YYYYYYYYYY"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 pointer-events-none border border-dashed border-primary/20 dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-2 text-primary/40 dark:text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-sm">ads_click</span>
                  <span>Espacio para Google Ads</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!loading && !error && !hasResults && (
          <div className="text-center p-10 text-primary/70">
            <p className="text-lg font-semibold">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otra palabra clave.</p>
          </div>
        )}

        {!loading && !error && hasResults && (
          <>
            {results.professionals.length > 0 && (
              <section className="pt-6">
                <h3 className="text-lg font-bold text-primary/90 dark:text-slate-200 mb-3">Profesionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.professionals.map(prof => (
                    <ProfessionalCard key={prof.id} professional={prof} />
                  ))}
                </div>
              </section>
            )}

            {results.services.length > 0 && (
              <section className="pt-6">
                <h3 className="text-lg font-bold text-primary/90 dark:text-slate-200 mb-3">Servicios</h3>
                <div className="flex flex-col gap-2">
                  {results.services.map(service => (
                    <Link to={`/services/${encodeURIComponent(service.category)}`} key={service.id} className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 backdrop-blur-sm active:scale-95 transition-transform hover:border-primary/20">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-primary text-2xl">{service.icon}</span></div>
                      <div className="flex-1"><h4 className="font-bold text-slate-900 dark:text-slate-100">{service.name}</h4><p className="text-sm text-slate-500 dark:text-slate-400">{service.category}</p></div>
                      <div className="text-primary/50 dark:text-slate-500"><span className="material-symbols-outlined">chevron_right</span></div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.recommendations && results.recommendations.length > 0 && (
              <section className="pt-6">
                <h3 className="text-lg font-bold text-primary/90 dark:text-slate-200 mb-3">Servicios Recomendados</h3>
                <div className="flex flex-col gap-2">
                  {results.recommendations.map(service => (
                    <Link to={`/services/${encodeURIComponent(service.category)}`} key={service.id} className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 backdrop-blur-sm active:scale-95 transition-transform hover:border-primary/20">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-primary text-2xl">{service.icon || 'settings'}</span></div>
                      <div className="flex-1"><h4 className="font-bold text-slate-900 dark:text-slate-100">{service.name}</h4><p className="text-sm text-slate-500 dark:text-slate-400">{service.category}</p></div>
                      <div className="text-primary/50 dark:text-slate-500"><span className="material-symbols-outlined">chevron_right</span></div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default SearchResults;