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