import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import SectionHeading from "@/components/SectionHeading";
import { ExtraOption } from "@/components/CartaExtras";
import { getProductStyles } from "@/lib/productStyles";

const flavorShots = [
  { name: "Porrito", detalle: "Tequila · Verde", price: "$5.000", icon: Droplets, gradient: "from-green-400 to-emerald-600" },
  { name: "Maracuyá", detalle: "Whisky · Amarillo", price: "$5.000", icon: Droplets, gradient: "from-yellow-300 to-amber-500" },
  { name: "Fresita", detalle: "Ron · Rojo", price: "$5.000", icon: Droplets, gradient: "from-red-400 to-rose-600" },
  { name: "Tentaxxion", detalle: "Vodka · Morado", price: "$5.000", icon: Droplets, gradient: "from-purple-400 to-fuchsia-600" },
];

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ShotCard = ({ shot, index, styles }) => {
  const Icon = styles.icon;
  const variants = shot.variants || [];
  const defaultVariant = variants.find(v => v.is_default) || variants[0];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative"
    >
      <div className="fb-card fb-card--link flex h-full flex-col overflow-hidden">
        <div className="h-40 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={shot.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${styles.gradient}`}></div>
          )}
        </div>

        <div className="p-6 flex flex-col grow relative z-20 -mt-8">
          <div
            className={`w-9 h-9 bg-linear-to-br ${styles.gradient} rounded-[11px] flex items-center justify-center mb-3.5 opacity-90`}
          >
            <Icon className="text-dark" size={17} />
          </div>
          <h3 className="font-display mb-1 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
            {shot.name}
          </h3>
          {styles.licor && (
            <p className="text-sm text-gray/70 mb-3">{styles.licor}</p>
          )}
          <p className="mb-4 grow text-[0.78rem] leading-relaxed text-light/55">{shot.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
            <span className="text-base font-medium text-light">
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="fb-card h-full overflow-hidden animate-pulse">
    <div className="h-40 bg-gray/20"></div>
    <div className="p-6 -mt-8">
      <div className="w-12 h-12 bg-gray/30 rounded-xl mb-4"></div>
      <div className="h-5 bg-gray/20 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-gray/20 rounded mb-3 w-1/2"></div>
      <div className="h-4 bg-gray/20 rounded mb-4 w-full"></div>
      <div className="h-8 bg-gray/20 rounded w-24 mt-4"></div>
    </div>
  </div>
);

const Shots = () => {
  const { data, isLoading, error } = useProductsByCategory("shots");

  const shots = data?.results || [];

  return (
    <section
      id="shots"
      className="fb-section py-16"
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          eyebrow="Para brindar"
          title="Shots"
          description="Shots en Cumbal: licores premium servidos puros. La mejor selección para brindar con estilo en Frostbyte."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {isLoading
            ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            : shots.map((shot, index) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  index={index}
                  styles={getProductStyles(shot, "shots")}
                />
              ))}
        </div>

        <div className="fb-card fb-reveal mt-14 overflow-hidden">
          <div className="relative h-48 overflow-hidden sm:h-64">
            <img
              src="/shots1.webp"
              alt="Shots de sabores Frostbyte"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/70 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="fb-eyebrow block">Sin licor</span>
              <h3 className="font-display m-0 mt-2.5 text-[1.1rem] font-semibold uppercase leading-none tracking-[0.14em] text-light sm:text-[1.35rem]">
                Shots de sabores
              </h3>
              <span aria-hidden className="fb-rule mt-3.5" />
              <p className="mt-3.5 max-w-md text-[0.78rem] leading-relaxed text-light/55">
                Explosiones de sabor concentrado. Elige tu favorito y dale un
                giro a tu experiencia.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch justify-center gap-3 p-6">
            {flavorShots.map((shot) => (
              <ExtraOption key={shot.name} {...shot} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shots;
