import React from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Cake,
  Users,
  UtensilsCrossed,
  MessageCircle,
  CalendarDays,
  Phone,
} from "lucide-react";
import { useReservationsConfig } from "@/hooks/useReservations";
import {
  RESERVATIONS_PHONE,
  reservationsTelLink,
  reservationsWaLink,
} from "@/lib/reservas";

/**
 * Banner promocional de la Sala VIP (piso 3).
 *
 * Promociona la sala para cumpleaños, celebraciones y eventos de grupos
 * (hasta ~15 personas). Con las reservas en línea activas el CTA lleva a
 * /reservas; apagadas (estado de hoy: el módulo lo opera el staff), la sala se
 * aparta escribiendo o llamando a la línea de reservas.
 *
 * Reservar es el servicio "duo" del hero: no lleva un color propio sino el
 * degradado de los dos de marca. Por eso aquí el bloque va en neutro y el
 * único color es el hilo de 44 px.
 */
const SalaVipBanner = () => {
  const { data: reservationsConfig } = useReservationsConfig();
  const onlineReservations = !!reservationsConfig?.reservations_enabled;

  const rasgos = [
    { Icon: Users, text: `Hasta ${reservationsConfig?.vip_capacity ?? 15} personas` },
    { Icon: Cake, text: "Cumpleaños y eventos" },
    { Icon: UtensilsCrossed, text: "Con nuestra comida" },
  ];

  return (
    <section id="sala-vip" className="fb-section py-9">
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal fb-card mx-auto max-w-xl p-5 sm:p-6">
          {/* Encabezado */}
          <div className="mb-5 flex items-center gap-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] border border-white/[0.12] bg-linear-to-br from-primary/15 to-secondary/15">
              <Crown size={19} className="text-light/75" />
            </span>
            <div className="min-w-0">
              <span className="fb-eyebrow block">Piso 3</span>
              <h3 className="font-display m-0 mt-1.5 text-lg font-semibold uppercase leading-none tracking-[0.14em] text-light">
                Sala VIP
              </h3>
            </div>
          </div>

          {/* Qué es */}
          <div className="fb-inset mb-4 p-3.5">
            <p className="text-[0.78rem] leading-relaxed text-light/65">
              La sala privada del tercer piso se aparta para tu{" "}
              <span className="text-light">cumpleaños</span>, una{" "}
              <span className="text-light">celebración</span> o el plan que
              quieras con tus amigos. Un espacio solo para ustedes.
            </p>
          </div>

          {/* Rasgos */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            {rasgos.map(({ Icon, text }) => (
              <div
                key={text}
                className="fb-inset flex flex-col items-center gap-2 p-3 text-center"
              >
                <Icon size={16} className="text-light/55" />
                <span className="text-[0.62rem] leading-tight text-light/55">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA: reservar en línea si el módulo está activo; si no, WhatsApp */}
          {onlineReservations ? (
            <>
              <p className="mb-3 text-center text-[0.75rem] text-light/60">
                Elige tu fecha y tu turno: la sala es de ustedes.
              </p>
              <Link to="/reservas" className="fb-btn fb-btn--accent w-full">
                <CalendarDays size={16} />
                Reservar la sala
              </Link>
            </>
          ) : (
            <>
              <p className="mb-3 text-center text-[0.75rem] text-light/60">
                ¿Te interesa? Escríbenos o llámanos al{" "}
                <span className="text-light">{RESERVATIONS_PHONE.display}</span>{" "}
                y te contamos todo.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href={reservationsWaLink(
                    "Hola, quiero más información sobre la Sala VIP del piso 3"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fb-btn fb-btn--accent w-full"
                >
                  <MessageCircle size={16} />
                  Escribir por WhatsApp
                </a>
                <a href={reservationsTelLink} className="fb-btn w-full">
                  <Phone size={16} />
                  Llamar
                </a>
              </div>
            </>
          )}

          <p className="mt-4 text-center text-[0.62rem] text-light/30">
            Cupos por fecha limitados · Reserva con anticipación
          </p>
        </div>
      </div>
    </section>
  );
};

export default SalaVipBanner;
