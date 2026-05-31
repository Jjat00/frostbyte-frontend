import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Table2, Home, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { CONF_META } from "@/data/mundial2026";
import { usePollaGroups, usePollaStandings } from "@/hooks/usePolla";

const VIEWS = [
  { id: "teams", label: "Equipos", icon: LayoutGrid },
  { id: "table", label: "Tabla", icon: Table2 },
];

const ConfDot = ({ conf }) => {
  const meta = CONF_META[conf];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: meta.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
};

/* Vista de equipos: selecciones del grupo */
const TeamsView = ({ group }) => (
  <ul className="divide-y divide-white/[0.05]">
    {group.teams.map((t) => (
      <li key={t.code} className="flex items-center gap-3 py-2.5">
        <Flag iso2={t.iso2} name={t.name} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-light">{t.name}</p>
          <ConfDot conf={t.confederation} />
        </div>
        {t.is_host ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
            <Home size={10} /> Sede
          </span>
        ) : (
          <span className="text-xs font-black text-gray/60">{t.code}</span>
        )}
      </li>
    ))}
  </ul>
);

/* Vista de tabla: posiciones reales de la fase de grupos */
const TableView = ({ standingGroup }) => {
  const rows = standingGroup?.rows || [];

  if (rows.length === 0) {
    return (
      <p className="py-3 text-center text-[11px] text-gray/60">
        Aún no hay posiciones para este grupo.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-gray/70">
          <th className="py-1.5 pl-1 text-left font-semibold">#</th>
          <th className="py-1.5 text-left font-semibold">Equipo</th>
          <th className="py-1.5 text-center font-semibold">PJ</th>
          <th className="py-1.5 text-center font-semibold">DG</th>
          <th className="py-1.5 pr-1 text-center font-semibold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const qualifies = r.rank <= 2; // top 2 avanzan directo
          return (
            <tr
              key={r.code}
              className={cn(
                "border-t border-white/[0.05]",
                qualifies && "bg-secondary/[0.04]"
              )}
            >
              <td className="py-2 pl-1">
                <span
                  className={cn(
                    "inline-block w-4 text-center text-xs font-black",
                    qualifies ? "text-secondary" : "text-gray/60"
                  )}
                >
                  {r.rank}
                </span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Flag iso2={r.iso2} name={r.name} size={20} />
                  <span className="text-xs font-bold text-light">{r.code}</span>
                </div>
              </td>
              <td className="py-2 text-center tabular-nums text-gray">{r.pj}</td>
              <td className="py-2 text-center tabular-nums text-gray">
                {r.dg > 0 ? `+${r.dg}` : r.dg}
              </td>
              <td className="py-2 pr-1 text-center">
                <span className="font-black tabular-nums text-light">
                  {r.pts}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const GroupCard = ({ group, index, view, standingGroup }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.025 }}
    className="liquid-glass relative overflow-hidden rounded-2xl border border-white/[0.07] p-4"
  >
    <div className="mb-2 flex items-center justify-between">
      <h3 className="flex items-center gap-2 font-black text-light">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-secondary text-sm font-black text-dark">
          {group.letter}
        </span>
        <span className="text-xs uppercase tracking-widest text-gray">
          Grupo {group.letter}
        </span>
      </h3>
    </div>
    {view === "teams" ? (
      <TeamsView group={group} />
    ) : (
      <TableView standingGroup={standingGroup} />
    )}
  </motion.div>
);

/* Placeholder de carga: tarjeta con bordes/fondo del tema cyberpunk */
const GroupCardSkeleton = () => (
  <div className="liquid-glass relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="h-7 w-7 animate-pulse rounded-lg bg-white/[0.06]" />
      <span className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="h-[30px] w-[30px] animate-pulse rounded-full bg-white/[0.06]" />
          <span className="h-3 flex-1 animate-pulse rounded bg-white/[0.06]" />
          <span className="h-3 w-8 animate-pulse rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  </div>
);

const GruposTab = () => {
  const [view, setView] = useState("teams");

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
  } = usePollaGroups();
  // Las posiciones solo se necesitan para la vista "Tabla".
  const {
    data: standings,
    isLoading: standingsLoading,
    isError: standingsError,
  } = usePollaStandings({ enabled: view === "table" });

  const groupList = groups || [];
  const standingsList = standings || [];

  // Índice por letra para emparejar cada grupo con su tabla de posiciones.
  const standingsByLetter = standingsList.reduce((acc, sg) => {
    acc[sg.letter] = sg;
    return acc;
  }, {});

  const loading =
    groupsLoading || (view === "table" && standingsLoading && groupList.length);
  const error = groupsError || (view === "table" && standingsError);

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/20 to-secondary/20">
          <LayoutGrid className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-light">Grupos del Mundial</h2>
          <p className="mt-0.5 text-sm leading-snug text-gray">
            48 selecciones, 12 grupos. Los <span className="text-secondary">2 primeros</span> de
            cada grupo avanzan (más los 8 mejores terceros).
          </p>
        </div>
      </div>

      {/* Toggle de vista */}
      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {VIEWS.map((v) => {
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

      {/* Estado de error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-5 text-sm text-gray">
          <AlertTriangle className="shrink-0 text-red-400/80" size={18} />
          No pudimos cargar los grupos. Intenta de nuevo en un momento.
        </div>
      )}

      {/* Estado de carga: skeleton de 12 tarjetas */}
      {!error && loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!error && !loading && groupList.length === 0 && (
        <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-8 text-center text-sm text-gray/70">
          Todavía no hay grupos disponibles.
        </p>
      )}

      {/* Grilla de grupos */}
      {!error && !loading && groupList.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupList.map((g, i) => (
            <GroupCard
              key={g.letter}
              group={g}
              index={i}
              view={view}
              standingGroup={standingsByLetter[g.letter]}
            />
          ))}
        </div>
      )}

      {view === "table" && !error && !loading && groupList.length > 0 && (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray/60">
          <Info size={12} />
          Posiciones en tiempo real · se actualizan con cada partido del Mundial.
        </p>
      )}
    </div>
  );
};

export default GruposTab;
