import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Bottom-sheet para elegir el tamaño/variante de un producto antes de
 * agregarlo al pedido. Se usa en la vista de domicilios cuando el producto
 * tiene más de una variante.
 */
const VariantPickerSheet = ({ product, image, open, onClose, onAdd }) => {
  const variants = product?.variants || [];

  return (
    <AnimatePresence>
      {open && product && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-dark"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
              {image && (
                <img
                  src={image}
                  alt=""
                  className="h-11 w-11 flex-shrink-0 rounded-[12px] object-cover"
                />
              )}
              <div className="min-w-0">
                <h2 className="font-display truncate text-[0.88rem] font-semibold uppercase tracking-[0.12em] text-light">
                  {product.name}
                </h2>
                <p className="mt-1 text-[0.7rem] text-light/40">
                  Elige el tamaño para agregarlo
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 space-y-2 max-h-[50vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
              {variants.map((variant) => (
                <button
                  key={variant.id || variant.name}
                  type="button"
                  onClick={() => onAdd(variant)}
                  className="fb-card fb-card--link flex w-full cursor-pointer items-center gap-3 px-4 py-3"
                >
                  <span className="text-left text-[0.82rem] font-medium text-light">
                    {variant.name}
                  </span>
                  <span className="ml-auto whitespace-nowrap text-[0.85rem] font-medium text-light">
                    {formatCOP(variant.price)}
                  </span>
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-secondary/30 bg-secondary/10">
                    <Plus className="h-3.5 w-3.5 text-secondary" strokeWidth={2.2} />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VariantPickerSheet;
