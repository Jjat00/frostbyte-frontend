import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

const WaterSection = () => {
  return (
    <section id="agua" className="py-16 sm:py-24 bg-dark relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500 rounded-full filter blur-[200px] opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-cyan-400 via-sky-400 to-blue-300 bg-clip-text text-transparent">
              AGUA
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray max-w-xl mx-auto">
            Mantente hidratado con agua{" "}
            <span className="text-cyan-400 font-semibold">pura y refrescante</span>
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
            <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-400/40 to-blue-500/40 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative backdrop-blur-xl bg-white/[0.04] border border-cyan-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-3xl px-10 sm:px-16 py-8 sm:py-10 flex flex-col items-center text-center transition-all duration-300 group-hover:border-cyan-500/40">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Droplets className="text-cyan-400" size={28} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-light mb-2">
                Botella de Agua
              </h3>

              <p className="text-gray text-sm sm:text-base mb-6 max-w-xs">
                La mejor forma de refrescarte y mantenerte hidratado
              </p>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-8 py-4">
                <span className="text-3xl sm:text-4xl font-black bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
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
