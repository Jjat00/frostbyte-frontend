import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Radio, Timer, X, ListOrdered, BarChart3, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { useMatchDetail, useMatchPulse } from "@/hooks/usePolla";
import { useCountdown, formatCountdownLong } from "@/hooks/useCountdown";
import { matchDayLabel, matchTime } from "@/data/mundial2026";

/**
 * Bottom sheet con el detalle de un partido: marcador, minuto a minuto
 * (goles, tarjetas, cambios) y estadisticas en vivo. Se abre al tocar una
 * tarjeta en la lista de partidos. En portal a <body> por la misma razon que
 * PickerSheet (escapar del stacking context de <main>).
 */

/* Icono + etiqueta de un evento del minuto a minuto */
const eventBadge = (ev) => {
  const d = (ev.detail || "").toLowerCase();
  if (ev.type === "goal") {
    if (d.includes("own")) return { icon: "⚽", label: "Gol en contra" };
    if (d.includes("missed")) return { icon: "❌", label: "Penal fallado" };
    if (d.includes("penalty")) return { icon: "⚽", label: "Gol de penal" };
    return { icon: "⚽", label: "Gol" };
  }
  if (ev.type === "card") {
    return d.includes("red")
      ? { icon: "🟥", label: "Roja" }
      : { icon: "🟨", label: "Amarilla" };
  }
  if (ev.type === "subst") return { icon: "🔁", label: "Cambio" };
  if (ev.type === "var") return { icon: "📺", label: "VAR" };
  return { icon: "·", label: ev.detail || "" };
};

const minuteLabel = (ev) =>
  ev.minute != null ? `${ev.minute}${ev.extra ? `+${ev.extra}` : ""}'` : "—";

const EventRow = ({ ev }) => {
  const badge = eventBadge(ev);
  const isGoal = ev.type === "goal";
  const home = ev.side === "home";
  const body = (
    <div className={cn("min-w-0", home ? "text-left" : "text-right")}>
      <p className={cn("truncate text-sm", isGoal ? "font-black text-light" : "font-bold text-light/90")}>
        {ev.type === "subst" && ev.assist
          ? `${ev.player} ⇄ ${ev.assist}`
          : ev.player || badge.label}
      </p>
      <p className="truncate text-[10px] uppercase tracking-wider text-gray/70">
        {badge.label}
        {isGoal && ev.assist ? ` · asiste ${ev.assist}` : ""}
      </p>
    </div>
  );
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 py-2",
        home ? "flex-row" : "flex-row-reverse"
      )}
    >
      <span className="w-10 shrink-0 text-center text-xs font-black tabular-nums text-gray">
        {minuteLabel(ev)}
      </span>
      <span className="shrink-0 text-base leading-none">{badge.icon}</span>
      {body}
    </div>
  );
};

/* Barra comparativa de una estadistica (posesion, tiros, ...) */
const parseStat = (v) =>
  typeof v === "string" ? parseInt(v, 10) || 0 : v || 0;

const StatBar = ({ label, home, away }) => {
  const h = parseStat(home);
  const a = parseStat(away);
  const total = h + a;
  const pct = total > 0 ? (h / total) * 100 : 50;
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="w-10 font-black tabular-nums text-light">{home ?? 0}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray/70">
          {label}
        </span>
        <span className="w-10 text-right font-black tabular-nums text-light">
          {away ?? 0}
        </span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          className="rounded-full bg-linear-to-r from-primary to-secondary transition-all"
          style={{ width: `${pct}%` }}
        />
        <span className="flex-1 rounded-full bg-white/15" />
      </div>
    </div>
  );
};

const STAT_LABELS = [
  ["possession", "Posesión"],
  ["shots", "Remates"],
  ["shots_on", "Al arco"],
  ["corners", "Córners"],
  ["fouls", "Faltas"],
];

const SectionTitle = ({ icon: Icon, children }) => (
  <h4 className="mb-1 mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray">
    <Icon size={13} className="text-primary" />
    {children}
  </h4>
);

/* ── Pulso de la comunidad: como pronostico la polla este partido ── */
const OUTCOME_COLORS = {
  home: "bg-linear-to-r from-primary to-primary/70",
  draw: "bg-white/25",
  away: "bg-linear-to-r from-secondary/70 to-secondary",
};

