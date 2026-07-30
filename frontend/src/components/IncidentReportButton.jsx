import React, { useState } from 'react';

function IncidentReportButton({ reportedId, jobId, className = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!reason) {
      setError('Por favor, selecciona un motivo.');
      setLoading(false);
      return;
    }
    if (!details.trim()) {
      setError('Por favor, describe los detalles del incidente.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reported_id: reportedId,
          job_id: jobId || null,
          reason,
          details
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar el reporte.');

      setSuccess(data.message || 'Denuncia/Reporte enviado con éxito.');
      setReason('');
      setDetails('');
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition-colors cursor-pointer ${className}`}
      >
        <span className="material-symbols-outlined text-sm">report</span>
        Reportar Incidente
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                Reportar a Soporte
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer flex items-center p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-primary/80 dark:text-slate-300 block mb-2">
                  Motivo del Reporte <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">-- Selecciona un motivo --</option>
                  <option value="Comportamiento inapropiado">Comportamiento inapropiado</option>
                  <option value="Incumplimiento de trabajo">Incumplimiento de trabajo</option>
                  <option value="Cobro indebido">Cobro indebido</option>
                  <option value="Daño a la propiedad">Daño a la propiedad</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-primary/80 dark:text-slate-300 block mb-2">
                  Detalles del Incidente <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows="4"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Describe de forma detallada lo ocurrido (ej. qué pasó, horas, etc.). Tu reporte será auditado con prioridad por soporte humano."
                ></textarea>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl font-bold text-xs cursor-pointer border-none disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default IncidentReportButton;
