import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, ArrowRight } from "lucide-react";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Pantalla de confirmación tras crear el pedido a domicilio. Muestra el código
 * del pedido y lleva a "Mis pedidos" para el seguimiento en vivo.
 */
const OrderSuccess = ({ order, onClose }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-md bg-dark border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 text-center"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
          >
            <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </span>

            <h2 className="text-xl font-black text-light">¡Domicilio confirmado!</h2>
            <p className="text-sm text-white/50 mt-1">
              Tu pedido entró a la cola. Sigue su estado en "Mis pedidos".
            </p>

            <div className="mt-5 rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Pedido</span>
                <span className="text-light font-semibold">
                  #{order.order_number}
                </span>
              </div>
              {order.delivery_address && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/50 flex-shrink-0">Entrega</span>
                  <span className="text-light font-semibold text-right">
                    {order.delivery_address}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-secondary font-black text-lg">
                  {formatCOP(order.total)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/40">
                  Código de tu pedido
                </p>
                <p className="text-3xl font-black tracking-[0.3em] text-secondary mt-1">
                  {order.access_code}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  navigate("/mis-pedidos");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-dark font-extrabold py-3 active:scale-[0.98] transition-transform"
              >
                <ClipboardList className="w-4 h-4" />
                Ver mis pedidos
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-white/10 text-white/60 hover:text-light hover:bg-white/5 font-semibold py-2.5 transition-colors"
              >
                Seguir en la carta
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderSuccess;
