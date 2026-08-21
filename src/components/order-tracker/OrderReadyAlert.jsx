import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, PartyPopper } from "lucide-react";

const OrderReadyAlert = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      // Vibrar dispositivo si está soportado
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-dark-secondary border-2 border-green-500/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl shadow-green-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-green-500/10 animate-pulse" />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 text-gray hover:text-light transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-green-400 mb-2">
                ¡Tu pedido está listo!
              </h2>

              <p className="text-gray text-sm mb-6">
                El mesero lo llevará a tu mesa en un momento
              </p>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold hover:bg-green-500/30 transition-all"
              >
                ¡Genial!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderReadyAlert;
