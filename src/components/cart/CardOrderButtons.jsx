import React from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { useStoreConfig, useAddToCart } from "@/hooks";

/**
 * Botones de "pedir a domicilio" para las tarjetas de producto (MenuSections).
 *
 * - Si el local está cerrado o los domicilios están desactivados, el producto
 *   es "próximamente", o se está viendo la carta desde una mesa (QR /mesa/...),
 *   no renderiza nada: el pedido en línea del cliente es solo a domicilio.
 * - 1 variante  → un botón "Agregar al pedido".
 * - N variantes → un botón por variante (con su nombre), para que el cliente
 *   elija el tamaño directamente desde la tarjeta.
 */
const CardOrderButtons = ({ product }) => {
  const add = useAddToCart();
  const { data: config } = useStoreConfig();
  const location = useLocation();

  if (location.pathname.startsWith("/mesa/")) return null;
  if (!config?.can_order || product?.is_coming_soon) return null;

  const variants = product?.variants || [];
  if (!variants.length) return null;

  if (variants.length === 1) {
    return (
      <button
        type="button"
        onClick={() => add(variants[0], product)}
        className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-bold text-sm py-2.5 active:scale-[0.98] transition-transform"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
        Agregar al pedido
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {variants.map((variant) => (
        <button
          key={variant.id || variant.name}
          type="button"
          onClick={() => add(variant, product)}
          className="flex items-center gap-1 rounded-full bg-gold/15 hover:bg-gold/30 active:scale-95 border border-gold/30 text-gold text-xs font-semibold px-3 py-1.5 transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          {variant.name}
        </button>
      ))}
    </div>
  );
};

export default CardOrderButtons;
