import React from "react";
import { motion } from "framer-motion";
import { Cherry, Citrus, Sun } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import SectionHeading from "@/components/SectionHeading";

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
      whileHover={{ y: -3 }}
      className="group relative"
    >
      <div className="fb-card fb-card--link flex h-full flex-col overflow-hidden">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {styles.image ? (
            <img
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={styles.image}
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${styles.gradient}`}
            ></div>
          )}
          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-dark/70 z-20 flex items-center justify-center">
              <span className="fb-pill bg-dark/80 text-[0.68rem] uppercase tracking-[0.16em]">
                Próximamente
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col grow relative z-20 -mt-12">
          <div
            className={`w-9 h-9 bg-linear-to-br ${styles.gradient} rounded-[11px] flex items-center justify-center mb-3.5 opacity-90`}
          >
            <Icon className="text-dark" size={17} />
          </div>
          <h3 className="font-display mb-2 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
            {product.name}
          </h3>
          <p className="mb-4 grow text-[0.78rem] leading-relaxed text-light/55">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
            <span className="text-base font-medium text-light">
              {formatPrice(defaultVariant?.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <div className="fb-card h-full overflow-hidden animate-pulse">
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
    image: "./SODA-ITALIANA-FRESA-9715.webp",
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
  const localStyles = sodasStyles[slug] || {
    icon: Cherry,
    gradient: "from-primary to-secondary",
  };

  // Priorizar image_url de la API sobre estilos locales
  return {
    ...localStyles,
    image: product.image_url && product.image_url.trim() !== ''
      ? product.image_url
      : localStyles.image
  };
};

const SodasMicheladas = () => {
  const { data, isLoading, error } = useProductsByCategory("sodas-italianas");

  const products = data?.results || [];

  return (
    <section
      id="sodas"
      className="fb-section py-16"
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          eyebrow="Burbujas y fruta"
          title="Sodas italianas"
          description="Sodas italianas en Cumbal: refrescantes, burbujeantes y llenas de sabor frutal en Frostbyte."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
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
