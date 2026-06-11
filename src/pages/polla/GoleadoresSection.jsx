import React from "react";
import { Link } from "react-router-dom";
import { Target, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaAwards, usePollaTopScorers } from "@/hooks/usePolla";

/**
 * Tabla de goleadores del Mundial (vista "Goleadores" de la pestaña Grupos,
 * junto a Equipos y Tabla: todo lo del torneo vive en ese tab).
 * Resalta al jugador que el usuario eligió en la mención "Goleador" para que
 * pueda seguir su apuesta partido a partido.
 */
const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const ScorerPhoto = ({ name, src, highlight }) => {
  if (src) {
    return (
      <img
        loading="lazy"
        decoding="async"
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={cn(
          "h-10 w-10 rounded-full object-cover",
          highlight ? "ring-2 ring-primary" : "ring-1 ring-white/15"
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary/40 to-secondary/40 text-sm font-black text-light",
        highlight && "ring-2 ring-primary"
      )}
    >
      {initials(name)}
    </span>
  );
};

/* Banner con el estado del pick de la mención "Goleador" del usuario */
const MyPickBanner = ({ myPick, myRow, hasScorers }) => {
  if (!myPick) {
    return (
      <Link
        to="/partidos"
        className="group mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-primary/30"
      >
        <Sparkles className="shrink-0 text-primary" size={18} />
        <p className="flex-1 text-sm text-gray">
          Aún no eliges tu <b className="text-light">Goleador del Mundial</b>.
          Hazlo en las menciones y síguelo aquí.
        </p>
        <ChevronRight size={16} className="shrink-0 text-gray transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-secondary/25 bg-secondary/[0.05] px-4 py-3">
      <Flag iso2={myPick.iso2} name={myPick.team_code} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-secondary">
          Tu goleador
        </p>
        <p className="truncate text-sm font-black text-light">{myPick.name}</p>
      </div>
      <p className="shrink-0 text-right text-xs text-gray">
        {myRow ? (
          <>
            <span className="block text-lg font-black tabular-nums text-secondary">
              N.º {myRow.rank}
            </span>
            {myRow.goals} {myRow.goals === 1 ? "gol" : "goles"}
          </>
        ) : hasScorers ? (
          <>Aún fuera del top 20</>
        ) : (
          <>Sin goles todavía</>
        )}
      </p>
    </div>
  );
};

const GoleadoresSection = () => {
  const { data, isLoading, isError } = usePollaTopScorers();
  const { data: awardsData } = usePollaAwards();

  const scorers = data?.scorers || [];
  const myPick =
    awardsData?.awards?.find((a) => a.code === "scorer")?.my_pick || null;
  const myRow = myPick
    ? scorers.find((s) => s.player_id && s.player_id === myPick.player_id)
    : null;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        <div className="liquid-glass relative overflow-hidden rounded-2xl border border-white/[0.06]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0">
              <span className="h-4 w-5 rounded bg-white/[0.06]" />
              <span className="h-10 w-10 rounded-full bg-white/[0.05]" />
              <span className="h-3 flex-1 rounded bg-white/[0.05]" />
              <span className="h-5 w-8 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-10 text-center text-sm text-red-400">
        No pudimos cargar los goleadores. Intenta de nuevo en un momento.
      </p>
    );
  }

  if (scorers.length === 0) {
    return (
      <>
        <MyPickBanner myPick={myPick} myRow={null} hasScorers={false} />
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
          <Target className="mx-auto mb-3 text-gray/50" size={28} />
          <p className="text-sm font-bold text-light">
            Todavía no hay goles en el Mundial.
          </p>
          <p className="mt-1 text-xs text-gray">
            Cuando caiga el primero, aquí arranca la tabla de goleadores.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <MyPickBanner myPick={myPick} myRow={myRow} hasScorers />

      <div className="liquid-glass relative overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-white/[0.08] px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray/70">
          <span className="w-5"># </span>
          <span>Jugador</span>
          <span className="w-8 text-center">Asis</span>
          <span className="w-10 text-center">Goles</span>
        </div>
        {scorers.map((s) => {
          const isMine = Boolean(myPick && s.player_id && s.player_id === myPick.player_id);
          return (
            <div
              key={`${s.rank}-${s.name}`}
              className={cn(
                "grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0",
                isMine && "bg-primary/[0.07]"
              )}
            >
              <span
                className={cn(
                  "w-5 text-center text-sm font-black tabular-nums",
                  s.rank <= 3 ? "text-primary" : "text-gray/60"
                )}
              >
                {s.rank}
              </span>
              <div className="flex min-w-0 items-center gap-3">
                <ScorerPhoto name={s.name} src={s.photo} highlight={isMine} />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-bold",
                      isMine ? "text-primary" : "text-light"
                    )}
                  >
                    {s.name}
                    {isMine && (
                      <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary">
                        tu pick
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-gray">
                    {s.team && (
                      <>
                        <Flag iso2={s.team.iso2} name={s.team.name} size={14} />
                        {s.team.name}
                      </>
                    )}
                    {s.appearances > 0 && (
                      <span className="text-gray/60">· {s.appearances} PJ</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="w-8 text-center text-sm tabular-nums text-gray">
                {s.assists}
              </span>
              <span className="w-10 text-center text-xl font-black tabular-nums bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {s.goals}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray/60">
        <Target size={12} />
        Top 20 del torneo · se actualiza con cada gol del Mundial.
      </p>
    </>
  );
};

export default GoleadoresSection;
