import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  CalendarRange,
  Activity,
  Clock,
  CalendarDays,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  ShoppingCart,
  Receipt,
  Building2,
} from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { ordersService } from '@/services/orders.service';
import { useBusinessStore } from '@/stores/useBusinessStore';
import BusinessContextBadge from '@/components/BusinessContextBadge';
import BusinessComparison from '@/components/analytics/BusinessComparison';
import { themeColorRaw } from '@/lib/themeColors';

// Cyberpunk color palette for charts (paleta data-viz; los 2 primeros son los colores de marca del tema)
const buildCyberpunkColors = () => [
  themeColorRaw('--color-secondary'),
  themeColorRaw('--color-primary'),
  '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899',
];

// ─── Skeleton Components ────────────────────────────────────────

const KPICardSkeleton = () => (
  <div className="fb-card p-5 animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray/5 to-transparent" />
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-3 bg-gray/20 rounded w-24" />
        <div className="h-8 bg-gray/15 rounded w-32" />
        <div className="h-3 bg-gray/10 rounded w-20" />
      </div>
      <div className="w-11 h-11 bg-gray/15 rounded-xl" />
    </div>
  </div>
);

const ChartSkeleton = ({ height = 'h-72' }) => (
  <div className={`fb-card p-6 ${height} relative overflow-hidden`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray/5 to-transparent" />
    <div className="h-4 bg-gray/15 rounded w-40 mb-2" />
    <div className="h-3 bg-gray/10 rounded w-56 mb-6" />
    <div className="flex items-end justify-around h-[calc(100%-80px)] gap-2 px-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-gray/10 rounded-t flex-1"
          style={{ height: `${25 + Math.random() * 65}%` }}
        />
      ))}
    </div>
  </div>
);

