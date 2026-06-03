import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";

/**
 * Anuncio de la Polla Mundialista para la carta pública.
 *
 * Se muestra VARIAS veces a lo largo de la landing con distintas variantes,
 * para mantener el premio ($500.000) siempre presente sin que canse:
 *  - "feature": tarjeta grande con el premio como protagonista (uso principal).
 *  - "prize":   enfocada en el medio millón, con el número gigante.
 *  - "strip":   franja compacta y ligera (recordatorio intermedio).
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
        className="group relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-primary/40 bg-linear-to-r from-primary/10 via-dark-secondary/50 to-secondary/10 px-4 py-3.5 sm:px-6 sm:py-4 hover:border-primary/70 transition-colors duration-300"
      >
        <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary shadow-lg shadow-primary/30">
          <Trophy className="text-dark w-5 h-5" />
        </span>
        <p className="flex-1 text-sm sm:text-base font-bold text-light leading-tight">
          <span className="text-primary uppercase tracking-wider text-[11px] sm:text-xs block sm:inline sm:mr-2">
            ⚽ Polla Mundialista
          </span>
          Pronostica y gana{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {PRIZE}
          </span>
        </p>
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-secondary px-4 py-2 text-xs sm:text-sm font-bold text-dark shadow-md shadow-primary/30">
          Jugar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  </section>
);

// ── Variante premio: el medio millón en grande ──
const PrizeBanner = () => (
  <section className="container mx-auto px-4 py-12">
    <motion.div {...wrap}>
      <Link
        to="/polla-mundial"
        className="group relative block overflow-hidden rounded-3xl border border-primary/40 bg-linear-to-br from-primary/15 via-dark-secondary/40 to-secondary/15 p-8 sm:p-10 text-center backdrop-blur-sm hover:border-primary/70 transition-colors duration-300"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
            <Trophy className="w-4 h-4" />
            Polla Mundialista · Mundial 2026
          </span>

          <p className="text-light text-base sm:text-lg font-semibold">
            Pronostica el Mundial y gánate el
          </p>
          <div className="my-2 text-6xl sm:text-8xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            {PRIZE}
          </div>
          <p className="text-secondary text-lg sm:text-xl font-bold">
            medio millón de pesos
          </p>

          <span className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-linear-to-r from-primary to-secondary text-dark font-bold text-base sm:text-lg shadow-lg shadow-primary/40 group-hover:shadow-primary/60 transition-all duration-300">
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
        className="group relative block overflow-hidden rounded-3xl border border-primary/40 bg-linear-to-r from-primary/15 via-dark-secondary/40 to-secondary/15 p-6 sm:p-8 backdrop-blur-sm hover:border-primary/70 transition-colors duration-300"
      >
        {/* Glows de fondo */}
        <div className="absolute -top-16 -left-10 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        {/* Shimmer al hover */}
        <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
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
              Pronostica los marcadores y suma puntos en todo el Mundial.
            </p>
          </div>

          {/* Premio destacado */}
          <div className="shrink-0 flex flex-col items-center text-center rounded-2xl border border-primary/30 bg-dark/30 px-5 py-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray font-bold">
              Premio al campeón
            </span>
            <span className="text-3xl sm:text-4xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              {PRIZE}
            </span>
            <span className="text-[11px] text-secondary font-semibold">
              medio millón de pesos
            </span>
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

/**
 * @param {{ variant?: "feature" | "prize" | "strip" }} props
 */
const PollaMundialBanner = ({ variant = "feature" }) => {
  if (variant === "strip") return <StripBanner />;
  if (variant === "prize") return <PrizeBanner />;
  return <FeatureBanner />;
};

export default PollaMundialBanner;
