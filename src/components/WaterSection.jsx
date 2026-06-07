import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

const WaterSection = () => {
  return (
    <section id="agua" className="py-16 sm:py-24 bg-dark relative overflow-hidden">
      {/* Sistema 26: capa decorativa tipo afiche (sutil, ligera en GPU) */}
      <Mundial26Backdrop />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Hidratacion
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="text-gold">
              AGUA
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray max-w-xl mx-auto">
            Mantente hidratado con agua{" "}
            <span className="text-gold font-semibold">pura y refrescante</span>
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative"
          >
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/40 to-grass/40 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="liquid-glass relative backdrop-blur-xl bg-white/[0.08] border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-3xl px-10 sm:px-16 py-8 sm:py-10 flex flex-col items-center text-center transition-all duration-300 group-hover:border-gold/40">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Droplets className="text-blue-400" size={28} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-light mb-2">
                Botella de Agua
              </h3>

              <p className="text-gray text-sm sm:text-base mb-6 max-w-xs">
                La mejor forma de refrescarte y mantenerte hidratado
              </p>

              <div className="bg-blue-500/10 border border-gold/30 rounded-2xl px-8 py-4">
                <span className="text-3xl sm:text-4xl font-black text-grass">
                  $2.000
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaterSection;
