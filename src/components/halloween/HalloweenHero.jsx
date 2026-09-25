import React from "react";
import ApagaLaLuzHero from "@/components/halloween/ApagaLaLuzHero";
import HalloweenDecor from "@/components/halloween/HalloweenDecor";
import SeRobaronLaOHero from "@/components/halloween/SeRobaronLaOHero";
import "./halloween.css";

/**
 * Hero de la campaña de Halloween (`LIVE_CAMPAIGN = "halloween"` en
 * config/campaign.js, o `?campana=halloween` para verla sin encenderla).
 *
 * Halloween no tiene un solo hero sino varios estilos que se sortean: cada
 * visita ve uno al azar (una persona entra y ve "Apaga la luz", la siguiente
 * otro). El sorteo se guarda en sessionStorage para que la variante no
 * cambie mientras la misma persona navega y vuelve a la carta.
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

const STORAGE_KEY = "frostbyte_halloween_hero";

function pickVariant() {
  const names = Object.keys(VARIANTS);
  try {
    const forced = new URLSearchParams(window.location.search).get("hero");
    if (forced && VARIANTS[forced]) return forced;
  } catch {
    // sin URL legible: se sortea
  }
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved && VARIANTS[saved]) return saved;
  } catch {
    // sessionStorage bloqueado (modo privado estricto): se sortea igual
  }
  const pick = names[Math.floor(Math.random() * names.length)];
  try {
    sessionStorage.setItem(STORAGE_KEY, pick);
  } catch {
    // no pasa nada si no se puede recordar
  }
  return pick;
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
