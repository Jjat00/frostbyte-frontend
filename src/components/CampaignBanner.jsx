import React from "react";
import { isCampaign } from "@/config/campaign";
import CelebrationCardBanner from "@/components/CelebrationCardBanner";

/**
 * Banner que la campaña de turno inserta bajo el QuickNav. Sin campaña no
 * renderiza nada, así que la carta queda igual que antes de la temporada.
 */
export default function CampaignBanner() {
  if (isCampaign("amor-amistad")) return <CelebrationCardBanner />;
  return null;
}
