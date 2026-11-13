/**
 * Qué tanto aguanta el teléfono, para los héroes y la carta de Navidad.
 *
 * Gama baja = el usuario pidió ahorrar datos, o el navegador reporta 2 GB de
 * RAM o menos, o 4 núcleos o menos. Ahí el fondo líquido se queda quieto (un
 * solo fotograma), el vaso se pinta a 1x y deja de mecerse solo.
 * `navigator.deviceMemory` solo existe en Chrome/Android; en iPhone no se
 * sabe y se asume que aguanta.
 */
export function isLowEnd() {
  if (typeof navigator === "undefined") return false;
  const saveData = navigator.connection?.saveData === true;
  const memory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  return saveData || (memory !== undefined && memory <= 2) || (cores !== undefined && cores <= 4);
}

/** Pantalla de teléfono o tableta (sin ratón fino). */
export function isTouch() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
}
