import React from "react";
import { cn } from "@/lib/utils";

/**
 * Sistema 26 — lenguaje visual de temporada del Mundial 2026 para Frostbyte.
 *
 * Usa los activos oficiales (emblema "26" + trofeo, sorteo de grupos, sedes)
 * servidos desde /public/mundial, más el sistema gráfico: bloques de color
 * vibrantes estilo póster, patrón modular (cuadrados + cuartos de círculo) y
 * el numerazo "26".
 *
 * Requiere la clase `theme-26` en un ancestro (fuentes Archivo/Noto + patrón).
 * Los contenedores de las capas decorativas deben ser `relative overflow-hidden`.
 */

const ASSETS = {
  emblema: "/mundial/emblema.webp", // emblema oficial sobre blanco
  trofeo: "/mundial/trofeo.webp", // trofeo sobre negro (para mix-blend screen)
};

/** Numerazo "26" geométrico (marca de agua / acento). */
export const Big26 = ({ className = "", ...props }) => (
  <span
    aria-hidden
    className={cn("t26-num pointer-events-none select-none", className)}
    {...props}
  >
    26
  </span>
);

/**
 * Emblema oficial "26" + trofeo sobre una tarjeta blanca (look sticker oficial).
 * El tamaño se controla con la altura del contenedor (p. ej. `h-24`).
 */
export const EmblemaMundial = ({
  className = "",
  imgClassName = "",
  alt = "FIFA Mundial 2026",
  loading = "lazy",
}) => (
  <div
    className={cn(
      "inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-xl shadow-black/40 ring-1 ring-black/5",
      className,
    )}
  >
    <img
      src={ASSETS.emblema}
      alt={alt}
      loading={loading}
      fetchPriority={loading === "eager" ? "high" : "auto"}
      decoding="async"
      className={cn("h-full w-auto select-none object-contain", imgClassName)}
    />
  </div>
);

/**
 * Trofeo de la Copa Mundial. La imagen viene sobre negro puro y se funde con
 * `mix-blend-mode: screen`, así el fondo negro desaparece sobre la base oscura
 * y queda el trofeo dorado "flotando". Colócalo sobre zonas oscuras.
 */
export const TrofeoMundial = ({
  className = "",
  alt = "Trofeo de la Copa Mundial",
}) => (
  <img
    src={ASSETS.trofeo}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={cn("select-none object-contain", className)}
    style={{ mixBlendMode: "screen" }}
  />
);

/**
 * Campo de color estilo póster del Mundial (bloques vibrantes morado/rojo/
 * granate/verde/lima + patrón modular + scrim de legibilidad). Capa a sangre
 * para usar dentro de un contenedor `relative overflow-hidden`.
 *
 * @param {"left"|"full"|"none"} scrim  Oscurecido para legibilidad del texto.
 */
export const MundialColorField = ({
  className = "",
  scrim = "soft",
  watermark = true,
}) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-0 overflow-hidden bg-[#2b0f33]",
      className,
    )}
  >
    {/* Grandes regiones de color tipo afiche FIFA 2026 (morado, rojo, granate,
        verde, lima) — brillantes y orgánicas, cubriendo toda la superficie. */}
    <div className="absolute -left-[12%] -top-[22%] h-[75vh] w-[52vw] rotate-3 rounded-[42%] bg-purple-600" />
    <div className="absolute left-[20%] -top-[20%] h-[125vh] w-[52vw] -rotate-6 rounded-[44%] bg-red-600" />
    <div className="absolute -left-[14%] top-[28%] h-[88vh] w-[58vw] rounded-[46%] bg-[#7d1622]" />
    <div className="absolute -right-[14%] -top-[16%] h-[68vh] w-[44vw] rounded-[46%] bg-green-600" />
    <div className="absolute -right-[16%] bottom-[-22%] h-[95vh] w-[46vw] rounded-[44%] bg-lime-400" />

    {/* Patrón modular sobre los bloques */}
    <div className="t26-pattern absolute inset-0 opacity-50" />

    {/* Numerazo "26" gigante de fondo (firma del Mundial) */}
    {watermark && (
      <Big26 className="absolute right-[1%] top-1/2 -translate-y-1/2 text-[clamp(20rem,62vh,55rem)] leading-none text-white/12" />
    )}

    {/* Scrim para legibilidad del contenido (manteniendo la vibra del afiche) */}
    {scrim === "left" && (
      <div className="absolute inset-0 bg-linear-to-r from-dark/90 via-dark/55 to-transparent" />
    )}
    {scrim === "center" && (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse,#0a0b14cc_0%,#0a0b1473_45%,transparent_78%)]" />
    )}
    {scrim === "soft" && <div className="absolute inset-0 bg-dark/30" />}
    {scrim === "full" && <div className="absolute inset-0 bg-dark/55" />}

    {/* Fundido inferior hacia la base oscura de la página */}
    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-dark to-transparent" />
  </div>
);

/**
 * Backdrop sutil (bloques tenues + patrón + "26" de fondo) para secciones
 * donde no quiero el póster a todo color. Conserva el look de temporada sin
 * competir con el contenido.
 */
export const Mundial26Backdrop = ({ className = "", watermark = true }) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-0 overflow-hidden",
      className,
    )}
  >
    <div className="absolute -left-24 -top-24 h-72 w-72 rotate-12 rounded-[3rem] bg-purple-600/25" />
    <div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-tr-full bg-grass/25" />
    <div className="absolute -right-10 -top-16 h-64 w-64 rounded-bl-full bg-red-600/25" />
    <div className="absolute -bottom-24 -right-20 h-72 w-72 -rotate-12 rounded-[3rem] bg-blue-600/25" />
    <div className="absolute right-[18%] top-10 h-14 w-14 rotate-6 rounded-2xl bg-gold/40" />
    <div className="absolute bottom-[22%] left-[14%] h-10 w-10 -rotate-12 rounded-xl bg-lime-400/40" />
    <div className="t26-pattern absolute inset-0" />
    {watermark && (
      <Big26 className="absolute -bottom-[14vh] -left-[1vw] text-[clamp(16rem,42vh,40rem)] leading-none text-white/[0.035]" />
    )}
  </div>
);

export default Mundial26Backdrop;
