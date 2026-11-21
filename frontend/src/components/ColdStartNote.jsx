import React, { useEffect, useState } from 'react';

// Se monta solo mientras algo carga: si tarda, explica por qué (el servidor gratuito se duerme sin uso)
function ColdStartNote() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!slow) return null;
  return (
    <p role="status" className="mt-4 text-sm text-muted dark:text-slate-400">
      Esto está tardando más de lo normal. La primera visita del día puede demorar hasta medio minuto; después va rápido.
    </p>
  );
}

export default ColdStartNote;
