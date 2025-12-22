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
          <GradientVisual
            gradient={styles.visualGradient || styles.gradient}
            secondaryGradient={styles.secondaryGradient}
          />
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
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-4 sm:px-6 py-3 border border-purple-500/30">
                  <span className="text-light font-semibold text-sm sm:text-base">
                    🍹 Granizado
                  </span>
                  <Plus className="text-purple-400" size={20} />
                  <span className="text-light font-semibold text-sm sm:text-base">
                    🥃 Shot
                  </span>
                  <span className="text-purple-400 text-xl sm:text-2xl">=</span>
                  <span className="text-purple-400 font-bold text-sm sm:text-base">
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
