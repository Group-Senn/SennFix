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
import logotipoVerde from '../assets/logotipo verde.svg';
import logotipoNegativo from '../assets/logotipo negativo.svg';
import NotificationBell from '../components/NotificationBell';

function Home() {
  const { theme } = useTheme();
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
      const response = await fetch('https://senn-fix-backend-api.onrender.com/api/chats/support', {
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
          const profResponse = await fetch(`https://senn-fix-backend-api.onrender.com/api/professionals/nearby?lat=${latitude}&lon=${longitude}`, { headers });
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
      {/* Cabecera principal de la aplicación, visible en todas las vistas */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 border-b border-primary/10 dark:border-slate-700">
        <div className="w-1/3">
          <ThemeSwitcher />
        </div>
        <div className="w-1/3 text-center">
          <img src={theme === 'dark' ? logotipoNegativo : logotipoVerde} alt="SENN Fix Logotipo" className={`${theme === 'dark' ? 'h-16' : 'h-30'} mx-auto`} />
        </div>
        <div className="w-1/3 flex justify-end gap-2">
          {user?.user_type === 'admin' && (
            <Link to="/admin/dashboard" className="p-2 rounded-full bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 dark:bg-teal-600/20 dark:text-teal-400 dark:hover:bg-teal-600/30 transition-colors" title="Consola de Administración">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </Link>
          )}
          <NotificationBell />
          
          {/* Menú de opciones */}
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
                  to="/legal/no-labor-relationship" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  Términos y Políticas
                </Link>
                <button 
                  onClick={handleContactSupport}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-primary/80 dark:text-slate-350 hover:bg-primary/5 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  Soporte Técnico
                </button>
                <hr className="border-outline-variant/10 dark:border-slate-700 my-1" />
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

      {/* Contenedor para centrar el contenido principal en pantallas grandes */}
      <div className="mx-auto w-full max-w-6xl animate-page-entry">
        {/* Título de la página y ubicación */}
        <div className="p-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary/60 dark:text-slate-400">location_on</span>
            <p className="text-sm font-semibold text-primary dark:text-slate-200">{locationName}</p>
          </div>
          <h2 className="text-3xl font-bold text-primary dark:text-slate-100 mt-2">Encuentra la ayuda que necesitas</h2>
        </div>

        {/* Contenido principal */}
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
              <div className="text-primary/60 dark:text-slate-400">No se encontraron profesionales cerca de tu ubicación.</div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default Home;