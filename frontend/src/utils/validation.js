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
