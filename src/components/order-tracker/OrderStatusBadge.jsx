import React from "react";
import { Clock, ChefHat, CheckCircle, PackageCheck, XCircle } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    bgClass: "bg-yellow-500/20 border-yellow-500/40",
    textClass: "text-yellow-400",
    animation: "animate-pulse",
  },
  preparing: {
    label: "Preparando",
    icon: ChefHat,
    bgClass: "bg-cyan-500/20 border-cyan-500/40",
    textClass: "text-cyan-400",
    animation: "animate-spin-slow",
  },
  ready: {
    label: "¡Listo!",
    icon: CheckCircle,
    bgClass: "bg-green-500/20 border-green-500/40 shadow-lg shadow-green-500/30",
    textClass: "text-green-400",
    animation: "",
  },
  delivered: {
    label: "Entregado",
    icon: PackageCheck,
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
    textClass: "text-emerald-400",
    animation: "",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    bgClass: "bg-red-500/10 border-red-500/30",
    textClass: "text-red-400",
    animation: "",
  },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bgClass} transition-all`}
    >
      <Icon
        className={`w-5 h-5 ${config.textClass} ${config.animation}`}
      />
      <span className={`font-bold text-sm ${config.textClass}`}>
        {config.label}
      </span>
    </div>
  );
};

export default OrderStatusBadge;
