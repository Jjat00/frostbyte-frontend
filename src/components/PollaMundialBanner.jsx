import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";

/**
 * Acceso a la Polla Mundialista tras el fin del Mundial 2026.
 *
 * El torneo terminó pero la polla sigue accesible: los jugadores consultan
 * los resultados finales y el ganador del premio ($500.000) aún debe
 * reclamarlo. Una sola franja discreta en la carta; la promoción por
 * variantes (feature/prize/strip) del torneo se retiró con el skin Mundial.
 */

const PRIZE = "$500.000";

const wrap = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const PollaMundialBanner = () => (
  <section className="container mx-auto px-4 py-8">
    <motion.div {...wrap}>
      <Link
        to="/polla-mundial"
        className="group relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-secondary/30 bg-dark-secondary/60 px-4 py-3.5 sm:px-6 sm:py-4 hover:border-secondary/60 transition-colors duration-300"
      >
        <span className="relative shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary shadow-lg shadow-primary/30">
          <Trophy className="text-dark w-5 h-5" />
        </span>
        <p className="relative flex-1 text-sm sm:text-base font-bold text-light leading-tight">
          <span className="text-secondary uppercase tracking-wider text-[11px] sm:text-xs block sm:inline sm:mr-2">
            Polla Mundialista
          </span>
          Resultados finales y ganador del{" "}
          <span className="text-secondary">{PRIZE}</span>
        </p>
        <span className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-secondary px-4 py-2 text-xs sm:text-sm font-bold text-dark shadow-md shadow-primary/30">
          Ver
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  </section>
);

export default PollaMundialBanner;
