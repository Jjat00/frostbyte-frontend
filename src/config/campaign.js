/* ═══════════════════════════════════════════════════════════════════
   INTERRUPTOR DE CAMPAÑAS TEMPORALES

   Una campaña es un skin de temporada (Amor y Amistad, Halloween,
   diciembre...) que se pone encima de la carta pública sin tocar el
   design system de marca. Para apagarla y volver al look habitual de
   Frostbyte basta con dejar LIVE_CAMPAIGN en null: no hay que
   despintar componentes a mano como pasó con el skin del Mundial 2026.

   TODO lo que cambie un píxel del look habitual tiene que colgar de
   esta constante o del tema `.theme-<campaña>` en theme.css. Si algún
   día hay que revertir a mano un color hardcodeado en un componente,
   es que este archivo se saltó.

   Apagar la campaña:
     1. LIVE_CAMPAIGN = null
     2. commit + push a main (Cloudflare Pages redespliega solo)
   Encenderla el año que viene: la misma línea al revés.

   El CSS de la campaña viaja en el bundle aunque esté apagada (~1,5 KB
   gzip), pero es inerte: todas sus reglas cuelgan de `.theme-<campaña>`
   o de clases `aa-*` que solo existen dentro de sus componentes.
   ═══════════════════════════════════════════════════════════════════ */

/** Campaña encendida para todo el mundo, o null para el look habitual. */
const LIVE_CAMPAIGN = null;

/**
 * Campañas terminadas pero apagadas que se pueden ver antes de encenderlas:
 * `/?campana=halloween` (o `/mesa/2/1?campana=halloween`). Solo cambia la
 * pestaña de quien abre el enlace y se recuerda en sessionStorage mientras
 * esa pestaña siga abierta; `?campana=ninguna` la quita.
 */
const PREVIEWABLE = ["halloween"];
const PREVIEW_KEY = "frostbyte_campaign_preview";

function previewCampaign() {
  try {
    const asked = new URLSearchParams(window.location.search).get("campana");
    if (asked === "ninguna") sessionStorage.removeItem(PREVIEW_KEY);
    else if (PREVIEWABLE.includes(asked)) sessionStorage.setItem(PREVIEW_KEY, asked);
    const saved = sessionStorage.getItem(PREVIEW_KEY);
    return PREVIEWABLE.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** Campaña activa en esta pestaña, o null para el look habitual. */
export const ACTIVE_CAMPAIGN = previewCampaign() ?? LIVE_CAMPAIGN;

/** true si `name` es la campaña que está corriendo ahora mismo. */
export const isCampaign = (name) => ACTIVE_CAMPAIGN === name;

/** Hay alguna campaña encendida. */
export const campaignOn = ACTIVE_CAMPAIGN !== null;

/**
 * Clase de tema para el contenedor raíz de la carta pública.
 * Vacía sin campaña, así que los tokens de `@theme` mandan sin tocar nada.
 */
export const campaignThemeClass = ACTIVE_CAMPAIGN ? `theme-${ACTIVE_CAMPAIGN}` : "";

/**
 * Clase del <main> de la carta, por campaña. La usa para reestilar las
 * secciones (fb-section, fb-card) sin que esas reglas existan fuera de ella.
 */
const BODY_CLASS = {
  "amor-amistad": "aa-menu-body",
  halloween: "hw-menu-body",
};

export const campaignBodyClass = BODY_CLASS[ACTIVE_CAMPAIGN] ?? "";
