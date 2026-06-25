import React from "react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";
import CardOrderButtons from "@/components/cart/CardOrderButtons";

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const variants = product.variants || [];
  const ringColor = styles.ringColor || "border-grass";

  return (
    <div className="lulada-card group relative h-full">
      <div className="relative flex flex-col items-center h-full rounded-3xl p-6 overflow-hidden bg-white/[0.02] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-500 hover:bg-white/[0.08] hover:border-grass/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.2),0_0_50px_rgba(30,158,90,0.12)]">
        {/* Blur de fondo */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        {/* Reflejo especular superior */}
        <div
          className="absolute top-0 inset-x-0 h-1/2 rounded-t-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 40%, transparent 100%)",
          }}
        />

        {/* Brillo en borde superior */}
        <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Imagen del producto */}
        <div className="relative mb-5 shrink-0 z-10">
          {styles.image ? (
            <div className="relative w-52 h-52 md:w-56 md:h-56 flex items-center justify-center">
              <img
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                src={styles.image}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative w-52 h-52 md:w-56 md:h-56 rounded-full overflow-hidden">
              <div
                className={`absolute inset-0 rounded-full border-2 ${ringColor} opacity-40`}
              ></div>
              <div
                className={`w-full h-full bg-linear-to-br ${styles.visualGradient || styles.gradient} opacity-80`}
              ></div>
            </div>
          )}
        </div>

        {/* Nombre del producto */}
        <div className="relative z-10 w-full flex flex-col items-center mb-3">
          <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider text-center line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <div className="w-10 h-0.5 bg-linear-to-r from-gold to-grass rounded-full mt-2"></div>
        </div>

        {/* Descripcion */}
        <p className="relative z-10 text-gray text-sm text-center mb-5 leading-relaxed max-w-[260px]">
          {product.description}
        </p>

        {/* Precios */}
        <div className="relative z-10 mt-auto w-full">
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/[0.08]">
            {variants.map((variant) => (
              <div key={variant.id || variant.name} className="flex flex-col items-center">
                <span className="text-[11px] text-gray uppercase font-semibold tracking-widest mb-0.5">
                  {variant.name}
                </span>
                <span className="text-lg font-black text-gold">
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Pedir desde la tarjeta */}
          <CardOrderButtons product={product} />
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white/4 border border-white/8 rounded-3xl p-6 animate-pulse">
    <div className="flex flex-col items-center h-full">
      <div className="relative mb-5 shrink-0">
        <div className="w-52 h-52 md:w-56 md:h-56 rounded-full bg-white/6"></div>
      </div>
      <div className="w-full flex flex-col items-center mb-3">
        <div className="h-5 bg-white/8 rounded-lg w-3/4 mb-2"></div>
        <div className="w-10 h-0.5 bg-white/6 rounded-full"></div>
      </div>
      <div className="h-4 bg-white/6 rounded w-full max-w-[220px] mb-2"></div>
      <div className="h-4 bg-white/6 rounded w-2/3 max-w-[180px] mb-5"></div>
      <div className="mt-auto w-full pt-3 border-t border-white/6">
        <div className="flex justify-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 bg-white/6 rounded w-12"></div>
            <div className="h-5 bg-white/8 rounded w-16"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 bg-white/6 rounded w-12"></div>
            <div className="h-5 bg-white/8 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Luladas = ({ showExtras = true }) => {
  const { data, isLoading, error } = useProductsByCategory("luladas");
  const products = data?.results || [];

  return (
    <section
      id="luladas"
      className="py-20 relative overflow-hidden bg-dark"
    >
      {/* Capa decorativa Sistema 26 (afiche Mundial, ligera en GPU) */}
      <Mundial26Backdrop />

      {/* Lineas divisoras */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-grass/40 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Frescura tropical
          </span>
          <h2 className="lulada-title text-4xl md:text-6xl font-black mb-4">
            <span className="text-gold">
              LULADAS
            </span>
          </h2>
          <p className="lulada-subtitle text-white text-lg max-w-2xl mx-auto font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Refrescantes luladas con el mejor lulo de Nariño.
            Frescura tropical en cada sorbo.
          </p>
        </div>

        {error && (
          <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-red-300">
            Error al cargar los productos. Por favor intenta de nuevo.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 max-w-7xl mx-auto items-stretch">
          {isLoading
            ? [...Array(3)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getProductStyles(product, "luladas")}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Luladas;
