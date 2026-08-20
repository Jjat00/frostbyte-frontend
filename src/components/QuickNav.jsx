import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
    <section id="menu" className="py-8 backdrop-blur-md bg-white/[0.02] border-y border-white/[0.08] relative">
      <div className="container mx-auto px-4">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 mb-5"
        >
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">
            Explorar carta
          </p>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-primary/60" />
          </motion.div>
        </motion.div>

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
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(section.href, section.isRoute)}
              className="liquid-glass-pill group relative px-5 py-2.5 rounded-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] text-white/70 text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:border-primary/50 hover:text-white hover:bg-white/[0.1] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent),inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {section.name}
                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-primary transition-colors" />
              </span>
            </motion.button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default QuickNav;
