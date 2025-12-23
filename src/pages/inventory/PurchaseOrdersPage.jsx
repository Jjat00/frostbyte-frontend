import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Check,
  X,
  Loader2,
  Package,
  ChevronDown,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';

const PurchaseOrdersPage = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    quantity_purchased: '',
    actual_unit_price: '',
    supplier: '',
  });
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [newOrderNotes, setNewOrderNotes] = useState('');

  // Obtener órdenes
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => inventoryService.getPurchaseOrders(),
  });

  // Obtener materiales para crear orden
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => inventoryService.getMaterials(),
  });

  const materials = materialsData?.results || materialsData || [];

  // Generar orden desde stock bajo
  const generateMutation = useMutation({
    mutationFn: () => inventoryService.generateFromLowStock(),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
    },
  });

  // Crear orden manual
  const createOrderMutation = useMutation({
    mutationFn: (data) => inventoryService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      setCreateModal(false);
      setNewOrderItems([]);
      setNewOrderNotes('');
    },
  });

  // Marcar orden como comprada
  const markPurchasedMutation = useMutation({
    mutationFn: (id) => inventoryService.markOrderPurchased(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['low-stock']);
      queryClient.invalidateQueries(['inventory-stats']);
    },
  });

  // Cancelar orden
  const cancelMutation = useMutation({
    mutationFn: (id) => inventoryService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
    },
  });

  // Eliminar orden
  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      setDeleteModal(null);
    },
  });

  // Marcar item individual como comprado
  const purchaseItemMutation = useMutation({
    mutationFn: ({ orderId, itemId, data }) =>
      inventoryService.purchaseItem(orderId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['low-stock']);
      setPurchaseModal(null);
      setPurchaseData({ quantity_purchased: '', actual_unit_price: '', supplier: '' });
    },
  });

  const orders = data?.results || data || [];

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      purchased: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      pending: 'Pendiente',
      purchased: 'Comprado',
      cancelled: 'Cancelado',
    };
    const icons = {
      pending: Clock,
      purchased: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{labels[status]}</span>
      </span>
    );
  };

  const handlePurchaseItem = () => {
    if (!purchaseModal) return;
    purchaseItemMutation.mutate({
      orderId: purchaseModal.orderId,
      itemId: purchaseModal.itemId,
      data: purchaseData,
    });
  };

  const addItemToNewOrder = () => {
    setNewOrderItems([...newOrderItems, { raw_material: '', quantity_needed: '', estimated_unit_price: '' }]);
  };

  const updateNewOrderItem = (index, field, value) => {
    const updated = [...newOrderItems];
    updated[index][field] = value;
    
    // Auto-fill price when selecting material
    if (field === 'raw_material' && value) {
      const material = materials.find(m => m.id === parseInt(value));
      if (material) {
        updated[index].estimated_unit_price = material.cost_per_unit;
      }
    }
    
    setNewOrderItems(updated);
  };

  const removeNewOrderItem = (index) => {
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = () => {
    const validItems = newOrderItems.filter(item => item.raw_material && item.quantity_needed);
    if (validItems.length === 0) return;

    createOrderMutation.mutate({
      notes: newOrderNotes,
      items: validItems.map(item => ({
        raw_material: parseInt(item.raw_material),
        quantity_needed: parseFloat(item.quantity_needed),
        estimated_unit_price: parseFloat(item.estimated_unit_price) || 0,
      })),
    });
  };

  const getOrderTotal = (order) => {
    if (order.status === 'purchased') {
      // Calcular el total real desde los items
      const total = order.items?.reduce((sum, item) => {
        if (item.is_purchased && item.actual_subtotal) {
          return sum + parseFloat(item.actual_subtotal);
        }
        return sum + parseFloat(item.estimated_subtotal || 0);
      }, 0) || parseFloat(order.actual_total) || 0;
      return total;
    }
    return parseFloat(order.estimated_total) || 0;
  };

  // Order Item Card for Mobile
  const OrderItemCard = ({ item, order }) => (
    <div className="bg-dark/50 rounded-lg p-3 mb-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Package className="w-4 h-4 text-gray flex-shrink-0" />
          <span className="text-light text-sm font-medium truncate">{item.raw_material_name}</span>
        </div>
        {item.is_purchased ? (
          <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0">
            <CheckCircle className="w-3 h-3" />
            Comprado
          </span>
        ) : (
          <span className="text-xs text-yellow-400 flex-shrink-0">Pendiente</span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div>
          <p className="text-gray">Cantidad</p>
          <p className="text-light font-medium">
            {item.is_purchased ? item.quantity_purchased : item.quantity_needed} {item.unit_abbreviation}
          </p>
        </div>
        <div>
          <p className="text-gray">Precio</p>
          <p className="text-light font-medium">
            {formatCurrency(item.is_purchased ? item.actual_unit_price : item.estimated_unit_price)}
          </p>
        </div>
        <div>
          <p className="text-gray">Subtotal</p>
          <p className="text-light font-medium">
            {formatCurrency(item.is_purchased ? item.actual_subtotal : item.estimated_subtotal)}
          </p>
        </div>
      </div>

      {order.status === 'pending' && !item.is_purchased && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPurchaseModal({
              orderId: order.id,
              itemId: item.id,
              item,
            });
            setPurchaseData({
              quantity_purchased: item.quantity_needed,
              actual_unit_price: item.estimated_unit_price,
              supplier: item.supplier || '',
            });
          }}
          className="w-full mt-2 text-xs py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
        >
          Registrar compra
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-light flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-secondary" />
              Órdenes
            </h1>
            <p className="text-sm text-gray">Compras de materia prima</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setNewOrderItems([{ raw_material: '', quantity_needed: '', estimated_unit_price: '' }]);
                setCreateModal(true);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-secondary/20 text-secondary font-medium rounded-lg hover:bg-secondary/30 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Manual</span>
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Stock Bajo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-8 md:p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray/50 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-bold text-light mb-2">Sin órdenes</h3>
          <p className="text-gray text-sm mb-4">No hay órdenes de compra registradas</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setNewOrderItems([{ raw_material: '', quantity_needed: '', estimated_unit_price: '' }]);
                setCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary/20 text-secondary font-medium rounded-lg hover:bg-secondary/30 transition-colors text-sm"
            >
              <Plus className="w-5 h-5" />
              Crear orden manual
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary font-medium rounded-lg hover:bg-primary/30 transition-colors text-sm"
            >
              <Plus className="w-5 h-5" />
              Desde stock bajo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-secondary border border-gray/20 rounded-xl overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="p-3 md:p-4 cursor-pointer hover:bg-gray/5 transition-colors"
                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-light text-sm md:text-base truncate">{order.order_number}</p>
                      <p className="text-xs md:text-sm text-gray">{formatDate(order.created_at)} • {order.items_count} items</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray">
                        {order.status === 'purchased' ? 'Total' : 'Estimado'}
                      </p>
                      <p className="font-bold text-light text-sm">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                    <ChevronDown
                      className={`w-5 h-5 text-gray transition-transform ${
                        selectedOrder === order.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                
                {/* Mobile total */}
                <div className="sm:hidden mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray">
                    {order.status === 'purchased' ? 'Total' : 'Estimado'}
                  </span>
                  <span className="font-bold text-light">
                    {formatCurrency(getOrderTotal(order))}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <AnimatePresence>
                {selectedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 md:p-4 pt-0 border-t border-gray/10">
                      {/* Mobile: Item cards */}
                      <div className="md:hidden mt-3 space-y-2">
                        {order.items?.map((item) => (
                          <OrderItemCard key={item.id} item={item} order={order} />
                        ))}
                      </div>

                      {/* Desktop: Items table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full mb-4">
                          <thead>
                            <tr className="text-left text-sm text-gray">
                              <th className="py-2">Material</th>
                              <th className="py-2 text-right">Cantidad</th>
                              <th className="py-2 text-right">Precio</th>
                              <th className="py-2 text-right">Subtotal</th>
                              <th className="py-2 text-center">Estado</th>
                              {order.status === 'pending' && (
                                <th className="py-2 text-right">Acción</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item) => (
                              <tr key={item.id} className="border-t border-gray/10">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray" />
                                    <span className="text-light">{item.raw_material_name}</span>
                                    <span className="text-xs text-gray">({item.unit_abbreviation})</span>
                                  </div>
                                </td>
                                <td className="py-3 text-right text-light">
                                  {item.is_purchased
                                    ? item.quantity_purchased
                                    : item.quantity_needed}
                                </td>
                                <td className="py-3 text-right text-gray">
                                  {formatCurrency(
                                    item.is_purchased
                                      ? item.actual_unit_price
                                      : item.estimated_unit_price
                                  )}
                                </td>
                                <td className="py-3 text-right text-light">
                                  {formatCurrency(
                                    item.is_purchased
                                      ? item.actual_subtotal
                                      : item.estimated_subtotal
                                  )}
                                </td>
                                <td className="py-3 text-center">
                                  {item.is_purchased ? (
                                    <span className="text-xs text-green-400">✓ Comprado</span>
                                  ) : (
                                    <span className="text-xs text-yellow-400">Pendiente</span>
                                  )}
                                </td>
                                {order.status === 'pending' && (
                                  <td className="py-3 text-right">
                                    {!item.is_purchased && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPurchaseModal({
                                            orderId: order.id,
                                            itemId: item.id,
                                            item,
                                          });
                                          setPurchaseData({
                                            quantity_purchased: item.quantity_needed,
                                            actual_unit_price: item.estimated_unit_price,
                                            supplier: item.supplier || '',
                                          });
                                        }}
                                        className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                                      >
                                        Registrar
                                      </button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-3 md:pt-4 border-t border-gray/10">
                        <button
                          onClick={() => setDeleteModal(order)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                        
                        {order.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => cancelMutation.mutate(order.id)}
                              disabled={cancelMutation.isPending}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray/30 text-gray hover:text-light rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => markPurchasedMutation.mutate(order.id)}
                              disabled={markPurchasedMutation.isPending}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              {markPurchasedMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">Marcar todo comprado</span>
                              <span className="sm:hidden">Todo comprado</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      <AnimatePresence>
        {createModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-secondary border-t md:border border-gray/20 rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light flex items-center gap-2">
                  <Plus className="w-5 h-5 text-secondary" />
                  Nueva Orden de Compra
                </h3>
                <button
                  onClick={() => setCreateModal(false)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray mb-1.5 block">Notas (opcional)</label>
                  <input
                    type="text"
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    placeholder="Ej: Compra semanal"
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray">Items a comprar</label>
                    <button
                      onClick={addItemToNewOrder}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                    >
                      + Agregar item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newOrderItems.map((item, index) => (
                      <div key={index} className="bg-dark/50 rounded-lg p-3">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12 sm:col-span-5">
                            <select
                              value={item.raw_material}
                              onChange={(e) => updateNewOrderItem(index, 'raw_material', e.target.value)}
                              className="w-full bg-dark border border-gray/30 rounded-lg px-3 py-2.5 text-light focus:outline-none focus:border-primary text-sm"
                            >
                              <option value="">Seleccionar material...</option>
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.unit_abbreviation})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-5 sm:col-span-3">
                            <input
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Cantidad"
                              value={item.quantity_needed}
                              onChange={(e) => updateNewOrderItem(index, 'quantity_needed', e.target.value)}
                              className="w-full bg-dark border border-gray/30 rounded-lg px-3 py-2.5 text-light focus:outline-none focus:border-primary text-sm"
                            />
                          </div>
                          <div className="col-span-5 sm:col-span-3">
                            <input
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Precio"
                              value={item.estimated_unit_price}
                              onChange={(e) => updateNewOrderItem(index, 'estimated_unit_price', e.target.value)}
                              className="w-full bg-dark border border-gray/30 rounded-lg px-3 py-2.5 text-light focus:outline-none focus:border-primary text-sm"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                            <button
                              onClick={() => removeNewOrderItem(index)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {item.raw_material && item.quantity_needed && item.estimated_unit_price && (
                          <p className="text-xs text-gray mt-2 text-right">
                            Subtotal: {formatCurrency(parseFloat(item.quantity_needed) * parseFloat(item.estimated_unit_price))}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {newOrderItems.some(i => i.raw_material && i.quantity_needed) && (
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-gray">Total estimado</p>
                    <p className="text-2xl font-bold text-light">
                      {formatCurrency(
                        newOrderItems.reduce((sum, item) => {
                          if (item.quantity_needed && item.estimated_unit_price) {
                            return sum + parseFloat(item.quantity_needed) * parseFloat(item.estimated_unit_price);
                          }
                          return sum;
                        }, 0)
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={createOrderMutation.isPending || !newOrderItems.some(i => i.raw_material && i.quantity_needed)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Crear Orden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Item Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setPurchaseModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-secondary border-t md:border border-gray/20 rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light">Registrar compra</h3>
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-dark/50 rounded-lg">
                <p className="font-bold text-light">{purchaseModal.item.raw_material_name}</p>
                <p className="text-sm text-gray">{purchaseModal.item.unit_abbreviation}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray mb-1.5 block">Cantidad comprada</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={purchaseData.quantity_purchased}
                    onChange={(e) =>
                      setPurchaseData({ ...purchaseData, quantity_purchased: e.target.value })
                    }
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Precio unitario real (COP)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={purchaseData.actual_unit_price}
                    onChange={(e) =>
                      setPurchaseData({ ...purchaseData, actual_unit_price: e.target.value })
                    }
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Proveedor</label>
                  <input
                    type="text"
                    value={purchaseData.supplier}
                    onChange={(e) =>
                      setPurchaseData({ ...purchaseData, supplier: e.target.value })
                    }
                    placeholder="Nombre del proveedor"
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <p className="text-sm text-gray">Subtotal</p>
                  <p className="text-2xl font-bold text-light">
                    {formatCurrency(
                      (purchaseData.quantity_purchased || 0) *
                        (purchaseData.actual_unit_price || 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchaseItem}
                  disabled={purchaseItemMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50"
                >
                  {purchaseItemMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Order Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-secondary border-t md:border border-gray/20 rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light">Eliminar Orden</h3>
                  <p className="text-sm text-gray">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-light mb-6">
                ¿Estás seguro de que deseas eliminar la orden{' '}
                <span className="font-bold text-secondary">{deleteModal.order_number}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteModal.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOrdersPage;
