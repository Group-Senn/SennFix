import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

const relativeTime = (iso) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (days < 30) return rtf.format(-days, 'day');
  if (days < 365) return rtf.format(-Math.floor(days / 30), 'month');
  return rtf.format(-Math.floor(days / 365), 'year');
};

// Ficha de una publicación: quién la hizo, qué trabajo es, me gusta y cómo contactarle
function ExplorePostDialog({ post, isOwn, chatError, onClose, onLike, onChat }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const likes = post.likes_count || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-post-title"
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 md:max-h-[560px] md:flex-row"
      >
        <div className="relative h-64 w-full shrink-0 bg-slate-200 dark:bg-slate-700 md:h-auto md:min-h-[360px] md:w-1/2">
          <img
            src={getAbsoluteImageUrl(post.image_url)}
            onError={(e) => { e.target.style.visibility = 'hidden'; }}
            alt={post.description || `Trabajo de ${post.professional_name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 md:p-6">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border-none bg-black/40 text-white cursor-pointer md:bg-slate-100 md:text-slate-700 dark:md:bg-slate-700 dark:md:text-slate-200"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>

          <Link to={`/profile/${post.professional_id}`} onClick={onClose} className="flex items-center gap-3 pr-10">
            <img
              src={getAbsoluteImageUrl(post.professional_image)}
              onError={handleImageError}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="min-w-0">
              <span id="explore-post-title" className="block truncate font-display text-lg font-bold text-ink dark:text-white">{post.professional_name}</span>
              <span className="block truncate text-sm text-muted dark:text-slate-400">{post.specialty}</span>
            </span>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.sponsorship_level > 0 && (
              <span className="rounded-full bg-casco px-2.5 py-1 text-xs font-bold text-primary">Patrocinado</span>
            )}
            {post.has_gold_seal && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary px-2.5 py-1 text-xs font-bold text-primary dark:border-teal-400 dark:text-teal-400">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">workspace_premium</span>
                Sello de Oro
              </span>
            )}
            {post.zone && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink dark:text-slate-200">
                <span className="material-symbols-outlined text-base text-primary dark:text-teal-400" aria-hidden="true">location_on</span>
                {post.zone}
              </span>
            )}
            <span className="text-xs text-muted dark:text-slate-400">{relativeTime(post.created_at)}</span>
          </div>

          {post.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-ink dark:text-slate-300">{post.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              onClick={() => onLike(post)}
              aria-pressed={Boolean(post.liked_by_me)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold cursor-pointer ${post.liked_by_me
                ? 'border-red-700 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300'
                : 'border-slate-300 bg-white text-ink dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ fontVariationSettings: `'FILL' ${post.liked_by_me ? 1 : 0}` }}>favorite</span>
              Me gusta
            </button>
            <span className="text-sm text-muted dark:text-slate-400" role="status">
              {likes === 0 ? 'Sé la primera persona en dar me gusta' : `${likes} me gusta`}
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
            <Link to={`/profile/${post.professional_id}`} onClick={onClose} className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-primary dark:border-slate-600 dark:text-teal-400">
              Ver perfil
            </Link>
            {!isOwn && (
              <button onClick={() => onChat(post.professional_id)} className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border-none bg-primary px-4 py-3 font-bold text-white cursor-pointer">
                <span className="material-symbols-outlined" aria-hidden="true">forum</span>
                Escribir por chat
              </button>
            )}
          </div>
          {chatError && <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-400" role="alert">{chatError}</p>}
        </div>
      </div>
    </div>
  );
}

export default ExplorePostDialog;
