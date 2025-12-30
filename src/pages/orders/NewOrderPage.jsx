import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  Phone,
  MessageSquare,
  Loader2,
  X,
  ChevronRight,
  Check,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { productsService, categoriesService } from '@/services';
import { ordersService } from '@/services/orders.service';

const NewOrderPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [itemNotes, setItemNotes] = useState({});

  // Obtener categorías
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  // Obtener productos
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => productsService.getAll(selectedCategory ? { category: selectedCategory } : {}),
  });

  const categories = categoriesData?.results || [];
  const products = productsData?.results || [];

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Mutación para crear pedido
  const queryClient = useQueryClient();
  const createOrderMutation = useMutation({
    mutationFn: (data) => ordersService.createOrder(data),
    onSuccess: (data) => {
      // Invalidar queries para actualizar las listas
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      navigate(`/pedidos/${data.id}`);
    },
  });

  // Funciones del carrito
  const addToCart = (product, variant) => {
    const existingIndex = cart.findIndex(
      (item) => item.variantId === variant.id
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          variantId: variant.id,
          productName: product.name,
          variantName: variant.name,
          price: parseFloat(variant.price),
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (variantId, delta) => {
    const newCart = cart
      .map((item) => {
        if (item.variantId === variantId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    setCart(newCart);
  };

  const removeFromCart = (variantId) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
    const newNotes = { ...itemNotes };
    delete newNotes[variantId];
    setItemNotes(newNotes);
  };

  const updateItemNotes = (variantId, notes) => {
    setItemNotes({ ...itemNotes, [variantId]: notes });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    const orderData = {
      customer_name: customerName || 'Cliente',
      customer_phone: customerPhone,
      customer_notes: customerNotes,
      items: cart.map((item) => ({
        product_variant_id: item.variantId,
        quantity: item.quantity,
        notes: itemNotes[item.variantId] || '',
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)] pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pedidos')}
            className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-light">Nuevo Pedido</h1>
            <p className="text-sm text-gray">Selecciona productos del menú</p>
          </div>
        </div>
        {/* Indicador de items en carrito para desktop pequeño/mediano */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCheckout(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-secondary/20 text-secondary rounded-lg border border-secondary/30"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{cartCount}</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Panel de Productos */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showCheckout ? 'hidden lg:flex' : ''}`}>
          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-secondary border border-gray/20 rounded-xl text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-secondary/20 text-secondary border border-secondary/30'
                  : 'bg-gray/10 text-gray hover:text-light border border-transparent'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'bg-gray/10 text-gray hover:text-light border border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {productsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray">No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-secondary border border-gray/20 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-light">{product.name}</h3>
                      <p className="text-xs text-gray">{product.category?.name}</p>
                    </div>
                  </div>

                  {/* Variantes */}
                  <div className="flex flex-wrap gap-2">
                    {product.variants?.map((variant) => {
                      const inCart = cart.find((item) => item.variantId === variant.id);
                      return (
                        <button
                          key={variant.id}
                          onClick={() => addToCart(product, variant)}
                          className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            inCart
                              ? 'bg-secondary/20 border border-secondary/50 text-secondary'
                              : 'bg-gray/10 border border-gray/20 text-gray hover:text-light hover:border-gray/40'
                          }`}
                        >
                          <span className="font-medium">{variant.name}</span>
                          <span className={inCart ? 'text-secondary' : 'text-light'}>
                            {formatCurrency(variant.price)}
                          </span>
                          {inCart && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-dark rounded-full text-xs font-bold flex items-center justify-center">
                              {inCart.quantity}
                            </span>
                          )}
                          <Plus className={`w-4 h-4 ${inCart ? 'text-secondary' : 'text-gray group-hover:text-secondary'}`} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Panel del Carrito (Desktop) */}
        <div className="hidden lg:flex lg:w-96 flex-col bg-dark-secondary border border-gray/20 rounded-xl">
          {/* Header del carrito */}
          <div className="p-4 border-b border-gray/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-secondary" />
              <span className="font-bold text-light">Pedido</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                <p className="text-gray text-sm">El carrito está vacío</p>
                <p className="text-gray/60 text-xs">Agrega productos del menú</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.variantId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-dark/50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-light text-sm break-words">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray break-words">{item.variantName}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray/20 rounded-lg text-gray hover:text-light hover:bg-gray/30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-light font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray/20 rounded-lg text-gray hover:text-light hover:bg-gray/30"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-light font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Notas del item */}
                    <input
                      type="text"
                      placeholder="Notas (ej: sin azúcar)"
                      value={itemNotes[item.variantId] || ''}
                      onChange={(e) => updateItemNotes(item.variantId, e.target.value)}
                      className="mt-2 w-full px-2 py-1.5 bg-dark border border-gray/20 rounded text-xs text-light placeholder:text-gray/50 focus:border-secondary/50 focus:outline-none"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Datos del cliente */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray/20 space-y-3 flex-shrink-0">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray" />
                <textarea
                  placeholder="Notas especiales / alergias"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Total y botón de confirmar */}
          <div className="p-4 border-t border-gray/20 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray font-medium">Total</span>
              <span className="text-2xl font-bold text-light">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando pedido...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar Pedido
                </>
              )}
            </button>
            {createOrderMutation.isError && (
              <p className="text-red-400 text-xs mt-2 text-center">
                Error al crear el pedido. Intenta de nuevo.
              </p>
            )}
          </div>
        </div>

        {/* Panel del Carrito - MOBILE (fullscreen overlay) */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-dark"
            >
              <div className="flex flex-col h-full">
                {/* Header del carrito mobile */}
                <div className="p-4 border-b border-gray/20 flex items-center justify-between flex-shrink-0 bg-dark-secondary">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="p-1.5 text-gray hover:text-light rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <ShoppingCart className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-light">Pedido</span>
                    {cartCount > 0 && (
                      <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs font-bold">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Items del carrito */}
                  <div className="p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray/30 mx-auto mb-3" />
                        <p className="text-gray text-sm">El carrito está vacío</p>
                        <p className="text-gray/60 text-xs">Agrega productos del menú</p>
                      </div>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <motion.div
                            key={item.variantId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-dark-secondary rounded-lg p-3 border border-gray/20"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-light text-sm truncate">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-gray">{item.variantName}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.variantId)}
                                className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.variantId, -1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray/20 rounded-lg text-gray hover:text-light hover:bg-gray/30"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center text-light font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.variantId, 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray/20 rounded-lg text-gray hover:text-light hover:bg-gray/30"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-light font-bold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>

                            {/* Notas del item */}
                            <input
                              type="text"
                              placeholder="Notas (ej: sin azúcar)"
                              value={itemNotes[item.variantId] || ''}
                              onChange={(e) => updateItemNotes(item.variantId, e.target.value)}
                              className="mt-2 w-full px-3 py-2 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray/50 focus:border-secondary/50 focus:outline-none"
                            />
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Datos del cliente - Mobile */}
                  {cart.length > 0 && (
                    <div className="p-4 border-t border-gray/20 space-y-3 bg-dark-secondary/50">
                      <p className="text-sm font-medium text-gray mb-2">Datos del cliente</p>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                        <input
                          type="text"
                          placeholder="Nombre del cliente"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                        <input
                          type="tel"
                          placeholder="Teléfono (opcional)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray" />
                        <textarea
                          placeholder="Notas especiales / alergias"
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          rows={2}
                          className="w-full pl-10 pr-4 py-3 bg-dark border border-gray/20 rounded-lg text-sm text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer fijo con Total y botón - Mobile */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray/20 bg-dark-secondary flex-shrink-0 safe-area-pb">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray font-medium">Total</span>
                      <span className="text-2xl font-bold text-secondary">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={cart.length === 0 || createOrderMutation.isPending}
                      className="w-full py-4 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creando pedido...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirmar Pedido
                        </>
                      )}
                    </button>
                    {createOrderMutation.isError && (
                      <p className="text-red-400 text-xs mt-2 text-center">
                        Error al crear el pedido. Intenta de nuevo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Botón flotante del carrito - SIEMPRE visible cuando hay items y NO está en checkout */}
      {/* Se oculta solo en lg+ donde el panel lateral es visible */}
      <AnimatePresence>
        {cart.length > 0 && !showCheckout && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setShowCheckout(true)}
            className="lg:hidden fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 py-4 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-xl shadow-2xl shadow-secondary/40 flex items-center justify-between px-6 z-40"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-dark text-secondary rounded-full text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span>Ver pedido</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(cartTotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewOrderPage;

