import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Gamepad2, ImagePlus, Instagram, Music2, ShoppingBag, User, Wine } from "lucide-react";
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
export default function AmorAmistadHero() {
  const { isTableRoute } = useCartaPath();
  const { data: storeConfig } = useStoreConfig();
  const { data: reservationsConfig } = useReservationsConfig();
  const authenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const shotPromo = useCelebrationShotPromo();
  const reservationClass = "aa-button aa-button--secondary";

  return (
    <section className={`aa-hero${shotPromo ? " aa-hero--shot" : ""}`} aria-labelledby="aa-title">
      <div className="aa-container">
        <div className="aa-edition">
          <span>{shotPromo ? "Solo hoy · 19 de septiembre" : "Especial de Amor & Amistad"}</span>
          <span>Cumbal, Nariño</span>
        </div>

        <div className="aa-editorial">
          <div className="aa-copy">
            <p className="aa-kicker">{shotPromo ? "Amor y Amistad en Frostbyte" : "Un brindis por los nuestros"}</p>
            <h1 id="aa-title">{shotPromo ? <>Tu foto. Tu dedicatoria.<em>Un shot gratis.</em></> : <>Lo mejor es <em>compartirlo.</em></>}</h1>
            {shotPromo ? <>
              <p className="aa-description aa-promo-description">
                Publica tu foto o la tarjeta que crees aquí en Instagram y etiqueta a <strong>{SOCIAL_HANDLE}</strong>.
                {' '}Muéstranos la publicación en Frostbyte y reclama tu <strong>shot gratis</strong> por Amor y Amistad.
              </p>
              <ol className="aa-promo-steps" aria-label="Cómo reclamar tu shot gratis">
                <li><span>1</span>Elige tu foto y crea una dedicatoria.</li>
                <li><span>2</span>Publícala en Instagram y etiquétanos.</li>
                <li><span>3</span>Muéstrala en el local y reclama tu shot.</li>
              </ol>
            </> : <p className="aa-description">
              Con tu persona favorita. Con los amigos de siempre.
              Una bebida, buena música y tiempo para estar juntos.
            </p>}
            <div className="aa-actions">
              {shotPromo && <SeasonLink to="/amor-amistad/tarjeta" className="aa-button aa-button--primary">
                Crear mi dedicatoria <ImagePlus size={18} aria-hidden="true" />
              </SeasonLink>}
              <SeasonLink href="#carta" className={`aa-button aa-button--${shotPromo ? "secondary" : "primary"}`}>
                Explorar la carta <ArrowDown size={16} aria-hidden="true" />
              </SeasonLink>
              {!shotPromo && (isTableRoute ? (
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
              ))}
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
                <span className="aa-social-label">{shotPromo ? "Esta es la cuenta que debes etiquetar" : "Síguenos en Instagram"}</span>
                <span className="aa-social-handle">{SOCIAL_HANDLE}</span>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </SocialLink>

            <p className="aa-footnote">{shotPromo ? "Válido hoy, 19 de septiembre de 2026, en Frostbyte, Cumbal." : "Granizados · Frappés · Cócteles · Algo para compartir"}</p>
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
                <span>{shotPromo ? "Hoy brindamos por ustedes." : "Juntos sabe mejor."}</span>
              </div>
              <span className="aa-campaign-seal" aria-hidden="true">&</span>
            </div>
            <figcaption className="aa-dedication">
              <span className="aa-dedication-to">Para: mi persona favorita</span>
              <span className="aa-dedication-message">Nos debemos<br />un brindis.</span>
              <span className="aa-dedication-sign">Con amor, Frostbyte</span>
              <SeasonLink to="/amor-amistad/tarjeta" className="aa-dedication-link">{shotPromo ? "Crear mi dedicatoria" : "Crea la tuya con una foto"} <ArrowUpRight size={14} aria-hidden="true" /></SeasonLink>
            </figcaption>
          </figure>

          <nav className="aa-services" aria-label={isTableRoute ? "En tu mesa" : "Planea tu visita"}>
            <span className="aa-services-label">La noche es de ustedes</span>
            <div className="aa-services-links">
              {shotPromo && (isTableRoute ? (
                <SeasonLink href="#solicitar-cancion"><Music2 size={17} aria-hidden="true" /> Pedir canción</SeasonLink>
              ) : reservationsConfig?.reservations_enabled ? (
                <SeasonLink to="/reservas">Reservar mesa <ArrowUpRight size={16} aria-hidden="true" /></SeasonLink>
              ) : (
                <SeasonLink href={reservationsWaLink("Hola, quiero reservar una mesa para celebrar Amor y Amistad en Frostbyte")} target="_blank" rel="noopener noreferrer">Reservar mesa <ArrowUpRight size={16} aria-hidden="true" /></SeasonLink>
              ))}
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
