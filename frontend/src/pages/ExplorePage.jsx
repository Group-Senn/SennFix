import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAbsoluteImageUrl } from '../utils/imageHelper';
import SearchBar from '../components/SearchBar';
import AdBanner from '../components/AdBanner';
import ExplorePostDialog from '../components/ExplorePostDialog';
import ExploreUploadDialog from '../components/ExploreUploadDialog';

// Explorar: un mosaico de trabajos reales para descubrir profesionales (como la lupa de Instagram)
function ExplorePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [chatError, setChatError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [published, setPublished] = useState(false);
  const triggerRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(window.API_URL + '/api/explore/posts', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar Explorar:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!published) return;
    const timer = setTimeout(() => setPublished(false), 8000);
    return () => clearTimeout(timer);
  }, [published]);

  const selectedPost = posts.find(p => p.id === selectedId) || null;

  const openPost = (post, element) => {
    triggerRef.current = element;
    setChatError('');
    setSelectedId(post.id);
  };

  const closePost = useCallback(() => {
    setSelectedId(null);
    triggerRef.current?.focus();
  }, []);

  const handleLike = async (post) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await fetch(`${window.API_URL}/api/explore/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, likes_count: data.likes_count, liked_by_me: data.liked } : p)));
    } catch (err) {
      console.error('Error al dar me gusta:', err);
    }
  };

  const handleChat = async (professionalId) => {
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
      setChatError(err.message);
    }
  };

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-white">Explorar</h1>
          <p className="mt-1 text-muted dark:text-slate-400">Trabajos reales de profesionales de Santa Cruz.</p>
        </div>
        {user?.user_type === 'professional' && (
          <button onClick={() => setShowUpload(true)} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border-none bg-primary px-4 py-2.5 font-bold text-white cursor-pointer">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">add_a_photo</span>
            <span className="hidden sm:inline">Publicar un trabajo</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        )}
      </div>

      {/* En pantallas grandes la búsqueda ya está en el encabezado */}
      <div className="max-w-xl lg:hidden"><SearchBar /></div>

      {published && (
        <p role="status" className="mt-4 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
          Listo. Un administrador revisará tu foto y se verá aquí cuando la apruebe.
        </p>
      )}

      <AdBanner />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando trabajos">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="font-semibold text-ink dark:text-slate-100">No pudimos cargar los trabajos.</p>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">Revisa tu conexión e inténtalo de nuevo.</p>
            <button onClick={fetchPosts} className="mt-4 rounded-xl border-none bg-primary px-4 py-2.5 text-sm font-bold text-white cursor-pointer">Reintentar</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <span className="material-symbols-outlined text-5xl text-muted dark:text-slate-500" aria-hidden="true">photo_library</span>
            <p className="mt-2 font-semibold text-ink dark:text-slate-100">Aún no hay trabajos publicados.</p>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">
              {user?.user_type === 'professional' ? 'Sé el primero: sube una foto de un trabajo que hayas hecho.' : 'Los profesionales irán subiendo fotos de sus trabajos.'}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {posts.map(post => (
              <li key={post.id}>
                <button
                  onClick={(e) => openPost(post, e.currentTarget)}
                  aria-label={`${post.professional_name}, ${post.specialty}${post.description ? `: ${post.description}` : ''}`}
                  className="group relative block aspect-square w-full overflow-hidden rounded-xl border-none bg-slate-200 p-0 cursor-pointer dark:bg-slate-800"
                >
                  {/* Si la foto no carga queda el recuadro neutro: una imagen de relleno haría pasar un trabajo falso por real */}
                  <img src={getAbsoluteImageUrl(post.image_url)} onError={(e) => { e.target.style.visibility = 'hidden'; }} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {post.sponsorship_level > 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-casco px-2 py-0.5 text-xs font-bold text-primary">Patrocinado</span>
                  )}
                  {/* Siempre visible: en celular no existe el "pasar el mouse" */}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 text-left">
                    <span className="block truncate text-sm font-bold text-white">{post.professional_name}</span>
                    <span className="block truncate text-xs text-white/85">{post.specialty}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPost && (
        <ExplorePostDialog
          post={selectedPost}
          isOwn={String(user?.id) === String(selectedPost.professional_id)}
          chatError={chatError}
          onClose={closePost}
          onLike={handleLike}
          onChat={handleChat}
        />
      )}

      {showUpload && (
        <ExploreUploadDialog
          onClose={() => setShowUpload(false)}
          onPublished={() => {
            setShowUpload(false);
            setPublished(true);
            fetchPosts();
          }}
        />
      )}
    </main>
  );
}

export default ExplorePage;
