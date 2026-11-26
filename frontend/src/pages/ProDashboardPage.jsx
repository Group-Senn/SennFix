import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ColdStartNote from '../components/ColdStartNote';

const formatRating = (n) => Number(n || 0).toFixed(1).replace('.', ',');
const formatDate = (iso) => new Date(iso).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

function Stat({ icon, value, label, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <span className="material-symbols-outlined text-2xl text-primary dark:text-teal-400" aria-hidden="true">{icon}</span>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-ink dark:text-slate-200">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted dark:text-slate-400">{hint}</p>}
    </div>
  );
}

// Panel del profesional: cómo le va en SENN Fix (reemplaza al mapa, que es una herramienta para clientes)
function ProDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch(`${window.API_URL}/api/professionals/me/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData(await response.json());
    } catch (err) {
      console.error('Error al cargar el panel:', err);
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = (user?.name || '').split(' ')[0];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-4 md:px-8 md:pt-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary dark:text-white md:text-4xl">
        {firstName ? `Hola, ${firstName}` : 'Tu panel'}
      </h1>
      <p className="mt-1 text-muted dark:text-slate-400">Así te está yendo en SENN Fix.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="font-semibold text-ink dark:text-slate-100">No pudimos cargar tu panel.</p>
          <button onClick={load} className="mt-4 cursor-pointer rounded-xl border-none bg-primary px-4 py-2.5 text-sm font-bold text-white">Reintentar</button>
        </div>
      ) : !data ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando tu panel">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />)}
          </div>
          <ColdStartNote />
        </>
      ) : (
        <>
          {!data.verified && (
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-casco/20 p-4 text-sm font-semibold text-ink dark:text-slate-100">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">hourglass_top</span>
              Tu perfil todavía está en revisión. Cuando un administrador lo verifique, aparecerás con el sello «Verificado».
            </p>
          )}

          {/* Posición en su oficio: lo más motivador va primero y en grande */}
          {data.ranking && (
            <section className="mt-6 flex items-center gap-5 rounded-2xl bg-primary p-5 text-white md:p-6" aria-label="Tu posición">
              <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-casco text-primary">
                <span className="text-xs font-bold uppercase">Puesto</span>
                <span className="font-display text-3xl font-extrabold leading-none tabular-nums">{data.ranking.position}</span>
              </div>
              <div>
                <p className="font-display text-xl font-extrabold">
                  {data.ranking.position === 1 ? 'Eres el mejor calificado' : `Puesto ${data.ranking.position} de ${data.ranking.total}`}
                </p>
                <p className="text-sm text-white/80">
                  entre {data.ranking.total} {data.ranking.total === 1 ? 'profesional' : 'profesionales'} de {data.ranking.specialty}, según calificación y reseñas.
                </p>
              </div>
            </section>
          )}

          <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tus números">
            <Stat icon="group" value={data.clients} label={data.clients === 1 ? 'Cliente' : 'Clientes'} hint="Te contrataron o te escribieron" />
            <Stat icon="task_alt" value={data.jobs.completed} label="Trabajos terminados" hint="Confirmados por el cliente" />
            <Stat icon="pending_actions" value={data.jobs.waiting_confirmation} label="Esperando confirmación" hint="Ya los marcaste como terminados" />
            <Stat icon="star" value={formatRating(data.rating)} label="Calificación" hint={`${data.reviewCount} ${data.reviewCount === 1 ? 'reseña' : 'reseñas'}`} />
          </section>

          {(data.jobs.in_progress > 0 || data.jobs.dispute > 0 || data.likes > 0) && (
            <p className="mt-3 text-sm text-muted dark:text-slate-400">
              {[
                data.jobs.in_progress > 0 && `${data.jobs.in_progress} en curso`,
                data.jobs.dispute > 0 && `${data.jobs.dispute} en mediación`,
                data.likes > 0 && `${data.likes} me gusta en tus trabajos de Explorar`,
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          <section className="mt-8" aria-labelledby="resenas-titulo">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="resenas-titulo" className="text-xl font-extrabold text-primary dark:text-white">Últimas reseñas</h2>
              {user?.id && <Link to={`/profile/${user.id}`} className="text-sm font-bold text-primary hover:underline dark:text-teal-400">Ver todas</Link>}
            </div>
            {data.latestReviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-muted dark:border-slate-700 dark:text-slate-400">
                Aún no tienes reseñas. Llegan cuando un cliente confirma un trabajo terminado.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.latestReviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-bold text-ink dark:text-slate-100">{review.client_name}</span>
                      <span className="shrink-0 text-sm font-bold text-ink dark:text-slate-100">
                        <span className="text-casco" aria-hidden="true">★</span> {review.rating}<span className="sr-only"> de 5</span>
                      </span>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-ink dark:text-slate-300">{review.comment}</p>}
                    <p className="mt-1 text-xs text-muted dark:text-slate-400">{formatDate(review.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8 grid gap-2 sm:grid-cols-3" aria-label="Accesos rápidos">
            {[
              { to: user?.id ? `/profile/${user.id}` : '/my-profile', icon: 'visibility', text: 'Ver mi perfil público' },
              { to: user?.id ? `/profile/edit/${user.id}` : '/my-profile', icon: 'edit', text: 'Editar mi perfil' },
              { to: '/explore', icon: 'add_a_photo', text: 'Publicar un trabajo' },
            ].map((action) => (
              <Link key={action.text} to={action.to} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 font-semibold text-ink transition-colors hover:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-400">
                <span className="material-symbols-outlined text-primary dark:text-teal-400" aria-hidden="true">{action.icon}</span>
                {action.text}
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default ProDashboardPage;
