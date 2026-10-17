/**
 * Periodos para las pantallas de análisis: presets (hoy, esta semana, últimos
 * 30 días…) o un rango propio elegido en el calendario.
 *
 * Las fechas son días locales y el rango es inclusivo en los dos extremos
 * ({ start, end } como 'YYYY-MM-DD'), que es lo que esperan los endpoints de
 * estadísticas en `start`/`end`.
 *
 * El "hoy" se calcula con un corte de madrugada (`cutoffHour`): el local abre en
 * la tarde y cierra después de medianoche, así que a la 1 a. m. "hoy" sigue
 * siendo la noche que empezó ayer.
 */

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const firstOfMonth = (d, n = 0) => new Date(d.getFullYear(), d.getMonth() + n, 1);
/** Las semanas empiezan el lunes. */
export const startOfWeek = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

/** "2026-10-15" en hora local. */
export const isoDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function parseDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || isoDay(d) !== s ? null : d;
}

export const PRESETS = {
  today: 'Hoy',
  yesterday: 'Ayer',
  thisWeek: 'Esta semana',
  lastWeek: 'Semana anterior',
  last7: 'Últimos 7 días',
  last30: 'Últimos 30 días',
  thisMonth: 'Este mes',
  lastMonth: 'Mes anterior',
  last90: 'Últimos 90 días',
  last180: 'Últimos 6 meses',
  thisYear: 'Este año',
  lastYear: 'Año anterior',
  all: 'Todo',
};

/** Zona del local: los días se cortan aquí, no en la del navegador. */
export const STORE_TIME_ZONE = 'America/Bogota';
const fmtStoreDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: STORE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * El día de operación en curso en la hora del local: antes de `cutoffHour`
 * sigue siendo el de ayer. Bogotá no tiene horario de verano, así que restar
 * las horas antes de leer la fecha es exacto.
 */
export const operatingToday = (now = new Date(), cutoffHour = 0) =>
  parseDay(fmtStoreDay.format(new Date(now.getTime() - cutoffHour * 3_600_000)));

/** Milisegundos hasta el próximo corte de día en la hora del local. */
export function msUntilNextCutoff(now = new Date(), cutoffHour = 0) {
  const today = operatingToday(now, cutoffHour);
  // Bogotá es UTC-5 todo el año: el corte del día siguiente cae a cutoffHour + 5 en UTC.
  const next = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1, cutoffHour + 5);
  return Math.max(1_000, next - now.getTime());
}

/** Rango inclusivo { start, end } (Date) de un preset; `null` para "Todo". */
export function presetRange(preset, today) {
  switch (preset) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday':
      return { start: addDays(today, -1), end: addDays(today, -1) };
    case 'thisWeek':
      return { start: startOfWeek(today), end: today };
    case 'lastWeek':
      return { start: addDays(startOfWeek(today), -7), end: addDays(startOfWeek(today), -1) };
    case 'last7':
      return { start: addDays(today, -6), end: today };
    case 'last30':
      return { start: addDays(today, -29), end: today };
    case 'last90':
      return { start: addDays(today, -89), end: today };
    case 'last180':
      return { start: addDays(today, -179), end: today };
    case 'thisMonth':
      return { start: firstOfMonth(today), end: today };
    case 'lastMonth':
      return { start: firstOfMonth(today, -1), end: addDays(firstOfMonth(today), -1) };
    case 'thisYear':
      return { start: new Date(today.getFullYear(), 0, 1), end: today };
    case 'lastYear':
      return { start: new Date(today.getFullYear() - 1, 0, 1), end: new Date(today.getFullYear() - 1, 11, 31) };
    default:
      return null;
  }
}

/**
 * Rango de un periodo. `period` es { preset } o { preset: 'custom', start, end }
 * con fechas Date.
 */
export const periodRange = (period, today) =>
  period.preset === 'custom' ? { start: period.start, end: period.end } : presetRange(period.preset, today);

/** Los parámetros `start`/`end` que esperan los endpoints; vacío para "Todo". */
export function periodParams(period, today) {
  const range = periodRange(period, today);
  return range ? { start: isoDay(range.start), end: isoDay(range.end) } : {};
}

/** Clave estable para cachés y URLs. */
export const periodKey = (period) =>
  period.preset === 'custom' ? `${isoDay(period.start)}_${isoDay(period.end)}` : period.preset;

/** Lee el periodo de la URL (?p=last30 o ?desde=…&hasta=…). */
export function periodFromSearch(searchParams, fallback) {
  const from = parseDay(searchParams.get('desde'));
  const to = parseDay(searchParams.get('hasta'));
  if (from && to) {
    return from <= to ? { preset: 'custom', start: from, end: to } : { preset: 'custom', start: to, end: from };
  }
  const p = searchParams.get('p');
  return p && Object.hasOwn(PRESETS, p) ? { preset: p } : fallback;
}

/** Escribe el periodo en la URL sin tocar los demás parámetros. */
export function periodToSearch(searchParams, period, fallback) {
  const next = new URLSearchParams(searchParams);
  next.delete('p');
  next.delete('desde');
  next.delete('hasta');
  if (period.preset === 'custom') {
    next.set('desde', isoDay(period.start));
    next.set('hasta', isoDay(period.end));
  } else if (period.preset !== fallback.preset) {
    next.set('p', period.preset);
  }
  return next;
}

const fmtDay = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
const fmtDayYear = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

/** "1 oct – 15 oct 2026", o un solo día. */
export function rangeLabel(range) {
  if (!range) return 'todo el historial';
  if (+range.start === +range.end) return fmtDayYear.format(range.start);
  const sameYear = range.start.getFullYear() === range.end.getFullYear();
  return `${(sameYear ? fmtDay : fmtDayYear).format(range.start)} – ${fmtDayYear.format(range.end)}`;
}
