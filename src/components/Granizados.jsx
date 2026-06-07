import React, { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Skull,
  Plus,
  Martini,
  Wine,
  Flame,
  Citrus,
  Anchor,
  Droplets,
  Sparkles,
} from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const PoisonOption = ({ name, brand, price, icon: Icon, gradient }) => (
  <div className="poison-card w-[calc(50%-6px)] sm:w-[140px] lg:w-[160px] bg-dark/60 border border-red-500/30 rounded-2xl p-4 text-center cursor-pointer hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
    <div
      className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
    >
      <Icon className="text-dark" size={24} />
    </div>
    <h4 className="text-light font-bold text-base">{name}</h4>
    <p className="text-gray text-xs mb-2">{brand}</p>
    <span className="text-red-400 font-bold text-sm">{price}</span>
  </div>
);

// SVG filter — distorsión sutil de vidrio grueso (más en bordes, menos en centro)
const ThickGlassFilter = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="thick-glass" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.015"
          numOctaves="3"
          seed="2"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="8"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

// Tarjeta liquid glass — vidrio grueso con distorsión en bordes
const ProductCard = ({ product, index, styles }) => {
  const variants = product.variants || [];
  const ringColor = styles.ringColor || "border-gold";

  return (
    <div className="gran-card group relative h-full">
      <div className="relative flex flex-col items-center h-full rounded-3xl p-6 overflow-hidden bg-white/[0.02] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.2),0_0_50px_rgba(242,197,61,0.08)]">
        {/* Capa de vidrio grueso — distorsión sutil en los bordes por la concavidad */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            backdropFilter: "url(#thick-glass) blur(0.5px)",
            WebkitBackdropFilter: "url(#thick-glass) blur(0.5px)",
            maskImage:
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 65%, black 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 65%, black 90%)",
          }}
        />

        {/* Centro — blur muy leve para simular grosor sin perder claridad */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        {/* Reflejo especular superior */}
        <div
          className="absolute top-0 inset-x-0 h-1/2 rounded-t-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 40%, transparent 100%)",
          }}
        />

        {/* Brillo en borde superior */}
        <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Imagen del producto */}
        <div className="relative mb-5 shrink-0 z-10">
          {styles.image ? (
            <div className="relative w-52 h-52 md:w-56 md:h-56 flex items-center justify-center">
              <img
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                src={styles.image}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative w-52 h-52 md:w-56 md:h-56 rounded-full overflow-hidden">
              <div
                className={`absolute inset-0 rounded-full border-2 ${ringColor} opacity-40`}
              ></div>
              <div
                className={`w-full h-full bg-linear-to-br ${styles.visualGradient || styles.gradient} opacity-80`}
              ></div>
            </div>
          )}
        </div>

        {/* Nombre del producto */}
        <div className="relative z-10 w-full flex flex-col items-center mb-3">
          <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider text-center line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <div className="w-10 h-0.5 bg-primary/60 rounded-full mt-2"></div>
        </div>

        {/* Descripción */}
        <p className="relative z-10 text-gray text-sm text-center mb-5 leading-relaxed max-w-[260px]">
          {product.description}
        </p>

        {/* Precios */}
        <div className="relative z-10 mt-auto w-full">
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/[0.08]">
            {variants.map((variant) => (
              <div key={variant.id || variant.name} className="flex flex-col items-center">
                <span className="text-[11px] text-gray uppercase font-semibold tracking-widest mb-0.5">
                  {variant.name}
                </span>
                <span className="text-lg font-black text-primary">
                  {formatPrice(variant.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white/4 border border-white/8 rounded-3xl p-6 animate-pulse">
    <div className="flex flex-col items-center h-full">
      <div className="relative mb-5 shrink-0">
        <div className="w-52 h-52 md:w-56 md:h-56 rounded-full bg-white/6"></div>
      </div>
      <div className="w-full flex flex-col items-center mb-3">
        <div className="h-5 bg-white/8 rounded-lg w-3/4 mb-2"></div>
        <div className="w-10 h-0.5 bg-white/6 rounded-full"></div>
      </div>
      <div className="h-4 bg-white/6 rounded w-full max-w-[220px] mb-2"></div>
      <div className="h-4 bg-white/6 rounded w-2/3 max-w-[180px] mb-5"></div>
      <div className="mt-auto w-full pt-3 border-t border-white/6">
        <div className="flex justify-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 bg-white/6 rounded w-12"></div>
            <div className="h-5 bg-white/8 rounded w-16"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 bg-white/6 rounded w-12"></div>
            <div className="h-5 bg-white/8 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const flavorShots = [
  {
    name: "Porrito",
    flavor: "Verde",
    licor: "Tequila",
    price: "+$5.000",
    icon: Droplets,
    gradient: "from-green-400 to-emerald-600",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
  },
  {
    name: "Maracuyá",
    flavor: "Amarillo",
    licor: "Whisky",
    price: "+$5.000",
    icon: Droplets,
    gradient: "from-yellow-300 to-amber-500",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  {
    name: "Fresita",
    flavor: "Rojo",
    licor: "Ron",
    price: "+$5.000",
    icon: Droplets,
    gradient: "from-red-400 to-rose-600",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
  },
  {
    name: "Tentaxxion",
    flavor: "Morado",
    licor: "Vodka",
    price: "+$5.000",
    icon: Droplets,
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
];

const FlavorOption = ({ name, flavor, licor, price, icon: Icon, gradient, textColor, borderColor }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className={`w-[calc(50%-6px)] sm:w-[140px] lg:w-[160px] bg-dark/60 border ${borderColor} rounded-2xl p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-300`}
  >
    <div
      className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
    >
      <Icon className="text-dark" size={24} />
    </div>
    <h4 className={`${textColor} font-bold text-base`}>{name}</h4>
    <p className="text-gray text-xs">{licor}</p>
    <p className="text-gray text-xs mb-2">{flavor}</p>
    <span className={`${textColor} font-bold text-sm`}>{price}</span>
  </motion.div>
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
    gradient: "from-blue-400 to-blue-600",
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
    gradient: "from-green-400 to-green-600",
  },
];

const Granizados = ({ showExtras = true }) => {
  const { data, isLoading, error } = useProductsByCategory("granizados");
  const products = data?.results || [];

  const sectionRef = useRef(null);

  // GSAP ScrollTrigger animations
  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const poisonSection = section.querySelector(".poison-section");

    // Title, subtitle y product cards: visibles de inmediato, sin reveal por scroll

    // Poison section
    if (poisonSection) {
      const poisonTitle = poisonSection.querySelector(".poison-title");
      const poisonFormula = poisonSection.querySelector(".poison-formula");
      const poisonCards = poisonSection.querySelectorAll(".poison-card");

      if (poisonTitle) {
        gsap.fromTo(poisonTitle, { scale: 1.2, opacity: 0 }, {
          scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: poisonSection, start: "top 75%", end: "top 35%", scrub: true },
        });
      }

      if (poisonFormula) {
        gsap.fromTo(poisonFormula, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: poisonFormula, start: "top 90%", toggleActions: "play none none none" },
        });
      }

      if (poisonCards.length) {
        gsap.set(poisonCards, { autoAlpha: 0, y: 50, rotation: -6 });
        ScrollTrigger.batch(poisonCards, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, {
            autoAlpha: 1, y: 0, rotation: 0, duration: 0.55, ease: "back.out(1.4)", stagger: 0.1,
          }),
        });
      }
    }
  }, { scope: sectionRef, dependencies: [products] });

  return (
    <section
      ref={sectionRef}
      id="granizados"
      className="py-20 relative overflow-hidden bg-dark"
    >
      {/* SVG filter para vidrio grueso */}
      <ThickGlassFilter />

      {/* Capa decorativa Sistema 26 — afiche Mundial sutil (ligera en GPU) */}
      <Mundial26Backdrop />

      {/* Líneas divisoras con acento oro/verde */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-grass/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Edición Mundial 2026
          </span>
          <h2 className="gran-title text-4xl md:text-6xl font-black mb-4">
            <span className="text-gold">
              GRANIZADOS
            </span>
          </h2>
          <p className="gran-subtitle text-white text-lg max-w-2xl mx-auto font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Los mejores granizados en Cumbal. Hielo triturado a la perfección
            con los sabores frutales más intensos de Nariño.
          </p>
        </div>

        {error && (
          <div className="text-center text-white bg-red-500/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-red-300">
            Error al cargar los productos. Por favor intenta de nuevo.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 max-w-7xl mx-auto items-stretch">
          {isLoading
            ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  styles={getProductStyles(product, "granizados")}
                />
              ))}
        </div>

        {/* Sección Envenenar - controlada por show_extras */}
        {showExtras && (
          <div className="poison-section mt-20">
            <div className="bg-linear-to-br from-dark to-red-900/30 border-2 border-red-500/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full filter blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500 rounded-full filter blur-[80px]"></div>
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="poison-title flex items-center justify-center gap-3 mb-4">
                    <Skull
                      className="text-red-400 hidden sm:block"
                      size={32}
                    />
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light text-center">
                      ¿QUIERES{" "}
                      <span className="text-red-400">
                        ENVENENARLO
                      </span>
                      ?
                    </h3>
                    <Skull
                      className="text-red-400 hidden sm:block"
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
                <div className="poison-formula mt-8 flex justify-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-red-500/30">
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🍹 Granizado
                    </span>
                    <Plus className="text-red-400 shrink-0" size={20} />
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🥃 Shot
                    </span>
                    <span className="text-red-400 text-xl sm:text-2xl shrink-0">
                      =
                    </span>
                    <span className="text-red-400 font-bold text-sm sm:text-base whitespace-nowrap">
                      ☠️ ENVENENADO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExtras && (
          <div className="mt-12">
            <div className="relative bg-linear-to-br from-grass/15 via-dark/60 to-gold/15 border-2 border-gold/30 rounded-3xl overflow-hidden">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src="/shots2.webp"
                  alt="Shots de Sabores"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/70 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-gold/5 to-grass/5" />
              </div>

              <div className="relative z-10 px-6 sm:px-10 pb-8 -mt-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Sparkles
                      className="text-gold hidden sm:block"
                      size={28}
                    />
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light text-center">
                      SHOTS DE{" "}
                      <span className="text-gold">
                        SABORES
                      </span>
                    </h3>
                    <Sparkles
                      className="text-gold hidden sm:block"
                      size={28}
                    />
                  </div>
                  <p className="text-gray text-base sm:text-lg max-w-2xl mx-auto">
                    Dale un toque extra de sabor a tu granizado con nuestros
                    shots especiales 🔥
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mx-auto max-w-full">
                  {flavorShots.map((shot) => (
                    <FlavorOption key={shot.name} {...shot} />
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-gold/30">
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🍹 Granizado
                    </span>
                    <Plus className="text-gold shrink-0" size={20} />
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      💧 Shot de Sabor
                    </span>
                    <span className="text-gold text-xl sm:text-2xl shrink-0">
                      =
                    </span>
                    <span className="text-gold font-bold text-sm sm:text-base whitespace-nowrap">
                      ✨ SABOR ÚNICO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Granizados;
