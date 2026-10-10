import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bike,
  MessageCircle,
  Smartphone,
  Store,
  Users,
  Trophy,
} from 'lucide-react';
import { channelAnalyticsService } from '@/services/analytics.service';
import { themeColorRaw } from '@/lib/themeColors';

const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '1 año' },
  { days: 0, label: 'Todo' },
];

const ORDER_TYPE_LABELS = { delivery: 'Domicilio', pickup: 'Para recoger', dine_in: 'En el local' };

const CHANNEL_META = {
  staff: { label: 'En el local', hint: 'Tomados por el equipo', icon: Store },
  customer: { label: 'App', hint: 'Pedidos desde la carta en línea', icon: Smartphone },
  whatsapp: { label: 'WhatsApp', hint: 'Tomados por Frosty', icon: MessageCircle },
};

const money = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);

const number = (value) => new Intl.NumberFormat('es-CO').format(value || 0);

const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
};

const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

const useChannelColors = () =>
  useMemo(
    () => ({
      staff: 'rgba(255,255,255,0.35)',
      customer: themeColorRaw('--color-secondary') || '#06B6D4',
      whatsapp: '#10B981',
      delivery: themeColorRaw('--color-primary') || '#EC4899',
    }),
    []
  );

// ─── Piezas ─────────────────────────────────────────────────────

const Dot = ({ color }) => (
  <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
);

