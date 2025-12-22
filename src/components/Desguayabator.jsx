import React from "react";
import { motion } from "framer-motion";
import { Zap, Heart, Sparkles, Star, AlertCircle } from "lucide-react";
import { useProductsByCategory } from "@/hooks";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

// Mapeo de estilos para cada sabor
const flavorStyles = {
  "desguayabator-maracuya": {
    icon: Star,
    gradient: "from-yellow-400 to-orange-500",
    glowGradient: "from-yellow-400 to-orange-500",
    borderColor: "border-yellow-500/50",
    shadowColor: "hover:shadow-yellow-500/30",
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  "desguayabator-fresa": {
    icon: Heart,
    gradient: "from-pink-400 to-red-500",
    glowGradient: "from-pink-400 to-red-500",
    borderColor: "border-pink-500/50",
    shadowColor: "hover:shadow-pink-500/30",
    bgColor: "bg-pink-500",
    textColor: "text-pink-400",
  },
  "desguayabator-coco": {
    icon: Sparkles,
    gradient: "from-white to-gray-300",
    glowGradient: "from-white to-cyan-300",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/30",
    bgColor: "bg-white",
    textColor: "text-white",
  },
  "desguayabator-naranja-mandarina": {
    icon: Zap,
    gradient: "from-orange-400 to-orange-600",
    glowGradient: "from-orange-400 to-red-500",
    borderColor: "border-orange-500/50",
    shadowColor: "hover:shadow-orange-500/30",
    bgColor: "bg-orange-500",
    textColor: "text-orange-400",
  },
};

const getFlavorStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  return flavorStyles[slug] || {
    icon: Zap,
    gradient: "from-emerald-400 to-cyan-400",
    glowGradient: "from-emerald-400 to-cyan-400",
    borderColor: "border-emerald-500/50",
    shadowColor: "hover:shadow-emerald-500/30",
    bgColor: "bg-emerald-500",
    textColor: "text-emerald-400",
  };
};

const FlavorCard = ({ product, index }) => {
  const styles = getFlavorStyles(product);
  const Icon = styles.icon;
  
  // Simplificar el nombre (quitar "Desguayabator ")
  const displayName = product.name.replace("Desguayabator ", "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      whileHover={{ y: -15, scale: 1.05 }}
      className="group relative"
    >
      {/* Glow effect behind card */}
      <div
        className={`absolute -inset-1 bg-linear-to-r ${styles.glowGradient} rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500`}
      ></div>

      <div
        className={`relative bg-dark border-2 ${styles.borderColor} rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl ${styles.shadowColor}`}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className={`absolute top-0 right-0 w-32 h-32 ${styles.bgColor} rounded-full filter blur-3xl animate-pulse`}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-24 h-24 ${styles.bgColor} rounded-full filter blur-2xl animate-pulse`}
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col grow relative z-10">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br ${styles.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icon className="text-dark" size={24} />
          </div>

          <h3
            className={`text-lg sm:text-2xl font-black mb-2 ${styles.textColor} transition-all duration-300`}
          >
            {displayName}
          </h3>

          <p className="text-gray mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed hidden sm:block">
            {product.description}
          </p>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray/20">
            <div className="flex items-center gap-1 sm:gap-2">
              <Zap className={styles.textColor} size={14} />
              <span
                className={`text-xs sm:text-sm font-semibold ${styles.textColor}`}
              >
                Electrolit + Bonfiest
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FlavorSkeleton = () => (
  <div className="bg-dark border-2 border-gray/20 rounded-3xl overflow-hidden h-full animate-pulse">
    <div className="p-4 sm:p-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray/30 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray/20 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray/20 rounded mb-4 w-full hidden sm:block"></div>
      <div className="h-4 bg-gray/20 rounded w-32 mt-4"></div>
    </div>
  </div>
);

const Desguayabator = () => {
  const { data, isLoading, error } = useProductsByCategory("desguayabator");

  const products = data?.results || [];
  
  // Obtener precio del primer producto (todos cuestan igual)
  const defaultPrice = products[0]?.variants?.[0]?.price || "12000";

  return (
    <section
      id="desguayabator"
      className="py-16 sm:py-24 bg-dark relative overflow-hidden"
    >
      {/* Epic background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full filter blur-[150px] opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[150px] opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full filter blur-[200px] opacity-10 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Badge exclusivo */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-full px-4 sm:px-6 py-2 mb-6"
          >
            <AlertCircle
              className="text-emerald-400 animate-pulse hidden sm:block"
              size={18}
            />
            <span className="text-emerald-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
              ¡Cura Guayabos Garantizado!
            </span>
            <AlertCircle
              className="text-emerald-400 animate-pulse hidden sm:block"
              size={18}
            />
          </motion.div>

          {/* Título principal */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6"
          >
            <span className="bg-linear-to-r from-emerald-400 via-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
              DESGUAYABATOR
            </span>
          </motion.h2>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-xl md:text-2xl text-gray max-w-3xl mx-auto mb-4 px-2"
          >
            La bebida helada con la fórmula secreta para{" "}
            <span className="text-emerald-400 font-bold">revivir</span> después
            de una noche épica
          </motion.p>

          {/* Info de ingredientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8"
          >
            <div className="flex items-center gap-2 bg-dark-secondary/80 border border-emerald-500/30 rounded-full px-4 sm:px-5 py-2 sm:py-3">
              <Zap className="text-cyan-400" size={18} />
              <span className="text-light font-semibold text-sm sm:text-base">
                Electrolit
              </span>
              <span className="text-gray text-xs sm:text-sm">
                Hidratación Total
              </span>
            </div>
            <span className="text-emerald-400 text-xl sm:text-2xl font-bold">
              +
            </span>
            <div className="flex items-center gap-2 bg-dark-secondary/80 border border-emerald-500/30 rounded-full px-4 sm:px-5 py-2 sm:py-3">
              <Heart className="text-red-400" size={18} />
              <span className="text-light font-semibold text-sm sm:text-base">
                Bonfiest
              </span>
              <span className="text-gray text-xs sm:text-sm">
                Alivio Express
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Precio destacado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <div className="inline-flex flex-col items-center bg-linear-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 rounded-3xl px-8 sm:px-12 py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-cyan-500/10 animate-pulse"></div>
            <span className="text-gray text-base sm:text-lg mb-2 relative z-10">
              Precio único
            </span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
              {formatPrice(defaultPrice)}
            </span>
            <span className="text-emerald-400 text-sm mt-2 relative z-10">
              Cualquier sabor
            </span>
          </div>
        </motion.div>

        {/* Sabores Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-center text-2xl font-bold text-light mb-8">
            Elige tu sabor de{" "}
            <span className="text-emerald-400">Electrolit</span>
          </h3>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => <FlavorSkeleton key={i} />)
            : products.map((product, index) => (
                <FlavorCard key={product.id} product={product} index={index} />
              ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray text-lg">
            <Zap className="inline text-emerald-400 mr-2" size={20} />
            <span className="text-emerald-400 font-semibold">
              Pro tip:
            </span>{" "}
            Pídelo antes de que el guayabo te gane la batalla
            <Zap className="inline text-emerald-400 ml-2" size={20} />
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Desguayabator;
