import React from "react";
import { motion } from "framer-motion";
import { Wine, Sparkles } from "lucide-react";
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
            <div className={`w-full h-full bg-linear-to-br ${styles.gradient}`}></div>
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
            <span className="text-gray text-sm">{defaultVariant?.name}</span>
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

// Estilos específicos para vinos
const vinosStyles = {
  "gato-negro": {
    icon: Wine,
    gradient: "from-red-500 to-red-700",
    image: "/vino2.webp",
  },
  "casillero-del-diablo": {
    icon: Sparkles,
    gradient: "from-red-600 to-red-900",
    image: "/vino3.webp",
  },
};

const getVinoStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = vinosStyles[slug] || {
    icon: Wine,
    gradient: "from-red-500 to-red-700",
  };

  // Priorizar image_url de la API sobre estilos locales
  return {
    ...localStyles,
    image: product.image_url && product.image_url.trim() !== ''
      ? product.image_url
      : localStyles.image
  };
};

const Vinos = () => {
  const { data, isLoading, error } = useProductsByCategory("vinos");

  const products = data?.results || [];

  return (
    <section
      id="vinos"
      className="fb-section py-16"
      style={{ "--fb-accent": "#dc2626", "--fb-accent-2": "#dc2626" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          eyebrow="Viñas chilenas"
          title="Vinos"
          description="Vinos en Cumbal: disfruta de una copa de vino tinto de las mejores viñas chilenas. Elegancia y sabor en Frostbyte."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {isLoading
            ? [...Array(2)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getVinoStyles(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Vinos;
