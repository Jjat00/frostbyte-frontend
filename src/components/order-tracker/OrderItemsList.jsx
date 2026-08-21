import React from "react";
import { PackageCheck, Package, Clock } from "lucide-react";

const OrderItemsList = ({ items }) => {
  if (!items || items.length === 0) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            item.is_delivered
              ? "bg-green-500/5 border-green-500/20"
              : "bg-white/[0.03] border-white/[0.08]"
          }`}
        >
          {item.product_image ? (
            <img loading="lazy" decoding="async"
              src={item.product_image}
              alt={item.product_name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-gray/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-light text-sm font-medium truncate">
              {item.quantity > 1 && (
                <span className="text-secondary mr-1">{item.quantity}x</span>
              )}
              {item.product_name}
            </p>
            <p className="text-xs text-gray truncate">{item.variant_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-light text-sm font-medium">
              {formatCurrency(item.subtotal)}
            </span>
            {item.is_delivered ? (
              <PackageCheck className="w-4 h-4 text-green-400" />
            ) : (
              <Clock className="w-4 h-4 text-gray/40" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;
