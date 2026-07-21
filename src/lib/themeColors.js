/**
 * Acceso a los tokens de color del tema activo (theme.css) desde JS.
 *
 * Para estilos normales usa SIEMPRE las utilidades de Tailwind
 * (text-primary, shadow…) o var(--color-primary) / color-mix() en CSS.
 * Este helper existe solo para los contextos que NO resuelven var():
 * canvas 2D, capas de Mapbox GL y librerías de charts que exigen
 * strings de color literales.
 *
 * Lee el token UNA vez (al montar el componente / construir la capa),
 * nunca en cada frame de dibujo.
 */

/** Valor crudo del token tal como lo declara el tema ("#ff00d4"). */
export function themeColorRaw(token, element = document.body) {
  return getComputedStyle(element).getPropertyValue(token).trim();
}

/**
 * Canales [r, g, b] del token. Soporta #rgb, #rrggbb y rgb()/rgba().
 * Para otros formatos (oklch…) devuelve null: usa themeColorRaw y
 * deja que el navegador lo pinte sin alpha derivado.
 */
export function themeColorChannels(token, element = document.body) {
  const value = themeColorRaw(token, element);
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

/** "rgba(r, g, b, alpha)" del token, para canvas/mapbox/charts. */
export function themeColorRgba(token, alpha = 1, element = document.body) {
  const channels = themeColorChannels(token, element);
  if (!channels) return themeColorRaw(token, element);
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}
