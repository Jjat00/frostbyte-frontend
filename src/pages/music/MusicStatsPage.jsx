/**
 * Estadísticas de la música pedida: qué suena, en qué piso y a qué hora.
 *
 * Pensada para leerse en escritorio (es una pantalla de análisis, no de
 * operación): rejilla de doce columnas, gráficas grandes y varias series a la
 * vez. En pantallas chicas todo se apila sin perder ningún dato.
 *
 * El color aquí SÍ es el dato: cada género tiene el suyo y se mantiene igual en
 * las cinco gráficas, así una franja ámbar es siempre corridos. Los pisos se
 * separan con los dos colores de marca (magenta el 2, cyan el 3).
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  CalendarDays,
  Clock,
  Disc3,
  Music2,
  Sparkles,
  Users,
} from 'lucide-react';
import { musicService } from '@/services';
import { themeColorRaw } from '@/lib/themeColors';

// ─── Constantes de presentación ──────────────────────────────────

const RANGES = [
  { id: '30', label: '30 días', days: 30 },
  { id: '90', label: '90 días', days: 90 },
  { id: '180', label: '6 meses', days: 180 },
  { id: 'all', label: 'Todo', days: 'all' },
];

const FLOORS = [
  { id: 'all', label: 'Los dos pisos' },
  { id: '2', label: 'Piso 2' },
  { id: '3', label: 'Piso 3' },
];

/**
 * Un color por género, estable en toda la pantalla (paleta de data-viz: aquí el
 * color ES el dato). Los dos géneros que se llevan la voz cantante toman los
 * colores de marca leídos del tema, así un cambio de skin no los deja fuera.
 */
const buildGenreColors = () => ({
  corridos: '#f59e0b',
  popular: '#ef4444',
  ranchera: '#fb923c',
  vallenato: '#10b981',
  salsa: '#eab308',
  cumbia: '#14b8a6',
  reggaeton: themeColorRaw('--color-primary'),
  bachata: '#ec4899',
  balada: '#a78bfa',
  rock: '#8b5cf6',
  pop: themeColorRaw('--color-secondary'),
  rap: '#6366f1',
  electronica: '#22d3ee',
  reggae: '#84cc16',
  otros: '#94a3b8',
  sin_clasificar: '#4b5563',
});

const FLOOR_LABEL = { 2: 'Piso 2', 3: 'Piso 3' };

const nf = new Intl.NumberFormat('es-CO');
const pct = (value) => `${Math.round((value || 0) * 100)}%`;

const hourLabel = (hour) => `${String(hour).padStart(2, '0')}:00`;

const dateLabel = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
};

