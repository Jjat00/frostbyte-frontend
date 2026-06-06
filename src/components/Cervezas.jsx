import React from "react";
import { motion } from "framer-motion";
import { Beer, Crown, Sparkles, Star } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon || Beer;
  const variants = product.variants || [];
  const defaultVariant = variants.find((v) => v.is_default) || variants[0];

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-gold/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(242,197,61,0.12)]">
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
          <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray mb-4 grow text-sm">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gold/15">
            <span className="text-2xl font-bold bg-linear-to-r from-gold to-grass bg-clip-text text-transparent">
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

// Estilos específicos para cervezas
const cervezasStyles = {
  budweiser: {
    icon: Sparkles,
    gradient: "from-red-500 to-red-700",
    image: "/2dff99a28b761aa32527776df5e1c4a7.jpg",
  },
  poker: {
    icon: Beer,
    gradient: "from-yellow-500 to-amber-600",
    image: "/cerveza-poker.jpg",
  },
  coronita: {
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    image: "/cerveza-corona.webp",
  },
  corona: {
    icon: Crown,
    gradient: "from-yellow-300 to-yellow-500",
    image: "/cerveza-corona.webp",
  },
};

const getCervezaStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = cervezasStyles[slug] || {
    icon: Beer,
    gradient: "from-yellow-400 to-amber-500",
  };

  // Priorizar image_url de la API sobre estilos locales
  return {
    ...localStyles,
    image: product.image_url && product.image_url.trim() !== ''
      ? product.image_url
      : localStyles.image
  };
};

const Cervezas = () => {
  const { data, isLoading, error } = useProductsByCategory("cervezas");

  const products = data?.results || [];

  return (
    <section id="cervezas" className="py-20 relative overflow-hidden bg-dark">
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
            <span className="bg-linear-to-r from-gold to-grass bg-clip-text text-transparent">
              CERVEZAS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Cervezas en Cumbal: las mejores marcas bien frías para refrescarte.
            Nacionales e importadas en Frostbyte.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getCervezaStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Cervezas;
