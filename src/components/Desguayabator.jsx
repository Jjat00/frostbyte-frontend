import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Heart, Sparkles, Star, AlertCircle } from "lucide-react";
import { useProductsByCategory } from "@/hooks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

// Mapeo de estilos para cada sabor
const flavorStyles = {
  "desguayabator-maracuya": {
    icon: Star,
    gradient: "from-yellow-400 to-orange-500",
    glowGradient: "from-yellow-400 to-orange-500",
    borderColor: "border-yellow-500/50",
    shadowColor: "hover:shadow-yellow-500/30",
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  "desguayabator-fresa": {
    icon: Heart,
    gradient: "from-pink-400 to-red-500",
    glowGradient: "from-pink-400 to-red-500",
    borderColor: "border-pink-500/50",
    shadowColor: "hover:shadow-pink-500/30",
    bgColor: "bg-pink-500",
    textColor: "text-pink-400",
  },
  "desguayabator-coco": {
    icon: Sparkles,
    gradient: "from-white to-gray-300",
    glowGradient: "from-white to-cyan-300",
    borderColor: "border-white/50",
    shadowColor: "hover:shadow-white/30",
    bgColor: "bg-white",
    textColor: "text-white",
  },
  "desguayabator-naranja-mandarina": {
    icon: Zap,
    gradient: "from-orange-400 to-orange-600",
    glowGradient: "from-orange-400 to-red-500",
    borderColor: "border-orange-500/50",
    shadowColor: "hover:shadow-orange-500/30",
    bgColor: "bg-orange-500",
    textColor: "text-orange-400",
  },
};

const getFlavorStyles = (product) => {
  const slug = product.slug?.toLowerCase() || "";
  return (
    flavorStyles[slug] || {
      icon: Zap,
      gradient: "from-emerald-400 to-cyan-400",
      glowGradient: "from-emerald-400 to-cyan-400",
      borderColor: "border-emerald-500/50",
      shadowColor: "hover:shadow-emerald-500/30",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-400",
    }
  );
};

const FlavorCard = ({ product, index }) => {
  const styles = getFlavorStyles(product);
  const Icon = styles.icon;

  // Simplificar el nombre (quitar "Desguayabator ")
  const displayName = product.name.replace("Desguayabator ", "");

  return (
    <div className="desg-card group relative">
      {/* Glow effect behind card */}
      <div
        className={`absolute -inset-1 bg-linear-to-r ${styles.glowGradient} rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500`}
      ></div>

      <div
        className={`relative bg-dark border-2 ${styles.borderColor} rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl ${styles.shadowColor}`}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className={`absolute top-0 right-0 w-32 h-32 ${styles.bgColor} rounded-full filter blur-3xl animate-pulse`}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-24 h-24 ${styles.bgColor} rounded-full filter blur-2xl animate-pulse`}
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col grow relative z-10">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br ${styles.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icon className="text-dark" size={24} />
          </div>

          <h3
            className={`text-lg sm:text-2xl font-black mb-2 ${styles.textColor} transition-all duration-300`}
          >
            {displayName}
          </h3>

          <p className="text-gray mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed hidden sm:block">
            {product.description}
          </p>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray/20">
            <div className="flex items-center gap-1 sm:gap-2">
              <Zap className={styles.textColor} size={14} />
              <span
                className={`text-xs sm:text-sm font-semibold ${styles.textColor}`}
              >
                Electrolit + Bonfiest
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlavorSkeleton = () => (
  <div className="bg-dark border-2 border-gray/20 rounded-3xl overflow-hidden h-full animate-pulse">
    <div className="p-4 sm:p-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray/30 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray/20 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray/20 rounded mb-4 w-full hidden sm:block"></div>
      <div className="h-4 bg-gray/20 rounded w-32 mt-4"></div>
    </div>
  </div>
);

const Desguayabator = () => {
  const { data, isLoading, error } = useProductsByCategory("desguayabator");

  const products = data?.results || [];

  // Obtener precio del primer producto (todos cuestan igual)
  const defaultPrice = products[0]?.variants?.[0]?.price || "12000";

  const sectionRef = useRef(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    // 1. Title: scrub scale 3x -> 1x + fade in
    gsap.fromTo(
      section.querySelector(".desg-title"),
      { opacity: 0, scale: 3 },
      {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section.querySelector(".desg-title"),
          start: "top 90%",
          end: "top 30%",
          scrub: 1,
        },
      }
    );

    // 2. Badge: flip in with rotationX
    gsap.fromTo(
      section.querySelector(".desg-badge"),
      { rotationX: -90, opacity: 0, transformPerspective: 800 },
      {
        rotationX: 0,
        opacity: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: section.querySelector(".desg-badge"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // 3. Subtitle: fade + y
    gsap.fromTo(
      section.querySelector(".desg-subtitle"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section.querySelector(".desg-subtitle"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // 4. Price box: elastic scale bounce — dramatic BOOM
    gsap.fromTo(
      section.querySelector(".desg-price"),
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "elastic.out(1.2, 0.4)",
        scrollTrigger: {
          trigger: section.querySelector(".desg-price"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // 5. Flavor cards: batch — alternating sides
    const allCards = section.querySelectorAll(".desg-card");
    if (allCards.length) {
      gsap.set(allCards, { opacity: 0 });
      ScrollTrigger.batch(allCards, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((el, i) => {
            gsap.fromTo(
              el,
              { opacity: 0, x: i % 2 === 0 ? -100 : 100, rotation: i % 2 === 0 ? -8 : 8 },
              { opacity: 1, x: 0, rotation: 0, duration: 0.7, ease: "power3.out", delay: i * 0.1 }
            );
          });
        },
      });
    }

    // 6. Ingredient pills: slide from opposite sides
    gsap.fromTo(
      section.querySelector(".desg-ingredient-left"),
      { opacity: 0, x: -120 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section.querySelector(".desg-ingredient-left"),
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );

    gsap.fromTo(
      section.querySelector(".desg-ingredient-right"),
      { opacity: 0, x: 120 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section.querySelector(".desg-ingredient-right"),
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );

    // 7. Pro tip: typewriter reveal via clip-path
    const protip = section.querySelector(".desg-protip");
    if (protip) {
      gsap.set(protip, { clipPath: "inset(0 100% 0 0)" });
      gsap.to(protip, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.4,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: protip,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="desguayabator"
      className="py-16 sm:py-24 bg-dark relative overflow-hidden"
    >
      {/* Epic background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full filter blur-[150px] opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[150px] opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full filter blur-[200px] opacity-10 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Badge exclusivo */}
          <div className="desg-badge inline-flex items-center gap-2 bg-linear-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-full px-4 sm:px-6 py-2 mb-6">
            <AlertCircle
              className="text-emerald-400 animate-pulse hidden sm:block"
              size={18}
            />
            <span className="text-emerald-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
              ¡Cura Guayabos Garantizado!
            </span>
            <AlertCircle
              className="text-emerald-400 animate-pulse hidden sm:block"
              size={18}
            />
          </div>

          {/* Título principal */}
          <h2 className="desg-title text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6">
            <span className="bg-linear-to-r from-emerald-400 via-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
              DESGUAYABATOR
            </span>
          </h2>

          {/* Subtítulo */}
          <p className="desg-subtitle text-base sm:text-xl md:text-2xl text-gray max-w-3xl mx-auto mb-4 px-2">
            La bebida más famosa de Cumbal para{" "}
            <span className="text-emerald-400 font-bold">curar el guayabo</span>.
            Fórmula secreta con Electrolit + Bonfiest para revivir después de
            una noche épica
          </p>

          {/* Info de ingredientes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
            <div className="desg-ingredient-left flex items-center gap-2 bg-dark-secondary/80 border border-emerald-500/30 rounded-full px-4 sm:px-5 py-2 sm:py-3">
              <Zap className="text-cyan-400" size={18} />
              <span className="text-light font-semibold text-sm sm:text-base">
                Electrolit
              </span>
              <span className="text-gray text-xs sm:text-sm">
                Hidratación Total
              </span>
            </div>
            <span className="text-emerald-400 text-xl sm:text-2xl font-bold">
              +
            </span>
            <div className="desg-ingredient-right flex items-center gap-2 bg-dark-secondary/80 border border-emerald-500/30 rounded-full px-4 sm:px-5 py-2 sm:py-3">
              <Heart className="text-red-400" size={18} />
              <span className="text-light font-semibold text-sm sm:text-base">
                Bonfiest
              </span>
              <span className="text-gray text-xs sm:text-sm">
                Alivio Express
              </span>
            </div>
          </div>
        </div>

        {/* Precio destacado */}
        <div className="desg-price text-center mb-12">
          <div className="inline-flex flex-col items-center bg-linear-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 rounded-3xl px-8 sm:px-12 py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-cyan-500/10 animate-pulse"></div>
            <span className="text-gray text-base sm:text-lg mb-2 relative z-10">
              Precio único
            </span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
              {formatPrice(defaultPrice)}
            </span>
            <span className="text-emerald-400 text-sm mt-2 relative z-10">
              Cualquier sabor
            </span>
          </div>
        </div>

        {/* Sabores Grid */}
        <div className="mb-8">
          <h3 className="text-center text-2xl font-bold text-light mb-8">
            Elige tu sabor de{" "}
            <span className="text-emerald-400">Electrolit</span>
          </h3>
        </div>

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => <FlavorSkeleton key={i} />)
            : products.map((product, index) => (
                <FlavorCard key={product.id} product={product} index={index} />
              ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="desg-protip text-gray text-lg">
            <Zap className="inline text-emerald-400 mr-2" size={20} />
            <span className="text-emerald-400 font-semibold">
              Pro tip:
            </span>{" "}
            Pídelo antes de que el guayabo te gane la batalla
            <Zap className="inline text-emerald-400 ml-2" size={20} />
          </p>
        </div>
      </div>
    </section>
  );
};

export default Desguayabator;
