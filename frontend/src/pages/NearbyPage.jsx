import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';
import 'leaflet/dist/leaflet.css';

// Icono personalizado para el usuario (rojo)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const createProIcon = (imageUrl) => {
  const absoluteUrl = getAbsoluteImageUrl(imageUrl);
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center">
        <!-- Contenedor circular de foto con borde verde de la marca -->
        <div class="w-10 h-10 rounded-full border-2 border-primary bg-white shadow-lg overflow-hidden flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95">
          <img src="${absoluteUrl}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=Pro&background=004744&color=fff&size=128'" class="w-full h-full object-cover" />
        </div>
        <!-- Puntero triangular -->
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary -mt-[1px]"></div>
      </div>
    `,
    className: 'custom-pro-marker-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -50]
  });
};

// Componente para centrar el mapa en la nueva ubicación
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Componente para forzar la actualización del tamaño del mapa y evitar que se vea gris
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

function NearbyPage() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'denied', 'error'
  const [mapType, setMapType] = useState('normal');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);

        try {
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const response = await fetch(`${window.API_URL}/api/professionals/nearby?lat=${latitude}&lon=${longitude}`, { headers });
          if (!response.ok) throw new Error('No se pudieron cargar los profesionales.');
          const data = await response.json();
          setProfessionals(data);
          setStatus('success');
        } catch (error) {
          console.error(error);
          setStatus('error');
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-5xl text-primary/50 dark:text-slate-400 animate-spin">progress_activity</span>
            <p className="mt-4 text-primary/70 dark:text-slate-300">Buscando tu ubicación...</p>
          </div>
        );
      case 'denied':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-5xl text-red-500">location_off</span>
            <h2 className="mt-4 text-xl font-bold text-primary dark:text-slate-100">Permiso de Ubicación Denegado</h2>
            <p className="mt-2 text-primary/70 dark:text-slate-300">Para encontrar profesionales cerca de ti, necesitamos acceso a tu ubicación. Por favor, habilita los permisos en tu navegador y recarga la página.</p>
          </div>
        );
      case 'success':
        return (
          <div className="relative w-full h-full">
            <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
              <ChangeView center={userLocation} zoom={13} />
              
              {mapType === 'normal' ? (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              ) : (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
              )}

              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <div className="text-slate-800 dark:text-slate-200 font-bold">Estás aquí</div>
                </Popup>
              </Marker>
              
              <MapResizer />
              
              {professionals.map(prof => (
                <Marker 
                  key={prof.id} 
                  position={[prof.display_latitude, prof.display_longitude]} 
                  icon={createProIcon(prof.imageUrl)}
                  eventHandlers={{
                    click: () => {
                      navigate(`/profile/${prof.id}`);
                    }
                  }}
                >
                  <Popup>
                    <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                      <img src={getAbsoluteImageUrl(prof.imageUrl)} onError={handleImageError} alt={prof.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 m-0">{prof.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{prof.specialty}</p>
                        <Link to={`/profile/${prof.id}`} className="text-primary dark:text-teal-400 font-bold text-sm hover:underline">Ver Perfil</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Custom Map Layer Switcher (Glassmorphic & Premium) */}
            <div className="absolute top-4 right-4 z-[1000]">
              <button
                onClick={() => setMapType(mapType === 'normal' ? 'satellite' : 'normal')}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-primary dark:text-slate-200 hover:text-primary/85 dark:hover:text-white font-bold px-3 py-2 rounded-xl shadow-lg border border-primary/10 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {mapType === 'normal' ? 'satellite' : 'map'}
                </span>
                <span>{mapType === 'normal' ? 'Satélite' : 'Mapa Normal'}</span>
              </button>
            </div>
          </div>
        );
      default: // 'error'
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-5xl text-red-500">error</span>
            <h2 className="mt-4 text-xl font-bold text-primary dark:text-slate-100">Ocurrió un Error</h2>
            <p className="mt-2 text-primary/70 dark:text-slate-300">No pudimos cargar los profesionales. Inténtalo de nuevo más tarde.</p>
          </div>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <Link to="/home" className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Cerca de Ti</h2>
      </header>
      <main className="absolute top-16 bottom-24 left-0 right-0 md:bottom-0">
        {renderContent()}
      </main>
    </>
  );
}

export default NearbyPage;