import React from "react";
import { motion } from "framer-motion";
import {
  Wine,
  GlassWater,
  PartyPopper,
  Martini,
  Citrus,
  Palmtree,
  Skull,
  Clock,
} from "lucide-react";
import { useProductsByCategory } from "@/hooks";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
  const variants = product.variants || [];
  const suaveVariant = variants.find((v) => v.name === "Suave");
  const cargadoVariant = variants.find((v) => v.name === "Cargado");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className={`group relative ${product.is_coming_soon ? "opacity-60" : ""}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Círculo con anillo dorado */}
        <div className="relative mb-4 lg:mb-6 xl:mb-8">
          {/* Anillo exterior dorado */}
          <div className={`absolute inset-0 rounded-full border-2 md:border-4 lg:border-[6px] xl:border-[8px] ${styles.ringColor || 'border-green-400'} shadow-2xl`}></div>
          {/* Anillo interior */}
          <div className={`absolute inset-1 md:inset-2 lg:inset-4 xl:inset-5 rounded-full border md:border-2 lg:border-[4px] xl:border-[5px] ${styles.ringColor || 'border-green-400'} opacity-60`}></div>
          
          {/* Contenedor de imagen circular */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/30 to-purple-900/30 flex items-center justify-center">
            {product.is_coming_soon && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <span className="bg-primary/90 text-dark font-bold px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  <Clock size={14} /> Próximamente
                </span>
              </div>
            )}
            {styles.image ? (
              <img
                alt={product.name}
                className="w-full h-full object-contain scale-90 transition-transform duration-500 group-hover:scale-100 drop-shadow-2xl"
                src={styles.image}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`}></div>
            )}
          </div>

          {/* Splash decorativo */}
          {styles.splash && !product.is_coming_soon && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
            >
              <div className={`w-full h-full rounded-full ${styles.splashBg || 'bg-green-400'} opacity-80 blur-sm`}></div>
            </motion.div>
          )}
        </div>

        {/* Contenido del producto */}
        <div className="text-center space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5">
          {/* Nombre del producto */}
          <div className={`inline-block px-4 py-2 md:px-7 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5 ${styles.labelBg || 'bg-gradient-to-r from-green-500 to-emerald-600'} rounded-lg shadow-lg`}>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white uppercase tracking-wider">
              {product.name}
            </h3>
          </div>

          {/* Descripción */}
          <div className="px-2 md:px-4">
            <p className="text-white font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-0.5">
              {product.description?.split(' ').slice(0, 3).join(' ') || 'Delicioso cóctel'}
            </p>
            {styles.liquor && (
              <p className="text-xs text-white/80 uppercase tracking-wide">
                Base: {styles.liquor}
              </p>
            )}
          </div>

          {/* Precios */}
          {suaveVariant && cargadoVariant ? (
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
              <div className={`inline-block px-4 py-2 md:px-7 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5 ${styles.priceButtonBg || 'bg-gradient-to-r from-green-500 to-emerald-600'} rounded-full shadow-xl transform transition-all duration-300 group-hover:scale-110`}>
                <span className="text-xs md:text-sm text-white/80 block">Suave</span>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white">
                  {formatPrice(suaveVariant.price)}
                </span>
              </div>
              <div className={`inline-block px-4 py-2 md:px-7 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5 ${styles.priceButtonBg || 'bg-gradient-to-r from-green-500 to-emerald-600'} rounded-full shadow-xl transform transition-all duration-300 group-hover:scale-110`}>
                <span className="text-xs md:text-sm text-white/80 block">Cargado</span>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white">
                  {formatPrice(cargadoVariant.price)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    {/* Círculo con anillo */}
    <div className="relative mb-4 lg:mb-6 xl:mb-8">
      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full bg-white/10 border-2 md:border-4 lg:border-[6px] xl:border-[8px] border-white/20"></div>
    </div>
    {/* Contenido */}
    <div className="text-center space-y-1.5 md:space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 w-full">
      <div className="h-10 md:h-12 lg:h-16 xl:h-20 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
      <div className="h-4 md:h-5 lg:h-6 xl:h-8 bg-white/10 rounded w-full mx-auto"></div>
      <div className="flex gap-2 justify-center mt-4">
        <div className="h-12 bg-white/10 rounded-full w-28"></div>
        <div className="h-12 bg-white/10 rounded-full w-28"></div>
      </div>
    </div>
  </div>
);

// Estilos específicos para cócteles
const coctelesStyles = {
  mojito: {
    icon: GlassWater,
    gradient: "from-green-400 to-emerald-600",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1652780093319-559c3b12225a",
    ringColor: "border-green-400",
    labelBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    priceButtonBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    splashBg: "bg-green-400",
    splash: true,
  },
  margarita: {
    icon: Martini,
    gradient: "from-lime-300 to-yellow-400",
    liquor: "Tequila JOSE CUERVO",
    image: "https://images.unsplash.com/photo-1700909592926-c07b0c2a0bed",
    ringColor: "border-lime-400",
    labelBg: "bg-gradient-to-r from-lime-500 to-yellow-600",
    priceButtonBg: "bg-gradient-to-r from-lime-500 to-yellow-600",
    splashBg: "bg-lime-400",
    splash: true,
  },
  margarota: {
    icon: PartyPopper,
    gradient: "from-yellow-400 to-amber-500",
    liquor: "Tequila JOSE CUERVO",
    image: "./margarota.jpeg",
    ringColor: "border-yellow-400",
    labelBg: "bg-gradient-to-r from-yellow-500 to-amber-600",
    priceButtonBg: "bg-gradient-to-r from-yellow-500 to-amber-600",
    splashBg: "bg-yellow-400",
    splash: true,
  },
  caipiroshka: {
    icon: Citrus,
    gradient: "from-lime-500 to-green-700",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1581284744588-af12206e90db",
    ringColor: "border-lime-400",
    labelBg: "bg-gradient-to-r from-lime-500 to-green-700",
    priceButtonBg: "bg-gradient-to-r from-lime-500 to-green-700",
    splashBg: "bg-lime-400",
    splash: true,
  },
  "cuba-libre": {
    icon: Skull,
    gradient: "from-red-900 to-black",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1665940487849-abe2980c05ab",
    ringColor: "border-red-500",
    labelBg: "bg-gradient-to-r from-red-700 to-black",
    priceButtonBg: "bg-gradient-to-r from-red-700 to-black",
    splashBg: "bg-red-500",
    splash: true,
  },
  gintonic: {
    icon: Wine,
    gradient: "from-purple-400 to-indigo-600",
    liquor: "Ginebra BEEFEATER",
    image: "/shutterstock-1504207547.jpg",
    ringColor: "border-purple-400",
    labelBg: "bg-gradient-to-r from-purple-500 to-indigo-600",
    priceButtonBg: "bg-gradient-to-r from-purple-500 to-indigo-600",
    splashBg: "bg-purple-400",
    splash: true,
  },
  "moscow-mule": {
    icon: GlassWater,
    gradient: "from-amber-200 to-orange-300",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1527628126150-086ff233b951",
    ringColor: "border-amber-400",
    labelBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    priceButtonBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    splashBg: "bg-amber-400",
    splash: true,
  },
  "blue-long": {
    icon: Palmtree,
    gradient: "from-blue-400 to-cyan-600",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1682629906883-76eaa5e03693",
    ringColor: "border-cyan-400",
    labelBg: "bg-gradient-to-r from-blue-500 to-cyan-600",
    priceButtonBg: "bg-gradient-to-r from-blue-500 to-cyan-600",
    splashBg: "bg-cyan-400",
    splash: true,
  },
};

const getCoctelStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = coctelesStyles[slug] || {
    icon: Martini,
    gradient: "from-green-400 to-emerald-600",
    ringColor: "border-green-400",
    labelBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    priceButtonBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    splashBg: "bg-green-400",
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

const Mocktails = () => {
  const { data, isLoading, error } = useProductsByCategory("mocktails");

  const products = data?.results || [];

  return (
    <section 
      id="mocktails" 
      className="py-20 relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900"
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
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full filter blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400 rounded-full filter blur-[120px]"></div>
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl uppercase tracking-wider">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
              CÓCTELES
            </span>
          </h2>
          <p className="text-white text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-semibold drop-shadow-lg">
            Bebidas clásicas y creaciones de la casa para elevar tu espíritu.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-red-300">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 max-w-7xl mx-auto">
          {isLoading
            ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getCoctelStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Mocktails;
