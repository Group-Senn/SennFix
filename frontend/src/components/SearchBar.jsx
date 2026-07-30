import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (query.trim()) {
      navigate(`/search?q=${query.trim()}`);
    }
  };

  return (
    <section className="mt-6">
      <form onSubmit={handleSearch} className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">search</span>
        <input
          className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary text-lg"
          placeholder="¿Qué servicio necesitas hoy?"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </section>
  );
}

export default SearchBar;