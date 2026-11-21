import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { getAbsoluteImageUrl, handleImageError, DEFAULT_AVATAR } from '../utils/imageHelper';
import ProfessionalCredential from '../components/ProfessionalCredential';
import FilterChips from '../components/FilterChips';
import ColdStartNote from '../components/ColdStartNote';
import { useProFilters } from '../utils/professionalFilters';
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

const createProIcon = (imageUrl, name) => {
  const absoluteUrl = getAbsoluteImageUrl(imageUrl);
  // El nombre va dentro de un onerror='...': escapar ' evita que un nombre malicioso ejecute código
  const fallbackUrl = name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name).replace(/'/g, '%27')}&background=004744&color=fff&size=128` : DEFAULT_AVATAR;
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center" style="width: 40px !important; height: 48px !important; display: flex !important; flex-direction: column !important; align-items: center !important;">
        <!-- Contenedor circular de foto con borde verde de la marca -->
        <div class="rounded-full border-2 border-primary bg-white shadow-lg overflow-hidden flex items-center justify-center transition-all duration-200 transform active:scale-95"
             style="width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 9999px !important; overflow: hidden !important;">
          <img src="${absoluteUrl}" onerror="this.onerror=null;this.src='${fallbackUrl}'" 
               style="width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: cover !important; display: block !important; border-radius: 9999px !important;" />
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

const DEFAULT_COORDS = { lat: -17.7833, lng: -63.1821 }; // Centro de Santa Cruz, Bolivia

// Centra el mapa solo cuando cambia el destino (antes lo hacía en cada render y deshacía lo que el usuario movía)
function ChangeView({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom]);
  return null;
}

// Leaflet necesita recalcular su tamaño cuando su contenedor aparece (p. ej. al pasar de Lista a Mapa en celular)
function MapResizer({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map, trigger]);
  return null;
}

// Pide la ubicación del navegador y la guarda para la próxima visita
function locate(onSuccess, onFail) {
  if (!navigator.geolocation) {
    onFail();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const location = { lat: coords.latitude, lng: coords.longitude };
      localStorage.setItem('senn_latitude', String(location.lat));
      localStorage.setItem('senn_longitude', String(location.lng));
      onSuccess(location);
    },
    onFail,
    { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
  );
}

