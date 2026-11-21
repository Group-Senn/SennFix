// Los errores de red del navegador salen en inglés ("Failed to fetch"): se traducen una sola vez aquí
// en lugar de en cada pantalla que muestra err.message.
const NETWORK_ERROR = 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

export function installNetworkHelpers() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (...args) => nativeFetch(...args).catch((err) => {
    if (err instanceof TypeError) throw new Error(NETWORK_ERROR);
    throw err;
  });

  // El servidor gratuito se duerme sin uso (la primera petición tarda ~15 s): se despierta al abrir la app,
  // para que no haya que esperar justo cuando alguien inicia sesión o se registra.
  try {
    if (sessionStorage.getItem('senn_warmed')) return;
    sessionStorage.setItem('senn_warmed', '1');
  } catch {
    // Sin sessionStorage (modo privado): se despierta igual
  }
  window.fetch(`${window.API_URL}/api/db-test`).catch(() => {});
}
