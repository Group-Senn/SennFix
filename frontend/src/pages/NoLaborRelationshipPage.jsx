import React from 'react';
import { useNavigate } from 'react-router-dom';

function NoLaborRelationshipPage() {
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
        <h2 className="font-display text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Política de No Relación Laboral</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary dark:text-slate-100">
          Política de No Relación Laboral y Términos de Servicio Independiente
        </h1>
        <p className="text-sm text-primary/60 dark:text-slate-450">
          Última actualización: Julio 2026
        </p>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            1. Declaración de Independencia
          </h2>
          <p>
            El presente documento regula los términos y condiciones de la relación entre los profesionales independientes y la plataforma **SENN** (Senn soluciones). Al registrarse como profesional, usted reconoce y acepta expresamente que **SENN** actúa únicamente como una plataforma de intermediación tecnológica que conecta a prestadores de servicios independientes con clientes que demandan dichos servicios.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            2. Ausencia de Vínculo Laboral (No Relación de Dependencia)
          </h2>
          <p>
            Bajo ninguna circunstancia se considerará que existe un contrato de trabajo, relación de dependencia, subordinación ni vínculo laboral de ningún tipo entre el profesional y **SENN**.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Autonomía Técnica:</strong> El profesional tiene absoluta libertad para decidir el método, los materiales y la forma de ejecución de los servicios solicitados por el cliente.</li>
            <li><strong>Autonomía de Horarios:</strong> El profesional define libremente sus horas de disponibilidad, el número de horas que permanece en línea y los trabajos que decide aceptar o rechazar.</li>
            <li><strong>Herramientas Propias:</strong> El profesional deberá proveerse de sus propias herramientas, vehículos, equipos y recursos necesarios para ejecutar el servicio acordado.</li>
          </ul>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            3. Pagos y Responsabilidades Fiscales
          </h2>
          <p>
            Los precios o tarifas del servicio son pactados de mutuo acuerdo entre el profesional y el cliente. El profesional es el único responsable de declarar y pagar cualquier impuesto, arancel o contribución social que corresponda según la legislación vigente en Bolivia. **SENN** no realiza retenciones de ley asociadas a salarios ni provee seguro médico, beneficios sociales, aguinaldos o vacaciones.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            4. Deslinde de Responsabilidad Legal
          </h2>
          <p>
            Dado que **SENN** no tiene control directo sobre la calidad, el tiempo, la seguridad o la legalidad de los servicios provistos, la plataforma queda exonerada de toda responsabilidad por daños civiles, penales, laborales o comerciales que surjan de la interacción, negociación o contratación directa entre el cliente y el profesional.
          </p>
        </section>

        <div className="pt-6 border-t border-primary/10 dark:border-slate-700 text-center">
          <p className="text-sm text-primary/60 dark:text-slate-400">
            Al registrarse o iniciar sesión, usted ratifica su entendimiento y aceptación incondicional de estos términos.
          </p>
        </div>
      </main>
    </div>
  );
}

export default NoLaborRelationshipPage;