const Change = ({ value }) => {
  if (value === null || value === undefined) return null;
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray'}`}>
      {value !== 0 && <Icon className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
};

const Metric = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-gray">{label}</p>
    <p className="truncate text-sm font-semibold text-light">{value}</p>
  </div>
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
          <span className="font-semibold text-light">{number(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const ChannelCard = ({ channel, color, share, showChange }) => {
  const meta = CHANNEL_META[channel.source];
  const Icon = meta.icon;
  return (
    <div className="fb-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-light">
          <Dot color={color} />
          {meta.label}
        </span>
        <Icon className="h-4 w-4 text-gray" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-light">{number(channel.orders)}</span>
        <span className="text-xs text-gray">pedidos · {share}%</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray">
        {showChange && channel.change !== undefined ? (
          <>
            <Change value={channel.change} />
            <span>vs periodo anterior ({number(channel.previous_orders)})</span>
          </>
        ) : (
          <span>{meta.hint}</span>
        )}
      </div>
      <div className="fb-inset mt-4 grid grid-cols-2 gap-3 p-3">
        <Metric label="Vendido" value={money(channel.revenue)} />
        <Metric label="Ticket promedio" value={money(channel.avg_ticket)} />
        {channel.unique_customers !== null && channel.unique_customers !== undefined && (
          <Metric label="Clientes distintos" value={number(channel.unique_customers)} />
        )}
        <Metric label="Cancelados" value={number(channel.cancelled)} />
      </div>
    </div>
  );
};

const Skeleton = ({ className }) => <div className={`fb-card animate-pulse ${className}`} />;

// ─── Página ─────────────────────────────────────────────────────

const ChannelsDashboard = () => {
  const [days, setDays] = useState(30);
  const colors = useChannelColors();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['channel-analytics', 'summary', days],
    queryFn: () => channelAnalyticsService.getSummary(days),
  });
  const { data: monthly } = useQuery({
    queryKey: ['channel-analytics', 'monthly'],
    queryFn: () => channelAnalyticsService.getMonthly(12),
  });
  const { data: googleUsers } = useQuery({
    queryKey: ['channel-analytics', 'google-users'],
    queryFn: () => channelAnalyticsService.getGoogleUsers(50),
  });

  const channels = summary?.channels || [];
  const totalOrders = channels.reduce((sum, c) => sum + c.orders, 0);
  const showChange = days !== 0;
  const delivery = summary?.delivery;
  const google = summary?.google_users;
  const onlineTypes = summary?.online_order_types || {};
  const onlineTotal = Object.values(onlineTypes).reduce((a, b) => a + b, 0);
  const monthlyData = (monthly?.data || []).map((row) => ({ ...row, label: monthLabel(row.month) }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 md:space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="fb-eyebrow">Estadísticas</p>
          <h1 className="mt-1 text-xl font-bold text-light md:text-2xl">Canales y clientes</h1>
          <p className="mt-1 text-xs text-gray md:text-sm">
            Domicilios, pedidos por WhatsApp y por la app, y registros con Google.
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

      {/* Canales */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-60" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {channels.map((c) => (
              <ChannelCard
                key={c.source}
                channel={c}
                color={colors[c.source]}
                share={percent(c.orders, totalOrders)}
                showChange={showChange}
              />
            ))}
          </div>
          {totalOrders > 0 && (
            <div className="flex h-2 overflow-hidden rounded-full bg-white/5" aria-hidden>
              {channels.map((c) => (
                <div key={c.source} style={{ width: `${percent(c.orders, totalOrders)}%`, backgroundColor: colors[c.source] }} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Domicilios */}
        <Section icon={Bike} title="Domicilios" subtitle="Pedidos con entrega a domicilio, de cualquier canal">
          {delivery ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-light">{number(delivery.orders)}</span>
                <span className="text-xs text-gray">domicilios</span>
                {showChange && <Change value={delivery.change} />}
              </div>
              <div className="fb-inset mt-4 grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
                <Metric label="Vendido" value={money(delivery.revenue)} />
                <Metric label="Ticket promedio" value={money(delivery.avg_ticket)} />
                <Metric label="Envíos cobrados" value={money(delivery.delivery_fees)} />
                <Metric label="Cancelados" value={number(delivery.cancelled)} />
              </div>
              <p className="mb-2 mt-4 text-xs text-gray">Por dónde llegaron</p>
              <div className="space-y-2">
                {['whatsapp', 'customer', 'staff'].map((source) => {
                  const n = delivery.by_source?.[source] || 0;
                  return (
                    <div key={source} className="flex items-center gap-3 text-sm">
                      <span className="flex w-28 items-center gap-2 text-gray">
                        <Dot color={colors[source]} />
                        {CHANNEL_META[source].label}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${percent(n, delivery.orders)}%`, backgroundColor: colors[source] }} />
                      </div>
                      <span className="w-16 text-right font-semibold text-light">
                        {number(n)} <span className="text-xs font-normal text-gray">{percent(n, delivery.orders)}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-white/5" />
          )}
        </Section>

        {/* Usuarios Google */}
        <Section icon={Users} title="Clientes con Google" subtitle="Cuentas creadas al entrar con Google en la app">
          {google ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-light">{number(google.new)}</span>
                <span className="text-xs text-gray">{days === 0 ? 'registros en total' : 'registros nuevos'}</span>
                {showChange && google.previous_new !== undefined && (
                  <span className="text-xs text-gray">(antes {number(google.previous_new)})</span>
                )}
              </div>
              <div className="fb-inset mt-4 grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
                <Metric label="Nuevos sin la Polla" value={number(google.new_without_polla)} />
                <Metric label="Nuevos que pidieron" value={number(google.new_with_orders)} />
                <Metric label="Total histórico" value={number(google.total)} />
                <Metric label="Vinieron por la Polla" value={number(google.polla)} />
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-gray">Cuentas que ya pidieron por la app</span>
                  <span className="font-semibold text-light">
                    {number(google.with_orders)} de {number(google.total)} · {percent(google.with_orders, google.total)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${percent(google.with_orders, google.total)}%` }} />
                </div>
              </div>
              {onlineTotal > 0 && (
                <>
                  <p className="mb-2 mt-5 text-xs text-gray">Pedidos en línea (app + WhatsApp) por tipo</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(onlineTypes).map(([type, n]) => (
                      <span key={type} className="fb-pill">
                        {ORDER_TYPE_LABELS[type] || type}
                        <span className="font-semibold text-light">{number(n)}</span>
                        <span>{percent(n, onlineTotal)}%</span>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-white/5" />
          )}
        </Section>
      </div>

      {/* Tendencia mensual */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Section icon={Store} title="Pedidos por canal, mes a mes" subtitle="Últimos 12 meses, sin cancelados" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                <Bar dataKey="staff" name="En el local" stackId="orders" fill={colors.staff} />
                <Bar dataKey="customer" name="App" stackId="orders" fill={colors.customer} />
                <Bar dataKey="whatsapp" name="WhatsApp" stackId="orders" fill={colors.whatsapp} radius={[4, 4, 0, 0]} />
                <Line dataKey="delivery" name="Domicilios" type="monotone" stroke={colors.delivery} strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section icon={Trophy} title="Registros con Google" subtitle="Por mes, clientes y Polla">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                <Bar dataKey="google_users_other" name="Clientes" stackId="g" fill={colors.customer} />
                <Bar dataKey="google_users_polla" name="Polla" stackId="g" fill="rgba(255,255,255,0.25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Últimos registros */}
      <Section icon={Users} title="Últimos registros con Google" subtitle="Los 50 más recientes y si ya pidieron por la app">
        <div className="divide-y divide-white/[0.06]">
          {(googleUsers?.results || []).map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2.5">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-9 w-9 flex-shrink-0 rounded-full" />
              ) : (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-light">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-light">
                  <span className="truncate">{u.name}</span>
                  {u.played_polla && <span className="flex-shrink-0 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-gray">Polla</span>}
                </p>
                <p className="truncate text-xs text-gray">{u.email} · desde {shortDate(u.date_joined)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-semibold ${u.app_orders ? 'text-light' : 'text-gray'}`}>
                  {u.app_orders ? `${u.app_orders} pedido${u.app_orders === 1 ? '' : 's'}` : 'Sin pedidos'}
                </p>
                {u.last_order_at && <p className="text-[11px] text-gray">último {shortDate(u.last_order_at)}</p>}
              </div>
            </div>
          ))}
          {googleUsers && !googleUsers.results?.length && (
            <p className="py-6 text-center text-sm text-gray">Aún no hay registros con Google.</p>
          )}
        </div>
      </Section>
    </div>
  );
};

export default ChannelsDashboard;
