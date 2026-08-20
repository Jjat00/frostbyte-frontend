import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useActiveCategories, useStoreConfig } from "@/hooks";

/**
 * Configuración de navegación para cada sección
 * categorySlug: slug de la categoría en la BD (null para secciones no-categoría)
 */
const SECTION_CONFIG = {
  carta:         { name: "Carta",         href: "#carta",         categorySlug: null },
  domicilios:    { name: "Domicilios",    href: "#domicilios",    categorySlug: null },
  desguayabator: { name: "Desguayabator", href: "#desguayabator", categorySlug: null },
  agua:          { name: "Agua",          href: "#agua",          categorySlug: null },
  granizados:    { name: "Granizados",    href: "#granizados",    categorySlug: "granizados" },
  frappes:       { name: "Frappés",       href: "#frappes",       categorySlug: "frappes" },
  sodas:         { name: "Sodas",         href: "#sodas",         categorySlug: "sodas-italianas" },
  micheladas:    { name: "Micheladas",    href: "#micheladas",    categorySlug: "micheladas" },
  cervezas:      { name: "Cervezas",      href: "#cervezas",      categorySlug: "cervezas" },
  cuates:        { name: "Cuates",        href: "#cuates",        categorySlug: "cuates" },
  luladas:       { name: "Luladas",       href: "#luladas",       categorySlug: "luladas" },
  mocktails:     { name: "Cócteles",      href: "#mocktails",     categorySlug: "mocktails" },
  shots:         { name: "Shots",         href: "#shots",         categorySlug: "shots" },
  vinos:         { name: "Vinos",         href: "#vinos",         categorySlug: "vinos" },
  "que-te-provoca":   { name: "¿Qué te provoca?", href: "#que-te-provoca", categorySlug: null },
  "descuento-redes":  { name: "Descuento redes",  href: "#descuento-redes",  categorySlug: null },
  "descuento-cumple": { name: "Cumpleaños",       href: "#descuento-cumple", categorySlug: null },
  "solicitar-cancion": { name: "Pedir canción", href: "#solicitar-cancion", categorySlug: null },
  feedback:      { name: "Tu opinión",    href: "#feedback",      categorySlug: null },
  "frostbyte-play": { name: "Frostbyte Play", href: "#frostbyte-play", categorySlug: null },
};

// Orden por defecto de las secciones en el QuickNav
const DEFAULT_SECTION_ORDER = [
  "carta",
  "domicilios",
  "desguayabator",
  "agua",
  "granizados",
  "frappes",
  "sodas",
  "micheladas",
  "cervezas",
  "cuates",
  "luladas",
  "mocktails",
  "shots",
  "vinos",
  "que-te-provoca",
  "descuento-redes",
  "descuento-cumple",
  "solicitar-cancion",
  "feedback",
  "frostbyte-play",
];

const QuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categoriesData } = useActiveCategories();
  const { data: storeConfig } = useStoreConfig();
  // Con los domicilios apagados el servicio no se nombra en ninguna parte,
  // tampoco como atajo de la carta.
  const inAppOrdering = !!storeConfig?.customer_ordering_enabled;

  // Detectar si estamos en una ruta de mesa
  const isTableRoute = location.pathname.startsWith('/mesa/');

  // Obtener los slugs de categorías activas
  const activeCategorySlugs = useMemo(() => {
    if (!categoriesData?.results) return new Set();
    return new Set(
      categoriesData.results
        .filter((cat) => cat.is_active)
        .map((cat) => cat.slug)
    );
  }, [categoriesData]);

  // Filtrar secciones según categorías activas
  const sections = useMemo(() => {
    return DEFAULT_SECTION_ORDER
      .map((key) => SECTION_CONFIG[key])
      .filter((section) => {
        // Si no tiene categorySlug, siempre mostrar (son secciones especiales)
        if (!section.categorySlug) return true;
        // Si tiene categorySlug, solo mostrar si la categoría está activa
        return activeCategorySlugs.has(section.categorySlug);
      });
  }, [activeCategorySlugs]);

  const handleClick = (href, isRoute = false) => {
    if (isRoute) {
      navigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const visibleSections = sections.filter(
    (s) =>
      (isTableRoute || s.name !== "Frostbyte Play") &&
      (inAppOrdering || s.name !== "Domicilios")
  );

  return (
    <section
      id="menu"
      className="fb-section fb-section--plain border-y border-white/[0.06] py-7"
    >
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal mx-auto flex max-w-4xl flex-col items-center gap-4">
          <span className="fb-eyebrow">Explorar carta</span>

          {/* Los atajos son la tabla de contenidos de la carta: van todos
              iguales y en neutro. El color lo pone la sección a la que
              llevan, no el atajo. */}
          <div className="flex flex-wrap justify-center gap-2">
            {visibleSections.map((section) => (
              <button
                key={section.name}
                onClick={() => handleClick(section.href, section.isRoute)}
                className="fb-pill cursor-pointer whitespace-nowrap"
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickNav;