const monthLabel = (period) => {
  const [y, m] = period.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${meses[Number(m) - 1]} ${y.slice(2)}`;
};

// ─── Piezas ──────────────────────────────────────────────────────

const Tip = ({ children }) => (
  <div className="rounded-xl border border-white/[0.12] bg-dark/95 px-3 py-2 text-xs shadow-[0_8px_30px_rgba(0,0,0,0.55)]">
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="fb-card p-4 xl:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="fb-eyebrow mb-2 block truncate">{label}</p>
        <p className="font-display text-2xl font-semibold leading-none text-light xl:text-[1.75rem]">
          {value}
        </p>
        {hint && <p className="mt-2 truncate text-[0.72rem] text-light/40">{hint}</p>}
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
        <Icon className="h-4 w-4 text-light/70" strokeWidth={1.6} />
      </span>
    </div>
  </div>
);

const Panel = ({ title, subtitle, right, children, className = '' }) => (
  <section className={`fb-card flex flex-col p-5 xl:p-6 ${className}`}>
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[0.78rem] text-light/45">{subtitle}</p>}
      </div>
      {right}
    </header>
    {children}
  </section>
);

const SkeletonPanel = ({ height = 'h-72' }) => (
  <div className={`fb-card ${height} animate-pulse p-6`}>
    <div className="mb-3 h-3 w-40 rounded bg-white/[0.08]" />
    <div className="mb-8 h-2.5 w-56 rounded bg-white/[0.05]" />
    <div className="flex h-[calc(100%-72px)] items-end gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex-1 rounded-t bg-white/[0.05]" style={{ height: `${25 + ((i * 37) % 65)}%` }} />
      ))}
    </div>
  </div>
);

/** Barra horizontal de un género, partida por piso. */
const GenreRow = ({ genre, max, floors, total, genreColor }) => {
  const width = max ? (genre.total / max) * 100 : 0;
  const partes = floors
    .map((floor) => ({ floor, value: genre[`floor_${floor}`] || 0 }))
    .filter((parte) => parte.value > 0);

  return (
    <div className="group grid grid-cols-[minmax(8.5rem,1.1fr)_1fr_auto] items-center gap-3 py-1.5 sm:grid-cols-[minmax(11rem,0.9fr)_1fr_auto] sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: genreColor(genre.slug) }}
        />
        <span className="truncate text-[0.82rem] text-light/85" title={genre.label}>
          {genre.label}
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div className="flex h-full" style={{ width: `${Math.max(width, 1.5)}%` }}>
          {partes.map((parte, i) => (
            <div
              key={parte.floor}
              title={`${FLOOR_LABEL[parte.floor]}: ${nf.format(parte.value)}`}
              style={{
                width: `${(parte.value / genre.total) * 100}%`,
                backgroundColor: genreColor(genre.slug),
                opacity: i === 0 ? 1 : 0.45,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="text-[0.82rem] font-semibold text-light">{nf.format(genre.total)}</span>
        <span className="w-9 text-right text-[0.72rem] text-light/40">
          {pct(total ? genre.total / total : 0)}
        </span>
      </div>
    </div>
  );
};

/** Lista de tops (canciones o artistas) con barra de fondo. */
const TopList = ({ items, max, renderTitle, renderMeta, image = false }) => (
  <ol className="space-y-1">
    {items.map((item, index) => (
      <li
        key={`${item.song || item.artist}-${index}`}
        className="relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-xl bg-white/[0.045]"
          style={{ width: `${max ? (item.total / max) * 100 : 0}%` }}
        />
        <span className="relative w-5 shrink-0 text-right font-display text-[0.7rem] text-light/30 tabular-nums">
          {index + 1}
        </span>
        {image && (
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]">
            {item.image ? (
              <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            ) : (
              <Disc3 className="m-2 h-5 w-5 text-light/25" strokeWidth={1.4} />
            )}
          </span>
        )}
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-[0.82rem] text-light/90">{renderTitle(item)}</p>
          <p className="truncate text-[0.72rem] text-light/40">{renderMeta(item)}</p>
        </div>
        <span className="relative shrink-0 text-[0.82rem] font-semibold text-light tabular-nums">
          {nf.format(item.total)}
        </span>
      </li>
    ))}
  </ol>
);

// ─── Pantalla ────────────────────────────────────────────────────

const MusicStatsPage = () => {
  const [rangeId, setRangeId] = useState('90');
  const [floorId, setFloorId] = useState('all');

  const genreColors = useMemo(() => buildGenreColors(), []);
  const genreColor = useMemo(
    () => (slug) => genreColors[slug] || genreColors.otros,
    [genreColors],
  );
  const floorColor = useMemo(
    () => ({ 2: themeColorRaw('--color-primary'), 3: themeColorRaw('--color-secondary') }),
    [],
  );

  const range = RANGES.find((r) => r.id === rangeId) || RANGES[1];
  const params = {
    days: range.days,
    ...(floorId !== 'all' ? { floor: Number(floorId) } : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['music-stats', rangeId, floorId],
    queryFn: () => musicService.getStats(params),
    staleTime: 5 * 60 * 1000,
  });

  const floors = data?.range?.floors || [2, 3];
  const generos = data?.genres || [];
  const totalPedidos = data?.summary?.total || 0;
  const maxGenero = generos[0]?.total || 0;

  const horas = useMemo(
    () =>
      (data?.by_hour || []).map((h) => ({
        ...h,
        label: hourLabel(h.hour),
      })),
    [data],
  );

  const semana = data?.by_weekday || [];
  const maxSemana = Math.max(1, ...semana.map((d) => d.total));

  const linea = useMemo(
    () => (data?.timeline || []).map((d) => ({ ...d, label: dateLabel(d.date) })),
    [data],
  );

  const evolucion = useMemo(() => {
    const periodos = data?.genre_timeline?.periods || [];
    const series = data?.genre_timeline?.series || [];
    return periodos.map((periodo, i) => {
      const fila = { period: periodo, label: monthLabel(periodo) };
      series.forEach((serie) => {
        fila[serie.slug] = serie.values[i] || 0;
      });
      return fila;
    });
  }, [data]);
  const seriesEvolucion = data?.genre_timeline?.series || [];

  const donut = (data?.summary?.floors || []).map((piso) => ({
    name: FLOOR_LABEL[piso.floor] || `Piso ${piso.floor}`,
    value: piso.total,
    floor: piso.floor,
  }));

  const sinClasificar = generos.find((g) => g.slug === 'sin_clasificar');

  return (
    <div className="mx-auto w-full max-w-[1700px] space-y-5">
      {/* Cabecera y filtros */}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="fb-eyebrow mb-2 block">Música · Spotify</p>
          <h1 className="font-display text-[1.35rem] font-semibold uppercase tracking-[0.14em] text-light xl:text-[1.6rem]">
            Qué suena en Frostbyte
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-light/50">
            Lo que la gente pide desde la carta, por género y por piso. El género lo lleva el artista
            principal de cada canción.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRangeId(r.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  rangeId === r.id
                    ? 'bg-white/[0.1] text-light'
                    : 'text-light/45 hover:text-light/80'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
            {FLOORS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFloorId(f.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  floorId === f.id ? 'bg-white/[0.1] text-light' : 'text-light/45 hover:text-light/80'
                }`}
              >
                {f.id !== 'all' && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: floorColor[Number(f.id)] }}
                  />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {isError && (
        <div className="fb-card p-6 text-sm text-red-300">
          No se pudieron cargar las estadísticas. Reintenta en un momento.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="fb-card h-[6.5rem] animate-pulse p-5" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <SkeletonPanel height="h-[30rem] xl:col-span-8" />
            <SkeletonPanel height="h-[30rem] xl:col-span-4" />
          </div>
        </div>
      ) : data && data.summary.total === 0 ? (
        <div className="fb-card flex flex-col items-center justify-center gap-3 p-16 text-center">
          <Disc3 className="h-8 w-8 text-light/20" strokeWidth={1.4} />
          <p className="text-sm text-light/60">
            Nadie pidió canciones en este rango{floorId !== 'all' ? ` en el piso ${floorId}` : ''}.
          </p>
          <button
            type="button"
            onClick={() => {
              setRangeId('all');
              setFloorId('all');
            }}
            className="fb-btn text-xs"
          >
            Ver todo el historial
          </button>
        </div>
      ) : (
        data && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-5 xl:gap-4">
              <StatCard
                icon={Music2}
                label="Canciones pedidas"
                value={nf.format(data.summary.total)}
                hint={`${nf.format(data.summary.tracks)} canciones distintas`}
              />
              <StatCard
                icon={CalendarDays}
                label="Noches con música"
                value={nf.format(data.summary.nights)}
                hint={data.range.start ? `desde el ${dateLabel(data.range.start)}` : ''}
              />
              <StatCard
                icon={Activity}
                label="Promedio por noche"
                value={nf.format(data.summary.per_night)}
                hint={
                  data.summary.best_night
                    ? `récord: ${nf.format(data.summary.best_night.total)} el ${dateLabel(
                        data.summary.best_night.date,
                      )}`
                    : ''
                }
              />
              <StatCard
                icon={Users}
                label="Artistas distintos"
                value={nf.format(data.summary.artists)}
                hint={`${pct(data.summary.classified_share)} con género identificado`}
              />
              <StatCard
                icon={Clock}
                label="Horas de música"
                value={nf.format(data.summary.hours_of_music)}
                hint="sumando la duración de lo pedido"
              />
            </div>

            {/* Géneros + pisos */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <Panel
                title="Qué géneros piden"
                subtitle="Cada barra es un género; el tramo claro es el piso 3."
                className="xl:col-span-8"
                right={
                  <span className="fb-pill hidden shrink-0 text-[0.6rem] uppercase tracking-[0.16em] sm:inline-flex">
                    {nf.format(totalPedidos)} pedidos
                  </span>
                }
              >
                <div className="divide-y divide-white/[0.04]">
                  {generos.map((genre) => (
                    <GenreRow
                      key={genre.slug}
                      genre={genre}
                      max={maxGenero}
                      floors={floors}
                      total={totalPedidos}
                      genreColor={genreColor}
                    />
                  ))}
                </div>
                {sinClasificar && (
                  <p className="mt-4 text-[0.72rem] text-light/35">
                    {nf.format(sinClasificar.total)} pedidos son de artistas que aún no pasaron por el
                    clasificador. Se corrige con{' '}
                    <code className="text-light/50">manage.py classify_artist_genres</code>.
                  </p>
                )}
              </Panel>

              <div className="space-y-5 xl:col-span-4">
                <Panel title="Piso a piso" subtitle="Dónde se pide más y qué manda en cada uno.">
                  <div className="flex items-center gap-4">
                    <div className="h-36 w-36 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donut}
                            dataKey="value"
                            innerRadius={44}
                            outerRadius={66}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {donut.map((entry) => (
                              <Cell key={entry.floor} fill={floorColor[entry.floor] || '#94a3b8'} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) =>
                              active && payload?.length ? (
                                <Tip>
                                  <p className="text-light">{payload[0].name}</p>
                                  <p className="text-light/60">
                                    {nf.format(payload[0].value)} pedidos
                                  </p>
                                </Tip>
                              ) : null
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      {(data.summary.floors || []).map((piso) => (
                        <div key={piso.floor} className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: floorColor[piso.floor] }}
                            />
                            <span className="text-[0.82rem] font-semibold text-light">
                              {FLOOR_LABEL[piso.floor] || `Piso ${piso.floor}`}
                            </span>
                            <span className="ml-auto text-[0.82rem] tabular-nums text-light/70">
                              {pct(piso.share)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[0.72rem] text-light/40">
                            {nf.format(piso.total)} pedidos · manda{' '}
                            <span style={{ color: genreColor(piso.top_genre.slug) }}>
                              {piso.top_genre.label}
                            </span>{' '}
                            ({pct(piso.top_genre.share)})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Día de la semana" subtitle="Cuándo se pide música.">
                  <div className="space-y-2">
                    {semana.map((dia) => (
                      <div key={dia.weekday} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-[0.78rem] text-light/60">{dia.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-light/45"
                            style={{ width: `${(dia.total / maxSemana) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-[0.78rem] tabular-nums text-light/70">
                          {nf.format(dia.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            {/* Hora de la noche */}
            <Panel
              title="La hora de la noche"
              subtitle="Del mediodía a la madrugada, en hora local."
              right={
                <div className="hidden items-center gap-3 text-[0.7rem] text-light/45 sm:flex">
                  {floors.map((floor) => (
                    <span key={floor} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: floorColor[floor] }}
                      />
                      {FLOOR_LABEL[floor]}
                    </span>
                  ))}
                </div>
              }
            >
              <div className="h-64 w-full xl:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={horas} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                    <defs>
                      {floors.map((floor) => (
                        <linearGradient key={floor} id={`hora-${floor}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={floorColor[floor]} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={floorColor[floor]} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(232,246,255,0.35)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(232,246,255,0.3)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <Tip>
                            <p className="mb-1 text-light">{label}</p>
                            {payload.map((serie) => (
                              <p key={serie.dataKey} style={{ color: serie.color }}>
                                {FLOOR_LABEL[serie.dataKey.split('_')[1]]}: {nf.format(serie.value)}
                              </p>
                            ))}
                          </Tip>
                        ) : null
                      }
                    />
                    {floors.map((floor) => (
                      <Area
                        key={floor}
                        type="monotone"
                        dataKey={`floor_${floor}`}
                        stackId="1"
                        stroke={floorColor[floor]}
                        strokeWidth={1.6}
                        fill={`url(#hora-${floor})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Tops */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Panel title="Las más pedidas" subtitle="Canciones que más veces sonaron a pedido.">
                <TopList
                  items={data.top_tracks || []}
                  max={data.top_tracks?.[0]?.total || 0}
                  image
                  renderTitle={(item) => item.song}
                  renderMeta={(item) => item.artist}
                />
              </Panel>

              <Panel title="Los artistas del local" subtitle="Quién se pide más, con su género.">
                <TopList
                  items={data.top_artists || []}
                  max={data.top_artists?.[0]?.total || 0}
                  renderTitle={(item) => item.artist}
                  renderMeta={(item) => (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: genreColor(item.genre) }}
                      />
                      {item.label}
                    </span>
                  )}
                />
              </Panel>
            </div>

            {/* Evolución */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <Panel
                title="Cómo cambia el gusto"
                subtitle="Los seis géneros más pedidos, mes a mes."
                className="xl:col-span-7"
                right={
                  <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-light/45 lg:flex">
                    {seriesEvolucion.map((serie) => (
                      <span key={serie.slug} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: genreColor(serie.slug) }}
                        />
                        {serie.label}
                      </span>
                    ))}
                  </div>
                }
              >
                <div className="h-64 w-full xl:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolucion} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: 'rgba(232,246,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(232,246,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />
                      <Tooltip
                        cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
                        content={({ active, payload, label }) =>
                          active && payload?.length ? (
                            <Tip>
                              <p className="mb-1 text-light">{label}</p>
                              {[...payload]
                                .sort((a, b) => b.value - a.value)
                                .map((serie) => (
                                  <p key={serie.dataKey} style={{ color: serie.color }}>
                                    {seriesEvolucion.find((s) => s.slug === serie.dataKey)?.label}:{' '}
                                    {nf.format(serie.value)}
                                  </p>
                                ))}
                            </Tip>
                          ) : null
                        }
                      />
                      {seriesEvolucion.map((serie) => (
                        <Area
                          key={serie.slug}
                          type="monotone"
                          dataKey={serie.slug}
                          stackId="1"
                          stroke={genreColor(serie.slug)}
                          strokeWidth={1.4}
                          fill={genreColor(serie.slug)}
                          fillOpacity={0.25}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel
                title="Noche a noche"
                subtitle="Canciones pedidas por noche de operación."
                className="xl:col-span-5"
              >
                <div className="h-64 w-full xl:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={linea} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: 'rgba(232,246,255,0.3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        minTickGap={28}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(232,246,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        content={({ active, payload, label }) =>
                          active && payload?.length ? (
                            <Tip>
                              <p className="mb-1 text-light">{label}</p>
                              {payload.map((serie) => (
                                <p key={serie.dataKey} style={{ color: serie.color }}>
                                  {FLOOR_LABEL[serie.dataKey.split('_')[1]]}: {nf.format(serie.value)}
                                </p>
                              ))}
                            </Tip>
                          ) : null
                        }
                      />
                      {floors.map((floor) => (
                        <Bar
                          key={floor}
                          dataKey={`floor_${floor}`}
                          stackId="1"
                          fill={floorColor[floor]}
                          radius={floor === floors[floors.length - 1] ? [3, 3, 0, 0] : 0}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <p className="flex items-center gap-2 pb-2 text-[0.72rem] text-light/30">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              El género de cada artista lo clasifica el modelo de lenguaje una sola vez; se corrige a
              mano desde el admin de Django.
            </p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default MusicStatsPage;
