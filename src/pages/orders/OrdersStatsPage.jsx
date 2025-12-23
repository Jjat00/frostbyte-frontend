import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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

  // Obtener estadísticas
  const { data: stats, isLoading } = useQuery({
    queryKey: ['orders-stats', period],
    queryFn: () => ordersService.getStats(period),
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

  const periodLabels = {
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

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
          <p className="text-sm text-gray">Resumen de ventas - {periodLabels[period]}</p>
        </div>

        {/* Selector de periodo */}
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-secondary/20 text-secondary border border-secondary/30'
                  : 'bg-gray/10 text-gray hover:text-light border border-transparent'
              }`}
            >
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* Desglose por estado */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
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
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
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
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
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
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
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
          En {periodLabels[period].toLowerCase()}, se han registrado{' '}
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
    </div>
  );
};

export default OrdersStatsPage;

