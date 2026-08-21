import React from "react";
import { Cake, CreditCard, Users } from "lucide-react";

const REQUISITOS = [
  {
    Icon: CreditCard,
    text: (
      <>
        Muestra tu <span className="text-light">documento de identidad</span> al
        mesero para verificar tu fecha de nacimiento.
      </>
    ),
  },
  {
    Icon: Users,
    text: (
      <>
        Válido si vienes con mínimo{" "}
        <span className="text-light">2 amigos</span>.
      </>
    ),
  },
];

/**
 * Descuento de cumpleaños.
 *
 * Igual que el de redes: es un gancho, va en neutro y el número manda por
 * tamaño. Las condiciones son parte de la oferta, no letra pequeña, así que
 * se leen antes del cierre.
 */
const BirthdayDiscountBanner = () => {
  return (
    <section id="descuento-cumple" className="fb-section fb-section--plain py-9">
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal fb-card mx-auto max-w-xl p-5 sm:p-6">
          {/* Encabezado */}
          <div className="mb-5 flex items-center gap-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] border border-white/[0.1] bg-white/[0.04]">
              <Cake size={19} className="text-light/70" />
            </span>
            <div className="min-w-0">
              <span className="fb-eyebrow block">Para cumpleañeros</span>
              <h3 className="font-display m-0 mt-1.5 text-2xl font-semibold leading-none tracking-[0.06em] text-light">
                50%{" "}
                <span className="text-base tracking-[0.14em] text-light/55">
                  OFF
                </span>
              </h3>
            </div>
          </div>

          {/* Qué es */}
          <div className="fb-inset mb-4 p-3.5">
            <p className="text-[0.78rem] leading-relaxed text-light/65">
              Si hoy es tu cumpleaños, tienes{" "}
              <span className="text-light">50% de descuento</span> en el
              producto que elijas. Aplica para{" "}
              <span className="text-light">un solo producto</span>.
            </p>
          </div>

          {/* Requisitos */}
          <div className="mb-5 space-y-2">
            {REQUISITOS.map(({ Icon, text }, i) => (
              <div key={i} className="fb-inset flex items-center gap-3 p-3.5">
                <Icon size={17} className="flex-shrink-0 text-light/55" />
                <p className="text-[0.78rem] leading-relaxed text-light/65">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-[0.75rem] text-light/60">
            Válido únicamente el día de tu cumpleaños. Pregúntale al mesero
            para reclamarlo.
          </p>

          <p className="mt-3 text-center text-[0.62rem] text-light/30">
            No acumulable con otras promociones. No incluye la jarra de mojito,
            botellas de vino ni salchipapas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BirthdayDiscountBanner;
