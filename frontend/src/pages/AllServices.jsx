import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AllServices() {
  const [groupedServices, setGroupedServices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const response = await fetch(window.API_URL + '/api/services');
        const data = await response.json();

        // Agrupamos los servicios por categoría para mostrarlos ordenadamente
        const groups = data.reduce((acc, service) => {
          const category = service.category || 'Otros';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(service);
          return acc;
        }, {});
        setGroupedServices(groups);

      } catch (error) {
        console.error('Error al obtener todos los servicios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllServices();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <Link to="/home" className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Todos los Servicios</h2>
      </header>

      <main className="flex-1 pb-32">
        {loading ? (
          <div className="text-center p-10 text-primary/70">Cargando servicios...</div>
        ) : (
          Object.entries(groupedServices).map(([category, services]) => (
            <section key={category} className="px-6 pt-6">
              <h3 className="text-lg font-bold text-primary/90 dark:text-slate-200 mb-3">{category}</h3>
              <div className="flex flex-col gap-2">
                {services.map(service => (
                  <Link to={`/services/${service.name}`} key={service.id} className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 backdrop-blur-sm active:scale-95 transition-transform hover:border-primary/20">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary dark:text-white text-2xl">{service.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{service.name}</h4>
                    </div>
                    <div className="text-primary/50 dark:text-slate-500">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}

export default AllServices;