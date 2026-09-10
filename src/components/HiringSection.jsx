import React from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import "./hiring-section.css";

const applicationUrl = `https://wa.me/573164277879?text=${encodeURIComponent(
  "Hola, vi que están contratando en Frostbyte y me interesa ser parte del equipo. ¿Me cuentan más?"
)}`;

export default function HiringSection() {
  return (
    <section
      id="trabaja-con-nosotros"
      aria-labelledby="hiring-title"
      className="fb-section hiring-section px-5 py-10 md:py-14"
    >
      <div className="hiring-card relative z-10 mx-auto max-w-5xl px-5 py-8 text-center sm:px-10 md:py-10">
        <p className="mb-4 font-display text-xs font-medium uppercase tracking-[0.25em] text-primary">
          Estamos contratando
        </p>
        <h2
          id="hiring-title"
          className="m-0 font-display text-[clamp(1.35rem,4vw,2rem)] font-medium leading-relaxed text-light"
        >
          El próximo integrante de Frostbyte podrías ser tú.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-light/75 md:text-base">
          ¿Quieres ser parte del equipo? Escríbenos y conoce las oportunidades
          para trabajar con nosotros.
        </p>
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hiring-contact mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/40 px-5 py-3 text-sm font-medium text-light"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Escríbenos por WhatsApp
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
