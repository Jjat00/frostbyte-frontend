import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemsList from "./OrderItemsList";
import RecommendedProducts from "./RecommendedProducts";
import WhileYouWait from "./WhileYouWait";

const OrderTracker = ({ order, show, onClose }) => {
  if (!order) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  // Nombres de productos en el pedido para filtrar recomendados
  const orderProductNames = (order.items || []).map((i) => i.product_name);

  const content = (
    <>
      {/* Status */}
      <div className="flex items-center justify-center">
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Delivered status */}
      {order.status === "delivered" && !order.is_paid && (
        <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="text-xs text-yellow-400 font-medium">
            Pedido entregado · Pendiente de pago
          </p>
        </div>
      )}

      {/* Delivery progress */}
      <div className="flex items-center justify-between px-3 py-2 backdrop-blur-sm bg-white/[0.06] rounded-lg border border-white/[0.1]">
        <span className="text-xs text-gray">Entregados</span>
        <span className="text-sm text-light font-medium">
          {order.delivered_items_count || 0} / {order.items_count || 0}
        </span>
      </div>

      {/* Items */}
      <OrderItemsList items={order.items} />

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.1]">
        <span className="text-gray font-medium">Total</span>
        <span className="text-xl font-bold text-secondary">
          {formatCurrency(order.total)}
        </span>
      </div>

      {/* While you wait */}
      <WhileYouWait status={order.status} />

      {/* Recommended (excluding products already in order) */}
      <RecommendedProducts excludeProducts={orderProductNames} />
    </>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Mobile: bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="md:hidden absolute bottom-0 left-0 right-0 max-h-[90vh] backdrop-blur-xl bg-dark/95 border-t border-white/[0.1] rounded-t-2xl overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.1]">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-bold text-light text-lg">Tu Pedido</h3>
                  <p className="text-xs text-gray">
                    #{order.order_number?.slice(-6)} · {order.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {content}
            </div>
          </motion.div>

          {/* Desktop: centered modal / side panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="hidden md:flex absolute inset-y-0 right-0 w-full max-w-lg flex-col backdrop-blur-xl bg-dark/95 border-l border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-8px_32px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1]">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-bold text-light text-xl">Tu Pedido</h3>
                  <p className="text-sm text-gray">
                    #{order.order_number?.slice(-6)} · {order.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderTracker;
