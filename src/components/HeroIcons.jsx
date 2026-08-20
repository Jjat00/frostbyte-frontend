import React from "react";

/**
 * Set de iconos propio del hero de servicios.
 *
 * Monolínea sobre rejilla de 24, trazo 1,3 y extremos redondeados, sin
 * relleno ni detalle interior. Se dibujaron a mano en vez de usar los de
 * lucide (que sí sirven al resto de la app) porque a este tamaño y con esta
 * densidad los de librería se leían recargados. Las metáforas son directas:
 * vaso, bolsa, calendario, diamante, ecualizador, dado y persona.
 *
 * El color entra por `currentColor`: la tarjeta decide con `text-primary`,
 * `text-secondary` o el neutro. La única excepción es el icono de reservar,
 * que admite el degradado de los dos colores de marca (prop `duo`).
 */

const DUO_GRADIENT_ID = "hero-duo-stroke";

const svgProps = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
});

/** Vaso: la carta */
export const CupIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M7.5 4.5h9l-1.1 14.6a2 2 0 0 1-2 1.9h-2.8a2 2 0 0 1-2-1.9z" />
    <path d="M8.2 10.6h7.6" />
  </svg>
);

/** Bolsa: domicilios (no bicicleta: lo que llega es el pedido) */
export const BagIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M6 8h12l-.9 11.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8z" />
    <path d="M9.5 8V6.6a2.5 2.5 0 0 1 5 0V8" />
  </svg>
);

/**
 * Calendario: reservar. Con `duo` el trazo va en degradado magenta→cyan,
 * el único acento que mezcla los dos colores de marca.
 */
export const CalendarIcon = ({ size = 20, className, duo = false }) => (
  <svg
    {...svgProps(size)}
    className={className}
    stroke={duo ? `url(#${DUO_GRADIENT_ID})` : "currentColor"}
  >
    {duo && (
      <defs>
        <linearGradient
          id={DUO_GRADIENT_ID}
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" style={{ stopColor: "var(--color-primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-secondary)" }} />
        </linearGradient>
      </defs>
    )}
    <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
    <path d="M8 3.5v4" />
    <path d="M16 3.5v4" />
    <path d="M3.5 10.6h17" />
    <circle cx="12" cy="15.4" r="1" />
  </svg>
);

/** Diamante: Sala VIP */
export const DiamondIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M12 4.5 16.5 9.8 12 20 7.5 9.8z" />
    <path d="M7.5 9.8h9" />
  </svg>
);

/** Ecualizador: pedir canción (no nota musical: aquí se elige, no se oye) */
export const EqualizerIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M6 10v4" />
    <path d="M10.7 6.5v11" />
    <path d="M15.3 8.8v6.4" />
    <path d="M20 11v2" />
  </svg>
);

/** Dado: juegos */
export const DiceIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="9.2" cy="9.2" r="1" />
    <circle cx="14.8" cy="14.8" r="1" />
  </svg>
);

/** Persona: la cuenta del cliente */
export const UserIcon = ({ size = 20, className }) => (
  <svg {...svgProps(size)} className={className}>
    <circle cx="12" cy="8.8" r="3.3" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);

/** Flecha: el "entra aquí" de las tarjetas grandes en móvil */
export const ArrowIcon = ({ size = 16, className }) => (
  <svg {...svgProps(size)} className={className}>
    <path d="M4 12h15" />
    <path d="m13.5 6.5 6 5.5-6 5.5" />
  </svg>
);
