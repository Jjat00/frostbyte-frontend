import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import CartBar from "./CartBar";
import CartDrawer from "./CartDrawer";
import CheckoutSheet from "@/components/checkout/CheckoutSheet";
import OrderSuccess from "@/components/checkout/OrderSuccess";

/**
 * Orquesta el flujo de pedido del cliente:
 *   barra de carrito → carrito → checkout → pantalla de éxito.
 * Se monta una sola vez, en /domicilios (la carta pública es solo vitrina).
 *
 * El login con Google es uno solo y vive dentro de CheckoutSheet: salta al
 * confirmar, cuando el cliente ya sabe qué pide y cuánto cuesta.
 */
const CartLayer = () => {
  const clear = useCartStore((s) => s.clear);
  const [view, setView] = useState("closed"); // closed | cart | checkout
  const [successOrder, setSuccessOrder] = useState(null);

  return (
    <>
      <CartBar onClick={() => setView("cart")} />

      <CartDrawer
        open={view === "cart"}
        onClose={() => setView("closed")}
        onCheckout={() => setView("checkout")}
      />

      <CheckoutSheet
        open={view === "checkout"}
        onBack={() => setView("cart")}
        onSuccess={(order) => {
          setSuccessOrder(order);
          setView("closed");
          clear();
        }}
      />

      <OrderSuccess
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />
    </>
  );
};

export default CartLayer;
