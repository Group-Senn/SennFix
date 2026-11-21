import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackContext } from './feedbackContext';

// Avisos y confirmaciones propios, en lugar de las ventanas alert()/confirm() del navegador
// (bloquean la pantalla y en la app Android salen como "localhost dice").
export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const cancelRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const confirm = useCallback((message, { confirmLabel = 'Aceptar', danger = false } = {}) =>
    new Promise((resolve) => setDialog({ message, confirmLabel, danger, resolve })), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const answer = useCallback((value) => {
    dialog?.resolve(value);
    setDialog(null);
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    cancelRef.current?.focus(); // el foco empieza en la opción segura
    const onKey = (e) => e.key === 'Escape' && answer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, answer]);

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {toast && (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`animate-feedback fixed inset-x-0 mx-auto z-[3000] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 ${toast.type === 'error' ? 'bg-red-800' : 'bg-primary'}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Cerrar aviso" className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-white cursor-pointer">
            <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      )}

      {dialog && (
        <div role="presentation" onClick={() => answer(false)} className="fixed inset-0 z-[3100] flex items-center justify-center bg-black/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-describedby="feedback-confirm-message"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-slate-800"
          >
            <p id="feedback-confirm-message" className="text-base leading-relaxed text-ink dark:text-slate-100">{dialog.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button ref={cancelRef} onClick={() => answer(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-bold text-ink cursor-pointer dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                Cancelar
              </button>
              <button onClick={() => answer(true)} className={`rounded-xl border-none px-4 py-2.5 font-bold text-white cursor-pointer ${dialog.danger ? 'bg-red-700' : 'bg-primary'}`}>
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
