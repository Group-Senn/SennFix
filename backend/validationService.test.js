// Prueba de las validaciones de entrada: node validationService.test.js
import assert from 'node:assert/strict';
import { validateBirthDate, blacklistError } from './validationService.js';

const yearsAgo = (n, extraDays = 0) => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - n);
  d.setUTCDate(d.getUTCDate() + extraDays);
  return d.toISOString().slice(0, 10);
};

assert.equal(validateBirthDate('2000-05-17'), null);
assert.equal(validateBirthDate(yearsAgo(100, 1)), null);                 // 99 años y algo: válido
assert.match(validateBirthDate(yearsAgo(101)), /100 años/);               // más de 100: rechazado
assert.match(validateBirthDate('1890-01-01'), /100 años/);
assert.equal(validateBirthDate('1890-01-01', { isCompany: true }), null); // una empresa sí puede ser centenaria
assert.match(validateBirthDate(yearsAgo(-1)), /futuro/);
for (const bad of ['2001-02-30', '17/05/2000', 'hola', '', undefined, '2000-13-01', "2000-01-01' OR 1=1"]) {
  assert.ok(validateBirthDate(bad), `debía rechazar ${bad}`);
}

assert.equal(blacklistError('Mesa de algarrobo', 'Equipetrol'), null);
assert.equal(blacklistError('Armando Pérez'), null);                     // "arma" dentro de un nombre no cuenta
assert.ok(blacklistError('vendo armas'));
assert.ok(blacklistError('', 'servicio de ESCORT'));
assert.ok(blacklistError('Venta de DROGA'));
assert.equal(blacklistError(undefined, null), null);
console.log('validaciones OK');
