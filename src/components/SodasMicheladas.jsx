import React from "react";
import { motion } from "framer-motion";
import { Cherry, Citrus, Sun } from "lucide-react";
import { useProductsByCategory } from "@/hooks";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
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
      <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={styles.image}
            />
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${styles.gradient}`}
            ></div>
          )}
          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-dark/70 z-20 flex items-center justify-center">
              <span className="text-light font-bold text-lg tracking-wider uppercase bg-primary/20 px-4 py-2 rounded-lg border border-primary/50">
                Próximamente
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col grow relative z-20 -mt-12">
          <div
            className={`w-12 h-12 bg-linear-to-br ${styles.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-dark" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray mb-4 grow text-sm">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
            <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
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

// Estilos específicos para sodas italianas
const sodasStyles = {
  "soda-italiana-de-fresa": {
    icon: Cherry,
    gradient: "from-red-400 to-pink-500",
    image: "./SODA-ITALIANA-FRESA-9715.jpg",
  },
  "soda-italiana-de-maracuya": {
    icon: Citrus,
    gradient: "from-yellow-400 to-orange-500",
    image: "./RJjIk1U1.jpg",
  },
  "soda-italiana-de-mango": {
    icon: Sun,
    gradient: "from-yellow-300 to-orange-400",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696",
  },
};

const getSodaStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  return (
    sodasStyles[slug] || {
      icon: Cherry,
      gradient: "from-primary to-secondary",
    }
  );
};

const SodasMicheladas = () => {
  const { data, isLoading, error } = useProductsByCategory("sodas-italianas");

  const products = data?.results || [];

  return (
    <section
      id="sodas"
      className="py-20 bg-dark-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
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
            SODAS{" "}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              ITALIANAS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Refrescantes, burbujeantes y llenas de sabor frutal.
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
                  styles={getSodaStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default SodasMicheladas;
