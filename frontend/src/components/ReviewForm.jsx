import React, { useState } from 'react';

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
            className="transition-transform duration-150 ease-in-out hover:scale-125"
          >
            <span
              className={`material-symbols-outlined !text-4xl ${
                starValue <= rating ? 'text-amber-500 fill-1' : 'text-slate-300'
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

function ReviewForm({ professionalId, onClose, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0) {
      setError('Por favor, selecciona una calificación de estrellas.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.API_URL}/api/professionals/${professionalId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar la reseña.');

      onReviewSubmit(); // Llama a la función para refrescar los datos
      onClose(); // Cierra el modal

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-primary text-center mb-4">Escribe tu reseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-primary/80 block mb-2 text-center">Tu calificación</label>
            <StarInput rating={rating} setRating={setRating} />
          </div>
          <div>
            <label className="text-sm font-bold text-primary/80 block mb-2">Tu comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary"
              placeholder="Describe tu experiencia con este profesional..."
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-lg transition-all active:scale-95">Publicar Reseña</button>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;