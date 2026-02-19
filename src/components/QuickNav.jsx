import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useActiveCategories } from "@/hooks";

/**
 * Configuración de navegación para cada sección
 * categorySlug: slug de la categoría en la BD (null para secciones no-categoría)
 */
const SECTION_CONFIG = {
  desguayabator: { name: "Desguayabator", href: "#desguayabator", categorySlug: null },
  granizados:    { name: "Granizados",    href: "#granizados",    categorySlug: "granizados" },
  frappes:       { name: "Frappés",       href: "#frappes",       categorySlug: "frappes" },
  sodas:         { name: "Sodas",         href: "#sodas",         categorySlug: "sodas-italianas" },
  micheladas:    { name: "Micheladas",    href: "#micheladas",    categorySlug: "micheladas" },
  cervezas:      { name: "Cervezas",      href: "#cervezas",      categorySlug: "cervezas" },
  cuates:        { name: "Cuates",        href: "#cuates",        categorySlug: "cuates" },
  mocktails:     { name: "Cócteles",      href: "#mocktails",     categorySlug: "mocktails" },
  shots:         { name: "Shots",         href: "#shots",         categorySlug: "shots" },
  vinos:         { name: "Vinos",         href: "#vinos",         categorySlug: "vinos" },
  "solicitar-cancion": { name: "Pedir canción", href: "#solicitar-cancion", categorySlug: null },
  feedback:      { name: "Tu opinión",    href: "#feedback",      categorySlug: null },
  "frostbyte-play": { name: "Frostbyte Play", href: "#frostbyte-play", categorySlug: null },
};

// Orden por defecto de las secciones en el QuickNav
const DEFAULT_SECTION_ORDER = [
  "desguayabator",
  "granizados",
  "frappes",
  "sodas",
  "micheladas",
  "cervezas",
  "cuates",
  "mocktails",
  "shots",
  "vinos",
  "solicitar-cancion",
  "feedback",
  "frostbyte-play",
];

const QuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categoriesData } = useActiveCategories();

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
    (s) => isTableRoute || s.name !== "Frostbyte Play"
  );

  return (
    <section id="menu" className="py-8 bg-dark border-y border-white/10 relative">
      <div className="container mx-auto px-4">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center text-white/40 text-xs uppercase tracking-[0.2em] font-semibold mb-5"
        >
          Explorar carta
        </motion.p>

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {visibleSections.map((section, index) => (
            <motion.button
              key={section.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(section.href, section.isRoute)}
              className="px-5 py-2 rounded-full border border-white/20 text-white/70 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:border-primary/60 hover:text-white hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,0,212,0.2)]"
            >
              {section.name}
            </motion.button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default QuickNav;
