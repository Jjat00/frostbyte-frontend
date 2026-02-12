import React from "react";
import { motion } from "framer-motion";
import { Instagram, Camera, UserPlus, Percent } from "lucide-react";

const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const SocialDiscountBanner = () => {
  return (
    <section className="py-8 bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Glow de fondo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-3xl blur-xl" />

          {/* Contenedor principal */}
          <div className="relative bg-gradient-to-br from-dark-secondary/90 to-dark/90 border border-primary/30 rounded-2xl overflow-hidden">
            {/* Linea de acento superior */}
            <div className="h-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500" />

            <div className="p-5 sm:p-6">
              {/* Header: Porcentaje + Título */}
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30"
                >
                  <div className="text-center leading-none">
                    <span className="text-dark font-black text-2xl sm:text-3xl block">
                      10
                    </span>
                    <span className="text-dark font-black text-xs sm:text-sm block -mt-1">
                      %OFF
                    </span>
                  </div>
                </motion.div>

                <div>
                  <h3 className="text-light font-black text-lg sm:text-xl leading-tight">
                    DESCUENTO EN TU PEDIDO
                  </h3>
                  <p className="text-gray text-sm mt-1">
                    Síguenos y comparte tu experiencia
                  </p>
                </div>
              </div>

              {/* Pasos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {/* Paso 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 bg-dark/60 border border-gray/15 rounded-xl p-3"
                >
                  <div className="shrink-0 w-9 h-9 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg flex items-center justify-center">
                    <UserPlus className="text-primary" size={18} />
                  </div>
                  <div>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider">
                      Paso 1
                    </span>
                    <p className="text-light text-sm font-semibold leading-tight">
                      Síguenos en redes
                    </p>
                  </div>
                </motion.div>

                {/* Paso 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 bg-dark/60 border border-gray/15 rounded-xl p-3"
                >
                  <div className="shrink-0 w-9 h-9 bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-lg flex items-center justify-center">
                    <Camera className="text-secondary" size={18} />
                  </div>
                  <div>
                    <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                      Paso 2
                    </span>
                    <p className="text-light text-sm font-semibold leading-tight">
                      Sube una foto y etiquétanos
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Botones de redes sociales */}
              <div className="flex gap-3 mb-4">
                <motion.a
                  href="https://www.instagram.com/frostbyte.col/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-shadow duration-300"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </motion.a>

                <motion.a
                  href="https://www.tiktok.com/@frostbyte.col"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray/30 text-white font-bold text-sm py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-white/10 transition-shadow duration-300"
                >
                  <TikTokIcon size={18} />
                  <span>TikTok</span>
                </motion.a>
              </div>

              {/* CTA final */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-xl py-2.5 px-4"
              >
                <p className="text-light text-sm font-semibold">
                  Muéstrale al mesero y obtén tu{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-black">
                    10% de descuento
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
