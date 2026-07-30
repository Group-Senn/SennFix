import React, { useState, useEffect, useRef } from 'react';

function SpecialtyCombobox({ onSpecialtyChange }) {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch all services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error al cargar las especialidades:", error);
      }
    };
    fetchServices();
  }, []);

  // Handle clicks outside the combobox to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredServices = query
    ? services.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase())
      )
    : services;

  const handleSelect = (specialtyName) => {
    setQuery(specialtyName);
    onSpecialtyChange(specialtyName);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">work</span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Busca o selecciona una especialidad"
          required
          className="w-full pl-11 pr-10 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary"
        />
        <button type="button" onClick={() => setShowDropdown(!showDropdown)} className="absolute right-0 top-0 h-full px-3 text-primary/60 hover:text-primary">
          <span className={`material-symbols-outlined transition-transform ${showDropdown ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
      </div>
      {showDropdown && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-primary/10 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {filteredServices.map(service => (
            <li key={service.id} onClick={() => handleSelect(service.name)} className="px-4 py-2 cursor-pointer hover:bg-primary/10">
              {service.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SpecialtyCombobox;