import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ professionals: [], services: [], hashtags: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Llamada a la API con debounce de 300ms
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ professionals: [], services: [], hashtags: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${window.API_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          
          // Extraer hashtags únicos de los profesionales encontrados
          const extractedTags = new Set();
          data.professionals.forEach(prof => {
            if (prof.hashtags) {
              prof.hashtags.split(' ').forEach(tag => {
                if (tag.toLowerCase().includes(query.toLowerCase())) {
                  extractedTags.add(tag);
                }
              });
            }
          });

          setSuggestions({
            professionals: data.professionals.slice(0, 3), // Máximo 3 profesionales
            services: data.services.slice(0, 3),           // Máximo 3 servicios
            hashtags: Array.from(extractedTags).slice(0, 4) // Máximo 4 hashtags
          });
        }
      } catch (err) {
        console.error('Error al obtener sugerencias de búsqueda:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Cerrar el dropdown al hacer clic fuera del buscador
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestionQuery) => {
    setQuery(suggestionQuery);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(suggestionQuery)}`);
  };

  const hasSuggestions = 
    suggestions.professionals.length > 0 || 
    suggestions.services.length > 0 || 
    suggestions.hashtags.length > 0;

  return (
    <section className="mt-6 relative" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative z-30">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 dark:text-slate-400">search</span>
        <input
          className="w-full pl-12 pr-12 py-4 rounded-xl border border-primary/10 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 focus:outline-none text-base md:text-lg text-primary dark:text-slate-100 transition-all placeholder:text-primary/40 dark:placeholder:text-slate-500"
          placeholder="¿Qué servicio necesitas hoy? (Ej: #carpinteria, plomero)"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions({ professionals: [], services: [], hashtags: [] });
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-full text-primary/40 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-slate-700 border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </form>

      {/* Dropdown de autocompletado inteligente */}
      {showDropdown && (query.trim().length >= 2) && (
        <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-primary/10 dark:border-slate-700 overflow-hidden z-20 animate-feedback max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-xs font-semibold text-primary/60 dark:text-slate-400 flex items-center justify-center gap-2">
              <span className="animate-spin size-4 border-2 border-primary dark:border-teal-400 border-t-transparent rounded-full"></span>
              Buscando coincidencias...
            </div>
          )}

          {!loading && !hasSuggestions && (
            <div className="p-4 text-center text-xs font-semibold text-primary/60 dark:text-slate-400">
              No hay coincidencias sugeridas. Presiona Enter para buscar "{query}".
            </div>
          )}

          {!loading && hasSuggestions && (
            <div className="divide-y divide-primary/5 dark:divide-slate-750">
              {/* Sección de Hashtags */}
              {suggestions.hashtags.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-primary/50 dark:text-slate-500 uppercase tracking-wider mb-2">Servicios Especiales / Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.hashtags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(tag)}
                        className="bg-primary/5 dark:bg-teal-500/15 text-primary dark:text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/10 dark:border-teal-500/20 hover:bg-primary/10 dark:hover:bg-teal-500/25 transition-all cursor-pointer border-none"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de Servicios */}
              {suggestions.services.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-bold text-primary/50 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">Categorías de Servicios</p>
                  {suggestions.services.map(service => (
                    <Link
                      key={service.id}
                      to={`/services/${encodeURIComponent(service.category)}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-primary/5 dark:hover:bg-slate-700/60 transition-colors text-left decoration-none"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 dark:bg-teal-500/10 rounded-lg text-primary dark:text-teal-400">
                        <span className="material-symbols-outlined text-lg">{service.icon || 'settings'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate m-0">{service.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate m-0">{service.category}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm text-primary/30 dark:text-slate-500">chevron_right</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Sección de Profesionales */}
              {suggestions.professionals.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-bold text-primary/50 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">Profesionales</p>
                  {suggestions.professionals.map(prof => (
                    <Link
                      key={prof.id}
                      to={`/profile/${prof.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-primary/5 dark:hover:bg-slate-700/60 transition-colors text-left decoration-none"
                    >
                      <img
                        src={getAbsoluteImageUrl(prof.imageUrl)}
                        onError={handleImageError}
                        alt={prof.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/10 dark:ring-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate m-0">{prof.name}</p>
                          {prof.verified && (
                            <span className="material-symbols-outlined text-xs text-primary dark:text-teal-400" title="Verificado">verified</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate m-0">{prof.specialty || 'Profesional'}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold shrink-0">
                        <span className="material-symbols-outlined text-sm font-fill">star</span>
                        {prof.rating ? prof.rating.toFixed(1) : 'Nuevo'}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default SearchBar;