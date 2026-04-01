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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
  Search,
  Pencil,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';

// Componente de selector con búsqueda
const SearchableSelect = ({ value, onChange, options, placeholder = "Seleccionar..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedOption = options.find(opt => opt.id === parseInt(value));
  
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.unit_abbreviation && opt.unit_abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (optionId) => {
    onChange(optionId.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-3 py-2.5 text-left text-sm focus:outline-none focus:border-primary flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-light' : 'text-gray'}>
          {selectedOption ? `${selectedOption.name} (${selectedOption.unit_abbreviation})` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 backdrop-blur-xl bg-white/[0.06] border border-white/[0.15] rounded-lg shadow-xl overflow-hidden"
            >
              {/* Input de búsqueda */}
              <div className="p-2 border-b border-white/[0.08]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar material..."
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg pl-9 pr-3 py-2 text-sm text-light placeholder-gray/50 focus:outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista de opciones */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray text-center">
                    No se encontraron materiales
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-white/[0.06] transition-colors flex items-center justify-between ${
                        parseInt(value) === opt.id ? 'bg-primary/10 text-primary' : 'text-light'
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-xs text-gray">{opt.unit_abbreviation}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [addItemModal, setAddItemModal] = useState(null);
  const [newItem, setNewItem] = useState({ raw_material: '', quantity_needed: '', estimated_unit_price: '' });
  const [editItemModal, setEditItemModal] = useState(null);
  const [editItemData, setEditItemData] = useState({
    quantity: '',
    unit_price: '',
    supplier: '',
  });

  // Estado para el filtro de mes
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  // Obtener órdenes filtradas por mes
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', selectedMonth.month, selectedMonth.year],
    queryFn: () => inventoryService.getPurchaseOrders({ 
      month: selectedMonth.month, 
      year: selectedMonth.year 
    }),
  });

  // Obtener materiales para crear orden
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => inventoryService.getMaterials(),
  });

  const materials = materialsData?.results || materialsData || [];

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

  // Revertir orden a pendiente
  const revertToPendingMutation = useMutation({
    mutationFn: (id) => inventoryService.revertOrderToPending(id),
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

  // Añadir item a orden existente
  const addItemMutation = useMutation({
    mutationFn: ({ orderId, data }) => inventoryService.addItemToOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      setAddItemModal(null);
      setNewItem({ raw_material: '', quantity_needed: '', estimated_unit_price: '' });
    },
  });

  // Eliminar item de orden existente
  const removeItemMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => inventoryService.removeItemFromOrder(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
    },
  });

  // Editar item de orden
  const updateItemMutation = useMutation({
    mutationFn: ({ orderId, itemId, data }) => inventoryService.updateOrderItem(orderId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['low-stock']);
      setEditItemModal(null);
      setEditItemData({
        quantity: '',
        unit_price: '',
        supplier: '',
      });
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
    if (!date) return '';
    // Si es solo fecha (YYYY-MM-DD), agregar hora para evitar problemas de zona horaria
    const dateStr = typeof date === 'string' && date.length === 10 
      ? date + 'T12:00:00' 
      : date;
    return new Date(dateStr).toLocaleDateString('es-CO', {
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

  const handleAddItemToOrder = () => {
    if (!addItemModal || !newItem.raw_material || !newItem.quantity_needed) return;
    
    addItemMutation.mutate({
      orderId: addItemModal.id,
      data: {
        raw_material: parseInt(newItem.raw_material),
        quantity_needed: parseFloat(newItem.quantity_needed),
        estimated_unit_price: parseFloat(newItem.estimated_unit_price) || 0,
      },
    });
  };

  const handleRemoveItemFromOrder = (orderId, itemId, isPurchased = false) => {
    const message = isPurchased 
      ? '¿Eliminar este item? El stock agregado será revertido.' 
      : '¿Eliminar este item de la orden?';
    if (confirm(message)) {
      removeItemMutation.mutate({ orderId, itemId });
    }
  };

  const handleOpenEditItem = (order, item) => {
    setEditItemModal({ order, item });
    // Cargar valores según el estado del item
    if (item.is_purchased) {
      setEditItemData({
        quantity: item.quantity_purchased || '',
        unit_price: item.actual_unit_price || '',
        supplier: item.supplier || '',
      });
    } else {
      setEditItemData({
        quantity: item.quantity_needed || '',
        unit_price: item.estimated_unit_price || '',
        supplier: item.supplier || '',
      });
    }
  };

  const handleUpdateItem = () => {
    if (!editItemModal) return;
    
    const dataToUpdate = {};
    const isPurchased = editItemModal.item.is_purchased;
    
    // Enviar campos según el estado del item
    if (editItemData.quantity) {
      if (isPurchased) {
        dataToUpdate.quantity_purchased = parseFloat(editItemData.quantity);
      } else {
        dataToUpdate.quantity_needed = parseFloat(editItemData.quantity);
      }
    }
    if (editItemData.unit_price) {
      if (isPurchased) {
        dataToUpdate.actual_unit_price = parseFloat(editItemData.unit_price);
      } else {
        dataToUpdate.estimated_unit_price = parseFloat(editItemData.unit_price);
      }
    }
    if (editItemData.supplier !== undefined) {
      dataToUpdate.supplier = editItemData.supplier;
    }
    
    updateItemMutation.mutate({
      orderId: editItemModal.order.id,
      itemId: editItemModal.item.id,
      data: dataToUpdate,
    });
  };

  const getOrderTotal = (order) => {
    // Calcular total mixto: items comprados con precio real, pendientes con estimado
    const total = order.items?.reduce((sum, item) => {
      if (item.is_purchased && item.actual_subtotal) {
        return sum + parseFloat(item.actual_subtotal);
      }
      return sum + parseFloat(item.estimated_subtotal || 0);
    }, 0) || 0;
    return total;
  };

  // Calcular total de órdenes completadas
  const completedOrdersTotal = orders
    .filter(order => order.status === 'purchased')
    .reduce((sum, order) => {
      // Para órdenes completadas, usar actual_total si existe, sino calcular desde items
      if (order.actual_total) {
        return sum + parseFloat(order.actual_total);
      }
      return sum + getOrderTotal(order);
    }, 0);

  const completedOrdersCount = orders.filter(order => order.status === 'purchased').length;

  // Navegación de meses
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 1) {
        return { month: 12, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.month === now.getMonth() + 1 && selectedMonth.year === now.getFullYear();
  };

  // Order Item Card for Mobile
  const OrderItemCard = ({ item, order }) => (
    <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 mb-2">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray flex-shrink-0" />
            <span className="text-light text-sm font-medium truncate">{item.raw_material_name}</span>
          </div>
          {item.raw_material_supplier && (
            <p className="text-xs text-gray ml-6 truncate">{item.raw_material_supplier}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.is_purchased ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Comprado
            </span>
          ) : (
            <span className="text-xs text-yellow-400">Pendiente</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditItem(order, item);
            }}
            className="p-1 text-secondary hover:bg-secondary/10 rounded transition-colors"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveItemFromOrder(order.id, item.id, item.is_purchased);
            }}
            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title={item.is_purchased ? "Eliminar (revertirá stock)" : "Eliminar"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
          <button
            onClick={() => {
              setNewOrderItems([{ raw_material: '', quantity_needed: '', estimated_unit_price: '' }]);
              setCreateModal(true);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-linear-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Orden</span>
          </button>
        </div>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-3">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-light font-medium">
                {monthNames[selectedMonth.month - 1]} {selectedMonth.year}
              </span>
            </div>
            {!isCurrentMonth() && (
              <button
                onClick={goToCurrentMonth}
                className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
              >
                Ir a hoy
              </button>
            )}
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resumen de Órdenes Completadas */}
      {!isLoading && completedOrdersCount > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-light mb-1 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Órdenes Completadas
              </h2>
              <p className="text-sm text-gray">
                {completedOrdersCount} orden{completedOrdersCount !== 1 ? 'es' : ''} comprada{completedOrdersCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray mb-1">Total invertido</p>
              <p className="text-2xl md:text-3xl font-bold text-green-400">
                {formatCurrency(completedOrdersTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-8 md:p-12 text-center">
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
          </div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="p-3 md:p-4 cursor-pointer hover:bg-white/[0.08] transition-colors"
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
                    <div className="p-3 md:p-4 pt-0 border-t border-white/[0.06]">
                      {/* Mobile: Item cards */}
                      <div className="md:hidden mt-3 space-y-2">
                        {order.items?.map((item) => (
                          <OrderItemCard key={item.id} item={item} order={order} />
                        ))}
                        
                        {/* Add item button for pending orders (mobile) */}
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddItemModal(order);
                              setNewItem({ raw_material: '', quantity_needed: '', estimated_unit_price: '' });
                            }}
                            className="flex items-center justify-center gap-1 w-full text-xs px-3 py-2.5 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Añadir material
                          </button>
                        )}
                      </div>

                      {/* Desktop: Items table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full mb-4">
                          <thead>
                            <tr className="text-left text-sm text-gray">
                              <th className="py-2">Material</th>
                              <th className="py-2">Proveedor</th>
                              <th className="py-2 text-right">Cantidad</th>
                              <th className="py-2 text-right">Precio</th>
                              <th className="py-2 text-right">Subtotal</th>
                              <th className="py-2 text-center">Estado</th>
                              <th className="py-2 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item) => (
                              <tr key={item.id} className="border-t border-white/[0.06]">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray" />
                                    <span className="text-light">{item.raw_material_name}</span>
                                    <span className="text-xs text-gray">({item.unit_abbreviation})</span>
                                  </div>
                                </td>
                                <td className="py-3 text-gray text-sm">
                                  {item.raw_material_supplier || '-'}
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
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
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
                                        className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                                      >
                                        Registrar
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditItem(order, item);
                                      }}
                                      className="p-1.5 text-secondary hover:bg-secondary/10 rounded transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveItemFromOrder(order.id, item.id, item.is_purchased);
                                      }}
                                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                      title={item.is_purchased ? "Eliminar (revertirá stock)" : "Eliminar item"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Add item button for pending orders */}
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddItemModal(order);
                              setNewItem({ raw_material: '', quantity_needed: '', estimated_unit_price: '' });
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors mb-4"
                          >
                            <Plus className="w-4 h-4" />
                            Añadir material
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-3 md:pt-4 border-t border-white/[0.06]">
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
                              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/[0.12] text-gray hover:text-light rounded-lg transition-colors"
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
                        
                        {order.status === 'purchased' && (
                          <button
                            onClick={() => revertToPendingMutation.mutate(order.id)}
                            disabled={revertToPendingMutation.isPending}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500/20 text-yellow-400 font-medium rounded-lg hover:bg-yellow-500/30 transition-colors"
                          >
                            {revertToPendingMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Revertir a pendiente</span>
                            <span className="sm:hidden">Revertir</span>
                          </button>
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
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto"
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
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
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
                      <div key={index} className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12 sm:col-span-5">
                            <SearchableSelect
                              value={item.raw_material}
                              onChange={(value) => updateNewOrderItem(index, 'raw_material', value)}
                              options={materials}
                              placeholder="Buscar material..."
                            />
                          </div>
                          <div className="col-span-5 sm:col-span-3">
                            <input
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Cantidad"
                              value={item.quantity_needed}
                              onChange={(e) => updateNewOrderItem(index, 'quantity_needed', e.target.value)}
                              className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-3 py-2.5 text-light focus:outline-none focus:border-primary text-sm"
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
                              className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-3 py-2.5 text-light focus:outline-none focus:border-primary text-sm"
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
                  className="flex-1 px-4 py-3 border border-white/[0.12] text-gray rounded-lg hover:text-light hover:border-white/[0.2] transition-colors"
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
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto"
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

              <div className="mb-4 p-3 backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg">
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
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
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
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
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
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
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
                  className="flex-1 px-4 py-3 border border-white/[0.12] text-gray rounded-lg hover:text-light hover:border-white/[0.2] transition-colors"
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
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4"
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
                  className="flex-1 px-4 py-3 border border-white/[0.12] text-gray rounded-lg hover:text-light hover:border-white/[0.2] transition-colors"
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

      {/* Add Item to Order Modal */}
      <AnimatePresence>
        {addItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setAddItemModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light flex items-center gap-2">
                  <Plus className="w-5 h-5 text-secondary" />
                  Añadir Material
                </h3>
                <button
                  onClick={() => setAddItemModal(null)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg">
                <p className="text-sm text-gray">Orden</p>
                <p className="font-bold text-light">{addItemModal.order_number}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray mb-1.5 block">Material *</label>
                  <SearchableSelect
                    value={newItem.raw_material}
                    onChange={(value) => {
                      const material = materials.find(m => m.id === parseInt(value));
                      setNewItem({
                        ...newItem,
                        raw_material: value,
                        estimated_unit_price: material?.cost_per_unit || '',
                      });
                    }}
                    options={materials}
                    placeholder="Buscar material..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Cantidad *</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={newItem.quantity_needed}
                    onChange={(e) => setNewItem({ ...newItem, quantity_needed: e.target.value })}
                    placeholder="Cantidad a pedir"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Precio unitario estimado (COP)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={newItem.estimated_unit_price}
                    onChange={(e) => setNewItem({ ...newItem, estimated_unit_price: e.target.value })}
                    placeholder="Precio por unidad"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                {newItem.quantity_needed && newItem.estimated_unit_price && (
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-gray">Subtotal estimado</p>
                    <p className="text-xl font-bold text-light">
                      {formatCurrency(parseFloat(newItem.quantity_needed) * parseFloat(newItem.estimated_unit_price))}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddItemModal(null)}
                  className="flex-1 px-4 py-3 border border-white/[0.12] text-gray rounded-lg hover:text-light hover:border-white/[0.2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddItemToOrder}
                  disabled={addItemMutation.isPending || !newItem.raw_material || !newItem.quantity_needed}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addItemMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Añadir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setEditItemModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-secondary" />
                  Editar Item
                </h3>
                <button
                  onClick={() => setEditItemModal(null)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg">
                <p className="font-bold text-light">{editItemModal.item.raw_material_name}</p>
                <p className="text-sm text-gray">
                  {editItemModal.item.unit_abbreviation} • 
                  {editItemModal.item.is_purchased ? (
                    <span className="text-green-400 ml-1">Comprado</span>
                  ) : (
                    <span className="text-yellow-400 ml-1">Pendiente</span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {editItemModal.item.is_purchased ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Modificar estos valores actualizará el stock y precio del material
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Editando valores estimados (el item aún no ha sido comprado)
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray mb-1.5 block">
                    {editItemModal.item.is_purchased ? 'Cantidad comprada' : 'Cantidad necesaria'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={editItemData.quantity}
                    onChange={(e) => setEditItemData({ ...editItemData, quantity: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    placeholder={editItemModal.item.is_purchased ? 'Cantidad comprada' : 'Cantidad necesaria'}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">
                    {editItemModal.item.is_purchased ? 'Precio real (COP)' : 'Precio estimado (COP)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={editItemData.unit_price}
                    onChange={(e) => setEditItemData({ ...editItemData, unit_price: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    placeholder={editItemModal.item.is_purchased ? 'Precio real por unidad' : 'Precio estimado por unidad'}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Proveedor</label>
                  <input
                    type="text"
                    value={editItemData.supplier}
                    onChange={(e) => setEditItemData({ ...editItemData, supplier: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Subtotal calculado */}
                {editItemData.quantity && editItemData.unit_price && (
                  <div className="bg-linear-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-gray">
                      Subtotal {editItemModal.item.is_purchased ? '' : '(estimado)'}
                    </p>
                    <p className="text-xl font-bold text-light">
                      {formatCurrency(parseFloat(editItemData.quantity) * parseFloat(editItemData.unit_price))}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditItemModal(null)}
                  className="flex-1 px-4 py-3 border border-white/[0.12] text-gray rounded-lg hover:text-light hover:border-white/[0.2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateItem}
                  disabled={updateItemMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50"
                >
                  {updateItemMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Guardar
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
