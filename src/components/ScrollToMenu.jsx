import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToCarta = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando se ha hecho scroll más allá de la navegación rápida
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToCarta = () => {
    // "menu" es la navegación rápida; en campañas que la reemplazan (la carta
    // de Navidad) no existe, y entonces se sube al inicio de la carta.
    const target = document.getElementById("menu") || document.getElementById("carta");
    if (!target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // 56 px: el encabezado fijo de la página, para que no tape el título.
    const top = target.getBoundingClientRect().top + window.scrollY - 56;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToCarta}
          // En móvil se apoya sobre la barra de pestañas, que ocupa el fondo
          className="fb-card fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full md:bottom-6"
          aria-label="Ir a la carta"
        >
          <ArrowUp className="text-light/70" size={19} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToCarta;
