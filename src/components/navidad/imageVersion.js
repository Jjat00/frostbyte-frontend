/**
 * Versión de las fotos navideñas (vasos del hero y fotos de la carta).
 *
 * Cloudflare sirve /images con caché de 4 horas en el navegador: si se
 * reemplaza una foto conservando su nombre, los teléfonos que ya la vieron
 * siguen mostrando la vieja hasta 4 horas. Al reemplazar alguna, se cambia
 * este valor (la fecha del cambio) y todas se piden de nuevo una vez. Las
 * fotos nuevas, con nombre nuevo, no lo necesitan.
 */
export const NV_IMG_V = "2026-11-15";

/** Ruta de una foto navideña con su versión. */
export const nvImg = (path) => `${path}?v=${NV_IMG_V}`;
