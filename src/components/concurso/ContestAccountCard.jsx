import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useCurrentContest, useMyContestEntry } from "@/hooks/useContest";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";

const IMG = "/images/concurso";
const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const dayMonth = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long",
  });
};

/**
 * El concurso vigente dentro de "Mi cuenta".
 *
 * - Inscrito: su número y en qué va (pago en barra, Instagram).
 * - Sin inscribirse y con inscripciones abiertas: la invitación, con el
 *   mismo lenguaje del póster de la carta.
 * - Sin concurso publicado, o cerrado y sin inscripción: no existe.
 */
const ContestAccountCard = ({ className = "" }) => {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const { data: contest } = useCurrentContest();
  const { data: entry, isLoading } = useMyContestEntry(
    isAuthenticated && !!contest
  );

  if (!contest || isLoading) return null;
  if (!entry && !contest.registrations_open) return null;

  return (
    <section
      className={`theme-concurso cz-ground cz-account ${className}`}
      aria-label={contest.title}
    >
      <img
        src={`${IMG}/monstruos-arriba.webp`}
        alt=""
        className="cz-account__art"
        loading="lazy"
        decoding="async"
      />
      <div className="cz-account__body">
        {entry ? <Enrolled entry={entry} contest={contest} /> : <Invite contest={contest} />}
      </div>
    </section>
  );
};

const Invite = ({ contest }) => {
  const date = dayMonth(contest.event_date);
  return (
    <>
      <p className="cz-label">Solo mayores de {contest.min_age}</p>
      <img
        src={`${IMG}/titulo.webp`}
        alt={contest.title}
        className="cz-account__title"
        loading="lazy"
        decoding="async"
      />
      <p className="cz-account__lead">
        Ven disfrazado{date ? ` el ${date}` : ""} y compite por el mejor
        disfraz de Frostbyte.
        {contest.prize && <> Premio: <strong className="cz-ok">{contest.prize}</strong>.</>}
      </p>
      <p className="cz-muted mt-1 text-[0.8rem]">
        Inscripción {money(contest.entry_fee)}, se paga en la barra.
      </p>
      <Link to="/concurso" className="cz-cta cz-cta--block mt-4">
        Quiero participar <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
      </Link>
    </>
  );
};

const Enrolled = ({ entry, contest }) => {
  const confirmed = entry.status === "confirmed";
  const checks = [
    { done: true, text: "Inscrito con tu cuenta" },
    { done: entry.paid, text: entry.paid ? "Pago recibido" : `Pagar ${money(contest.entry_fee)} en la barra` },
    contest.requires_instagram_follow && {
      done: entry.follows_instagram,
      text: entry.follows_instagram ? "Nos sigues en Instagram" : "Seguirnos en Instagram",
    },
  ].filter(Boolean);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="cz-label">{contest.title}</p>
          <p className={`cz-hand mt-1 text-2xl uppercase leading-tight ${confirmed ? "cz-ok" : ""}`}>
            {confirmed ? "¡Estás dentro!" : "Ya estás inscrito"}
          </p>
        </div>
        <span className="cz-number" aria-label={`Inscripción número ${entry.number}`}>
          #{entry.number}
        </span>
      </div>
      <ul className="mt-3 grid gap-1.5">
        {checks.map(({ done, text }) => (
          <li key={text} className="flex items-center gap-2 text-[0.85rem]">
            {done ? (
              <CheckCircle2 className="cz-ok h-4 w-4 flex-shrink-0" />
            ) : (
              <Circle className="cz-muted h-4 w-4 flex-shrink-0" />
            )}
            <span className={done ? "" : "cz-muted"}>{text}</span>
          </li>
        ))}
      </ul>
      <Link to="/concurso" className="cz-cta cz-cta--block cz-cta--toxic mt-4">
        {confirmed ? "Ver mi inscripción" : "Qué me falta"}
        <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
      </Link>
    </>
  );
};

export default ContestAccountCard;
