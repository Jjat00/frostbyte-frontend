import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Snowflake,
  Coffee,
  Sparkles,
  Wine,
  Beer,
  GlassWater,
  Heart,
  Music,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { useActiveCategories } from "@/hooks";

/**
 * Configuración de navegación para cada sección
 * categorySlug: slug de la categoría en la BD (null para secciones no-categoría)
 */
const SECTION_CONFIG = {
  desguayabator: {
    name: "Desguayabator",
    href: "#desguayabator",
    icon: Heart,
    gradient: "from-emerald-400 to-cyan-500",
    description: "¡Cura guayabos!",
    featured: true,
    categorySlug: null, // No es una categoría de productos
  },
  granizados: {
    name: "Granizados",
    href: "#granizados",
    icon: Snowflake,
    gradient: "from-cyan-400 to-blue-500",
    description: "Hielo frutal",
    categorySlug: "granizados",
  },
  frappes: {
    name: "Frappés",
    href: "#frappes",
    icon: Coffee,
    gradient: "from-amber-600 to-orange-700",
    description: "Café helado",
    categorySlug: "frappes",
  },
  sodas: {
    name: "Sodas",
    href: "#sodas",
    icon: Sparkles,
    gradient: "from-pink-400 to-red-500",
    description: "Italianas",
    categorySlug: "sodas-italianas",
  },
  micheladas: {
    name: "Micheladas",
    href: "#micheladas",
    icon: Beer,
    gradient: "from-orange-400 to-red-500",
    description: "Cerveza picante",
    categorySlug: "micheladas",
  },
  cervezas: {
    name: "Cervezas",
    href: "#cervezas",
    icon: Beer,
    gradient: "from-yellow-400 to-amber-500",
    description: "Frías y refrescantes",
    categorySlug: "cervezas",
  },
  cuates: {
    name: "Cuates",
    href: "#cuates",
    icon: Sparkles,
    gradient: "from-lime-400 to-green-500",
    description: "Cóctel con tequila",
    categorySlug: "cuates",
  },
  mocktails: {
    name: "Cócteles",
    href: "#mocktails",
    icon: Wine,
    gradient: "from-purple-400 to-pink-500",
    description: "Clásicos",
    categorySlug: "mocktails",
  },
  shots: {
    name: "Shots",
    href: "#shots",
    icon: GlassWater,
    gradient: "from-emerald-400 to-teal-500",
    description: "Licores premium",
    categorySlug: "shots",
  },
  vinos: {
    name: "Vinos",
    href: "#vinos",
    icon: Wine,
    gradient: "from-red-500 to-red-700",
    description: "Tintos chilenos",
    categorySlug: "vinos",
  },
  "solicitar-cancion": {
    name: "Solicitar Canción",
    href: "#solicitar-cancion",
    icon: Music,
    gradient: "from-purple-400 to-pink-500",
    description: "Pide tu canción",
    featured: true,
    categorySlug: null,
  },
  feedback: {
    name: "Tu Opinion",
    href: "#feedback",
    icon: MessageSquare,
    gradient: "from-teal-400 to-cyan-500",
    description: "Dejanos tu feedback",
    featured: true,
    categorySlug: null,
  },
  "frostbyte-play": {
    name: "Frostbyte Play",
    href: "#frostbyte-play",
    icon: Gamepad2,
    gradient: "from-primary to-secondary",
    description: "Juegos divertidos",
    featured: true,
    categorySlug: null,
  },
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

  return (
    <section id="menu" className="py-12 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary rounded-full filter blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-primary" size={20} fill="currentColor" />
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">
              Nuestra Carta
            </span>
            <Heart className="text-primary" size={20} fill="currentColor" />
          </div>
          <p className="text-gray text-sm">Explora y comparte con quienes mas quieres</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {sections
            .filter(section => isTableRoute || section.name !== "Frostbyte Play")
            .map((section, index) => (
            <motion.button
              key={section.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(section.href, section.isRoute)}
              className={`group relative flex flex-col items-center gap-2 p-4 bg-dark-secondary/50 border rounded-2xl transition-all duration-300 ${
                section.featured
                  ? section.name === "Frostbyte Play"
                    ? "border-primary/50 hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                    : section.name === "Tu Opinion"
                    ? "border-teal-500/50 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
                    : "border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
                  : "border-gray/20 hover:border-primary/50"
              } hover:bg-dark-secondary`}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
              >
                <section.icon className="text-dark" size={24} />
              </div>
              <span
                className={`font-semibold text-sm transition-colors duration-300 ${
                  section.featured
                    ? section.name === "Frostbyte Play"
                      ? "text-primary group-hover:text-primary/80"
                      : section.name === "Tu Opinion"
                      ? "text-teal-400 group-hover:text-teal-300"
                      : "text-emerald-400 group-hover:text-emerald-300"
                    : "text-light group-hover:text-primary"
                }`}
              >
                {section.name}
              </span>
              <span
                className={`text-xs hidden md:block ${
                  section.featured
                    ? section.name === "Frostbyte Play"
                      ? "text-primary/70"
                      : section.name === "Tu Opinion"
                      ? "text-teal-400/70"
                      : "text-emerald-400/70"
                    : "text-gray"
                }`}
              >
                {section.description}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickNav;
