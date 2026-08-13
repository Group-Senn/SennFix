import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProfessionalCard from '../components/ProfessionalCard';
import ProfessionalCardSkeleton from '../components/ProfessionalCardSkeleton';

function ProfessionalsByCategoryPage() {
  const params = useParams();
  const categoryName = params['*'] || '';
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${window.API_URL}/api/professionals?specialty=${encodeURIComponent(categoryName)}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los profesionales para esta categoría.');
        }
        const data = await response.json();
        setProfessionals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [categoryName]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <Link to="/services" className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 truncate">
          {categoryName}
        </h2>
      </header>

      <main className="flex-1 pb-32 px-6 lg:px-8">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {[...Array(6)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
          </div>
        )}
        {error && <div className="text-center p-10 text-red-500">Error: {error}</div>}

        {!loading && !error && professionals.length === 0 && (
          <div className="text-center p-10 text-primary/70">
            <p className="text-lg font-semibold">No hay profesionales disponibles</p>
            <p className="text-sm">No se encontraron profesionales para la categoría "{categoryName}".</p>
          </div>
        )}

        {!loading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {professionals.map(prof => <ProfessionalCard key={prof.id} professional={prof} />)}
          </div>
        )}
      </main>
    </>
  );
}

export default ProfessionalsByCategoryPage;