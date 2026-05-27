import React, { useMemo, useRef, useEffect } from "react";
import {
  ChevronRight,
  Eye,
  Droplets,
  Share2,
  Cake,
  Music,
  MessageSquare,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useActiveCategories, useProductsByCategory } from "@/hooks";
import { getCategoryStyles } from "@/lib/productStyles";

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

const SECTION_IDS = {
  granizados: "granizados",
  frappes: "frappes",
  "sodas-italianas": "sodas",
  "sodas-micheladas": "sodas",
  sodas: "sodas",
  mocktails: "mocktails",
  cocteles: "mocktails",
  shots: "shots",
  micheladas: "micheladas",
  vinos: "vinos",
  cervezas: "cervezas",
  cuates: "cuates",
  luladas: "luladas",
  desguayabator: "desguayabator",
};

const SPECIAL_SECTIONS = [
  {
    id: "agua",
    name: "Agua",
    gradient: "from-cyan-400 to-blue-400",
    icon: Droplets,
    items: [{ name: "Botella de Agua", price: "$2.000" }],
  },
  {
    id: "que-te-provoca",
    name: "Recomendador de Bebidas",
    gradient: "from-violet-400 to-fuchsia-500",
    icon: Sparkles,
    description: "Deja que te recomendemos la bebida perfecta para ti.",
  },
  {
    id: "descuento-redes",
    name: "Descuento por Redes",
    gradient: "from-pink-400 to-rose-500",
    icon: Share2,
    description: "Siguenos en redes sociales y obtendras un descuento.",
  },
  {
    id: "descuento-cumple",
    name: "Descuento de Cumple",
    gradient: "from-amber-400 to-orange-500",
    icon: Cake,
    description: "Si es tu cumple, tendras un descuento especial.",
  },
  {
    id: "solicitar-cancion",
    name: "Pedir Cancion",
    gradient: "from-green-400 to-emerald-500",
    icon: Music,
    description: "Pide tu cancion favorita y la ponemos para ti.",
  },
  {
    id: "feedback",
    name: "Tu Opinion",
    gradient: "from-teal-400 to-cyan-500",
    icon: MessageSquare,
    description: "Dejanos tu opinion, sugerencias o comentarios.",
  },
  {
    id: "frostbyte-play",
    name: "Frostbyte Play",
    gradient: "from-violet-400 to-amber-400",
    icon: Gamepad2,
    tableOnly: true,
    description: "Juega mientras esperas tu pedido.",
    items: [
      { name: "Duelo Frostbyte", price: "Gratis" },
      { name: "Impostor Frostbyte", price: "Gratis" },
    ],
  },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const CartaBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    let time = 0;

    const particles = [];
    const orbs = [];

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      init();
    };

    const init = () => {
      particles.length = 0;
      orbs.length = 0;
      const w = canvas.width;
      const h = canvas.height;
      // floating particles
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.1 - Math.random() * 0.3,
          size: 0.8 + Math.random() * 2,
          alpha: 0.15 + Math.random() * 0.4,
          hue: [300, 190, 260, 220][Math.floor(Math.random() * 4)],
          phase: Math.random() * Math.PI * 2,
        });
      }
      // large glowing orbs that drift
      orbs.push(
        { x: w * 0.15, y: h * 0.25, r: 200, hue: 300, speed: 0.2, phase: 0 },
        { x: w * 0.85, y: h * 0.4, r: 180, hue: 190, speed: 0.15, phase: 2 },
        { x: w * 0.5, y: h * 0.7, r: 220, hue: 260, speed: 0.18, phase: 4 },
        { x: w * 0.3, y: h * 0.9, r: 150, hue: 190, speed: 0.22, phase: 1 },
        { x: w * 0.7, y: h * 0.15, r: 160, hue: 300, speed: 0.17, phase: 3 },
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // orbs - bright enough to see through glass
      for (const orb of orbs) {
        const ox = orb.x + Math.sin(time * orb.speed + orb.phase) * 60;
        const oy = orb.y + Math.cos(time * orb.speed * 0.7 + orb.phase) * 40;
        const pulse = 0.8 + Math.sin(time * 0.5 + orb.phase) * 0.2;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r * pulse);
        grad.addColorStop(0, `hsla(${orb.hue}, 90%, 55%, 0.25)`);
        grad.addColorStop(0.3, `hsla(${orb.hue}, 80%, 45%, 0.12)`);
        grad.addColorStop(0.7, `hsla(${orb.hue}, 70%, 35%, 0.04)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // particles with glow
      for (const p of particles) {
        p.x += p.vx + Math.sin(time + p.phase) * 0.15;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        const flicker = 0.6 + Math.sin(time * 1.5 + p.phase) * 0.4;
        const a = p.alpha * flicker;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, ${a * 0.5})`;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // connecting lines between nearby particles
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.strokeStyle = `rgba(200, 180, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

const CategoryGroup = ({ category }) => {
  const { data, isLoading } = useProductsByCategory(category.slug);
  const products = data?.results || [];
  const sectionId = SECTION_IDS[category.slug];
  const styles = getCategoryStyles(category.slug);

  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-6 bg-white/8 rounded w-40 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between py-2">
            <div className="h-4 bg-white/6 rounded w-48" />
            <div className="h-4 bg-white/6 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="mb-10">
      {/* Category header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-white/[0.08]">
        <h3
          className={`text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wide sm:tracking-wider bg-linear-to-r ${styles.gradient} bg-clip-text text-transparent min-w-0`}
        >
          {category.name}
        </h3>
        {sectionId && (
          <button
            onClick={() => scrollTo(sectionId)}
            className="liquid-glass-pill group flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-primary backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.12] px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-primary/30 transition-all duration-200 cursor-pointer flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver detalles</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Product list */}
      <ul className="space-y-0.5">
        {products.map((product) => {
          const variants = product.variants || [];
          const defaultVariant =
            variants.find((v) => v.is_default) || variants[0];
          const hasMultipleVariants = variants.length > 1;

          return (
            <li key={product.id} className="py-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/90 text-xs sm:text-sm md:text-base font-medium min-w-0 break-words">
                  {product.name}
                </span>
                <span className="flex-1 border-b border-dotted border-white/[0.1] mb-1 min-w-[12px]" />
                {!hasMultipleVariants && (
                  <span className="text-primary font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
                    {formatPrice(defaultVariant?.price)}
                  </span>
                )}
                {hasMultipleVariants && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {variants.map((variant) => (
                      <div
                        key={variant.id || variant.name}
                        className="flex flex-col items-end"
                      >
                        <span className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider leading-none">
                          {variant.name}
                        </span>
                        <span className="text-primary font-bold text-xs sm:text-sm md:text-base">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const SpecialSectionItem = ({ section }) => {
  const Icon = section.icon;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 flex-shrink-0" />
          <h3
            className={`text-base sm:text-lg md:text-2xl font-black uppercase tracking-wide sm:tracking-wider bg-linear-to-r ${section.gradient} bg-clip-text text-transparent min-w-0 truncate`}
          >
            {section.name}
          </h3>
        </div>
        <button
          onClick={() => scrollTo(section.id)}
          className="liquid-glass-pill group flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-primary backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.12] px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-primary/30 transition-all duration-200 cursor-pointer flex-shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ir a seccion</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {section.description && (
        <p className="text-white/50 text-xs sm:text-sm md:text-base mb-2">
          {section.description}
        </p>
      )}
      {section.items && (
        <ul className="space-y-0.5">
          {section.items.map((item) => (
            <li
              key={item.name}
              className="flex items-baseline gap-1.5 py-1.5"
            >
              <span className="text-white/90 text-xs sm:text-sm md:text-base font-medium min-w-0">
                {item.name}
              </span>
              <span className="flex-1 border-b border-dotted border-white/[0.1] mb-1 min-w-[12px]" />
              <span className="text-primary font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
                {item.price}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CartaList = () => {
  const location = useLocation();
  const isTableRoute = location.pathname.startsWith("/mesa/");

  const { data: categoriesData, isLoading: categoriesLoading } =
    useActiveCategories();

  const activeCategories = useMemo(() => {
    if (!categoriesData?.results) return [];
    return categoriesData.results
      .filter((cat) => cat.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [categoriesData]);

  if (categoriesLoading) {
    return (
      <section className="py-16 bg-dark">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="h-10 bg-white/8 rounded w-56 mx-auto mb-12 animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-8 animate-pulse">
              <div className="h-6 bg-white/8 rounded w-40 mb-4" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between py-2">
                  <div className="h-4 bg-white/6 rounded w-48" />
                  <div className="h-4 bg-white/6 rounded w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!activeCategories.length) return null;

  return (
    <section id="carta" className="py-10 sm:py-16 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0a14, #0d0d1a, #0a0a14)' }}>
      <CartaBackground />

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="bg-linear-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              NUESTRA CARTA
            </span>
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto">
            Todos nuestros productos y precios. Toca{" "}
            <span className="text-primary/70">"Ver detalles"</span> en cada
            seccion para ver imagenes y mas info.
          </p>
        </div>

        {/* Carta border container */}
        <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl sm:rounded-2xl px-4 py-5 sm:p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]">
          {/* Categorias de productos (desde la API) */}
          {activeCategories.map((category) => (
            <CategoryGroup key={category.slug} category={category} />
          ))}

          {/* Separador */}
          <div className="my-6 sm:my-8 flex items-center gap-3 sm:gap-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="liquid-glass-pill text-white/25 text-[10px] sm:text-xs uppercase tracking-widest font-semibold whitespace-nowrap backdrop-blur-sm bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.06]">
              Mas en Frostbyte
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Secciones especiales */}
          {SPECIAL_SECTIONS
            .filter((section) => !section.tableOnly || isTableRoute)
            .map((section) => (
              <SpecialSectionItem key={section.id} section={section} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default CartaList;
