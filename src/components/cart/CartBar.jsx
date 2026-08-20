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
          // En móvil se apoya SOBRE la barra de pestañas (4rem + safe area),
          // que ocupa el fondo; en escritorio esa barra no existe.
          className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 inset-x-0 z-50 px-3 pb-3 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
        >
          <button
            type="button"
            onClick={onClick}
            aria-label={`Ver mi pedido, ${count} producto${count === 1 ? "" : "s"}`}
            style={{ "--fb-accent": "var(--color-secondary)" }}
            // Flota sobre contenido cualquiera, así que el fondo es sólido:
            // el vidrio del hero aquí dejaría el total ilegible.
            className="fb-card fb-card--accent pointer-events-auto mx-auto flex w-full max-w-md cursor-pointer items-center gap-3 bg-dark/95 px-4 py-3 transition-transform active:scale-[0.98]"
          >
            <span className="relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-secondary/25 bg-secondary/10">
              <ShoppingBag className="h-4 w-4 text-secondary" />
              <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-[0.62rem] font-semibold text-dark">
                {count}
              </span>
            </span>
            <span className="text-[0.8rem] font-medium tracking-[0.06em] text-light">
              Ver mi pedido
            </span>
            <span className="ml-auto flex items-center gap-1 text-[0.95rem] font-medium text-light">
              {formatCOP(subtotal)}
              <ChevronRight className="h-4 w-4 text-light/45" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartBar;
