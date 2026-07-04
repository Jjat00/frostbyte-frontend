import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Carrito del CLIENTE para pedidos en línea.
 *
 * Persistente en localStorage (`frostbyte_cart`) para que sobreviva a refrescos
 * y al login con Google (que recarga estado, no la página). Los items se agrupan
 * por `product_variant_id` (la unidad vendible real). Es independiente de
 * `useProductStore` para no interferir con el carrito del staff.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      // { product_variant_id, productName, variantName, price, quantity, notes }
      items: [],

      addItem: (variant, product) =>
        set((state) => {
          const id = variant?.id;
          if (!id) return state;
          const existing = state.items.find(
            (it) => it.product_variant_id === id
          );
          if (existing) {
            return {
              items: state.items.map((it) =>
                it.product_variant_id === id
                  ? { ...it, quantity: it.quantity + 1 }
                  : it
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                product_variant_id: id,
                productName: product?.name || "",
                variantName: variant?.name || "",
                price: Number(variant?.price) || 0,
                quantity: 1,
                notes: "",
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it.product_variant_id !== id),
        })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((it) => it.product_variant_id !== id)
              : state.items.map((it) =>
                  it.product_variant_id === id ? { ...it, quantity } : it
                ),
        })),

      incQty: (id) => {
        const current =
          get().items.find((it) => it.product_variant_id === id)?.quantity || 0;
        get().setQuantity(id, current + 1);
      },

      decQty: (id) => {
        const current =
          get().items.find((it) => it.product_variant_id === id)?.quantity || 0;
        get().setQuantity(id, current - 1);
      },

      setNotes: (id, notes) =>
        set((state) => ({
          items: state.items.map((it) =>
            it.product_variant_id === id ? { ...it, notes } : it
          ),
        })),

      clear: () => set({ items: [] }),

      // Getters
      count: () => get().items.reduce((n, it) => n + it.quantity, 0),
      subtotal: () =>
        get().items.reduce((s, it) => s + it.price * it.quantity, 0),
    }),
    {
      name: "frostbyte_cart",
    }
  )
);

export default useCartStore;
