import React, { useMemo } from "react";
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
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";
// import SalchipapasPromoBanner from "@/components/SalchipapasPromoBanner"; // desactivado por hoy (lunes)

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
    gradient: "from-blue-500 to-grass",
    icon: Droplets,
    items: [{ name: "Botella de Agua", price: "$2.000" }],
  },
  {
    id: "que-te-provoca",
    name: "Recomendador de Bebidas",
    gradient: "from-blue-500 to-gold",
    icon: Sparkles,
    description: "Deja que te recomendemos la bebida perfecta para ti.",
  },
  {
    id: "descuento-redes",
    name: "Descuento por Redes",
    gradient: "from-red-500 to-gold",
    icon: Share2,
    description: "Siguenos en redes sociales y obtendras un descuento.",
  },
  {
    id: "descuento-cumple",
    name: "Descuento de Cumple",
    gradient: "from-gold to-red-500",
    icon: Cake,
    description: "Si es tu cumple, tendras un descuento especial.",
  },
  {
    id: "solicitar-cancion",
    name: "Pedir Cancion",
    gradient: "from-grass to-gold",
    icon: Music,
    description: "Pide tu cancion favorita y la ponemos para ti.",
  },
  {
    id: "feedback",
    name: "Tu Opinion",
    gradient: "from-grass to-blue-500",
    icon: MessageSquare,
    description: "Dejanos tu opinion, sugerencias o comentarios.",
  },
  {
    id: "frostbyte-play",
    name: "Frostbyte Play",
    gradient: "from-grass to-gold",
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

const CategoryGroup = ({ category }) => {
  const { data, isLoading } = useProductsByCategory(category.slug);
  const products = data?.results || [];
  const sectionId = SECTION_IDS[category.slug];

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
          className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wide sm:tracking-wider text-gold min-w-0"
        >
          {category.name}
        </h3>
        {sectionId && (
          <button
            onClick={() => scrollTo(sectionId)}
            className="liquid-glass-pill group flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-gold backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.12] px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-gold/30 transition-all duration-200 cursor-pointer flex-shrink-0"
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
                  <span className="text-gold font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
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
                        <span className="text-gold font-bold text-xs sm:text-sm md:text-base">
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
            className="text-base sm:text-lg md:text-2xl font-black uppercase tracking-wide sm:tracking-wider text-gold min-w-0 truncate"
          >
            {section.name}
          </h3>
        </div>
        <button
          onClick={() => scrollTo(section.id)}
          className="liquid-glass-pill group flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-gold backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.12] px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-gold/30 transition-all duration-200 cursor-pointer flex-shrink-0"
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
              <span className="text-gold font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
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
    <section id="carta" className="py-10 sm:py-16 relative overflow-hidden bg-dark">
      <Mundial26Backdrop />

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Mundial 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-3">
            <span className="text-light">
              NUESTRA CARTA
            </span>
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto">
            Todos nuestros productos y precios. Toca{" "}
            <span className="text-gold/70">"Ver detalles"</span> en cada
            seccion para ver imagenes y mas info.
          </p>
        </div>

        {/* Hero promocional: salchipapas (Frostbyte Food) */}
        {/* Hoy (lunes) no se ofrecen salchipapas; descomentar para reactivar */}
        {/* <SalchipapasPromoBanner /> */}

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
