// Helper para la gestión de imágenes y URLs en producción (SENN FIX)
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Senn+Fix&background=004744&color=fff&size=128';
export const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop';

/**
 * Convierte una ruta de imagen de la base de datos (relativa o absoluta de dev) en una URL absoluta de producción.
 * @param {string} imagePath Ruta de la imagen (ej: "uploads/profile-123.jpg" o "http://localhost:3000/uploads/...").
 * @returns {string} URL absoluta del servidor.
 */
export function getAbsoluteImageUrl(imagePath) {
  if (!imagePath) {
    return DEFAULT_AVATAR;
  }
  
  let cleanPath = imagePath;
  
  // Reemplazar localhost:3000 o 127.0.0.1:3000 si viene guardado así de entornos locales
  const isLocalHost = cleanPath.includes('localhost:3000') || cleanPath.includes('127.0.0.1:3000');
  if (isLocalHost) {
    const match = cleanPath.match(/(?:localhost|127\.0\.0\.1):3000\/(.+)$/);
    if (match && match[1]) {
      cleanPath = match[1];
    }
  }

  // Si ya es una URL completa de producción o de servicios externos (ej: http:// o https://)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Limpiar posible barra al inicio
  const cleanRelative = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // Obtener API_URL de producción del env o de la variable global de index.html
  const apiBase = import.meta.env.VITE_API_URL || window.API_URL || 'https://senn-fix-backend-api.onrender.com';
  
  return `${apiBase}/${cleanRelative}`;
}

/**
 * Handler de respaldo (fallback) ante fallas de red al cargar avatares de perfil.
 * @param {React.SyntheticEvent} e Evento sintético de React.
 */
export function handleImageError(e) {
  e.target.onerror = null; // Evita bucle infinito si la imagen fallback falla
  e.target.src = DEFAULT_AVATAR;
}

/**
 * Handler de respaldo (fallback) ante fallas al cargar imágenes de galerías o trabajos.
 * @param {React.SyntheticEvent} e Evento sintético de React.
 */
export function handleGalleryError(e) {
  e.target.onerror = null; // Evita bucle infinito
  e.target.src = DEFAULT_PLACEHOLDER;
}
