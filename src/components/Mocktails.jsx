import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wine,
  GlassWater,
  PartyPopper,
  Martini,
  Citrus,
  Palmtree,
  Skull,
  Clock,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
  const [showHistory, setShowHistory] = useState(false);
  const variants = product.variants || [];
  const suaveVariant = variants.find((v) => v.name === "Suave");
  const cargadoVariant = variants.find((v) => v.name === "Cargado");
  const hasSuaveCargado = suaveVariant || cargadoVariant;
  const otherVariants = hasSuaveCargado
    ? []
    : variants;
  const hasHistory = Boolean(product.history && product.history.trim());

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div
        className={`liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-secondary/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(242,197,61,0.1)] ${
          product.is_coming_soon ? "opacity-60" : ""
        }`}
      >
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {product.is_coming_soon && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <span className="bg-primary/90 text-dark font-bold px-4 py-2 rounded-full flex items-center gap-2">
                <Clock size={16} /> Próximamente
              </span>
            </div>
          )}
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
          <p className="text-gray mb-2 text-sm">{product.description}</p>
          {styles.liquor && (
            <p className="text-xs text-gold/80 mb-4 grow">
              <span className="font-semibold">Base:</span> {styles.liquor}
            </p>
          )}
          <div className="mt-auto pt-4 border-t border-gray/10 space-y-2">
            {suaveVariant && (
              <div className="flex items-center justify-between">
                <span className="text-gray text-sm">Suave</span>
                <span className="text-lg font-bold text-grass">
                  {formatPrice(suaveVariant.price)}
                </span>
              </div>
            )}
            {cargadoVariant && (
              <div className="flex items-center justify-between">
                <span className="text-gray text-sm">Cargado</span>
                <span className="text-lg font-bold text-grass">
                  {formatPrice(cargadoVariant.price)}
                </span>
              </div>
            )}
            {otherVariants.map((variant) => (
              <div key={variant.id || variant.name} className="flex items-center justify-between">
                {variants.length > 1 && (
                  <span className="text-gray text-sm">{variant.name}</span>
                )}
                <span className={`text-lg font-bold text-grass ${variants.length === 1 ? "mx-auto" : ""}`}>
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Pedir desde la tarjeta */}

          {hasHistory && (
            <div className="mt-4 pt-4 border-t border-gray/10">
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                aria-expanded={showHistory}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold/90 hover:text-gold transition-colors"
              >
                <BookOpen size={14} />
                Historia
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${showHistory ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {showHistory && (
                  <motion.div
                    key="history"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm text-gray leading-relaxed">
                      {product.history}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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
      <div className="space-y-2 pt-4 border-t border-gray/10">
        <div className="h-6 bg-gray/20 rounded w-full"></div>
        <div className="h-6 bg-gray/20 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// Estilos específicos para cócteles
const coctelesStyles = {
  mojito: {
    icon: GlassWater,
    gradient: "from-grass to-green-600",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1652780093319-559c3b12225a",
  },
  margarita: {
    icon: Martini,
    gradient: "from-grass to-gold",
    liquor: "Tequila JOSE CUERVO",
    image: "https://images.unsplash.com/photo-1700909592926-c07b0c2a0bed",
  },
  margarota: {
    icon: PartyPopper,
    gradient: "from-gold to-amber-500",
    liquor: "Tequila JOSE CUERVO",
    image: "./margarota.jpeg",
  },
  caipiroshka: {
    icon: Citrus,
    gradient: "from-grass to-green-600",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1581284744588-af12206e90db",
  },
  "cuba-libre": {
    icon: Skull,
    gradient: "from-red-500 to-red-700",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1665940487849-abe2980c05ab",
  },
  gintonic: {
    icon: Wine,
    gradient: "from-blue-500 to-blue-700",
    liquor: "Ginebra BEEFEATER",
    image: "/shutterstock-1504207547.jpg",
  },
  "moscow-mule": {
    icon: GlassWater,
    gradient: "from-gold to-amber-500",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1527628126150-086ff233b951",
  },
  "blue-long": {
    icon: Palmtree,
    gradient: "from-blue-500 to-grass",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1682629906883-76eaa5e03693",
  },
};

const getCoctelStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = coctelesStyles[slug] || {
    icon: Martini,
    gradient: "from-gold to-grass",
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
    <section id="mocktails" className="py-20 bg-dark relative overflow-hidden">
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
            Barra Mundial 26
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            <span className="text-gold">
              CÓCTELES
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Cocteles en Cumbal: mojitos, margaritas y creaciones de la casa para
            elevar tu espíritu.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
