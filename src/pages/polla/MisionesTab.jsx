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
import { MISSIONS, MY_STATS } from "@/data/mundial2026";

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
  { key: "exactHits", label: "Exactos", value: (s) => s.exactHits },
  { key: "correctHits", label: "Aciertos", value: (s) => s.correctHits },
  { key: "predicted", label: "Jugados", value: (s) => s.predicted },
];

const MissionRow = ({ mission, index }) => {
  const Icon = MISSION_ICONS[mission.id] || Star;
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
            <h3 className="text-sm font-black text-light">{mission.title}</h3>
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
          <p className="mt-0.5 text-xs leading-snug text-gray">{mission.desc}</p>

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

const MisionesTab = () => {
  const done = MISSIONS.filter((m) => m.done).length;

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/20 to-secondary/20">
          <FlagIcon className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-light">Misiones</h2>
          <p className="mt-0.5 text-sm leading-snug text-gray">
            Completa retos para ganar puntos extra e insignias.{" "}
            <span className="font-bold text-secondary">
              {done}/{MISSIONS.length}
            </span>{" "}
            completadas.
          </p>
        </div>
      </div>

      {/* Resumen de mis pronosticos */}
      <div className="mb-6 grid grid-cols-4 gap-2">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-3 text-center"
          >
            <p className="text-2xl font-black tabular-nums bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {s.value(MY_STATS)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de misiones */}
      <div className="space-y-3">
        {MISSIONS.map((m, i) => (
          <MissionRow key={m.id} mission={m} index={i} />
        ))}
      </div>
    </div>
  );
};

export default MisionesTab;
