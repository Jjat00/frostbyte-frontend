import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader2,
  Calendar,
  Users,
  Banknote,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Package,
  Armchair,
  Receipt,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';

// Configuración de métodos de pago
const paymentMethodConfig = {
  cash: { name: 'Efectivo', icon: Banknote, color: 'green' },
  card: { name: 'Tarjeta', icon: CreditCard, color: 'blue' },
  transfer: { name: 'Transferencia', icon: Building, color: 'purple' },
  nequi: { name: 'Nequi', icon: Smartphone, color: 'pink' },
  daviplata: { name: 'Daviplata', icon: Smartphone, color: 'red' },
  other: { name: 'Otro', icon: Wallet, color: 'gray' },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 text-secondary',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-500',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-500',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500',
  };

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
        </div>
        <div className={`p-2 md:p-3 rounded-lg bg-dark/50 flex-shrink-0 ml-2`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const OrdersStatsPage = () => {
  const [period, setPeriod] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Obtener estadísticas
  const { data: stats, isLoading } = useQuery({
    queryKey: ['orders-stats', period, customStartDate, customEndDate],
    queryFn: () => {
      if (useCustomRange && customStartDate && customEndDate) {
        return ordersService.getStats('custom', customStartDate, customEndDate);
      }
      return ordersService.getStats(period);
    },
  });

  // Obtener ingresos por día
  const { data: revenueByDay, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenue-by-day', period, customStartDate, customEndDate, useCustomRange],
    queryFn: () => {
      if (useCustomRange && customStartDate && customEndDate) {
        return ordersService.getRevenueByDay('custom', customStartDate, customEndDate);
      }
      return ordersService.getRevenueByDay(period);
    },
    enabled: !isLoading, // Esperar a que las stats principales carguen
  });

  // Obtener estadísticas por producto
  const { data: productStats, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['product-stats', period, customStartDate, customEndDate, useCustomRange],
    queryFn: () => {
      if (useCustomRange && customStartDate && customEndDate) {
        return ordersService.getProductStats('custom', customStartDate, customEndDate);
      }
      return ordersService.getProductStats(period);
    },
    enabled: !isLoading, // Esperar a que las stats principales carguen
  });

  // Obtener estadísticas de mesas
  const { data: tableStats, isLoading: isLoadingTables } = useQuery({
    queryKey: ['table-stats'],
    queryFn: () => ordersService.getTableStats(),
  });

  const formatCurrency = (value) => {
    if (!value) return '$0';
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

  const formatCurrencyTooltip = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    // Agregar T12:00:00 para evitar problemas de zona horaria
    // cuando JavaScript interpreta fechas YYYY-MM-DD como UTC
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  const periodLabels = {
    today: 'Hoy',
    yesterday: 'Ayer',
    week: 'Esta semana',
    month: 'Este mes',
    last_month: 'Mes anterior',
    year: 'Este año',
    custom: 'Rango personalizado',
  };

  const quickOptions = [
    { key: 'today', label: 'Hoy', icon: Calendar },
    { key: 'yesterday', label: 'Ayer', icon: Calendar },
    { key: 'week', label: 'Esta semana', icon: Calendar },
    { key: 'month', label: 'Este mes', icon: Calendar },
    { key: 'last_month', label: 'Mes anterior', icon: Calendar },
    { key: 'year', label: 'Este año', icon: Calendar },
  ];

  const handleQuickSelect = (option) => {
    setPeriod(option);
    setUseCustomRange(false);
    setCustomStartDate('');
    setCustomEndDate('');
    setShowDatePicker(false);
  };

  const handleCustomRange = () => {
    if (customStartDate && customEndDate) {
      setUseCustomRange(true);
      setPeriod('custom');
      setShowDatePicker(false);
    }
  };

  const getCurrentPeriodLabel = () => {
    if (useCustomRange && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      const end = new Date(customEndDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return periodLabels[period] || 'Hoy';
  };

  if (isLoading || isLoadingRevenue || isLoadingProducts || isLoadingTables) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Calcular ticket promedio
  const ticketPromedio = stats?.total_orders > 0
    ? parseFloat(stats.total_revenue) / stats.total_orders
    : 0;

  const totalActive =
    (stats?.by_status?.pending || 0) +
    (stats?.by_status?.preparing || 0) +
    (stats?.by_status?.ready || 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-light">Estadísticas</h1>
          <p className="text-sm text-gray">Resumen de ventas - {getCurrentPeriodLabel()}</p>
        </div>

        {/* Botón de selector de fecha */}
        <button
          onClick={() => setShowDatePicker(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-all text-sm font-medium"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Seleccionar período</span>
          <span className="sm:hidden">Fecha</span>
        </button>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          title="Total Pedidos"
          value={stats?.total_orders || 0}
          icon={ShoppingBag}
          color="secondary"
        />
        <StatCard
          title="Ingresos"
          value={formatCurrency(stats?.total_revenue)}
          subtitle={`${stats?.total_paid_items || 0} items pagados`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(ticketPromedio)}
          subtitle="Por pedido"
          icon={Receipt}
          color="primary"
        />
        <StatCard
          title="Pedidos Activos"
          value={totalActive}
          subtitle={`${stats?.by_status?.pending || 0} pendientes`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Entregados"
          value={stats?.by_status?.delivered || 0}
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Gráfica de Ingresos por Día */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Ingresos por Día
        </h2>
        {revenueByDay?.data && revenueByDay.data.length > 0 ? (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={revenueByDay.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tickFormatter={formatDate}
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => formatCurrency(value)}
                  style={{ fontSize: '12px' }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value) => formatCurrencyTooltip(value)}
                  labelFormatter={(label) => `Fecha: ${formatDate(label)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Ingresos"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 md:h-80 flex items-center justify-center text-gray">
            <p>No hay datos de ingresos para este período</p>
          </div>
        )}
      </div>

      {/* Gráficas de Productos */}
      {productStats?.data && productStats.data.length > 0 && (
        <>
          {/* Cantidad Vendida por Producto */}
          <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Cantidad Vendida por Producto
            </h2>
            <div className="h-96 md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productStats.data.slice(0, 15).map((item) => ({
                    ...item,
                    name: item.display_name.length > 30 
                      ? item.display_name.substring(0, 30) + '...' 
                      : item.display_name,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9CA3AF"
                    width={95}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value) => `${value} unidades`}
                  />
                  <Legend />
                  <Bar dataKey="quantity_sold" name="Cantidad Vendida" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ingresos por Producto */}
          <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Ingresos por Producto
            </h2>
            <div className="h-96 md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productStats.data.slice(0, 15).map((item) => ({
                    ...item,
                    name: item.display_name.length > 30 
                      ? item.display_name.substring(0, 30) + '...' 
                      : item.display_name,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    stroke="#9CA3AF"
                    tickFormatter={(value) => formatCurrency(value)}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9CA3AF"
                    width={95}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value) => formatCurrencyTooltip(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Ingresos" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Gráfica de Mesas Más Frecuentadas */}
      {tableStats?.tables && tableStats.tables.length > 0 && (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-purple-400" />
            Mesas Más Frecuentadas
          </h2>
          <p className="text-sm text-gray mb-4">
            Total de visitas registradas: <span className="text-light font-medium">{tableStats.total_visits}</span>
          </p>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tableStats.tables
                  .sort((a, b) => b.visit_count - a.visit_count)
                  .map((table) => ({
                    ...table,
                    name: table.table_name,
                  }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value) => [`${value} visitas`, 'Visitas']}
                  labelFormatter={(label) => `Mesa: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="visit_count"
                  name="Visitas"
                  fill="#A855F7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Desglose por estado */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary" />
          Desglose por Estado
        </h2>

        <div className="space-y-4">
          {/* Pendientes */}
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray">Pendiente</div>
            <div className="flex-1 bg-dark rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((stats?.by_status?.pending || 0) / (stats?.total_orders || 1)) * 100}%`,
                }}
                className="h-full bg-yellow-500"
              />
            </div>
            <div className="w-12 text-right font-bold text-yellow-400">
              {stats?.by_status?.pending || 0}
            </div>
          </div>

          {/* Preparando */}
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray">Preparando</div>
            <div className="flex-1 bg-dark rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((stats?.by_status?.preparing || 0) / (stats?.total_orders || 1)) * 100}%`,
                }}
                className="h-full bg-blue-500"
              />
            </div>
            <div className="w-12 text-right font-bold text-blue-400">
              {stats?.by_status?.preparing || 0}
            </div>
          </div>

          {/* Listos */}
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray">Listo</div>
            <div className="flex-1 bg-dark rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((stats?.by_status?.ready || 0) / (stats?.total_orders || 1)) * 100}%`,
                }}
                className="h-full bg-green-500"
              />
            </div>
            <div className="w-12 text-right font-bold text-green-400">
              {stats?.by_status?.ready || 0}
            </div>
          </div>

          {/* Entregados */}
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray">Entregado</div>
            <div className="flex-1 bg-dark rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((stats?.by_status?.delivered || 0) / (stats?.total_orders || 1)) * 100}%`,
                }}
                className="h-full bg-emerald-500"
              />
            </div>
            <div className="w-12 text-right font-bold text-emerald-400">
              {stats?.by_status?.delivered || 0}
            </div>
          </div>

          {/* Cancelados */}
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray">Cancelado</div>
            <div className="flex-1 bg-dark rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((stats?.by_status?.cancelled || 0) / (stats?.total_orders || 1)) * 100}%`,
                }}
                className="h-full bg-red-500"
              />
            </div>
            <div className="w-12 text-right font-bold text-red-400">
              {stats?.by_status?.cancelled || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" />
          Ingresos por Método de Pago
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats?.by_payment_method || {}).map(([key, data]) => {
            const config = paymentMethodConfig[key] || paymentMethodConfig.other;
            const Icon = config.icon;
            const total = parseFloat(data.total || 0);
            
            if (total === 0 && data.count === 0) return null;

            const colorClasses = {
              green: 'bg-green-500/10 border-green-500/30 text-green-400',
              blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
              purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
              pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
              red: 'bg-red-500/10 border-red-500/30 text-red-400',
              gray: 'bg-gray/10 border-gray/30 text-gray',
            };

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-xl p-4 ${colorClasses[config.color]}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-dark/50`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-light">{config.name}</p>
                    <p className="text-xs text-gray">{data.count} item{data.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(total)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Advertencia de pagos pendientes */}
        {parseFloat(stats?.unpaid_total || 0) > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-400">Pagos Pendientes</p>
              <p className="text-sm text-gray">
                Hay{' '}
                <span className="text-yellow-400 font-bold">
                  {stats?.total_unpaid_items || 0} items
                </span>{' '}
                sin pagar por un total de{' '}
                <span className="text-yellow-400 font-bold">
                  {formatCurrency(stats?.unpaid_total)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasa de completado */}
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
          <h3 className="text-sm text-gray mb-2">Tasa de Completado</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-green-400">
              {stats?.total_orders > 0
                ? Math.round(((stats?.by_status?.delivered || 0) / stats.total_orders) * 100)
                : 0}
              %
            </span>
            <span className="text-gray text-sm mb-1">
              {stats?.by_status?.delivered || 0} de {stats?.total_orders || 0} pedidos
            </span>
          </div>
        </div>

        {/* Tasa de cancelación */}
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 md:p-6">
          <h3 className="text-sm text-gray mb-2">Tasa de Cancelación</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-red-400">
              {stats?.total_orders > 0
                ? Math.round(((stats?.by_status?.cancelled || 0) / stats.total_orders) * 100)
                : 0}
              %
            </span>
            <span className="text-gray text-sm mb-1">
              {stats?.by_status?.cancelled || 0} pedidos cancelados
            </span>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          <h3 className="font-bold text-light">Resumen del Periodo</h3>
        </div>
        <p className="text-gray text-sm">
          En {getCurrentPeriodLabel().toLowerCase()}, se han registrado{' '}
          <span className="text-light font-medium">{stats?.total_orders || 0} pedidos</span> con
          ingresos totales de{' '}
          <span className="text-secondary font-medium">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(parseFloat(stats?.total_revenue || 0))}
          </span>{' '}
          en <span className="text-light font-medium">{stats?.total_paid_items || 0} items</span> pagados.
        </p>
      </div>

      {/* Modal de selector de fechas */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="backdrop-blur-xl bg-white/[0.06] border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-white/[0.1] flex items-center justify-between">
                <h3 className="text-xl font-bold text-light flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  Seleccionar Período
                </h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {/* Opciones rápidas */}
                <div>
                  <p className="text-sm text-gray mb-3 font-medium">Opciones rápidas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = !useCustomRange && period === option.key;
                      return (
                        <button
                          key={option.key}
                          onClick={() => handleQuickSelect(option.key)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                            isSelected
                              ? 'bg-secondary/20 text-secondary border-secondary/30'
                              : 'bg-white/[0.09] text-gray hover:text-light hover:bg-white/[0.08] border-transparent'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rango personalizado */}
                <div className="pt-4 border-t border-white/[0.1]">
                  <p className="text-sm text-gray mb-3 font-medium">Rango personalizado</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray mb-1.5 block">Fecha inicio</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={customEndDate || new Date().toISOString().split('T')[0]}
                        className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-2.5 text-light focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray mb-1.5 block">Fecha fin</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={customStartDate || undefined}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-2.5 text-light focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <button
                      onClick={handleCustomRange}
                      disabled={!customStartDate || !customEndDate || customStartDate > customEndDate}
                      className="w-full px-4 py-3 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Aplicar rango personalizado
                    </button>
                    {useCustomRange && customStartDate && customEndDate && (
                      <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                        <p className="text-xs text-gray mb-1">Rango activo:</p>
                        <p className="text-sm text-light font-medium">
                          {new Date(customStartDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} - {new Date(customEndDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersStatsPage;

