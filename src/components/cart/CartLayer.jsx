import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useCartAuthGate } from "@/stores/useCartAuthGate";
import CartFab from "./CartFab";
import CartDrawer from "./CartDrawer";
import CheckoutSheet from "@/components/checkout/CheckoutSheet";
import OrderSuccess from "@/components/checkout/OrderSuccess";
import CustomerAuthGate from "@/components/checkout/CustomerAuthGate";

/**
 * Orquesta el flujo de pedido del cliente sobre la carta:
 *   FAB → carrito → checkout → pantalla de éxito.
 * Se monta una sola vez en la home para que el FAB esté disponible en todo `/`.
 */
const CartLayer = () => {
  const clear = useCartStore((s) => s.clear);
  const [view, setView] = useState("closed"); // closed | cart | checkout
  const [successOrder, setSuccessOrder] = useState(null);

  // Compuerta de login: el cliente debe entrar con Google ANTES de agregar.
  const authGateOpen = useCartAuthGate((s) => s.open);
  const resolveAuthGate = useCartAuthGate((s) => s.resolve);
  const closeAuthGate = useCartAuthGate((s) => s.close);

  return (
    <>
      <CartFab onClick={() => setView("cart")} />

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

      {/* Login obligatorio para empezar a pedir. Al autenticarse, se agrega
          automáticamente el producto que el cliente intentó añadir. */}
      <CustomerAuthGate
        open={authGateOpen}
        onClose={closeAuthGate}
        onAuthenticated={resolveAuthGate}
        title="Inicia sesión para pedir"
        description="Para armar tu pedido entra con tu cuenta de Google. Así lo sigues en vivo y queda en tu historial."
      />
    </>
  );
};

export default CartLayer;
