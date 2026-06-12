import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Flame,
  Radio,
  Pencil,
  Calendar,
  ChevronDown,
  Star,
  Trophy,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import MencionesSection from "./MencionesSection";
import EliminacionBracket from "./EliminacionBracket";
import ColombiaBanner, {
  COLOMBIA_TRICOLOR_V,
  isColombiaMatch,
} from "./ColombiaBanner";
import MatchDetailSheet from "./MatchDetailSheet";
import { usePollaMatches, useSavePrediction } from "@/hooks/usePolla";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";
import {
  FIXTURE_FILTERS,
  FORM_COLOR,
  matchTime,
  matchDayLabel,
  matchDayKey,
} from "@/data/mundial2026";

/* Un pronostico esta completo cuando tiene ambos marcadores */
const isComplete = (p) =>
  p && p.h !== "" && p.h != null && p.a !== "" && p.a != null;

/* Agrupa partidos por dia (hora de Colombia) y ordena cronologicamente */
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

/* Estado inicial de pronostico desde my_prediction del backend */
const predFromMatch = (m) =>
  m.my_prediction && m.my_prediction.home_score != null && m.my_prediction.away_score != null
    ? { h: String(m.my_prediction.home_score), a: String(m.my_prediction.away_score) }
    : { h: "", a: "" };

/* ── Puntitos de forma reciente ── */
const FormDots = ({ form }) => {
  const dots = Array.isArray(form) ? form : [];
  if (!dots.length) return null;
  return (
    <div className="flex justify-center gap-1">
      {dots.map((r, i) => (
        <span key={i} className={cn("h-1.5 w-1.5 rounded-full", FORM_COLOR[r])} />
      ))}
    </div>
  );
};

/* ── Columna de una seleccion (bandera + nombre + forma) ── */
/* `side` es match.home / match.away. En eliminatorias code/iso2 son null y se
   usa side.placeholder ("1A", "Ganador 73") con bandera neutra. */
const TeamColumn = ({ side }) => {
  const isPlaceholder = !side.code;
  const label = isPlaceholder ? side.placeholder || "Por definir" : side.name;
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Flag iso2={side.iso2} name={label} size={48} rounded="rounded-md" />
      <p className="line-clamp-2 text-xs font-bold leading-tight text-light">
        {label}
      </p>
      <FormDots form={side.recent_form} />
    </div>
  );
};

/* Tonos de las cajas de marcador (solo lectura) */
const TONE = {
  live: "bg-white/[0.06] text-light ring-1 ring-red-500/30",
  final: "bg-white/[0.06] text-light",
};

const BOX = "h-13 w-13 rounded-2xl text-2xl font-black tabular-nums sm:h-14 sm:w-14 sm:text-3xl";

// Referencia estable para el caso "sin datos": evita que el default `[]` cree un
// array nuevo en cada render y dispare en bucle el efecto que siembra preds.
const EMPTY_MATCHES = [];

/* ── Caja de marcador: input numerico (editable) o display (solo lectura) ── */
const ScoreBox = ({ value, onChange, onBlur, editable = false, disabled = false, tone = "final" }) => {
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
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
        if (digits === "") return onChange("");
        onChange(String(Math.min(20, parseInt(digits, 10))));
      }}
      aria-label="Marcador"
      className={cn(
        "appearance-none text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
        BOX,
        filled
          ? "border-0 bg-linear-to-br from-primary to-secondary text-dark"
          : "border-2 border-dashed border-primary/40 bg-primary/[0.04] text-light"
      )}
    />
  );
};

/* Pildora "Bloqueado" (cuando ya pasó el pitazo) */
const LockedPill = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray/70">
    Bloqueado <Lock size={10} />
  </span>
);

/* Cuenta regresiva hasta el pitazo (= cierre del pronostico). Cambia de tono
   segun la urgencia: gris lejano, ambar < 1h, rojo pulsante < 5 min. */
const LockCountdown = ({ cd }) => {
  const urgent = cd.total <= 5 * 60 * 1000; // < 5 min
  const soon = cd.total <= 60 * 60 * 1000; // < 1 h
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold tabular-nums",
        urgent
          ? "border-red-500/50 bg-red-500/15 text-red-300"
          : soon
          ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
          : "border-white/15 bg-white/[0.05] text-light/80"
      )}
    >
      <Timer size={13} className={cn(urgent && "animate-pulse")} />
      <span className="uppercase tracking-wider opacity-70">Cierra en</span>
      <span className="text-[12px] font-black">{formatCountdown(cd)}</span>
    </span>
  );
};

