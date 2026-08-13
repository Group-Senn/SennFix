import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicyPage() {
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
        <h2 className="font-display text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Política de Privacidad</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary dark:text-slate-100">
          Política de Privacidad y Protección de Datos Personales
        </h1>
        <p className="text-sm text-primary/60 dark:text-slate-450">
          Última actualización: Julio 2026
        </p>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            1. Compromiso de Privacidad (Art. 21 CPE)
          </h2>
          <p>
            De conformidad con el Artículo 21 de la Constitución Política del Estado Plurinacional de Bolivia, **SENN FIX** (Senn soluciones) se compromete a salvaguardar la intimidad, privacidad, honra y propia imagen de sus usuarios. Este documento describe cómo recolectamos, procesamos y resguardamos la información personal recopilada a través de la aplicación.
          </p>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            2. Datos recopilados
          </h2>
          <p>
            Para registrarse y utilizar el servicio de manera segura, recabamos los siguientes datos:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identificación:</strong> Nombre completo, correo electrónico, cédula de identidad y fecha de nacimiento.</li>
            <li><strong>Contacto:</strong> Número de celular.</li>
            <li><strong>Ubicación:</strong> Coordenadas geográficas a fin de ubicar profesionales locales cercanos en el mapa.</li>
            <li><strong>Verificación KYC (Profesionales):</strong> Fotos del carnet de identidad, certificados de antecedentes (FELCC/REJAP) y foto de perfil del rostro.</li>
          </ul>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            3. Finalidad del tratamiento de datos
          </h2>
          <p>
            Los datos personales proporcionados se procesan con los siguientes fines exclusivos:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Facilitar la intermediación y contratación de servicios autónomos entre clientes y profesionales.</li>
            <li>Cumplir con las obligaciones legales de verificación de identidad KYC para prevenir fraudes e inseguridad.</li>
            <li>Enviar alertas, notificaciones transaccionales y actualizaciones sobre el estado de las solicitudes.</li>
          </ul>
        </section>

        <section className="space-y-4 text-primary/85 dark:text-slate-300 leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-primary dark:text-slate-100">
            4. Resguardo y Seguridad de los Datos
          </h2>
          <p>
            Los archivos de verificación de identidad (fotos de cédulas de identidad, certificados de antecedentes) se almacenan de manera encriptada y segura, y solo están accesibles para auditorías internas de seguridad administrativa por parte de nuestro equipo autorizado. **SENN FIX** no venderá, cederá ni distribuirá sus datos personales a terceros sin su consentimiento expreso, excepto por mandamiento de ley de autoridad judicial competente.
          </p>
        </section>

        <div className="pt-6 border-t border-primary/10 dark:border-slate-700 text-center">
          <p className="text-sm text-primary/60 dark:text-slate-400">
            En caso de querer ejercer su derecho de rectificación, actualización o eliminación definitiva de sus datos personales, puede eliminar su cuenta en la sección "Mi Perfil" o escribir a soporte técnico.
          </p>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicyPage;
