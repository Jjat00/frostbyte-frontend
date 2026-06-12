import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Cake,
  Ruler,
  Weight,
  Flag as FlagIcon,
  Hand,
  Shield,
  Zap,
  Target,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaPlayer } from "@/hooks/usePolla";

/**
 * Bottom sheet con la ficha completa de un jugador: foto grande, datos
 * biográficos (nacionalidad, nacimiento, altura, peso) y sus números en este
 * Mundial (goles, asistencias, tarjetas y los partidos donde aportó). Se abre
 * al tocar un jugador en la plantilla de la ficha de selección. Portal a <body>
 * (mismo motivo que TeamSheet: escapar del stacking context de <main>).
 */

const POSITION = {
  GK: { label: "Arquero", icon: Hand },
  DF: { label: "Defensa", icon: Shield },
  MF: { label: "Mediocampista", icon: Zap },
  FW: { label: "Delantero", icon: Target },
};

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const fmtBirth = (iso) => {
  if (!iso) return null;
  try {
    const d = new Date(`${iso}T00:00:00`);
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
};

const StatBig = ({ value, label, tone = "light" }) => (
  <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-3">
    <span
      className={cn(
        "text-2xl font-black tabular-nums",
        tone === "secondary" ? "text-secondary" : "text-light"
      )}
    >
      {value}
    </span>
    <span className="mt-0.5 text-[9px] uppercase tracking-widest text-gray/70">
      {label}
    </span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Icon size={15} className="shrink-0 text-primary" />
      <span className="text-xs uppercase tracking-wider text-gray/70">{label}</span>
      <span className="ml-auto text-right text-sm font-bold text-light">{value}</span>
    </li>
  );
};

const SheetSkeleton = () => (
  <div className="animate-pulse space-y-4 p-5">
    <div className="flex items-center gap-4">
      <span className="h-20 w-20 rounded-2xl bg-white/[0.06]" />
      <div className="space-y-2">
        <span className="block h-4 w-36 rounded bg-white/[0.06]" />
        <span className="block h-3 w-24 rounded bg-white/[0.06]" />
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-16 rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
    <div className="h-28 rounded-2xl bg-white/[0.04]" />
  </div>
);

const PlayerSheet = ({ playerId, onClose }) => {
  const { data: p, isLoading } = usePollaPlayer(playerId);

  const pos = p?.position ? POSITION[p.position] : null;
  const prof = p?.profile || {};
  const t = p?.tournament || { goals: 0, assists: 0, yellow: 0, red: 0, matches: [] };
  const cards = (t.yellow || 0) + (t.red || 0);

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
        {isLoading || !p ? (
          <SheetSkeleton />
        ) : (
          <>
            {/* Cabecera: foto grande + identidad */}
            <div className="relative border-b border-white/[0.08] p-5">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-3 rounded-full p-2 text-gray transition-colors hover:bg-white/10 hover:text-light"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4">
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-2 ring-white/15"
                  />
                ) : (
                  <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/40 to-secondary/40 text-2xl font-black text-light">
                    {initials(p.name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black leading-tight text-light">
                    {prof.full_name && prof.full_name.length > p.name.length
                      ? prof.full_name
                      : p.name}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {p.number != null && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold tabular-nums text-light">
                        <Hash size={9} />
                        {p.number}
                      </span>
                    )}
                    {pos && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <pos.icon size={10} /> {pos.label}
                      </span>
                    )}
                  </div>
                  {p.team && (
                    <div className="mt-2 flex items-center gap-2">
                      <Flag iso2={p.team.iso2} name={p.team.name} size={22} />
                      <span className="truncate text-xs font-bold text-light/90">
                        {p.team.name}
                      </span>
                      {p.team.group && (
                        <span className="text-[10px] text-gray">· Grupo {p.team.group}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain p-5 pt-4">
              {/* Números en el torneo */}
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray">
                En el Mundial
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <StatBig value={t.goals ?? 0} label="Goles" tone="secondary" />
                <StatBig value={t.assists ?? 0} label="Asist." />
                <StatBig value={cards} label="Tarjetas" />
                <StatBig value={t.matches?.length ?? 0} label="Decisivo" />
              </div>

              {/* Partidos donde aportó (gol/asistencia) */}
              {t.matches?.length > 0 && (
                <ul className="mt-3 divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3">
                  {t.matches.map((m) => (
                    <li key={m.slug} className="flex items-center gap-2.5 py-2.5">
                      <Flag iso2={m.rival?.iso2} name={m.rival?.name || ""} size={22} />
                      <span className="min-w-0 flex-1 truncate text-xs text-light/90">
                        vs {m.rival?.name || "—"}
                        {m.group && (
                          <span className="text-gray/60"> · Grupo {m.group}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] font-bold tabular-nums text-secondary">
                        {m.goals > 0 && `${m.goals} ${m.goals === 1 ? "gol" : "goles"}`}
                        {m.goals > 0 && m.assists > 0 && " · "}
                        {m.assists > 0 && (
                          <span className="text-primary">
                            {m.assists} {m.assists === 1 ? "asist." : "asist."}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Datos biográficos */}
              {(prof.nationality ||
                prof.birth_date ||
                prof.height ||
                prof.weight ||
                p.age != null) && (
                <>
                  <h4 className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-widest text-gray">
                    Datos
                  </h4>
                  <ul className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3">
                    <InfoRow icon={FlagIcon} label="Nacionalidad" value={prof.nationality} />
                    <InfoRow
                      icon={Cake}
                      label="Nacimiento"
                      value={
                        fmtBirth(prof.birth_date)
                          ? `${fmtBirth(prof.birth_date)}${p.age != null ? ` (${p.age} años)` : ""}`
                          : p.age != null
                          ? `${p.age} años`
                          : null
                      }
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Lugar"
                      value={
                        [prof.birth_place, prof.birth_country]
                          .filter(Boolean)
                          .join(", ") || null
                      }
                    />
                    <InfoRow icon={Ruler} label="Altura" value={prof.height} />
                    <InfoRow icon={Weight} label="Peso" value={prof.weight} />
                  </ul>
                </>
              )}

              {!prof.nationality && t.matches?.length === 0 && (
                <p className="mt-4 text-center text-[11px] text-gray/60">
                  Más datos de este jugador aparecerán a medida que juegue el torneo.
                </p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default PlayerSheet;