/* Resultado para partidos en vivo / finalizados: pronostico + puntos */
const ResultInfo = ({ match }) => {
  const mp = match.my_prediction;
  if (!mp) {
    return <span className="text-[10px] text-gray/60">Sin pronostico</span>;
  }
  const earned = mp.points_earned ?? 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray">
        Tu:{" "}
        <b className="text-light">
          {mp.home_score}-{mp.away_score}
        </b>
      </span>
      {match.status === "finished" &&
        (earned > 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
              mp.is_exact
                ? "bg-linear-to-r from-primary to-secondary text-dark"
                : "bg-secondary/15 text-secondary"
            )}
          >
            {mp.is_exact && <Flame size={10} />}+{earned}
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
const CompactMatchCard = ({ match, pred, onChange, onSave, isPending, error, onOpenDetail }) => {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  // Cuenta regresiva hasta el pitazo. Cuando llega a 0 bloqueamos en cliente al
  // instante (sin esperar el refetch del backend), evitando un guardado que el
  // servidor rechazaria igual por is_locked.
  const cd = useCountdown(match.kickoff);
  const locked = match.is_locked || (isUpcoming && cd.done);
  const editable = isUpcoming && !locked;

  // Guarda cuando ambos marcadores estan completos (onBlur tambien dispara).
  const trySave = (next) => {
    if (isComplete(next)) {
      onSave(match.slug, next);
    }
  };

  // Etiqueta superior: con grupo si existe, si no solo round_label + hora.
  const topLabel = match.group
    ? `Grupo ${match.group} · ${match.round_label}`
    : match.round_label;

  // Partido de Colombia: franja tricolor + fondo amarillo sutil.
  const colombia = isColombiaMatch(match);

  return (
    <div
      id={`match-${match.slug}`}
      onClick={() => onOpenDetail?.(match)}
      className={cn(
        "relative cursor-pointer px-2 py-4 transition-colors hover:bg-white/[0.02]",
        match.featured && "bg-primary/[0.04]",
        colombia && "bg-[#FCD116]/[0.04]"
      )}
    >
      {colombia && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1"
          style={{ background: COLOMBIA_TRICOLOR_V }}
        />
      )}
      {match.featured && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          <Star size={9} /> Destacado
        </span>
      )}

      {/* Etiqueta superior */}
      <p className="mb-3 text-center text-[11px] text-gray">
        {topLabel} {"·"}{" "}
        <span className="text-light/80">{matchTime(match.kickoff)}</span>
        {isLive && match.minute != null && (
          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 align-middle text-[10px] font-bold text-red-400">
            <Radio size={9} className="animate-pulse" />
            {match.minute}&apos;
          </span>
        )}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <TeamColumn side={match.home} />

        {/* Zona de pronostico: en partidos abiertos no debe abrir el detalle
            (los inputs y el countdown viven aqui). */}
        <div
          onClick={(e) => isUpcoming && e.stopPropagation()}
          className="flex flex-col items-center gap-2 pt-1"
        >
          {isUpcoming ? (
            <>
              <div className="flex items-center gap-2">
                <ScoreBox
                  value={pred.h}
                  editable
                  disabled={!editable || isPending}
                  onChange={(h) => onChange({ ...pred, h })}
                  onBlur={() => trySave(pred)}
                />
                <span className="text-[11px] font-bold text-gray">VS</span>
                <ScoreBox
                  value={pred.a}
                  editable
                  disabled={!editable || isPending}
                  onChange={(a) => {
                    const next = { ...pred, a };
                    onChange(next);
                    trySave(next);
                  }}
                  onBlur={() => trySave(pred)}
                />
              </div>
              {locked ? <LockedPill /> : <LockCountdown cd={cd} />}
              {error && (
                <span className="text-center text-[10px] text-red-400">{error}</span>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ScoreBox
                  value={match.home_score != null ? String(match.home_score) : ""}
                  tone={isLive ? "live" : "final"}
                />
                <span className="text-sm font-black text-gray">-</span>
                <ScoreBox
                  value={match.away_score != null ? String(match.away_score) : ""}
                  tone={isLive ? "live" : "final"}
                />
              </div>
              <ResultInfo match={match} />
            </>
          )}
        </div>

        <TeamColumn side={match.away} />
      </div>
    </div>
  );
};

/* ── Grupo de partidos por fecha (plegable, con contador) ── */
const DateGroup = ({ label, matches, preds, onChange, onSave, pendingSlug, errors, onOpenDetail }) => {
  const [open, setOpen] = useState(true);
  const total = matches.length;
  const done = matches.filter((m) => isComplete(preds[m.slug])).length;
  const allDone = done === total;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border-y border-white/[0.06] bg-white/[0.02] px-2 py-2.5"
      >
        <span className="text-xs font-bold uppercase tracking-normal sm:tracking-widest text-gray">
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
            {done}/{total} pronosticos
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
                  key={m.slug}
                  match={m}
                  pred={preds[m.slug] || { h: "", a: "" }}
                  onChange={(v) => onChange(m.slug, v)}
                  onSave={onSave}
                  isPending={pendingSlug === m.slug}
                  error={errors[m.slug]}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Skeleton de carga (acorde al diseno cyberpunk) ── */
const MatchSkeleton = () => (
  <div className="px-2 py-4">
    <div className="mx-auto mb-3 h-3 w-40 rounded bg-white/[0.06]" />
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
      {[0, 1].map((col) => (
        <div key={col} className={cn("flex flex-col items-center gap-1.5", col === 1 && "order-2")}>
          <div className="h-9 w-12 rounded-md bg-white/[0.06]" />
          <div className="h-3 w-14 rounded bg-white/[0.06]" />
        </div>
      ))}
      <div className="order-1 flex items-center gap-2 pt-1">
        <div className={cn(BOX, "bg-white/[0.06]")} />
        <span className="text-[11px] font-bold text-gray">VS</span>
        <div className={cn(BOX, "bg-white/[0.06]")} />
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-9 rounded border border-white/[0.06] bg-white/[0.02]" />
    <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <MatchSkeleton />
      <MatchSkeleton />
      <MatchSkeleton />
    </div>
  </div>
);

/* ── Tarjeta de un partido EN VIVO (marcador + minuto, abre el detalle) ── */
const LiveCard = ({ match, onClick }) => {
  const mp = match.my_prediction;
  const topLabel = match.group
    ? `Grupo ${match.group} · ${match.round_label}`
    : match.round_label;
  return (
    <button
      onClick={() => onClick(match)}
      className="relative w-full overflow-hidden rounded-2xl border border-red-500/30 bg-linear-to-br from-red-500/[0.10] via-red-500/[0.04] to-transparent p-3.5 text-left transition-all hover:border-red-500/50 hover:from-red-500/[0.16]"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="truncate text-[10px] uppercase tracking-wider text-gray/80">
          {topLabel}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-red-300">
          <Radio size={9} className="animate-pulse" />
          {match.minute != null ? `${match.minute}'` : "En vivo"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Flag iso2={match.home.iso2} name={match.home.name} size={30} rounded="rounded" />
          <span className="truncate text-sm font-bold text-light">{match.home.name}</span>
        </div>
        <div className="flex items-center gap-2 text-2xl font-black tabular-nums text-light">
          <span>{match.home_score ?? 0}</span>
          <span className="text-base text-gray">-</span>
          <span>{match.away_score ?? 0}</span>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-bold text-light">{match.away.name}</span>
          <Flag iso2={match.away.iso2} name={match.away.name} size={30} rounded="rounded" />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-gray">
        {mp && mp.home_score != null ? (
          <span>
            Tu pronóstico:{" "}
            <b className="tabular-nums text-light">{mp.home_score}-{mp.away_score}</b>
          </span>
        ) : (
          <span className="text-gray/60">No pronosticaste este partido</span>
        )}
        <span className="text-gray/40">·</span>
        <span className="font-bold text-secondary/90">Ver minuto a minuto</span>
      </div>
    </button>
  );
};

/* ── Tira destacada de partidos EN VIVO, fija arriba del todo ── */
const LiveStrip = ({ matches, onOpenDetail }) => {
  const live = matches.filter((m) => m.status === "live");
  if (!live.length) return null;
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <h3 className="text-sm font-black uppercase tracking-widest text-red-400">
          En vivo ahora
        </h3>
        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
          {live.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {live.map((m) => (
          <LiveCard key={m.slug} match={m} onClick={onOpenDetail} />
        ))}
      </div>
    </div>
  );
};

const PartidosTab = () => {
  const [view, setView] = useState("grupos"); // grupos | eliminacion
  const [filter, setFilter] = useState("upcoming");
  // Partido abierto en el sheet de detalle (minuto a minuto, estadisticas).
  const [detailSlug, setDetailSlug] = useState(null);

  // Trae TODOS los partidos una sola vez; se filtra en cliente.
  const { data, isLoading, isError } = usePollaMatches({});
  const matches = data ?? EMPTY_MATCHES;
  const savePrediction = useSavePrediction();

  // Pronosticos en estado local indexados por slug; se siembran desde my_prediction.
  const [preds, setPreds] = useState({});
  const [errors, setErrors] = useState({});

  // Sincroniza el estado local cuando llegan/actualizan los partidos.
  // Si no hay slugs nuevos devolvemos `prev` (misma referencia) para que React
  // omita el re-render: esto evita cualquier bucle aunque `matches` cambiara de
  // referencia sin cambiar de contenido.
  useEffect(() => {
    setPreds((prev) => {
      let changed = false;
      const next = { ...prev };
      matches.forEach((m) => {
        if (!(m.slug in next)) {
          next[m.slug] = predFromMatch(m);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [matches]);

  const setPred = (slug, val) => setPreds((p) => ({ ...p, [slug]: val }));

  const onSave = (slug, val) => {
    setErrors((e) => {
      if (!e[slug]) return e;
      const { [slug]: _omit, ...rest } = e;
      return rest;
    });
    savePrediction.mutate(
      { slug, home_score: Number(val.h), away_score: Number(val.a) },
      {
        onError: (err) => {
          const detail =
            err?.response?.data?.detail || "No se pudo guardar el pronostico.";
          setErrors((e) => ({ ...e, [slug]: detail }));
        },
      }
    );
  };

  // Solo partidos CONFIRMADOS (con ambas selecciones definidas). Los cruces de
  // eliminación con cupo por definir ("1A", "Ganador 73") viven en el bracket.
  const confirmed = useMemo(
    () => matches.filter((m) => m.home?.code && m.away?.code),
    [matches]
  );

  // Contadores por estado (sobre los confirmados).
  const counts = useMemo(
    () =>
      confirmed.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {}),
    [confirmed]
  );

  const list = useMemo(
    () => confirmed.filter((m) => m.status === filter),
    [confirmed, filter]
  );
  const groups = useMemo(() => groupByDate(list), [list]);

  const pendingSlug = savePrediction.isPending
    ? savePrediction.variables?.slug
    : null;

  // Lleva a la tarjeta del partido (cambia vista/filtro y hace scroll).
  const goToMatch = (m) => {
    setView("grupos");
    setFilter(m.status);
    setTimeout(() => {
      document
        .getElementById(`match-${m.slug}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  return (
    <div>
      {/* EN VIVO: protagonismo arriba del todo, visible en cualquier filtro/vista */}
      <LiveStrip matches={confirmed} onOpenDetail={(m) => setDetailSlug(m.slug)} />

      {/* Modo Colombia: proximo partido (o en vivo) de la seleccion */}
      <ColombiaBanner matches={confirmed} onGoToMatch={goToMatch} />

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

      {/* Toggle: Fase de grupos (marcadores) / Eliminación (bracket) */}
      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {[
          { id: "grupos", label: "Fase de grupos", icon: Calendar },
          { id: "eliminacion", label: "Eliminación", icon: Trophy },
        ].map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all",
                active
                  ? "bg-linear-to-r from-primary to-secondary text-dark"
                  : "text-gray hover:text-light"
              )}
            >
              <v.icon size={15} />
              {v.label}
            </button>
          );
        })}
      </div>

      {view === "eliminacion" ? (
        <EliminacionBracket onGoToGroups={() => setView("grupos")} />
      ) : (
        <>
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FIXTURE_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold transition-all",
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
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-10 text-center text-sm text-red-400">
              No pudimos cargar los partidos. Intenta de nuevo en un momento.
            </p>
          ) : groups.length ? (
            <div className="space-y-2">
              {groups.map((g) => (
                <DateGroup
                  key={g.key}
                  label={g.label}
                  matches={g.matches}
                  preds={preds}
                  onChange={setPred}
                  onSave={onSave}
                  pendingSlug={pendingSlug}
                  errors={errors}
                  onOpenDetail={(m) => setDetailSlug(m.slug)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center text-sm text-gray">
              No hay partidos en esta categoría por ahora.
            </p>
          )}
        </>
      )}

      {/* Sheet de detalle del partido */}
      <AnimatePresence>
        {detailSlug && (
          <MatchDetailSheet
            slug={detailSlug}
            onClose={() => setDetailSlug(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartidosTab;
