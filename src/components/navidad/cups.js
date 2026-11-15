/**
 * Versiones navideñas (gorro y bufanda) de los granizados de la carta,
 * por slug del producto.
 *
 * El hero NO decide qué sabores salen: los trae la carta. Solo aparece un
 * producto si está activo en la categoría Granizados Y tiene aquí su versión
 * navideña. Si se desactiva en el panel, desaparece del hero; si se reactiva,
 * vuelve. Un granizado activo sin versión navideña no sale (a 2026-11-13: la
 * Paleta de Drácula, que no tiene foto en la carta).
 *
 * Añadir uno: generar la foto con el vaso liso sobre gris (Codex), componer
 * el sticker real encima (los vasos; las peceras no lo llevan) y exportar
 * color + profundidad al mismo lienzo de 814 × 1100. Scripts en
 * `D:\contenido\frostbyte\navidad-2026\` (gen-hero2.sh, gen-pecera.sh,
 * sticker.py, prep-hero2.py) y nota del vault "Hero de Navidad de Frostbyte".
 *
 * `word`: la palabra gigante del fondo (corta).
 * `liquid`: los tres tonos del fondo líquido (oscuro, medio, claro).
 */

const DIR = "/images/navidad";

const cup = (key, word, liquid) => ({
  key,
  word,
  liquid,
  src: `${DIR}/${key}.webp`,
  // 444 × 600 (~50 KB en vez de ~180 KB): la que baja el teléfono.
  small: `${DIR}/${key}-sm.webp`,
  depth: `${DIR}/${key}-depth.webp`,
});

export const NAVIDAD_CUPS = {
  "granizado-de-mandarina": cup("mandarina", "Mandarina", ["#d95a05", "#ff8c1a", "#ffc56b"]),
  "limonada-de-cereza": cup("cereza", "Cereza", ["#9c0718", "#e3122b", "#ff6b75"]),
  "granizado-de-chicle": cup("chicle", "Chicle", ["#0a4f94", "#1f9be6", "#8fdcff"]),
  fresa: cup("frutos-rojos", "Frutos rojos", ["#3a0d52", "#7a2a9c", "#d08af0"]),
  "granizado-sabor-lujuria": cup("lujuria", "Lujuria", ["#4a0a52", "#a3228f", "#f08ad6"]),
  // Desactivado en el panel el 2026-11-14 (lo reemplazó Lujuria); si vuelve, sale solo.
  venom: cup("venom", "Venom", ["#101014", "#3a3b46", "#9a9dab"]),
  "pecera-granizada": cup("pecera", "Pecera", ["#8e0f4a", "#e8366e", "#ffb347"]),
  "pecera-granizado-con-alcohol": cup("pecera-alcohol", "Pecera", ["#6e1230", "#d9481f", "#ffc56b"]),
  // Fuera de la carta a 2026-11-13; si vuelve a activarse, sale solo.
  bluebuerry: cup("blueberry", "Blueberry", ["#33209c", "#6a4df0", "#a99bff"]),
};
