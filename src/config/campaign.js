/* ═══════════════════════════════════════════════════════════════════
   INTERRUPTOR DE CAMPAÑAS TEMPORALES

   Una campaña es un skin de temporada (Amor y Amistad, Halloween,
   diciembre...) que se pone encima de la carta pública sin tocar el
   design system de marca. Para apagarla y volver al look habitual de
   Frostbyte basta con dejar ACTIVE_CAMPAIGN en null: no hay que
   despintar componentes a mano como pasó con el skin del Mundial 2026.

   TODO lo que cambie un píxel del look habitual tiene que colgar de
   esta constante o del tema `.theme-<campaña>` en theme.css. Si algún
   día hay que revertir a mano un color hardcodeado en un componente,
   es que este archivo se saltó.

   Apagar la campaña:
     1. ACTIVE_CAMPAIGN = null
     2. commit + push a main (Cloudflare Pages redespliega solo)
   Encenderla el año que viene: la misma línea al revés.

   El CSS de la campaña viaja en el bundle aunque esté apagada (~1,5 KB
   gzip), pero es inerte: todas sus reglas cuelgan de `.theme-<campaña>`
   o de clases `aa-*` que solo existen dentro de sus componentes.
   ═══════════════════════════════════════════════════════════════════ */

/** Campaña activa, o null para el look habitual de Frostbyte. */
export const ACTIVE_CAMPAIGN = "amor-amistad";

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
};

export const campaignBodyClass = BODY_CLASS[ACTIVE_CAMPAIGN] ?? "";
