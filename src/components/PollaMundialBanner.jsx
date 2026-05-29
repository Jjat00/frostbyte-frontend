import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";

/**
 * Franja llamativa que invita a participar en la Polla Mundialista.
 * Se muestra dentro del flujo de la carta pública para dar visibilidad
 * adicional al acceso (además del Hero, Header y Footer).
 */
const PollaMundialBanner = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Link
          to="/polla-mundial"
          className="group relative block overflow-hidden rounded-3xl border border-primary/40 bg-linear-to-r from-primary/15 via-dark-secondary/40 to-secondary/15 p-6 sm:p-8 backdrop-blur-sm hover:border-primary/70 transition-colors duration-300"
        >
          {/* Glows de fondo */}
          <div className="absolute -top-16 -left-10 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          {/* Shimmer al hover */}
          <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
            {/* Trofeo */}
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/40">
              <Trophy className="text-dark w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            {/* Texto */}
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1">
                ⚽ Mundial 2026 · Frostbyte
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-light leading-tight">
                Polla Mundialista
              </h3>
              <p className="text-gray text-sm sm:text-base mt-1">
                Pronostica los marcadores, suma puntos y gana{" "}
                <span className="text-secondary font-bold">$500.000</span>.
              </p>
            </div>

            {/* CTA */}
            <span className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-primary to-secondary text-dark font-bold shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
              Participar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

export default PollaMundialBanner;
