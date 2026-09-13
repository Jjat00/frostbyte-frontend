import React from "react";
import { Tag } from "lucide-react";
import SocialLink, { SOCIAL_ICON } from "@/components/SocialLink";
import { SOCIAL, SOCIAL_HANDLE, SOCIAL_SOURCE } from "@/lib/social";

const NETWORKS = ["instagram", "tiktok"];

const STEPS = [
  <>
    Sube una historia y etiqueta a{" "}
    <span className="text-light">{SOCIAL_HANDLE}</span>
  </>,
  "Muéstrasela al mesero",
];

/**
 * Descuento por redes.
 *
 * Sin tarjeta: el contenido va directo sobre la sección. La carta ya separa
 * sus bloques con el fondo y el filete superior, así que una tarjeta dentro
 * dibujaba un segundo borde a tres milímetros del primero.
 *
 * Manda el número, y manda por tamaño. "Descuento por redes" bajó a
 * subtítulo: era una etiqueta encima del título que solo repetía en pequeño
 * lo que el bloque ya dice.
 *
 * Los pasos van numerados porque aquí el orden es información real (hay que
 * publicar antes de enseñar la historia), no adorno de plantilla.
 */
const SocialDiscountBanner = () => {
  return (
    <section id="descuento-redes" className="fb-section fb-section--plain py-11">
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal mx-auto max-w-xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border border-white/[0.12] bg-linear-to-br from-white/[0.09] to-transparent shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Tag size={23} className="text-light/80" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display m-0 text-[2.6rem] font-semibold leading-none tracking-[-0.02em] text-light">
                10%
                <span className="ml-2 align-middle text-lg tracking-[0.12em] text-light/50">
                  OFF
                </span>
              </h3>
              <p className="mt-2 text-[0.8rem] text-light/55">
                Descuento por redes
              </p>
            </div>
          </div>

          <ol className="mb-7 mt-7 space-y-4">
            {STEPS.map((text, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.05] text-[0.7rem] font-semibold text-light/70">
                  {i + 1}
                </span>
                <span className="pt-[0.3rem] text-[0.88rem] leading-relaxed text-light/65">
                  {text}
                </span>
              </li>
            ))}
          </ol>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {NETWORKS.map((network, i) => {
              const Icon = SOCIAL_ICON[network];
              return (
                <SocialLink
                  key={network}
                  network={network}
                  source={SOCIAL_SOURCE.BANNER_DESCUENTO}
                  className={`fb-btn fb-btn--lg w-full ${i === 0 ? "fb-btn--solid" : ""}`}
                >
                  <Icon size={17} />
                  {SOCIAL[network].label}
                </SocialLink>
              );
            })}
          </div>

          <p className="mt-4 text-[0.68rem] text-light/35">
            Válido para tu pedido de hoy en el local
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