const PulseSection = ({ match }) => {
  const { data } = useMatchPulse(match.slug);
  if (!data) return null;

  if (!data.visible) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <Lock size={16} className="shrink-0 text-gray/60" />
        <p className="text-xs text-gray">
          Guarda tu pronóstico para ver cómo va el{" "}
          <b className="text-light">pulso de la polla</b> en este partido.
        </p>
      </div>
    );
  }

  const segments = [
    { key: "home", label: match.home.code || "Local" },
    { key: "draw", label: "Empate" },
    { key: "away", label: match.away.code || "Visita" },
  ];

  return (
    <>
      <SectionTitle icon={Users}>Pulso de la polla</SectionTitle>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        {data.total === 0 ? (
          <p className="py-2 text-center text-xs text-gray">
            Nadie ha pronosticado este partido todavía.
          </p>
        ) : (
          <>
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-white/[0.05]">
              {segments.map((s) => {
                const pct = data.outcomes?.[s.key]?.pct ?? 0;
                return (
                  <span
                    key={s.key}
                    className={cn("rounded-full", OUTCOME_COLORS[s.key])}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px]">
              {segments.map((s, i) => (
                <span
                  key={s.key}
                  className={cn(
                    "font-bold",
                    i === 0 ? "text-primary" : i === 2 ? "text-secondary" : "text-gray"
                  )}
                >
                  {s.label} {data.outcomes?.[s.key]?.pct ?? 0}%
                </span>
              ))}
            </div>
            {data.top_scores?.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-gray/70">
                  Marcador más jugado
                </span>
                {data.top_scores.map((t) => (
                  <span
                    key={t.score}
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold tabular-nums text-light"
                  >
                    {t.score} <span className="text-gray/70">· {t.pct}%</span>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2.5 text-center text-[10px] text-gray/60">
              Basado en {data.total}{" "}
              {data.total === 1 ? "pronóstico" : "pronósticos"} de la polla.
            </p>
          </>
        )}
      </div>
    </>
  );
};

const UpcomingCountdown = ({ kickoff }) => {
  const cd = useCountdown(kickoff, { maxResolutionMs: 60_000 });
  return (
    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-bold text-light/80">
      <Timer size={13} />
      <span className="uppercase tracking-wider opacity-70">Arranca en</span>
      <span className="tabular-nums">{formatCountdownLong(cd)}</span>
    </p>
  );
};

const SheetSkeleton = () => (
  <div className="animate-pulse space-y-3 p-5">
    <div className="mx-auto h-3 w-44 rounded bg-white/[0.06]" />
    <div className="flex items-center justify-center gap-6 py-4">
      <span className="h-12 w-16 rounded-md bg-white/[0.06]" />
      <span className="h-10 w-20 rounded bg-white/[0.08]" />
      <span className="h-12 w-16 rounded-md bg-white/[0.06]" />
    </div>
    <div className="h-3 w-28 rounded bg-white/[0.05]" />
    <div className="h-24 rounded-2xl bg-white/[0.04]" />
  </div>
);

const MatchDetailSheet = ({ slug, onClose, children }) => {
  const { data: match, isLoading } = useMatchDetail(slug);

  const isLive = match?.status === "live";
  const isUpcoming = match?.status === "upcoming";
  const events = match?.events || [];
  const stats = match?.stats || {};
  const hasStats = Boolean(stats.home || stats.away);
  const mp = match?.my_prediction;

  const topLabel = match
    ? [
        match.group ? `Grupo ${match.group}` : match.stage_display,
        match.round_label,
        match.venue_city,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-dark-secondary sm:rounded-3xl"
      >
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-[11px] text-gray">
            {topLabel || "Detalle del partido"}
          </p>
          {isLive && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
              <Radio size={9} className="animate-pulse" />
              {match.minute != null ? `${match.minute}'` : "En vivo"}
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-full p-2 text-gray transition-colors hover:bg-white/10 hover:text-light"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        {isLoading || !match ? (
          <SheetSkeleton />
        ) : (
          <div className="overflow-y-auto overscroll-contain p-5 pt-4">
            {/* Marcador */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Flag iso2={match.home.iso2} name={match.home.name} size={52} rounded="rounded-md" />
                <p className="line-clamp-2 text-xs font-bold leading-tight text-light">
                  {match.home.name}
                </p>
              </div>
              <div className="text-center">
                {isUpcoming ? (
                  <>
                    <p className="text-2xl font-black text-gray">VS</p>
                    <p className="mt-1 text-xs text-gray">
                      {matchDayLabel(match.kickoff)} · {matchTime(match.kickoff)}
                    </p>
                  </>
                ) : (
                  <p className="text-4xl font-black tabular-nums text-light">
                    {match.home_score ?? 0}
                    <span className="mx-1.5 text-gray">-</span>
                    {match.away_score ?? 0}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Flag iso2={match.away.iso2} name={match.away.name} size={52} rounded="rounded-md" />
                <p className="line-clamp-2 text-xs font-bold leading-tight text-light">
                  {match.away.name}
                </p>
              </div>
            </div>

            {/* Tu pronostico + countdown */}
            <div className="mt-3 flex flex-col items-center gap-1.5">
              {mp && mp.home_score != null && (
                <p className="text-xs text-gray">
                  Tu pronóstico:{" "}
                  <b className="tabular-nums text-light">
                    {mp.home_score}-{mp.away_score}
                  </b>
                  {match.status === "finished" && (
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        mp.points_earned > 0
                          ? "bg-secondary/15 text-secondary"
                          : "bg-white/[0.06] text-gray"
                      )}
                    >
                      +{mp.points_earned ?? 0}
                    </span>
                  )}
                </p>
              )}
              {isUpcoming && <UpcomingCountdown kickoff={match.kickoff} />}
            </div>

            {/* Pulso: antes del partido es lo más interesante del sheet */}
            {isUpcoming && <PulseSection match={match} />}

            {/* Minuto a minuto */}
            {events.length > 0 && (
              <>
                <SectionTitle icon={ListOrdered}>Minuto a minuto</SectionTitle>
                <div className="divide-y divide-white/[0.04] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3">
                  {[...events].reverse().map((ev, i) => (
                    <EventRow key={i} ev={ev} />
                  ))}
                </div>
              </>
            )}

            {/* Estadisticas */}
            {hasStats && (
              <>
                <SectionTitle icon={BarChart3}>Estadísticas</SectionTitle>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                  {STAT_LABELS.map(([key, label]) =>
                    stats.home?.[key] != null || stats.away?.[key] != null ? (
                      <StatBar
                        key={key}
                        label={label}
                        home={stats.home?.[key]}
                        away={stats.away?.[key]}
                      />
                    ) : null
                  )}
                </div>
              </>
            )}

            {/* En vivo / finalizado el pulso pasa al final */}
            {!isUpcoming && <PulseSection match={match} />}

            {isUpcoming && !events.length && (
              <p className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center text-xs text-gray">
                El minuto a minuto y las estadísticas aparecen aquí cuando
                ruede el balón.
              </p>
            )}

            {/* Secciones extra (pulso de la comunidad, historial, ...) */}
            {typeof children === "function" ? children(match) : children}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default MatchDetailSheet;
