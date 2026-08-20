import React from "react";
import { Flame } from "lucide-react";

/**
 * Hero promocional de Salchipapas (Frostbyte Food).
 *
 * Anuncia que ahora en Frostbyte se ofrecen salchipapas. Conserva el naranja
 * porque es la identidad de OTRA marca (el negocio del tercer piso), no un
 * adorno: es la única excepción a la regla de dejar la carta en magenta, cyan
 * y neutro. Aun así va rebajado al lenguaje del hero — velo tenue en vez de
 * resplandor, titular en Orbitron 600 en vez de font-black.
 *
 * Mobile-first: la imagen va arriba en celular y al costado en pantallas
 * grandes.
 */
const SalchipapasPromoBanner = () => {
  return (
    <section
      id="salchipapas"
      className="mb-8 sm:mb-10"
      style={{
        "--fb-accent": "var(--color-food)",
        "--fb-accent-2": "var(--color-food)",
      }}
    >
      <div className="fb-reveal fb-card fb-card--accent overflow-hidden">
        <div className="relative flex flex-col items-center gap-5 p-5 sm:flex-row sm:gap-7 sm:p-7">
          {/* Imagen del producto */}
          <img
            src="/salchipapas-frostbyte-food.png"
            alt="Salchipapas Frostbyte Food"
            loading="lazy"
            className="w-48 max-w-[68%] flex-shrink-0 drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] sm:w-60"
          />

          {/* Texto */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span className="fb-eyebrow fb-eyebrow--accent block">
              Nuevo · Frostbyte Food
            </span>

            <h3 className="font-display m-0 mt-2.5 text-xl font-semibold uppercase leading-none tracking-[0.14em] text-light sm:text-2xl">
              Salchipapas
            </h3>

            <span
              aria-hidden
              className="fb-rule mt-3.5 mx-auto block sm:mx-0"
            />

            <p className="mx-auto mt-3.5 max-w-md text-[0.78rem] leading-relaxed text-light/60 sm:mx-0">
              Todas llevan las tres salchichas —{" "}
              <span className="text-light/85">sevillana</span>,{" "}
              <span className="text-light/85">chorizo</span> y{" "}
              <span className="text-light/85">ranchera</span> — y las puedes
              cargar con <span className="text-light/85">carne</span> y{" "}
              <span className="text-light/85">queso fundido</span>.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {/* Tamaños sin precio: los precios viven en la carta */}
              <span className="fb-pill">Personal · Para 2</span>
              <span className="fb-pill">
                <Flame size={13} className="text-food" />
                Encuéntralas en la carta
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalchipapasPromoBanner;
