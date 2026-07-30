import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_TAGS = [
  'Trato respetuoso',
  'Limpieza al trabajar',
  'Precio justo',
  'Puntualidad',
  'Excelente comunicación',
  'Profesionalismo',
  'Solución rápida'
];

function StarInput({ rating, setRating }) {
  return (
    <div className="flex justify-center gap-2">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            onClick={() => setRating(starValue)}
            className="transition-transform duration-150 ease-in-out hover:scale-125 bg-transparent border-none cursor-pointer p-0"
          >
            <span
              className={`material-symbols-outlined !text-4xl ${
                starValue <= rating ? 'text-amber-500 fill-1' : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}

function JobCompletionPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('question'); // 'question', 'review', 'success', 'dispute'
  
  // Review form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const [apiResponse, setApiResponse] = useState('');
  const [brandMessage, setBrandMessage] = useState('');
  const [mediationLoading, setMediationLoading] = useState(false);

  // Verifica que el usuario sea el cliente del trabajo
  useEffect(() => {
    const verifyClient = async () => {
      if (!user) return;
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la información del trabajo.');
        const data = await response.json();

        if (user.id !== data.client_id) {
          setError('No tienes permiso para acceder a esta página.');
          setTimeout(() => navigate('/home'), 3000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    verifyClient();
  }, [jobId, user, navigate]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor, selecciona una calificación de estrellas.');
      return;
    }

    setError('');
    setReviewSubmitLoading(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    formData.append('tags', JSON.stringify(selectedTags));
    if (reviewPhoto) {
      formData.append('reviewPhoto', reviewPhoto);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/client-confirm`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ocurrió un error al procesar el cierre.');

      setApiResponse(data.message);
      setBrandMessage(data.brand_message);
      setView('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleRequestMediation = async () => {
    setError('');
    setMediationLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/request-mediation`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ocurrió un error.');
      
      setApiResponse(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setMediationLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-primary/70">Verificando...</div>;
  }

  if (error && view === 'question') {
    return <div className="flex items-center justify-center h-screen text-red-500 p-4 text-center">{error}</div>;
  }

  const renderContent = () => {
    switch (view) {
      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-primary/50">rate_review</span>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100 mt-2">Valora tu experiencia</h1>
              <p className="text-sm text-primary/70 dark:text-slate-350">Tu opinión nos ayuda a garantizar la calidad del servicio en SENN FIX.</p>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2 text-center">Calificación <span className="text-red-500">*</span></label>
                <StarInput rating={rating} setRating={setRating} />
              </div>

              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Atributos del servicio (Selecciona los que correspondan)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-slate-50 dark:bg-slate-700 border-primary/10 text-primary/80 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Comentario adicional (Opcional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Describe qué tal fue el servicio..."
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Foto de evidencia del trabajo terminado (Opcional)</label>
                <div className="flex flex-col items-center gap-3">
                  <label className="w-full flex flex-col items-center justify-center h-28 border-2 border-dashed border-primary/20 hover:border-primary/45 rounded-xl cursor-pointer bg-slate-50/30 dark:bg-slate-700/30 transition-colors">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Evidencia de reseña" className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center space-y-1">
                        <span className="material-symbols-outlined text-primary/50 text-3xl">add_a_photo</span>
                        <p className="text-xs text-primary/60 dark:text-slate-350">Subir foto del resultado</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-lg font-bold text-base transition-all active:scale-95 disabled:opacity-50"
              >
                {reviewSubmitLoading ? 'Procesando Cierre...' : 'Confirmar y Enviar Reseña'}
              </button>
            </form>
          </div>
        );
      case 'success':
        return (
          <div className="text-center space-y-6 py-6 relative overflow-hidden">
            {/* Animación festiva simple por CSS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <span className="animate-confetti-1 absolute text-2xl" style={{ left: '10%', top: '90%' }}>🎉</span>
              <span className="animate-confetti-2 absolute text-2xl" style={{ left: '30%', top: '90%' }}>✨</span>
              <span className="animate-confetti-3 absolute text-2xl" style={{ left: '50%', top: '90%' }}>🌸</span>
              <span className="animate-confetti-1 absolute text-2xl" style={{ left: '70%', top: '90%' }}>🎉</span>
              <span className="animate-confetti-2 absolute text-2xl" style={{ left: '90%', top: '90%' }}>✨</span>
            </div>

            <span className="material-symbols-outlined text-7xl text-green-500 animate-scale-up">task_alt</span>
            <h1 className="text-3xl font-extrabold text-primary dark:text-slate-100">¡Misión cumplida!</h1>
            
            <div className="bg-green-500/5 dark:bg-teal-500/10 border border-green-500/15 dark:border-teal-500/20 p-5 rounded-2xl max-w-md mx-auto space-y-2">
              <p className="text-primary/90 dark:text-slate-200 text-sm font-semibold">{apiResponse}</p>
              {brandMessage && (
                <p className="text-primary/70 dark:text-teal-400 text-xs italic font-bold">"{brandMessage}"</p>
              )}
            </div>

            <Link 
              to="/home" 
              className="mt-8 inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 border-none"
            >
              Volver al Inicio
            </Link>
          </div>
        );
      case 'dispute':
        return (
          <div className="text-center space-y-6">
            <span className="material-symbols-outlined text-7xl text-amber-500">support_agent</span>
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">¿Deseas iniciar un proceso de Mediación?</h1>
            <p className="text-primary/80 dark:text-slate-300 mt-2 max-w-md mx-auto">
              Si marcas que el servicio no te trajo paz, el trabajo se congelará. Un administrador evaluará las evidencias del servicio para dar una solución.
            </p>
            
            {apiResponse ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-xl text-sm font-bold max-w-md mx-auto">
                {apiResponse}
              </div>
            ) : (
              <button 
                onClick={handleRequestMediation}
                disabled={mediationLoading}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed border-none cursor-pointer"
              >
                <span className="material-symbols-outlined">gavel</span>
                {mediationLoading ? 'Enviando...' : 'Solicitar Mediación SENN'}
              </button>
            )}
            
            <div className="pt-4">
              <Link to="/home" className="text-primary/60 dark:text-slate-400 hover:underline text-sm font-bold">
                Volver al Inicio
              </Link>
            </div>
          </div>
        );
      default: // 'question'
        return (
          <div className="text-center space-y-6 py-4">
            <span className="material-symbols-outlined text-7xl text-primary/50 dark:text-slate-400">sentiment_calm</span>
            <h1 className="text-3xl font-extrabold text-primary dark:text-slate-100 tracking-tight">¿Este servicio te trajo paz?</h1>
            <p className="text-primary/70 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Tu respuesta nos ayuda a mantener la calidad, seguridad y confianza en la comunidad de SENN FIX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-sm mx-auto">
              <button 
                onClick={() => setView('review')} 
                className="w-full sm:w-auto flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg border-none cursor-pointer active:scale-95 shadow-md"
              >
                Sí
              </button>
              <button 
                onClick={() => setView('dispute')} 
                className="w-full sm:w-auto flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg border-none cursor-pointer active:scale-95 shadow-md"
              >
                No
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-primary/5 dark:border-slate-700">
        {renderContent()}
      </div>
    </div>
  );
}

export default JobCompletionPage;