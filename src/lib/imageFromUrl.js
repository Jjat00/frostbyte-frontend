/**
 * Descarga una imagen ya publicada y la devuelve como File, para poder
 * mandarla otra vez al generador de IA y seguir editando desde ese punto.
 *
 * Funciona porque R2 responde con `Access-Control-Allow-Origin: *` y el
 * backend, que sirve las imagenes temporales, tiene el dominio del panel en
 * CORS_ALLOWED_ORIGINS.
 *
 * @param {string} url - URL de la imagen
 * @param {string} fallbackName - Nombre a usar si la URL no trae uno
 * @returns {Promise<File>}
 */
export async function urlToFile(url, fallbackName = 'imagen.png') {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`No se pudo leer la imagen (${response.status})`);
  }
  const blob = await response.blob();
  const nameFromUrl = url.split('/').pop()?.split('?')[0];
  const type = blob.type || 'image/png';
  return new File([blob], nameFromUrl || fallbackName, { type });
}

export default urlToFile;
