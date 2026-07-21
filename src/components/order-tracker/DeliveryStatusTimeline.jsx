import React from "react";
import { Receipt, ChefHat, Bike, PackageCheck, XCircle } from "lucide-react";

// El estado "ready" de un domicilio significa que salió del local:
// para el cliente eso es "En camino".
const STEPS = [
  { key: "pending", label: "Recibido", icon: Receipt },
  { key: "preparing", label: "Preparando", icon: ChefHat },
  { key: "ready", label: "En camino", icon: Bike },
  { key: "delivered", label: "Entregado", icon: PackageCheck },
];

/**
 * Línea de progreso del domicilio: Recibido → Preparando → En camino →
 * Entregado. Si el pedido fue cancelado muestra un aviso en su lugar.
 */
const DeliveryStatusTimeline = ({ status }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-bold">Pedido cancelado</span>
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start px-1">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 mt-4 rounded ${
                  i <= current ? "bg-secondary" : "bg-white/10"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1 w-16">
              <span
                className={`grid place-items-center w-8 h-8 rounded-full border transition-colors ${
                  active
                    ? `bg-secondary/15 border-secondary text-secondary ${
                        status !== "delivered" ? "animate-pulse" : ""
                      }`
                    : done
                    ? "bg-secondary border-secondary text-dark"
                    : "bg-white/[0.04] border-white/10 text-white/30"
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span
                className={`text-[10px] font-bold text-center leading-tight ${
                  active
                    ? "text-secondary"
                    : done
                    ? "text-white/70"
                    : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DeliveryStatusTimeline;
