import React from "react";
import { Bike, MapPin, MessageCircle, Navigation, Smartphone } from "lucide-react";

/**
 * Distintivos de domicilio para las vistas del staff.
 *
 * - <DeliveryBadge order /> chip "Domicilio" (solo si order_type === delivery).
 * - <SourceBadge order />   chip con el origen del pedido: "App" (checkout web)
 *   o "WhatsApp" (agente de IA). Los pedidos del staff no llevan chip.
 * - <DeliveryInfo order />  bloque con dirección, referencia y link a Google
 *   Maps para el domiciliario. No renderiza nada en pedidos que no son
 *   domicilio, así las vistas lo montan sin condicionales.
 */

export const isDelivery = (order) => order?.order_type === "delivery";

export const SourceBadge = ({ order }) => {
  if (order?.source === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full text-xs font-bold border border-green-500/25">
        <MessageCircle className="w-3 h-3" />
        WhatsApp
      </span>
    );
  }
  if (order?.source === "customer") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/15 text-secondary rounded-full text-xs font-bold border border-secondary/25">
        <Smartphone className="w-3 h-3" />
        App
      </span>
    );
  }
  return null;
};

export const DeliveryBadge = ({ order }) => {
  if (!isDelivery(order)) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/15 text-gold rounded-full text-xs font-bold border border-gold/25">
      <Bike className="w-3 h-3" />
      Domicilio
    </span>
  );
};

export const DeliveryInfo = ({ order, className = "" }) => {
  if (!isDelivery(order)) return null;
  const hasCoords = order.delivery_lat != null && order.delivery_lng != null;
  return (
    <div
      className={`mt-2 rounded-lg bg-gold/[0.06] border border-gold/15 px-2.5 py-2 space-y-1 ${className}`}
    >
      <div className="flex items-start gap-1.5 text-xs text-light">
        <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
        <span>{order.delivery_address || "Sin dirección"}</span>
      </div>
      {order.delivery_reference && (
        <p className="text-xs text-gray pl-5">{order.delivery_reference}</p>
      )}
      {hasCoords && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline pl-5"
        >
          <Navigation className="w-3 h-3" />
          Cómo llegar
        </a>
      )}
    </div>
  );
};

export default DeliveryInfo;
