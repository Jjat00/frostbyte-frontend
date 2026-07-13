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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-dark border-t border-white/10 rounded-t-2xl shadow-2xl overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              {image && (
                <img
                  src={image}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-base font-black uppercase tracking-wide text-light truncate">
                  {product.name}
                </h2>
                <p className="text-xs text-white/40">
                  Elige el tamaño para agregarlo
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto grid place-items-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex-shrink-0"
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
                  className="w-full flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-gold/40 px-4 py-3 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-light text-left">
                    {variant.name}
                  </span>
                  <span className="ml-auto text-sm font-extrabold text-gold whitespace-nowrap">
                    {formatCOP(variant.price)}
                  </span>
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-gradient-to-r from-gold to-amber-400 text-dark flex-shrink-0">
                    <Plus className="w-4 h-4" strokeWidth={3} />
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
