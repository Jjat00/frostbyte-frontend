import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import SocialLink, { SOCIAL_ICON, TikTokIcon } from "@/components/SocialLink";
import { SOCIAL, SOCIAL_HANDLE, SOCIAL_SOURCE } from "@/lib/social";
import { useCartaPath, useStoreConfig } from "@/hooks";
import { reservationsWaLink } from "@/lib/reservas";
import { useReservationsConfig } from "@/hooks/useReservations";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import {
  ArrowIcon,
  BagIcon,
  CalendarIcon,
  CupIcon,
  DiamondIcon,
  DiceIcon,
  EqualizerIcon,
  UserIcon,
} from "@/components/HeroIcons";

gsap.registerPlugin(useGSAP);

/**
 * Hero de servicios de la carta pública (`/`) y de la vista de mesa
 * (`/mesa/*`).
 *
 * Es un hero FUNCIONAL: quien entra por el QR o por el enlace descubre de un
 * vistazo todo lo que Frostbyte hace, no solo que existe la carta. Antes vendía
 * ambiente (saludo, día, tira de fechas, frase generada por IA) y escondía
 * domicilios, reservas, Sala VIP, música y juegos detrás de un scroll largo.
 *
 * Dos direcciones de diseño, una por tamaño de pantalla (elegidas el
 * 2026-08-20 sobre el canvas de maquetas):
 * - Móvil, "vitrina": marca compacta y los tres servicios que mueven dinero
 *   como tarjetas grandes; los otros cuatro, más tenues, bajo "TAMBIÉN".
 * - Escritorio, "marca primero": el titular grande manda y los siete accesos
 *   van en rejilla numerada; ahí sí caben las redes sociales.
 * Un solo árbol de DOM sirve a las dos (misma rejilla con `col-span`
 * distintos), así que hay un único h1 y el contenido no se duplica.
 *
 * Siete accesos, no ocho: Frostbyte Food no lleva uno propio porque su comida
 * ya abre la carta (`CartaList`); dos puertas al mismo sitio confunden.
 *
 * Reglas del lenguaje visual (ver la nota del vault "Tres direcciones para el
 * hero de servicios de Frostbyte"): fondo de degradado con grano, tarjetas de
 * vidrio rebajado SIN `backdrop-filter` (es lo que castigaba las GPU de gama
 * baja) y color de marca con oficio — magenta la carta, cyan domicilios, el
 * degradado de ambos reservar, el resto neutro.
 */

const InstagramIcon = SOCIAL_ICON.instagram;

// Fondo del hero: dos velos de marca sobre el degradado oscuro, más una
// textura de grano. Todo CSS, sin imágenes: no pesa ni retrasa la pintura.
const BACKDROP = {
  backgroundImage: [
    "radial-gradient(115% 75% at 8% -5%, color-mix(in srgb, var(--color-primary) 13%, transparent) 0%, transparent 58%)",
    "radial-gradient(105% 70% at 100% 105%, color-mix(in srgb, var(--color-secondary) 11%, transparent) 0%, transparent 58%)",
    "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 45%, rgba(0,0,0,0.28) 100%)",
  ].join(", "),
};

const GRAIN = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
  opacity: 0.05,
};

// Vidrio rebajado: la mitad del liquid-glass de la app y sin blur.
const CARD_SURFACE =
  "linear-gradient(155deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 48%, rgba(255,255,255,0.038) 100%)";

const ACCENT_VEIL = {
  primary:
    "radial-gradient(85% 120% at 0% 0%, color-mix(in srgb, var(--color-primary) 11%, transparent) 0%, transparent 62%)",
  secondary:
    "radial-gradient(85% 120% at 0% 0%, color-mix(in srgb, var(--color-secondary) 11%, transparent) 0%, transparent 62%)",
  duo: [
    "radial-gradient(85% 120% at 0% 0%, color-mix(in srgb, var(--color-primary) 9%, transparent) 0%, transparent 55%)",
    "radial-gradient(85% 120% at 100% 100%, color-mix(in srgb, var(--color-secondary) 9%, transparent) 0%, transparent 55%)",
  ].join(", "),
};

// El borde va por clase (no en el `style`) para que el hover pueda pisarlo:
// un estilo en línea le gana a cualquier utilidad.
const ACCENT_BORDER = {
  primary: "border-primary/20 hover:border-primary/45",
  secondary: "border-secondary/20 hover:border-secondary/45",
  duo: "border-white/[0.14] hover:border-white/30",
};
const NEUTRAL_BORDER = "border-white/[0.085] hover:border-white/20";

// Caja del icono en móvil. En escritorio se disuelve: el icono queda suelto
// arriba a la derecha, junto al número del acceso.
const ICON_BOX_ACCENT = {
  primary: "bg-primary/10 border-primary/20",
  secondary: "bg-secondary/10 border-secondary/20",
  duo: "bg-linear-to-br from-primary/15 to-secondary/15 border-white/[0.14]",
};

const ICON_COLOR = {
  primary: "text-primary",
  secondary: "text-secondary",
  duo: "text-light/75",
};

