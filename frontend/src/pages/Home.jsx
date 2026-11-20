import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import { CredentialRow } from '../components/ProfessionalCredential';
import { POPULAR_TRADES } from '../utils/trades';
import AdBanner from '../components/AdBanner';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationBell from '../components/NotificationBell';
import { getAbsoluteImageUrl, handleImageError, DEFAULT_AVATAR } from '../utils/imageHelper';

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState('Buscando ubicación...');
  const [nearbyProfessionals, setNearbyProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  // Sin ubicación se muestran todos los profesionales de Santa Cruz en lugar de una sección vacía
  const [hasLocation, setHasLocation] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleContactSupport = async () => {
    setIsMenuOpen(false);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(window.API_URL + '/api/chats/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo iniciar el chat de soporte.');
      navigate(`/chats/${data.conversationId}`);
    } catch (err) {
      alert(`Error al abrir soporte: ${err.message}`);
    }
  };

  useEffect(() => {
    // 1. Intentar cargar desde el localStorage
    const cachedLat = localStorage.getItem('senn_latitude');
    const cachedLon = localStorage.getItem('senn_longitude');
    const cachedName = localStorage.getItem('senn_location_name');

    const fetchNearby = async (lat, lon) => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const profResponse = await fetch(`${window.API_URL}/api/professionals/nearby?lat=${lat}&lon=${lon}`, { headers });
        if (!profResponse.ok) throw new Error('No se pudieron cargar los profesionales.');
        const profData = await profResponse.json();
        setNearbyProfessionals(profData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (cachedLat && cachedLon && cachedName) {
      setLocationName(cachedName);
      fetchNearby(parseFloat(cachedLat), parseFloat(cachedLon));
    }

    // 2. Ejecutar la geolocalización en segundo plano (o si no hay caché)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Comprobar si las coordenadas han cambiado significativamente
        const isCoordsSame = cachedLat && cachedLon && 
          Math.abs(parseFloat(cachedLat) - latitude) < 0.01 && 
          Math.abs(parseFloat(cachedLon) - longitude) < 0.01;

        if (isCoordsSame && cachedName) {
          // Ya cargamos con las mismas coordenadas, no hacer nada más
          return;
        }

        let newLocationName = 'Ubicación no encontrada';
        // Obtener nombre de la ubicación (Reverse Geocoding)
        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`);
          const geoData = await geoResponse.json();
          const city = geoData.address.city || geoData.address.town || geoData.address.state;
          const country = geoData.address.country;
          newLocationName = `${city}, ${country}`;
          setLocationName(newLocationName);
          
          // Guardar en caché
          localStorage.setItem('senn_latitude', latitude.toString());
          localStorage.setItem('senn_longitude', longitude.toString());
          localStorage.setItem('senn_location_name', newLocationName);
        } catch (error) {
          console.error("Error en reverse geocoding:", error);
          if (!cachedName) {
            setLocationName('Ubicación no encontrada');
          }
        }

        // Obtener profesionales cercanos con las nuevas coordenadas
        fetchNearby(latitude, longitude);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        if (!cachedName) {
          setLocationName('Santa Cruz, Bolivia');
          setHasLocation(false);
          fetch(`${window.API_URL}/api/professionals`)
            .then(res => (res.ok ? res.json() : []))
            .then(setNearbyProfessionals)
            .catch(() => setNearbyProfessionals([]))
            .finally(() => setLoading(false));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  }, []);

  // Los disponibles ahora van en su propia fila; "Cerca de ti" muestra al resto, sin repetir
  const onlineNow = nearbyProfessionals.filter(p => p.is_online);
  const others = nearbyProfessionals.filter(p => !p.is_online);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-2.5 border-b border-primary/10 dark:border-slate-700 gap-2 md:hidden">
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <img
                src={getAbsoluteImageUrl(user.imageUrl)}
                onError={handleImageError}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-primary/10 object-cover shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-primary dark:text-slate-100 leading-tight">{user.name}</span>
                <div className="flex items-center gap-0.5 text-xs text-muted dark:text-slate-400 font-semibold mt-0.5">
                  <span className="material-symbols-outlined !text-xs shrink-0">location_on</span>
                  <span className="truncate max-w-[130px]">{locationName}</span>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2.5 group">
              <img
                src={DEFAULT_AVATAR}
                alt="Invitado"
                className="w-10 h-10 rounded-full border border-primary/10 object-cover shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-primary dark:text-teal-400 leading-tight group-hover:underline">Iniciar sesión</span>
                <div className="flex items-center gap-0.5 text-xs text-muted dark:text-slate-400 font-semibold mt-0.5">
                  <span className="material-symbols-outlined !text-xs shrink-0">location_on</span>
                  <span className="truncate max-w-[130px]">{locationName}</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95 flex items-center justify-center border-none cursor-pointer"
              title="Menú de opciones"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-outline-variant/10 dark:border-slate-700 overflow-hidden z-50 flex flex-col py-1 animate-feedback">
                <Link
                  to="/legal/terms-and-conditions"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  Términos y Condiciones
                </Link>
                <Link
                  to="/legal/privacy-policy"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">policy</span>
                  Políticas de Privacidad
                </Link>
                <Link
                  to="/legal/no-labor-relationship"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Deslinde Laboral
                </Link>
                <button
                  onClick={handleContactSupport}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  Soporte Técnico
                </button>
                 <hr className="border-outline-variant/10 dark:border-slate-700 my-1" />
                 {user && user.user_type === 'admin' && (
                   <Link
                     to="/admin/dashboard"
                     onClick={() => setIsMenuOpen(false)}
                     className="px-4 py-3 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/5 flex items-center gap-2 transition-colors"
                   >
                     <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                     Consola de Administración
                   </Link>
                 )}
                 <button
                   onClick={() => {
                     setIsMenuOpen(false);
                     logout();
                     navigate('/login');
                   }}
                   className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-500/5 flex items-center gap-2 transition-colors border-none bg-transparent cursor-pointer"
                 >
                   <span className="material-symbols-outlined text-[18px]">logout</span>
                   Cerrar Sesión
                 </button>
               </div>
             )}
           </div>
         </div>
       </header>

       <div className="mx-auto w-full max-w-6xl animate-page-entry">
         <div className="p-6 lg:px-8">
           {/* Banner de acceso rápido a consola de administración si es admin */}
           {user && user.user_type === 'admin' && (
             <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-between gap-4">
               <div>
                 <h3 className="text-sm font-bold text-teal-800 dark:text-teal-450 flex items-center gap-1.5">
                   <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                   Consola de Administración Activa
                 </h3>
                 <p className="text-xs text-teal-900/70 dark:text-slate-350 mt-1">Gestiona solicitudes de profesionales, reportes, soporte y estadísticas.</p>
               </div>
               <Link 
                 to="/admin/dashboard" 
                 className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer border-none no-underline flex items-center gap-1.5 shrink-0"
               >
                 Ir a la Consola
               </Link>
             </div>
           )}
           <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-white mt-2">¿Qué necesitas arreglar hoy?</h1>
         </div>

        <main className="flex-1 pb-12 px-4 md:px-6 lg:px-8 space-y-10">
          <div>
            <SearchBar />
            {/* Siempre visible: antes vivía dentro de "Cerca de ti" y desaparecía si todos estaban en línea */}
            <Link
              to="/map"
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-primary dark:text-teal-400 hover:border-primary dark:hover:border-teal-400 transition-colors"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">map</span>
              {hasLocation ? 'Ver mapa cerca de ti' : 'Ver mapa de Santa Cruz'}
            </Link>
          </div>

          <section aria-labelledby="oficios-titulo">
            <div className="flex justify-between items-center mb-4">
              <h2 id="oficios-titulo" className="text-xl md:text-2xl font-extrabold text-primary dark:text-white">Oficios más pedidos</h2>
              <Link to="/services" className="text-sm font-bold text-primary dark:text-teal-400 hover:underline">Ver todos</Link>
            </div>
            <ul className="grid grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
              {POPULAR_TRADES.map(trade => (
                <li key={trade.name}>
                  <Link
                    to={`/services/${trade.name}`}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-3 text-center hover:border-primary dark:hover:border-teal-400 transition-colors"
                  >
                    <span className="w-11 h-11 rounded-xl bg-primary/5 dark:bg-teal-400/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary dark:text-teal-400" aria-hidden="true">{trade.icon}</span>
                    </span>
                    <span className="text-xs font-semibold text-ink dark:text-slate-200">{trade.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <AdBanner />

          {!loading && onlineNow.length > 0 && (
            <section aria-labelledby="disponibles-titulo">
              <h2 id="disponibles-titulo" className="mb-4 flex items-center gap-2 text-xl md:text-2xl font-extrabold text-primary dark:text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-casco" aria-hidden="true" />
                Disponibles ahora
              </h2>
              <CredentialRow professionals={onlineNow} label="Profesionales disponibles ahora" />
            </section>
          )}

          {(loading || others.length > 0 || onlineNow.length === 0) && (
          <section aria-labelledby="cerca-titulo">
            <h2 id="cerca-titulo" className="mb-4 text-xl md:text-2xl font-extrabold text-primary dark:text-white">
              {hasLocation ? 'Cerca de ti' : 'Profesionales en Santa Cruz'}
            </h2>
            {loading || others.length > 0 ? (
              <CredentialRow professionals={others} loading={loading} label={hasLocation ? 'Profesionales cerca de ti' : 'Profesionales en Santa Cruz'} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                <p className="font-semibold text-ink dark:text-slate-100">Aún no hay profesionales en tu zona.</p>
                <p className="mt-1 text-sm text-muted dark:text-slate-400">Busca por oficio o mira el mapa de Santa Cruz.</p>
                <Link to="/services" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
                  Ver todos los oficios
                </Link>
              </div>
            )}
            {!hasLocation && (
              <p className="mt-3 text-sm text-muted dark:text-slate-400">
                Activa tu ubicación en el navegador para ver primero a quienes están más cerca.
              </p>
            )}
          </section>
          )}
        </main>
      </div>
    </>
  );
}

export default Home;