import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";

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

const Hero = () => {
  const sectionRef = React.useRef(null);
  const { services, featuredCount, handleAnchorClick } = useHeroServices();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Las tarjetas traen una transición CSS de transform para el hover:
        // si sigue activa, cada fotograma de GSAP la reinicia y las tarjetas
        // se quedan rezagadas a alturas distintas. Se apaga durante la
        // entrada y se devuelve al terminar.
        gsap.set(".hero-reveal", { transition: "none" });
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
          clearProps: "opacity,transform,transition",
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

            <HeroSocial
              className="md:ml-auto md:w-[21rem]"
              onAnchorClick={handleAnchorClick}
            />
          </div>

          <HeroServiceGrid
            services={services}
            featuredCount={featuredCount}
            onAnchorClick={handleAnchorClick}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
