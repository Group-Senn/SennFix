import { useState } from 'react';

// Filtros que comparten los resultados, la página de cada oficio y el mapa
export const PRO_FILTERS = [
  { id: 'online', label: 'Disponibles ahora', icon: 'schedule', test: p => Boolean(p.is_online) },
  { id: 'verified', label: 'Verificados', icon: 'verified', test: p => Boolean(p.verified) },
];

// Filtros acumulativos: con los dos activos, solo quedan los verificados que están disponibles
export function useProFilters(list) {
  const [active, setActive] = useState([]);
  const toggle = (id) => setActive(current => (current.includes(id) ? current.filter(x => x !== id) : [...current, id]));
  const filtered = list.filter(p => PRO_FILTERS.every(f => !active.includes(f.id) || f.test(p)));
  return { active, toggle, filtered, clear: () => setActive([]) };
}
