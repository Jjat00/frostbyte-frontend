import React from "react";
import { Cake, Instagram } from "lucide-react";

const PROMOS = [
  { text: "50% OFF EL DIA DE TU CUMPLEAÑOS", icon: Cake },
  { text: "10% OFF POR SEGUIRNOS EN REDES", icon: Instagram },
];

const TickerContent = () => (
  <div className="flex items-center shrink-0">
    {PROMOS.map((promo, i) => {
      const Icon = promo.icon;
      return (
        <div key={i} className="flex items-center shrink-0 mx-6 sm:mx-10">
          <Icon className="text-dark shrink-0 mr-2" size={18} />
          <span className="text-dark font-black text-sm sm:text-base tracking-wide whitespace-nowrap">
            {promo.text}
          </span>
          <span className="text-dark/50 mx-6 sm:mx-10 text-lg select-none">
            ///
          </span>
        </div>
      );
    })}
  </div>
);

const PromoTicker = ({ variant = "primary" }) => {
  const gradients = {
    primary: "from-primary via-secondary to-primary",
    secondary: "from-secondary via-primary to-secondary",
    fire: "from-amber-400 via-orange-500 to-amber-400",
  };

  const gradient = gradients[variant] || gradients.primary;

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
          <TickerContent />
          <TickerContent />
          <TickerContent />
        </div>
      </div>
    </div>
  );
};

export default PromoTicker;
