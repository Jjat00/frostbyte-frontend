import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Trophy,
  Crosshair,
  Target,
  ClipboardList,
  ListChecks,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaParticipant } from "@/hooks/usePolla";

/**
 * Bottom sheet con el perfil público de un participante del ranking. Se abre al
 * tocar a una persona en la tabla y muestra de dónde salieron sus puntos:
 * desglose por fuente, sus misiones y el historial de pronósticos en partidos
 * YA TERMINADOS con lo que sumó en cada uno. Portal a <body> (mismo motivo que
 * PlayerSheet: escapar del stacking context de <main>).
 */

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

// Desglose de puntos. Solo se muestran las fuentes con puntos > 0 para no
// llenar de ceros el perfil de quien solo juega los partidos.
const BREAKDOWN = [
  { key: "match_points", label: "Partidos", accent: "text-secondary" },
  { key: "mission_points", label: "Misiones", accent: "text-primary" },
  { key: "award_points", label: "Menciones", accent: "text-amber-300" },
  { key: "referral_points", label: "Referidos", accent: "text-emerald-300" },
];

/* Caja de PUNTOS: una fuente que suma al total. El sufijo "pts" siempre visible
   para que no se confunda con los conteos de precisión. */
const PointBox = ({ value, label, accent }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-2 py-3 text-center">
    <p className="flex items-baseline justify-center gap-0.5">
      <span className={cn("text-xl font-black tabular-nums", accent)}>{value || 0}</span>
      <span className="text-[10px] font-bold text-gray/60">pts</span>
    </p>
    <p className="mt-0.5 text-[9px] uppercase tracking-wider text-gray/70">{label}</p>
  </div>
);

/* Conteo de PRECISIÓN: NO son puntos. Layout horizontal (icono · número · texto)
   deliberadamente distinto a las cajas de puntos para que nadie los sume. */
const StatCount = ({ icon: Icon, value, label, tone = "light" }) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-2.5 py-2">
    <Icon
      size={15}
      className={cn("shrink-0", tone === "secondary" ? "text-secondary" : "text-primary")}
    />
    <span className="text-base font-black tabular-nums text-light">{value ?? 0}</span>
    <span className="text-[10px] leading-tight text-gray/70">{label}</span>
  </div>
);

/* Una fila de pronóstico. Partido terminado: muestra lo que sumó. Partido EN
   VIVO: marcador parcial destacado + minuto, sin puntos aún (no consolidados). */
