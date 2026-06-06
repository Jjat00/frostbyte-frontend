import React from "react";
import { Cake, Instagram } from "lucide-react";

const PROMOS = [
  { text: "50% OFF EL DIA DE TU CUMPLEAÑOS", icon: Cake },
  { text: "10% OFF POR SEGUIRNOS EN REDES", icon: Instagram },
];

const TickerContent = ({ onDark = false }) => {
  // Cintas verde/oro (claras) -> texto oscuro; cinta fire (granate, oscura) -> texto claro.
  const textColor = onDark ? "text-white" : "text-dark";
  const sepColor = onDark ? "text-white/50" : "text-dark/50";

  return (
    <div className="flex items-center shrink-0">
      {PROMOS.map((promo, i) => {
        const Icon = promo.icon;
        return (
          <div key={i} className="flex items-center shrink-0 mx-6 sm:mx-10">
            <Icon className={`${textColor} shrink-0 mr-2`} size={18} />
            <span className={`${textColor} font-black text-sm sm:text-base tracking-wide whitespace-nowrap`}>
              {promo.text}
            </span>
            <span className={`${sepColor} mx-6 sm:mx-10 text-lg select-none`}>
              ///
            </span>
          </div>
        );
      })}
    </div>
  );
};

const PromoTicker = ({ variant = "primary" }) => {
  const gradients = {
    primary: "from-grass via-gold to-grass",
    secondary: "from-gold via-grass to-gold",
    fire: "from-red-600 via-[#7d1622] to-red-600",
  };

  const gradient = gradients[variant] || gradients.primary;
  // La cinta "fire" (granate/rojo de afiche) es oscura: texto claro para contraste.
  const onDark = variant === "fire";

  return (
    <div className="relative py-0.5 overflow-hidden select-none">
      {/* Glow superior e inferior */}
      <div className={`absolute inset-x-0 -top-2 h-4 bg-gradient-to-r ${gradient} blur-xl opacity-40`} />
      <div className={`absolute inset-x-0 -bottom-2 h-4 bg-gradient-to-r ${gradient} blur-xl opacity-40`} />

      {/* Cinta principal */}
      <div className={`relative bg-gradient-to-r ${gradient} py-2.5 overflow-hidden`}>
        {/* Patrón de rayas diagonales */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)",
          }}
        />

        {/* Contenedor del scroll infinito */}
        <div className="flex animate-ticker hover:[animation-play-state:paused]">
          <TickerContent onDark={onDark} />
          <TickerContent onDark={onDark} />
          <TickerContent onDark={onDark} />
        </div>
      </div>
    </div>
  );
};

export default PromoTicker;