function readCachedLocation() {
  const lat = parseFloat(localStorage.getItem('senn_latitude'));
  const lng = parseFloat(localStorage.getItem('senn_longitude'));
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function NearbyPage() {
  const [userLocation, setUserLocation] = useState(readCachedLocation);
  // 'near': quienes cubren tu ubicación · 'city': todos los activos de Santa Cruz
  const [mode, setMode] = useState(() => (readCachedLocation() ? 'near' : 'pending'));
  // Resultado del último pedido; "cargando" se deduce de si corresponde al pedido vigente
  const [result, setResult] = useState({ key: null, list: [], error: false });
  const [retry, setRetry] = useState(0);
  const [locationNote, setLocationNote] = useState('');
  const [view, setView] = useState('map'); // solo en celular: 'map' | 'list'
  const [mapType, setMapType] = useState('normal');

  const applyLocation = (location) => {
    setUserLocation(location);
    setLocationNote('');
    setMode('near');
  };

  // Al entrar: actualizar la ubicación; sin permiso, mostrar toda la ciudad en vez de una pantalla sin salida
  useEffect(() => {
    locate(
      (location) => {
        setUserLocation(location);
        setMode('near');
      },
      () => {
        if (readCachedLocation()) return; // ya se está mostrando con la última ubicación conocida
        setLocationNote('No pudimos usar tu ubicación, así que te mostramos toda la ciudad.');
        setMode('city');
      }
    );
  }, []);

  const requestUrl = mode === 'near' && userLocation
    ? `${window.API_URL}/api/professionals/nearby?lat=${userLocation.lat}&lon=${userLocation.lng}`
    : mode === 'city' ? `${window.API_URL}/api/professionals` : null;
  const requestKey = requestUrl && `${requestUrl}#${retry}`;

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    const token = localStorage.getItem('token');
    fetch(requestUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        // "Toda la ciudad" usa la ubicación base de cada uno (la que eligió al registrarse)
        const isCity = !requestUrl.includes('/nearby');
        setResult({
          key: requestKey,
          list: isCity ? list.map(p => ({ ...p, display_latitude: p.latitude, display_longitude: p.longitude })) : list,
          error: false,
        });
      })
      .catch(err => {
        console.error('Error al cargar profesionales del mapa:', err);
        if (!cancelled) setResult({ key: requestKey, list: [], error: true });
      });
    return () => { cancelled = true; };
  }, [requestKey, requestUrl]);

  const professionals = result.list;
  const loading = !requestKey || result.key !== requestKey;
  const error = !loading && result.error;
  const { active, toggle, filtered, clear } = useProFilters(professionals);

  const goNear = () => {
    if (userLocation) {
      setMode('near');
      return;
    }
    locate(applyLocation, () => setLocationNote('Activa la ubicación en tu navegador para ver quién te cubre. Mientras tanto, mira toda la ciudad.'));
  };

  const pins = filtered.filter(p => p.display_latitude != null && p.display_longitude != null);
  const withoutLocation = filtered.length - pins.length;
  const center = mode === 'near' && userLocation ? userLocation : DEFAULT_COORDS;
  const zoom = mode === 'near' ? 13 : 12;
  const waiting = loading;

  const segment = (on) => `inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition-colors cursor-pointer border-none ${on
    ? 'bg-primary text-white dark:bg-teal-400 dark:text-slate-900'
    : 'bg-transparent text-muted hover:text-primary dark:text-slate-400 dark:hover:text-teal-400'}`;

  return (
    <main className="flex flex-col h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)]">
      <div className="shrink-0 space-y-3 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark px-4 md:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl md:text-2xl font-extrabold text-primary dark:text-white">Mapa de profesionales</h1>
          <div className="flex w-full md:w-auto items-center justify-between gap-2">
          <div role="group" aria-label="Qué zona ver" className="inline-flex gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
            <button type="button" aria-pressed={mode === 'near'} onClick={goNear} className={segment(mode === 'near')}>
              <span className="material-symbols-outlined text-lg hidden sm:inline-block" aria-hidden="true">near_me</span>
              Cerca de mí
            </button>
            <button type="button" aria-pressed={mode === 'city'} onClick={() => setMode('city')} className={segment(mode === 'city')}>
              <span className="material-symbols-outlined text-lg hidden sm:inline-block" aria-hidden="true">location_city</span>
              Toda la ciudad
            </button>
          </div>
          {/* Solo en celular: alternar entre mapa y lista (en escritorio se ven juntos) */}
          <div role="group" aria-label="Cómo ver los resultados" className="md:hidden inline-flex gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
            <button type="button" aria-pressed={view === 'map'} aria-label="Ver mapa" onClick={() => setView('map')} className={segment(view === 'map')}>
              <span className="material-symbols-outlined text-lg" aria-hidden="true">map</span>
            </button>
            <button type="button" aria-pressed={view === 'list'} aria-label="Ver lista" onClick={() => setView('list')} className={segment(view === 'list')}>
              <span className="material-symbols-outlined text-lg" aria-hidden="true">view_list</span>
            </button>
          </div>
          </div>
        </div>
        <FilterChips
          professionals={professionals}
          active={active}
          onToggle={toggle}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        />
        {locationNote && <p className="text-sm text-muted dark:text-slate-400">{locationNote}</p>}
      </div>

      <div className="flex flex-1 min-h-0">
        <aside
          aria-label="Lista de profesionales"
          className={`${view === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[360px] lg:w-[400px] shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 p-4`}
        >
          <p className="mb-3 text-sm text-muted dark:text-slate-400" role="status">
            {waiting
              ? 'Buscando profesionales…'
              : `${filtered.length} ${filtered.length === 1 ? 'profesional' : 'profesionales'}${withoutLocation > 0 ? ` · ${withoutLocation} sin ubicación en el mapa` : ''}`}
          </p>
          {waiting ? (
            <div aria-busy="true">
              <div className="space-y-3">
                {[0, 1, 2].map(i => <div key={i} className="h-56 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)}
              </div>
              <ColdStartNote />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
              <p className="font-semibold text-ink dark:text-slate-100">No pudimos cargar a los profesionales.</p>
              <button onClick={() => setRetry(n => n + 1)} className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">Reintentar</button>
            </div>
          ) : professionals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
              <p className="font-semibold text-ink dark:text-slate-100">
                {mode === 'near' ? 'Nadie cubre tu zona todavía.' : 'Todavía no hay profesionales activos.'}
              </p>
              {mode === 'near' && (
                <button onClick={() => setMode('city')} className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">Ver toda la ciudad</button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
              <p className="font-semibold text-ink dark:text-slate-100">Nadie cumple estos filtros.</p>
              <button onClick={clear} className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer border-none">Quitar filtros</button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              {filtered.map(pro => <li key={pro.id}><ProfessionalCredential professional={pro} /></li>)}
            </ul>
          )}
        </aside>

        <div className={`${view === 'map' ? 'block' : 'hidden'} md:block relative flex-1 min-w-0`}>
          <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <ChangeView lat={center.lat} lng={center.lng} zoom={zoom} />
            <MapResizer trigger={view} />
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

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup><span className="font-bold">Estás aquí</span></Popup>
              </Marker>
            )}

            {/* Tocar un pin abre su ficha breve; antes saltaba directo al perfil sin mostrar nada */}
            {pins.map(prof => (
              <Marker key={prof.id} position={[prof.display_latitude, prof.display_longitude]} icon={createProIcon(prof.imageUrl, prof.name)}>
                <Popup>
                  <div className="flex items-center gap-3">
                    <img src={getAbsoluteImageUrl(prof.imageUrl)} onError={handleImageError} alt={prof.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="m-0 font-bold text-base text-ink">{prof.name}</p>
                      <p className="m-0 text-sm text-muted">{prof.specialty}</p>
                      <Link to={`/profile/${prof.id}`} className="text-sm font-bold text-primary underline">Ver perfil</Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <button
            type="button"
            onClick={() => setMapType(mapType === 'normal' ? 'satellite' : 'normal')}
            className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-primary dark:text-slate-200 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">{mapType === 'normal' ? 'satellite_alt' : 'map'}</span>
            {mapType === 'normal' ? 'Satélite' : 'Mapa'}
          </button>

          {!waiting && !error && pins.length === 0 && filtered.length > 0 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-sm rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-center text-sm text-ink dark:text-slate-200 shadow-md">
              Estos profesionales aún no marcaron su ubicación. Míralos en la lista.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default NearbyPage;
