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
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-dark border-t border-gray/20 rounded-t-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray/20">
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
              {/* Status */}
              <div className="flex items-center justify-center">
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Delivery progress */}
              <div className="flex items-center justify-between px-3 py-2 bg-dark-secondary/50 rounded-lg border border-gray/10">
                <span className="text-xs text-gray">Entregados</span>
                <span className="text-sm text-light font-medium">
                  {order.delivered_items_count || 0} / {order.items_count || 0}
                </span>
              </div>

              {/* Items */}
              <OrderItemsList items={order.items} />

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-gray/20">
                <span className="text-gray font-medium">Total</span>
                <span className="text-xl font-bold text-secondary">
                  {formatCurrency(order.total)}
                </span>
              </div>

              {/* While you wait */}
              <WhileYouWait status={order.status} />

              {/* Recommended */}
              <RecommendedProducts />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderTracker;
