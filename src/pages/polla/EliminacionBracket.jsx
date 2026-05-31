import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Trophy,
  Check,
  Loader2,
  Radio,
  Flame,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaBracket, useSaveBracketPick, useSavePrediction } from "@/hooks/usePolla";
import { matchDayLabel, matchTime } from "@/data/mundial2026";

/* Pronostico de marcador completo = ambos marcadores presentes */
const bothFilled = (s) => s && s.h !== "" && s.h != null && s.a !== "" && s.a != null;

/* ── Caja de marcador compacta (editable o solo lectura) ── */
const MiniScore = ({ value, editable, disabled, onChange, onBlur, tone = "idle" }) => {
  const filled = value !== "" && value != null;
  if (!editable) {
    return (
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-black tabular-nums",
          filled
            ? tone === "live"
              ? "bg-white/[0.06] text-light ring-1 ring-red-500/30"
              : "bg-white/[0.06] text-light"
            : "border border-dashed border-white/15 text-gray/30"
        )}
      >
        {filled ? value : "·"}
      </span>
    );
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value ?? ""}
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "").slice(0, 2);
        if (d === "") return onChange("");
        onChange(String(Math.min(20, parseInt(d, 10))));
      }}
      aria-label="Marcador"
      className={cn(
        "h-9 w-9 shrink-0 appearance-none rounded-lg text-center text-base font-black tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
        filled
          ? "bg-linear-to-br from-primary to-secondary text-dark"
          : "border border-dashed border-primary/40 bg-primary/[0.05] text-light"
      )}
    />
  );
};

/* ── Una fila de equipo dentro de un cruce ── */
const TeamRow = ({
  side,
  source,
  selected,
  canPick,
  onPick,
  scoreValue,
  scoreEditable,
  scoreDisabled,
  onScoreChange,
  onScoreBlur,
  finished,
  realScore,
  pickedWrong,
}) => {
  const defined = Boolean(side?.code);
  const label = defined ? side.name : source || "Por definir";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => canPick && defined && onPick(side.code)}
        disabled={!canPick || !defined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition-all",
          selected
            ? "border-secondary/60 bg-secondary/10"
            : "border-white/[0.08]",
          canPick && defined && !selected && "hover:border-primary/40",
          finished && selected && pickedWrong && "border-red-500/40 bg-red-500/[0.06]"
        )}
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            selected
              ? finished && pickedWrong
                ? "border-red-400 bg-red-400/20 text-red-300"
                : "border-secondary bg-secondary text-dark"
              : "border-white/25"
          )}
        >
          {selected && <Check size={11} strokeWidth={3} />}
        </span>
        <Flag iso2={side?.iso2} name={label} size={24} rounded="rounded" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-bold",
            defined ? "text-light" : "text-gray/60"
          )}
        >
          {defined ? label : <span className="italic">{label}</span>}
        </span>
      </button>
      {finished ? (
        <MiniScore value={realScore} tone="final" />
      ) : scoreEditable ? (
        <MiniScore
          value={scoreValue}
          editable
          disabled={scoreDisabled}
          onChange={onScoreChange}
          onBlur={onScoreBlur}
        />
      ) : (
        <span className="h-9 w-9 shrink-0" />
      )}
    </div>
  );
};

