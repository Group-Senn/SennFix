import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ProfileSkeleton from '../components/ProfileSkeleton';
import MinorAlert from '../components/MinorAlert';

// Icono personalizado para evitar que se rompa la imagen del marcador en móvil
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

function Profile() {
  const { id: professionalId } = useParams(); // Obtiene el 'id' de la URL (ej: "1" o "2")
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [chatError, setChatError] = useState('');
  const [isMinor, setIsMinor] = useState(false);

  // Portafolio de fotos
  const [portfolio, setPortfolio] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Componente para forzar la actualización del tamaño del mapa y evitar que se vea gris
  function MapResizer() {
    const map = useMap();
    useEffect(() => {
      // Se ejecuta después de un breve instante para asegurar que el contenedor del mapa es visible
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, [map]);
    return null;
  }

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setChatError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://senn-fix-backend-api.onrender.com/api/chats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: professionalId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar el chat.');
      }

      navigate(`/chats/${data.conversationId}`);
    } catch (err) {
      console.error(err);
      setChatError(err.message);
    }
  };

  const fetchProfessionalData = async () => {
    try {
      setLoading(true);
      // Fetch professional details
      const profResponse = await fetch(`https://senn-fix-backend-api.onrender.com/api/professionals/${professionalId}`);
      if (!profResponse.ok) throw new Error('Profesional no encontrado');
      const profData = await profResponse.json();

      // Calcular si el profesional es menor de edad
      if (profData.birth_date) {
        const birthDate = new Date(profData.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setIsMinor(age < 18);
      }
      setProfessional(profData);

      // Fetch reviews
      const reviewsResponse = await fetch(`https://senn-fix-backend-api.onrender.com/api/professionals/${professionalId}/reviews`);
      if (!reviewsResponse.ok) throw new Error('No se pudieron cargar las reseñas.');
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);

      // Fetch portfolio photos
      const portResponse = await fetch(`https://senn-fix-backend-api.onrender.com/api/professionals/${professionalId}/portfolio`);
      if (portResponse.ok) {
        const portData = await portResponse.json();
        setPortfolio(portData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionalData();
  }, [professionalId]);

  const handleReviewSubmitted = () => {
    // Refresca los datos del profesional y las reseñas después de enviar una nueva.
    fetchProfessionalData();
  };

  const canWriteReview = isAuthenticated && user?.user_type === 'client' && user?.id != professionalId;

  if (loading) {
    return (
      <>
        <ProfileHeader /><ProfileSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProfileHeader />
        <div className="text-center p-10 text-red-500">Error: {error}</div>
      </>
    );
  }

  if (!professional) {
    return null; // No renderiza nada si no hay profesional
  }

  // La base de datos devuelve 0 o 1 para booleanos, lo convertimos
  const isVerified = professional.verified;
  const hasGoldSeal = professional.has_gold_seal;
  
  // Ocultar el botón de chat si el usuario está viendo su propio perfil
  const isOwnProfile = isAuthenticated && user?.id == professionalId;

  return (
    <>
      <ProfileHeader />

      {/* Alerta si el profesional es menor de edad */}
      {isMinor && (
        <div className="pt-4"><MinorAlert /></div>
      )}

      <main className="flex-1 pb-32 md:pb-12">
        <section className="p-6 lg:p-8 relative">
          {isOwnProfile && (
            <Link
              to={`/profile/edit/${user.id}`}
              className="absolute top-6 right-6 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-primary py-2 px-4 rounded-full flex items-center gap-2 text-sm font-bold shadow-md hover:bg-white transition-colors z-10"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Editar Perfil</span>
            </Link>
          )}
          <div className="flex w-full flex-col md:flex-row md:items-start gap-6 md:gap-10">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative group">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 ring-4 ring-primary/20 shadow-xl"
                  style={{ backgroundImage: `url("${professional.imageUrl}")` }}
                ></div>
                {(isVerified || hasGoldSeal) && (
                  <div className="absolute bottom-1 right-1 flex items-center gap-1">
                    {hasGoldSeal && (
                      <div className="bg-amber-400 text-white p-1 rounded-full border-2 border-background-light dark:border-background-dark" title="Sello de Oro: Máxima Calidad y Confianza">
                        <span className="material-symbols-outlined text-sm block">workspace_premium</span>
                      </div>
                    )}
                    {isVerified && (
                      <div className="bg-primary text-white p-1 rounded-full border-2 border-background-light dark:border-background-dark" title="Perfil Verificado">
                        <span className="material-symbols-outlined text-sm block">verified</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
              <h1 className="text-primary dark:text-slate-100 text-2xl lg:text-3xl font-bold leading-tight tracking-tight">{professional.name}</h1>
              {isVerified && (
                <div className="flex items-center gap-1 mt-2 bg-primary/10 dark:bg-teal-500/20 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary dark:text-teal-400 text-sm">verified</span>
                  <p className="text-primary dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">Especialista Verificado</p>
                </div>
              )}
              <div className="flex flex-col items-center md:items-start gap-2 mt-4">
                <StarRating rating={professional.rating} />
                <p className="text-primary/60 dark:text-slate-400 text-sm font-medium">{professional.reviews} reseñas completadas</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-4 bg-white/40 dark:bg-slate-800/40 mx-4 lg:mx-8 rounded-2xl shadow-sm border border-primary/5 dark:border-slate-700">
          <h3 className="text-primary dark:text-slate-100 tracking-tight text-xl font-bold leading-tight pb-3">Biografía</h3>
          <p className="text-primary/80 dark:text-slate-300 text-base font-normal leading-relaxed">{professional.bio}</p>
        </section>

        {/* Galería de Trabajos Realizados */}
        {portfolio.length > 0 && (
          <section className="px-6 lg:px-8 pt-8">
            <h3 className="text-primary dark:text-slate-100 tracking-tight text-xl font-bold leading-tight mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary/60 dark:text-teal-400">photo_library</span>
              Galería de Trabajos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {portfolio.map(photo => (
                <div 
                  key={photo.id} 
                  onClick={() => setLightboxImage(`https://senn-fix-backend-api.onrender.com/${photo.image_url}`)}
                  className="aspect-square rounded-2xl overflow-hidden border border-primary/10 cursor-pointer hover:opacity-95 hover:scale-[1.01] transition-all relative group bg-slate-50 dark:bg-slate-900 shadow-sm"
                >
                  <img src={`https://senn-fix-backend-api.onrender.com/${photo.image_url}`} alt="Trabajo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección de Reseñas */}
        <section className="px-6 lg:px-8 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary dark:text-slate-100 tracking-tight text-xl font-bold leading-tight">Reseñas ({reviews.length})</h3>
            {canWriteReview && (
              <button onClick={() => setShowReviewForm(true)} className="bg-primary/10 text-primary dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors">
                Escribir reseña
              </button>
            )}
          </div>
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map(review => ( // Mostramos solo las 3 primeras por ahora
                <div key={review.id} className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl border border-primary/5 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={review.clientImageUrl} alt={review.clientName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-primary/90 dark:text-slate-200">{review.clientName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <p className="text-primary/80 dark:text-slate-300 text-sm">{review.comment}</p>
                </div>
              ))
            ) : <p className="text-primary/60 dark:text-slate-400 text-sm">Este profesional aún no tiene reseñas. ¡Sé el primero!</p>}
          </div>
        </section>

        <section className="px-6 lg:px-8 pt-6">
          <h3 className="text-primary dark:text-slate-100 tracking-tight text-xl font-bold leading-tight pb-3">Información de Contacto</h3>
          <div className="space-y-4 text-primary/90 dark:text-slate-200">
            <div className="flex items-center gap-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary/70 dark:text-slate-400">call</span>
              <span className="font-medium ">{professional.phone_number}</span>
            </div>
            {professional.has_store === 1 && professional.store_address && (
              <div className="flex items-start gap-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary/70 dark:text-slate-400 mt-1">storefront</span>
                <div>
                  <p className="font-bold">Tienda o Local Físico</p>
                  {professional.store_address && <p className="text-sm text-primary/80 dark:text-slate-300">{professional.store_address}</p>}
                </div>
              </div>
            )}
            {professional.latitude && professional.longitude && (
              <div className="h-64 w-full rounded-lg overflow-hidden relative z-0 mt-2 border border-primary/10 dark:border-slate-700">
                <MapContainer center={[professional.latitude, professional.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[professional.latitude, professional.longitude]} icon={customIcon}>
                    <Popup>{professional.name}</Popup>
                  </Marker>
                  <MapResizer />
                </MapContainer>
              </div>
            )}
            {professional.services_offered && (
              <div className="p-3">
                <p className="font-bold mb-1">Servicios Adicionales:</p>
                <p className="text-sm text-primary/80 dark:text-slate-300 whitespace-pre-line">{professional.services_offered}</p>
              </div>
            )}
          </div>
        </section>

        {!isOwnProfile && (
          <div className="flex justify-center px-6 lg:px-8 pt-8">
            <button onClick={handleStartChat} className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/95 text-white px-10 py-4 rounded-2xl shadow-xl transition-all active:scale-95">
              <span className="material-symbols-outlined">forum</span>
              <span className="text-base font-bold tracking-tight">Chatear ahora</span>
            </button>
          </div>
        )}
        {chatError && <p className="text-red-500 text-sm text-center mt-4">{chatError}</p>}

        {/* Modal para escribir reseña */}
        {showReviewForm && (
          <ReviewForm
            professionalId={professionalId}
            onClose={() => setShowReviewForm(false)}
            onReviewSubmit={handleReviewSubmitted}
          />
        )}

        {/* Lightbox Modal de Imagen del Portafolio */}
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] cursor-pointer animate-fade-in p-4 animate-feedback"
          >
            <button 
              onClick={() => setLightboxImage(null)} 
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center size-10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <img 
              src={lightboxImage} 
              alt="Trabajo Ampliado" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
            />
          </div>
        )}
      </main>
    </>
  );
}

export default Profile;