import React from "react";
import { motion } from "framer-motion";
import { Citrus, Cherry, Sun } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const variants = product.variants || [];
  const defaultVariant = variants.find((v) => v.is_default) || variants[0];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="group relative"
    >
      <div className="relative flex flex-col items-center">
        {/* Círculo con anillo dorado */}
        <div className="relative mb-4">
          {/* Anillo exterior dorado */}
          <div className={`absolute inset-0 rounded-full border-4 ${styles.ringColor} shadow-2xl`}></div>
          {/* Anillo interior */}
          <div className={`absolute inset-2 rounded-full border-2 ${styles.ringColor} opacity-60`}></div>
          
          {/* Contenedor de imagen circular */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-gradient-to-br from-grass/25 to-dark-secondary/40 flex items-center justify-center">
            {styles.image ? (
              <img
                alt={product.name}
                className="w-full h-full object-contain scale-90 transition-transform duration-500 group-hover:scale-100 drop-shadow-2xl"
                src={styles.image}
                loading="lazy"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`}></div>
            )}
          </div>

          {/* Splash de ingrediente decorativo */}
          {styles.splash && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute -bottom-2 -right-2 w-16 h-16"
            >
              <div className={`w-full h-full rounded-full ${styles.splashBg} opacity-80 blur-sm`}></div>
            </motion.div>
          )}
        </div>

        {/* Contenido del producto */}
        <div className="text-center space-y-2">
          {/* Nombre del producto */}
          <div className={`inline-block px-6 py-2 ${styles.labelBg} rounded-lg shadow-lg`}>
            <h3 className={`text-2xl md:text-3xl font-black ${styles.labelText} uppercase tracking-wider`}>
              {product.name}
            </h3>
          </div>

          {/* Descripción */}
          <div className="px-4">
            <p className="text-white font-semibold text-sm md:text-base mb-1">
              {product.description?.split(' ').slice(0, 3).join(' ') || 'Delicioso cóctel'}
            </p>
            <p className="text-white/90 text-xs md:text-sm uppercase tracking-wide">
              {defaultVariant?.name || 'Coco/Ron'}
            </p>
          </div>

          {/* Precio */}
          <div className={`inline-block px-8 py-3 ${styles.priceButtonBg} rounded-full shadow-xl transform transition-all duration-300 group-hover:scale-110`}>
            <span className={`text-2xl md:text-3xl font-black ${styles.priceText}`}>
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>

          {/* Pedir desde la tarjeta */}
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    {/* Círculo con anillo */}
    <div className="relative mb-4">
      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/10 border-4 border-white/20"></div>
    </div>
    {/* Contenido */}
    <div className="text-center space-y-2 w-full">
      <div className="h-10 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
      <div className="h-4 bg-white/10 rounded w-full mx-auto"></div>
      <div className="h-4 bg-white/10 rounded w-2/3 mx-auto"></div>
      <div className="h-12 bg-white/10 rounded-full w-32 mx-auto mt-4"></div>
    </div>
  </div>
);

// Estilos específicos para Los Cuates (Sistema 26 — afiche Mundial: verde/oro
// con acentos de póster FIFA). Anillo dorado, etiqueta oro (texto oscuro) y
// botón de precio en acento de afiche (texto claro).
const cuatesStyles = {
  "cuates-limon": {
    icon: Citrus,
    gradient: "from-grass to-green-600",
    image: "/cuates-limon.webp",
    ringColor: "border-gold",
    labelBg: "bg-gold",
    labelText: "text-dark",
    priceButtonBg: "bg-grass",
    priceText: "text-dark",
    splashBg: "bg-grass",
    splash: true,
  },
  "cuates-fresa": {
    icon: Cherry,
    gradient: "from-red-500 to-red-700",
    image: "/cuate-fresa.webp",
    ringColor: "border-gold",
    labelBg: "bg-gold",
    labelText: "text-dark",
    priceButtonBg: "bg-red-600",
    priceText: "text-white",
    splashBg: "bg-red-500",
    splash: true,
  },
  "cuates-mango": {
    icon: Sun,
    gradient: "from-gold to-grass",
    image: "/cuate-mango.webp",
    ringColor: "border-gold",
    labelBg: "bg-gold",
    labelText: "text-dark",
    priceButtonBg: "bg-blue-600",
    priceText: "text-white",
    splashBg: "bg-gold",
    splash: true,
  },
};

const getCuatesStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = cuatesStyles[slug] || {
    icon: Citrus,
    gradient: "from-grass to-green-600",
    ringColor: "border-gold",
    labelBg: "bg-gold",
    labelText: "text-dark",
    priceButtonBg: "bg-grass",
    priceText: "text-dark",
    splashBg: "bg-grass",
    splash: true,
  };

  // Priorizar image_url de la API sobre estilos locales
  return {
    ...localStyles,
    image: product.image_url && product.image_url.trim() !== ''
      ? product.image_url
      : localStyles.image
  };
};

const Cuates = () => {
  const { data, isLoading, error } = useProductsByCategory("cuates");

  const products = data?.results || [];

  return (
    <section
      id="cuates"
      className="py-20 relative overflow-hidden bg-dark"
    >
      {/* Capa decorativa Sistema 26 (afiche Mundial sutil + patrón modular + "26") */}
      <Mundial26Backdrop />

      {/* Líneas divisoras decorativas */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Edición Mundial 2026
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-gold mb-4 uppercase tracking-wider">
            LOS CUATES
          </h2>
          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-semibold drop-shadow-lg">
            Cuates en Cumbal: cocteles listos con auténtico tequila mexicano.
            Refrescantes y perfectos para cualquier ocasión en Frostbyte.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-red-300">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 max-w-7xl mx-auto">
          {isLoading
            ? [...Array(3)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getCuatesStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Cuates;