/* ── Tarjeta de un cruce ── */
const CrossCard = ({ match, scores, setScore, onSavePred, onPick, pendingPick, predError }) => {
  const isLive = match.status === "live";
  const finished = match.status === "finished";
  const bothTeams = Boolean(match.home?.code && match.away?.code);
  const canPick = !match.is_locked && !finished && bothTeams && pendingPick !== match.slug;
  const scoreEditable = !match.is_locked && !finished && bothTeams;
  const sc = scores[match.slug] || { h: "", a: "" };

  const trySave = (next) => {
    if (bothFilled(next)) onSavePred(match.slug, next);
  };

  // El backend ya calcula el resultado del avance (compara el pick con el
  // ganador real del cruce, incluidos penales). El frontend no lo deriva.
  const myPick = match.my_pick;
  const mp = match.my_prediction;
  const pickPts = match.pick_points || 0;
  const pickRight = finished && match.pick_scored && pickPts > 0;
  const pickWrong = finished && match.pick_scored && pickPts === 0 && Boolean(myPick);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-dark-secondary/40 p-3 transition-colors",
        pickRight ? "border-secondary/40" : "border-white/[0.08]"
      )}
    >
      {/* Cabecera del cruce */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray">
          {match.venue_stadium || match.round_label}
        </p>
        {isLive && match.minute != null ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
            <Radio size={8} className="animate-pulse" />
            {match.minute}&apos;
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-semibold text-primary/80">
            {matchDayLabel(match.kickoff)}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <TeamRow
          side={match.home}
          source={match.home_source}
          selected={myPick === match.home?.code}
          canPick={canPick}
          onPick={(code) => onPick(match.slug, code)}
          scoreValue={sc.h}
          scoreEditable={scoreEditable}
          scoreDisabled={pendingPick === match.slug}
          onScoreChange={(h) => setScore(match.slug, { ...sc, h })}
          onScoreBlur={() => trySave(sc)}
          finished={finished}
          realScore={mp ? String(mp.home_score) : ""}
          pickedWrong={pickWrong}
        />
        <TeamRow
          side={match.away}
          source={match.away_source}
          selected={myPick === match.away?.code}
          canPick={canPick}
          onPick={(code) => onPick(match.slug, code)}
          scoreValue={sc.a}
          scoreEditable={scoreEditable}
          scoreDisabled={pendingPick === match.slug}
          onScoreChange={(a) => {
            const next = { ...sc, a };
            setScore(match.slug, next);
            trySave(next);
          }}
          onScoreBlur={() => trySave(sc)}
          finished={finished}
          realScore={mp ? String(mp.away_score) : ""}
          pickedWrong={pickWrong}
        />
      </div>

      {/* Pie: estado / puntos / error */}
      <div className="mt-2 flex min-h-[18px] items-center justify-between gap-2">
        {predError ? (
          <span className="text-[10px] text-red-400">{predError}</span>
        ) : finished ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {mp && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  mp.points_earned > 0
                    ? mp.is_exact
                      ? "bg-linear-to-r from-primary to-secondary text-dark"
                      : "bg-secondary/15 text-secondary"
                    : "bg-white/[0.06] text-gray"
                )}
              >
                {mp.is_exact && <Flame size={10} />}Marcador +{mp.points_earned}
              </span>
            )}
            {pickRight ? (
              <span className="rounded-full bg-linear-to-r from-primary to-secondary px-2 py-0.5 text-[10px] font-black text-dark">
                Avance +{pickPts}
              </span>
            ) : myPick ? (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-gray">
                Avance +0
              </span>
            ) : (
              <span className="text-[10px] text-gray/50">Sin pick</span>
            )}
          </div>
        ) : pendingPick === match.slug ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary">
            <Loader2 size={10} className="animate-spin" /> Guardando…
          </span>
        ) : (
          <span className="text-[10px] text-gray/50">
            {bothTeams ? "Toca quién avanza" : "Por definir"}
          </span>
        )}
        {!finished && (
          <span className="shrink-0 text-[10px] font-bold text-gray/40">
            +{match._roundPoints} pts
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Estado bloqueado: progreso hacia los 72 ── */
const LockedState = ({ predicted, total, onGoToGroups }) => {
  const pct = Math.min(100, Math.round((predicted / total) * 100));
  const left = Math.max(0, total - predicted);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/15 to-secondary/15 text-primary">
        <Lock size={26} />
      </div>
      <h3 className="text-lg font-black text-light">La llave está cerrada</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-snug text-gray">
        Completa los <b className="text-light">{total}</b> pronósticos de la fase
        de grupos para desbloquear la eliminación. Con tu tabla armamos tus
        clasificados y de ahí avanzas hasta tu campeón.
      </p>

      <div className="mx-auto mt-5 max-w-xs">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
          <span className="text-gray">Progreso</span>
          <span className="text-primary">
            {predicted}/{total}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <button
        onClick={onGoToGroups}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-secondary px-5 py-2.5 text-sm font-black text-dark shadow-lg shadow-primary/30"
      >
        {left > 0 ? `Te faltan ${left} pronósticos` : "Ir a pronosticar"}
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

/* ── Banner del campeón ── */
const ChampionBanner = ({ champion }) => (
  <div className="relative mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/[0.08] to-secondary/[0.08] p-5 text-center">
    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-dark">
      <Trophy size={24} />
    </div>
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray">
      Tu campeón del Mundial 2026
    </p>
    {champion ? (
      <div className="mt-2 flex flex-col items-center gap-1.5">
        <Flag iso2={champion.iso2} name={champion.name} size={56} className="ring-2 ring-primary/50" />
        <p className="text-lg font-black text-light">{champion.name}</p>
      </div>
    ) : (
      <p className="mt-2 text-sm font-semibold text-gray/70">
        Por definir — avanza tu llave hasta la final.
      </p>
    )}
  </div>
);

const EliminacionBracket = ({ onGoToGroups }) => {
  const { data, isLoading, isError } = usePollaBracket();
  const savePick = useSaveBracketPick();
  const savePred = useSavePrediction();

  const [scores, setScores] = useState({});
  const [errors, setErrors] = useState({});

  const rounds = data?.rounds || [];

  // Siembra el estado local de marcadores desde my_prediction.
  useEffect(() => {
    setScores((prev) => {
      const next = { ...prev };
      rounds.forEach((r) =>
        r.matches.forEach((m) => {
          if (!(m.slug in next)) {
            const mp = m.my_prediction;
            next[m.slug] =
              mp && mp.home_score != null && mp.away_score != null
                ? { h: String(mp.home_score), a: String(mp.away_score) }
                : { h: "", a: "" };
          }
        })
      );
      return next;
    });
  }, [rounds]);

  const colRefs = useRef({});
  const scrollToRound = (stage) => {
    const el = colRefs.current[stage];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const setScore = (slug, val) => setScores((p) => ({ ...p, [slug]: val }));

  const onSavePred = (slug, val) => {
    setErrors((e) => {
      if (!e[slug]) return e;
      const { [slug]: _omit, ...rest } = e;
      return rest;
    });
    savePred.mutate(
      { slug, home_score: Number(val.h), away_score: Number(val.a) },
      {
        onError: (err) =>
          setErrors((e) => ({
            ...e,
            [slug]: err?.response?.data?.detail || "No se pudo guardar.",
          })),
      }
    );
  };

  const onPick = (slug, winner_code) => {
    setErrors((e) => {
      if (!e[slug]) return e;
      const { [slug]: _omit, ...rest } = e;
      return rest;
    });
    savePick.mutate(
      { slug, winner_code },
      {
        onError: (err) =>
          setErrors((e) => ({
            ...e,
            [slug]: err?.response?.data?.detail || "No se pudo guardar el pick.",
          })),
      }
    );
  };

  const pendingPick = savePick.isPending ? savePick.variables?.slug : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
        <Loader2 className="animate-spin text-primary" size={26} />
      </div>
    );
  }
  if (isError) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-10 text-center text-sm text-red-400">
        No pudimos cargar la llave. Intenta de nuevo en un momento.
      </p>
    );
  }

  if (!data?.unlocked) {
    return (
      <LockedState
        predicted={data?.group_predicted ?? 0}
        total={data?.group_total ?? 72}
        onGoToGroups={onGoToGroups}
      />
    );
  }

  return (
    <div>
      {/* Ayuda */}
      <p className="mb-3 flex items-start gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] leading-snug text-gray">
        <Info size={13} className="mt-0.5 shrink-0 text-primary" />
        Toca el equipo que crees que avanza; tu pick pasa a la siguiente ronda.
        El marcador es opcional y suma igual que en grupos.
      </p>

      {/* Navegacion de rondas */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rounds.map((r) => (
          <button
            key={r.stage}
            onClick={() => scrollToRound(r.stage)}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-gray transition-colors hover:border-primary/40 hover:text-light"
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Bracket: columnas con scroll horizontal (snap por ronda) */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
        {rounds.map((r) => (
          <section
            key={r.stage}
            ref={(el) => (colRefs.current[r.stage] = el)}
            className="w-[300px] shrink-0 snap-start sm:w-[270px]"
          >
            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-xl border border-white/[0.08] bg-dark/80 px-3 py-2 backdrop-blur">
              <span className="text-xs font-black uppercase tracking-wider text-light">
                {r.label}
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                +{r.points} pts
              </span>
            </div>
            <div className="space-y-3">
              {r.matches.map((m) => (
                <CrossCard
                  key={m.slug}
                  match={{ ...m, _roundPoints: r.points }}
                  scores={scores}
                  setScore={setScore}
                  onSavePred={onSavePred}
                  onPick={onPick}
                  pendingPick={pendingPick}
                  predError={errors[m.slug]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ChampionBanner champion={data?.champion} />
    </div>
  );
};

export default EliminacionBracket;
