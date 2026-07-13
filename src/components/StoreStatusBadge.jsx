import React from "react";
import { CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pill de estado del local: "Abierto" (verde) / "Cerrado" (rojo).
 *
 * Alimentado por el estado `is_open` de la configuración pública del local
 * (useStoreConfig). Se muestra en el Header, por lo que es visible tanto en la
 * carta (`/`) como en la vista de mesa del cliente (`/mesa/*`).
 *
 * @param {boolean|undefined} isOpen - Estado del local. `undefined` mientras carga.
 * @param {string} [className]
 */
const StoreStatusBadge = ({ isOpen, className }) => {
  // Mientras carga la config no mostramos nada para evitar parpadeos de estado.
  if (isOpen === undefined || isOpen === null) return null;

  const config = isOpen
    ? {
        label: "Abierto",
        Icon: CheckCircle,
        bgClass: "bg-green-500/15 border-green-500/40",
        textClass: "text-green-400",
        dotClass: "bg-green-400",
        pulse: true,
      }
    : {
        label: "Cerrado",
        Icon: Lock,
        bgClass: "bg-red-500/15 border-red-500/40",
        textClass: "text-red-400",
        dotClass: "bg-red-400",
        pulse: false,
      };

  const { label, Icon, bgClass, textClass, dotClass, pulse } = config;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-sm transition-all select-none",
        bgClass,
        className
      )}
      role="status"
      aria-label={`El local está ${label.toLowerCase()}`}
      title={`El local está ${label.toLowerCase()}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping",
              dotClass
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotClass)} />
      </span>
      <Icon className={cn("w-3.5 h-3.5", textClass)} />
      <span className={cn("text-xs font-bold tracking-wide", textClass)}>{label}</span>
    </div>
  );
};

export default StoreStatusBadge;
