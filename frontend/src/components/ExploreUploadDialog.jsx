import React, { useEffect, useState } from 'react';
import { compressImage } from '../utils/imageCompressor';

// Formulario para que un profesional publique una foto de un trabajo (la aprueba un administrador)
function ExploreUploadDialog({ onClose, onPublished }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !uploading && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, uploading]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleFile = async (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;
    // Las fotos de celular pesan varios MB; el servidor rechaza más de 10 MB
    const compressed = await compressImage(chosen);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Elige una foto del trabajo.');
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);
    formData.append('zone', zone.trim());
    try {
      const response = await fetch(window.API_URL + '/api/explore/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos publicar la foto. Inténtalo de nuevo.');
      onPublished();
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const field = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-base text-ink dark:text-slate-100 placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="upload-title" onClick={() => !uploading && onClose()} className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4">
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 id="upload-title" className="font-display text-xl font-extrabold text-primary dark:text-white">Publicar un trabajo</h2>
          <button type="button" onClick={onClose} disabled={uploading} aria-label="Cerrar" className="flex size-10 items-center justify-center rounded-full border-none bg-transparent text-muted cursor-pointer dark:text-slate-300">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

        <div>
          <span id="foto-label" className="mb-1.5 block text-sm font-bold text-ink dark:text-slate-200">Foto del trabajo</span>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={preview} alt="Vista previa de la foto elegida" className="aspect-video w-full object-cover" />
              <button type="button" onClick={() => { setFile(null); setPreview(null); }} aria-label="Quitar foto" className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full border-none bg-black/60 text-white cursor-pointer">
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 py-8 text-center dark:border-slate-600">
              <span className="material-symbols-outlined text-4xl text-primary dark:text-teal-400" aria-hidden="true">add_photo_alternate</span>
              <span className="text-sm font-bold text-ink dark:text-slate-200">Elegir una foto</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="sr-only" aria-labelledby="foto-label" />
            </label>
          )}
        </div>

        <div>
          <label htmlFor="upload-description" className="mb-1.5 block text-sm font-bold text-ink dark:text-slate-200">Cuéntanos del trabajo (opcional)</label>
          <textarea id="upload-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="Por ejemplo: mesa de algarrobo hecha a medida" className={field} />
        </div>

        <div>
          <label htmlFor="upload-zone" className="mb-1.5 block text-sm font-bold text-ink dark:text-slate-200">Barrio o zona donde lo hiciste (opcional)</label>
          <input id="upload-zone" type="text" value={zone} onChange={(e) => setZone(e.target.value)} maxLength={80} placeholder="Por ejemplo: Equipetrol, Plan 3000" className={field} />
          <p className="mt-1 text-xs text-muted dark:text-slate-400">Pon el barrio, no tu dirección: así los clientes saben si trabajas cerca de ellos.</p>
        </div>

        <p className="text-sm text-muted dark:text-slate-400">Un administrador la revisa antes de que se vea en Explorar.</p>

        <button type="submit" disabled={uploading || !file} className="w-full rounded-xl border-none bg-primary px-4 py-3 font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? 'Publicando…' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}

export default ExploreUploadDialog;
