import React from "react";
import { isCampaign } from "@/config/campaign";
import Hero from "@/components/Hero";
import AmorAmistadHero from "@/components/AmorAmistadHero";

/**
 * El encabezado de la carta pública: el de la campaña de turno, o el Hero
 * de siempre cuando no hay ninguna. Existe para que App.jsx y TablePage.jsx
 * no repitan la condición (y no se olvide una al apagar la campaña).
 *
 * Sin lazy a propósito: la carta pública es la ruta más visitada y no es
 * lazy, así que un Suspense aquí metería un salto en lo primero que se ve.
 */
export default function CampaignHero() {
  if (isCampaign("amor-amistad")) return <AmorAmistadHero />;
  return <Hero />;
}
