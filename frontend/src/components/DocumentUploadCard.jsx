import React, { useState, useEffect, useRef } from 'react';
import { compressImage, rotateImage } from '../utils/imageCompressor';

function DocumentUploadCard({
  label,
  file,
  onFileChange,
  onRemove,
  required = false,
  helpText = 'Formatos: JPG, PNG, WEBP',
  icon = 'badge'
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotating, setRotating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file && file instanceof File && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleSelectFile = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      const compressed = await compressImage(originalFile);
      onFileChange(compressed);
      // Reset input value so re-selecting the exact same file triggers onChange
      e.target.value = '';
    }
  };

  const handleRotate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file || rotating) return;
    setRotating(true);
    try {
      const rotated = await rotateImage(file, 90);
      onFileChange(rotated);
    } catch (err) {
      console.error('Error al rotar imagen:', err);
    } finally {
      setRotating(false);
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-primary/85 dark:text-slate-350 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {file && (
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            Cargado ({(file.size / 1024).toFixed(0)} KB)
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
      />

      {file && previewUrl ? (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-primary/10 dark:border-slate-700 space-y-2.5 animate-feedback">
          {/* Vista previa de la imagen */}
          <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60">
            <img
              src={previewUrl}
              alt={label}
              className={`w-full h-full object-contain transition-transform duration-200 ${rotating ? 'opacity-50' : 'opacity-100'}`}
            />
            {rotating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Botonera de acciones: Rotar, Cambiar, Quitar */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRotate}
              disabled={rotating}
              title="Gira la foto 90 grados en sentido horario"
              className="flex-1 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-650 text-primary dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base text-primary/70 dark:text-teal-400">rotate_right</span>
              <span>Rotar 90°</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerUpload}
              title="Seleccionar otra imagen"
              className="flex-1 py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-650 text-primary dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base text-primary/70 dark:text-teal-400">change_circle</span>
              <span>Cambiar foto</span>
            </button>

            <button
              type="button"
              onClick={onRemove}
              title="Eliminar esta imagen"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-650 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTriggerUpload}
          className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-primary/20 dark:border-slate-700 hover:border-primary/50 dark:hover:border-teal-400/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-primary/5 dark:hover:bg-slate-800/40 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group text-left"
        >
          <div className="size-9 rounded-full bg-primary/10 dark:bg-teal-400/10 text-primary dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-primary dark:text-slate-200 group-hover:underline block">
              Subir foto del documento
            </span>
            <span className="text-[10px] text-primary/50 dark:text-slate-400 block mt-0.5">
              {helpText}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}

export default DocumentUploadCard;
