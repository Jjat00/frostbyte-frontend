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
 * Campo de color estilo póster del Mundial con la trilogía de sedes (rojo
 * Canadá, verde México, azul EE.UU.) + acento dorado, en COLOR PLANO sobre base
 * casi negra, más patrón modular "26" y scrim de legibilidad. Capa a sangre
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
      "pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0b14]",
      className,
    )}
  >
    {/* Módulos del sistema 26 — cuadrados (borde de cancha) + cuartos de círculo
        (balón) en COLOR PLANO, con la trilogía de sedes (rojo Canadá, verde
        México, azul EE.UU.) + acento oro, sobre base casi negra. Es el mismo
        motivo con que se construye el emblema "26". */}
    {/* cuadrado rojo — esquina superior izquierda */}
    <div className="absolute -left-[7%] -top-[15%] h-[52vh] w-[30vw] rounded-[3rem] bg-red-600" />
    {/* semicírculo azul colgando arriba-centro (balón) */}
    <div className="absolute left-[31%] -top-[20%] h-[56vh] w-[56vh] rounded-b-full bg-blue-600" />
    {/* cuadrado verde a sangre por la derecha */}
    <div className="absolute -right-[8%] -top-[8%] h-[58vh] w-[30vw] rounded-[3rem] bg-green-600" />
    {/* cuarto de círculo azul — abajo-izquierda, arco hacia el centro */}
    <div className="absolute -left-[9%] bottom-[-16%] h-[58vh] w-[58vh] rounded-tr-full bg-blue-700" />
    {/* cuarto de círculo oro (acento) — abajo-derecha */}
    <div className="absolute right-[7%] bottom-[-14%] h-[40vh] w-[40vh] rounded-tl-full bg-gold" />
    {/* módulo cuadrado pequeño (ritmo) */}
    <div className="absolute right-[33%] bottom-[8%] h-[11vh] w-[11vh] rounded-2xl bg-red-600" />

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
    {/* Módulos sutiles del sistema 26: cuartos de círculo en las 4 esquinas
        (arco hacia el centro) + cuadraditos de ritmo, color plano tenue. */}
    <div className="absolute -left-24 -top-24 h-64 w-64 rounded-br-full bg-red-600/20" />
    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-bl-full bg-blue-600/20" />
    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-tr-full bg-green-600/20" />
    <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-tl-full bg-blue-700/20" />
    <div className="absolute right-[16%] top-[14%] h-12 w-12 rounded-xl bg-gold/40" />
    <div className="absolute left-[12%] bottom-[24%] h-10 w-10 rounded-lg bg-red-500/35" />
    <div className="t26-pattern absolute inset-0" />
    {watermark && (
      <Big26 className="absolute -bottom-[14vh] -left-[1vw] text-[clamp(16rem,42vh,40rem)] leading-none text-white/[0.035]" />
    )}
  </div>
);

export default Mundial26Backdrop;
