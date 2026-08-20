import React from "react";
import { useProductsByCategory } from "@/hooks";
import SectionHeading from "@/components/SectionHeading";
import { getProductStyles } from "@/lib/productStyles";

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const variants = product.variants || [];
  const ringColor = styles.ringColor || "border-amber-400";

  return (
    <div className="frappe-card group relative h-full">
      <div className="fb-card fb-card--link fb-card--lift flex h-full flex-col items-center overflow-hidden p-6">

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

        {/* Badge proximamente */}
        {product.is_coming_soon && (
          <div className="absolute top-4 right-4 z-20">
            <span className="fb-pill text-[0.6rem] uppercase tracking-[0.2em]">
              Próximamente
            </span>
          </div>
        )}

        {/* Nombre del producto */}
        <div className="relative z-10 w-full flex flex-col items-center mb-3">
          <h3 className="font-display line-clamp-2 text-center text-[0.95rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
            {product.name}
          </h3>
          <span aria-hidden className="fb-rule mt-2.5" />
        </div>

        {/* Descripcion */}
        <p className="relative z-10 mb-5 max-w-[260px] text-center text-[0.78rem] leading-relaxed text-light/55">
          {product.description}
        </p>

        {/* Precios */}
        <div className="relative z-10 mt-auto w-full">
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/[0.06]">
            {variants.map((variant) => (
              <div key={variant.id || variant.name} className="flex flex-col items-center">
                <span className="mb-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-light/35">
                  {variant.name}
                </span>
                <span className="text-[0.95rem] font-medium text-light">
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="fb-card animate-pulse p-6">
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

const Frappes = () => {
  const { data, isLoading, error } = useProductsByCategory("frappes");
  const products = data?.results || [];

  return (
    <section
      id="frappes"
      className="fb-section py-16"
      style={{ "--fb-accent": "#f59e0b", "--fb-accent-2": "#f59e0b" }}
    >

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          eyebrow="Cremosos y helados"
          title="Frappés"
          description="Los mejores frappés en Cumbal. Cremosas y heladas creaciones que fusionan sabores clásicos con energía del futuro."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
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
                  styles={getProductStyles(product, "frappes")}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Frappes;
