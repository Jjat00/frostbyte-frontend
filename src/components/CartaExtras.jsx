import React from "react";
import { Plus } from "lucide-react";

/**
 * Bloque de extras al pie de una sección de la carta: "¿quieres envenenarlo?"
 * en granizados y micheladas, y los shots de sabores.
 *
 * Los tres eran el mismo bloque copiado con distinto color — degradado de
 * fondo, dos orbes de blur, el titular partido en dos con media palabra en
 * degradado y una fórmula con emojis. Aquí es uno solo, y lo único que cambia
 * entre secciones es el texto y el color del chip de cada opción.
 *
 * Los degradados de las opciones son color de contenido (el licor, el sabor),
 * la excepción declarada en `theme.css`.
 */

export const ExtraOption = ({ name, detalle, price, icon: Icon, gradient }) => (
  <div className="fb-card fb-card--link fb-card--lift w-[calc(50%-6px)] p-4 text-center sm:w-[150px]">
    <span
      className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-[11px] bg-linear-to-br ${gradient} opacity-90`}
    >
      <Icon className="text-dark" size={17} />
    </span>
    <h4 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-light">
      {name}
    </h4>
    {detalle && <p className="mt-1 text-[0.65rem] text-light/45">{detalle}</p>}
    <span className="mt-2 block text-[0.8rem] font-medium text-light">
      {price}
    </span>
  </div>
);

/**
 * @param {string} eyebrow    Etiqueta pequeña sobre el titular
 * @param {string} title      Titular del bloque
 * @param {string} description
 * @param {Array}  options    {name, detalle, price, icon, gradient}
 * @param {Array}  formula    [base, extra, resultado]
 */
const ExtrasBlock = ({ eyebrow, title, description, options, formula }) => (
  <div className="fb-card fb-reveal mt-14 p-6 sm:p-9">
    <div className="text-center">
      <span className="fb-eyebrow block">{eyebrow}</span>
      <h3 className="font-display m-0 mt-2.5 text-[1.1rem] font-semibold uppercase leading-none tracking-[0.14em] text-light sm:text-[1.35rem]">
        {title}
      </h3>
      <span aria-hidden className="fb-rule mx-auto mt-3.5" />
      <p className="mx-auto mt-3.5 max-w-lg text-[0.78rem] leading-relaxed text-light/55">
        {description}
      </p>
    </div>

    <div className="mx-auto mt-7 flex max-w-full flex-wrap items-stretch justify-center gap-3">
      {options.map((option) => (
        <ExtraOption key={option.name} {...option} />
      ))}
    </div>

    {formula && (
      <div className="mt-7 flex justify-center">
        <div className="fb-pill flex-wrap justify-center gap-2 px-4 py-2.5 text-[0.72rem]">
          <span className="text-light/70">{formula[0]}</span>
          <Plus className="shrink-0 text-light/35" size={13} />
          <span className="text-light/70">{formula[1]}</span>
          <span className="shrink-0 text-light/35">=</span>
          <span className="text-light">{formula[2]}</span>
        </div>
      </div>
    )}
  </div>
);

export default ExtrasBlock;
