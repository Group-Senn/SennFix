import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfessionalCard from '../components/ProfessionalCard';
import SearchBar from '../components/SearchBar';
import ProfessionalCardSkeleton from '../components/ProfessionalCardSkeleton';
import MainServices from '../components/MainServices';
import AdBanner from '../components/AdBanner';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import logoNav from '../assets/logoNav.svg';
import NotificationBell from '../components/NotificationBell';
import { getAbsoluteImageUrl, handleImageError, DEFAULT_AVATAR } from '../utils/imageHelper';

function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState('Buscando ubicación...');
  const [nearbyProfessionals, setNearbyProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
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
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Obtener nombre de la ubicación (Reverse Geocoding)
        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`);
          const geoData = await geoResponse.json();
          const city = geoData.address.city || geoData.address.town || geoData.address.state;
          const country = geoData.address.country;
          setLocationName(`${city}, ${country}`);
        } catch (error) {
          console.error("Error en reverse geocoding:", error);
          setLocationName('Ubicación no encontrada');
        }

        // Obtener profesionales cercanos
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const profResponse = await fetch(`${window.API_URL}/api/professionals/nearby?lat=${latitude}&lon=${longitude}`, { headers });
          if (!profResponse.ok) throw new Error('No se pudieron cargar los profesionales.');
          const profData = await profResponse.json();
          setNearbyProfessionals(profData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        setLocationName('Permiso de ubicación denegado');
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  }, []);

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
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-2.5 border-b border-primary/10 dark:border-slate-700 gap-2">
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
                <div className="flex items-center gap-0.5 text-[10px] text-primary/60 dark:text-slate-400 font-semibold mt-0.5">
                  <span className="material-symbols-outlined !text-[11px] shrink-0">location_on</span>
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
                <div className="flex items-center gap-0.5 text-[10px] text-primary/60 dark:text-slate-400 font-semibold mt-0.5">
                  <span className="material-symbols-outlined !text-[11px] shrink-0">location_on</span>
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
           <h2 className="text-3xl font-bold text-primary dark:text-slate-100 mt-2">Encuentra la ayuda que necesitas</h2>
         </div>

        <main className="flex-1 pb-32 px-6 lg:px-8 space-y-8">
          <SearchBar />
          <MainServices />
          <AdBanner />
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100">Cerca de ti</h2>
              <Link to="/map" className="text-sm font-bold text-primary dark:text-primary/90 hover:underline">Ver mapa</Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto -mx-6 px-6 pb-4 lg:mx-0 lg:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...Array(4)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
              </div>
            ) : nearbyProfessionals.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto -mx-6 px-6 pb-4 lg:mx-0 lg:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {nearbyProfessionals.map(prof => <ProfessionalCard key={prof.id} professional={prof} />)}
              </div>
            ) : (
              <div className="text-sm font-medium text-primary/80 dark:text-slate-350">No se encontraron profesionales cerca de tu ubicación.</div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default Home;