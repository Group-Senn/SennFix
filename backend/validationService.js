import { blacklistedTerms } from './blacklist.js';

/**
 * Normaliza un texto para la búsqueda: lo convierte a minúsculas y quita acentos.
 * @param {string} text El texto a normalizar.
 * @returns {string} El texto normalizado.
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD") // Descompone los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los diacríticos
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Revisa si un texto contiene alguna de las palabras o frases de la lista negra.
 * @param {string} text El texto a validar.
 * @returns {boolean} `true` si encuentra un término prohibido, `false` en caso contrario.
 */
export function containsBlacklistedWords(text) {
  const normalizedText = normalizeText(text);

  for (const term of blacklistedTerms) {
    const escapedTerm = escapeRegExp(normalizeText(term));
    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
    if (regex.test(normalizedText)) {
      console.warn(`Término prohibido detectado: "${term}" en el texto.`);
      return true;
    }
  }
  return false;
}

/**
 * Valida la fortaleza de la contraseña (mismas reglas que el frontend).
 * @param {string} pwd La contraseña a validar.
 * @returns {string|null} Mensaje de error, o `null` si es válida.
 */
export function validatePassword(pwd) {
  if (typeof pwd !== 'string' || pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (pwd.length > 72) return 'La contraseña no puede superar los 72 caracteres.';
  if (!/[A-Z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra minúscula.';
  if (!/\d/.test(pwd)) return 'La contraseña debe incluir al menos un número.';
  if (!/[@$!%*?&._-]/.test(pwd)) return 'La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -).';
  return null;
}

/**
 * Fecha de nacimiento (o de fundación) válida: formato AAAA-MM-DD, real, no futura y,
 * para personas, de hace 100 años como máximo.
 * @returns {string|null} Mensaje de error, o `null` si es válida.
 */
export function validateBirthDate(value, { isCompany = false } = {}) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'La fecha de nacimiento no es válida.';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'La fecha de nacimiento no es válida.';
  if (date > new Date()) return 'La fecha de nacimiento no puede estar en el futuro.';
  const oldest = new Date();
  oldest.setUTCFullYear(oldest.getUTCFullYear() - (isCompany ? 200 : 100));
  if (date < oldest) return isCompany ? 'La fecha de fundación no es válida.' : 'La edad no puede ser mayor a 100 años. Revisa la fecha de nacimiento.';
  return null;
}

// Texto que se mostrará a otras personas: rechaza palabras prohibidas. Devuelve el mensaje de error o null.
export function blacklistError(...texts) {
  return containsBlacklistedWords(texts.filter(Boolean).join(' '))
    ? 'Tu texto incluye palabras no permitidas en SENN Fix. Revísalo e inténtalo de nuevo.'
    : null;
}
