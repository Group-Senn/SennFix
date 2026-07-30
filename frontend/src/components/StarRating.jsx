import React from 'react';

function StarRating({ rating }) {
  const formattedRating = Number(rating || 0).toFixed(1).replace('.', ',');

  return (
    <div className="flex items-center gap-1 font-bold text-sm text-amber-500">
      <span>{formattedRating}</span>
      <span className="material-symbols-outlined text-base fill-1">star</span>
    </div>
  );
}

export default StarRating;