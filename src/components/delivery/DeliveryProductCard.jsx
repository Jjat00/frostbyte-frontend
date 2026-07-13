import React from "react";
import { Plus } from "lucide-react";
import { getProductStyles } from "@/lib/productStyles";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

/**
 * Tarjeta de producto para la vista de domicilios: imagen grande, nombre,
 * precio y botón de agregar. Con varias variantes muestra "Desde $X" y el
 * botón abre el selector de tamaño (VariantPickerSheet).
 */
const DeliveryProductCard = ({ product, canOrder, onAdd }) => {
  const styles = getProductStyles(product, product.category_slug);
  const Icon = styles.icon;
  const variants = product.variants || [];
  const prices = variants.map((v) => Number(v.price) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const multi = variants.length > 1;
  const comingSoon = !!product.is_coming_soon;
  const showAdd = canOrder && !comingSoon && variants.length > 0;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.08]">
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${styles.gradient}`}
      >
        {styles.image ? (
          <img
            src={styles.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Icon className="w-10 h-10 text-white/70" />
          </div>
        )}
        {comingSoon && (
          <span className="absolute top-2 left-2 rounded-full bg-dark/80 border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
            Próximamente
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="text-sm font-bold text-light leading-snug line-clamp-2">
          {product.name}
        </p>
        {multi && (
          <p className="text-[11px] text-white/40">
            {variants.length} tamaños
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <p className="text-sm font-extrabold text-gold">
            {multi && (
              <span className="text-[10px] font-semibold text-white/40 mr-1">
                Desde
              </span>
            )}
            {formatCOP(minPrice)}
          </p>
          {showAdd && (
            <button
              type="button"
              onClick={() => onAdd(product)}
              aria-label={`Agregar ${product.name} al pedido`}
              className="grid place-items-center w-10 h-10 -m-1 rounded-full bg-gradient-to-r from-gold to-amber-400 text-dark shadow-md shadow-gold/25 active:scale-90 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryProductCard;
