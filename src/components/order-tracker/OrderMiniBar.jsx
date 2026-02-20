import React from "react";
import { motion } from "framer-motion";
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
      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-dark-secondary/90 backdrop-blur-sm border border-gray/20 rounded-xl hover:border-secondary/30 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-gray truncate">
          {order.customer_name}
        </span>
      </div>
      <span className="text-sm font-bold text-light flex-shrink-0">
        {formatCurrency(order.total)}
      </span>
    </motion.button>
  );
};

export default OrderMiniBar;
