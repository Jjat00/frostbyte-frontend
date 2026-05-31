/**
 * Helpers de PRESENTACIÓN de la Polla Mundialista 2026.
 *
 * Los DATOS (grupos, partidos, ranking, misiones, menciones) ahora vienen del
 * backend vía `@/services/polla.service` y los hooks de `@/hooks/usePolla`.
 * Aquí quedan solo utilidades puras de formato/estilo que usan las pestañas.
 */

// Metadatos por confederación (acentos de color en las tarjetas de grupo).
export const CONF_META = {
  UEFA: { label: "UEFA", color: "#3b82f6" },
  CONMEBOL: { label: "CONMEBOL", color: "#eab308" },
  CONCACAF: { label: "CONCACAF", color: "#22c55e" },
  CAF: { label: "CAF", color: "#f97316" },
  AFC: { label: "AFC", color: "#ef4444" },
  OFC: { label: "OFC", color: "#14b8a6" },
};

// Filtros de la pestaña de Partidos (coinciden con el campo `status` del API).
export const FIXTURE_FILTERS = [
  { id: "upcoming", label: "Próximos" },
  { id: "live", label: "En vivo" },
  { id: "finished", label: "Finalizados" },
];

// Color del puntito de "forma reciente": w = victoria, d = empate, l = derrota.
export const FORM_COLOR = { w: "bg-emerald-400", d: "bg-gray/50", l: "bg-red-400" };

// ─────────────────────────────────────────────────────────────────────────
// Formateo de fecha/hora en hora de Colombia (America/Bogota, UTC-5).
// Aceptan un Date o un string ISO.
// ─────────────────────────────────────────────────────────────────────────
const BOGOTA = "America/Bogota";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const asDate = (d) => (d instanceof Date ? d : new Date(d));

// "Jue 11 jun"
export const matchDayLabel = (date) => {
  const d0 = asDate(date);
  const wd = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, weekday: "short" })
    .format(d0)
    .replace(".", "");
  const d = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, day: "numeric" }).format(d0);
  const mo = new Intl.DateTimeFormat("es-CO", { timeZone: BOGOTA, month: "short" })
    .format(d0)
    .replace(".", "");
  return `${cap(wd)} ${d} ${mo}`;
};

// "14:00" (24h)
export const matchTime = (date) =>
  new Intl.DateTimeFormat("es-CO", {
    timeZone: BOGOTA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(asDate(date));

// Clave estable para agrupar por día (YYYY-MM-DD en hora de Colombia)
export const matchDayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(asDate(date));
