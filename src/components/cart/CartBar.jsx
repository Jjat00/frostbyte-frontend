import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Barra de carrito fija al fondo de la pantalla (vista de domicilios):
 * ancho completo con conteo, CTA y subtotal siempre visibles. Solo aparece
 * cuando hay items en el carrito.
 */
const CartBar = ({ onClick }) => {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 110, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 110, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
        >
          <button
            type="button"
            onClick={onClick}
            aria-label={`Ver mi pedido, ${count} producto${count === 1 ? "" : "s"}`}
            className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-dark px-4 py-3 font-bold shadow-[0_-4px_28px_rgba(0,224,255,0.4)] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span className="relative grid place-items-center w-9 h-9 rounded-full bg-dark/15 flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-dark text-secondary text-[11px] font-extrabold">
                {count}
              </span>
            </span>
            <span className="text-sm font-extrabold uppercase tracking-wide">
              Ver mi pedido
            </span>
            <span className="ml-auto flex items-center gap-0.5 text-base font-black">
              {formatCOP(subtotal)}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartBar;
