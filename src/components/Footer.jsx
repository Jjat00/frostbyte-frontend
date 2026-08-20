import React from "react";
import { Link } from "react-router-dom";
import { Instagram, LogIn, MapPin, MessageCircle } from "lucide-react";

/**
 * Pie de la carta pública.
 *
 * El 2026-08-20 pasó al lenguaje del hero: fuera las cuatro entradas de GSAP
 * (la línea superior expandiéndose, las columnas subiendo y los iconos
 * sociales rebotando con `elastic.out`) y los títulos en negrita grande.
 * Ahora las cuatro columnas se leen como una ficha: etiqueta pequeña arriba,
 * contenido en gris debajo.
 *
 * Dos enlaces rápidos apuntaban a anclas que no existen en la página
 * (`#products` y `#gallery`, esta última de una galería comentada desde hace
 * meses): se cambiaron por las que sí existen.
 */

const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/frostbyte.col/",
    label: "Instagram",
  },
  {
    icon: TikTokIcon,
    href: "https://www.tiktok.com/@frostbyte.col",
    label: "TikTok",
  },
];

const quickLinks = [
  { label: "Carta completa", href: "#carta" },
  { label: "Explorar por sección", href: "#menu" },
  { label: "Por qué Frostbyte", href: "#features" },
];

const Footer = () => {
  return (
    <footer className="fb-section fb-section--plain border-t border-white/[0.06] py-14">
      <div className="container relative z-10 mx-auto px-5">
        <div className="grid gap-9 md:grid-cols-4">
          {/* Marca */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-linear-to-br from-primary to-secondary">
                <span className="font-display text-base font-semibold text-dark">
                  F
                </span>
              </span>
              <span className="font-display text-base font-semibold tracking-[0.14em] text-light">
                FROSTBYTE
              </span>
            </div>
            <p className="text-[0.78rem] leading-relaxed text-light/50">
              Bebidas heladas en Cumbal, Nariño. Granizados, frappés, cócteles,
              shots, micheladas y el famoso Desguayabator.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <span className="fb-eyebrow mb-4 block">Enlaces rápidos</span>
            <nav className="space-y-2.5">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-[0.78rem] text-light/50 transition-colors hover:text-light"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://wa.me/573164277879"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[0.78rem] text-light/50 transition-colors hover:text-light"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </nav>
          </div>

          {/* Redes */}
          <div>
            <span className="fb-eyebrow mb-4 block">Síguenos</span>
            <p className="mb-4 text-[0.78rem] leading-relaxed text-light/50">
              Promociones y novedades, primero en redes.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="fb-pill px-3 py-2"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <span className="fb-eyebrow mb-4 block">Ubicación</span>
            <div
              className="flex items-start gap-2.5"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <MapPin className="mt-0.5 flex-shrink-0 text-light/45" size={15} />
              <div>
                <p className="text-[0.78rem] leading-relaxed text-light/50">
                  <span itemProp="streetAddress">Cra. 8 #18-13</span>
                  <br />
                  <span itemProp="addressLocality">Cumbal</span>,{" "}
                  <span itemProp="addressRegion">Nariño</span>
                  <br />
                  <span itemProp="addressCountry">Colombia</span>
                </p>
                <a
                  href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[0.78rem] text-light/70 transition-colors hover:text-light"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>

        <span aria-hidden className="fb-hairline my-9" />

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-[0.72rem] text-light/35">
            © 2026 Frostbyte Cumbal. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              to="/privacidad"
              className="text-[0.72rem] text-light/45 transition-colors hover:text-light"
            >
              Política de privacidad
            </Link>
            <Link
              to="/terminos"
              className="text-[0.72rem] text-light/45 transition-colors hover:text-light"
            >
              Términos de servicio
            </Link>
            {/* Puerta del staff. Vivía en el header como "Login", al lado de
                "Entrar" (la del cliente): dos etiquetas sinónimas que nadie
                sabía distinguir. Aquí no estorba a quien no es del equipo y
                quien la necesita sabe buscarla. */}
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[0.72rem] text-light/30 transition-colors hover:text-light/70"
            >
              <LogIn size={12} />
              Acceso equipo
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[0.72rem] text-light/30">
          Hecho por{" "}
          <a
            href="https://www.instagram.com/jaimejjat/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light/60 transition-colors hover:text-light"
          >
            Jaime Jjat
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
