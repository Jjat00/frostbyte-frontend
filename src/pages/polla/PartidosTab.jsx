import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Flame,
  Radio,
  Pencil,
  Calendar,
  ChevronDown,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import MencionesSection from "./MencionesSection";
import {
  FIXTURES,
  FIXTURE_FILTERS,
  teamByCode,
  teamForm,
  matchTime,
  matchDayLabel,
  matchDayKey,
} from "@/data/mundial2026";

/* Un pronóstico está completo cuando tiene ambos marcadores */
const isComplete = (p) =>
  p && p.h !== "" && p.h != null && p.a !== "" && p.a != null;

/* Agrupa partidos por día (hora de Colombia) y ordena cronológicamente */
const groupByDate = (matches) => {
  const map = {};
  matches.forEach((m) => {
    const key = matchDayKey(m.kickoff);
    if (!map[key]) map[key] = { key, label: matchDayLabel(m.kickoff), matches: [] };
    map[key].matches.push(m);
  });
  return Object.values(map)
    .map((g) => ({ ...g, matches: g.matches.sort((a, b) => a.kickoff - b.kickoff) }))
    .sort((a, b) => a.key.localeCompare(b.key));
};

/* ── Puntitos de forma reciente ── */
const FORM_COLOR = { w: "bg-emerald-400", d: "bg-gray/50", l: "bg-red-400" };
const FormDots = ({ code }) => (
  <div className="flex justify-center gap-1">
    {teamForm(code).map((r, i) => (
      <span key={i} className={cn("h-1.5 w-1.5 rounded-full", FORM_COLOR[r])} />
    ))}
  </div>
);

/* ── Columna de una selección (bandera + nombre + forma) ── */
const TeamColumn = ({ code }) => {
  const team = teamByCode(code);
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Flag iso2={team.iso2} name={team.name} size={48} rounded="rounded-md" />
      <p className="line-clamp-2 text-xs font-bold leading-tight text-light">
        {team.name}
      </p>
      <FormDots code={code} />
    </div>
  );
};

/* Tonos de las cajas de marcador (solo lectura) */
const TONE = {
  live: "bg-white/[0.06] text-light ring-1 ring-red-500/30",
  final: "bg-white/[0.06] text-light",
};

const BOX = "h-12 w-12 rounded-2xl text-2xl font-black tabular-nums sm:h-14 sm:w-14 sm:text-3xl";

/* ── Caja de marcador: input numérico (editable) o display (solo lectura) ── */
const ScoreBox = ({ value, onChange, editable = false, tone = "final" }) => {
  const filled = value !== "" && value != null;

  if (!editable) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          BOX,
          filled ? TONE[tone] : "border-2 border-dashed border-white/15 text-gray/40"
        )}
      >
        {filled ? value : ""}
      </div>
    );
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value ?? ""}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
        if (digits === "") return onChange("");
        onChange(String(Math.min(20, parseInt(digits, 10))));
      }}
      aria-label="Marcador"
      className={cn(
        "appearance-none text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary",
        BOX,
        filled
          ? "border-0 bg-linear-to-br from-primary to-secondary text-dark"
          : "border-2 border-dashed border-primary/40 bg-primary/[0.04] text-light"
      )}
    />
  );
};

/* Píldora de estadísticas (bloqueada, decorativa) */
const StatsPill = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray/70">
    Estadísticas <Lock size={10} />
  </span>
);

/* Resultado para partidos en vivo / finalizados: pronóstico + puntos */
const ResultInfo = ({ match }) => {
  if (!match.myPred) {
    return <span className="text-[10px] text-gray/60">Sin pronóstico</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray">
        Tu:{" "}
        <b className="text-light">
          {match.myPred.h}-{match.myPred.a}
        </b>
      </span>
      {match.status === "finished" &&
        (match.earned > 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
              match.earned >= 3
                ? "bg-linear-to-r from-primary to-secondary text-dark"
                : "bg-secondary/15 text-secondary"
            )}
          >
            {match.earned >= 3 && <Flame size={10} />}+{match.earned}
          </span>
        ) : (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-gray">
            +0
          </span>
        ))}
    </div>
  );
};

