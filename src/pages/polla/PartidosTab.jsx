import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Minus,
  Plus,
  Flame,
  Target,
  Check,
  Radio,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import {
  FIXTURES,
  FIXTURE_FILTERS,
  teamByCode,
} from "@/data/mundial2026";

/* Contador hacia el bloqueo del pronostico (corre cada segundo) */
const useLockCountdown = (target) => {
  const compute = () => {
    if (!target) return null;
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { locked: true };
    return {
      locked: false,
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setT(compute()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
};

const LockBanner = ({ target }) => {
  const t = useLockCountdown(target);
  if (!t) return null;
  const txt = t.locked
    ? "Pronósticos cerrados"
    : `${t.d}d ${String(t.h).padStart(2, "0")}h ${String(t.m).padStart(2, "0")}m ${String(t.s).padStart(2, "0")}s`;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.07] px-3 py-2 text-xs text-primary">
      <Lock size={13} className="shrink-0" />
      <span className="text-gray">Se bloquea en</span>
      <span className="ml-auto font-bold tabular-nums tracking-wide">{txt}</span>
    </div>
  );
};

/* Lado de un equipo: bandera + codigo + nombre */
const TeamSide = ({ code, align = "left" }) => {
  const team = teamByCode(code);
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <Flag iso2={team.iso2} name={team.name} size={34} />
      <div className="min-w-0">
        <p className="text-sm font-black leading-tight text-light">{code}</p>
        <p className="truncate text-[11px] leading-tight text-gray">
          {team.name}
        </p>
      </div>
    </div>
  );
};

/* Stepper de marcador (mockup interactivo, sin guardar nada real) */
const ScoreStepper = ({ value, onChange }) => (
  <div className="flex flex-col items-center gap-1.5">
    <button
      onClick={() => onChange(Math.min(20, value + 1))}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-gray transition-colors hover:border-primary/50 hover:text-primary"
      aria-label="Sumar"
    >
      <Plus size={14} />
    </button>
    <span className="w-9 text-center text-3xl font-black tabular-nums text-light">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.max(0, value - 1))}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-gray transition-colors hover:border-primary/50 hover:text-primary"
      aria-label="Restar"
    >
      <Minus size={14} />
    </button>
  </div>
);

const PredictorRow = ({ match }) => {
  const [pred, setPred] = useState(match.myPred || { h: 0, a: 0 });
  const [saved, setSaved] = useState(Boolean(match.myPred));

  const home = teamByCode(match.home);
  const away = teamByCode(match.away);

  return (
    <div className="mt-3 rounded-2xl border border-white/[0.07] bg-dark/40 p-3">
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Flag iso2={home.iso2} name={home.name} size={30} />
        <ScoreStepper
          value={pred.h}
          onChange={(h) => {
            setPred((p) => ({ ...p, h }));
            setSaved(false);
          }}
        />
        <span className="text-lg font-black text-gray">-</span>
        <ScoreStepper
          value={pred.a}
          onChange={(a) => {
            setPred((p) => ({ ...p, a }));
            setSaved(false);
          }}
        />
        <Flag iso2={away.iso2} name={away.name} size={30} />
      </div>
      <button
        onClick={() => setSaved(true)}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
          saved
            ? "border border-secondary/40 bg-secondary/10 text-secondary"
            : "bg-linear-to-r from-primary to-secondary text-dark hover:shadow-lg hover:shadow-primary/30"
        )}
      >
        {saved ? (
          <>
            <Check size={16} /> Pronóstico guardado
          </>
        ) : (
          <>
            <Target size={16} /> Guardar pronóstico
          </>
        )}
      </button>
    </div>
  );
};

/* Resultado en vivo / final con el pronostico del usuario */
const ScoreBoard = ({ match }) => {
  const live = match.status === "live";
  return (
    <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-dark/40 py-3">
      <span className="text-4xl font-black tabular-nums text-light">
        {match.homeScore}
      </span>
      <span className="text-2xl font-black text-gray">-</span>
      <span className="text-4xl font-black tabular-nums text-light">
        {match.awayScore}
      </span>
      {live && (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">
          <Radio size={11} className="animate-pulse" />
          {match.minute}&apos;
        </span>
      )}
    </div>
  );
};

const PredChip = ({ match }) => {
  if (!match.myPred) {
    return (
      <span className="text-[11px] text-gray/70">No pronosticaste este partido</span>
    );
  }
  const finished = match.status === "finished";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-gray">
        Tu pronóstico:{" "}
        <span className="font-bold text-light">
          {match.myPred.h}-{match.myPred.a}
        </span>
      </span>
      {finished &&
        (match.earned > 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
              match.earned >= 3
                ? "bg-linear-to-r from-primary to-secondary text-dark"
                : "bg-secondary/15 text-secondary"
            )}
          >
            {match.earned >= 3 && <Flame size={12} />}+{match.earned} pts
          </span>
        ) : (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-gray">
            +0 pts
          </span>
        ))}
    </div>
  );
};

const MatchCard = ({ match }) => {
  const statusMeta = {
    live: { label: "EN VIVO", cls: "text-red-400 bg-red-500/10" },
    upcoming: { label: match.time, cls: "text-gray bg-white/[0.04]" },
    finished: { label: "FINAL", cls: "text-gray bg-white/[0.04]" },
  }[match.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "liquid-glass relative overflow-hidden rounded-2xl border p-4",
        match.featured ? "border-primary/40" : "border-white/[0.07]"
      )}
    >
      {match.featured && (
        <span className="absolute right-3 top-3 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          ⭐ Colombia
        </span>
      )}
      {/* Cabecera: ronda + estado */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray/70">
          {match.round}
        </span>
        {!match.featured && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              statusMeta.cls
            )}
          >
            {statusMeta.label}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSide code={match.home} align="left" />
        <span className="px-1 text-xs font-black text-gray">VS</span>
        <TeamSide code={match.away} align="right" />
      </div>

      {/* Cuerpo segun estado */}
      {match.status === "upcoming" && (
        <>
          <div className="mt-3">
            <LockBanner target={match.locksAt} />
          </div>
          <PredictorRow match={match} />
        </>
      )}

      {(match.status === "live" || match.status === "finished") && (
        <>
          <ScoreBoard match={match} />
          <div className="mt-3 border-t border-white/[0.06] pt-2.5">
            <PredChip match={match} />
          </div>
        </>
      )}
    </motion.div>
  );
};

const PartidosTab = () => {
  const [filter, setFilter] = useState("upcoming");

  const counts = useMemo(() => {
    return FIXTURES.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const list = FIXTURES.filter((m) => m.status === filter);

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30">
          <Pencil className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-light">Tus pronósticos</h2>
          <p className="mt-0.5 text-sm leading-snug text-gray">
            Pon tu marcador antes de que empiece el partido. Marcador exacto = 3
            pts, resultado correcto = 1 pt.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex gap-2">
        {FIXTURE_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-all",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 text-gray hover:border-white/20 hover:text-light"
              )}
            >
              {f.id === "live" && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              )}
              {f.label}
              {counts[f.id] ? (
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 text-[10px]",
                    active ? "bg-primary/20" : "bg-white/[0.06]"
                  )}
                >
                  {counts[f.id]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <AnimatePresence mode="popLayout">
        {list.length ? (
          <div className="space-y-3">
            {list.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center text-sm text-gray">
            No hay partidos en esta categoría por ahora.
          </p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartidosTab;
