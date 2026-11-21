import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl } from '../utils/imageHelper';

// Fotos reales de trabajos en el inicio. Si todavía no hay ninguna aprobada, la sección no aparece.
function RecentWork() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(window.API_URL + '/api/explore/posts')
      .then(r => (r.ok ? r.json() : []))
      .then(data => { if (!cancelled && Array.isArray(data)) setPosts(data.slice(0, 10)); })
      .catch(() => {}); // es un extra del inicio: si falla, simplemente no se muestra
    return () => { cancelled = true; };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="trabajos-titulo">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="trabajos-titulo" className="text-xl md:text-2xl font-extrabold text-primary dark:text-white">Trabajos recientes</h2>
        <Link to="/explore" className="text-sm font-bold text-primary dark:text-teal-400 hover:underline">Ver todos</Link>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {posts.map(post => (
          <li key={post.id} className="w-40 shrink-0 snap-start md:w-52">
            <Link
              to="/explore"
              state={{ openPost: post.id }}
              aria-label={`Trabajo de ${post.professional_name}, ${post.specialty}${post.zone ? `, en ${post.zone}` : ''}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200 transition-transform duration-150 active:scale-[0.96] dark:bg-slate-800"
            >
              <img
                src={getAbsoluteImageUrl(post.image_url)}
                onError={(e) => { e.target.style.visibility = 'hidden'; }}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-10">
                <span className="block truncate text-sm font-bold text-white">{post.professional_name}</span>
                <span className="block truncate text-xs text-white/85">{post.zone || post.specialty}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentWork;
