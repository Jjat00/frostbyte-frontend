import React from "react";
import { motion } from "framer-motion";
import {
  Flag as FlagIcon,
  Sparkles,
  Crosshair,
  Star,
  Flame,
  ListChecks,
  Users,
  Check,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePollaMissions } from "@/hooks/usePolla";

const MISSION_ICONS = {
  first: Sparkles,
  exact3: Crosshair,
  colombia: Star,
  streak5: Flame,
  groupstage: ListChecks,
  invite: Users,
};

const STATS = [
  { key: "points", label: "Puntos", value: (s) => s.points },
  { key: "exact_hits", label: "Exactos", value: (s) => s.exact_hits },
  { key: "correct_hits", label: "Aciertos", value: (s) => s.correct_hits },
  { key: "predicted", label: "Jugados", value: (s) => s.predicted },
];

// Misiones ocultas por ahora (la API las sigue enviando). Se ocultan hasta
// implementar su mecánica real.
// TODO: reactivar "invite" (Trae la banda) cuando exista el flujo de invitar amigos.
const HIDDEN_MISSIONS = ["invite"];

const MissionRow = ({ mission, index }) => {
  const Icon = MISSION_ICONS[mission.code] || Star;
  const pct = Math.min(100, Math.round((mission.progress / mission.total) * 100));
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "liquid-glass relative overflow-hidden rounded-2xl border p-4",
        mission.done ? "border-secondary/30" : "border-white/[0.07]"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            mission.done
              ? "border-secondary/40 bg-secondary/10 text-secondary"
              : "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          {mission.done ? <Check size={20} /> : <Icon size={20} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-black text-light">{mission.title}</h3>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                mission.done
                  ? "bg-secondary/15 text-secondary"
                  : "bg-white/[0.06] text-gray"
              )}
            >
              <Gift size={11} />
              {mission.reward}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-3 text-xs leading-snug text-gray">{mission.desc}</p>

          {/* Barra de progreso */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={cn(
                  "h-full rounded-full",
                  mission.done
                    ? "bg-secondary"
                    : "bg-linear-to-r from-primary to-secondary"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-gray">
              {mission.progress}/{mission.total}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Encabezado fijo reutilizado en todos los estados
const Header = ({ done, total }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/20 to-secondary/20">
      <FlagIcon className="text-primary" size={20} />
    </div>
    <div className="min-w-0">
      <h2 className="text-xl font-black text-light">Misiones</h2>
      <p className="mt-0.5 text-sm leading-snug text-gray">
        Completa retos para ganar puntos extra e insignias.{" "}
        {done != null && total != null ? (
          <>
            <span className="font-bold text-secondary">
              {done}/{total}
            </span>{" "}
            completadas.
          </>
        ) : null}
      </p>
    </div>
  </div>
);

const MisionesTab = () => {
  const { data, isLoading, isError } = usePollaMissions();

  if (isLoading) {
    return (
      <div>
        <Header />
        {/* Skeleton del resumen de estadisticas */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
        {/* Skeleton de la lista de misiones */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Header />
        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center text-sm text-gray">
          No pudimos cargar las misiones. Intentalo de nuevo en un momento.
        </p>
      </div>
    );
  }

  const missions = (data?.missions ?? []).filter(
    (m) => !HIDDEN_MISSIONS.includes(m.code)
  );
  const stats = data?.my_stats ?? {};
  const done = missions.filter((m) => m.done).length;

  return (
    <div>
      {/* Encabezado */}
      <Header done={done} total={missions.length} />

      {/* Resumen de mis pronosticos */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-3 text-center"
          >
            <p className="text-2xl font-black tabular-nums bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {s.value(stats)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de misiones */}
      {missions.length ? (
        <div className="space-y-3">
          {missions.map((m, i) => (
            <MissionRow key={m.code} mission={m} index={i} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center text-sm text-gray">
          No hay misiones disponibles por ahora.
        </p>
      )}
    </div>
  );
};

export default MisionesTab;
