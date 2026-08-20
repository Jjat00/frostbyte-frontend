import React from "react";
import { Instagram, Tag } from "lucide-react";

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const STEPS = [
  "Síguenos en Instagram o TikTok",
  "Sube una foto y etiquétanos",
  "Muéstrale la publicación al mesero",
];

/**
 * Descuento por seguir en redes.
 *
 * Es un gancho, no un servicio: por eso va en neutro (regla del hero — el
 * color se reserva para la carta, los domicilios y reservar). Lo que manda
 * aquí es el número, y manda por tamaño, no por color.
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

          {/* Pasos */}
          <ol className="mb-5 space-y-2.5">
            {STEPS.map((text, i) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-[0.62rem] font-medium text-light/55">
                  {i + 1}
                </span>
                <span className="text-[0.78rem] text-light/65">{text}</span>
              </li>
            ))}
          </ol>

          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="https://www.instagram.com/frostbyte.col/"
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn w-full"
            >
              <Instagram size={15} />
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@frostbyte.col"
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn w-full"
            >
              <TikTokIcon size={15} />
              TikTok
            </a>
          </div>

          <p className="mt-4 text-center text-[0.62rem] text-light/30">
            Válido para tu pedido de hoy
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
