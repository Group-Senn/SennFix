import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoNav from '../assets/logoNav.svg';
import logoNavDark from '../assets/logoNavDark.svg';
import letra from '../assets/letra.svg';
import letraDark from '../assets/letraDark.svg';
import ThemeSwitcher from '../components/ThemeSwitcher';
import SearchBar from '../components/SearchBar';
import ProfessionalCredential from '../components/ProfessionalCredential';

// Oficios más pedidos en el hogar; el nombre debe coincidir con el de la base de datos
const POPULAR_TRADES = [
  { name: 'Plomero / Fontanero', label: 'Plomero', icon: 'plumbing' },
  { name: 'Electricista (Baja Tensión / Residencial)', label: 'Electricista', icon: 'electrical_services' },
  { name: 'Albañil / Maestro de Obra', label: 'Albañil', icon: 'construction' },
  { name: 'Limpieza de Casas / Hogar', label: 'Limpieza', icon: 'cleaning_services' },
  { name: 'Pintor Domiciliario', label: 'Pintor', icon: 'format_paint' },
  { name: 'Gasista Domiciliario', label: 'Gasista', icon: 'propane' },
  { name: 'Instalador de Cerrajería / Cerrajero', label: 'Cerrajero', icon: 'lock_open' },
  { name: 'Jardinero', label: 'Jardinero', icon: 'yard' },
];

const STEPS = [
  { title: 'Busca el oficio', text: 'Escribe lo que necesitas o elige un oficio. Te mostramos a quienes trabajan en Santa Cruz.' },
  { title: 'Revisa su credencial', text: 'Mira si está verificado, sus reseñas y sus trabajos antes de escribirle.' },
  { title: 'Acuerda por chat', text: 'Explícale el trabajo, pídele un precio y acuerden el día. Sin intermediarios.' },
];

