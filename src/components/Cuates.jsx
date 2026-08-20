import React from "react";
import { useProductsByCategory } from "@/hooks";
import SectionHeading from "@/components/SectionHeading";

/**
 * Los Cuates: cócteles listos con tequila.
 *
 * Era la sección más ruidosa de la carta — fondo morado sólido, patrón de
 * cruces, tres orbes de blur, anillos dorados de 4 px, el nombre dentro de un
 * bloque naranja y el precio dentro de otro. El 2026-08-20 pasó al lenguaje
 * del hero: el producto se sostiene con su foto, un anillo fino y tipografía.
 * El morado queda como velo del fondo, que es donde el color no estorba.
 */

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

// Identidad de cada cuate: su foto y el degradado del sabor (color de
// contenido). Los anillos y bloques de color anteriores no se conservan.
const cuatesStyles = {
  "cuates-limon": { gradient: "from-lime-400 to-green-500", image: "/cuates-limon.webp" },
  "cuates-fresa": { gradient: "from-pink-400 to-red-500", image: "/cuate-fresa.webp" },
  "cuates-mango": { gradient: "from-yellow-400 to-orange-500", image: "/cuate-mango.webp" },
};

const getCuatesStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = cuatesStyles[slug] || {
    gradient: "from-lime-400 to-green-500",
  };

  // Priorizar image_url de la API sobre estilos locales
  return {
    ...localStyles,
    image:
      product.image_url && product.image_url.trim() !== ""
        ? product.image_url
        : localStyles.image,
  };
};

const ProductCard = ({ product, styles }) => {
  const variants = product.variants || [];
  const defaultVariant = variants.find((v) => v.is_default) || variants[0];

  return (
    <div className="fb-card fb-card--link fb-card--lift group flex h-full flex-col items-center p-6 text-center">
      {/* Foto en círculo, con un anillo fino del color del sabor */}
      <div className="relative mb-5 h-40 w-40 md:h-44 md:w-44">
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full bg-linear-to-br ${styles.gradient} opacity-20`}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-white/[0.12]"
        />
        {styles.image ? (
          <img
            alt={product.name}
            className="relative h-full w-full scale-90 object-contain drop-shadow-[0_10px_26px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-95"
            src={styles.image}
            loading="lazy"
          />
        ) : (
          <span
            className={`absolute inset-2 rounded-full bg-linear-to-br ${styles.gradient} opacity-70`}
          />
        )}
      </div>

      <h3 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
        {product.name}
      </h3>
      <span aria-hidden className="fb-rule mx-auto mt-2.5" />

      <p className="mt-3.5 text-[0.78rem] leading-relaxed text-light/55">
        {product.description}
      </p>

      <div className="mt-auto w-full border-t border-white/[0.06] pt-4">
        <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-light/35">
          {defaultVariant?.name || "Coco / Ron"}
        </span>
        <span className="mt-1 block text-base font-medium text-light">
          {formatPrice(defaultVariant?.price)}
        </span>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="fb-card animate-pulse p-6">
    <div className="flex flex-col items-center">
      <div className="mb-5 h-40 w-40 rounded-full bg-white/[0.05] md:h-44 md:w-44" />
      <div className="mb-3 h-4 w-3/4 rounded bg-white/[0.06]" />
      <div className="mb-2 h-3 w-full rounded bg-white/[0.04]" />
      <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
      <div className="mt-6 h-8 w-24 rounded bg-white/[0.05]" />
    </div>
  </div>
);

const Cuates = () => {
  const { data, isLoading, error } = useProductsByCategory("cuates");

  const products = data?.results || [];

  return (
    <section
      id="cuates"
      className="fb-section py-16"
      style={{ "--fb-accent": "#a855f7", "--fb-accent-2": "#f59e0b" }}
    >
      <div className="container relative z-10 mx-auto px-4">
        <SectionHeading
          eyebrow="Tequila mexicano"
          title="Los Cuates"
          description="Cuates en Cumbal: cócteles listos con auténtico tequila mexicano. Refrescantes y perfectos para cualquier ocasión en Frostbyte."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
            Error al cargar los productos.
          </div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [...Array(3)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  styles={getCuatesStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Cuates;
