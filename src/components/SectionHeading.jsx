import React from "react";

/**
 * Encabezado de sección de la carta pública.
 *
 * Cada sección traía su propio titular: `font-black` a 6xl con el texto en
 * degradado, cada una con su color. Leídos en fila eran nueve gritos
 * distintos. Aquí el titular es siempre el mismo — Orbitron 600, blanco,
 * tracking amplio, como el FROSTBYTE del hero — y el color de la sección
 * aparece solo en la etiqueta y en el hilo de 44 px.
 *
 * El color sale de la variable `--fb-accent` que declara la sección
 * contenedora (ver `minimal.css`), así que este componente no recibe
 * colores: los hereda.
 */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}) => {
  const centered = align === "center";

  return (
    <div
      className={`fb-section-heading fb-reveal ${centered ? "text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <span className="fb-eyebrow fb-eyebrow--accent block">{eyebrow}</span>
      )}

      <h2 className="font-display m-0 mt-3 text-[clamp(1.35rem,6vw,1.75rem)] font-semibold uppercase leading-none tracking-[0.16em] text-light md:text-[2.1rem] md:tracking-[0.09em]">
        {title}
      </h2>

      <span
        aria-hidden
        className={`fb-rule mt-4 block ${centered ? "mx-auto" : ""}`}
      />

      {description && (
        <p
          className={`mt-4 max-w-lg text-xs leading-relaxed text-light/50 md:text-[0.84rem] ${
            centered ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
