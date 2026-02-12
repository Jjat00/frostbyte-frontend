import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Gift,
  Users,
  CalendarHeart,
  Clock,
  Flame,
} from "lucide-react";

const FloatingHeart = ({ delay, x, size, duration }) => (
  <motion.div
    className="absolute text-pink-500/30 pointer-events-none"
    style={{ left: `${x}%`, bottom: "-20px" }}
    animate={{
      y: [0, -600],
      x: [0, Math.random() > 0.5 ? 30 : -30, 0],
      opacity: [0, 0.8, 0.6, 0],
      scale: [0.5, 1, 0.8],
      rotate: [0, Math.random() > 0.5 ? 15 : -15, 0],
    }}
    transition={{
      duration: duration || 6,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  >
    <Heart size={size || 16} fill="currentColor" />
  </motion.div>
);

const LoveAndFriendshipBanner = () => {
  return (
    <section className="py-10 bg-dark relative overflow-hidden">
      {/* Corazones flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingHeart delay={0} x={10} size={14} duration={7} />
        <FloatingHeart delay={1.2} x={25} size={18} duration={6} />
        <FloatingHeart delay={0.5} x={40} size={12} duration={8} />
        <FloatingHeart delay={2} x={55} size={20} duration={6.5} />
        <FloatingHeart delay={0.8} x={70} size={14} duration={7.5} />
        <FloatingHeart delay={1.5} x={85} size={16} duration={6} />
        <FloatingHeart delay={3} x={15} size={10} duration={8} />
        <FloatingHeart delay={2.5} x={60} size={12} duration={7} />
        <FloatingHeart delay={1} x={90} size={18} duration={6.5} />
        <FloatingHeart delay={3.5} x={35} size={14} duration={7} />
      </div>

      {/* Glows de fondo rosados */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-pink-500 rounded-full filter blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-10 right-1/4 w-72 h-72 bg-rose-600 rounded-full filter blur-[100px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Glow exterior */}
          <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/20 via-rose-500/15 to-pink-500/20 rounded-3xl blur-xl" />

          {/* Contenedor principal */}
          <div className="relative bg-gradient-to-br from-dark-secondary/90 to-dark/90 border border-pink-500/30 rounded-2xl overflow-hidden">
            {/* Linea superior con gradiente rosa */}
            <div className="h-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500" />

            <div className="p-6 sm:p-8">
              {/* Badge edicion especial */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-5"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/50 rounded-full text-pink-400 text-xs font-bold tracking-widest uppercase">
                  <Sparkles size={14} />
                  Edicion Especial
                  <Sparkles size={14} />
                </span>
              </motion.div>

              {/* Titulo principal con corazones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart
                      className="text-pink-500"
                      size={28}
                      fill="currentColor"
                    />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-light leading-tight">
                    DÍA DE
                    <span className="block bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                      AMOR Y AMISTAD
                    </span>
                  </h2>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  >
                    <Heart
                      className="text-rose-400"
                      size={28}
                      fill="currentColor"
                    />
                  </motion.div>
                </div>
                <p className="text-gray text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Celebra con las personas que mas quieres. Ven a Frostbyte y
                  brinda por el amor y la amistad con nuestras bebidas
                  especiales.
                </p>
              </motion.div>

              {/* Cards de promocion */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-dark/60 border border-pink-500/20 rounded-xl p-4 text-center hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-500/20">
                    <Heart className="text-white" size={22} fill="white" />
                  </div>
                  <h4 className="text-pink-400 font-bold text-sm mb-1">
                    50% en 2do Coctel
                  </h4>
                  <p className="text-gray text-xs">
                    Comparte un coctel con tu persona favorita <br />{" "}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-dark/60 border border-rose-400/20 rounded-xl p-4 text-center hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-400/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-400/20">
                    <Gift className="text-white" size={22} />
                  </div>
                  <h4 className="text-rose-400 font-bold text-sm mb-1">
                    Combo Pareja
                  </h4>
                  <p className="text-gray text-xs">
                    2 granizados edicion especial por solo{" "}
                    <span className="text-pink-400 font-bold text-xs">
                      20.000
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="bg-dark/60 border border-pink-500/20 rounded-xl p-4 text-center hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-500/20">
                    <Users className="text-white" size={22} />
                  </div>
                  <h4 className="text-pink-400 font-bold text-sm mb-1">
                    Grupos de 4+
                  </h4>
                  <p className="text-gray text-xs">
                    1 granizado gratis por cada 4 personas
                  </p>
                </motion.div>
              </div>

              {/* Franja de urgencia */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65 }}
                className="bg-gradient-to-r from-pink-500/10 via-rose-500/15 to-pink-500/10 border border-pink-500/25 rounded-xl p-4 mb-6"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
                  <span className="flex items-center gap-1.5 text-pink-300 text-xs sm:text-sm font-semibold">
                    <CalendarHeart size={16} className="text-pink-400" />
                    Solo del 13 al 15 de septiembre
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-pink-500/50 rounded-full" />
                  <span className="flex items-center gap-1.5 text-rose-300 text-xs sm:text-sm font-semibold">
                    <Flame size={16} className="text-rose-400" />
                    Hasta agotar existencias
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-pink-500/50 rounded-full" />
                  <span className="flex items-center gap-1.5 text-pink-300 text-xs sm:text-sm font-semibold">
                    <Clock size={16} className="text-pink-400" />
                    Edicion limitada
                  </span>
                </div>
              </motion.div>

              {/* CTA final */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/10 border border-pink-500/30 rounded-xl py-3 px-6">
                  <Heart
                    className="text-pink-500"
                    size={16}
                    fill="currentColor"
                  />
                  <p className="text-light text-sm font-semibold">
                    Celebra en{" "}
                    <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent font-black">
                      Frostbyte
                    </span>{" "}
                    con quienes mas quieres
                  </p>
                  <Heart
                    className="text-rose-400"
                    size={16}
                    fill="currentColor"
                  />
                </div>
                <p className="text-gray/50 text-[10px] mt-3 italic">
                  * Los descuentos y promociones no son acumulables. Solo se
                  aplica un descuento por compra.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LoveAndFriendshipBanner;
