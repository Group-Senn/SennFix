import React from 'react';

// El número va en color de texto (el ámbar anterior daba ~2:1 de contraste); la estrella es decorativa
function StarRating({ rating }) {
  const formattedRating = Number(rating || 0).toFixed(1).replace('.', ',');

  return (
    <div className="flex items-center gap-1 font-bold text-sm text-ink dark:text-slate-100">
      <span className="text-casco" aria-hidden="true">★</span>
      <span>{formattedRating}</span>
      <span className="sr-only">de 5 estrellas</span>
    </div>
  );
}

export default StarRating;
