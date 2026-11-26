export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismas reglas que valida el servidor. Devuelve el mensaje de error o null si la contraseña es válida
export function validatePassword(pwd) {
  if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra minúscula.';
  if (!/\d/.test(pwd)) return 'La contraseña debe incluir al menos un número.';
  if (!/[@$!%*?&._-]/.test(pwd)) return 'La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -).';
  return null;
}

// Misma regla que el servidor: fecha real, no futura y, para personas, de hace 100 años como máximo
export function birthDateError(value, { isCompany = false } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'Elige una fecha de nacimiento válida.';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'Elige una fecha de nacimiento válida.';
  if (date > new Date()) return 'La fecha no puede estar en el futuro.';
  const oldest = new Date();
  oldest.setUTCFullYear(oldest.getUTCFullYear() - (isCompany ? 200 : 100));
  if (date < oldest) return isCompany ? 'La fecha de fundación no es válida.' : 'La edad no puede ser mayor a 100 años. Revisa la fecha de nacimiento.';
  return null;
}
