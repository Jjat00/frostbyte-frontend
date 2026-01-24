import React from "react";
import { motion } from "framer-motion";
import {
  Skull,
  Plus,
  Martini,
  Wine,
  Flame,
  Citrus,
  Anchor,
  Coffee,
  Sparkles,
  Tag,
} from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const GradientVisual = ({ gradient, secondaryGradient }) => (
  <div
    className={`w-full h-full bg-linear-to-br ${gradient} relative overflow-hidden`}
  >
    {/* Efecto de textura de hielo */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/40 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/30 rounded-full blur-lg"></div>
      <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-white/25 rounded-full blur-2xl"></div>
    </div>
    {/* Burbujas decorativas */}
    <div className="absolute top-4 right-6 w-3 h-3 bg-white/50 rounded-full"></div>
    <div className="absolute top-8 right-12 w-2 h-2 bg-white/40 rounded-full"></div>
    <div className="absolute bottom-6 left-8 w-4 h-4 bg-white/35 rounded-full"></div>
    <div className="absolute bottom-12 left-4 w-2 h-2 bg-white/45 rounded-full"></div>
    {/* Efecto de brillo */}
    <div
      className={`absolute inset-0 bg-linear-to-t ${
        secondaryGradient || "from-transparent via-white/10 to-transparent"
      } opacity-40`}
    ></div>
    {/* Patrón de cristales de hielo */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px),
                          radial-gradient(circle at 80% 70%, white 1px, transparent 1px),
                          radial-gradient(circle at 40% 80%, white 1px, transparent 1px),
                          radial-gradient(circle at 60% 20%, white 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    ></div>
  </div>
);

const PoisonOption = ({ name, brand, price, icon: Icon, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="w-[calc(50%-6px)] sm:w-[140px] lg:w-[160px] bg-dark/60 border border-purple-500/30 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
  >
    <div
      className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
    >
      <Icon className="text-dark" size={24} />
    </div>
    <h4 className="text-light font-bold text-base">{name}</h4>
    <p className="text-gray text-xs mb-2">{brand}</p>
    <span className="text-purple-400 font-bold text-sm">{price}</span>
  </motion.div>
);

const ProductCard = ({ product, index, styles }) => {
  const Icon = styles.icon;
  const variants = product.variants || [];

  // Buscar variantes por nombre
  const smallVariant = variants.find((v) => v.name === "Pequeño");
  const largeVariant = variants.find((v) => v.name === "Grande");

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
            <GradientVisual
              gradient={styles.visualGradient || styles.gradient}
              secondaryGradient={styles.secondaryGradient}
            />
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
          <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-gray/10">
            {smallVariant && (
              <div className="flex flex-col">
                <span className="text-xs text-gray">{smallVariant.name}</span>
                <span className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {formatPrice(smallVariant.price)}
                </span>
              </div>
            )}
            {largeVariant && (
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray">{largeVariant.name}</span>
                <span className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {formatPrice(largeVariant.price)}
                </span>
              </div>
            )}
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
      <div className="flex justify-between pt-4 border-t border-gray/10">
        <div className="h-8 bg-gray/20 rounded w-20"></div>
        <div className="h-8 bg-gray/20 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Datos de shots para envenenar (estos podrían venir de la API también)
const poisonShots = [
  {
    name: "Ginebra",
    brand: "Beefeater",
    price: "+$20.000",
    icon: Martini,
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Vodka",
    brand: "Absolut",
    price: "+$10.000",
    icon: Wine,
    gradient: "from-sky-300 to-sky-500",
  },
  {
    name: "Whisky",
    brand: "Jack Daniels",
    price: "+$12.000",
    icon: Flame,
    gradient: "from-amber-500 to-amber-700",
  },
  {
    name: "Tequila",
    brand: "Jose Cuervo",
    price: "+$9.000",
    icon: Citrus,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    name: "Ron",
    brand: "Bacardi",
    price: "+$6.000",
    icon: Anchor,
    gradient: "from-red-500 to-red-700",
  },
  {
    name: "Aguardiente",
    brand: "Nariño Premium",
    price: "+$5.000",
    icon: Flame,
    gradient: "from-slate-400 to-slate-600",
  },
];

const Granizados = () => {
  const { data, isLoading, error } = useProductsByCategory("granizados");

  const products = data?.results || [];

  return (
    <section
      id="granizados"
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
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              GRANIZADOS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Hielo triturado a la perfección con los sabores frutales más
            intensos.
          </p>
        </motion.div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos. Por favor intenta de nuevo.
          </div>
        )}

        {/* Banner Promoción Granizado de Café */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-orange-950/80 border-2 border-amber-500/50 rounded-2xl overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full filter blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/15 rounded-full filter blur-[40px]" />
            </div>

            <div className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Lado izquierdo - Info */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Coffee className="text-dark" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-400/50 rounded-full px-2 py-0.5 text-xs">
                        <Tag size={10} className="text-red-400" />
                        <span className="text-red-300 font-semibold">PROMO FIN DE SEMANA</span>
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-light">
                      Granizado de{" "}
                      <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                        Café
                      </span>
                    </h3>
                    <p className="text-amber-200/70 text-sm">
                      Lleva 2 por <span className="font-bold text-amber-200">{formatPrice(12000)}</span>
                      <span className="text-gray line-through ml-2 text-xs">{formatPrice(16000)}</span>
                    </p>
                  </div>
                </div>

                {/* Lado derecho - Ahorro */}
                <div className="flex items-center gap-3">
                  <div className="text-center sm:text-right">
                    <div className="text-amber-300/60 text-xs">Cada uno a</div>
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                      {formatPrice(6000)}
                    </div>
                  </div>
                  <div className="bg-green-500/20 border border-green-400/50 rounded-xl px-3 py-2">
                    <Sparkles className="text-green-400 mx-auto mb-1" size={16} />
                    <span className="text-green-400 font-bold text-sm block">
                      -{formatPrice(4000)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getProductStyles(product, "granizados")}
                />
              ))}
        </div>

        {/* Sección Envenenar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="bg-linear-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full filter blur-[80px]"></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Skull
                    className="text-purple-400 hidden sm:block"
                    size={32}
                  />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light text-center">
                    ¿QUIERES{" "}
                    <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ENVENENARLO
                    </span>
                    ?
                  </h3>
                  <Skull
                    className="text-purple-400 hidden sm:block"
                    size={32}
                  />
                </div>
                <p className="text-gray text-base sm:text-lg max-w-2xl mx-auto">
                  Agrega un shot de tu licor favorito a cualquier granizado y
                  llévalo al siguiente nivel 🔥
                </p>
              </div>

              {/* Shots disponibles */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mx-auto max-w-full">
                {poisonShots.map((shot) => (
                  <PoisonOption key={shot.name} {...shot} />
                ))}
              </div>

              {/* Ejemplo visual */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-purple-500/30">
                  <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                    🍹 Granizado
                  </span>
                  <Plus className="text-purple-400 flex-shrink-0" size={20} />
                  <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                    🥃 Shot
                  </span>
                  <span className="text-purple-400 text-xl sm:text-2xl flex-shrink-0">=</span>
                  <span className="text-purple-400 font-bold text-sm sm:text-base whitespace-nowrap">
                    ☠️ ENVENENADO
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Granizados;
