import React from "react";
import PrizeNotice from "./PrizeNotice";

/**
 * Póster del concurso vigente, al estilo de fanzine de terror: monstruos en
 * fotocopia verde arriba, fecha a mano con el sello +18, el lettering rojo
 * con calabazas a los lados y dos monstruos más cerrando abajo.
 *
 * Lo comparten el anuncio de la carta (con el botón a /concurso) y la página
 * del concurso (con el botón que baja al formulario): `cta` es ese botón.
 * Los personajes (Jason, Ghostface, el payaso y la cabra) salen de
 * la selección de Jaime; las composiciones con alfa se arman fundiendo sus
 * fondos negros. Título, calabazas, sello y murciélagos los generó Codex.
 */

const IMG = "/images/concurso";

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const dayMonth = (iso) => {
  if (!iso) return null;
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
};

const hour = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
};

const weekday = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString("es-CO", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
};

const ConcursoPoster = ({ contest, cta, headingLevel = "h2" }) => {
  const Heading = headingLevel;
  const date = dayMonth(contest.event_date);

  const lineup = [
    `Inscripción ${money(contest.entry_fee)}`,
    "Pagas en la barra",
    contest.requires_instagram_follow && "Síguenos en IG",
  ].filter(Boolean);

  return (
    <div className="cz-poster">
      {/* Escritorio: el payaso y la cabra salen de monstruos-abajo como
          sujetalibros a los lados de la fila (en móvil cierran el póster) */}
      <Side position="left" />

      <div className="cz-poster__art">
        {/* En escritorio la fecha corona a los monstruos; en móvil va con el
            título. Son dos copias: la de escritorio no la lee el lector de
            pantalla para no decir la fecha dos veces. */}
        <Dates contest={contest} className="cz-poster__dates--desktop" hidden />
        <img
          src={`${IMG}/monstruos-arriba.webp`}
          alt=""
          className="cz-poster__top"
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <img
          src={`${IMG}/murcielagos.webp`}
          alt=""
          className="cz-bats cz-bats--desktop"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="cz-poster__body">
        <Dates contest={contest} className="cz-poster__dates--mobile" />

        <Heading className="cz-poster__title">
          <img
            src={`${IMG}/titulo.webp`}
            alt={contest.title}
            width="900"
            height="600"
            loading="lazy"
            decoding="async"
          />
        </Heading>

        <div className="cz-poster__info">
          <img
            src={`${IMG}/calabaza-verde.webp`}
            alt=""
            className="cz-pumpkin cz-pumpkin--left"
            loading="lazy"
            decoding="async"
          />
          <img
            src={`${IMG}/calabaza-roja.webp`}
            alt=""
            className="cz-pumpkin cz-pumpkin--right"
            loading="lazy"
            decoding="async"
          />
          <p className="cz-poster__lineup">
            {lineup.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {!date && <span>Solo +{contest.min_age}</span>}
          </p>
        </div>

        <div className="cz-poster__notice">
          <PrizeNotice contest={contest} />
        </div>

        {cta && <div className="cz-poster__cta">{cta}</div>}
      </div>

      <Side position="right" />

      <div className="cz-poster__bottom" aria-hidden="true">
        <img
          src={`${IMG}/monstruos-abajo.webp`}
          alt=""
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
        <img
          src={`${IMG}/murcielagos.webp`}
          alt=""
          className="cz-bats cz-bats--mobile"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

/** Fecha a mano con el sello +18 en el centro. */
const Dates = ({ contest, className, hidden = false }) => {
  const date = dayMonth(contest.event_date);
  if (!date) return null;
  // Sin hora definida, el día de la semana ocupa su sitio
  const second = hour(contest.event_time) || weekday(contest.event_date);
  return (
    <div className={`cz-poster__dates ${className}`} aria-hidden={hidden || undefined}>
      {second && <span>{second}</span>}
      <img
        src={`${IMG}/sello-18.webp`}
        alt={hidden ? "" : `Solo mayores de ${contest.min_age}`}
        className="cz-seal"
        width="240"
        height="237"
        loading="lazy"
        decoding="async"
      />
      <span>{date}</span>
    </div>
  );
};

/** Media imagen de monstruos-abajo (el payaso o la cabra); solo se ve en escritorio. */
const Side = ({ position }) => (
  <div className={`cz-side cz-side--${position}`} aria-hidden="true">
    <img
      src={`${IMG}/monstruos-abajo.webp`}
      alt=""
      width="450"
      height="600"
      loading="lazy"
      decoding="async"
    />
  </div>
);

export default ConcursoPoster;
