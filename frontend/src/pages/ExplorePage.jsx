import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

function ExplorePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Estados para subir publicación
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchExplorePosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(window.API_URL + '/api/explore/posts');
      if (!response.ok) {
        throw new Error('No se pudieron cargar las publicaciones del Explorar.');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const handleStartChat = async (proId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(window.API_URL + '/api/chats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: proId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar el chat.');
      }
      navigate(`/chats/${data.conversationId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`${window.API_URL}/api/explore/posts/${postId}/like`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        // Actualizar lista
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: data.likes_count } : p));
        // Actualizar publicación seleccionada
        setSelectedPost(prev => prev && prev.id === postId ? { ...prev, likes_count: data.likes_count } : prev);
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Por favor selecciona una imagen.');
      return;
    }
    setUploading(true);
    setUploadError(null);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', uploadFile);
    formData.append('description', uploadDescription);

    try {
      const response = await fetch(window.API_URL + '/api/explore/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al subir la publicación.');

      // Limpiar formulario y cerrar modal
      setUploadFile(null);
      setUploadPreview(null);
      setUploadDescription('');
      setShowUploadModal(false);
      
      // Recargar publicaciones
      fetchExplorePosts();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getSponsorshipBadge = (level) => {
    if (level >= 100) {
      return (
        <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
          <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
          Patrocinado Oro
        </span>
      );
    } else if (level >= 50) {
      return (
        <span className="bg-teal-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
          <span className="material-symbols-outlined text-[10px]">star</span>
          Patrocinado
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <div className="w-10"></div>
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Explorar</h2>
        {user?.user_type === 'professional' ? (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="text-primary hover:text-primary/80 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 text-xs font-bold bg-transparent border-none cursor-pointer p-1"
          >
            <span className="material-symbols-outlined text-xl">add_a_photo</span>
            <span className="hidden sm:inline">Subir</span>
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6 pb-32 bg-background-light dark:bg-background-dark animate-page-entry max-w-4xl mx-auto w-full">
        {loading && (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center p-12 text-red-500">
            <span className="material-symbols-outlined text-5xl mb-2">error</span>
            <p className="font-bold">Error al cargar publicaciones</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center p-12 text-primary/60 dark:text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-2">grid_on</span>
            <p className="font-bold">No hay publicaciones disponibles</p>
            <p className="text-sm mt-1">Los profesionales aún no han subido fotos a su portafolio.</p>
          </div>
        )}

        {/* Instagram-style explore grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden rounded-lg md:rounded-xl cursor-pointer group shadow-sm bg-slate-100 dark:bg-slate-800"
              >
                {/* Image */}
                <img
                  src={getAbsoluteImageUrl(post.image_url)}
                  onError={handleImageError}
                  alt={post.description}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badges in Corners */}
                {post.sponsorship_level > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-amber-500/90 text-white text-[9px] font-bold p-1 rounded-full flex items-center justify-center shadow-md" title="Publicación Patrocinada">
                      <span className="material-symbols-outlined text-[10px]">campaign</span>
                    </span>
                  </div>
                )}
                {post.has_gold_seal && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-amber-400/95 text-white text-[9px] font-bold p-1 rounded-full flex items-center justify-center shadow-md" title="Profesional Sello de Oro">
                      <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-1.5 p-2 text-white text-center">
                  <span className="font-bold text-xs truncate w-full">{post.professional_name}</span>
                  <span className="text-[10px] opacity-90 truncate w-full">{post.specialty}</span>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-bold">
                    <span className="material-symbols-outlined text-xs text-red-500 fill-current">favorite</span>
                    <span>{post.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Post Modal overlay */}
        {selectedPost && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedPost(null)}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 size-10 rounded-full flex items-center justify-center border-none cursor-pointer z-[2001]"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div 
              className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh] md:max-h-[500px] border border-outline-variant/10 dark:border-slate-700 animate-feedback cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center overflow-hidden relative min-h-[220px] md:min-h-0">
                <img
                  src={getAbsoluteImageUrl(selectedPost.image_url)}
                  onError={handleImageError}
                  alt="Post Detail"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-3 right-3 text-white bg-black/40 hover:bg-black/60 size-8 rounded-full flex items-center justify-center border-none cursor-pointer md:hidden z-10"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col justify-between overflow-y-auto">
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAbsoluteImageUrl(selectedPost.professional_image)}
                        onError={handleImageError}
                        alt={selectedPost.professional_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/25"
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-slate-100 flex items-center gap-1.5">
                          {selectedPost.professional_name}
                        </h4>
                        <p className="text-[11px] text-primary/60 dark:text-slate-400 font-semibold uppercase">{selectedPost.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSponsorshipBadge(selectedPost.sponsorship_level)}
                      <button
                        onClick={() => setSelectedPost(null)}
                        className="text-primary/65 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 flex items-center justify-center p-1.5 rounded-full hover:bg-primary/5 bg-transparent border-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-primary/85 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedPost.description}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => handleLikePost(selectedPost.id)}
                        className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3.5 py-1.5 rounded-full border-none cursor-pointer font-bold text-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm fill-current">favorite</span>
                        <span>Dar Like</span>
                      </button>
                      <span className="text-[11px] text-primary/60 dark:text-slate-400 font-semibold">
                        A {selectedPost.likes_count} personas les gusta esto
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom footer */}
                <div className="border-t border-outline-variant/10 dark:border-slate-700 pt-4 mt-6 flex gap-2">
                  <Link
                    to={`/profile/${selectedPost.professional_id}`}
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 bg-primary/10 hover:bg-primary/15 text-primary dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20 py-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-[0.97]"
                  >
                    Ver Perfil
                  </Link>
                  {user?.id != selectedPost.professional_id && (
                    <button
                      onClick={() => handleStartChat(selectedPost.professional_id)}
                      className="flex-1 bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      Chatear ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal Overlay */}
        {showUploadModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowUploadModal(false)}
          >
            <div 
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-outline-variant/10 dark:border-slate-700 animate-feedback cursor-default space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15 dark:border-slate-750">
                <h3 className="font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-teal-400">add_photo_alternate</span>
                  Nueva Publicación
                </h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary/75 dark:text-slate-350">Imagen de Portafolio <span className="text-red-500">*</span></label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 dark:border-slate-650 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 relative">
                    {uploadPreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-outline-variant/20">
                        <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full size-7 flex items-center justify-center border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                        <span className="material-symbols-outlined text-4xl text-primary/50 dark:text-teal-400/70">upload_file</span>
                        <span className="text-xs font-bold text-primary/70 dark:text-slate-300">Haga clic para elegir una imagen</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary/75 dark:text-slate-350">Descripción / Biografía del Trabajo</label>
                  <textarea 
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 text-primary dark:text-slate-100"
                    placeholder="Escribe algo sobre este trabajo..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Publicar Foto'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default ExplorePage;