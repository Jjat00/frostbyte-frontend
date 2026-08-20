import React from "react";
import { Droplets } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

/**
 * Agua embotellada. Una sola tarjeta: el precio es toda la información.
 * Llevaba un orbe de 500 px con blur de 200 px para vender una botella de
 * agua; ahora el fondo es el mismo de toda la carta.
 */
const WaterSection = () => {
  return (
    <section
      id="agua"
      className="fb-section py-14"
      style={{ "--fb-accent": "#38bdf8", "--fb-accent-2": "#38bdf8" }}
    >
      <div className="container relative z-10 mx-auto px-5">
        <SectionHeading
          eyebrow="Para hidratarte"
          title="Agua"
          className="mb-9"
        />

        <div className="flex justify-center">
          <div className="fb-card fb-card--accent fb-card--link fb-card--lift fb-reveal flex flex-col items-center px-10 py-8 text-center sm:px-14">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-sky-400/25 bg-sky-400/10">
              <Droplets className="text-sky-400" size={22} />
            </span>

            <h3 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
              Botella de agua
            </h3>

            <p className="mt-3 max-w-xs text-[0.78rem] leading-relaxed text-light/55">
              La forma más simple de refrescarte.
            </p>

            <span className="mt-5 text-xl font-medium text-light">$2.000</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaterSection;
