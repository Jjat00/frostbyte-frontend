import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Home, Radio, Shield, Users, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaTeam } from "@/hooks/usePolla";
import { CONF_META, FORM_COLOR, matchDayLabel, matchTime } from "@/data/mundial2026";

/**
 * Bottom sheet con la ficha de una selección: posición en su grupo, forma
 * reciente, sus partidos y la plantilla completa. Se abre al tocar un equipo
 * en la pestaña de Grupos. Portal a <body> (mismo motivo que PickerSheet).
 */

const FormDots = ({ form }) => {
  const dots = Array.isArray(form) ? form : [];
  if (!dots.length) {
    return <span className="text-[10px] text-gray/60">Sin partidos aún</span>;
  }
  return (
    <span className="inline-flex items-center gap-1">
      {dots.map((r, i) => (
        <span key={i} className={cn("h-2 w-2 rounded-full", FORM_COLOR[r])} />
      ))}
    </span>
  );
};

const StatChip = ({ label, value }) => (
  <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-2">
    <span className="text-lg font-black tabular-nums text-light">{value}</span>
    <span className="text-[9px] uppercase tracking-widest text-gray/70">{label}</span>
  </div>
);

/* Partido del equipo, desde su perspectiva (vs rival, con color del resultado) */
const TeamMatchRow = ({ m, teamCode }) => {
  const isHome = m.home.code === teamCode;
  const rival = isHome ? m.away : m.home;
  const gf = isHome ? m.home_score : m.away_score;
  const gc = isHome ? m.away_score : m.home_score;
  const played = m.status !== "upcoming" && gf != null && gc != null;
  const tone = !played
    ? "text-light"
    : gf > gc
    ? "text-emerald-400"
    : gf < gc
    ? "text-red-400"
    : "text-gray";

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Flag iso2={rival.iso2} name={rival.name} size={26} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-light">vs {rival.name}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray/70">
          {m.group ? `Grupo ${m.group}` : m.stage_display}
          {" · "}
          {matchDayLabel(m.kickoff)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {m.status === "live" && (
          <span className="mb-0.5 flex items-center justify-end gap-1 text-[9px] font-bold uppercase text-red-400">
            <Radio size={8} className="animate-pulse" />
            {m.minute != null ? `${m.minute}'` : "Vivo"}
          </span>
        )}
        {played || m.status === "live" ? (
          <span className={cn("text-sm font-black tabular-nums", tone)}>
            {gf ?? 0} - {gc ?? 0}
          </span>
        ) : (
          <span className="text-xs tabular-nums text-gray">{matchTime(m.kickoff)}</span>
        )}
      </div>
    </li>
  );
};

const SectionTitle = ({ icon: Icon, children }) => (
  <h4 className="mb-2 mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray">
    <Icon size={13} className="text-primary" />
    {children}
  </h4>
);

const SheetSkeleton = () => (
  <div className="animate-pulse space-y-4 p-5">
    <div className="flex items-center gap-3">
      <span className="h-12 w-16 rounded-md bg-white/[0.06]" />
      <span className="h-4 w-32 rounded bg-white/[0.06]" />
    </div>
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-14 rounded-xl bg-white/[0.04]" />
      ))}
    </div>
    <div className="h-32 rounded-2xl bg-white/[0.04]" />
  </div>
);

const TeamSheet = ({ code, onClose }) => {
  const { data, isLoading } = usePollaTeam(code);

  const team = data?.team;
  const conf = team ? CONF_META[team.confederation] : null;
  const keepers = (data?.players || []).filter((p) => p.is_keeper);
  const field = (data?.players || []).filter((p) => !p.is_keeper);

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
        {isLoading || !team ? (
          <SheetSkeleton />
        ) : (
          <>
            {/* Cabecera */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] p-4">
              <Flag iso2={team.iso2} name={team.name} size={44} rounded="rounded-md" />
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-2 font-black text-light">
                  {team.name}
                  {team.is_host && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      <Home size={9} /> Sede
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray">
                  {team.group ? `Grupo ${team.group}` : "Sin grupo"}
                  {conf && (
                    <span className="ml-1.5" style={{ color: conf.color }}>
                      · {conf.label}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 rounded-full p-2 text-gray transition-colors hover:bg-white/10 hover:text-light"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto overscroll-contain p-5 pt-4">
              {/* Posición en el grupo + forma */}
              {data.standing && (
                <div className="grid grid-cols-4 gap-2">
                  <StatChip label="Puesto" value={`${data.standing.rank}°`} />
                  <StatChip label="PJ" value={data.standing.pj} />
                  <StatChip
                    label="DG"
                    value={data.standing.dg > 0 ? `+${data.standing.dg}` : data.standing.dg}
                  />
                  <StatChip label="Pts" value={data.standing.pts} />
                </div>
              )}
              <p className="mt-3 flex items-center justify-between text-xs text-gray">
                <span className="uppercase tracking-widest text-gray/70">
                  Forma reciente
                </span>
                <FormDots form={team.recent_form} />
              </p>

              {/* Partidos del equipo */}
              {data.matches?.length > 0 && (
                <>
                  <SectionTitle icon={CalendarDays}>Sus partidos</SectionTitle>
                  <ul className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3">
                    {data.matches.map((m) => (
                      <TeamMatchRow key={m.slug} m={m} teamCode={team.code} />
                    ))}
                  </ul>
                </>
              )}

              {/* Plantilla */}
              {keepers.length > 0 && (
                <>
                  <SectionTitle icon={Shield}>Arqueros</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {keepers.map((p) => (
                      <span
                        key={p.id}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-light"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {field.length > 0 && (
                <>
                  <SectionTitle icon={Users}>Jugadores</SectionTitle>
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {field.map((p) => (
                      <span
                        key={p.id}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-light/90"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default TeamSheet;
