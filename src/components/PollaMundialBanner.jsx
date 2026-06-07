import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import {
  MundialColorField,
  Mundial26Backdrop,
  EmblemaMundial,
  Big26,
} from "@/components/mundial/Sistema26";

/**
 * Anuncio de la Polla Mundialista para la carta pública.
 *
 * Se muestra VARIAS veces a lo largo de la landing con distintas variantes,
 * para mantener el premio ($500.000) siempre presente sin que canse:
 *  - "feature": tarjeta grande con el premio como protagonista (uso principal).
 *  - "prize":   enfocada en el medio millón, con el número gigante.
 *  - "strip":   franja compacta y ligera (recordatorio intermedio).
 *
 * Restyle "Sistema 26" (Mundial 2026): paleta oro/verde + capas de afiche FIFA
 * (MundialColorField / Mundial26Backdrop / EmblemaMundial / Big26).
 *
 * Nota de rendimiento (ver index.css): la home se repinta en celulares de
 * gama baja, por eso la variante "strip" no usa glows con blur-3xl.
 */

const PRIZE = "$500.000";

const wrap = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// ── Variante compacta: una sola franja, sin blur pesado ──
const StripBanner = () => (
  <section className="container mx-auto px-4 py-8">
    <motion.div {...wrap}>
      <Link
        to="/polla-mundial"
        className="group relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-linear-to-r from-grass/15 via-dark-secondary/60 to-gold/15 px-4 py-3.5 sm:px-6 sm:py-4 hover:border-gold/70 transition-colors duration-300"
      >
        {/* Patrón modular "26" sutil — ligero en GPU (sin blur) */}
        <span className="t26-pattern absolute inset-0 opacity-20 pointer-events-none" />
        <Big26 className="absolute -right-2 -bottom-6 text-7xl leading-none text-white/[0.05]" />

        <span className="relative shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-grass to-gold shadow-lg shadow-grass/30">
          <Trophy className="text-dark w-5 h-5" />
        </span>
        <p className="relative flex-1 text-sm sm:text-base font-bold text-light leading-tight">
          <span className="text-gold uppercase tracking-wider text-[11px] sm:text-xs block sm:inline sm:mr-2">
            ⚽ Polla Mundialista
          </span>
          Pronostica y gana{" "}
          <span className="text-gold">
            {PRIZE}
          </span>
        </p>
        <span className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-grass to-gold px-4 py-2 text-xs sm:text-sm font-bold text-dark shadow-md shadow-grass/30">
          Jugar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  </section>
);

// ── Variante premio: el medio millón en grande (afiche a todo color) ──
const PrizeBanner = () => (
  <section className="container mx-auto px-4 py-12">
    <motion.div {...wrap}>
      <Link
        to="/polla-mundial"
        className="group relative block overflow-hidden rounded-3xl border border-gold/40 bg-dark text-center hover:border-gold/70 transition-colors duration-300"
      >
        {/* Campo de color estilo póster del Mundial (vibrante) */}
        <MundialColorField scrim="center" />
        {/* Shimmer al hover */}
        <span className="absolute inset-0 z-10 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-5">
            <EmblemaMundial className="h-16 sm:h-20" />
          </div>

          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-gold mb-4">
            <Trophy className="w-4 h-4" />
            Polla Mundialista · Mundial 2026
          </span>

          <p className="text-light text-base sm:text-lg font-semibold">
            Pronostica el Mundial y gánate el
          </p>
          <div className="t26-num my-2 text-6xl sm:text-8xl text-gold leading-none">
            {PRIZE}
          </div>
          <p className="text-grass text-lg sm:text-xl font-bold">
            medio millón de pesos
          </p>

          <span className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-linear-to-r from-grass to-gold text-dark font-bold text-base sm:text-lg shadow-lg shadow-grass/40 group-hover:shadow-gold/60 transition-all duration-300">
            Participar gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  </section>
);

// ── Variante principal: tarjeta con el premio destacado ──
const FeatureBanner = () => (
  <section className="container mx-auto px-4 py-12">
    <motion.div {...wrap}>
      <Link
        to="/polla-mundial"
        className="group relative block overflow-hidden rounded-3xl border border-gold/40 bg-dark p-6 sm:p-8 hover:border-gold/70 transition-colors duration-300"
      >
        {/* Capa decorativa de afiche del Mundial (sutil, ligera en GPU) */}
        <Mundial26Backdrop />
        {/* Shimmer al hover */}
        <span className="absolute inset-0 z-10 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
          {/* Emblema oficial del Mundial */}
          <div className="shrink-0">
            <EmblemaMundial className="h-16 sm:h-20" />
          </div>

          {/* Texto */}
          <div className="flex-1 text-center sm:text-left">
            <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-gold mb-1">
              ⚽ Mundial 2026 · Frostbyte
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-light leading-tight">
              Polla Mundialista
            </h3>
            <p className="text-gray text-sm sm:text-base mt-1">
              Pronostica los marcadores y suma puntos en todo el Mundial.
            </p>
          </div>

          {/* Premio destacado */}
          <div className="shrink-0 flex flex-col items-center text-center rounded-2xl border border-gold/30 bg-dark/40 px-5 py-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray font-bold">
              Premio al campeón
            </span>
            <span className="t26-num text-3xl sm:text-4xl text-gold leading-tight">
              {PRIZE}
            </span>
            <span className="text-[11px] text-grass font-semibold">
              medio millón de pesos
            </span>
          </div>

          {/* CTA */}
          <span className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-grass to-gold text-dark font-bold shadow-lg shadow-grass/30 group-hover:shadow-gold/50 transition-all duration-300">
            Participar
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  </section>
);

/**
 * @param {{ variant?: "feature" | "prize" | "strip" }} props
 */
const PollaMundialBanner = ({ variant = "feature" }) => {
  if (variant === "strip") return <StripBanner />;
  if (variant === "prize") return <PrizeBanner />;
  return <FeatureBanner />;
};

export default PollaMundialBanner;
