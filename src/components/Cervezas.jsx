import React from "react";
import { motion } from "framer-motion";
import { Beer, Crown, Sparkles, Star } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/20">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={styles.image}
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
          <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-yellow-400 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray mb-4 grow text-sm">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
            <span className="text-2xl font-bold bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full animate-pulse">
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
    image: "/cerveza-corona.png",
  },
  corona: {
    icon: Crown,
    gradient: "from-yellow-300 to-yellow-500",
    image: "/cerveza-corona.png",
  },
};

const getCervezaStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  return cervezasStyles[slug] || {
    icon: Beer,
    gradient: "from-yellow-400 to-amber-500",
  };
};

const Cervezas = () => {
  const { data, isLoading, error } = useProductsByCategory("cervezas");

  const products = data?.results || [];

  return (
    <section id="cervezas" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500 rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              CERVEZAS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Las mejores cervezas bien frías para refrescarte. Nacionales e
            importadas de la mejor calidad.
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
