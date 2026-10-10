import React, { useState, useEffect, useRef } from 'react';

function SpecialtyCombobox({ onSpecialtyChange, initialValue = '' }) {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState(initialValue);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(window.API_URL + '/api/services');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar las especialidades:", error);
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  // Handle clicks outside the combobox to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsTyping(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const safeServices = Array.isArray(services) ? services : [];

  // Si no está escribiendo activamente, o si el texto es la especialidad seleccionada,
  // mostrar todas las opciones para que pueda cambiar de opinión con 1 clic.
  const filteredServices = isTyping && query.trim() !== '' && query !== selectedSpecialty
    ? safeServices.filter(service =>
        service?.name?.toLowerCase().includes(query.toLowerCase())
      )
    : safeServices;

  const handleSelect = (specialtyName) => {
    setQuery(specialtyName);
    setSelectedSpecialty(specialtyName);
    setIsTyping(false);
    onSpecialtyChange(specialtyName);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsTyping(true);
    onSpecialtyChange(val);
    setShowDropdown(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    setSelectedSpecialty('');
    setIsTyping(false);
    onSpecialtyChange('');
    setShowDropdown(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      setIsTyping(false); // Al abrir con la flecha, mostrar siempre todas las opciones
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleFocus = () => {
    setIsTyping(false); // Al hacer clic en el input, mostrar todas las opciones
    setShowDropdown(true);
    if (inputRef.current) {
      inputRef.current.select(); // Selecciona el texto completo para cambiarlo fácilmente
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400 pointer-events-none text-lg">work</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleFocus}
          placeholder="Busca o selecciona una especialidad"
          required
          className="w-full pl-11 pr-20 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              title="Borrar selección"
              className="p-1 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleDropdown}
            title={showDropdown ? "Cerrar opciones" : "Ver todas las especialidades"}
            className="p-1 text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
          >
            <span className={`material-symbols-outlined transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
        </div>
      </div>
      {showDropdown && (
        <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-primary/10 dark:border-slate-700 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 animate-feedback">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => {
              const isSelected = selectedSpecialty === service.name;
              return (
                <li
                  key={service.id || service.name}
                  onClick={() => handleSelect(service.name)}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary/10 dark:bg-teal-500/15 text-primary dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{service.name}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-base text-primary dark:text-teal-400">check</span>
                  )}
                </li>
              );
            })
          ) : query ? (
            <li
              onClick={() => handleSelect(query)}
              className="px-4 py-3 cursor-pointer hover:bg-primary/10 text-primary dark:text-teal-400 font-semibold text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Usar "{query}" como especialidad personalizada</span>
            </li>
          ) : (
            <li className="px-4 py-3 text-xs text-primary/60 dark:text-slate-400 text-center">
              No hay especialidades disponibles
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SpecialtyCombobox;