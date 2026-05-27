import React, { useRef, useEffect } from "react";
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
import { useProductsByCategory, useInViewport, useIsMobile } from "@/hooks";
import { getProductStyles } from "@/lib/productStyles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Utilidad para formatear precios colombianos
const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const PoisonOption = ({ name, brand, price, icon: Icon, gradient }) => (
  <div className="poison-card w-[calc(50%-6px)] sm:w-[140px] lg:w-[160px] bg-dark/60 border border-purple-500/30 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
    <div
      className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
    >
      <Icon className="text-dark" size={24} />
    </div>
    <h4 className="text-light font-bold text-base">{name}</h4>
    <p className="text-gray text-xs mb-2">{brand}</p>
    <span className="text-purple-400 font-bold text-sm">{price}</span>
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
  const ringColor = styles.ringColor || "border-cyan-400";

  return (
    <div className="gran-card group relative h-full">
      <div className="relative flex flex-col items-center h-full rounded-3xl p-6 overflow-hidden bg-white/[0.02] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.2),0_0_50px_rgba(34,211,238,0.05)]">
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
        <p className="relative z-10 text-slate-400 text-sm text-center mb-5 leading-relaxed max-w-[260px]">
          {product.description}
        </p>

        {/* Precios */}
        <div className="relative z-10 mt-auto w-full">
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/[0.08]">
            {variants.map((variant) => (
              <div key={variant.id || variant.name} className="flex flex-col items-center">
                <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-widest mb-0.5">
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
    gradient: "from-purple-400 to-fuchsia-600",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
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

const Granizados = ({ showExtras = true }) => {
  const { data, isLoading, error } = useProductsByCategory("granizados");
  const products = data?.results || [];

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const isInView = useInViewport(sectionRef);
  const isMobile = useIsMobile();

  // Canvas animation — pausada cuando la seccion no esta en viewport
  useEffect(() => {
    if (!isInView) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    let rafId;
    const mouse = { x: -9999, y: -9999 };
    const CELL = 32;
    const HOVER_RADIUS = 160;

    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;
      const cols = Math.ceil(canvas.width / CELL) + 1;
      const rows = Math.ceil(canvas.height / CELL) + 1;

      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          const baseX = col * CELL;
          const baseY = row * CELL;

          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetX = 0;
          let offsetY = 0;
          let alpha = 0.12;
          let r = 34, g = 211, b = 238;

          if (dist < HOVER_RADIUS) {
            const intensity = 1 - dist / HOVER_RADIUS;
            const ease = intensity * intensity;

            const wave = Math.sin(dist * 0.06 - t * 4) * 10 * ease;
            const angle = Math.atan2(dy, dx);
            offsetX = Math.cos(angle) * wave;
            offsetY = Math.sin(angle) * wave;

            alpha = 0.12 + ease * 0.55;
            r = Math.round(34 * (1 - ease) + 255 * ease);
            g = Math.round(211 * (1 - ease) + 0 * ease);
            b = Math.round(238 * (1 - ease) + 212 * ease);
          }

          const px = baseX + offsetX;
          const py = baseY + offsetY;

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.5;

          // horizontal line segment
          if (col < cols) {
            const ndx = (baseX + CELL) - mouse.x;
            const ndy = baseY - mouse.y;
            const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
            let nox = 0, noy = 0;
            if (nDist < HOVER_RADIUS) {
              const ni = 1 - nDist / HOVER_RADIUS;
              const ne = ni * ni;
              const nw = Math.sin(nDist * 0.06 - t * 4) * 10 * ne;
              const na = Math.atan2(ndy, ndx);
              nox = Math.cos(na) * nw;
              noy = Math.sin(na) * nw;
            }
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(baseX + CELL + nox, baseY + noy);
            ctx.stroke();
          }

          // vertical line segment
          if (row < rows) {
            const ndx = baseX - mouse.x;
            const ndy = (baseY + CELL) - mouse.y;
            const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
            let nox = 0, noy = 0;
            if (nDist < HOVER_RADIUS) {
              const ni = 1 - nDist / HOVER_RADIUS;
              const ne = ni * ni;
              const nw = Math.sin(nDist * 0.06 - t * 4) * 10 * ne;
              const na = Math.atan2(ndy, ndx);
              nox = Math.cos(na) * nw;
              noy = Math.sin(na) * nw;
            }
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(baseX + nox, baseY + CELL + noy);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [isInView]);

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
      className="py-20 relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950"
    >
      {/* SVG filter para vidrio grueso */}
      <ThickGlassFilter />

      {/* Grid canvas interactivo (solo desktop) */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Neon ambiental — cyan + magenta estilo Frostbyte */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/70 rounded-full filter blur-[100px]" />
      </div>

      {/* Líneas divisoras con toque neón */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="gran-title text-4xl md:text-6xl font-black mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="bg-linear-to-r from-cyan-200 via-primary to-secondary bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(34,211,238,0.3)]">
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
            <div className="bg-linear-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full filter blur-[80px]"></div>
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="poison-title flex items-center justify-center gap-3 mb-4">
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
                <div className="poison-formula mt-8 flex justify-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-purple-500/30">
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🍹 Granizado
                    </span>
                    <Plus className="text-purple-400 shrink-0" size={20} />
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🥃 Shot
                    </span>
                    <span className="text-purple-400 text-xl sm:text-2xl shrink-0">
                      =
                    </span>
                    <span className="text-purple-400 font-bold text-sm sm:text-base whitespace-nowrap">
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
            <div className="relative bg-linear-to-br from-emerald-900/20 via-dark/60 to-cyan-900/20 border-2 border-cyan-500/30 rounded-3xl overflow-hidden">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src="/shots2.png"
                  alt="Shots de Sabores"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/70 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 to-emerald-500/5" />
              </div>

              <div className="relative z-10 px-6 sm:px-10 pb-8 -mt-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Sparkles
                      className="text-cyan-400 hidden sm:block"
                      size={28}
                    />
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-light text-center">
                      SHOTS DE{" "}
                      <span className="bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        SABORES
                      </span>
                    </h3>
                    <Sparkles
                      className="text-cyan-400 hidden sm:block"
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
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-dark/50 rounded-full px-3 sm:px-6 py-3 border border-cyan-500/30">
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      🍹 Granizado
                    </span>
                    <Plus className="text-cyan-400 shrink-0" size={20} />
                    <span className="text-light font-semibold text-sm sm:text-base whitespace-nowrap">
                      💧 Shot de Sabor
                    </span>
                    <span className="text-cyan-400 text-xl sm:text-2xl shrink-0">
                      =
                    </span>
                    <span className="text-cyan-400 font-bold text-sm sm:text-base whitespace-nowrap">
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
