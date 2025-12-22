import { create } from 'zustand';

/**
 * Store global para productos con Zustand
 * Útil para mantener estado compartido entre componentes
 */
export const useProductStore = create((set, get) => ({
  // Estado
  selectedCategory: null,
  cartItems: [],
  
  // Acciones
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  // Carrito (preparado para futura funcionalidad de pedidos)
  addToCart: (item) => set((state) => ({
    cartItems: [...state.cartItems, { ...item, quantity: 1, id: Date.now() }]
  })),
  
  removeFromCart: (itemId) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item.id !== itemId)
  })),
  
  updateQuantity: (itemId, quantity) => set((state) => ({
    cartItems: state.cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    )
  })),
  
  clearCart: () => set({ cartItems: [] }),
  
  // Getters
  getCartTotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getCartCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useProductStore;

