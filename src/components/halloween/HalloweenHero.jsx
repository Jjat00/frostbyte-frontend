import React from "react";
import ApagaLaLuzHero from "@/components/halloween/ApagaLaLuzHero";
import HalloweenDecor from "@/components/halloween/HalloweenDecor";
import SeRobaronLaOHero from "@/components/halloween/SeRobaronLaOHero";
import "./halloween.css";

/**
 * Hero de la campaña de Halloween (`LIVE_CAMPAIGN = "halloween"` en
 * config/campaign.js, o `?campana=halloween` para verla sin encenderla).
 *
 * Halloween no tiene un solo hero sino varios estilos que se sortean cada vez
 * que se monta la carta: cada recarga, o cada vuelta a la carta desde otra
 * página, puede traer otro. No se recuerda nada: solo cambia el hero, el
 * resto de la carta es igual, y así se descubren todos.
 *
 * Para probar una variante concreta: `/?hero=apaga-la-luz` o
 * `/?hero=se-robaron-la-o` (también en `/mesa/...`). Añadir una variante =
 * importarla y sumarla a VARIANTS.
 *
 * Monta también los adornos de la carta (`HalloweenDecor`), que son los
 * mismos para cualquier variante.
 */

const VARIANTS = {
  "apaga-la-luz": ApagaLaLuzHero,
  "se-robaron-la-o": SeRobaronLaOHero,
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

export default function HalloweenHero() {
  const [variant] = React.useState(pickVariant);
  const Variant = VARIANTS[variant];
  return (
    <>
      <Variant />
      <HalloweenDecor />
    </>
  );
}
