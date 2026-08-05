import { useCallback } from "react";
import { useCartStore } from "@/stores/useCartStore";

/**
 * Devuelve `add(variant, product)` para los botones "Agregar" de la carta.
 *
 * Agregar NO pide sesión: el cliente arma su pedido libremente y el login con
 * Google llega una sola vez, al confirmar (CheckoutSheet). Pedir la cuenta
 * antes de que el cliente sepa qué está comprando espantaba a quien solo
 * estaba mirando.
 */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);

  return useCallback(
    (variant, product) => {
      if (!variant?.id) return;
      addItem(variant, product);
    },
    [addItem]
  );
}

export default useAddToCart;
