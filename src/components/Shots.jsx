import React from "react";
import { motion } from "framer-motion";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="group relative"
    >
      <div className="relative flex flex-col items-center">
        {/* Círculo con anillo dorado */}
        <div className="relative mb-3 md:mb-4 lg:mb-6 xl:mb-8">
          {/* Anillo exterior dorado */}
          <div className={`absolute inset-0 rounded-full border-2 md:border-3 lg:border-[5px] xl:border-[6px] ${styles.ringColor || 'border-amber-400'} shadow-2xl`}></div>
          {/* Anillo interior */}
          <div className={`absolute inset-1 md:inset-1.5 lg:inset-3 xl:inset-4 rounded-full border md:border-2 lg:border-[4px] xl:border-[5px] ${styles.ringColor || 'border-amber-400'} opacity-60`}></div>
          
          {/* Contenedor de imagen circular */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-60 xl:h-60 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/30 to-purple-900/30 flex items-center justify-center">
            {styles.image ? (
              <img
                alt={shot.name}
                className="w-full h-full object-contain scale-90 transition-transform duration-500 group-hover:scale-100 drop-shadow-2xl"
                src={styles.image}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`}></div>
            )}
          </div>

          {/* Splash decorativo */}
          {styles.splash && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12"
            >
              <div className={`w-full h-full rounded-full ${styles.splashBg || 'bg-amber-400'} opacity-80 blur-sm`}></div>
            </motion.div>
          )}
        </div>

        {/* Contenido del producto */}
        <div className="text-center space-y-1.5 md:space-y-2 lg:space-y-3 xl:space-y-4">
          {/* Nombre del producto */}
          <div className={`inline-block px-2 py-1 md:px-4 md:py-2 ${styles.labelBg || 'bg-gradient-to-r from-amber-500 to-yellow-600'} rounded-lg shadow-lg`}>
            <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-black text-white uppercase tracking-wider">
              {shot.name}
            </h3>
          </div>

          {/* Licor/Marca */}
          {styles.licor && (
            <div className="px-1 md:px-2">
              <p className="text-white/80 text-xs uppercase tracking-wide">
                {styles.licor}
              </p>
            </div>
          )}

          {/* Descripción */}
          {shot.description && (
            <div className="px-2 md:px-4">
              <p className="text-white/70 text-xs hidden md:block">
                {shot.description?.split(' ').slice(0, 4).join(' ')}
              </p>
            </div>
          )}

          {/* Precio */}
          <div className={`inline-block px-3 py-1.5 md:px-6 md:py-2 ${styles.priceButtonBg || 'bg-gradient-to-r from-amber-500 to-yellow-600'} rounded-full shadow-xl transform transition-all duration-300 group-hover:scale-110`}>
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white">
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
    <div className="relative mb-3 md:mb-4 lg:mb-6 xl:mb-8">
      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-60 xl:h-60 rounded-full bg-white/10 border-2 md:border-3 lg:border-[5px] xl:border-[6px] border-white/20"></div>
    </div>
    {/* Contenido */}
    <div className="text-center space-y-1.5 md:space-y-2 lg:space-y-3 xl:space-y-4 w-full">
      <div className="h-8 md:h-10 lg:h-14 xl:h-16 bg-white/10 rounded-lg w-3/4 mx-auto"></div>
      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
      <div className="h-10 md:h-12 lg:h-16 xl:h-20 bg-white/10 rounded-full w-24 md:w-32 lg:w-40 xl:w-48 mx-auto mt-2 md:mt-3"></div>
    </div>
  </div>
);

// Estilos específicos para shots
const getShotStyles = (shot) => {
  const styles = getProductStyles(shot, "shots");
  
  return {
    ...styles,
    ringColor: "border-amber-400",
    labelBg: "bg-gradient-to-r from-amber-500 to-yellow-600",
    priceButtonBg: "bg-gradient-to-r from-amber-500 to-yellow-600",
    splashBg: "bg-amber-400",
    splash: true,
  };
};

const Shots = () => {
  const { data, isLoading, error } = useProductsByCategory("shots");

  const shots = data?.results || [];

  return (
    <section 
      id="shots" 
      className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-600 via-yellow-700 to-orange-900"
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
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-400 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full filter blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400 rounded-full filter blur-[120px]"></div>
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
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              SHOTS
            </span>
          </h2>
          <p className="text-white text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-semibold drop-shadow-lg">
            Licores premium servidos puros. La mejor selección para brindar con
            estilo.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-red-300">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
          {isLoading
            ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            : shots.map((shot, index) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  index={index}
                  styles={getShotStyles(shot)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Shots;
