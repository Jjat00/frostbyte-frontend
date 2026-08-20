import React from "react";
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

  // El verde y el rojo se quedan porque aquí el color ES el dato (abierto o
  // cerrado), pero reducidos a un punto: el resto va en neutro como el resto
  // de la carta.
  const { label, dotClass } = isOpen
    ? { label: "Abierto", dotClass: "bg-green-400" }
    : { label: "Cerrado", dotClass: "bg-red-400" };

  return (
    <div
      className={cn(
        "inline-flex select-none items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] px-2.5 py-1",
        className
      )}
      role="status"
      aria-label={`El local está ${label.toLowerCase()}`}
      title={`El local está ${label.toLowerCase()}`}
    >
      <span className={cn("inline-flex h-1.5 w-1.5 rounded-full", dotClass)} />
      <span className="text-[0.68rem] font-medium tracking-[0.06em] text-light/60">
        {label}
      </span>
    </div>
  );
};

export default StoreStatusBadge;
