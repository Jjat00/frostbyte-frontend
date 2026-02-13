import React from "react";
import { motion } from "framer-motion";
import { Citrus, Cherry, Sun } from "lucide-react";
import { useProductsByCategory } from "@/hooks";

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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/30 to-purple-900/30 flex items-center justify-center">
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
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
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
            <span className="text-2xl md:text-3xl font-black text-white">
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>
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

// Estilos específicos para Los Cuates (estilo vibrante tropical)
const cuatesStyles = {
  "cuates-limon": {
    icon: Citrus,
    gradient: "from-lime-400 to-green-500",
    image: "/cuates-limon.png",
    ringColor: "border-yellow-400",
    labelBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    priceButtonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    splashBg: "bg-lime-400",
    splash: true,
  },
  "cuates-fresa": {
    icon: Cherry,
    gradient: "from-pink-400 to-red-500",
    image: "/cuate-fresa.png",
    ringColor: "border-orange-400",
    labelBg: "bg-gradient-to-r from-red-500 to-red-600",
    priceButtonBg: "bg-gradient-to-r from-red-500 to-red-600",
    splashBg: "bg-pink-400",
    splash: true,
  },
  "cuates-mango": {
    icon: Sun,
    gradient: "from-yellow-400 to-orange-500",
    image: "/cuate-mango.png",
    ringColor: "border-yellow-400",
    labelBg: "bg-gradient-to-r from-lime-500 to-lime-600",
    priceButtonBg: "bg-gradient-to-r from-lime-500 to-lime-600",
    splashBg: "bg-yellow-400",
    splash: true,
  },
};

const getCuatesStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = cuatesStyles[slug] || {
    icon: Citrus,
    gradient: "from-lime-400 to-green-500",
    ringColor: "border-yellow-400",
    labelBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    priceButtonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
    splashBg: "bg-lime-400",
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
      className="py-20 relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900"
    >
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>

      {/* Efectos de luz ambiental */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full filter blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full filter blur-[120px]"></div>
      </div>

      {/* Líneas divisoras decorativas */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl uppercase tracking-wider">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              LOS CUATES
            </span>
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
