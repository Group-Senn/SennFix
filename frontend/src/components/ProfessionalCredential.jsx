import React from 'react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

// Credencial de oficio: la tarjeta con la que se muestra a cada trabajador en toda la app.
// La franja con la ranura evoca el carnet de trabajo; el sello estático repite el del perfil.
function ProfessionalCredential({ professional }) {
  const { id, name, specialty, rating, reviews, verified, is_online, imageUrl } = professional;
  const hasRating = Number(rating) > 0;

  return (
    <Link
      to={`/profile/${id}`}
      className="group flex flex-col h-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors hover:border-primary/50 dark:hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="h-10 bg-primary dark:bg-slate-700 flex justify-center pt-2" aria-hidden="true">
        <span className="w-10 h-1.5 rounded-full bg-white/30" />
      </div>

      <div className="flex flex-col flex-1 px-4 pb-4 -mt-6">
        <img
          src={getAbsoluteImageUrl(imageUrl)}
          onError={handleImageError}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover ring-4 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700"
        />
        <p className="mt-2 font-display text-lg font-bold leading-tight text-ink dark:text-slate-100 truncate">{name}</p>
        <p className="text-sm text-muted dark:text-slate-400 truncate">{specialty || 'Profesional'}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {verified && (
            <span className="verified-seal inline-flex items-center gap-1 px-1.5 py-0.5 rounded border-2 border-double border-primary dark:border-teal-400 text-primary dark:text-teal-400 font-display text-xs font-extrabold uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">verified</span>
              Verificado
            </span>
          )}
          <span className="text-sm font-semibold text-ink dark:text-slate-200">
            {hasRating ? (
              <>
                <span className="text-casco" aria-hidden="true">★</span>{' '}
                {Number(rating).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                <span className="font-normal text-muted dark:text-slate-400"> ({reviews || 0})</span>
                <span className="sr-only"> estrellas</span>
              </>
            ) : 'Nuevo'}
          </span>
        </div>

        {is_online && (
          <p className="mt-auto pt-3">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-casco text-primary text-xs font-bold px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              Disponible ahora
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}

// Carrusel horizontal en celular (conserva la credencial completa) y grilla de 4 en escritorio
export function CredentialRow({ professionals, loading, label }) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden lg:grid lg:grid-cols-4 lg:gap-4" aria-busy="true" aria-label={`Cargando ${label}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-56 w-64 shrink-0 lg:w-auto rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <ul aria-label={label} className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
      {professionals.map(pro => (
        <li key={pro.id} className="w-64 shrink-0 snap-start lg:w-auto"><ProfessionalCredential professional={pro} /></li>
      ))}
    </ul>
  );
}

export default ProfessionalCredential;
