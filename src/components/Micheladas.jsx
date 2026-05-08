import React from "react";
import { motion } from "framer-motion";
import {
  Skull,
  Plus,
  Martini,
  Wine,
  Flame,
  Citrus,
  Anchor,
} from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
  const variants = product.variants || [];
  const defaultVariant = variants.find(v => v.is_default) || variants[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-rose-500/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(244,114,182,0.1)]">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-linear-to-br ${styles.gradient}`}></div>
          )}
        </div>

        <div className="p-6 flex flex-col grow relative z-20 -mt-12">
          <div
            className={`w-12 h-12 bg-linear-to-br ${styles.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-dark" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-rose-400 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray mb-4 grow text-sm">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
            <span className="text-2xl font-bold bg-linear-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
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
    <div className="h-48 bg-gray/20"></div>
    <div className="p-6 -mt-12">
      <div className="w-12 h-12 bg-gray/30 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray/20 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray/20 rounded mb-4 w-full"></div>
      <div className="h-8 bg-gray/20 rounded w-24 mt-4"></div>
    </div>
  </div>
);

const PoisonOption = ({ name, brand, price, icon: Icon, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="w-[calc(50%-6px)] sm:w-[140px] lg:w-[160px] bg-dark/60 border border-rose-500/30 rounded-2xl p-4 text-center cursor-pointer hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
  >
    <div
      className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
    >
      <Icon className="text-dark" size={24} />
    </div>
    <h4 className="text-light font-bold text-base">{name}</h4>
    <p className="text-gray text-xs mb-2">{brand}</p>
    <span className="text-rose-400 font-bold text-sm">{price}</span>
  </motion.div>
);

// Datos de shots para envenenar (estos podrían venir de la API también)
const poisonShots = [
  {
    name: "Ginebra",
    brand: "Beefeater",
    price: "+$20.000",
    icon: Martini,
    gradient: "from-pink-400 to-pink-600",
  },
  {
    name: "Vodka",
    brand: "Absolut",
    price: "+$10.000",
    icon: Wine,
    gradient: "from-pink-300 to-pink-500",
  },
  {
    name: "Whisky",
    brand: "Jack Daniels",
    price: "+$12.000",
    icon: Flame,
    gradient: "from-rose-500 to-rose-700",
  },
  {
    name: "Tequila",
    brand: "Jose Cuervo",
    price: "+$9.000",
    icon: Citrus,
    gradient: "from-fuchsia-400 to-rose-500",
  },
  {
    name: "Ron",
    brand: "Bacardi",
    price: "+$6.000",
    icon: Anchor,
    gradient: "from-rose-500 to-rose-700",
  },
  {
    name: "Aguardiente",
    brand: "Nariño Premium",
    price: "+$5.000",
    icon: Flame,
    gradient: "from-slate-400 to-slate-600",
  },
];

const Micheladas = () => {
  const { data, isLoading, error } = useProductsByCategory("micheladas");

  const products = data?.results || [];

  return (
    <section
      id="micheladas"
      className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, rgba(13,13,26,0.95), rgba(10,10,20,0.95))" }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-500 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500 rounded-full filter blur-[100px]"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            <span className="bg-linear-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              MICHELADAS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Micheladas en Cumbal: la combinación perfecta de cerveza, limón,
            salsas y especias. ¡Refrescante y picante!
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {isLoading
            ? [...Array(3)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getProductStyles(product, "micheladas")}
                />
              ))}
        </div>

        {/* Sección Envenenar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="bg-linear-to-br from-rose-900/30 to-pink-900/30 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full filter blur-[80px]"></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Skull
                    className="text-rose-400 hidden sm:block"
                    size={32}
                  />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light text-center">
                    ¿QUIERES{" "}
                    <span className="bg-linear-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                      ENVENENARLA
                    </span>
                    ?
                  </h3>
                  <Skull
                    className="text-rose-400 hidden sm:block"
                    size={32}
                  />
                </div>
                <p className="text-gray text-base sm:text-lg max-w-2xl mx-auto">
                  Agrega un shot de tu licor favorito a cualquier michelada y
                  llévala al siguiente nivel 🔥
                </p>
              </div>

              {/* Shots disponibles */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mx-auto max-w-full">
                {poisonShots.map((shot) => (
                  <PoisonOption key={shot.name} {...shot} />
                ))}
              </div>

              {/* Ejemplo visual */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-rose-500/30">
                  <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                    🍺 Michelada
                  </span>
                  <Plus className="text-rose-400 flex-shrink-0" size={20} />
                  <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                    🥃 Shot
                  </span>
                  <span className="text-rose-400 text-xl sm:text-2xl flex-shrink-0">=</span>
                  <span className="text-rose-400 font-bold text-sm sm:text-base whitespace-nowrap">
                    ☠️ ENVENENADA
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Micheladas;