const cardStyle = (accent) => ({
  backgroundImage: accent
    ? `${ACCENT_VEIL[accent]}, ${CARD_SURFACE}`
    : CARD_SURFACE,
});

const ServiceCard = ({ service, index, onAnchorClick }) => {
  const { name, subtitle, Icon, accent, featured, wide, duo } = service;

  const className = [
    "group flex items-center rounded-[18px] border shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)]",
    "transition-[transform,border-color] duration-200 hover:-translate-y-0.5",
    ACCENT_BORDER[accent] ?? NEUTRAL_BORDER,
    featured ? "col-span-2 gap-3.5 p-4 md:col-span-1" : "min-h-16 gap-3 p-3.5",
    wide === 2 ? "md:col-span-2" : "",
    // Escritorio: todas iguales, en columna — número e icono arriba, nombre abajo
    "md:min-h-[5.75rem] md:flex-col md:items-stretch md:justify-between md:gap-3 md:rounded-[15px] md:p-3.5",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span
        className={[
          "flex flex-shrink-0 items-center justify-center border",
          featured
            ? `h-11 w-11 rounded-[13px] ${ICON_BOX_ACCENT[accent] ?? ""}`
            : "border-transparent",
          "md:h-auto md:w-full md:justify-between md:rounded-none md:border-0 md:bg-transparent md:bg-none md:p-0",
          ICON_COLOR[accent] ?? "text-light/75",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="hidden text-[0.56rem] font-medium tracking-[0.14em] text-light/45 md:inline">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon size={featured ? 20 : 18} duo={duo} />
      </span>

      <span className="flex flex-grow flex-col gap-1 md:flex-grow-0 md:gap-0.5">
        <span
          className={
            featured
              ? "text-[0.95rem] font-semibold text-light md:text-[0.8rem] md:font-medium"
              : "text-[0.78rem] font-medium text-light md:text-[0.8rem]"
          }
        >
          {name}
        </span>
        <span
          className={
            featured
              ? "text-[0.7rem] text-light/55 md:text-[0.62rem] md:text-light/45"
              : "text-[0.62rem] text-light/45"
          }
        >
          {subtitle}
        </span>
      </span>

      {featured && (
        <ArrowIcon className="flex-shrink-0 text-light/30 transition-colors group-hover:text-light/60 md:hidden" />
      )}
    </>
  );

  if (service.to) {
    return (
      <Link
        to={service.to}
        className={`hero-reveal ${className}`}
        style={cardStyle(accent)}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={service.href}
      onClick={service.external ? undefined : onAnchorClick}
      {...(service.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={`hero-reveal ${className}`}
      style={cardStyle(accent)}
    >
      {content}
    </a>
  );
};

const Hero = () => {
  const sectionRef = React.useRef(null);
  const { data: storeConfig } = useStoreConfig();
  const { data: reservationsConfig } = useReservationsConfig();
  const isCustomerAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  // En la mesa, "Juegos" es la sección de Frostbyte Play de esta misma página;
  // fuera de ella, las salas libres con código de /game.
  const { isTableRoute } = useCartaPath();

  const inAppOrdering = !!storeConfig?.customer_ordering_enabled;
  const onlineReservations = !!reservationsConfig?.reservations_enabled;

  const services = [
    {
      key: "carta",
      name: "Carta",
      subtitle: "Bebidas y comida",
      href: "#carta",
      Icon: CupIcon,
      accent: "primary",
      featured: true,
    },
    // Con los domicilios apagados no se nombran en ninguna parte: ni acceso,
    // ni banner, ni pestaña. El servicio no existe hasta que se encienda.
    inAppOrdering && {
      key: "domicilios",
      name: "Domicilios",
      subtitle: "A tu casa",
      to: "/domicilios",
      Icon: BagIcon,
      accent: "secondary",
      featured: true,
    },
    {
      key: "reservar",
      name: "Reservar",
      // Las reservas en línea siguen siendo cosa del staff: mientras tanto se
      // reserva escribiendo o llamando (mesa, grupo y Sala VIP por igual).
      subtitle: onlineReservations
        ? "Mesa, grupo o Sala VIP"
        : "Escríbenos o llámanos",
      ...(onlineReservations
        ? { to: "/reservas" }
        : {
            href: reservationsWaLink(
              "Hola, quiero hacer una reserva en Frostbyte"
            ),
            external: true,
          }),
      Icon: CalendarIcon,
      accent: "duo",
      duo: true,
      featured: true,
    },
    {
      key: "sala-vip",
      name: "Sala VIP",
      subtitle: "Piso 3",
      href: "#sala-vip",
      Icon: DiamondIcon,
    },
    {
      key: "cancion",
      name: "Pedir canción",
      subtitle: "Tu piso",
      href: "#solicitar-cancion",
      Icon: EqualizerIcon,
    },
    {
      key: "juegos",
      name: "Juegos",
      subtitle: isTableRoute ? "En tu mesa" : "Salas con código",
      ...(isTableRoute ? { href: "#frostbyte-play" } : { to: "/game" }),
      Icon: DiceIcon,
    },
    {
      key: "cuenta",
      name: isCustomerAuthenticated ? "Mi cuenta" : "Crear cuenta",
      // El subtítulo no promete lo que esté en pausa
      subtitle:
        inAppOrdering && onlineReservations
          ? "Pedidos y reservas"
          : inAppOrdering
            ? "Tus pedidos"
            : "Tus datos",
      to: "/mi-cuenta",
      Icon: UserIcon,
    },
  ].filter(Boolean);

  // La rejilla de escritorio es de cuatro columnas y los accesos no siempre
  // son siete (domicilios puede faltar): los últimos se ensanchan para que la
  // fila cierre sin huecos — sobran tres, el último ocupa dos; sobran dos,
  // ambos ocupan dos.
  const remainder = services.length % 4;
  const wideCount = remainder === 3 ? 1 : remainder === 2 ? 2 : 0;
  services.forEach((service, index) => {
    if (wideCount && index >= services.length - wideCount) service.wide = 2;
  });

  const featuredCount = services.filter((service) => service.featured).length;

  // Los anclas son enlaces reales (los necesita el rastreador y el clic
  // derecho), pero el salto se hace suave como en el resto de la carta.
  const handleAnchorClick = (event) => {
    const href = event.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-dark pt-20 pb-10 md:pt-24 md:pb-14"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={BACKDROP} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRAIN} />

      <div className="container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:gap-12">
          {/* Marca */}
          <div className="hero-reveal flex flex-col gap-4 md:gap-5">
            <h1 className="m-0 flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between md:gap-14">
              <span className="font-display text-[clamp(1.75rem,8.5vw,2.35rem)] font-semibold leading-none tracking-[0.16em] text-light md:text-[clamp(3.25rem,7.5vw,6rem)] md:tracking-[0.015em]">
                FROSTBYTE
              </span>
              <span className="flex items-center gap-3 md:pb-3">
                <span
                  aria-hidden
                  className="hidden h-px w-8 bg-linear-to-r from-primary to-secondary md:block"
                />
                <span className="text-[0.53rem] font-medium tracking-[0.42em] text-light/45 md:text-[0.6rem]">
                  CUMBAL · NARIÑO
                </span>
              </span>
            </h1>

            <span
              aria-hidden
              className="h-px w-13 bg-linear-to-r from-primary to-secondary md:hidden"
            />

            <p className="max-w-[19rem] text-xs leading-relaxed text-light/55 md:ml-auto md:max-w-[21rem] md:text-[0.84rem]">
              Granizados, frappés, cócteles, micheladas y shots en Cumbal,
              Nariño.
            </p>

            {/* Síguenos: visible en las dos direcciones, no solo en
                escritorio como hasta el 2026-09-13. Instagram manda (es la
                cuenta que se quiere hacer crecer) y lleva el @ escrito y
                grande, que es lo que la gente teclea luego en la aplicación
                si no toca el enlace; TikTok queda al lado, más tenue.

                Destaca por contraste y tamaño, no por color: el magenta y el
                cyan del hero siguen significando carta y domicilios, y darle
                uno a Instagram lo haría pasar por un servicio del local. */}
            <div className="flex flex-wrap items-center gap-2 md:ml-auto md:w-[21rem]">
              <SocialLink
                network="instagram"
                source={SOCIAL_SOURCE.HERO}
                className="inline-flex flex-1 items-center gap-2.5 rounded-[14px] border border-white/20 bg-white/[0.07] px-3.5 py-2.5 transition-colors hover:border-white/40 hover:bg-white/[0.1] md:flex-none"
              >
                <InstagramIcon size={17} className="shrink-0 text-light/80" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[0.5rem] font-medium tracking-[0.22em] text-light/45">
                    SÍGUENOS
                  </span>
                  <span className="truncate text-[0.82rem] font-semibold text-light">
                    {SOCIAL_HANDLE}
                  </span>
                </span>
              </SocialLink>
              <SocialLink
                network="tiktok"
                source={SOCIAL_SOURCE.HERO}
                className="inline-flex items-center gap-1.5 rounded-[14px] border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[0.7rem] font-medium text-light/55 transition-colors hover:border-white/25 hover:text-light/80"
              >
                <TikTokIcon size={14} />
                {SOCIAL.tiktok.label}
              </SocialLink>
            </div>
          </div>

          {/* Servicios. Móvil: tres tarjetas grandes y cuatro fichas bajo
              "TAMBIÉN". Escritorio: los siete en rejilla de cuatro columnas. */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
            {services.map((service, index) => (
              <React.Fragment key={service.key}>
                {index === featuredCount && (
                  <span className="col-span-2 mt-1 text-[0.55rem] font-medium tracking-[0.4em] text-light/45 md:hidden">
                    TAMBIÉN
                  </span>
                )}
                <ServiceCard
                  service={service}
                  index={index}
                  onAnchorClick={handleAnchorClick}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
