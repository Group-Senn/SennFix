import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CredentialResults from '../components/CredentialResults';
import AdBanner from '../components/AdBanner';
import { POPULAR_TRADES } from '../utils/trades';

// Enlace a un oficio. Va al oficio (service.name), no al rubro: antes llevaba a "/services/Hogar", siempre vacío
function TradeLink({ name, icon, label }) {
  return (
    <Link
      to={`/services/${name}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-ink dark:text-slate-200 hover:border-primary dark:hover:border-teal-400 transition-colors"
    >
      <span className="material-symbols-outlined text-lg text-primary dark:text-teal-400" aria-hidden="true">{icon || 'handyman'}</span>
      {label || name}
    </Link>
  );
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ professionals: [], services: [], recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${window.API_URL}/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults({ professionals: [], services: [], recommendations: [], ...data });
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const nothingFound = !loading && !error && results.professionals.length === 0 && results.services.length === 0;

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-10">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-white">
        {query ? `Resultados para «${query}»` : 'Buscar'}
      </h1>
      <div className="max-w-2xl">
        <SearchBar />
      </div>

      {!query ? (
        <p className="mt-4 text-muted dark:text-slate-400">Escribe qué necesitas: un oficio, un nombre o un trabajo.</p>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <p className="font-semibold text-ink dark:text-slate-100">No pudimos completar la búsqueda.</p>
          <p className="mt-1 text-sm text-muted dark:text-slate-400">Revisa tu conexión e inténtalo de nuevo.</p>
          <button onClick={fetchResults} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">
            Reintentar
          </button>
        </div>
      ) : nothingFound ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
          <p className="font-semibold text-ink dark:text-slate-100">No encontramos nada para «{query}».</p>
          <p className="mt-1 text-sm text-muted dark:text-slate-400">Prueba con otra palabra o elige uno de los oficios más pedidos:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR_TRADES.map(trade => <TradeLink key={trade.name} {...trade} />)}
          </div>
          <Link to="/services" className="mt-4 inline-block text-sm font-bold text-primary dark:text-teal-400 underline">Ver todos los oficios</Link>
        </div>
      ) : (
        <>
          {results.services.length > 0 && (
            <section className="mt-6" aria-labelledby="oficios-encontrados">
              <h2 id="oficios-encontrados" className="mb-3 text-xl font-extrabold text-primary dark:text-white">Oficios</h2>
              <div className="flex flex-wrap gap-2">
                {results.services.map(service => <TradeLink key={service.id} name={service.name} icon={service.icon} />)}
              </div>
            </section>
          )}

          <section className="mt-8" aria-labelledby="profesionales-encontrados">
            <h2 id="profesionales-encontrados" className="mb-3 text-xl font-extrabold text-primary dark:text-white">Profesionales</h2>
            <CredentialResults
              professionals={results.professionals}
              loading={loading}
              empty={
                <p className="text-muted dark:text-slate-400">
                  Ningún profesional coincide con «{query}» por ahora. Revisa los oficios de arriba.
                </p>
              }
            />
          </section>

          <AdBanner />

          {results.recommendations?.length > 0 && (
            <section className="mt-8" aria-labelledby="tambien-sirve">
              <h2 id="tambien-sirve" className="mb-3 text-xl font-extrabold text-primary dark:text-white">También te puede servir</h2>
              <div className="flex flex-wrap gap-2">
                {results.recommendations.map(service => <TradeLink key={service.id} name={service.name} icon={service.icon} />)}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default SearchResults;
