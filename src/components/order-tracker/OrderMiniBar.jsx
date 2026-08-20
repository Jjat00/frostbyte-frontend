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
      className="fb-card fb-card--link group flex w-full items-center justify-between gap-3 px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <OrderStatusBadge status={order.status} />
        <div className="hidden md:flex flex-col items-start min-w-0">
          <span className="truncate text-[0.82rem] font-medium text-light">
            {order.customer_name}
          </span>
          <span className="text-[0.7rem] text-light/45">
            #{order.order_number?.slice(-6)} · {order.items_count || 0} items
            {order.status === "delivered" && !order.is_paid && (
              <span className="ml-1 text-light/70">· Pendiente de pago</span>
            )}
          </span>
        </div>
        <span className="truncate text-[0.78rem] text-light/55 md:hidden">
          {order.customer_name}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[0.82rem] font-medium text-light">
          {formatCurrency(order.total)}
        </span>
        <ChevronRight className="h-4 w-4 text-light/35 transition-colors group-hover:text-light/70" />
      </div>
    </motion.button>
  );
};

export default OrderMiniBar;