const PredictionRow = ({ p }) => {
  const live = p.status === "live";
  const badge = p.is_exact
    ? { cls: "bg-emerald-400/15 text-emerald-300", label: `+${p.points_earned}` }
    : p.is_correct_outcome
    ? { cls: "bg-secondary/15 text-secondary", label: `+${p.points_earned}` }
    : { cls: "bg-white/[0.05] text-gray", label: "0" };

  return (
    <li
      className={cn(
        "flex items-center gap-2 py-2.5",
        live && "-mx-3 rounded-xl bg-red-500/[0.06] px-3"
      )}
    >
      <span className="w-7 shrink-0 text-[10px] tabular-nums text-gray/60">
        #{p.match_number}
      </span>
      {/* Local */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <span className="truncate text-right text-xs font-bold text-light">
          {p.home?.code || p.home?.name}
        </span>
        <Flag iso2={p.home?.iso2} name={p.home?.name || ""} size={18} />
      </div>
      {/* Marcadores: pronóstico arriba; abajo el real (parcial si está en vivo) */}
      <div className="flex shrink-0 flex-col items-center leading-none">
        <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-xs font-black tabular-nums text-light">
          {p.pred_home}-{p.pred_away}
        </span>
        {live ? (
          <span className="mt-1 flex items-center gap-1 text-[11px] font-black tabular-nums text-light">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {p.real_home ?? 0}-{p.real_away ?? 0}
          </span>
        ) : (
          <span className="mt-1 text-[10px] tabular-nums text-gray/70">
            real {p.real_home}-{p.real_away}
          </span>
        )}
      </div>
      {/* Visitante */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Flag iso2={p.away?.iso2} name={p.away?.name || ""} size={18} />
        <span className="truncate text-xs font-bold text-light">
          {p.away?.code || p.away?.name}
        </span>
      </div>
      {/* En vivo: minuto en curso (aún sin puntos). Terminado: lo que sumó. */}
      {live ? (
        <span className="flex w-9 shrink-0 items-center justify-center rounded-md bg-red-500/15 py-0.5 text-[9px] font-black uppercase tabular-nums text-red-300">
          {p.minute ? `${p.minute}'` : "live"}
        </span>
      ) : (
        <span
          className={cn(
            "w-9 shrink-0 rounded-md py-0.5 text-center text-xs font-black",
            badge.cls
          )}
        >
          {badge.label}
        </span>
      )}
    </li>
  );
};

const SheetSkeleton = () => (
  <div className="animate-pulse space-y-4 p-5">
    <div className="flex items-center gap-4">
      <span className="h-16 w-16 rounded-full bg-white/[0.06]" />
      <div className="space-y-2">
        <span className="block h-4 w-36 rounded bg-white/[0.06]" />
        <span className="block h-3 w-24 rounded bg-white/[0.06]" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className="h-16 rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
    <div className="h-28 rounded-2xl bg-white/[0.04]" />
  </div>
);

const RankingPlayerSheet = ({ userId, fallbackName, fallbackAvatar, onClose }) => {
  const { data, isLoading, isError } = usePollaParticipant(userId);

  const user = data?.user;
  const score = data?.score;
  const missions = data?.missions || [];
  const referral = data?.referral;
  const predictions = data?.predictions || [];
  const isYou = data?.is_you;

  const name = user?.name || fallbackName || "Participante";
  const avatar = user?.avatar ?? fallbackAvatar;
  const doneMissions = missions.filter((m) => m.done).length;
  // Fuentes de puntos con aporte real (siempre incluye Partidos como ancla).
  const sources = BREAKDOWN.filter(
    (b) => b.key === "match_points" || (score?.[b.key] || 0) > 0
  );

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-dark-secondary sm:rounded-3xl"
      >
        {isLoading ? (
          <SheetSkeleton />
        ) : isError || !score ? (
          <div className="p-8 text-center">
            <p className="text-sm font-bold text-light">
              No pudimos cargar este perfil.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-bold text-light hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Cabecera: avatar + identidad + posición/puntos */}
            <div className="relative border-b border-white/[0.08] p-5">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-3 rounded-full p-2 text-gray transition-colors hover:bg-white/10 hover:text-light"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-xl font-black text-dark">
                    {initials(name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-lg font-black leading-tight text-light">
                    <span className="truncate">{name}</span>
                    {isYou && (
                      <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary">
                        tú
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Trophy size={16} />
                      <span className="text-lg font-black tabular-nums">
                        {score.pos || "—"}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray">
                        puesto
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg font-black tabular-nums bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {score.points}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray">
                        pts
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain p-5 pt-4">
              {/* De dónde salieron los puntos — estas cajas SÍ suman al total */}
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray">
                  De dónde vienen sus puntos
                </h4>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-black tabular-nums text-light">
                  suman {score.points} pts
                </span>
              </div>
              <div
                className={cn(
                  "grid gap-2",
                  sources.length <= 3 ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5"
                )}
              >
                {sources.map((b) => (
                  <PointBox
                    key={b.key}
                    value={score[b.key]}
                    label={b.label}
                    accent={b.accent}
                  />
                ))}
              </div>

              {/* Precisión — conteos, NO puntos (separados para no confundir) */}
              <h4 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-widest text-gray">
                Su precisión <span className="text-gray/40">· no son puntos</span>
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatCount
                  icon={Crosshair}
                  value={score.exact_hits}
                  label="marcadores exactos"
                  tone="secondary"
                />
                <StatCount
                  icon={Target}
                  value={score.correct_hits}
                  label="resultados correctos"
                />
                <StatCount
                  icon={ClipboardList}
                  value={score.predicted}
                  label="pronósticos hechos"
                />
              </div>

              {/* Misiones */}
              <div className="mb-2 mt-6 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray">
                  <ListChecks size={13} className="text-primary" /> Misiones
                </h4>
                <span className="text-[11px] font-bold text-gray/70">
                  {doneMissions}/{missions.length} · {score.mission_points} pts
                </span>
              </div>
              {missions.length === 0 && !referral ? (
                <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 text-center text-[11px] text-gray/60">
                  Aún no tiene misiones registradas.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {/* Referidos: mismo conteo que la tarjeta "Invita a tu banda"
                      de la pestaña Misiones (amigos que ya jugaron / tope). */}
                  {referral && (
                    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-light">
                            <Users size={15} className="shrink-0 text-primary" />
                            <span className="truncate">Invita a tu banda</span>
                          </span>
                          <p className="mt-0.5 pl-[21px] text-[11px] leading-snug text-gray/70">
                            Suma {referral.points_per} punto por cada amigo que entre
                            y haga su primer pronóstico (máx {referral.cap}).
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums",
                            referral.points > 0
                              ? "bg-secondary/15 text-secondary"
                              : "bg-white/[0.05] text-gray/60"
                          )}
                        >
                          +{referral.points}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-primary/60 to-secondary/60"
                          style={{
                            width: `${
                              referral.cap
                                ? Math.min(
                                    100,
                                    Math.round((referral.qualified / referral.cap) * 100)
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-bold tabular-nums text-gray/60">
                        {referral.qualified}/{referral.cap} amigos
                        {referral.invited > referral.qualified &&
                          ` · ${referral.invited} invitados`}
                      </p>
                    </div>
                  )}
                  {missions.map((m) => {
                    const pct = m.target
                      ? Math.min(100, Math.round((m.progress / m.target) * 100))
                      : 0;
                    return (
                      <div
                        key={m.code}
                        className={cn(
                          "rounded-xl border p-3",
                          m.done
                            ? "border-secondary/25 bg-secondary/[0.06]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-light">
                              {m.done ? (
                                <CheckCircle2 size={15} className="shrink-0 text-secondary" />
                              ) : (
                                <ListChecks size={15} className="shrink-0 text-gray/50" />
                              )}
                              <span className="truncate">{m.title}</span>
                            </span>
                            {m.desc && (
                              <p className="mt-0.5 pl-[21px] text-[11px] leading-snug text-gray/70">
                                {m.desc}
                              </p>
                            )}
                          </div>
                          {/* Lo que vale: completada en verde, pendiente atenuada */}
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums",
                              m.done
                                ? "bg-secondary/15 text-secondary"
                                : "bg-white/[0.05] text-gray/60"
                            )}
                          >
                            {m.done ? `+${m.bonus_points}` : `vale +${m.bonus_points}`}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              m.done
                                ? "bg-secondary"
                                : "bg-linear-to-r from-primary/60 to-secondary/60"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {/* Qué se hizo para lograrlo: el progreso alcanzado */}
                        <p className="mt-1 text-[10px] font-bold tabular-nums text-gray/60">
                          {m.progress}/{m.target}
                          {m.done && " · completada"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Historial de pronósticos (partidos en vivo + terminados) */}
              <div className="mb-1 mt-6 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray">
                  <ClipboardList size={13} className="text-secondary" /> Pronósticos
                  jugados
                </h4>
                <span className="text-[11px] font-bold text-gray/70">
                  {predictions.length} · {score.match_points} pts
                </span>
              </div>
              {predictions.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-5 text-center text-[11px] text-gray/60">
                  Todavía no hay partidos jugados que haya pronosticado.
                </p>
              ) : (
                <ul className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3">
                  {predictions.map((p) => (
                    <PredictionRow key={p.slug} p={p} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default RankingPlayerSheet;
