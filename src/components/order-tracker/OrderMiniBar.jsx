import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";

const OrderMiniBar = ({ order, onClick }) => {
  if (!order) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <motion.button
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-dark-secondary/90 backdrop-blur-sm border border-gray/20 rounded-xl hover:border-secondary/30 transition-all group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <OrderStatusBadge status={order.status} />
        <div className="hidden md:flex flex-col items-start min-w-0">
          <span className="text-sm text-light font-medium truncate">
            {order.customer_name}
          </span>
          <span className="text-xs text-gray">
            #{order.order_number?.slice(-6)} · {order.items_count || 0} items
            {order.status === "delivered" && !order.is_paid && (
              <span className="text-yellow-400 ml-1">· Pendiente de pago</span>
            )}
          </span>
        </div>
        <span className="md:hidden text-sm text-gray truncate">
          {order.customer_name}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-light">
          {formatCurrency(order.total)}
        </span>
        <ChevronRight className="w-4 h-4 text-gray group-hover:text-secondary transition-colors" />
      </div>
    </motion.button>
  );
};

export default OrderMiniBar;
