/**
 * Búsqueda insensible a mayúsculas, tildes y puntuación.
 *
 * Misma regla que `apps/search.py` en el backend: se compara texto "plano",
 * sin tildes, en minúsculas y sin signos de puntuación. Así a "Café Frío" lo
 * encuentran "cafe", "CAFÉ", "frio" o "cafe,frio", y a "Coca-Cola" la
 * encuentran "coca cola" y "cocacola".
 */

const stripAccents = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Texto plano de un campo: sin tildes, minúsculas, sin puntuación. */
export function normalizeText(s) {
  return stripAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Palabras de lo que escribió el usuario; la puntuación separa palabras. */
export function searchTokens(query) {
  return stripAccents(query)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

/**
 * true si cada palabra de `query` aparece en alguno de los `fields`
 * (null/undefined se ignoran). Con `query` vacío, siempre true.
 */
export function matchesSearch(query, ...fields) {
  const tokens = searchTokens(query);
  if (!tokens.length) return true;
  const haystack = fields.map(normalizeText).join(" ");
  return tokens.every((t) => haystack.includes(t));
}
