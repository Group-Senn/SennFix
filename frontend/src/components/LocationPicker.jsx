import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';

// Icono personalizado para evitar que se rompa la imagen del marcador en móvil/Capacitor
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#006b5f" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Componente para cambiar el centro del mapa dinámicamente
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
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

// Componente para capturar clics/taps en el mapa y posicionar el pin
function MapEvents({ setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      setPosition(newPos);
      onLocationChange(newPos);
    }
  });
  return null;
}

// Componente para el marcador arrastrable
function DraggableMarker({ position, setPosition, onLocationChange }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationChange(newPos);
        }
      },
    }),
    [setPosition, onLocationChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    ></Marker>
  );
}

function LocationPicker({ onLocationChange, address, onAddressChange }) {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);
  const defaultCenter = { lat: -17.7833, lng: -63.1821 }; // Santa Cruz, Bolivia

  // Cierra los resultados de búsqueda cuando se hace clic fuera del buscador
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inicializa la posición del mapa de forma segura
  useEffect(() => {
    let active = true;
    let resolved = false;

    // Timeout de seguridad: si no responde en 4 segundos, usa el centro por defecto
    const timeoutId = setTimeout(() => {
      if (active && !resolved) {
        console.warn("La solicitud de ubicación tardó demasiado. Usando ubicación por defecto.");
        resolved = true;
        setPosition(defaultCenter);
        onLocationChange(defaultCenter);
      }
    }, 4000);

    const getInitialLocation = async () => {
      try {
        let lat, lng;

        if (Capacitor.isNativePlatform()) {
          // Uso de geolocalización nativa de Capacitor
          const coordinates = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 3000
          });
          lat = coordinates.coords.latitude;
          lng = coordinates.coords.longitude;
        } else {
          // Fallback para navegador web estándar
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 3000
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }

        if (active && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          const userPos = { lat, lng };
          setPosition(userPos);
          onLocationChange(userPos);
        }
      } catch (err) {
        console.error("Error al obtener la ubicación, usando la de por defecto:", err);
        if (active && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          setPosition(defaultCenter);
          onLocationChange(defaultCenter);
        }
      }
    };

    getInitialLocation();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []); // Se ejecuta solo una vez

  // Sincroniza el input con el estado del formulario padre
  useEffect(() => {
    setSearchQuery(address || '');
  }, [address]);

  // Búsqueda con debounce para no sobrecargar la API
  useEffect(() => {
    // La condición original `searchQuery === address` impedía que la búsqueda se activara.
    // La eliminamos para permitir que la búsqueda se realice mientras el usuario escribe.
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Usamos la API de Nominatim (OpenStreetMap) para buscar
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bo&limit=5`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error en la búsqueda de dirección:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => clearTimeout(handler);
  }, [searchQuery, address]);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    onAddressChange(newQuery);
  };

  const handleSelectResult = (result) => {
    const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    const displayName = result.display_name;
    setPosition(newPos);
    onLocationChange(newPos);
    onAddressChange(displayName); // Actualiza el formulario con la dirección completa
    setSearchQuery(displayName); // Actualiza también el input local para que muestre la dirección completa
    setSearchResults([]); // Oculta la lista de resultados
  };

  if (!position) {
    return <div className="h-80 w-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg">Cargando mapa...</div>;
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder="Escribe una dirección para buscar..."
          className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary"
        />
        {isSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/60">Buscando...</span>}
        {searchResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-primary/10 dark:border-slate-700 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
            {searchResults.map(result => (
              <li
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                className="px-4 py-2 cursor-pointer hover:bg-primary/10 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden relative z-0 border border-primary/10">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={position} zoom={15} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <DraggableMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange} />
          <MapEvents setPosition={setPosition} onLocationChange={onLocationChange} />
          <MapResizer />
        </MapContainer>
      </div>
    </div>
  );
}

export default LocationPicker;