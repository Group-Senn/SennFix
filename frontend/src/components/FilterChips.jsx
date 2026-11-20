import React from 'react';
import { PRO_FILTERS } from '../utils/professionalFilters';

// Botones de filtro con estado presionado y cuántos profesionales cumplen cada uno
function FilterChips({ professionals, active, onToggle, className = 'flex flex-wrap gap-2' }) {
  return (
    <div className={className} role="group" aria-label="Filtrar profesionales">
      {PRO_FILTERS.map(filter => {
        const on = active.includes(filter.id);
        const count = professionals.filter(filter.test).length;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(filter.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer ${on
              ? 'bg-primary border-primary text-white dark:bg-teal-400 dark:border-teal-400 dark:text-slate-900'
              : 'bg-white border-slate-300 text-ink hover:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">{on ? 'check' : filter.icon}</span>
            {filter.label}
            <span className={on ? 'text-white/80 dark:text-slate-900/70' : 'text-muted dark:text-slate-400'}>({count})</span>
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
