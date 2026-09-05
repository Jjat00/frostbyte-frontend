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
import { getCategoryStyles } from "@/lib/productStyles";
import SalchipapasPromoBanner from "@/components/SalchipapasPromoBanner";
import SectionHeading from "@/components/SectionHeading";

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
    <div className="aa-menu-category mb-10">
      {/* Cabecera de categoría: el nombre siempre en blanco, y el color del
          producto solo en el hilo de debajo (ver minimal.css). */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display min-w-0 text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-light sm:text-base">
            {category.name}
          </h3>
          {sectionId && (
            <button
              onClick={() => scrollTo(sectionId)}
              className="fb-pill flex-shrink-0 cursor-pointer px-2.5 py-1 text-[0.68rem]"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Ver detalles</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <span aria-hidden className="mt-2.5 flex items-center">
          <span className={`h-px w-11 bg-linear-to-r ${styles.gradient}`} />
          <span className="h-px flex-1 bg-white/[0.07]" />
        </span>
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
                <span className="min-w-0 break-words text-xs font-normal text-light/80 sm:text-sm md:text-[0.95rem]">
                  {product.name}
                </span>
                <span className="mb-1 min-w-[12px] flex-1 border-b border-dotted border-white/[0.08]" />
                {!hasMultipleVariants && (
                  <span className="flex-shrink-0 text-xs font-medium text-light sm:text-sm md:text-[0.95rem]">
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
                        <span className="text-[9px] uppercase leading-none tracking-[0.14em] text-light/35 sm:text-[10px]">
                          {variant.name}
                        </span>
                        <span className="text-xs font-medium text-light sm:text-sm md:text-[0.95rem]">
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
    <div className="aa-menu-category mb-10">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-light/45" />
            <h3 className="font-display min-w-0 truncate text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-light sm:text-base">
              {section.name}
            </h3>
          </div>
          <button
            onClick={() => scrollTo(section.id)}
            className="fb-pill flex-shrink-0 cursor-pointer px-2.5 py-1 text-[0.68rem]"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Ir a la sección</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <span aria-hidden className="mt-2.5 flex items-center">
          <span className={`h-px w-11 bg-linear-to-r ${section.gradient}`} />
          <span className="h-px flex-1 bg-white/[0.07]" />
        </span>
      </div>

      {section.description && (
        <p className="mb-2 text-xs text-light/50 sm:text-sm">
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
              <span className="min-w-0 text-xs font-normal text-light/80 sm:text-sm md:text-[0.95rem]">
                {item.name}
              </span>
              <span className="mb-1 min-w-[12px] flex-1 border-b border-dotted border-white/[0.08]" />
              <span className="flex-shrink-0 text-xs font-medium text-light sm:text-sm md:text-[0.95rem]">
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
    // La comida (Frostbyte Food) va de primera en la carta
    const isFood = (cat) => cat.business_name === "Frostbyte Food";
    return categoriesData.results
      .filter((cat) => cat.is_active)
      .sort(
        (a, b) => isFood(b) - isFood(a) || a.display_order - b.display_order,
      );
  }, [categoriesData]);

  if (categoriesLoading) {
    return (
      <section className="fb-section py-16">
        <div className="container relative z-10 mx-auto max-w-3xl px-4">
          <div className="mx-auto mb-12 h-8 w-56 animate-pulse rounded bg-white/[0.06]" />
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
    <section id="carta" className="fb-section py-12 sm:py-16">
      <div className="container relative z-10 mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow="Bebidas y comida"
          title="Nuestra carta"
          description={
            <>
              Todos los productos con su precio. Toca{" "}
              <span className="text-light/70">«Ver detalles»</span> en cada
              categoría para ver fotos y más información.
            </>
          }
          className="mb-9 sm:mb-12"
        />

        {/* Hero promocional: salchipapas (Frostbyte Food) */}
        <SalchipapasPromoBanner />

        {/* Carta border container */}
        <div className="fb-card aa-menu-paper px-4 py-6 sm:p-7 md:p-10">
          {/* Categorias de productos (desde la API) */}
          {activeCategories.map((category) => (
            <CategoryGroup key={category.slug} category={category} />
          ))}

          {/* Separador */}
          <div className="my-8 flex items-center gap-4 sm:my-10">
            <span className="fb-hairline flex-1" />
            <span className="fb-eyebrow whitespace-nowrap">
              Más en Frostbyte
            </span>
            <span className="fb-hairline flex-1" />
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
