import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  User,
  Phone,
  MessageSquare,
  DollarSign,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  AlertCircle,
  Printer,
  Trash2,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    description: 'Esperando ser preparado',
    icon: Clock,
    color: 'yellow',
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
  },
  preparing: {
    label: 'Preparando',
    description: 'En preparación',
    icon: ChefHat,
    color: 'blue',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
  },
  ready: {
    label: 'Listo',
    description: 'Listo para entregar',
    icon: CheckCircle,
    color: 'green',
    bgClass: 'bg-green-500/10 border-green-500/30',
    textClass: 'text-green-400',
  },
  delivered: {
    label: 'Entregado',
    description: 'Pedido completado',
    icon: CheckCircle,
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-400',
  },
  cancelled: {
    label: 'Cancelado',
    description: 'Pedido cancelado',
    icon: XCircle,
    color: 'red',
    bgClass: 'bg-red-500/10 border-red-500/30',
    textClass: 'text-red-400',
  },
};

const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: Banknote },
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia', icon: Building },
  { id: 'nequi', label: 'Nequi', icon: Smartphone },
  { id: 'daviplata', label: 'Daviplata', icon: Smartphone },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Obtener detalle del pedido
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrder(id),
  });

  // Función para invalidar todas las queries relacionadas
  const invalidateAllOrderQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    queryClient.invalidateQueries({ queryKey: ['active-orders'] });
    queryClient.invalidateQueries({ queryKey: ['delivered-orders-today'] });
    queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
    queryClient.invalidateQueries({ queryKey: ['orders-history'] });
  };

  // Mutaciones
  const updateStatusMutation = useMutation({
    mutationFn: (status) => ordersService.updateStatus(id, status),
    onSuccess: () => {
      invalidateAllOrderQueries();
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (paymentMethod) => ordersService.markAsPaid(id, paymentMethod),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setShowPaymentModal(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersService.cancelOrder(id),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setShowCancelConfirm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ordersService.deleteOrder(id),
    onSuccess: () => {
      invalidateAllOrderQueries();
      navigate('/pedidos');
    },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-light font-medium mb-2">Pedido no encontrado</p>
        <button
          onClick={() => navigate('/pedidos')}
          className="px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
        >
          Volver a pedidos
        </button>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isActive = ['pending', 'preparing', 'ready'].includes(order.status);

  const nextStatus = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  };

  const nextStatusLabel = {
    pending: 'Marcar como Preparando',
    preparing: 'Marcar como Listo',
    ready: 'Marcar como Entregado',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pedidos')}
          className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-light">
            Pedido #{order.order_number?.slice(-6)}
          </h1>
          <p className="text-sm text-gray">{formatDateTime(order.created_at)}</p>
        </div>
      </div>

      {/* Estado actual */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-xl p-4 md:p-6 ${status.bgClass}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${status.bgClass}`}>
            <StatusIcon className={`w-8 h-8 ${status.textClass}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${status.textClass}`}>{status.label}</h2>
            <p className="text-gray text-sm">{status.description}</p>
          </div>
          {order.is_paid && (
            <div className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pagado
            </div>
          )}
        </div>
      </motion.div>

      {/* Información del cliente */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <h3 className="font-bold text-light mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-secondary" />
          Cliente
        </h3>
        <div className="space-y-2">
          <p className="text-light font-medium">{order.customer_name || 'Sin nombre'}</p>
          {order.customer_phone && (
            <p className="text-gray text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {order.customer_phone}
            </p>
          )}
          {order.customer_notes && (
            <div className="mt-3 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
              <p className="text-xs text-secondary font-medium mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Notas especiales
              </p>
              <p className="text-light text-sm">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items del pedido */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <h3 className="font-bold text-light mb-4">Productos ({order.items?.length || 0})</h3>
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between py-3 border-b border-gray/10 last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-secondary/20 text-secondary rounded-lg text-sm font-bold">
                    {item.quantity}
                  </span>
                  <span className="font-medium text-light">{item.product_name}</span>
                </div>
                <p className="text-sm text-gray ml-8">{item.variant_name}</p>
                {item.notes && (
                  <p className="text-xs text-secondary ml-8 mt-1">📝 {item.notes}</p>
                )}
              </div>
              <span className="text-light font-medium">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="mt-4 pt-4 border-t border-gray/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray">Subtotal</span>
            <span className="text-light">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray">Descuento</span>
              <span className="text-red-400">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray/20">
            <span className="text-light">Total</span>
            <span className="text-secondary">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Acciones para pedidos activos */}
      {isActive && (
        <div className="space-y-3">
          {/* Botón de siguiente estado */}
          {nextStatus[order.status] && (
            <button
              onClick={() => updateStatusMutation.mutate(nextStatus[order.status])}
              disabled={updateStatusMutation.isPending}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                order.status === 'pending'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : order.status === 'preparing'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gradient-to-r from-secondary to-primary text-dark'
              }`}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {order.status === 'pending' && <ChefHat className="w-5 h-5" />}
                  {order.status === 'preparing' && <CheckCircle className="w-5 h-5" />}
                  {order.status === 'ready' && <CheckCircle className="w-5 h-5" />}
                  {nextStatusLabel[order.status]}
                </>
              )}
            </button>
          )}

          {/* Botón de pago */}
          {!order.is_paid && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold transition-all hover:bg-green-500/30 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Registrar Pago
            </button>
          )}

          {/* Botón de cancelar */}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium transition-all hover:bg-red-500/20 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Cancelar Pedido
          </button>
        </div>
      )}

      {/* Botón de pago para pedidos entregados sin pagar */}
      {order.status === 'delivered' && !order.is_paid && (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium">Pago pendiente</p>
              <p className="text-sm text-gray">Este pedido ya fue entregado pero no se ha registrado el pago</p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Registrar Pago
          </button>
        </div>
      )}

      {/* Info de pago si está pagado */}
      {order.is_paid && order.payment_method && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-medium">Pagado</p>
            <p className="text-sm text-gray">
              Método: {paymentMethods.find(m => m.id === order.payment_method)?.label || order.payment_method}
            </p>
          </div>
        </div>
      )}

      {/* Botón de eliminar - disponible para todos los pedidos */}
      <div className="pt-4 border-t border-gray/10">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 bg-red-500/5 text-red-400/70 border border-red-500/10 rounded-xl font-medium transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar Pedido
        </button>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-light mb-4">Registrar Pago</h3>
            <p className="text-gray text-sm mb-4">
              Total a pagar: <span className="text-secondary font-bold">{formatCurrency(order.total)}</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => markPaidMutation.mutate(method.id)}
                  disabled={markPaidMutation.isPending}
                  className="flex flex-col items-center gap-2 p-4 bg-dark border border-gray/20 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                >
                  <method.icon className="w-6 h-6 text-gray" />
                  <span className="text-sm text-light font-medium">{method.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2 text-gray hover:text-light transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-light">¿Cancelar pedido?</h3>
                <p className="text-sm text-gray">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-gray/10 text-gray hover:text-light rounded-xl font-medium transition-colors"
              >
                No, mantener
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Sí, cancelar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-light">¿Eliminar pedido permanentemente?</h3>
                <p className="text-sm text-gray">El pedido #{order.order_number?.slice(-6)} será eliminado de forma permanente</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">
                ⚠️ Esta acción eliminará completamente el pedido y no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray/10 text-gray hover:text-light rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;

