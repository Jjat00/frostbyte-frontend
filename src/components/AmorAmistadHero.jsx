import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Gamepad2, Music2, ShoppingBag, User, Wine } from "lucide-react";
import { useCartaPath, useStoreConfig } from "@/hooks";
import { useReservationsConfig } from "@/hooks/useReservations";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { reservationsWaLink } from "@/lib/reservas";
import "./amor-amistad.css";

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
              <a href="#carta" className="aa-button aa-button--primary">
                Explorar la carta <ArrowDown size={16} aria-hidden="true" />
              </a>
              {reservationsConfig?.reservations_enabled ? (
                <Link to="/reservas" className={reservationClass}>
                  Reservar mesa <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <a href={reservationsWaLink("Hola, quiero reservar una mesa para celebrar Amor y Amistad en Frostbyte")}
                  target="_blank" rel="noopener noreferrer" className={reservationClass}>
                  Reservar mesa <ArrowUpRight size={16} aria-hidden="true" />
                </a>
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
        </div>

        <nav className="aa-services" aria-label="Planea tu visita">
          <span className="aa-services-label">La noche es de ustedes</span>
          <div className="aa-services-links">
            <a href="#sala-vip"><Wine size={17} aria-hidden="true" /> Sala VIP</a>
            <a href="#solicitar-cancion"><Music2 size={17} aria-hidden="true" /> Pedir canción</a>
            {isTableRoute ? (
              <a href="#frostbyte-play"><Gamepad2 size={17} aria-hidden="true" /> Juegos</a>
            ) : (
              <Link to="/game"><Gamepad2 size={17} aria-hidden="true" /> Juegos</Link>
            )}
            {storeConfig?.customer_ordering_enabled && (
              <Link to="/domicilios"><ShoppingBag size={17} aria-hidden="true" /> Domicilios</Link>
            )}
            <Link to="/mi-cuenta"><User size={17} aria-hidden="true" /> {authenticated ? "Mi cuenta" : "Crear cuenta"}</Link>
          </div>
        </nav>
      </div>
    </section>
  );
}
