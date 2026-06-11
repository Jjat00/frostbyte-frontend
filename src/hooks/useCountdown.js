import { useEffect, useState } from "react";

/**
 * Reloj compartido: UN solo setInterval (1s) para toda la app. Cada suscriptor
 * declara su resolución y solo se le notifica (re-render) cuando cambia su
 * "bucket" de tiempo. Así una mención a 17 días refresca 1 vez/min y un partido
 * inminente refresca 1 vez/s, sin tener N intervals ni re-render por segundo de
 * tarjetas lejanas (importa en móviles de gama baja).
 */
let _now = Date.now();
const _subs = new Set(); // { res, last, cb }
let _timer = null;

function _tick() {
  _now = Date.now();
  _subs.forEach((s) => {
    const bucket = Math.floor(_now / s.res);
    if (bucket !== s.last) {
      s.last = bucket;
      s.cb(_now);
    }
  });
}

function _ensureTimer() {
  if (!_timer && _subs.size > 0) _timer = setInterval(_tick, 1000);
}

function _maybeStop() {
  if (_timer && _subs.size === 0) {
    clearInterval(_timer);
    _timer = null;
  }
}

/** Lectura no reactiva del "ahora" compartido (para decidir la resolución). */
export function peekNow() {
  return _now;
}

/** `now` reactivo que solo cambia cada `resolutionMs`. */
export function useNow(resolutionMs = 1000) {
  const [now, setNow] = useState(_now);
  useEffect(() => {
    const sub = { res: resolutionMs, last: Math.floor(Date.now() / resolutionMs), cb: setNow };
    _subs.add(sub);
    _ensureTimer();
    setNow(Date.now());
    return () => {
      _subs.delete(sub);
      _maybeStop();
    };
  }, [resolutionMs]);
  return now;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/**
 * Cuenta regresiva hacia `target` (Date | ISO string | epoch ms).
 * Resolución automática: por segundo en la última hora, por minuto antes.
 * @returns {{ total, d, h, m, s, done }} `total` en ms (>=0); `done` cuando llegó a 0.
 */
export function useCountdown(target, { maxResolutionMs } = {}) {
  const targetMs =
    target instanceof Date
      ? target.getTime()
      : typeof target === "number"
      ? target
      : new Date(target).getTime();

  const remaining = Number.isFinite(targetMs) ? targetMs - peekNow() : 0;
  // Escalones: ya pasó -> congelado (1/día); última hora -> 1s; último día ->
  // 1/min; más lejos -> 1/hora. Evita re-render por segundo de tarjetas lejanas.
  let res =
    remaining <= 0 ? DAY : remaining <= HOUR ? 1000 : remaining <= DAY ? MIN : HOUR;
  // `maxResolutionMs` fuerza un refresco mínimo (p.ej. un banner destacado que
  // debe verse contar aunque falten días -> pasar 60_000 para tictaquear/min).
  if (maxResolutionMs) res = Math.min(res, maxResolutionMs);
  const now = useNow(res);

  const total = Number.isFinite(targetMs) ? Math.max(0, targetMs - now) : 0;
  return {
    total,
    d: Math.floor(total / DAY),
    h: Math.floor((total % DAY) / HOUR),
    m: Math.floor((total % HOUR) / MIN),
    s: Math.floor((total % MIN) / 1000),
    done: total <= 0,
  };
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Texto compacto de una cuenta regresiva ya descompuesta.
 *  > 1 día  -> "3d 5h"
 *  > 1 hora -> "5h 23m"
 *  < 1 hora -> "12:45" (mm:ss)
 */
export function formatCountdown({ d, h, m, s }) {
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Versión larga, para un display destacado (3 unidades, siempre con minutos):
 *  > 1 día  -> "17d 04h 23m"
 *  > 1 hora -> "5h 23m"
 *  < 1 hora -> "23m 45s"
 */
export function formatCountdownLong({ d, h, m, s }) {
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  if (h > 0) return `${h}h ${pad(m)}m`;
  return `${pad(m)}m ${pad(s)}s`;
}
