import React from "react";
import { motion } from "framer-motion";
import {
  Snowflake,
  Coffee,
  Sparkles,
  Wine,
  Beer,
  GlassWater,
  Zap,
  Heart,
} from "lucide-react";

const QuickNav = () => {
  const sections = [
    {
      name: "Desguayabator",
      href: "#desguayabator",
      icon: Heart,
      gradient: "from-emerald-400 to-cyan-500",
      description: "¡Cura guayabos!",
      featured: true,
    },
    {
      name: "Granizados",
      href: "#granizados",
      icon: Snowflake,
      gradient: "from-cyan-400 to-blue-500",
      description: "Hielo frutal",
    },
    {
      name: "Frappés",
      href: "#frappes",
      icon: Coffee,
      gradient: "from-amber-600 to-orange-700",
      description: "Café helado",
    },
    {
      name: "Sodas",
      href: "#sodas",
      icon: Sparkles,
      gradient: "from-pink-400 to-red-500",
      description: "Italianas",
    },
    {
      name: "Micheladas",
      href: "#micheladas",
      icon: Beer,
      gradient: "from-orange-400 to-red-500",
      description: "Cerveza picante",
    },
    {
      name: "Cócteles",
      href: "#mocktails",
      icon: Wine,
      gradient: "from-purple-400 to-pink-500",
      description: "Clásicos",
    },
    {
      name: "Shots",
      href: "#shots",
      icon: GlassWater,
      gradient: "from-emerald-400 to-teal-500",
      description: "Licores premium",
    },
    {
      name: "Vinos",
      href: "#vinos",
      icon: Wine,
      gradient: "from-red-500 to-red-700",
      description: "Tintos chilenos",
    },
  ];

  const handleClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
            <Zap className="text-primary" size={20} />
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">
              Navegación Rápida
            </span>
            <Zap className="text-primary" size={20} />
          </div>
          <p className="text-gray text-sm">Explora nuestro menú completo</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {sections.map((section, index) => (
            <motion.button
              key={section.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(section.href)}
              className={`group relative flex flex-col items-center gap-2 p-4 bg-dark-secondary/50 border rounded-2xl transition-all duration-300 ${
                section.featured
                  ? "border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
                  : "border-gray/20 hover:border-primary/50"
              } hover:bg-dark-secondary`}
            >
              <div
                className={`w-12 h-12 bg-linear-to-br ${section.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
              >
                <section.icon className="text-dark" size={24} />
              </div>
              <span
                className={`font-semibold text-sm transition-colors duration-300 ${
                  section.featured
                    ? "text-emerald-400 group-hover:text-emerald-300"
                    : "text-light group-hover:text-primary"
                }`}
              >
                {section.name}
              </span>
              <span
                className={`text-xs hidden md:block ${
                  section.featured ? "text-emerald-400/70" : "text-gray"
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
