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
import SectionHeading from "@/components/SectionHeading";

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
      whileHover={{ y: -3 }}
      className="group relative"
    >
      <div
        className={`fb-card fb-card--link flex h-full flex-col overflow-hidden ${
          product.is_coming_soon ? "opacity-60" : ""
        }`}
      >
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
          {product.is_coming_soon && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <span className="fb-pill bg-dark/80 text-[0.68rem] uppercase tracking-[0.16em]">
                <Clock size={16} /> Próximamente
              </span>
            </div>
          )}
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
          <p className="mb-2 text-[0.78rem] leading-relaxed text-light/55">{product.description}</p>
          {styles.liquor && (
            <p className="text-xs text-secondary mb-4 grow">
              <span className="font-semibold">Base:</span> {styles.liquor}
            </p>
          )}
          <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
            {suaveVariant && (
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-light/50">Suave</span>
                <span className="text-[0.95rem] font-medium text-light">
                  {formatPrice(suaveVariant.price)}
                </span>
              </div>
            )}
            {cargadoVariant && (
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-light/50">Cargado</span>
                <span className="text-[0.95rem] font-medium text-light">
                  {formatPrice(cargadoVariant.price)}
                </span>
              </div>
            )}
            {otherVariants.map((variant) => (
              <div key={variant.id || variant.name} className="flex items-center justify-between">
                {variants.length > 1 && (
                  <span className="text-[0.75rem] text-light/50">{variant.name}</span>
                )}
                <span className={`text-[0.95rem] font-medium text-light ${variants.length === 1 ? "mx-auto" : ""}`}>
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Pedir desde la tarjeta */}

          {hasHistory && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                aria-expanded={showHistory}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary hover:text-light transition-colors"
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
  <div className="fb-card h-full overflow-hidden animate-pulse">
    <div className="h-48 bg-gray/20"></div>
    <div className="p-6 -mt-12">
      <div className="w-12 h-12 bg-gray/30 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray/20 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray/20 rounded mb-4 w-full"></div>
      <div className="space-y-2 pt-4 border-t border-white/[0.06]">
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
    gradient: "from-green-400 to-emerald-600",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1652780093319-559c3b12225a",
  },
  margarita: {
    icon: Martini,
    gradient: "from-lime-300 to-yellow-400",
    liquor: "Tequila JOSE CUERVO",
    image: "https://images.unsplash.com/photo-1700909592926-c07b0c2a0bed",
  },
  margarota: {
    icon: PartyPopper,
    gradient: "from-yellow-400 to-amber-500",
    liquor: "Tequila JOSE CUERVO",
    image: "./margarota.jpeg",
  },
  caipiroshka: {
    icon: Citrus,
    gradient: "from-lime-500 to-green-700",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1581284744588-af12206e90db",
  },
  "cuba-libre": {
    icon: Skull,
    gradient: "from-red-900 to-black",
    liquor: "Ron BACARDI Superior",
    image: "https://images.unsplash.com/photo-1665940487849-abe2980c05ab",
  },
  gintonic: {
    icon: Wine,
    gradient: "from-purple-400 to-indigo-600",
    liquor: "Ginebra BEEFEATER",
    image: "/shutterstock-1504207547.jpg",
  },
  "moscow-mule": {
    icon: GlassWater,
    gradient: "from-amber-200 to-orange-300",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1527628126150-086ff233b951",
  },
  "blue-long": {
    icon: Palmtree,
    gradient: "from-blue-400 to-cyan-600",
    liquor: "Vodka ABSOLUT",
    image: "https://images.unsplash.com/photo-1682629906883-76eaa5e03693",
  },
};

const getCoctelStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  const localStyles = coctelesStyles[slug] || {
    icon: Martini,
    gradient: "from-secondary to-primary",
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
      className="fb-section py-16"
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          eyebrow="De la casa"
          title="Cócteles"
          description="Cocteles en Cumbal: mojitos, margaritas y creaciones de la casa para elevar tu espíritu."
          className="mb-12"
        />

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
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
