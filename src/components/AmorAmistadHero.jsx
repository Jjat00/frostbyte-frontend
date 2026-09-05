import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Gamepad2, Music2, ShoppingBag, User, Wine } from "lucide-react";
import { useCartaPath, useStoreConfig } from "@/hooks";
import { useReservationsConfig } from "@/hooks/useReservations";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { reservationsWaLink } from "@/lib/reservas";
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
export default function AmorAmistadHero({ locationLabel = "Cumbal, Nariño" }) {
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
          <span className={isTableRoute ? "aa-table-location" : undefined}>{locationLabel}</span>
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
            <p className="aa-footnote">Granizados · Frappés · Cócteles · Algo para compartir</p>
          </div>

          <figure className="aa-still-life">
            <div className="aa-photo aa-photo--first">
              <img src="/SODA-ITALIANA-FRESA-9715.webp" width="600" height="534"
                alt="Soda rosada de fresa con hielo" fetchPriority="high" />
              <span aria-hidden="true">Para ti.</span>
            </div>
            <div className="aa-photo aa-photo--second">
              <img src="/margarota.jpeg" width="570" height="333"
                alt="Margarita con limón y borde de sal" />
              <span aria-hidden="true">Para mí.</span>
            </div>
            <span className="aa-ampersand" aria-hidden="true">&</span>
            <figcaption>Sabores distintos. El mismo plan.</figcaption>
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
