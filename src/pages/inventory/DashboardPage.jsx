import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Clock,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';

const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 text-secondary',
    warning: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-500',
    danger: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-500',
    success: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
  };

  const CardContent = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 md:p-6 h-full active:scale-95`}
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
      {link && (
        <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray hover:text-light transition-colors">
          <span>Ver detalles</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </motion.div>
  );

  if (link) {
    return <Link to={link}>{CardContent}</Link>;
  }

  return CardContent;
};

const DashboardPage = () => {
  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryService.getStats(),
    staleTime: 30000,
  });

  // Obtener items con stock bajo
  const { data: lowStock, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryService.getLowStock(),
    staleTime: 30000,
  });

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyFull = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (statsLoading || lowStockLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-light">Dashboard</h1>
          <p className="text-sm text-gray">Resumen del inventario</p>
        </div>
        <Link
          to="/inventario/ordenes"
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Materiales"
          value={stats?.total_materials || 0}
          icon={Package}
          color="primary"
          link="/inventario/materiales"
        />
        <StatCard
          title="Stock Bajo"
          value={stats?.low_stock_count || 0}
          icon={AlertTriangle}
          color="warning"
          subtitle={`${stats?.zero_stock_count || 0} sin stock`}
          link="/inventario/stock-bajo"
        />
        <StatCard
          title="Sin Stock"
          value={stats?.zero_stock_count || 0}
          icon={XCircle}
          color="danger"
          link="/inventario/stock-bajo"
        />
        <StatCard
          title="Valor Inventario"
          value={formatCurrency(stats?.total_inventory_value || 0)}
          icon={DollarSign}
          color="success"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStock?.count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-light">Alerta de Stock</h2>
                <p className="text-xs md:text-sm text-gray">
                  {lowStock.count} materiales necesitan reabastecimiento
                </p>
              </div>
            </div>
            <Link
              to="/inventario/stock-bajo"
              className="px-4 py-2 bg-yellow-500/20 text-yellow-500 font-medium rounded-lg hover:bg-yellow-500/30 transition-colors text-sm text-center"
            >
              Ver todos
            </Link>
          </div>

          {/* Estimated cost */}
          <div className="bg-dark/30 rounded-lg p-3 md:p-4 mb-4">
            <p className="text-xs md:text-sm text-gray mb-1">Costo estimado de reabastecimiento</p>
            <p className="text-xl md:text-2xl font-bold text-light">
              {formatCurrencyFull(lowStock.estimated_restock_cost || 0)}
            </p>
          </div>

          {/* Quick list */}
          <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
            {lowStock.results?.slice(0, 5).map((item) => {
              const faltante = Math.max(0, item.minimum_stock - item.current_stock);
              const costoItem = faltante * item.cost_per_unit;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 md:p-3 bg-dark/30 rounded-lg gap-2 ${
                    item.has_pending_order ? 'border border-blue-500/30' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-light text-sm truncate">{item.name}</p>
                      {item.has_pending_order && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs flex-shrink-0">
                          <Clock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray">
                      Stock: {item.current_stock} / {item.minimum_stock} {item.unit_abbreviation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-yellow-400 font-medium">
                        Falta: {faltante.toFixed(0)}
                      </p>
                      <p className="text-xs text-green-400">
                        {formatCurrency(costoItem)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.stock_status === 'sin_stock'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {item.stock_status === 'sin_stock' ? 'Sin stock' : 'Bajo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {lowStock.count > 5 && (
            <p className="text-xs md:text-sm text-gray mt-3 text-center">
              Y {lowStock.count - 5} materiales más...
            </p>
          )}
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Link
          to="/inventario/materiales"
          className="group p-4 md:p-6 bg-dark-secondary border border-gray/20 rounded-xl hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          <Package className="w-7 h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
          <h3 className="font-bold text-light mb-1 text-sm md:text-base">Ver Materiales</h3>
          <p className="text-xs md:text-sm text-gray">Gestiona todos los materiales</p>
          <ArrowRight className="w-5 h-5 text-gray group-hover:text-primary mt-2 md:mt-3 transition-colors" />
        </Link>

        <Link
          to="/inventario/ordenes"
          className="group p-4 md:p-6 bg-dark-secondary border border-gray/20 rounded-xl hover:border-secondary/50 transition-all active:scale-[0.98]"
        >
          <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 text-secondary mb-2 md:mb-3" />
          <h3 className="font-bold text-light mb-1 text-sm md:text-base">Órdenes de Compra</h3>
          <p className="text-xs md:text-sm text-gray">Crea y gestiona órdenes</p>
          <ArrowRight className="w-5 h-5 text-gray group-hover:text-secondary mt-2 md:mt-3 transition-colors" />
        </Link>

        <Link
          to="/inventario/stock-bajo"
          className="group p-4 md:p-6 bg-dark-secondary border border-gray/20 rounded-xl hover:border-yellow-500/50 transition-all active:scale-[0.98] sm:col-span-2 lg:col-span-1"
        >
          <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-yellow-500 mb-2 md:mb-3" />
          <h3 className="font-bold text-light mb-1 text-sm md:text-base">Orden Automática</h3>
          <p className="text-xs md:text-sm text-gray">Genera orden desde stock bajo</p>
          <ArrowRight className="w-5 h-5 text-gray group-hover:text-yellow-500 mt-2 md:mt-3 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
