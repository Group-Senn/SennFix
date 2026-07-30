import React, { useState, useEffect } from 'react';
import ProfessionalCard from './ProfessionalCard';

function NearbyProfessionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función asíncrona para obtener los datos desde nuestro backend
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(window.API_URL + '/api/professionals');
        const data = await response.json();
        setProfessionals(data);
      } catch (error) {
        console.error('Error al obtener los profesionales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

  return (
    <section className="mt-10 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary dark:text-slate-100">Cerca de ti</h2>
        <div className="flex items-center gap-1 text-sm text-primary/70">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span>Santa Cruz, BO</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-primary/70">Cargando profesionales...</p>
        ) : (
          professionals.map((prof) => (
            <ProfessionalCard key={prof.id} professional={prof} />
          ))
        )}
      </div>
    </section>
  );
}

export default NearbyProfessionals;