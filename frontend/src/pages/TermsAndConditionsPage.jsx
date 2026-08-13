import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditionsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-on-background dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <button 
          onClick={handleBack} 
          className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-display text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Términos y Condiciones</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary dark:text-slate-100">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-sm text-primary/60 dark:text-slate-450">
          Última actualización: Julio 2026
        </p>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            1. Aceptación de los Términos
          </h2>
          <p>
            Al descargar, registrarse o utilizar la plataforma tecnológica **SENN FIX** (Senn soluciones), usted acepta quedar vinculado de manera incondicional por los presentes Términos y Condiciones de Uso. Si usted no está de acuerdo con alguno de los puntos establecidos aquí, debe abstenerse de utilizar o acceder a los servicios de la plataforma.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            2. Objeto de la Plataforma
          </h2>
          <p>
            **SENN FIX** actúa como un mero intermediario tecnológico facilitando el contacto entre clientes que buscan contratar asistencia y profesionales independientes debidamente calificados que ofrecen sus servicios de forma autónoma. **SENN FIX** no asume responsabilidad directa por el servicio prestado, la calidad del mismo ni los acuerdos privados a los que lleguen ambas partes.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            3. Cuentas de Usuario y Seguridad
          </h2>
          <p>
            Al registrarse, usted se compromete a proporcionar información verídica, exacta y actualizada. Es su responsabilidad salvaguardar la confidencialidad de su contraseña y notificar inmediatamente a soporte técnico ante cualquier uso no autorizado de su cuenta.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            4. Regulación para Menores de Edad (Ley 548)
          </h2>
          <p>
            Conforme a la Ley 548 del Código Niña, Niño y Adolescente del Estado Plurinacional de Bolivia, los menores entre 14 y 17 años podrán ofrecer sus servicios únicamente si cuentan con la autorización legal correspondiente de sus padres, madres o tutores legales y de la Defensoría de la Niñez. Los menores tienen prohibido registrarse para realizar cualquier tipo de trabajo considerado de alto riesgo (construcción pesada, alta tensión, etc.).
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            5. Modificaciones y Actualizaciones
          </h2>
          <p>
            Nos reservamos el derecho de enmendar o actualizar estos Términos y Condiciones en cualquier momento. El uso continuado de la plataforma tras dichas modificaciones constituirá su pleno consentimiento a las mismas.
          </p>
        </section>

        <div className="pt-6 border-t border-primary/10 dark:border-slate-700 text-center">
          <p className="text-sm text-primary/60 dark:text-slate-400">
            Para aclaraciones y dudas legales, puedes contactar al equipo de soporte de SENN FIX.
          </p>
        </div>
      </main>
    </div>
  );
}

export default TermsAndConditionsPage;
