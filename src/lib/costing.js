/**
 * Reglas de costeo compartidas por el editor de recetas y la vista global.
 *
 * Espejo de `apps/inventory/costing.py` en el backend: el editor recalcula en
 * vivo mientras se escribe, así que la regla tiene que vivir también aquí.
 * Regla de la casa: precio para un food cost del 50 % (costo x2), redondeado a
 * miles hacia abajo.
 */

export const TARGET_FOOD_COST = 0.5;
export const PRICE_STEP = 1000;
export const TARGET_MARGIN_PCT = (1 - TARGET_FOOD_COST) * 100;

export function toNumber(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function suggestedPrice(cost) {
  const c = toNumber(cost);
  if (c <= 0) return null;
  return Math.floor(c / TARGET_FOOD_COST / PRICE_STEP) * PRICE_STEP;
}

/**
 * Cifras derivadas de un precio y un costo. Devuelve null en lo que no aplica
 * (sin receta o sin precio), nunca NaN.
 */
export function costingFigures(price, cost, hasRecipe) {
  const p = toNumber(price);
  if (!hasRecipe) {
    return { cost: null, profit: null, marginPct: null, foodCostPct: null, suggestedPrice: null };
  }
  const c = toNumber(cost);
  const profit = p - c;
  return {
    cost: c,
    profit,
    marginPct: p > 0 ? (profit / p) * 100 : null,
    foodCostPct: p > 0 ? (c / p) * 100 : null,
    suggestedPrice: suggestedPrice(c),
  };
}

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(value) {
  if (value === null || value === undefined || value === '') return '—';
  return copFormatter.format(toNumber(value));
}

export function formatPct(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${toNumber(value).toFixed(1).replace('.', ',')} %`;
}

/**
 * Tinte del margen: el color va en el dato, no en el borde. Verde cuando
 * cumple el objetivo, ámbar si se queda cerca, rojo si está lejos.
 */
export function marginTone(marginPct) {
  if (marginPct === null || marginPct === undefined) return 'text-gray';
  const m = toNumber(marginPct);
  if (m >= TARGET_MARGIN_PCT) return 'text-green-400';
  if (m >= TARGET_MARGIN_PCT - 15) return 'text-yellow-400';
  return 'text-red-400';
}
