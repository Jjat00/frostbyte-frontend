import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Gamepad2, Instagram, Music2, ShoppingBag, User, Wine } from "lucide-react";
import { useCartaPath, useStoreConfig } from "@/hooks";
import { useReservationsConfig } from "@/hooks/useReservations";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { reservationsWaLink } from "@/lib/reservas";
import SocialLink from "@/components/SocialLink";
import { SOCIAL_HANDLE, SOCIAL_SOURCE } from "@/lib/social";
import useCelebrationShotPromo from "@/hooks/useCelebrationShotPromo";
import "./amor-amistad.css";

const MotionLink = motion(Link);

// El resorte puede volver desde su posición actual si se cancela el toque.
function SeasonLink({ to, children, ...props }) {
  const reduceMotion = useReducedMotion();
  const Component = to ? MotionLink : motion.a;
  return (
    <Component {...(to ? { to } : {})} {...props}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 45 }}>
      {children}
    </Component>
  );
}

// Edición compartida por la portada y los QR de mesas de todos los pisos.
function StandardAmorAmistadHero() {
  const { isTableRoute } = useCartaPath();
  const { data: storeConfig } = useStoreConfig();
  const { data: reservationsConfig } = useReservationsConfig();
  const authenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const reservationClass = "aa-button aa-button--secondary";

  return (
    <section className="aa-hero" aria-labelledby="aa-title">
      <div className="aa-container">
        <div className="aa-edition">
          <span>Especial de Amor & Amistad</span>
          <span>Cumbal, Nariño</span>
        </div>

        <div className="aa-editorial">
          <div className="aa-copy">
            <p className="aa-kicker">Un brindis por los nuestros</p>
            <h1 id="aa-title">Lo mejor es <em>compartirlo.</em></h1>
            <p className="aa-description">
              Con tu persona favorita. Con los amigos de siempre.
              Una bebida, buena música y tiempo para estar juntos.
            </p>
            <div className="aa-actions">
              <SeasonLink href="#carta" className="aa-button aa-button--primary">
                Explorar la carta <ArrowDown size={16} aria-hidden="true" />
              </SeasonLink>
              {isTableRoute ? (
                <SeasonLink href="#solicitar-cancion" className={reservationClass}>
                  Pedir canción <Music2 size={16} aria-hidden="true" />
                </SeasonLink>
              ) : reservationsConfig?.reservations_enabled ? (
                <SeasonLink to="/reservas" className={reservationClass}>
                  Reservar mesa <ArrowUpRight size={16} aria-hidden="true" />
                </SeasonLink>
              ) : (
                <SeasonLink href={reservationsWaLink("Hola, quiero reservar una mesa para celebrar Amor y Amistad en Frostbyte")}
                  target="_blank" rel="noopener noreferrer" className={reservationClass}>
                  Reservar mesa <ArrowUpRight size={16} aria-hidden="true" />
                </SeasonLink>
              )}
            </div>
            {/* Instagram al nivel de los CTA, no escondido al pie: es el
                sitio por el que la carta puede convertir un visitante en
                seguidor, y antes no se veía en ninguna de las dos
                direcciones. Abre en pestaña nueva para no perder la carta. */}
            <SocialLink
              network="instagram"
              source={SOCIAL_SOURCE.HERO}
              className="aa-social"
            >
              <Instagram size={19} aria-hidden="true" />
              <span className="aa-social-text">
                <span className="aa-social-label">Síguenos en Instagram</span>
                <span className="aa-social-handle">{SOCIAL_HANDLE}</span>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </SocialLink>

            <p className="aa-footnote">Granizados · Frappés · Cócteles · Algo para compartir</p>
          </div>

          <figure className="aa-campaign">
            <div className="aa-campaign-frame">
              <img
                src="/images/amor-amistad-brindis.webp"
                srcSet="/images/amor-amistad-brindis-mobile.webp 640w, /images/amor-amistad-brindis.webp 1122w"
                sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1000px) 46vw, 560px"
                width="1122" height="1402"
                alt="Escena de celebración: dos bebidas sobre mármol negro, unidas por un lazo de satén vino junto a una vela."
                fetchPriority="high"
              />
              <div className="aa-campaign-signature" aria-hidden="true">
                <span>FROSTBYTE</span>
                <span>Juntos sabe mejor.</span>
              </div>
              <span className="aa-campaign-seal" aria-hidden="true">&</span>
            </div>
            <figcaption className="aa-dedication">
              <span className="aa-dedication-to">Para: mi persona favorita</span>
              <span className="aa-dedication-message">Nos debemos<br />un brindis.</span>
              <span className="aa-dedication-sign">Con amor, Frostbyte</span>
              <SeasonLink to="/amor-amistad/tarjeta" className="aa-dedication-link">Crea la tuya con una foto <ArrowUpRight size={14} aria-hidden="true" /></SeasonLink>
            </figcaption>
          </figure>

          <nav className="aa-services" aria-label={isTableRoute ? "En tu mesa" : "Planea tu visita"}>
            <span className="aa-services-label">La noche es de ustedes</span>
            <div className="aa-services-links">
              <SeasonLink href="#sala-vip"><Wine size={17} aria-hidden="true" /> Sala VIP</SeasonLink>
              {!isTableRoute && (
                <SeasonLink href="#solicitar-cancion"><Music2 size={17} aria-hidden="true" /> Pedir canción</SeasonLink>
              )}
              {isTableRoute ? (
                <SeasonLink href="#frostbyte-play"><Gamepad2 size={17} aria-hidden="true" /> Juegos</SeasonLink>
              ) : (
                <SeasonLink to="/game"><Gamepad2 size={17} aria-hidden="true" /> Juegos</SeasonLink>
              )}
              {storeConfig?.customer_ordering_enabled && (
                <SeasonLink to="/domicilios"><ShoppingBag size={17} aria-hidden="true" /> Domicilios</SeasonLink>
              )}
              <SeasonLink to="/mi-cuenta"><User size={17} aria-hidden="true" /> {authenticated ? "Mi cuenta" : "Crear cuenta"}</SeasonLink>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

/** Una pieza fotográfica, dos acciones. La promoción caduca con el día. */
export default function AmorAmistadHero() {
  const shotPromo = useCelebrationShotPromo();
  if (!shotPromo) return <StandardAmorAmistadHero />;
  return (
    <section className="aa-hero aa-photo-hero" aria-labelledby="aa-photo-title">
      <div className="aa-container">
        <div className="aa-photo-poster">
          <img className="aa-photo-background"
            src="/images/amor-amistad-brindis.webp"
            srcSet="/images/amor-amistad-brindis-mobile.webp 640w, /images/amor-amistad-brindis.webp 1122w"
            sizes="(max-width: 640px) 100vw, (max-width: 1000px) 90vw, 1200px"
            width="1122" height="1402" alt="" fetchPriority="high" />
          <div className="aa-photo-content">
            <div className="aa-photo-edition">
              <span>Amor & Amistad</span>
              <span>Solo hoy · 19 septiembre</span>
            </div>
            <div className="aa-photo-intro">
              <p className="aa-kicker">Para tu persona favorita</p>
              <h1 id="aa-photo-title">Su foto.<br />Tu dedicatoria.<br /><em>Un shot gratis.</em></h1>
              <p className="aa-photo-description">Hay fotos que merecen unas palabras.<br />Y un brindis para celebrarlas.</p>
            </div>
            <div className="aa-photo-instructions">
              <p className="aa-photo-instructions-title">De su foto al brindis</p>
              <ol className="aa-photo-steps" aria-label="Cómo reclamar tu shot gratis">
                <li><span className="aa-photo-number">01</span><div><strong>Crea tu dedicatoria</strong><p>Elige una foto y conviértela en una tarjeta para alguien especial.</p></div></li>
                <li><span className="aa-photo-number">02</span><div><strong>Publica y etiquétanos</strong><p>Sube tu foto o tarjeta a Instagram y etiqueta a <b>{SOCIAL_HANDLE}</b>.</p></div></li>
                <li><span className="aa-photo-number">03</span><div><strong>Reclama tu shot gratis</strong><p>Muéstranos la publicación en Frostbyte y brindamos contigo.</p></div></li>
              </ol>
            </div>
            <div className="aa-photo-footer">
              <div className="aa-actions">
                <SeasonLink to="/amor-amistad/tarjeta" className="aa-button aa-button--primary">
                  Crear mi dedicatoria <ArrowUpRight size={18} aria-hidden="true" />
                </SeasonLink>
                <SocialLink network="instagram" source={SOCIAL_SOURCE.HERO} className="aa-button aa-button--secondary">
                  <Instagram size={18} aria-hidden="true" /> Ir a Instagram
                </SocialLink>
              </div>
              <p>19 de septiembre de 2026<br />Frostbyte · Cumbal, Nariño</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
