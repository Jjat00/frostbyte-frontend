import React from "react";
import { Tag } from "lucide-react";
import SocialLink, { SOCIAL_ICON } from "@/components/SocialLink";
import { SOCIAL, SOCIAL_HANDLE, SOCIAL_SOURCE } from "@/lib/social";

const NETWORKS = ["instagram", "tiktok"];

/**
 * Descuento por redes.
 *
 * Es un gancho, no un servicio: por eso va en neutro (regla del hero — el
 * color se reserva para la carta, los domicilios y reservar). Lo que manda
 * aquí es el número, y manda por tamaño, no por color.
 *
 * El 2026-09-13 dejó de vivir al final de la página (detrás de toda la carta,
 * el Desguayabator y el recomendador, donde casi nadie llegaba) y pasó a ir
 * justo después de la carta principal.
 *
 * Los pasos bajaron de tres a dos. El primero era "síguenos" y el segundo
 * "sube una foto y etiquétanos": quien sube una historia etiquetando ya está
 * en la cuenta, así que pedirlo aparte solo alargaba la lista. El @ queda
 * visible arriba para que se lea aunque nadie toque los botones.
 */
const SocialDiscountBanner = () => {
  return (
    <section id="descuento-redes" className="fb-section fb-section--plain py-9">
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal fb-card mx-auto max-w-xl p-5 sm:p-6">
          {/* Encabezado */}
          <div className="mb-5 flex items-center gap-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] border border-white/[0.1] bg-white/[0.04]">
              <Tag size={19} className="text-light/70" />
            </span>
            <div className="min-w-0">
              <span className="fb-eyebrow block">Descuento por redes</span>
              <h3 className="font-display m-0 mt-1.5 text-2xl font-semibold leading-none tracking-[0.06em] text-light">
                10%{" "}
                <span className="text-base tracking-[0.14em] text-light/55">
                  OFF
                </span>
              </h3>
            </div>
          </div>

          {/* Dos pasos. El @ va impreso en el primero: es lo que la persona
              busca luego en la aplicación de Instagram si no toca el botón. */}
          <ol className="mb-5 space-y-2.5">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-[0.62rem] font-medium text-light/55">
                1
              </span>
              <span className="text-[0.78rem] text-light/65">
                Sube una historia y etiqueta a{" "}
                <span className="text-light/85">{SOCIAL_HANDLE}</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-[0.62rem] font-medium text-light/55">
                2
              </span>
              <span className="text-[0.78rem] text-light/65">
                Muéstrasela al mesero
              </span>
            </li>
          </ol>

          <div className="grid gap-2 sm:grid-cols-2">
            {NETWORKS.map((network) => {
              const Icon = SOCIAL_ICON[network];
              return (
                <SocialLink
                  key={network}
                  network={network}
                  source={SOCIAL_SOURCE.BANNER_DESCUENTO}
                  className="fb-btn w-full"
                >
                  <Icon size={15} />
                  {SOCIAL[network].label}
                </SocialLink>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[0.62rem] text-light/30">
            Válido para tu pedido de hoy en el local
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
