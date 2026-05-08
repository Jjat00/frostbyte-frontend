import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Sparkles, Snowflake } from "lucide-react";

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

// Partículas de hielo/café flotantes
const FloatingParticle = ({ delay, duration, startX, startY }) => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{ opacity: 0, x: startX, y: startY }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [startY, startY - 100],
      x: [startX, startX + (Math.random() - 0.5) * 40],
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  >
    <Snowflake className="text-rose-300/40" size={12} />
  </motion.div>
);

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const PROMO_KEY = "frostbyte_promo_cafe_shown";

  useEffect(() => {
    // Verificar si ya se mostró en esta sesión
    const hasShown = sessionStorage.getItem(PROMO_KEY);
    if (!hasShown) {
      // Mostrar después de un pequeño delay para mejor UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem(PROMO_KEY, "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleGoToGranizados = () => {
    setIsVisible(false);
    // Scroll suave a la sección de granizados
    const granizadosSection = document.getElementById("granizados");
    if (granizadosSection) {
      granizadosSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay oscuro con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md pointer-events-auto">
              {/* Glow effect detrás del modal */}
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/30 via-pink-500/20 to-rose-600/30 rounded-3xl blur-2xl animate-pulse" />

              {/* Contenedor principal */}
              <div className="relative bg-gradient-to-br from-rose-950/95 via-rose-900/95 to-pink-950/95 border-2 border-rose-500/50 rounded-3xl overflow-hidden shadow-2xl shadow-rose-500/20">
                {/* Partículas flotantes */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <FloatingParticle
                      key={i}
                      delay={i * 0.5}
                      duration={3 + Math.random() * 2}
                      startX={50 + Math.random() * 200}
                      startY={200 + Math.random() * 100}
                    />
                  ))}
                </div>

                {/* Efectos de fondo */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-rose-400/20 rounded-full filter blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full filter blur-[50px]" />
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark/50 border border-rose-500/30 text-rose-300 hover:bg-dark hover:border-rose-400 transition-all duration-300 hover:scale-110"
                >
                  <X size={20} />
                </button>

                {/* Contenido */}
                <div className="relative z-10 p-6 sm:p-8 text-center">
                  {/* Badge de promo */}
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/30 to-pink-500/30 border border-rose-400/50 rounded-full px-4 py-1.5 mb-4"
                  >
                    <Sparkles className="text-rose-300 animate-pulse" size={16} />
                    <span className="text-rose-200 font-bold text-sm uppercase tracking-wider">
                      Promo Fin de Semana
                    </span>
                    <Sparkles className="text-rose-300 animate-pulse" size={16} />
                  </motion.div>

                  {/* Icono de café */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl shadow-lg shadow-rose-500/40 mx-auto">
                      <Coffee className="text-dark" size={40} />
                    </div>
                  </motion.div>

                  {/* Título */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl sm:text-3xl font-black text-light mb-2"
                  >
                    GRANIZADO DE{" "}
                    <span className="bg-gradient-to-r from-rose-300 to-pink-400 bg-clip-text text-transparent">
                      CAFE
                    </span>
                  </motion.h2>

                  {/* Subtítulo */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-rose-200/80 mb-6"
                  >
                    Refrescante y energizante
                  </motion.p>

                  {/* Oferta principal */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-dark/60 to-dark/40 border border-rose-500/40 rounded-2xl p-6 mb-6"
                  >
                    <div className="text-rose-300/80 text-lg mb-2">
                      Lleva <span className="font-bold text-rose-200">2</span> granizados por
                    </div>

                    {/* Precio promocional */}
                    <div className="relative inline-block mb-3">
                      <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-rose-300 via-pink-300 to-fuchsia-400 bg-clip-text text-transparent">
                        {formatPrice(12000)}
                      </span>
                    </div>

                    {/* Precio tachado y ahorro */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray line-through text-lg">
                          {formatPrice(16000)}
                        </span>
                      </div>
                      <div className="bg-rose-500/20 border border-rose-400/50 rounded-full px-3 py-1">
                        <span className="text-rose-400 font-bold text-sm">
                          Ahorras {formatPrice(4000)}
                        </span>
                      </div>
                    </div>

                    {/* Precio por unidad */}
                    <div className="mt-3 text-rose-300/60 text-sm">
                      Cada granizado a solo <span className="font-bold text-rose-200">{formatPrice(6000)}</span>
                    </div>
                  </motion.div>

                  {/* Botones */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <button
                      onClick={handleGoToGranizados}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-dark font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30"
                    >
                      Ver Granizados
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-dark/50 border border-rose-500/30 text-rose-300 hover:bg-dark hover:border-rose-400 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      Ahora no
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
