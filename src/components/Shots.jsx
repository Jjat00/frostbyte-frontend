import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

const flavorShots = [
  {
    name: "Porrito",
    flavor: "Verde",
    licor: "Tequila",
    price: "$5.000",
    gradient: "from-green-400 to-emerald-600",
    textColor: "text-green-400",
    borderColor: "border-green-500/40",
    glowColor: "rgba(74, 222, 128, 0.3)",
  },
  {
    name: "Maracuyá",
    flavor: "Amarillo",
    licor: "Whisky",
    price: "$5.000",
    gradient: "from-yellow-300 to-amber-500",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    glowColor: "rgba(250, 204, 21, 0.3)",
  },
  {
    name: "Fresita",
    flavor: "Rojo",
    licor: "Ron",
    price: "$5.000",
    gradient: "from-red-400 to-rose-600",
    textColor: "text-red-400",
    borderColor: "border-red-500/40",
    glowColor: "rgba(248, 113, 113, 0.3)",
  },
  {
    name: "Tentaxxion",
    flavor: "Morado",
    licor: "Vodka",
    price: "$5.000",
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/40",
    glowColor: "rgba(96, 165, 250, 0.3)",
  },
];

const FlavorShotCard = ({ shot }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.05 }}
    className={`group relative bg-dark/60 backdrop-blur-sm border ${shot.borderColor} rounded-2xl p-5 text-center cursor-default hover:shadow-lg transition-all duration-300`}
    style={{ "--glow": shot.glowColor }}
  >
    <div
      className={`w-14 h-14 bg-linear-to-br ${shot.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
    >
      <Droplets className="text-dark" size={26} />
    </div>
    <h4 className={`text-lg font-black ${shot.textColor} mb-1`}>
      {shot.name}
    </h4>
    <p className="text-gray/70 text-xs mb-1">{shot.licor}</p>
    <p className="text-gray text-xs uppercase tracking-wider font-semibold mb-2">
      {shot.flavor}
    </p>
    <span className={`${shot.textColor} font-bold text-sm`}>
      {shot.price}
    </span>
  </motion.div>
);

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
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative"
    >
      <div className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-gold/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(242,197,61,0.12)]">
        <div className="h-40 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={shot.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${styles.gradient}`}></div>
          )}
        </div>

        <div className="p-6 flex flex-col grow relative z-20 -mt-8">
          <div
            className={`w-12 h-12 bg-linear-to-br ${styles.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-dark" size={24} />
          </div>
          <h3 className="text-xl font-bold text-light mb-1 group-hover:text-gold transition-colors duration-300">
            {shot.name}
          </h3>
          {styles.licor && (
            <p className="text-sm text-gray/70 mb-3">{styles.licor}</p>
          )}
          <p className="text-gray mb-4 grow text-sm">{shot.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
            <span className="text-2xl font-bold text-grass">
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full animate-pulse">
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
    <section id="shots" className="py-20 relative overflow-hidden bg-dark">
      <Mundial26Backdrop />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Mundial 2026
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            <span className="text-gold">
              SHOTS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Shots en Cumbal: licores premium servidos puros. La mejor selección
            para brindar con estilo en Frostbyte.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
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

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20"
        >
          <div className="relative bg-linear-to-br from-dark-secondary/80 to-dark/80 border-2 border-gold/30 rounded-3xl overflow-hidden">
            <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
              <img
                src="/shots1.webp"
                alt="Shots de Sabores Frostbyte"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/60 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-gold/10 to-grass/10" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="text-gold" size={28} />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light">
                    SHOTS DE{" "}
                    <span className="text-gold">
                      SABORES
                    </span>
                  </h3>
                </div>
                <p className="text-gray text-sm sm:text-base max-w-xl">
                  Explosiones de sabor concentrado. Elige tu favorito y
                  dale un twist único a tu experiencia.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flavorShots.map((shot, index) => (
                  <FlavorShotCard key={shot.name} shot={shot} index={index} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Shots;
