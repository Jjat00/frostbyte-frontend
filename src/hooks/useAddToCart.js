import { useCallback } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useCartAuthGate } from "@/stores/useCartAuthGate";

/**
 * Devuelve `add(variant, product)` para los botones "Agregar" de la carta.
 *
 * Exige sesión de cliente (Google) ANTES de agregar al carrito: con sesión,
 * agrega al instante; sin sesión, abre el modal de login y, al autenticarse,
 * agrega automáticamente el producto que disparó el flujo.
 */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const requireAuth = useCartAuthGate((s) => s.requireAuth);

  return useCallback(
    (variant, product) => {
      if (!variant?.id) return;
      if (isAuthenticated) {
        addItem(variant, product);
        return;
      }
      // Sin sesión: aplaza el "agregar" hasta después del login con Google.
      requireAuth(() => useCartStore.getState().addItem(variant, product));
    },
    [addItem, isAuthenticated, requireAuth]
  );
}

export default useAddToCart;
