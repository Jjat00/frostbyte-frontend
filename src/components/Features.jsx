import React from "react";
import { Cpu, Zap, Shield, Sparkles } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

/**
 * Por qué Frostbyte: cuatro razones al cierre de la carta.
 *
 * El 2026-08-20 pasó al lenguaje del hero. Se fueron las cinco animaciones de
 * GSAP con las que entraba (el titular recortándose con `clipPath` al hacer
 * scroll, las tarjetas girando en 3D desde `rotationX: 15` y los iconos dando
 * una vuelta completa con `elastic.out`) y el orbe de 384 px con blur de
 * 120 px. Cuatro tarjetas iguales, entrada corta y nada más.
 */

const features = [
  {
    icon: Cpu,
    title: "Enfriamiento cuántico",
    description:
      "Tecnología de congelación avanzada para la consistencia perfecta en todo momento",
    accent: "primary",
  },
  {
    icon: Zap,
    title: "Energía instantánea",
    description: "Repleto de ingredientes naturales para despertar tu energía",
    accent: "secondary",
  },
  {
    icon: Shield,
    title: "Calidad premium",
    description:
      "Solo los mejores ingredientes llegan a nuestra dimensión digital",
    accent: "primary",
  },
  {
    icon: Sparkles,
    title: "Sabores neón",
    description:
      "Combinaciones de sabores únicas que no encontrarás en ningún otro lugar",
    accent: "secondary",
  },
];

const ICON_COLOR = {
  primary: "text-primary",
  secondary: "text-secondary",
};

const Features = () => {
  return (
    <section id="features" className="fb-section py-16">
      <div className="container relative z-10 mx-auto px-5">
        <SectionHeading
          eyebrow="Por qué Frostbyte"
          title="La experiencia"
          description="El lugar perfecto en Cumbal para pasar un buen rato con amigos o en familia. No solo servimos bebidas, ofrecemos una experiencia."
          className="mb-12"
        />

        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="fb-card fb-reveal flex h-full flex-col p-5"
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
                <feature.icon
                  className={ICON_COLOR[feature.accent]}
                  size={18}
                  strokeWidth={1.6}
                />
              </span>

              <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
                {feature.title}
              </h3>

              <p className="mt-2.5 text-[0.75rem] leading-relaxed text-light/50">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
