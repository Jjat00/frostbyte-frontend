import React, { useState } from 'react';
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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Package,
  BarChart3,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  CalendarRange,
  Activity,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { ordersService } from '@/services/orders.service';

// Colores para el pie chart
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const StatCard = ({ title, value, subtitle, change, icon: Icon, color, isNegativeGood = false }) => {
  const colorClasses = {
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-500',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-500',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500',
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 text-secondary',
  };

  const isPositive = isNegativeGood ? change < 0 : change > 0;
  const isNeutral = change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 md:p-6`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray text-xs md:text-sm font-medium mb-1 truncate">{title}</p>
          <p className="text-xl md:text-3xl font-bold text-light truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray mt-1 md:mt-2">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              isNeutral ? 'text-gray' : isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(change)}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-lg bg-dark/50 flex-shrink-0 ml-2`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const FinancialDashboard = () => {
  // Vista por defecto: mes actual (daily)
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [trendMonths, setTrendMonths] = useState(12);

  // Obtener resumen financiero
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => analyticsService.getSummary(),
  });

  // Obtener tendencia diaria (mes actual) - carga por defecto
  const { data: dailyTrend, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-trend'],
    queryFn: () => analyticsService.getDailyTrend(),
  });

  // Obtener tendencia mensual - solo cuando se selecciona
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ['monthly-trend', trendMonths],
    queryFn: () => analyticsService.getMonthlyTrend(trendMonths),
    enabled: viewMode === 'monthly',
  });

  // Obtener desglose de gastos
  const { data: expensesBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['expenses-breakdown'],
    queryFn: () => analyticsService.getExpensesBreakdown(),
  });

  // Obtener comparacion mensual
  const { data: comparison, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['monthly-comparison'],
    queryFn: () => analyticsService.getComparison(),
  });

  // Obtener ventas por hora (último mes para datos significativos)
  const { data: salesByHour, isLoading: isLoadingHourly } = useQuery({
    queryKey: ['sales-by-hour-analytics'],
    queryFn: () => ordersService.getSalesByHour('month'),
  });

  // Obtener ventas por día de semana (último mes)
  const { data: salesByWeekday, isLoading: isLoadingWeekday } = useQuery({
    queryKey: ['sales-by-weekday-analytics'],
    queryFn: () => ordersService.getSalesByWeekday('month'),
  });

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrencyFull = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const isLoading = isLoadingSummary || isLoadingBreakdown || isLoadingComparison ||
    isLoadingHourly || isLoadingWeekday ||
    (viewMode === 'daily' && isLoadingDaily) ||
    (viewMode === 'monthly' && isLoadingTrend);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Preparar datos para la grafica de barras de comparacion
  const comparisonData = comparison ? [
    {
      name: 'Ingresos',
      'Mes Anterior': comparison.previous_month.revenue,
      'Este Mes': comparison.current_month.revenue,
    },
    {
      name: 'Gastos',
      'Mes Anterior': comparison.previous_month.expenses,
      'Este Mes': comparison.current_month.expenses,
    },
    {
      name: 'Ganancia',
      'Mes Anterior': comparison.previous_month.profit,
      'Este Mes': comparison.current_month.profit,
    },
  ] : [];

  // Datos para la grafica principal segun el modo de vista
  const chartData = viewMode === 'daily' ? dailyTrend?.data : monthlyTrend?.data;
  const xAxisKey = viewMode === 'daily' ? 'date_label' : 'month_label';

  // Preparar datos para la grafica de barras de ganancias
  const profitData = chartData?.map(item => ({
    ...item,
    profitColor: item.profit >= 0 ? '#10B981' : '#EF4444',
  })) || [];

  // Calcular datos acumulados
  const accumulatedData = chartData?.reduce((acc, item, index) => {
    const prevAccRevenue = index > 0 ? acc[index - 1].accumulated_revenue : 0;
    const prevAccExpenses = index > 0 ? acc[index - 1].accumulated_expenses : 0;
    const prevAccProfit = index > 0 ? acc[index - 1].accumulated_profit : 0;
    
    acc.push({
      ...item,
      accumulated_revenue: prevAccRevenue + item.revenue,
      accumulated_expenses: prevAccExpenses + item.total_expenses,
      accumulated_profit: prevAccProfit + item.profit,
    });
    return acc;
  }, []) || [];

  // Totales acumulados
  const totalAccumulatedRevenue = accumulatedData.length > 0 
    ? accumulatedData[accumulatedData.length - 1].accumulated_revenue 
    : 0;
  const totalAccumulatedExpenses = accumulatedData.length > 0 
    ? accumulatedData[accumulatedData.length - 1].accumulated_expenses 
    : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-light flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-secondary" />
            Dashboard Financiero
          </h1>
          <p className="text-sm text-gray">
            Resumen ejecutivo - {summary?.period?.current_month}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(summary?.revenue?.value)}
          change={summary?.revenue?.change}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Gastos Totales"
          value={formatCurrency(summary?.total_expenses?.value)}
          change={summary?.total_expenses?.change}
          icon={Wallet}
          color="red"
          isNegativeGood={true}
        />
        <StatCard
          title="Ganancia Neta"
          value={formatCurrency(summary?.net_profit?.value)}
          subtitle={`Margen: ${summary?.profit_margin?.value || 0}%`}
          change={summary?.net_profit?.change}
          icon={TrendingUp}
          color={summary?.net_profit?.value >= 0 ? 'secondary' : 'red'}
        />
        <StatCard
          title="Gastos Inventario"
          value={formatCurrency(summary?.inventory_expenses?.value)}
          change={summary?.inventory_expenses?.change}
          icon={Package}
          color="blue"
          isNegativeGood={true}
        />
      </div>

      {/* Gráficas Estratégicas: Horarios Pico y Días de Semana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Ventas por Hora del Día */}
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-light mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Horarios Pico
          </h2>
          <p className="text-xs text-gray mb-4">Ingresos acumulados por hora del día (último mes)</p>
          {salesByHour?.data && salesByHour.data.some(h => h.revenue > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesByHour.data.filter(h => h.hour >= 8 && h.hour <= 23)}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="hour_label"
                    stroke="#9CA3AF"
                    style={{ fontSize: '10px' }}
                    interval={1}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                    style={{ fontSize: '10px' }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value) => [formatCurrencyFull(value), 'Ingresos']}
                    labelFormatter={(label) => `Hora: ${label}`}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Ingresos"
                    fill="#F97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray">
              <p>No hay datos de horarios disponibles</p>
            </div>
          )}
        </div>

        {/* Ventas por Día de Semana */}
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-light mb-2 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            Ventas por Día de Semana
          </h2>
          <p className="text-xs text-gray mb-4">Ingresos acumulados por día (último mes)</p>
          {salesByWeekday?.data && salesByWeekday.data.some(d => d.revenue > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesByWeekday.data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="weekday_name"
                    stroke="#9CA3AF"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => value.substring(0, 3)}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                    style={{ fontSize: '10px' }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value) => [formatCurrencyFull(value), 'Ingresos']}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Ingresos"
                    fill="#06B6D4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray">
              <p>No hay datos de días disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Grafica de Acumulados */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-light flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Acumulado {viewMode === 'daily' ? 'del Mes' : 'por Periodo'}
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* Toggle Vista */}
            <div className="flex bg-dark/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-secondary/20 text-secondary'
                    : 'text-gray hover:text-light'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Este Mes
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-secondary/20 text-secondary'
                    : 'text-gray hover:text-light'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                Tendencia
              </button>
            </div>

            {/* Selector de meses (solo en vista mensual) */}
            {viewMode === 'monthly' && (
              <div className="flex gap-1">
                {[6, 12, 24].map((months) => (
                  <button
                    key={months}
                    onClick={() => setTrendMonths(months)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      trendMonths === months
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-gray/10 text-gray hover:text-light hover:bg-gray/20'
                    }`}
                  >
                    {months}M
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Totales */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray">Ingresos: </span>
            <span className="text-green-400 font-medium">{formatCurrency(totalAccumulatedRevenue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray">Gastos: </span>
            <span className="text-red-400 font-medium">{formatCurrency(totalAccumulatedExpenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray">Balance: </span>
            <span className={`font-medium ${totalAccumulatedRevenue - totalAccumulatedExpenses >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {formatCurrency(totalAccumulatedRevenue - totalAccumulatedExpenses)}
            </span>
          </div>
        </div>

        {accumulatedData && accumulatedData.length > 0 ? (
          <div className="h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={accumulatedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => formatCurrency(value)}
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value, name) => [formatCurrencyFull(value), name]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accumulated_revenue"
                  name="Ingresos Acumulados"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="accumulated_expenses"
                  name="Gastos Acumulados"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
                <Area
                  type="monotone"
                  dataKey="accumulated_profit"
                  name="Balance (Ingresos - Gastos)"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 md:h-80 flex items-center justify-center text-gray">
            <p>No hay datos disponibles para este periodo</p>
          </div>
        )}
      </div>

      {/* Grafica de Lineas - Ingresos vs Gastos */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary" />
          {viewMode === 'daily' ? 'Ingresos vs Gastos - Este Mes' : 'Tendencia Mensual'}
        </h2>

        {chartData && chartData.length > 0 ? (
          <div className="h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => formatCurrency(value)}
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value) => formatCurrencyFull(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Ingresos"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: viewMode === 'daily' ? 2 : 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="inventory_expenses"
                  name="Gastos Inventario"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: viewMode === 'daily' ? 2 : 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="operational_expenses"
                  name="Gastos Operativos"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: viewMode === 'daily' ? 2 : 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 md:h-80 flex items-center justify-center text-gray">
            <p>No hay datos disponibles para este periodo</p>
          </div>
        )}
      </div>

      {/* Fila de Pie Chart y Bar Chart Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart - Distribucion de Gastos */}
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            Distribucion de Gastos
          </h2>

          {expensesBreakdown?.categories && expensesBreakdown.categories.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesBreakdown.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="name"
                    >
                      {expensesBreakdown.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB',
                      }}
                      formatter={(value) => formatCurrencyFull(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda */}
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {expensesBreakdown.categories.map((category, index) => (
                  <div key={category.slug} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-light font-medium">{formatCurrency(category.total)}</span>
                      <span className="text-gray text-xs ml-2">({category.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray">
              <p>No hay gastos registrados este mes</p>
            </div>
          )}
        </div>

        {/* Bar Chart - Comparacion Mensual */}
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Comparacion Mensual
          </h2>

          {comparison ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value) => formatCurrencyFull(value)}
                  />
                  <Legend />
                  <Bar dataKey="Mes Anterior" fill="#6B7280" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Este Mes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray">
              <p>No hay datos para comparar</p>
            </div>
          )}

          {/* Cambios porcentuales */}
          {comparison && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-dark/50 rounded-lg">
                <p className="text-xs text-gray mb-1">Ingresos</p>
                <p className={`text-sm font-bold ${comparison.changes.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.changes.revenue >= 0 ? '+' : ''}{comparison.changes.revenue}%
                </p>
              </div>
              <div className="text-center p-2 bg-dark/50 rounded-lg">
                <p className="text-xs text-gray mb-1">Gastos</p>
                <p className={`text-sm font-bold ${comparison.changes.expenses <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.changes.expenses >= 0 ? '+' : ''}{comparison.changes.expenses}%
                </p>
              </div>
              <div className="text-center p-2 bg-dark/50 rounded-lg">
                <p className="text-xs text-gray mb-1">Ganancia</p>
                <p className={`text-sm font-bold ${comparison.changes.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.changes.profit >= 0 ? '+' : ''}{comparison.changes.profit}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart - Ganancia Neta */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Ganancia Neta {viewMode === 'daily' ? 'por Dia' : 'por Mes'}
        </h2>

        {profitData && profitData.length > 0 ? (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profitData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={viewMode === 'daily' ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => formatCurrency(value)}
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value) => formatCurrencyFull(value)}
                />
                <Bar
                  dataKey="profit"
                  name="Ganancia Neta"
                  radius={[4, 4, 0, 0]}
                >
                  {profitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profitColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 md:h-80 flex items-center justify-center text-gray">
            <p>No hay datos de ganancia disponibles</p>
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          <h3 className="font-bold text-light">Resumen Ejecutivo</h3>
        </div>
        <p className="text-gray text-sm">
          En {summary?.period?.current_month}, los ingresos son de{' '}
          <span className="text-secondary font-medium">{formatCurrencyFull(summary?.revenue?.value)}</span>
          {' '}con gastos totales de{' '}
          <span className="text-red-400 font-medium">{formatCurrencyFull(summary?.total_expenses?.value)}</span>,
          {' '}resultando en una ganancia neta de{' '}
          <span className={`font-medium ${summary?.net_profit?.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencyFull(summary?.net_profit?.value)}
          </span>
          {' '}({summary?.profit_margin?.value}% de margen).
        </p>
      </div>
    </div>
  );
};

export default FinancialDashboard;
