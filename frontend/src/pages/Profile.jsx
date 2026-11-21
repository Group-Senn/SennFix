import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ProfileSkeleton from '../components/ProfileSkeleton';
import ColdStartNote from '../components/ColdStartNote';
import MinorAlert from '../components/MinorAlert';
import { getAbsoluteImageUrl, handleImageError, handleGalleryError } from '../utils/imageHelper';
import AdBanner from '../components/AdBanner';

// Icono propio para que el marcador no se rompa en móvil
const storeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#043F3B" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Leaflet necesita recalcular su tamaño cuando el contenedor ya es visible
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const REVIEWS_PREVIEW = 3;
const formatRating = (value) => value.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Profile() {
  const { id: professionalId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [chatError, setChatError] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchProfessionalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profResponse = await fetch(`${window.API_URL}/api/professionals/${professionalId}`);
      if (!profResponse.ok) throw new Error('No encontramos a este profesional.');
      setProfessional(await profResponse.json());

      const reviewsResponse = await fetch(`${window.API_URL}/api/professionals/${professionalId}/reviews`);
      if (!reviewsResponse.ok) throw new Error('No pudimos cargar las reseñas.');
      setReviews(await reviewsResponse.json());

      const portResponse = await fetch(`${window.API_URL}/api/professionals/${professionalId}/portfolio`);
      if (portResponse.ok) setPortfolio(await portResponse.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchProfessionalData();
  }, [fetchProfessionalData]);

  // Cerrar la foto ampliada con Escape
  useEffect(() => {
    if (!lightboxImage) return;
    const onKey = (e) => e.key === 'Escape' && setLightboxImage(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxImage]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setChatError('');
    try {
      const response = await fetch(window.API_URL + '/api/chats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ recipientId: professionalId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo abrir el chat.');
      navigate(`/chats/${data.conversationId}`);
    } catch (err) {
      console.error(err);
      setChatError(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <ProfileSkeleton />
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8"><ColdStartNote /></div>
      </>
    );
  }

  if (error) {
    return (
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-display text-2xl font-extrabold text-primary dark:text-white">{error}</p>
        <p className="mt-2 text-muted dark:text-slate-400">Puede que el perfil ya no esté activo.</p>
        <Link to="/home" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-white">Volver al inicio</Link>
      </main>
    );
  }

  if (!professional) return null;

  const isOwnProfile = isAuthenticated && String(user?.id) === String(professionalId);
  const canWriteReview = isAuthenticated && user?.user_type === 'client' && !isOwnProfile;
  // Calificación y cantidad salen de las reseñas que se muestran: así nunca se contradicen
  const reviewCount = reviews.length;
  const average = reviewCount ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount : null;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, REVIEWS_PREVIEW);
  const hashtags = professional.hashtags ? professional.hashtags.split(' ').filter(Boolean) : [];
  const services = (professional.services_offered || '').split(/\n|,/).map(s => s.trim()).filter(Boolean);
  // La ubicación exacta solo se muestra si es un local abierto al público; si no, suele ser su casa
  const showStoreMap = professional.has_store && professional.latitude && professional.longitude;

  const actions = isOwnProfile ? (
    <Link to={`/profile/edit/${professionalId}`} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white">
      <span className="material-symbols-outlined" aria-hidden="true">edit</span>
      Editar mi perfil
    </Link>
  ) : (
    <>
      <button onClick={handleStartChat} className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 py-3 font-bold text-white cursor-pointer border-none">
        <span className="material-symbols-outlined" aria-hidden="true">forum</span>
        Escribir por chat
      </button>
      {professional.phone_number && (
        <a href={`tel:${professional.phone_number}`} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 font-bold text-primary dark:text-teal-400">
          <span className="material-symbols-outlined" aria-hidden="true">call</span>
          Llamar
        </a>
      )}
    </>
  );

  return (
    <>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-12">
        <button onClick={() => navigate(-1)} className="-ml-2 mb-3 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-primary dark:text-teal-400 bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          Volver
        </button>

        {professional.is_minor && <div className="mb-4 -mx-4 lg:-mx-8"><MinorAlert /></div>}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
          {/* Credencial: fija en escritorio para que las acciones estén siempre a mano */}
          <aside className="lg:sticky lg:top-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-14 bg-primary dark:bg-slate-700 flex justify-center pt-2.5" aria-hidden="true">
              <span className="w-12 h-1.5 rounded-full bg-white/30" />
            </div>
            <div className="px-5 pb-5 -mt-10">
              <img
                src={getAbsoluteImageUrl(professional.imageUrl)}
                onError={handleImageError}
                alt={professional.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700"
              />
              <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink dark:text-white">{professional.name}</h1>
              {professional.specialty && <p className="text-muted dark:text-slate-400">{professional.specialty}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {professional.verified && (
                  <span className="verified-seal animate-stamp inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-double border-primary dark:border-teal-400 text-primary dark:text-teal-400">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">verified</span>
                    <span className="font-display text-xs font-extrabold uppercase tracking-wider">Verificado por SENN</span>
                  </span>
                )}
                {professional.has_gold_seal && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-casco px-2.5 py-1 text-xs font-bold text-primary">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">workspace_premium</span>
                    Sello de Oro
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-semibold text-ink dark:text-slate-200">
                {average !== null ? (
                  <>
                    <span className="text-casco" aria-hidden="true">★</span> {formatRating(average)}
                    <span className="font-normal text-muted dark:text-slate-400"> · {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}</span>
                  </>
                ) : <span className="font-normal text-muted dark:text-slate-400">Nuevo · aún sin reseñas</span>}
              </p>

              {professional.is_online && (
                <p className="mt-3">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-casco text-primary text-xs font-bold px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    Disponible ahora
                  </span>
                </p>
              )}

              {hashtags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Especialidades">
                  {hashtags.map(tag => (
                    <li key={tag} className="rounded-full border border-slate-200 dark:border-slate-600 px-2.5 py-0.5 text-xs font-semibold text-muted dark:text-slate-300">{tag}</li>
                  ))}
                </ul>
              )}

              <div className="mt-5 hidden md:flex md:flex-col gap-2">{actions}</div>
              {chatError && <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-400" role="alert">{chatError}</p>}
            </div>
          </aside>

          <div className="space-y-10 min-w-0">
            {professional.bio && (
              <section aria-labelledby="sobre-mi">
                <h2 id="sobre-mi" className="mb-2 text-xl font-extrabold text-primary dark:text-white">Sobre mí</h2>
                <p className="leading-relaxed text-ink dark:text-slate-300 whitespace-pre-line">{professional.bio}</p>
              </section>
            )}

            {services.length > 0 && (
              <section aria-labelledby="servicios">
                <h2 id="servicios" className="mb-3 text-xl font-extrabold text-primary dark:text-white">Servicios que ofrece</h2>
                <ul className="flex flex-wrap gap-2">
                  {services.map(service => (
                    <li key={service} className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-sm font-semibold text-ink dark:text-slate-200">{service}</li>
                  ))}
                </ul>
              </section>
            )}

            {portfolio.length > 0 && (
              <section aria-labelledby="trabajos">
                <h2 id="trabajos" className="mb-3 text-xl font-extrabold text-primary dark:text-white">Trabajos realizados</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((photo, i) => (
                    <li key={photo.id}>
                      <button
                        onClick={() => setLightboxImage(getAbsoluteImageUrl(photo.image_url))}
                        aria-label={`Ampliar trabajo ${i + 1}`}
                        className="block w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer p-0"
                      >
                        <img src={getAbsoluteImageUrl(photo.image_url)} onError={handleGalleryError} alt="" className="w-full h-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <AdBanner />

            <section aria-labelledby="resenas">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="resenas" className="text-xl font-extrabold text-primary dark:text-white">
                  Reseñas <span className="text-base font-semibold text-muted dark:text-slate-400">({reviewCount})</span>
                </h2>
                {canWriteReview && (
                  <button onClick={() => setShowReviewForm(true)} className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-primary dark:text-teal-400 cursor-pointer">
                    Escribir reseña
                  </button>
                )}
              </div>
              {reviewCount > 0 ? (
                <>
                  <ul className="space-y-3">
                    {visibleReviews.map(review => (
                      <li key={review.id} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                        <div className="mb-2 flex items-center gap-3">
                          <img src={getAbsoluteImageUrl(review.clientimageurl || review.clientImageUrl)} onError={handleImageError} alt={review.clientname || review.clientName} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-ink dark:text-slate-100">{review.clientname || review.clientName}</p>
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-ink dark:text-slate-300">{review.comment}</p>}
                      </li>
                    ))}
                  </ul>
                  {reviewCount > REVIEWS_PREVIEW && (
                    <button onClick={() => setShowAllReviews(v => !v)} className="mt-3 text-sm font-bold text-primary dark:text-teal-400 underline bg-transparent border-none cursor-pointer p-0">
                      {showAllReviews ? 'Ver menos' : `Ver las ${reviewCount} reseñas`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-muted dark:text-slate-400">
                  {canWriteReview ? 'Aún no tiene reseñas. Si trabajó contigo, cuéntales a otros cómo te fue.' : 'Aún no tiene reseñas.'}
                </p>
              )}
            </section>

            <section aria-labelledby="donde">
              <h2 id="donde" className="mb-3 text-xl font-extrabold text-primary dark:text-white">Dónde trabaja</h2>
              {professional.has_store && professional.store_address && (
                <p className="mb-3 flex items-start gap-2 text-ink dark:text-slate-200">
                  <span className="material-symbols-outlined text-primary dark:text-teal-400" aria-hidden="true">storefront</span>
                  <span><span className="font-bold">Local:</span> {professional.store_address}</span>
                </p>
              )}
              <p className="flex items-start gap-2 text-ink dark:text-slate-200">
                <span className="material-symbols-outlined text-primary dark:text-teal-400" aria-hidden="true">radar</span>
                Atiende en un radio de {professional.action_radius || 10} km.
              </p>
              {showStoreMap && (
                <div className="mt-3 h-64 w-full rounded-2xl overflow-hidden relative z-0 border border-slate-200 dark:border-slate-700">
                  <MapContainer center={[professional.latitude, professional.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[professional.latitude, professional.longitude]} icon={storeIcon} />
                    <MapResizer />
                  </MapContainer>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Celular: acciones fijas sobre la barra de pestañas, siempre visibles */}
      <div className="md:hidden fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex gap-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3">
        {actions}
      </div>

      {showReviewForm && (
        <ReviewForm
          professionalId={professionalId}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmit={fetchProfessionalData}
        />
      )}

      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto del trabajo"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] cursor-pointer p-4"
        >
          <button
            onClick={() => setLightboxImage(null)}
            aria-label="Cerrar"
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center size-11 border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">close</span>
          </button>
          <img src={lightboxImage} onError={handleGalleryError} alt="Trabajo ampliado" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </>
  );
}

export default Profile;
