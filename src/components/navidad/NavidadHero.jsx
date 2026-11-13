import React from "react";
import LiquidoHero from "@/components/navidad/LiquidoHero";

/**
 * Hero de la campaña de Navidad (`LIVE_CAMPAIGN = "navidad"` en
 * config/campaign.js, o `?campana=navidad` para verla sin encenderla).
 *
 * Igual que Halloween, Navidad puede tener varios estilos que se sortean al
 * montar la carta. Por ahora hay uno: "Líquido" (opción 15 del laboratorio
 * `/navidad-lab/`). Las demás opciones del laboratorio entran como variantes
 * aquí. Para forzar una: `/?hero=liquido` (también en `/mesa/...`).
 */

const VARIANTS = {
  liquido: LiquidoHero,
};

function pickVariant() {
  const names = Object.keys(VARIANTS);
  try {
    const forced = new URLSearchParams(window.location.search).get("hero");
    if (forced && VARIANTS[forced]) return forced;
  } catch {
    // sin URL legible: se sortea
  }
  return names[Math.floor(Math.random() * names.length)];
}

export default function NavidadHero() {
  const [variant] = React.useState(pickVariant);
  const Variant = VARIANTS[variant];
  return <Variant />;
}
