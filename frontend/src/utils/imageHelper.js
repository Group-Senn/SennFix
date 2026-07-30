// Helper para la gestión de imágenes y URLs en producción (SENN FIX)
const API_URL = import.meta.env.VITE_API_URL || 'https://senn-fix-backend-api.onrender.com';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Senn+Fix&background=004744&color=fff&size=128';

/**
 * Convierte una ruta de imagen de la base de datos (relativa) en una URL absoluta de producción.
 * @param {string} imagePath Ruta de la imagen (ej: "uploads/profile-123.jpg").
 * @returns {string} URL absoluta del servidor.
 */
export function getAbsoluteImageUrl(imagePath) {
  if (!imagePath) {
    return DEFAULT_AVATAR;
  }
  // Si ya es una URL completa (ej: http:// o https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Limpiar posible barra al inicio
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_URL}/${cleanPath}`;
}

/**
 * Handler de respaldo (fallback) ante fallas de red al cargar imágenes.
 * @param {React.SyntheticEvent} e Evento sintético de React.
 */
export function handleImageError(e) {
  e.target.onerror = null; // Evita bucle infinito si la imagen fallback falla
  e.target.src = DEFAULT_AVATAR;
}
