import React from "react";
import { Cake, Instagram } from "lucide-react";

/**
 * Cinta de promociones entre secciones de la carta.
 *
 * Era una banda de degradado saturado con el texto en negro y dos resplandores
 * encima; aparecía cada tres secciones, así que el color de marca se gastaba
 * ahí. Ahora es una línea fina sobre el fondo de la carta: sigue moviéndose
 * (para eso es una cinta) pero no compite con el producto.
 *
 * La variante ya no cambia el color de fondo sino cuál de los dos colores de
 * marca acompaña al texto, para que las repeticiones no sean idénticas.
 */

const PROMOS = [
  { text: "50% off el día de tu cumpleaños", icon: Cake },
  { text: "10% off por seguirnos en redes", icon: Instagram },
];

const TickerContent = ({ accent }) => (
  <div className="flex shrink-0 items-center">
    {PROMOS.map((promo, i) => {
      const Icon = promo.icon;
      return (
        <div key={i} className="mx-6 flex shrink-0 items-center gap-2 sm:mx-9">
          <Icon className={`shrink-0 ${accent}`} size={14} />
          <span className="whitespace-nowrap text-[0.72rem] font-medium tracking-[0.06em] text-light/60">
            {promo.text}
          </span>
          <span className="ml-6 select-none text-light/15 sm:ml-9">·</span>
        </div>
      );
    })}
  </div>
);

const PromoTicker = ({ variant = "primary" }) => {
  const accent =
    variant === "secondary"
      ? "text-secondary"
      : variant === "fire"
        ? "text-light/45"
        : "text-primary";

  return (
    <div className="select-none overflow-hidden border-y border-white/[0.06] bg-dark py-2.5">
      <div className="flex animate-ticker hover:[animation-play-state:paused]">
        <TickerContent accent={accent} />
        <TickerContent accent={accent} />
        <TickerContent accent={accent} />
      </div>
    </div>
  );
};

export default PromoTicker;