// ─── Section Header ─────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className="rounded-[12px] border border-secondary/20 bg-secondary/10 p-2">
        <Icon className="w-5 h-5 text-secondary" />
      </div>
      <div>
        <h2 className="text-base md:text-lg font-bold text-light">{title}</h2>
        {subtitle && <p className="text-xs text-gray mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── Custom Tooltip ─────────────────────────────────────────────

const CustomChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/[0.06] border border-secondary/30 rounded-xl p-4 shadow-[0_0_20px_color-mix(in_srgb,var(--color-secondary)_15%,transparent)]">
      <p className="text-xs text-secondary font-bold mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray">{entry.name}</span>
          </div>
          <span className="text-sm font-bold text-light">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Stat Card ──────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, change, changeYoy, icon: Icon, color, isNegativeGood = false, isPrimary = false, delay = 0 }) => {
  const colorMap = {
    green: { border: 'border-green-500/30', text: 'text-green-400', bg: 'from-green-500/15 to-green-500/5', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]', icon: 'text-green-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]' },
    blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'from-blue-500/15 to-blue-500/5', glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]', icon: 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' },
    red: { border: 'border-red-500/30', text: 'text-red-400', bg: 'from-red-500/15 to-red-500/5', glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]', icon: 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' },
    secondary: { border: 'border-secondary/40', text: 'text-secondary', bg: 'from-secondary/15 to-secondary/5', glow: 'hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-secondary)_25%,transparent)]', icon: 'text-secondary drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-secondary)_70%,transparent)]' },
    primary: { border: 'border-primary/30', text: 'text-primary', bg: 'from-primary/15 to-primary/5', glow: 'hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]', icon: 'text-primary drop-shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]' },
  };

  const c = colorMap[color] || colorMap.secondary;
  const isPositive = isNegativeGood ? change < 0 : change > 0;
  const isNeutral = change === 0 || change === undefined;
  const yoyPositive = isNegativeGood ? changeYoy < 0 : changeYoy > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden group
        bg-gradient-to-br ${c.bg}
        border ${isPrimary ? 'border-2' : ''} ${c.border}
        rounded-2xl ${isPrimary ? 'p-5 md:p-6' : 'p-4 md:p-5'}
        transition-all duration-500 ${c.glow}
      `}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-secondary)_30%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_srgb,var(--color-primary)_30%,transparent)_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray text-xs md:text-sm font-medium">{title}</p>
          <div className="p-2 rounded-xl bg-dark/50 border border-gray/10 flex-shrink-0">
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${c.icon}`} />
          </div>
        </div>
        <p className={`${isPrimary ? 'text-[clamp(1.1rem,4vw,2.25rem)]' : 'text-[clamp(1rem,3.5vw,1.875rem)]'} font-bold text-light whitespace-nowrap`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-gray mt-1.5">{subtitle}</p>}
        {!isNeutral && change !== undefined && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
            isPositive
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
            <span className="text-gray font-normal hidden sm:inline">vs anterior</span>
          </div>
        )}
        {isNeutral && change !== undefined && (
          <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray/10 border border-gray/20 text-gray">
            <Minus className="w-3 h-3" />
            <span>Sin cambio</span>
          </div>
        )}
        {changeYoy !== undefined && changeYoy !== null && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-gray">
            {changeYoy === 0 ? (
              <Minus className="w-3 h-3" />
            ) : yoyPositive ? (
              <ArrowUpRight className="w-3 h-3 text-green-400" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-red-400" />
            )}
            <span className={changeYoy === 0 ? '' : yoyPositive ? 'text-green-400' : 'text-red-400'}>
              {changeYoy > 0 ? '+' : ''}{changeYoy}%
            </span>
            <span className="text-gray/70">vs año pasado</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Smart Insight Generator ────────────────────────────────────

/* ══════════════════════════════════════════════════════════
   Resultado del mes: el margen leido de arriba abajo, sin SQL.
   La inversion va DEBAJO del margen operativo a proposito: comprar
   una nevera o montar un piso consume caja pero no es costo del mes,
   y sumarla al gasto hace ver en perdida un mes que fue rentable.
   ══════════════════════════════════════════════════════════ */

const ResultRow = ({ label, value, percent, sign = '', tone = 'neutral', total = false, hint }) => {
  const toneClass = {
    neutral: 'text-light',
    negative: 'text-red-400',
    positive: 'text-green-400',
    muted: 'text-gray',
  }[tone] || 'text-light';

  return (
    <div className={`py-2 ${total ? 'border-t border-white/[0.12] mt-1 pt-3' : ''}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-xs md:text-sm ${total ? 'font-bold text-light' : 'text-gray'} truncate`}>
          {label}
        </span>
        <span className="flex items-baseline gap-2 md:gap-3 flex-shrink-0">
          <span className={`tabular-nums ${total ? 'text-base md:text-lg font-bold' : 'text-sm md:text-base font-semibold'} ${toneClass}`}>
            {sign}{value}
          </span>
          <span className="tabular-nums text-[10px] md:text-xs text-gray w-12 md:w-14 text-right">
            {percent}
          </span>
        </span>
      </div>
      {hint && <p className="text-[10px] md:text-xs text-gray/70 mt-0.5">{hint}</p>}
    </div>
  );
};

const MonthlyResult = ({ summary, formatCurrencyFull, containerClass }) => {
  if (!summary) return null;

  const revenue = summary.revenue?.value ?? 0;
  const inventory = summary.inventory_expenses?.value ?? 0;
  const operational = summary.operational_expenses?.value ?? 0;
  const profit = summary.net_profit?.value ?? 0;
  const investment = summary.investment?.value ?? 0;
  const cash = summary.cash_after_investment?.value ?? (profit - investment);

  const pct = (v) => (revenue > 0 ? `${((v / revenue) * 100).toFixed(1)}%` : '--');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className={containerClass}
    >
      <h3 className="text-base font-bold text-light mb-1 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-secondary" />
        Resultado del mes
      </h3>
      <p className="text-xs text-gray mb-3">
        De la venta a la caja, en orden. La inversion va aparte del margen.
      </p>

      <div className="divide-y divide-white/[0.05]">
        <ResultRow label="Ventas" value={formatCurrencyFull(revenue)} percent="100%" />
        <ResultRow label="Materia prima" value={formatCurrencyFull(inventory)} percent={pct(inventory)} sign="-" tone="negative" />
        <ResultRow label="Gasto corriente" value={formatCurrencyFull(operational)} percent={pct(operational)} sign="-" tone="negative" />
        <ResultRow
          label="Margen operativo"
          value={formatCurrencyFull(profit)}
          percent={pct(profit)}
          tone={profit >= 0 ? 'positive' : 'negative'}
          total
        />
        <ResultRow
          label="Inversion del mes"
          value={formatCurrencyFull(investment)}
          percent={pct(investment)}
          sign={investment > 0 ? '-' : ''}
          tone={investment > 0 ? 'neutral' : 'muted'}
          hint={investment > 0
            ? 'Equipos, mobiliario o montaje: compra algo que dura, no es costo del mes.'
            : 'Ningun gasto del mes esta marcado como inversion.'}
        />
        <ResultRow
          label="Caja tras invertir"
          value={formatCurrencyFull(cash)}
          percent={pct(cash)}
          tone={cash >= 0 ? 'positive' : 'negative'}
          total
        />
      </div>
    </motion.div>
  );
};

