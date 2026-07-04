import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Botón flotante del carrito. Centrado abajo para no chocar con el botón de
 * "volver a la carta" (bottom-right). Solo visible cuando hay items.
 */
const CartFab = ({ onClick }) => {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-gold to-amber-400 text-dark font-bold pl-3 pr-5 py-2.5 shadow-lg shadow-gold/30 active:scale-95 transition-transform"
          aria-label={`Ver pedido, ${count} producto${count === 1 ? "" : "s"}`}
        >
          <span className="relative grid place-items-center w-9 h-9 rounded-full bg-dark/15">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-dark text-gold text-[11px] font-extrabold">
              {count}
            </span>
          </span>
          <span className="text-sm">Ver pedido</span>
          <span className="text-sm font-extrabold">{formatCOP(subtotal)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default CartFab;
