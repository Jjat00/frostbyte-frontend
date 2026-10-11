import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { CalendarDays, Clock, DoorClosed, DoorOpen } from 'lucide-react';
import { scheduleAnalyticsService } from '@/services/analytics.service';
import { themeColorRaw } from '@/lib/themeColors';

const PERIODS = [
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '1 año' },
  { days: 0, label: 'Todo' },
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// El backend manda horas en decimal; después de medianoche siguen desde 24
// (25.5 = 1:30 a. m.) para que la línea de cierre no salte.
const formatHour = (value) => {
  if (value === null || value === undefined) return '—';
  const total = Math.round(value * 60);
  const h24 = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  const suffix = h24 < 12 ? 'a. m.' : 'p. m.';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const shortHour = (value) => {
  const h24 = Math.round(value) % 24;
  return `${h24 % 12 || 12} ${h24 < 12 ? 'am' : 'pm'}`;
};

const dayLabel = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '');
};

const fullDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const useScheduleColors = () =>
  useMemo(
    () => ({
      open: themeColorRaw('--color-secondary') || '#06B6D4',
      close: themeColorRaw('--color-primary') || '#EC4899',
    }),
    []
  );

// ─── Piezas ─────────────────────────────────────────────────────

const Dot = ({ color }) => (
  <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
);

const Section = ({ icon: Icon, title, subtitle, className = '', children }) => (
  <section className={`fb-card p-4 md:p-5 ${className}`}>
    <div className="mb-4 flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
      <div>
        <h2 className="text-base font-bold text-light">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const UsualCard = ({ icon: Icon, label, value, count, color }) => (
  <div className="fb-card p-4">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm font-medium text-light">
        <Dot color={color} />
        {label}
      </span>
      <Icon className="h-4 w-4 text-gray" />
    </div>
    <p className="mt-3 text-3xl font-bold text-light">{formatHour(value)}</p>
    <p className="mt-1 text-xs text-gray">
      {count ? `Lo más típico en ${count} día${count === 1 ? '' : 's'}` : 'Aún sin datos'}
    </p>
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-dark/95 p-3 shadow-xl">
      <p className="mb-1.5 text-xs font-bold text-light">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-5 text-xs">
          <span className="flex items-center gap-2 text-gray">
            <Dot color={entry.color} />
            {entry.name}
          </span>
          <span className="font-semibold text-light">{formatHour(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Página ─────────────────────────────────────────────────────

const ScheduleDashboard = () => {
  const [days, setDays] = useState(30);
  const colors = useScheduleColors();

  const { data, isLoading } = useQuery({
    queryKey: ['schedule-analytics', 'daily', days],
    queryFn: () => scheduleAnalyticsService.getDaily(days),
  });

  const rows = useMemo(
    () => (data?.data || []).map((row) => ({ ...row, label: dayLabel(row.date) })),
    [data]
  );
  const usual = data?.usual;

  // Eje Y ajustado a las horas que de verdad hay, con una hora de aire.
  const domain = useMemo(() => {
    const hours = rows.flatMap((r) => [r.open, r.close]).filter((h) => h !== null);
    if (!hours.length) return [12, 26];
    return [Math.max(0, Math.floor(Math.min(...hours)) - 1), Math.ceil(Math.max(...hours)) + 1];
  }, [rows]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 md:space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="fb-eyebrow">Estadísticas</p>
          <h1 className="mt-1 text-xl font-bold text-light md:text-2xl">Horario del local</h1>
          <p className="mt-1 text-xs text-gray md:text-sm">
            A qué hora se abre y se cierra cada día, según el botón de abrir y cerrar del panel.
          </p>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={`fb-pill flex-shrink-0 ${days === p.days ? '!border-primary/50 !text-light' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lo normal */}
      <div className="grid gap-3 sm:grid-cols-2">
        <UsualCard icon={DoorOpen} label="Normalmente abre" value={usual?.open} count={usual?.days_open} color={colors.open} />
        <UsualCard icon={DoorClosed} label="Normalmente cierra" value={usual?.close} count={usual?.days_close} color={colors.close} />
      </div>

      {/* Gráfica */}
      <Section
        icon={Clock}
        title="Apertura y cierre, día a día"
        subtitle="Una jornada va de 6 a. m. a 6 a. m.: un cierre a la 1 a. m. cuenta en la noche anterior"
      >
        {isLoading ? (
          <div className="h-72 animate-pulse rounded-xl bg-white/5" />
        ) : rows.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={12} />
                <YAxis
                  domain={domain}
                  tickFormatter={shortHour}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                {usual?.open !== null && usual?.open !== undefined && (
                  <ReferenceLine y={usual.open} stroke={colors.open} strokeDasharray="4 4" strokeOpacity={0.5} />
                )}
                {usual?.close !== null && usual?.close !== undefined && (
                  <ReferenceLine y={usual.close} stroke={colors.close} strokeDasharray="4 4" strokeOpacity={0.5} />
                )}
                <Line dataKey="open" name="Abrió" type="monotone" stroke={colors.open} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line dataKey="close" name="Cerró" type="monotone" stroke={colors.close} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="fb-inset flex h-48 flex-col items-center justify-center gap-2 p-6 text-center">
            <Clock className="h-6 w-6 text-gray" />
            <p className="text-sm font-medium text-light">Todavía no hay aperturas ni cierres registrados</p>
            <p className="max-w-md text-xs text-gray">
              Desde el 11 de octubre de 2026 se guarda cada vez que el equipo abre o cierra el local desde el panel.
              La gráfica se va llenando sola día a día.
            </p>
          </div>
        )}
        {data?.tracking_since && (
          <p className="mt-3 text-[11px] text-gray">Registrando desde el {fullDate(data.tracking_since)}.</p>
        )}
      </Section>

      {/* Por día de la semana */}
      <Section icon={CalendarDays} title="Por día de la semana" subtitle="Lo más típico de cada día en el periodo elegido">
        <div className="divide-y divide-white/[0.06]">
          {(data?.by_weekday || []).map((row) => (
            <div key={row.weekday} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-24 flex-shrink-0 text-gray">{WEEKDAYS[row.weekday]}</span>
              <span className="flex flex-1 items-center gap-2 text-light">
                <Dot color={colors.open} />
                {formatHour(row.open)}
              </span>
              <span className="flex flex-1 items-center gap-2 text-light">
                <Dot color={colors.close} />
                {formatHour(row.close)}
              </span>
              <span className="w-14 flex-shrink-0 text-right text-xs text-gray">
                {row.days} día{row.days === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ScheduleDashboard;