/* ── Tarjeta compacta de un partido ── */
const CompactMatchCard = ({ match, pred, onChange }) => {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";

  return (
    <div className={cn("relative px-2 py-4", match.featured && "bg-primary/[0.04]")}>
      {match.featured && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          <Star size={9} /> Colombia
        </span>
      )}

      {/* Etiqueta superior */}
      <p className="mb-3 text-center text-[11px] text-gray">
        Grupo {match.group} · Jornada 1 ·{" "}
        <span className="text-light/80">{matchTime(match.kickoff)}</span>
        {isLive && (
          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 align-middle text-[10px] font-bold text-red-400">
            <Radio size={9} className="animate-pulse" />
            {match.minute}&apos;
          </span>
        )}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <TeamColumn code={match.home} />

        <div className="flex flex-col items-center gap-2 pt-1">
          {isUpcoming ? (
            <>
              <div className="flex items-center gap-2">
                <ScoreBox
                  value={pred.h}
                  editable
                  onChange={(h) => onChange({ ...pred, h })}
                />
                <span className="text-[11px] font-bold text-gray">VS</span>
                <ScoreBox
                  value={pred.a}
                  editable
                  onChange={(a) => onChange({ ...pred, a })}
                />
              </div>
              <StatsPill />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ScoreBox value={String(match.homeScore)} tone={isLive ? "live" : "final"} />
                <span className="text-sm font-black text-gray">-</span>
                <ScoreBox value={String(match.awayScore)} tone={isLive ? "live" : "final"} />
              </div>
              <ResultInfo match={match} />
            </>
          )}
        </div>

        <TeamColumn code={match.away} />
      </div>
    </div>
  );
};

/* ── Grupo de partidos por fecha (plegable, con contador) ── */
const DateGroup = ({ label, matches, preds, onChange }) => {
  const [open, setOpen] = useState(true);
  const total = matches.length;
  const done = matches.filter((m) => isComplete(preds[m.id])).length;
  const allDone = done === total;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border-y border-white/[0.06] bg-white/[0.02] px-2 py-2.5"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-gray">
          {label.toUpperCase()}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              allDone
                ? "border-secondary/40 bg-secondary/10 text-secondary"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            )}
          >
            {done}/{total} pronósticos
          </span>
          <ChevronDown
            size={16}
            className={cn("text-gray transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-white/[0.05]">
              {matches.map((m) => (
                <CompactMatchCard
                  key={m.id}
                  match={m}
                  pred={preds[m.id] || { h: "", a: "" }}
                  onChange={(v) => onChange(m.id, v)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PartidosTab = () => {
  const [filter, setFilter] = useState("upcoming");

  // Pronósticos en estado local (mockup): se siembran desde los de ejemplo.
  const [preds, setPreds] = useState(() => {
    const init = {};
    FIXTURES.forEach((m) => {
      if (m.myPred) init[m.id] = { h: String(m.myPred.h), a: String(m.myPred.a) };
    });
    return init;
  });
  const setPred = (id, val) => setPreds((p) => ({ ...p, [id]: val }));

  const counts = useMemo(
    () =>
      FIXTURES.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {}),
    []
  );

  const list = FIXTURES.filter((m) => m.status === filter);
  const groups = groupByDate(list);

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
            Escribe tu marcador antes de que empiece el partido. Marcador exacto
            = 3 pts, resultado correcto = 1 pt.
          </p>
        </div>
      </div>

      {/* Menciones / pronósticos del torneo */}
      <MencionesSection />

      {/* Partidos */}
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray">
        <Calendar size={14} className="text-primary" />
        Partidos
      </h3>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
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

      {/* Lista agrupada por fecha */}
      {groups.length ? (
        <div className="space-y-2">
          {groups.map((g) => (
            <DateGroup
              key={g.key}
              label={g.label}
              matches={g.matches}
              preds={preds}
              onChange={setPred}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center text-sm text-gray">
          No hay partidos en esta categoría por ahora.
        </p>
      )}
    </div>
  );
};

export default PartidosTab;
