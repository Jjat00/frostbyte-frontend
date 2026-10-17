/**
 * Selector de periodo para las pantallas de análisis: lista de presets a la
 * izquierda y un calendario de dos meses (uno por debajo de xl, donde el menú
 * lateral deja poco ancho) para elegir un
 * rango propio, con las dos fechas también editables a mano.
 *
 * Primer clic en el calendario fija el inicio y el segundo el fin, en cualquier
 * orden; "Aplicar" lo confirma. Los presets se aplican al tocarlos.
 */

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PRESETS,
  addDays,
  isoDay,
  parseDay,
  rangeLabel,
  startOfDay,
  startOfWeek,
} from '@/lib/periods';

const fmtMonthTitle = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const MonthGrid = ({ month, from, to, today, onPick }) => {
  const first = startOfWeek(month);
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  return (
    <div className="w-[238px] min-w-0 max-w-full">
      <p className="mb-2 text-center text-xs font-semibold text-light first-letter:uppercase">
        {fmtMonthTitle.format(month)}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10px] text-light/35">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const out = d.getMonth() !== month.getMonth();
          const edge = (from && +d === +from) || (to && +d === +to);
          const inside = from && to && d > from && d < to;
          const future = d > today;
          return (
            <button
              key={+d}
              type="button"
              onClick={() => onPick(d)}
              disabled={out}
              className={`h-8 text-xs tabular-nums transition-colors ${out ? 'invisible' : ''} ${
                edge
                  ? 'rounded-lg bg-primary font-semibold text-dark'
                  : inside
                    ? 'bg-primary/15 text-light'
                    : `rounded-lg hover:bg-white/10 hover:text-light ${future ? 'text-light/25' : 'text-light/60'}`
              } ${+d === +today && !edge ? 'underline decoration-primary underline-offset-4' : ''}`}
              aria-label={d.toLocaleDateString('es-CO')}
              aria-pressed={Boolean(edge)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * @param period  { preset } o { preset: 'custom', start, end } (Date)
 * @param range   rango vigente { start, end } o null si es "Todo"
 * @param today   día de operación en curso (marca el calendario)
 * @param onChange recibe el periodo nuevo
 * @param presets  ids de PRESETS a mostrar (por defecto, todos)
 */
const PeriodPicker = ({ period, range, today, onChange, presets = Object.keys(PRESETS) }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => firstOfMonth(today));
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      // El calendario arranca en lo que está elegido ahora: con dos meses, el
      // del fin queda a la derecha; con uno, es el que se ve.
      const end = range?.end || today;
      const twoMonths = window.matchMedia('(min-width: 1280px)').matches;
      setFrom(range?.start || null);
      setTo(range?.end || null);
      setMonth(new Date(end.getFullYear(), end.getMonth() - (twoMonths ? 1 : 0), 1));
    }
    setOpen(!open);
  };

  const pick = (d) => {
    if (!from || to) {
      setFrom(d);
      setTo(null);
    } else {
      const [a, b] = d < from ? [d, from] : [from, d];
      setFrom(a);
      setTo(b);
    }
  };

  const apply = () => {
    if (!from) return;
    onChange({ preset: 'custom', start: startOfDay(from), end: startOfDay(to || from) });
    setOpen(false);
  };

  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const invalid = !from || (to !== null && to < from);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-light transition-colors hover:border-white/20"
      >
        <CalendarDays className="h-3.5 w-3.5 text-primary" />
        <span>{period.preset === 'custom' ? 'Personalizado' : PRESETS[period.preset]}</span>
        <span className="font-normal text-light/45">· {rangeLabel(range)}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Elegir periodo"
          className="fb-sheet absolute left-0 top-full z-40 mt-2 flex w-max max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl shadow-2xl xl:left-auto xl:right-0 xl:flex-row"
        >
          <ul className="grid grid-cols-2 border-b border-white/[0.08] p-1.5 xl:block xl:w-44 xl:border-b-0 xl:border-r">
            {presets.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ preset: p });
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-light/60 hover:bg-white/5 hover:text-light"
                >
                  <span className="w-4">
                    {period.preset === p && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />}
                  </span>
                  {PRESETS[p]}
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 space-y-3 p-3 sm:p-4">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="mt-0.5 flex-shrink-0 text-light/40 hover:text-light"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex min-w-0 flex-1 justify-center gap-5">
                <MonthGrid month={month} from={from} to={to} today={today} onPick={pick} />
                <div className="hidden xl:block">
                  <MonthGrid month={next} from={from} to={to} today={today} onPick={pick} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMonth(next)}
                className="mt-0.5 flex-shrink-0 text-light/40 hover:text-light"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3 text-xs">
              <input
                type="date"
                value={from ? isoDay(from) : ''}
                onChange={(e) => {
                  const d = parseDay(e.target.value);
                  if (d) setFrom(d);
                }}
                className="rounded-lg border border-white/[0.1] bg-dark px-2 py-1 text-light [color-scheme:dark]"
                aria-label="Desde"
              />
              <span className="text-light/35">a</span>
              <input
                type="date"
                value={to ? isoDay(to) : ''}
                onChange={(e) => {
                  const d = parseDay(e.target.value);
                  if (d) setTo(d);
                }}
                className="rounded-lg border border-white/[0.1] bg-dark px-2 py-1 text-light [color-scheme:dark]"
                aria-label="Hasta"
              />
              <button
                type="button"
                onClick={apply}
                disabled={invalid}
                className="ml-auto rounded-lg bg-primary px-3 py-1 font-semibold text-dark disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodPicker;
