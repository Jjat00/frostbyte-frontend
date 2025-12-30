import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  CheckCircle,
  PlusCircle,
  Loader2,
  RefreshCw,
  User,
  Phone,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    icon: Clock,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  preparing: {
    label: 'Preparando',
    color: 'blue',
    icon: ChefHat,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  ready: {
    label: 'Listo',
    color: 'green',
    icon: CheckCircle,
    bgClass: 'bg-green-500/10 border-green-500/30',
    textClass: 'text-green-400',
    badgeClass: 'bg-green-500/20 text-green-400',
  },
  delivered: {
    label: 'Entregado',
    color: 'emerald',
    icon: CheckCircle,
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-400',
  },
};

const OrderCard = ({ order, onUpdateStatus }) => {
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const navigate = useNavigate();

  const nextStatus = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  };

  const nextStatusLabel = {
    pending: 'Preparar',
    preparing: 'Listo',
    ready: 'Entregar',
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${diffMinutes % 60}m`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`border rounded-xl p-4 ${status.bgClass} transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-light text-lg">#{order.order_number?.slice(-6)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(order.created_at)}
            </span>
            <span className={`font-medium ${
              order.status === 'pending' && getTimeSince(order.created_at).includes('min') 
                ? parseInt(getTimeSince(order.created_at)) > 10 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
                : ''
            }`}>
              {getTimeSince(order.created_at)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-light">{formatCurrency(order.total)}</p>
          {order.is_paid ? (
            <span className="text-xs text-green-400">Pagado</span>
          ) : (
            <span className="text-xs text-yellow-400">Pendiente</span>
          )}
        </div>
      </div>

      {/* Customer */}
      <div className="mb-3 pb-3 border-b border-gray/20">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray" />
          <span className="text-light font-medium">{order.customer_name || 'Cliente'}</span>
          {order.customer_phone && (
            <span className="text-gray flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {order.customer_phone}
            </span>
          )}
        </div>
        {order.table_number != null && order.table_number !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-gray">{order.table_number === 0 ? 'Barra' : 'Mesa'}:</span>
            <span className="w-6 h-6 flex items-center justify-center bg-secondary/20 text-secondary rounded text-xs font-bold">
              {order.table_number === 0 ? 'B' : order.table_number}
            </span>
          </div>
        )}
        {order.customer_notes && (
          <p className="text-xs text-secondary mt-1 bg-secondary/10 px-2 py-1 rounded">
            📝 {order.customer_notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4">
        {order.items?.slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex items-start justify-between text-sm gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-gray break-words block">
                <span className="text-light font-medium">{item.quantity}x</span>{' '}
                <span className="text-light">{item.product_name}</span>
                <span className="text-gray/70"> ({item.variant_name})</span>
              </span>
            </div>
            <span className="text-light flex-shrink-0">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        {order.items?.length > 4 && (
          <p className="text-xs text-gray">
            +{order.items.length - 4} productos más...
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/pedidos/${order.id}`)}
          className="flex-1 px-3 py-2.5 bg-gray/10 text-gray hover:text-light hover:bg-gray/20 rounded-lg text-sm font-medium transition-colors"
        >
          Ver detalle
        </button>
        {nextStatus[order.status] && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus[order.status])}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              order.status === 'pending'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : order.status === 'preparing'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-secondary to-primary text-dark hover:shadow-lg'
            }`}
          >
            {nextStatusLabel[order.status]}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const ActiveOrdersPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [deliveredTab, setDeliveredTab] = useState('unpaid'); // 'paid' o 'unpaid'
  const [deliveredDate, setDeliveredDate] = useState('today'); // 'today' o 'yesterday'

  // Obtener pedidos activos
  const { data: activeOrders, isLoading: loadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['active-orders'],
    queryFn: () => ordersService.getActiveOrders(),
    refetchInterval: 5000, // Refrescar cada 5 segundos
    staleTime: 2000,
  });

  // Obtener pedidos entregados (hoy o ayer)
  const { data: deliveredOrders, isLoading: loadingDelivered, refetch: refetchDelivered } = useQuery({
    queryKey: ['delivered-orders', deliveredDate],
    queryFn: () => ordersService.getOrders({ status: 'delivered', date: deliveredDate }),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const isLoading = loadingActive || loadingDelivered;
  const isError = false;

  // Combinar pedidos activos y entregados
  const allActiveOrders = activeOrders || [];
  const allDeliveredOrders = (deliveredOrders?.results || deliveredOrders || []).slice(0, 20); // Últimos 20 entregados
  
  // Separar pedidos entregados por estado de pago
  const deliveredPaid = allDeliveredOrders.filter(o => o.is_paid);
  const deliveredUnpaid = allDeliveredOrders.filter(o => !o.is_paid);
  
  // Todos los pedidos para mostrar
  const allOrders = filter === 'delivered' 
    ? (deliveredTab === 'paid' ? deliveredPaid : deliveredUnpaid)
    : filter === 'all' 
    ? allActiveOrders 
    : allActiveOrders.filter(o => o.status === filter);

  const refetch = () => {
    refetchActive();
    refetchDelivered();
  };

  // Mutación para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => ordersService.updateStatus(id, status),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas inmediatamente
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivered-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders-history'] });
    },
  });

  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Contar por estado
  const counts = {
    all: allActiveOrders?.length || 0,
    pending: allActiveOrders?.filter(o => o.status === 'pending').length || 0,
    preparing: allActiveOrders?.filter(o => o.status === 'preparing').length || 0,
    ready: allActiveOrders?.filter(o => o.status === 'ready').length || 0,
    delivered: allDeliveredOrders?.length || 0,
    deliveredPaid: deliveredPaid?.length || 0,
    deliveredUnpaid: deliveredUnpaid?.length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-light font-medium mb-2">Error al cargar pedidos</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-light">Pedidos Activos</h1>
          <p className="text-sm text-gray">{counts.all} pedidos en curso</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/pedidos/nuevo"
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Pedido</span>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { key: 'all', label: 'Activos' },
          { key: 'pending', label: 'Pendientes', color: 'yellow' },
          { key: 'preparing', label: 'Preparando', color: 'blue' },
          { key: 'ready', label: 'Listos', color: 'green' },
          { key: 'delivered', label: 'Entregados', color: 'emerald' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setFilter(item.key);
              if (item.key === 'delivered') {
                setDeliveredTab('unpaid'); // Reset a pendientes por pagar cuando cambias a entregados
                setDeliveredDate('today'); // Reset a hoy cuando cambias a entregados
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === item.key
                ? item.color === 'yellow'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : item.color === 'blue'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : item.color === 'green'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : item.color === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-secondary/20 text-secondary border border-secondary/30'
                : 'bg-gray/10 text-gray hover:text-light border border-transparent'
            }`}
          >
            {item.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              filter === item.key ? 'bg-dark/30' : 'bg-gray/20'
            }`}>
              {counts[item.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Pestañas para pedidos entregados */}
      {filter === 'delivered' && (
        <>
          <div className="flex gap-2 border-b border-gray/20 pb-2">
            <button
              onClick={() => setDeliveredTab('paid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                deliveredTab === 'paid'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray/10 text-gray hover:text-light border border-transparent'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Pagados
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                deliveredTab === 'paid' ? 'bg-dark/30' : 'bg-gray/20'
              }`}>
                {counts.deliveredPaid}
              </span>
            </button>
            <button
              onClick={() => setDeliveredTab('unpaid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                deliveredTab === 'unpaid'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray/10 text-gray hover:text-light border border-transparent'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Pendientes por pagar
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                deliveredTab === 'unpaid' ? 'bg-dark/30' : 'bg-gray/20'
              }`}>
                {counts.deliveredUnpaid}
              </span>
            </button>
          </div>

          {/* Selector de fecha para pedidos entregados */}
          <div className="flex items-center justify-center gap-3 py-3 bg-dark-secondary/50 rounded-lg border border-gray/20">
            <button
              onClick={() => setDeliveredDate('yesterday')}
              disabled={deliveredDate === 'yesterday'}
              className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ayer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-dark rounded-lg border border-gray/20">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-light">
                {deliveredDate === 'today' 
                  ? 'Hoy' 
                  : 'Ayer'}
              </span>
            </div>
            <button
              onClick={() => setDeliveredDate('today')}
              disabled={deliveredDate === 'today'}
              className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hoy"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Grid de pedidos */}
      {allOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          {filter === 'delivered' ? (
            deliveredTab === 'paid' ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                <p className="text-light font-medium mb-2">
                  No hay pedidos entregados y pagados {deliveredDate === 'today' ? 'hoy' : 'ayer'}
                </p>
                <p className="text-gray text-sm mb-4">
                  Los pedidos entregados y pagados {deliveredDate === 'today' ? 'de hoy' : 'de ayer'} aparecerán aquí
                </p>
              </>
            ) : (
              <>
                <DollarSign className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                <p className="text-light font-medium mb-2">
                  No hay pedidos entregados pendientes por pagar {deliveredDate === 'today' ? 'hoy' : 'ayer'}
                </p>
                <p className="text-gray text-sm mb-4">
                  Los pedidos entregados que aún no están pagados {deliveredDate === 'today' ? 'de hoy' : 'de ayer'} aparecerán aquí
                </p>
              </>
            )
          ) : (
            <>
              <Clock className="w-16 h-16 text-gray/50 mx-auto mb-4" />
              <p className="text-light font-medium mb-2">No hay pedidos activos</p>
              <p className="text-gray text-sm mb-4">
                {filter !== 'all' 
                  ? 'No hay pedidos con este estado' 
                  : 'Los pedidos aparecerán aquí'}
              </p>
              <Link
                to="/pedidos/nuevo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-xl hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Crear Pedido
              </Link>
            </>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {allOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ActiveOrdersPage;