const generateInsight = (summary) => {
  if (!summary) return '';
  const { revenue, total_expenses, net_profit, profit_margin } = summary;
  const parts = [];

  if (net_profit?.value > 0 && profit_margin?.value > 20) {
    parts.push(`Excelente rentabilidad con margen del ${profit_margin.value}%.`);
  } else if (net_profit?.value > 0) {
    parts.push(`Operacion positiva con margen del ${profit_margin?.value || 0}%.`);
  } else if (net_profit?.value < 0) {
    parts.push(`Alerta: el periodo muestra perdidas.`);
  }

  if (revenue?.change > 10) parts.push(`Ingresos crecieron ${revenue.change}%.`);
  else if (revenue?.change < -10) parts.push(`Ingresos bajaron ${Math.abs(revenue.change)}%.`);

  if (total_expenses?.change < 0) parts.push(`Gastos reducidos en ${Math.abs(total_expenses.change)}%.`);
  else if (total_expenses?.change > 15) parts.push(`Gastos aumentaron ${total_expenses.change}%.`);

  return parts.join(' ');
};

// ─── Month helpers ──────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatMonthLabel = ({ year, month }) => `${MONTHS_ES[month - 1]} ${year}`;
const formatMonthShort = ({ year, month }) => `${MONTHS_ES[month - 1].slice(0, 3)} ${year}`;

