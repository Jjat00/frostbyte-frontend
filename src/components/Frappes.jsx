import React from "react";
import { motion } from "framer-motion";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
  const variants = product.variants || [];
  const hasOptions = variants.length > 1;
  
  // Buscar variantes específicas para frappés con opciones
  const chocolistoVariant = variants.find(v => v.name === "Chocolisto");
  const miloVariant = variants.find(v => v.name === "Milo");
  const regularVariant = variants.find(v => v.name === "Regular" || v.is_default);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-secondary/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,224,255,0.1)]">
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
          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-dark/70 z-20 flex items-center justify-center">
              <span className="text-light font-bold text-lg tracking-wider uppercase bg-secondary/20 px-4 py-2 rounded-lg border border-secondary/50">
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
          <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-secondary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray mb-4 grow text-sm">{product.description}</p>
          
          {hasOptions && chocolistoVariant && miloVariant ? (
            <div className="mt-auto pt-4 border-t border-gray/10">
              <p className="text-xs text-gray mb-2">Elige tu base:</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray">{chocolistoVariant.name}</span>
                  <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                    {formatPrice(chocolistoVariant.price)}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray">{miloVariant.name}</span>
                  <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                    {formatPrice(miloVariant.price)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
              <span className="text-2xl font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                {formatPrice(regularVariant?.price)}
              </span>
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
      <div className="h-8 bg-gray/20 rounded w-24 mt-4"></div>
    </div>
  </div>
);

const Frappes = () => {
  const { data, isLoading, error } = useProductsByCategory("frappes");

  const products = data?.results || [];

  return (
    <section id="frappes" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, rgba(10,10,20,0.95), rgba(13,13,26,0.95))" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              FRAPPÉS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Los mejores frappés en Cumbal. Cremosas y heladas creaciones que
            fusionan sabores clásicos con energía del futuro.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getProductStyles(product, "frappes")}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Frappes;
