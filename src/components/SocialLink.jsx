import React from "react";
import { Instagram } from "lucide-react";
import { SOCIAL, trackSocialClick } from "@/lib/social";

/**
 * Icono de TikTok. Estaba copiado en el hero, el pie y el banner del
 * descuento; se queda aquí, junto al enlace que lo usa.
 */
export const TikTokIcon = ({ size = 20, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export const SOCIAL_ICON = {
  instagram: Instagram,
  tiktok: TikTokIcon,
};

/**
 * Enlace a una red social que se cuenta al tocarlo.
 *
 * `source` dice desde qué parte de la app se tocó (ver `SOCIAL_SOURCE`): es
 * lo único que permite comparar después si el hero trae más que el banner.
 * Un `onClick` propio se respeta y se ejecuta después del registro.
 */
const SocialLink = ({
  network,
  source,
  className = "",
  children,
  onClick,
  ...rest
}) => {
  const social = SOCIAL[network];
  if (!social) return null;

  const handleClick = (event) => {
    trackSocialClick(network, source);
    onClick?.(event);
  };

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={`${social.label} de Frostbyte`}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
};

export default SocialLink;
