import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ColdStartNote from '../components/ColdStartNote';

const CACHE_KEY = 'senn_services_cache';

// Última lista guardada: la lista de oficios casi no cambia, así que se muestra al instante y se actualiza detrás
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(cached) ? cached : null;
  } catch {
    return null;
  }
}

// Compara sin tildes ni mayúsculas: "albanil" encuentra "Albañil"
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function AllServices() {
  const [services, setServices] = useState(() => readCache() || []);
  const [loading, setLoading] = useState(() => !readCache());
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  const fetchServices = async () => {
    setError(false);
    if (!readCache()) setLoading(true);
    try {
      const response = await fetch(window.API_URL + '/api/services');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setServices(list);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));
      } catch {
        // Sin espacio o modo privado: se sigue sin caché
      }
    } catch (err) {
      console.error('Error al obtener los oficios:', err);
      // Si ya hay una lista guardada se sigue mostrando en vez de reemplazarla por un error
      if (!readCache()) setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtra por nombre o rubro y agrupa por rubro
  const groups = useMemo(() => {
    const term = normalize(query.trim());
    const filtered = term
      ? services.filter(s => normalize(`${s.name} ${s.category || ''}`).includes(term))
      : services;
    return filtered.reduce((acc, service) => {
      const category = service.category || 'Otros';
      (acc[category] ||= []).push(service);
      return acc;
    }, {});
  }, [services, query]);

  const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-10">
      <Link to="/home" className="md:hidden -ml-2 mb-2 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-primary dark:text-teal-400">
        <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
        Inicio
      </Link>

      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-white">Todos los oficios</h1>
      <p className="mt-2 text-muted dark:text-slate-400">Elige un oficio para ver quién trabaja en Santa Cruz.</p>

      <div className="relative mt-5 max-w-xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted dark:text-slate-400" aria-hidden="true">search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar un oficio"
          placeholder="Buscar un oficio, por ejemplo plomero"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-12 pr-4 text-base text-ink dark:text-slate-100 placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-teal-400/30"
        />
      </div>

      {loading ? (
        <>
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando oficios">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <ColdStartNote />
        </>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <p className="font-semibold text-ink dark:text-slate-100">No pudimos cargar los oficios.</p>
          <p className="mt-1 text-sm text-muted dark:text-slate-400">Revisa tu conexión e inténtalo de nuevo.</p>
          <button onClick={fetchServices} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">
            Reintentar
          </button>
        </div>
      ) : total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <p className="font-semibold text-ink dark:text-slate-100">No encontramos «{query}».</p>
          <p className="mt-1 text-sm text-muted dark:text-slate-400">Prueba con otra palabra o mira todos los oficios.</p>
          <button onClick={() => setQuery('')} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">
            Ver todos los oficios
          </button>
        </div>
      ) : (
        <>
          <p className="sr-only" role="status">{total} {total === 1 ? 'oficio' : 'oficios'}</p>
          {Object.entries(groups).map(([category, list]) => (
            <section key={category} className="mt-8" aria-labelledby={`rubro-${category}`}>
              <h2 id={`rubro-${category}`} className="mb-3 text-xl font-extrabold text-primary dark:text-white">
                {category} <span className="text-base font-semibold text-muted dark:text-slate-400">· {list.length}</span>
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {list.map(service => (
                  <li key={service.id}>
                    <Link
                      to={`/services/${service.name}`}
                      className="flex h-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 hover:border-primary dark:hover:border-teal-400 transition-colors"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/5 dark:bg-teal-400/10">
                        <span className="material-symbols-outlined text-2xl text-primary dark:text-teal-400" aria-hidden="true">{service.icon}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug text-ink dark:text-slate-100">{service.name}</span>
                        {typeof service.prof_count === 'number' && (
                          <span className={`block text-xs ${service.prof_count > 0 ? 'font-semibold text-primary dark:text-teal-400' : 'text-muted dark:text-slate-400'}`}>
                            {service.prof_count === 0
                              ? 'Aún sin profesionales'
                              : `${service.prof_count} ${service.prof_count === 1 ? 'profesional' : 'profesionales'}`}
                          </span>
                        )}
                      </span>
                      <span className="material-symbols-outlined shrink-0 text-muted dark:text-slate-500" aria-hidden="true">chevron_right</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  );
}

export default AllServices;
