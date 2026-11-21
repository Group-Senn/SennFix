import React from 'react';
import ProfessionalCredential from './ProfessionalCredential';
import FilterChips from './FilterChips';
import ColdStartNote from './ColdStartNote';
import { useProFilters } from '../utils/professionalFilters';

// Grilla de credenciales con filtros; "empty" se muestra cuando no hay nadie que listar
function CredentialResults({ professionals, loading, empty }) {
  const { active, toggle, filtered, clear } = useProFilters(professionals);

  if (loading) {
    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando profesionales">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <ColdStartNote />
      </>
    );
  }

  if (professionals.length === 0) return empty;

  return (
    <>
      <FilterChips professionals={professionals} active={active} onToggle={toggle} />
      <p className="mt-3 text-sm text-muted dark:text-slate-400" role="status">
        {active.length
          ? `${filtered.length} de ${professionals.length} profesionales`
          : `${professionals.length} ${professionals.length === 1 ? 'profesional' : 'profesionales'}`}
      </p>
      {filtered.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(pro => (
            <li key={pro.id}><ProfessionalCredential professional={pro} /></li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <p className="font-semibold text-ink dark:text-slate-100">Nadie cumple estos filtros.</p>
          <button onClick={clear} className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">
            Quitar filtros
          </button>
        </div>
      )}
    </>
  );
}

export default CredentialResults;