// Desplaza un mes {year, month} en `delta` meses (positivo o negativo)
const shiftMonth = ({ year, month }, delta) => {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

// Ultimos `count` meses (incluyendo el actual), del mas reciente al mas antiguo
const buildRecentMonths = (count = 18) => {
  const now = new Date();
  let cursor = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const list = [];
  for (let i = 0; i < count; i += 1) {
    list.push(cursor);
    cursor = shiftMonth(cursor, -1);
  }
  return list;
};

// Primer y ultimo dia del mes ancla en formato YYYY-MM-DD (ultimo = hoy si es el mes en curso)
const monthDateRange = ({ year, month }) => {
  const pad = (n) => String(n).padStart(2, '0');
  const start = `${year}-${pad(month)}-01`;
  const now = new Date();
  const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;
  const endDate = isCurrent ? now : new Date(year, month, 0); // dia 0 del mes siguiente = ultimo del mes
  const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
  return { start, end };
};

// ─── Month Selector ─────────────────────────────────────────────

const MonthSelector = ({ anchor, onChange, isCurrentMonth }) => {
  const [open, setOpen] = useState(false);
  const recentMonths = buildRecentMonths(18);
  const now = new Date();
  const currentMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(anchor, -1))}
        aria-label="Mes anterior"
        className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray hover:text-secondary hover:border-secondary/30 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-light hover:border-secondary/30 transition-all min-w-[8.5rem] justify-center"
      >
        <Calendar className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
        <span className="text-xs md:text-sm font-semibold whitespace-nowrap">{formatMonthLabel(anchor)}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <button
        type="button"
        onClick={() => onChange(shiftMonth(anchor, 1))}
        disabled={isCurrentMonth}
        aria-label="Mes siguiente"
        className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray hover:text-secondary hover:border-secondary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray disabled:hover:border-white/[0.08]"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => onChange(currentMonth)}
          aria-label="Volver al mes actual"
          className="p-2 rounded-xl bg-secondary/10 border border-secondary/25 text-secondary hover:bg-secondary/20 transition-all"
          title="Mes actual"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-52 max-h-72 overflow-y-auto bg-dark/95 border border-white/[0.1] rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            {recentMonths.map((m) => {
              const active = m.year === anchor.year && m.month === anchor.month;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  type="button"
                  onClick={() => { onChange(m); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs md:text-sm transition-all ${
                    active
                      ? 'bg-secondary/15 border border-secondary/30 text-secondary font-semibold'
                      : 'text-gray hover:text-light hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {formatMonthLabel(m)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────

const FinancialDashboard = () => {
  const [viewMode, setViewMode] = useState('daily');
  const [trendMonths, setTrendMonths] = useState(12);

  // Tokens de tema leidos una vez para props de Recharts (no resuelven var())
  const CYBERPUNK_COLORS = useMemo(() => buildCyberpunkColors(), []);
  const chartSecondary = useMemo(() => themeColorRaw('--color-secondary'), []);
  const chartPrimary = useMemo(() => themeColorRaw('--color-primary'), []);
  const chartFontDisplay = useMemo(() => themeColorRaw('--font-display'), []);

  // Mes ancla seleccionado (default: mes en curso)
  const now = new Date();
  const [anchor, setAnchor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const isCurrentMonth = anchor.year === now.getFullYear() && anchor.month === now.getMonth() + 1;
  const period = { year: anchor.year, month: anchor.month };
  const monthKey = `${anchor.year}-${String(anchor.month).padStart(2, '0')}`;
  const { start: monthStart, end: monthEnd } = monthDateRange(anchor);

  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['financial-summary', selectedBusinessSlug, monthKey],
    queryFn: () => analyticsService.getSummary(biz, period),
  });

  // Comparativa por negocio (consolidado vs cada negocio) — sigue el mes ancla
  const { data: byBusiness } = useQuery({
    queryKey: ['analytics-by-business', monthKey],
    queryFn: () => analyticsService.getByBusiness(period),
  });

  const { data: dailyTrend, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-trend', selectedBusinessSlug, monthKey],
    queryFn: () => analyticsService.getDailyTrend(biz, period),
  });

  // Tendencia: serie historica de N meses hasta hoy (independiente del mes ancla)
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ['monthly-trend', trendMonths, selectedBusinessSlug],
    queryFn: () => analyticsService.getMonthlyTrend(trendMonths, biz),
    enabled: viewMode === 'monthly',
  });

  const { data: expensesBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['expenses-breakdown', selectedBusinessSlug, monthKey],
    queryFn: () => analyticsService.getExpensesBreakdown(biz, period),
  });

  const { data: comparison, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['monthly-comparison', selectedBusinessSlug, monthKey],
    queryFn: () => analyticsService.getComparison(biz, period),
  });

  // Patrones operativos (horas/dias): rango del mes ancla via start/end explicitos
  const { data: salesByHour, isLoading: isLoadingHourly } = useQuery({
    queryKey: ['sales-by-hour-analytics', monthKey],
    queryFn: () => ordersService.getSalesByHour('custom', monthStart, monthEnd),
  });

  const { data: salesByWeekday, isLoading: isLoadingWeekday } = useQuery({
    queryKey: ['sales-by-weekday-analytics', monthKey],
    queryFn: () => ordersService.getSalesByWeekday('custom', monthStart, monthEnd),
  });

  // ── Formatters ──

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num);
  };

  const formatCurrencyFull = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
  };

  // ── Derived data ──

  const comparisonData = comparison ? [
    { name: 'Ingresos', 'Año Pasado': comparison.year_ago_month?.revenue ?? 0, 'Mes Anterior': comparison.previous_month.revenue, 'Este Mes': comparison.current_month.revenue },
    { name: 'Gastos', 'Año Pasado': comparison.year_ago_month?.expenses ?? 0, 'Mes Anterior': comparison.previous_month.expenses, 'Este Mes': comparison.current_month.expenses },
    { name: 'Ganancia', 'Año Pasado': comparison.year_ago_month?.profit ?? 0, 'Mes Anterior': comparison.previous_month.profit, 'Este Mes': comparison.current_month.profit },
  ] : [];

  const chartData = viewMode === 'daily' ? dailyTrend?.data : monthlyTrend?.data;
  const xAxisKey = viewMode === 'daily' ? 'date_label' : 'month_label';
  const isChartLoading = viewMode === 'daily' ? isLoadingDaily : isLoadingTrend;

  const profitData = chartData?.map(item => ({
    ...item,
    profitColor: item.profit >= 0 ? 'url(#profitPositive)' : 'url(#profitNegative)',
  })) || [];

  const accumulatedData = chartData?.reduce((acc, item, index) => {
    const prev = index > 0 ? acc[index - 1] : { accumulated_revenue: 0, accumulated_expenses: 0, accumulated_profit: 0 };
    acc.push({
      ...item,
      accumulated_revenue: prev.accumulated_revenue + item.revenue,
      accumulated_expenses: prev.accumulated_expenses + item.total_expenses,
      accumulated_profit: prev.accumulated_profit + item.profit,
    });
    return acc;
  }, []) || [];

  const totalAccRevenue = accumulatedData.length > 0 ? accumulatedData[accumulatedData.length - 1].accumulated_revenue : 0;
  const totalAccExpenses = accumulatedData.length > 0 ? accumulatedData[accumulatedData.length - 1].accumulated_expenses : 0;

  const avgProfit = profitData.length > 0
    ? profitData.reduce((sum, d) => sum + (d.profit || 0), 0) / profitData.length
    : 0;

  // Peak hours detection
  const peakHoursData = salesByHour?.data?.filter(h => h.hour >= 8 && h.hour <= 23) || [];
  const sortedByRevenue = [...peakHoursData].sort((a, b) => b.revenue - a.revenue);
  const top3Hours = sortedByRevenue.slice(0, 3).map(h => h.hour);

  // Weekday average
  const weekdayAvg = salesByWeekday?.data
    ? salesByWeekday.data.reduce((s, d) => s + d.revenue, 0) / (salesByWeekday.data.length || 1)
    : 0;

  // ── Render helpers ──

  const chartContainerClass = 'fb-card p-4 md:p-6';

  const ViewModeToggle = () => (
    <div className="flex flex-wrap gap-2">
      <div className="flex bg-white/[0.08] rounded-xl p-1 border border-white/[0.08]">
        {[
          { key: 'daily', label: 'Este Mes', icon: Calendar },
          { key: 'monthly', label: 'Tendencia', icon: CalendarRange },
        ].map(({ key, label, icon: Ic }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
              viewMode === key ? 'text-secondary' : 'text-gray hover:text-light'
            }`}
          >
            {viewMode === key && (
              <motion.div
                layoutId="viewModeIndicator"
                className="absolute inset-0 bg-secondary/15 border border-secondary/30 rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Ic className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>
      {viewMode === 'monthly' && (
        <div className="flex gap-1">
          {[6, 12, 24].map((months) => (
            <button
              key={months}
              onClick={() => setTrendMonths(months)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                trendMonths === months
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-white/[0.03] text-gray hover:text-light hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {months}M
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1800px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-light flex items-center gap-2.5">
            <div className="rounded-[12px] border border-secondary/20 bg-secondary/10 p-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-secondary drop-shadow-[0_0_8px_color-mix(in_srgb,var(--color-secondary)_60%,transparent)]" />
            </div>
            Dashboard Financiero
          </h1>
          <p className="text-xs md:text-sm text-gray mt-1 ml-12">
            {formatMonthLabel(anchor)}{isCurrentMonth ? ' · en curso' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSelector anchor={anchor} onChange={setAnchor} isCurrentMonth={isCurrentMonth} />
          <div className="w-44 md:w-56">
            <BusinessContextBadge label={null} />
          </div>
        </div>
      </motion.div>

      {/* ── Comparativa por negocio (solo en Consolidado) ── */}
      {!selectedBusinessSlug && (
        <BusinessComparison
          data={byBusiness}
          formatCurrency={formatCurrency}
          formatCurrencyFull={formatCurrencyFull}
        />
      )}

      {/* ── Executive Insight Banner ── */}
      {!isLoadingSummary && summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-secondary/8 via-primary/5 to-secondary/8 border border-secondary/15 rounded-2xl p-4 md:p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,color-mix(in_srgb,var(--color-secondary)_40%,transparent),transparent_50%),radial-gradient(circle_at_70%_50%,color-mix(in_srgb,var(--color-primary)_30%,transparent),transparent_50%)]" />
          <div className="relative flex items-start gap-3">
            <Zap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-light mb-1">Resumen Ejecutivo</h3>
              <p className="text-xs md:text-sm text-gray leading-relaxed">
                Ingresos de{' '}
                <span className="text-secondary font-semibold">{formatCurrencyFull(summary?.revenue?.value)}</span>
                {' '}con gastos de{' '}
                <span className="text-red-400 font-semibold">{formatCurrencyFull(summary?.total_expenses?.value)}</span>
                {' '}= ganancia neta de{' '}
                <span className={`font-semibold ${summary?.net_profit?.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrencyFull(summary?.net_profit?.value)}
                </span>
                {' '}({summary?.profit_margin?.value}% margen).
                {summary?.investment?.value > 0 && (
                  <>
                    {' '}Ademas se invirtieron{' '}
                    <span className="text-light font-semibold">{formatCurrencyFull(summary.investment.value)}</span>
                    {' '}en equipos, mobiliario o montaje, que no restan del margen pero si de la caja:
                    quedan{' '}
                    <span className={`font-semibold ${summary?.cash_after_investment?.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrencyFull(summary.cash_after_investment?.value)}
                    </span>.
                  </>
                )}
                {' '}{generateInsight(summary)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: KPI Cards
         ══════════════════════════════════════════════════════════ */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(summary?.revenue?.value)}
            change={summary?.revenue?.change}
            changeYoy={summary?.revenue?.change_yoy}
            icon={DollarSign}
            color="green"
            delay={0}
          />
          <StatCard
            title="Gastos Totales"
            value={formatCurrency(summary?.total_expenses?.value)}
            subtitle="Sin inversion"
            change={summary?.total_expenses?.change}
            changeYoy={summary?.total_expenses?.change_yoy}
            icon={Wallet}
            color="red"
            isNegativeGood
            delay={0.05}
          />
          <StatCard
            title="Ganancia Neta"
            value={formatCurrency(summary?.net_profit?.value)}
            subtitle={`Margen: ${summary?.profit_margin?.value || 0}%`}
            change={summary?.net_profit?.change}
            changeYoy={summary?.net_profit?.change_yoy}
            icon={TrendingUp}
            color={summary?.net_profit?.value >= 0 ? 'secondary' : 'red'}
            isPrimary
            delay={0.1}
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(summary?.avg_ticket?.value)}
            change={summary?.avg_ticket?.change}
            changeYoy={summary?.avg_ticket?.change_yoy}
            icon={Receipt}
            color="secondary"
            delay={0.15}
          />
          <StatCard
            title="Pedidos"
            value={String(summary?.orders_count?.value ?? 0)}
            change={summary?.orders_count?.change}
            changeYoy={summary?.orders_count?.change_yoy}
            icon={ShoppingCart}
            color="primary"
            delay={0.2}
          />
          <StatCard
            title="Gastos Inventario"
            value={formatCurrency(summary?.inventory_expenses?.value)}
            change={summary?.inventory_expenses?.change}
            changeYoy={summary?.inventory_expenses?.change_yoy}
            icon={Package}
            color="blue"
            isNegativeGood
            delay={0.25}
          />
        </div>
      )}

      {/* ── Resultado del mes: el margen sin tener que interpretarlo ── */}
      {!isLoadingSummary && (
        <MonthlyResult
          summary={summary}
          formatCurrencyFull={formatCurrencyFull}
          containerClass={chartContainerClass}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: Operational Patterns
         ══════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Clock}
          title="Patrones Operativos"
          subtitle={biz ? "Horarios y dias de mayor actividad (todos los negocios)" : "Horarios y dias de mayor actividad"}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Peak Hours */}
          {isLoadingHourly ? <ChartSkeleton height="h-80" /> : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={chartContainerClass}
            >
              <h3 className="text-base font-bold text-light mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Horarios Pico
              </h3>
              <p className="text-xs text-gray mb-4">Ingresos acumulados por hora (ultimo mes)</p>
              {peakHoursData.some(h => h.revenue > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="hourNormal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartSecondary} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={chartSecondary} stopOpacity={0.25} />
                        </linearGradient>
                        <linearGradient id="hourPeak" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartPrimary} />
                          <stop offset="50%" stopColor={chartSecondary} />
                          <stop offset="100%" stopColor={chartSecondary} stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                      <XAxis dataKey="hour_label" stroke="#9CA3AF" style={{ fontSize: '10px' }} interval={1} />
                      <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '10px' }} width={50} />
                      <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                      <Bar dataKey="revenue" name="Ingresos" radius={[6, 6, 0, 0]}>
                        {peakHoursData.map((entry, index) => (
                          <Cell key={index} fill={top3Hours.includes(entry.hour) ? 'url(#hourPeak)' : 'url(#hourNormal)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray text-sm">
                  No hay datos de horarios disponibles
                </div>
              )}
            </motion.div>
          )}

          {/* Weekday Sales */}
          {isLoadingWeekday ? <ChartSkeleton height="h-80" /> : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={chartContainerClass}
            >
              <h3 className="text-base font-bold text-light mb-1 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-cyan-400" />
                Ventas por Dia de Semana
              </h3>
              <p className="text-xs text-gray mb-4">Ingresos acumulados por dia (ultimo mes)</p>
              {salesByWeekday?.data?.some(d => d.revenue > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByWeekday.data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="weekdayAbove" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor={chartSecondary} stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="weekdayBelow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6B7280" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#374151" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="weekday_name"
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        tickFormatter={(v) => v.substring(0, 3)}
                      />
                      <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '10px' }} width={50} />
                      <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                      <ReferenceLine y={weekdayAvg} stroke={chartSecondary} strokeDasharray="5 5" strokeOpacity={0.4} />
                      <Bar dataKey="revenue" name="Ingresos" radius={[6, 6, 0, 0]}>
                        {salesByWeekday.data.map((entry, index) => (
                          <Cell key={index} fill={entry.revenue >= weekdayAvg ? 'url(#weekdayAbove)' : 'url(#weekdayBelow)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray text-sm">
                  No hay datos de dias disponibles
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: Financial Trends
         ══════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Activity}
          title="Tendencias Financieras"
          subtitle="Evolucion de ingresos, gastos y ganancias"
          action={<ViewModeToggle />}
        />

        {/* Accumulated Chart */}
        {isChartLoading ? <ChartSkeleton height="h-96" /> : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${chartContainerClass} border-primary/15`}
          >
            <h3 className="text-base font-bold text-light mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Acumulado {viewMode === 'daily' ? 'del Mes' : 'por Periodo'}
            </h3>

            {/* Legend with totals */}
            <div className="flex flex-wrap gap-4 mb-4 mt-3">
              {[
                { label: 'Ingresos', value: totalAccRevenue, color: '#10B981', dotClass: 'bg-green-500' },
                { label: 'Gastos', value: totalAccExpenses, color: '#EF4444', dotClass: 'bg-red-500' },
                { label: 'Balance', value: totalAccRevenue - totalAccExpenses, color: '#8B5CF6', dotClass: 'bg-purple-500' },
              ].map(({ label, value, dotClass }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark/40 border border-gray/10">
                  <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                  <span className="text-xs text-gray">{label}:</span>
                  <span className={`text-xs font-bold ${
                    label === 'Balance' ? (value >= 0 ? 'text-purple-400' : 'text-red-400') :
                    label === 'Gastos' ? 'text-red-400' : 'text-green-400'
                  }`}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>

            {accumulatedData.length > 0 ? (
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accumulatedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="accRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="accExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="accProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                    <XAxis
                      dataKey={xAxisKey}
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                    />
                    <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                    <Area type="monotone" dataKey="accumulated_revenue" name="Ingresos Acumulados" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#accRevenue)" activeDot={{ r: 5, fill: '#10B981', stroke: '#0a0b14', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="accumulated_expenses" name="Gastos Acumulados" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#accExpenses)" activeDot={{ r: 5, fill: '#EF4444', stroke: '#0a0b14', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="accumulated_profit" name="Balance" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#accProfit)" activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#0a0b14', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 md:h-80 flex items-center justify-center text-gray text-sm">
                No hay datos disponibles para este periodo
              </div>
            )}
          </motion.div>
        )}

        {/* Revenue vs Expenses Line Chart */}
        {isChartLoading ? <ChartSkeleton height="h-96" /> : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${chartContainerClass} mt-4 md:mt-6`}
          >
            <h3 className="text-base font-bold text-light mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" />
              {viewMode === 'daily' ? 'Ingresos vs Gastos - Este Mes' : 'Tendencia Mensual'}
            </h3>

            {chartData?.length > 0 ? (
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                    <XAxis
                      dataKey={xAxisKey}
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                    />
                    <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke={chartSecondary}
                      strokeWidth={3}
                      dot={{ fill: chartSecondary, r: viewMode === 'daily' ? 2 : 4, strokeWidth: 2, stroke: '#0a0b14' }}
                      activeDot={{ r: 6, className: 'drop-shadow-[0_0_8px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)]' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inventory_expenses"
                      name="Gastos Inventario"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#8B5CF6', r: viewMode === 'daily' ? 1.5 : 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="operational_expenses"
                      name="Gastos Operativos"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F59E0B', r: viewMode === 'daily' ? 1.5 : 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 md:h-80 flex items-center justify-center text-gray text-sm">
                No hay datos disponibles para este periodo
              </div>
            )}
          </motion.div>
        )}

        {/* Bar chart Ingresos vs Gastos mes a mes (solo en Tendencia) */}
        {viewMode === 'monthly' && (
          isChartLoading ? <ChartSkeleton height="h-96" /> : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`${chartContainerClass} mt-4 md:mt-6`}
            >
              <h3 className="text-base font-bold text-light mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />
                Ingresos vs Gastos por Mes
              </h3>

              {chartData?.length > 0 ? (
                <div className="h-72 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                      <XAxis
                        dataKey={xAxisKey}
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
                      <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Legend />
                      <Bar dataKey="revenue" name="Ingresos" fill={chartSecondary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total_expenses" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Ganancia" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 md:h-80 flex items-center justify-center text-gray text-sm">
                  No hay datos disponibles para este periodo
                </div>
              )}
            </motion.div>
          )
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: Detailed Analysis
         ══════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={BarChart3}
          title="Analisis Detallado"
          subtitle="Desglose por categorias y comparaciones"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Expenses Pie Chart */}
          {isLoadingBreakdown ? <ChartSkeleton /> : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={chartContainerClass}
            >
              <h3 className="text-base font-bold text-light mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-yellow-400" />
                Distribucion de Gastos
              </h3>

              {expensesBreakdown?.categories?.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesBreakdown.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="total"
                          nameKey="name"
                        >
                          {expensesBreakdown.categories.map((_, index) => (
                            <Cell key={index} fill={CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                        {/* Center text */}
                        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="#e8f6ff" fontSize="18" fontWeight="bold" fontFamily={chartFontDisplay}>
                          {formatCurrency(expensesBreakdown.total)}
                        </text>
                        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="#8a8d9c" fontSize="11">
                          Total
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {expensesBreakdown.categories.map((cat, index) => (
                      <div key={cat.slug} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length],
                              boxShadow: `0 0 8px ${CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length]}40`,
                            }}
                          />
                          <span className="text-gray text-xs">{cat.name}</span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-light font-semibold text-xs">{formatCurrency(cat.total)}</span>
                          <span className="text-gray text-xs opacity-70">({cat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray text-sm">
                  No hay gastos registrados este mes
                </div>
              )}
            </motion.div>
          )}

          {/* Monthly Comparison */}
          {isLoadingComparison ? <ChartSkeleton /> : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={chartContainerClass}
            >
              <h3 className="text-base font-bold text-light mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Comparación Mensual
              </h3>

              {comparison ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                        <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
                        <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                        <Legend />
                        <Bar dataKey="Año Pasado" fill="#8B5CF6" radius={[6, 6, 0, 0]} opacity={0.35} />
                        <Bar dataKey="Mes Anterior" fill="#374151" radius={[6, 6, 0, 0]} opacity={0.6} />
                        <Bar dataKey="Este Mes" radius={[6, 6, 0, 0]}>
                          {comparisonData.map((entry, index) => {
                            const improved = entry.name === 'Gastos'
                              ? entry['Este Mes'] <= entry['Mes Anterior']
                              : entry['Este Mes'] >= entry['Mes Anterior'];
                            return <Cell key={index} fill={improved ? '#10B981' : '#EF4444'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Change badges */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Ingresos', val: comparison.changes.revenue, yoy: comparison.changes.revenue_yoy, good: comparison.changes.revenue >= 0 },
                      { label: 'Gastos', val: comparison.changes.expenses, yoy: comparison.changes.expenses_yoy, good: comparison.changes.expenses <= 0 },
                      { label: 'Ganancia', val: comparison.changes.profit, yoy: comparison.changes.profit_yoy, good: comparison.changes.profit >= 0 },
                    ].map(({ label, val, yoy, good }) => (
                      <div key={label} className="text-center p-2.5 bg-dark/50 rounded-xl border border-gray/10">
                        <p className="fb-eyebrow mb-1.5 block">{label}</p>
                        <p className={`text-sm font-bold ${good ? 'text-green-400' : 'text-red-400'}`}>
                          {val >= 0 ? '+' : ''}{val}%
                        </p>
                        <p className="text-[10px] text-gray/70 mt-0.5">
                          {yoy >= 0 ? '+' : ''}{yoy}% <span className="hidden sm:inline">año pasado</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray text-sm">
                  No hay datos para comparar
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5: Performance - Net Profit
         ══════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="Rendimiento"
          subtitle={`Ganancia neta ${viewMode === 'daily' ? 'por dia' : 'por mes'}`}
        />

        {isChartLoading ? <ChartSkeleton height="h-96" /> : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={chartContainerClass}
          >
            {profitData.length > 0 ? (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="profitPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="profitNegative" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                    <XAxis
                      dataKey={xAxisKey}
                      stroke="#9CA3AF"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                    />
                    <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomChartTooltip formatter={formatCurrencyFull} />} />
                    {avgProfit !== 0 && (
                      <ReferenceLine
                        y={avgProfit}
                        stroke={chartSecondary}
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        label={{
                          value: `Prom: ${formatCurrency(avgProfit)}`,
                          fill: chartSecondary,
                          fontSize: 10,
                          position: 'insideTopRight',
                        }}
                      />
                    )}
                    <Bar dataKey="profit" name="Ganancia Neta" radius={[6, 6, 0, 0]}>
                      {profitData.map((entry, index) => (
                        <Cell key={index} fill={entry.profit >= 0 ? 'url(#profitPositive)' : 'url(#profitNegative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 md:h-80 flex items-center justify-center text-gray text-sm">
                No hay datos de ganancia disponibles
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default FinancialDashboard;
