import React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

/**
 * Hero promocional de Salchipapas (Frostbyte Food).
 *
 * Anuncia que ahora en Frostbyte se ofrecen salchipapas. Usa la identidad
 * naranja de Frostbyte Food (negocio del 3er piso) sobre el mismo lenguaje
 * visual de la carta (liquid-glass + Mundial26Backdrop). Mobile-first: la
 * imagen va arriba en celular y al costado en pantallas grandes.
 */
const SalchipapasPromoBanner = () => {
  return (
    <section id="salchipapas" className="relative overflow-hidden mb-8 sm:mb-10">
      <Mundial26Backdrop />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-orange-400/30 bg-linear-to-br from-orange-500/15 via-dark-secondary to-gold/10 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {/* Resplandor cálido detrás de la imagen */}
        <div className="pointer-events-none absolute -top-10 right-0 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl sm:right-10" />

        <div className="relative flex flex-col items-center gap-5 p-5 sm:flex-row sm:gap-7 sm:p-7">
          {/* Imagen del producto */}
          <motion.img
            src="/salchipapas-frostbyte-food.png"
            alt="Salchipapas Frostbyte Food"
            loading="lazy"
            initial={{ scale: 0.9, rotate: -3 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-52 max-w-[70%] flex-shrink-0 drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] sm:w-64"
          />

          {/* Texto */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-300">
              <Sparkles size={12} />
              Nuevo · Frostbyte Food
            </span>

            <h3 className="mt-3 text-3xl font-black uppercase leading-none text-light sm:text-4xl md:text-5xl">
              Salchi<span className="text-orange-400">papas</span>
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:mx-0 md:text-base">
              ¡Ahora en Frostbyte también ofrecemos{" "}
              <span className="font-bold text-orange-300">salchipapas</span>!
              Crujientes, cargadas y con el sello de la casa.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {/* Precio: por ahora solo tamaño Personal */}
              <div className="inline-flex items-baseline gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Personal
                </span>
                <span className="text-xl font-black text-orange-300">$18.000</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-orange-400/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80">
                <Flame size={16} className="text-orange-400" />
                Pídelas a tu mesero
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SalchipapasPromoBanner;
