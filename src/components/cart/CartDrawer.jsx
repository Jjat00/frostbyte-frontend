import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Bottom-sheet con el detalle del carrito: editar cantidades, notas, eliminar,
 * y continuar al checkout. Mobile-first (centrado, max-w-md en desktop).
 */
const CartDrawer = ({ open, onClose, onCheckout }) => {
  const items = useCartStore((s) => s.items);
  const incQty = useCartStore((s) => s.incQty);
  const decQty = useCartStore((s) => s.decQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const setNotes = useCartStore((s) => s.setNotes);
  const clear = useCartStore((s) => s.clear);

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const count = items.reduce((n, it) => n + it.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-md bg-dark border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col max-h-[88vh]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="text-base font-black uppercase tracking-wide text-light">
                  Tu pedido
                </h2>
                {count > 0 && (
                  <span className="text-xs text-white/40">
                    ({count} producto{count === 1 ? "" : "s"})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid place-items-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.length === 0 && (
                <div className="py-10 text-center text-white/40 text-sm">
                  Tu carrito está vacío. Agrega productos desde la carta.
                </div>
              )}

              {items.map((it) => (
                <div
                  key={it.product_variant_id}
                  className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-light break-words">
                        {it.productName}
                      </p>
                      {it.variantName && (
                        <p className="text-[11px] uppercase tracking-wider text-white/40">
                          {it.variantName}
                        </p>
                      )}
                      <p className="text-xs text-gold font-bold mt-0.5">
                        {formatCOP(it.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.product_variant_id)}
                      aria-label="Eliminar"
                      className="grid place-items-center w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    {/* Cantidad */}
                    <div className="flex items-center gap-3 rounded-full bg-white/[0.06] px-2 py-1">
                      <button
                        type="button"
                        onClick={() => decQty(it.product_variant_id)}
                        aria-label="Restar"
                        className="grid place-items-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-light min-w-[18px] text-center">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incQty(it.product_variant_id)}
                        aria-label="Sumar"
                        className="grid place-items-center w-6 h-6 rounded-full bg-gold/20 hover:bg-gold/30 text-gold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-light">
                      {formatCOP(it.price * it.quantity)}
                    </span>
                  </div>

                  {/* Notas por item */}
                  <input
                    type="text"
                    value={it.notes}
                    onChange={(e) =>
                      setNotes(it.product_variant_id, e.target.value)
                    }
                    placeholder="Nota (ej: sin azúcar, extra hielo)"
                    maxLength={200}
                    className="mt-2 w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clear}
                    className="text-xs text-white/40 hover:text-red-400 transition-colors"
                  >
                    Vaciar carrito
                  </button>
                  <div className="text-right">
                    <span className="text-xs text-white/40">Subtotal</span>
                    <p className="text-lg font-black text-gold leading-none">
                      {formatCOP(subtotal)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-extrabold py-3 active:scale-[0.98] transition-transform"
                >
                  Continuar al pedido
                </button>
                <p className="text-[11px] text-center text-white/30">
                  El envío (si aplica) se calcula en el siguiente paso.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
