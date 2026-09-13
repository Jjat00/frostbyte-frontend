/**
 * Redes sociales de Frostbyte: enlaces y medición de los clics de salida.
 *
 * Las URLs estaban copiadas en cinco archivos (hero, pie, banner del
 * descuento y las dos páginas legales). Cambiar de cuenta obligaba a
 * recordarlos todos, así que viven aquí.
 *
 * La medición responde una sola pregunta: de los sitios donde ofrecemos
 * Instagram, ¿cuál trae gente? Sin ese dato no hay forma de saber cuál
 * conservar y cuál quitar. Ojo con lo que NO mide: nadie puede saber desde
 * la web si la persona terminó siguiendo la cuenta. Un clic es intención,
 * no un seguidor.
 */

import { env } from "@/config/env";

export const SOCIAL_HANDLE = "@frostbyte.col";

export const SOCIAL = {
  instagram: {
    network: "instagram",
    label: "Instagram",
    handle: SOCIAL_HANDLE,
    url: "https://www.instagram.com/frostbyte.col/",
  },
  tiktok: {
    network: "tiktok",
    label: "TikTok",
    handle: SOCIAL_HANDLE,
    url: "https://www.tiktok.com/@frostbyte.col",
  },
};

/**
 * Orígenes válidos. Tienen que coincidir con `SocialClick.SOURCE_CHOICES`
 * del backend: uno que no esté en esa lista se rechaza con un 400.
 */
export const SOCIAL_SOURCE = {
  HERO: "hero",
  BANNER_DESCUENTO: "banner_descuento",
  POPUP: "popup",
  FOOTER: "footer",
  CARTA: "carta",
};

/**
 * Registra el clic sin estorbar la navegación.
 *
 * Va por `sendBeacon` a propósito: al tocar el enlace el navegador manda la
 * app a segundo plano para abrir Instagram, y ahí un `fetch` normal se queda
 * a medias. El beacon lo entrega el sistema operativo aunque la pestaña
 * pierda el foco. Si no existe (Safari viejo), se cae a `fetch` con
 * `keepalive`, que da la misma garantía.
 *
 * Nunca lanza: perder una métrica no puede romperle la carta a nadie.
 */
export function trackSocialClick(network, source) {
  const url = `${env.API_BASE_URL}/social/register-click/`;
  const payload = JSON.stringify({ network, source });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Sin red, con el beacon bloqueado o en un navegador que no lo soporta:
    // el clic sigue funcionando, solo no queda contado.
  }
}
