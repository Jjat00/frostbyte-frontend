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
    <div className="fb-card fb-card--link flex flex-col overflow-hidden">
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
            <Icon className="h-9 w-9 text-white/70" />
          </div>
        )}
        {comingSoon && (
          <span className="fb-pill absolute left-2 top-2 bg-dark/80 text-[0.6rem] uppercase tracking-[0.16em]">
            Próximamente
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-2 text-[0.8rem] font-medium leading-snug text-light">
          {product.name}
        </p>
        {multi && (
          <p className="text-[0.65rem] text-light/40">
            {variants.length} tamaños
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <p className="text-[0.85rem] font-medium text-light">
            {multi && (
              <span className="mr-1 text-[0.6rem] font-normal text-light/40">
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
              className="-m-1 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-secondary/35 bg-secondary/10 text-secondary transition-transform active:scale-90"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryProductCard;
