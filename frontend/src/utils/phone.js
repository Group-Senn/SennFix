// Convierte "+59177338754", "59177338754" o "77338754" a los 8 dígitos locales que usa el modal.
export function toLocalBolivianNumber(raw) {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  return digits.length === 11 && digits.startsWith('591') ? digits.slice(3) : digits;
}