function Landing() {
  const [professionals, setProfessionals] = useState(null);

  useEffect(() => {
    fetch(`${window.API_URL}/api/professionals`)
      .then(res => (res.ok ? res.json() : []))
      .then(list => {
        // Primero verificados, luego disponibles ahora, luego mejor calificados
        const sorted = [...list].sort((a, b) =>
          (b.verified - a.verified) || (b.is_online - a.is_online) || ((b.rating || 0) - (a.rating || 0))
        );
        setProfessionals(sorted.slice(0, 4));
      })
      .catch(() => setProfessionals([]));
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark text-ink dark:text-slate-100">
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="SENN Fix, inicio">
          <img src={logoNav} alt="" className="h-8 w-auto dark:hidden" />
          <img src={logoNavDark} alt="" className="h-8 w-auto hidden dark:block" />
          <img src={letra} alt="" className="h-5 w-auto dark:hidden" />
          <img src={letraDark} alt="" className="h-5 w-auto hidden dark:block" />
        </Link>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <ThemeSwitcher />
          <Link
            to="/login"
            className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold text-primary dark:text-teal-400 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Búsqueda: lo primero que alguien viene a hacer */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-12 md:pt-16 md:pb-20">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-primary dark:text-white max-w-3xl">
            ¿Qué necesitas arreglar hoy?
          </h1>
          <p className="mt-4 text-lg text-muted dark:text-slate-300 max-w-xl">
            Plomeros, electricistas, albañiles y más en Santa Cruz. Revisa la credencial de cada uno antes de escribirle.
          </p>
          <div className="max-w-2xl">
            <SearchBar />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Oficios más pedidos">
            {POPULAR_TRADES.map(trade => (
              <li key={trade.name}>
                <Link
                  to={`/services/${trade.name}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-ink dark:text-slate-200 hover:border-primary dark:hover:border-teal-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-primary dark:text-teal-400" aria-hidden="true">{trade.icon}</span>
                  {trade.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Personas reales, con su credencial */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white">Profesionales en Santa Cruz</h2>
            <Link to="/home" className="shrink-0 text-sm font-bold text-primary dark:text-teal-400 hover:underline">Ver todos</Link>
          </div>
          {professionals === null ? (
            <div className="flex gap-3 overflow-hidden lg:grid lg:grid-cols-4 lg:gap-4" aria-busy="true" aria-label="Cargando profesionales">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-56 w-64 shrink-0 lg:w-auto rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : professionals.length > 0 ? (
            <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
              {professionals.map(pro => (
                <li key={pro.id} className="w-64 shrink-0 snap-start lg:w-auto"><ProfessionalCredential professional={pro} /></li>
              ))}
            </ul>
          ) : (
            <p className="text-muted dark:text-slate-400">
              Pronto verás aquí a los profesionales de tu zona. <Link to="/home" className="font-bold text-primary dark:text-teal-400 underline">Explorar oficios</Link>
            </p>
          )}
        </section>

        {/* Cómo funciona: aquí la numeración sí es una secuencia */}
        <section className="bg-white dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8">Cómo funciona</h2>
            <ol className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-display text-4xl font-extrabold leading-none text-primary/25 dark:text-teal-400/40" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink dark:text-slate-100">{step.title}</h3>
                    <p className="mt-1 text-muted dark:text-slate-400">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Qué significa el sello: la promesa que nos diferencia */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="verified-seal inline-flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-double border-primary dark:border-teal-400 text-primary dark:text-teal-400">
              <span className="material-symbols-outlined" aria-hidden="true">verified</span>
              <span className="font-display text-sm font-extrabold uppercase tracking-wider">Verificado por SENN</span>
            </span>
            <h2 className="mt-5 text-2xl md:text-3xl font-extrabold text-primary dark:text-white">Qué significa este sello</h2>
            <p className="mt-3 text-muted dark:text-slate-300 max-w-md">
              No es una medalla de adorno. Es la constancia de que revisamos quién es la persona antes de que entre a tu casa.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              ['badge', 'Revisamos su carnet de identidad', 'Anverso y reverso. Lo guardamos con la marca de agua «Solo para uso en SENN Fix».'],
              ['gavel', 'Revisamos sus antecedentes', 'Cuando presenta su certificado FELCC / REJAP, lo vemos antes de aprobarlo.'],
              ['how_to_reg', 'Una persona aprueba cada perfil', 'Nadie aparece en la app hasta que un administrador lo revisa.'],
            ].map(([icon, title, text]) => (
              <li key={title} className="flex gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary dark:text-teal-400" aria-hidden="true">{icon}</span>
                <div>
                  <p className="font-bold text-ink dark:text-slate-100">{title}</p>
                  <p className="text-sm text-muted dark:text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Para quienes trabajan en un oficio */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
          <div className="rounded-3xl bg-primary text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">¿Trabajas en un oficio?</h2>
              <p className="mt-3 text-white/80 max-w-md">Crea tu credencial gratis y recibe clientes de tu zona.</p>
              <Link
                to="/register-professional"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-casco text-primary font-bold hover:brightness-95 transition"
              >
                Registrarme como profesional
                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
            <ul className="space-y-3 text-white/90">
              {[
                'Cobras el 100 % de lo que acuerdas: sin comisiones.',
                'Los clientes de tu zona te ven en el mapa cuando estás disponible.',
                'Tu sello de verificado y tu portafolio te dan confianza.',
              ].map(text => (
                <li key={text} className="flex gap-3">
                  <span className="material-symbols-outlined text-casco" aria-hidden="true">check_circle</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-muted dark:text-slate-400">
          <p>© 2026 Group Senn · Santa Cruz, Bolivia</p>
          <nav aria-label="Legal y contacto" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/legal/terms-and-conditions" className="hover:text-primary dark:hover:text-teal-400">Términos y condiciones</Link>
            <Link to="/legal/privacy-policy" className="hover:text-primary dark:hover:text-teal-400">Privacidad</Link>
            <Link to="/legal/no-labor-relationship" className="hover:text-primary dark:hover:text-teal-400">Deslinde laboral</Link>
            <a href="mailto:soporte@sennfix.com" className="hover:text-primary dark:hover:text-teal-400">soporte@sennfix.com</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
