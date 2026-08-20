import React from "react";
import { Martini, Wine, Flame, Citrus, Anchor, Droplets } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";
import SectionHeading from "@/components/SectionHeading";
import ExtrasBlock from "@/components/CartaExtras";

/**
 * Granizados: la sección insignia de la carta.
 *
 * El 2026-08-20 pasó al lenguaje visual del hero (ver `minimal.css`). Con ese
 * cambio se fueron tres piezas que eran puro coste: el canvas interactivo de
 * la rejilla (un `requestAnimationFrame` permanente con el ratón encima), el
 * filtro SVG de "vidrio grueso" (`backdrop-filter: url(#thick-glass)`, lo más
 * caro que había en la página) y los tres orbes de `blur-[120px]`. El hero ya
 * había retirado su propio canvas por lo mismo.
 *
 * El azul de la sección sobrevive donde importa: en el chip del producto y en
 * el hilo bajo cada nombre.
 */

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, styles }) => {
  const variants = product.variants || [];
  const ringColor = styles.ringColor || "border-cyan-400";

  return (
    <div className="group relative h-full">
      <div className="fb-card fb-card--link fb-card--lift flex h-full flex-col items-center overflow-hidden p-6">
        {/* Imagen del producto */}
        <div className="relative z-10 mb-5 shrink-0">
          {styles.image ? (
            <div className="relative flex h-52 w-52 items-center justify-center md:h-56 md:w-56">
              <img
                alt={product.name}
                className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105"
                src={styles.image}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative h-52 w-52 overflow-hidden rounded-full md:h-56 md:w-56">
              <div
                className={`absolute inset-0 rounded-full border-2 ${ringColor} opacity-40`}
              />
              <div
                className={`h-full w-full bg-linear-to-br ${styles.visualGradient || styles.gradient} opacity-80`}
              />
            </div>
          )}
        </div>

        {/* Nombre */}
        <div className="relative z-10 mb-3 flex w-full flex-col items-center">
          <h3 className="font-display line-clamp-2 text-center text-[0.95rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
            {product.name}
          </h3>
          <span aria-hidden className="fb-rule mt-2.5" />
        </div>

        <p className="relative z-10 mb-5 max-w-[260px] text-center text-[0.78rem] leading-relaxed text-light/55">
          {product.description}
        </p>

        {/* Precios */}
        <div className="relative z-10 mt-auto w-full">
          <div className="flex items-center justify-center gap-5 border-t border-white/[0.06] pt-3">
            {variants.map((variant) => (
              <div
                key={variant.id || variant.name}
                className="flex flex-col items-center"
              >
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
    <div className="flex h-full flex-col items-center">
      <div className="mb-5 h-52 w-52 shrink-0 rounded-full bg-white/[0.05] md:h-56 md:w-56" />
      <div className="mb-3 h-4 w-3/4 rounded bg-white/[0.06]" />
      <div className="mb-2 h-3 w-full max-w-[220px] rounded bg-white/[0.04]" />
      <div className="mb-5 h-3 w-2/3 max-w-[180px] rounded bg-white/[0.04]" />
      <div className="mt-auto flex w-full justify-center gap-5 border-t border-white/[0.06] pt-3">
        <div className="h-8 w-16 rounded bg-white/[0.05]" />
        <div className="h-8 w-16 rounded bg-white/[0.05]" />
      </div>
    </div>
  </div>
);

// Los degradados de estos extras son identidad del licor y del sabor (color
// de contenido, no de marca): sobreviven, pero reducidos al chip del icono.
const poisonShots = [
  { name: "Ginebra", detalle: "Beefeater", price: "+$20.000", icon: Martini, gradient: "from-blue-400 to-blue-600" },
  { name: "Vodka", detalle: "Absolut", price: "+$10.000", icon: Wine, gradient: "from-sky-300 to-sky-500" },
  { name: "Whisky", detalle: "Jack Daniels", price: "+$12.000", icon: Flame, gradient: "from-amber-500 to-amber-700" },
  { name: "Tequila", detalle: "Jose Cuervo", price: "+$9.000", icon: Citrus, gradient: "from-yellow-400 to-orange-500" },
  { name: "Ron", detalle: "Bacardi", price: "+$6.000", icon: Anchor, gradient: "from-red-500 to-red-700" },
  { name: "Aguardiente", detalle: "Nariño Premium", price: "+$5.000", icon: Flame, gradient: "from-slate-400 to-slate-600" },
];

const flavorShots = [
  { name: "Porrito", detalle: "Tequila · Verde", price: "+$5.000", icon: Droplets, gradient: "from-green-400 to-emerald-600" },
  { name: "Maracuyá", detalle: "Whisky · Amarillo", price: "+$5.000", icon: Droplets, gradient: "from-yellow-300 to-amber-500" },
  { name: "Fresita", detalle: "Ron · Rojo", price: "+$5.000", icon: Droplets, gradient: "from-red-400 to-rose-600" },
  { name: "Tentaxxion", detalle: "Vodka · Morado", price: "+$5.000", icon: Droplets, gradient: "from-purple-400 to-fuchsia-600" },
];

const Granizados = ({ showExtras = true }) => {
  const { data, isLoading, error } = useProductsByCategory("granizados");
  const products = data?.results || [];

  return (
    <section id="granizados" className="fb-section py-16">
      <div className="container relative z-10 mx-auto px-4">
        <SectionHeading
          eyebrow="Hielo y fruta"
          title="Granizados"
          description="Los mejores granizados en Cumbal. Hielo triturado a la perfección con los sabores frutales más intensos de Nariño."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
            Error al cargar los productos. Por favor intenta de nuevo.
          </div>
        )}

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  styles={getProductStyles(product, "granizados")}
                />
              ))}
        </div>

        {showExtras && (
          <>
            <ExtrasBlock
              eyebrow="Con licor"
              title="¿Quieres envenenarlo?"
              description="Agrega un shot de tu licor favorito a cualquier granizado y llévalo al siguiente nivel."
              options={poisonShots}
              formula={["Granizado", "Shot", "Envenenado"]}
            />
            <ExtrasBlock
              eyebrow="Sin licor"
              title="Shots de sabores"
              description="Dale un toque extra de sabor a tu granizado con nuestros shots especiales."
              options={flavorShots}
              formula={["Granizado", "Shot de sabor", "Sabor único"]}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Granizados;
