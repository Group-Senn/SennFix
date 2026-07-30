import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

function ProfessionalCard({ professional }) {
  return (
    <Link to={`/profile/${professional.id}`} className="block flex-shrink-0 w-40 md:w-48">
      <div className="relative overflow-hidden rounded-2xl shadow-lg group">
        <img
          src={getAbsoluteImageUrl(professional.imageUrl)}
          onError={handleImageError}
          alt={professional.name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
          <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
            {professional.name}
            {(professional.is_online === true || professional.is_online === 1 || professional.is_online === 'true') && (
              <span className="relative flex h-2.5 w-2.5" title="En línea">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            )}
          </h3>
          <p className="text-xs opacity-80">{professional.specialty}</p>
          <div className="mt-2">
            <StarRating rating={professional.rating} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProfessionalCard;