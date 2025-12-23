import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  Trash2,
  Plus,
  Search,
  Minus,
  Check,
  Package,
  PackageCheck,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';

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
  
  // Estados
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedItemForPayment, setSelectedItemForPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Obtener detalle del pedido
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrder(id),
  });

  // Obtener productos para añadir
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
    enabled: showAddProductModal,
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

  const markItemPaidMutation = useMutation({
    mutationFn: ({ itemId, paymentMethod }) => ordersService.markItemAsPaid(itemId, paymentMethod),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setSelectedItemForPayment(null);
    },
  });

  const changePaymentMethodMutation = useMutation({
    mutationFn: ({ itemId, paymentMethod }) => ordersService.changeItemPaymentMethod(itemId, paymentMethod),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setSelectedItemForPayment(null);
    },
  });

  const unmarkItemPaidMutation = useMutation({
    mutationFn: (itemId) => ordersService.unmarkItemAsPaid(itemId),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setSelectedItemForPayment(null);
    },
  });

  const markItemDeliveredMutation = useMutation({
    mutationFn: (itemId) => ordersService.markItemAsDelivered(itemId),
    onSuccess: () => {
      invalidateAllOrderQueries();
    },
  });

  const unmarkItemDeliveredMutation = useMutation({
    mutationFn: (itemId) => ordersService.unmarkItemAsDelivered(itemId),
    onSuccess: () => {
      invalidateAllOrderQueries();
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

  const addItemMutation = useMutation({
    mutationFn: (itemData) => ordersService.addItemToOrder(id, itemData),
    onSuccess: () => {
      invalidateAllOrderQueries();
      setShowAddProductModal(false);
      setSearchQuery('');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => ordersService.deleteItem(itemId),
    onSuccess: () => {
      invalidateAllOrderQueries();
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
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
  const canAddItems = order.status !== 'cancelled';

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

  // Filtrar productos para búsqueda
  const filteredProducts = productsData?.results?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddProduct = (variant) => {
    addItemMutation.mutate({
      product_variant_id: variant.id,
      quantity: 1,
      notes: '',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-6">
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

      {/* Resumen de pagos y entregas */}
      {order.items?.length > 0 && (
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-xs text-gray mb-1">Pagado</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(order.paid_total)}</p>
              <p className="text-xs text-gray">{order.paid_items_count || 0} items</p>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-gray mb-1">Por Pagar</p>
              <p className="text-lg font-bold text-yellow-400">{formatCurrency(order.pending_total)}</p>
              <p className="text-xs text-gray">{order.unpaid_items_count || 0} items</p>
            </div>
            <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <p className="text-xs text-gray mb-1">Entregados</p>
              <p className="text-lg font-bold text-emerald-400">{order.delivered_items_count || 0}</p>
              <p className="text-xs text-gray">items</p>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-gray mb-1">Por Entregar</p>
              <p className="text-lg font-bold text-blue-400">{order.undelivered_items_count || 0}</p>
              <p className="text-xs text-gray">items</p>
            </div>
          </div>
        </div>
      )}

      {/* Items del pedido con pago individual */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-light">Productos ({order.items?.length || 0})</h3>
          {canAddItems && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-3 border transition-all ${
                item.is_delivered && item.is_paid
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : item.is_paid
                  ? 'bg-green-500/5 border-green-500/20'
                  : item.is_delivered
                  ? 'bg-blue-500/5 border-blue-500/20'
                  : 'bg-dark border-gray/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-secondary/20 text-secondary rounded-lg text-sm font-bold">
                      {item.quantity}
                    </span>
                    <span className="font-medium text-light truncate">{item.product_name}</span>
                  </div>
                  <p className="text-sm text-gray ml-8">{item.variant_name}</p>
                  {item.notes && (
                    <p className="text-xs text-secondary ml-8 mt-1">📝 {item.notes}</p>
                  )}
                  <div className="flex flex-wrap gap-2 ml-8 mt-1">
                    {item.is_paid && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {paymentMethods.find(m => m.id === item.payment_method)?.label || 'Pagado'}
                      </span>
                    )}
                    {item.is_delivered && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <PackageCheck className="w-3 h-3" />
                        Entregado
                      </span>
                    )}
                  </div>
                </div>

                {/* Precio y acciones */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-light font-medium">{formatCurrency(item.subtotal)}</span>
                  
                  <div className="flex flex-wrap gap-1 justify-end">
                    {/* Botón de entrega */}
                    {!item.is_delivered ? (
                      <button
                        onClick={() => markItemDeliveredMutation.mutate(item.id)}
                        disabled={markItemDeliveredMutation.isPending}
                        className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                      >
                        <Package className="w-3 h-3" />
                        Entregar
                      </button>
                    ) : (
                      <button
                        onClick={() => unmarkItemDeliveredMutation.mutate(item.id)}
                        disabled={unmarkItemDeliveredMutation.isPending}
                        className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                        title="Click para desmarcar entrega"
                      >
                        <PackageCheck className="w-3 h-3" />
                      </button>
                    )}

                    {/* Botón de pago */}
                    {!item.is_paid ? (
                      <button
                        onClick={() => setSelectedItemForPayment(item)}
                        className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1"
                      >
                        <DollarSign className="w-3 h-3" />
                        Pagar
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedItemForPayment(item)}
                        className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1"
                        title="Click para cambiar método de pago"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                    
                    {canAddItems && (
                      <button
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        disabled={deleteItemMutation.isPending}
                        className="p-1 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

          {/* Botón de pago completo */}
          {!order.is_paid && order.unpaid_items_count > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold transition-all hover:bg-green-500/30 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Pagar Todo ({formatCurrency(order.pending_total)})
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
      {order.status === 'delivered' && !order.is_paid && order.unpaid_items_count > 0 && (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium">Pago pendiente</p>
              <p className="text-sm text-gray">
                {order.unpaid_items_count} items sin pagar ({formatCurrency(order.pending_total)})
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Pagar Todo ({formatCurrency(order.pending_total)})
          </button>
        </div>
      )}

      {/* Info de pago si está pagado completamente */}
      {order.is_paid && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-medium">Pagado completamente</p>
            <p className="text-sm text-gray">Total: {formatCurrency(order.total)}</p>
          </div>
        </div>
      )}

      {/* Botón de añadir productos para pedidos entregados */}
      {order.status === 'delivered' && (
        <button
          onClick={() => setShowAddProductModal(true)}
          className="w-full py-3 bg-secondary/20 text-secondary border border-secondary/30 rounded-xl font-medium transition-all hover:bg-secondary/30 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Añadir Más Productos
        </button>
      )}

      {/* Botón de eliminar */}
      <div className="pt-4 border-t border-gray/10">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 bg-red-500/5 text-red-400/70 border border-red-500/10 rounded-xl font-medium transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar Pedido
        </button>
      </div>

      {/* Modal de pago para item individual */}
      <AnimatePresence>
        {selectedItemForPayment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-secondary border border-gray/20 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-light mb-2">
                {selectedItemForPayment.is_paid ? 'Cambiar Método de Pago' : 'Pagar Item'}
              </h3>
              <div className="mb-4 p-3 bg-dark rounded-lg">
                <p className="text-light font-medium">{selectedItemForPayment.product_name}</p>
                <p className="text-sm text-gray">{selectedItemForPayment.variant_name}</p>
                <p className="text-secondary font-bold mt-1">{formatCurrency(selectedItemForPayment.subtotal)}</p>
                {selectedItemForPayment.is_paid && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Pagado con: {paymentMethods.find(m => m.id === selectedItemForPayment.payment_method)?.label || 'Sin especificar'}
                  </p>
                )}
              </div>
              <p className="text-gray text-sm mb-4">
                {selectedItemForPayment.is_paid ? 'Selecciona el nuevo método de pago:' : 'Selecciona el método de pago:'}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => {
                  const isCurrentMethod = selectedItemForPayment.payment_method === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        if (selectedItemForPayment.is_paid) {
                          changePaymentMethodMutation.mutate({ 
                            itemId: selectedItemForPayment.id, 
                            paymentMethod: method.id 
                          });
                        } else {
                          markItemPaidMutation.mutate({ 
                            itemId: selectedItemForPayment.id, 
                            paymentMethod: method.id 
                          });
                        }
                      }}
                      disabled={markItemPaidMutation.isPending || changePaymentMethodMutation.isPending}
                      className={`flex flex-col items-center gap-2 p-4 bg-dark border rounded-xl transition-all ${
                        isCurrentMethod 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-gray/20 hover:border-green-500/50 hover:bg-green-500/5'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 ${isCurrentMethod ? 'text-green-400' : 'text-gray'}`} />
                      <span className={`text-sm font-medium ${isCurrentMethod ? 'text-green-400' : 'text-light'}`}>
                        {method.label}
                      </span>
                      {isCurrentMethod && (
                        <span className="text-xs text-green-400">Actual</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Botón para deshacer pago */}
              {selectedItemForPayment.is_paid && (
                <button
                  onClick={() => unmarkItemPaidMutation.mutate(selectedItemForPayment.id)}
                  disabled={unmarkItemPaidMutation.isPending}
                  className="w-full py-3 mb-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium transition-all hover:bg-red-500/20 flex items-center justify-center gap-2"
                >
                  {unmarkItemPaidMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Deshacer Pago
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setSelectedItemForPayment(null)}
                className="w-full py-2 text-gray hover:text-light transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de pago completo */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-light mb-4">Pagar Todo</h3>
            <p className="text-gray text-sm mb-4">
              Total pendiente: <span className="text-secondary font-bold">{formatCurrency(order.pending_total)}</span>
            </p>
            <p className="text-xs text-gray mb-4">
              Se marcarán {order.unpaid_items_count} items como pagados con el mismo método
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

      {/* Modal para añadir productos */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-dark-secondary border border-gray/20 rounded-t-2xl md:rounded-xl w-full md:max-w-lg max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-light">Añadir Producto</h3>
                  <button
                    onClick={() => {
                      setShowAddProductModal(false);
                      setSearchQuery('');
                    }}
                    className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-gray py-8">No se encontraron productos</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="bg-dark rounded-xl p-3 border border-gray/10">
                      <p className="font-medium text-light mb-2">{product.name}</p>
                      <p className="text-xs text-gray mb-2">{product.category_name}</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants?.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleAddProduct(variant)}
                            disabled={addItemMutation.isPending}
                            className="flex items-center gap-2 px-3 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-all text-sm"
                          >
                            {addItemMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                {variant.name} - {formatCurrency(variant.price)}
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
