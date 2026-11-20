import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import CredentialResults from '../components/CredentialResults';

function ProfessionalsByCategoryPage() {
  const params = useParams();
  const categoryName = params['*'] || '';
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${window.API_URL}/api/professionals?specialty=${encodeURIComponent(categoryName)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProfessionals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar profesionales del oficio:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-10">
      <Link to="/services" className="-ml-2 mb-2 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-primary dark:text-teal-400">
        <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
        Todos los oficios
      </Link>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-white">{categoryName}</h1>

      <div className="mt-6">
        {error ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
            <p className="font-semibold text-ink dark:text-slate-100">No pudimos cargar a los profesionales.</p>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">Revisa tu conexión e inténtalo de nuevo.</p>
            <button onClick={fetchProfessionals} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">
              Reintentar
            </button>
          </div>
        ) : (
          <CredentialResults
            professionals={professionals}
            loading={loading}
            empty={
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                <p className="font-semibold text-ink dark:text-slate-100">Aún no hay profesionales en este oficio.</p>
                <p className="mt-1 text-sm text-muted dark:text-slate-400">Prueba con un oficio parecido o vuelve pronto.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link to="/services" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">Ver todos los oficios</Link>
                  <Link to="/register-professional" className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-primary dark:text-teal-400">
                    ¿Trabajas en esto? Regístrate
                  </Link>
                </div>
              </div>
            }
          />
        )}
      </div>
    </main>
  );
}

export default ProfessionalsByCategoryPage;
