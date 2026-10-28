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
