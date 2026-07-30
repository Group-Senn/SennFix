import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MainServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMainServices = async () => {
      try {
        // Pedimos solo los servicios marcados como principales
        const response = await fetch(window.API_URL + '/api/services?main=true');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error al obtener los servicios principales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMainServices();
  }, []);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary dark:text-slate-100">Servicios Principales</h2>
        <Link to="/services" className="text-sm font-bold text-primary/80 dark:text-primary/90 flex items-center gap-1 transition-colors hover:text-primary">
          Ver todos
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {loading ? <p className="text-xs text-primary/70 dark:text-slate-400 col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6">Cargando...</p> :
          services.map((service) => (
            <Link to={`/services/${service.name}`} key={service.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-primary/5 dark:border-slate-700 flex flex-col items-center text-center gap-3 active:scale-95 transition-transform cursor-pointer hover:border-primary/10 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-white shrink-0">
                <span className="material-symbols-outlined text-3xl">{service.icon}</span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[2.5rem] flex items-center justify-center leading-tight">
                {service.name}
              </p>
            </Link>
          ))}
      </div>
    </section>
  );
}

export default MainServices;