import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Filter,
  User,
  DollarSign,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'yellow', icon: Clock },
  preparing: { label: 'Preparando', color: 'blue', icon: Clock },
  ready: { label: 'Listo', color: 'green', icon: CheckCircle },
  delivered: { label: 'Entregado', color: 'emerald', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'red', icon: XCircle },
};

const OrdersHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('');

  // Obtener pedidos
  const { data, isLoading } = useQuery({
    queryKey: ['orders-history', dateFilter, statusFilter],
    queryFn: () =>
      ordersService.getOrders({
        date: dateFilter,
        status: statusFilter || undefined,
      }),
  });

  const orders = data?.results || data || [];

  // Filtrar por búsqueda
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(query) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone?.includes(query)
    );
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const colorClasses = {
      yellow: 'bg-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      emerald: 'bg-emerald-500/20 text-emerald-400',
      red: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-light">Historial de Pedidos</h1>
        <p className="text-sm text-gray">Revisa todos los pedidos realizados</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            placeholder="Buscar por # pedido, nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-secondary border border-gray/20 rounded-xl text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
          />
        </div>

        {/* Filtro por fecha */}
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-dark-secondary border border-gray/20 rounded-xl text-light focus:border-secondary/50 focus:outline-none"
          >
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-dark-secondary border border-gray/20 rounded-xl text-light focus:border-secondary/50 focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="preparing">Preparando</option>
            <option value="ready">Listo</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de pedidos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray/30 mx-auto mb-4" />
          <p className="text-light font-medium mb-2">No hay pedidos</p>
          <p className="text-gray text-sm">
            {searchQuery
              ? 'No se encontraron resultados para tu búsqueda'
              : 'No hay pedidos en el periodo seleccionado'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to={`/pedidos/${order.id}`}
                className="block bg-dark-secondary border border-gray/20 rounded-xl p-4 hover:border-gray/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-light">
                        #{order.order_number?.slice(-6)}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.is_paid ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                          Pagado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Sin pagar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {order.customer_name || 'Cliente'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(order.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      {order.items_count > 0 && (
                        <p className="text-xs text-gray">
                          {order.items_count} producto{order.items_count > 1 ? 's' : ''}
                        </p>
                      )}
                      {order.table_number != null && order.table_number !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray">{order.table_number === 0 ? 'Barra' : 'Mesa'}:</span>
                          <span className="w-5 h-5 flex items-center justify-center bg-secondary/20 text-secondary rounded text-xs font-bold">
                            {order.table_number === 0 ? 'B' : order.table_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-light">{formatCurrency(order.total)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray group-hover:text-secondary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {filteredOrders.length > 0 && (
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado
              {filteredOrders.length !== 1 ? 's' : ''}
            </span>
            <span className="text-light font-medium">
              Total:{' '}
              {formatCurrency(
                filteredOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistoryPage;

