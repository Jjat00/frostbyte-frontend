import React from "react";
import { Check, ChevronRight, Pencil, Radio } from "lucide-react";
import Flag from "@/components/polla/Flag";
import { useCountdown, formatCountdownLong } from "@/hooks/useCountdown";
import { matchDayKey, matchDayLabel, matchTime } from "@/data/mundial2026";

/**
 * Modo Colombia: franja destacada con el proximo partido (o el partido en
 * vivo) de la seleccion. Tocarla lleva a la tarjeta del partido en la lista.
 * No pide datos propios: trabaja sobre los partidos que ya cargo PartidosTab.
 */
const TEAM_CODE = "COL";

// Bandera de Colombia (50% amarillo, 25% azul, 25% rojo).
const STOPS = "#FCD116 0%, #FCD116 50%, #003893 50%, #003893 75%, #CE1126 75%, #CE1126 100%";
export const COLOMBIA_TRICOLOR_H = `linear-gradient(90deg, ${STOPS})`;
export const COLOMBIA_TRICOLOR_V = `linear-gradient(180deg, ${STOPS})`;

export const isColombiaMatch = (m) =>
  m?.home?.code === TEAM_CODE || m?.away?.code === TEAM_CODE;

/* "hoy" / "mañana" / "el Vie 19 jun" en hora de Colombia */
const dayPhrase = (kickoff) => {
  const key = matchDayKey(kickoff);
  const now = Date.now();
  if (key === matchDayKey(new Date(now))) return "hoy";
  if (key === matchDayKey(new Date(now + 86_400_000))) return "mañana";
  return `el ${matchDayLabel(kickoff)}`;
};

const CountdownText = ({ kickoff }) => {
  const cd = useCountdown(kickoff, { maxResolutionMs: 60_000 });
  return (
    <b className="font-black tabular-nums text-light">{formatCountdownLong(cd)}</b>
  );
};

const ColombiaBanner = ({ matches, onGoToMatch }) => {
  const live = matches.find((m) => isColombiaMatch(m) && m.status === "live");
  const next = matches
    .filter((m) => isColombiaMatch(m) && m.status === "upcoming")
    .sort((a, b) => a.kickoff - b.kickoff)[0];
  const match = live || next;
  if (!match) return null;

  const rival = match.home.code === TEAM_CODE ? match.away : match.home;
  const isLive = Boolean(live);
  const hasPred =
    match.my_prediction?.home_score != null &&
    match.my_prediction?.away_score != null;

  return (
    <button
      onClick={() => onGoToMatch(match)}
      className="group relative mb-5 block w-full overflow-hidden rounded-2xl border border-[#FCD116]/30 bg-[#FCD116]/[0.05] text-left transition-colors hover:bg-[#FCD116]/[0.09]"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: COLOMBIA_TRICOLOR_H }}
      />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Flag iso2="co" name="Colombia" size={40} rounded="rounded-md" />
        <div className="min-w-0 flex-1">
          {isLive ? (
            <>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
                <Radio size={11} className="animate-pulse" />
                En vivo {match.minute != null && <>&middot; {match.minute}&apos;</>}
              </p>
              <p className="truncate font-black text-light">
                ¡Colombia está jugando!
              </p>
              <p className="truncate text-xs text-gray">
                {match.home.name}{" "}
                <b className="tabular-nums text-light">
                  {match.home_score ?? 0} - {match.away_score ?? 0}
                </b>{" "}
                {match.away.name}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FCD116]">
                Juega Colombia {dayPhrase(match.kickoff)}
              </p>
              <p className="truncate font-black text-light">
                vs {rival.name} &middot; {matchTime(match.kickoff)}
              </p>
              <p className="text-xs text-gray">
                Arranca en <CountdownText kickoff={match.kickoff} />
                {hasPred ? (
                  <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-secondary">
                    <Check size={11} /> pronóstico listo
                  </span>
                ) : (
                  <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-amber-400">
                    <Pencil size={11} /> te falta tu pronóstico
                  </span>
                )}
              </p>
            </>
          )}
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 text-gray transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
};

export default ColombiaBanner;
