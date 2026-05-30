import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Table2, Home, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { GROUPS, CONF_META, groupStandings } from "@/data/mundial2026";

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

/* Vista de equipos: 4 selecciones del grupo */
const TeamsView = ({ group }) => (
  <ul className="divide-y divide-white/[0.05]">
    {group.teams.map((t) => (
      <li key={t.code} className="flex items-center gap-3 py-2.5">
        <Flag iso2={t.iso2} name={t.name} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-light">{t.name}</p>
          <ConfDot conf={t.conf} />
        </div>
        {t.host ? (
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

/* Vista de tabla: posiciones (datos de ejemplo) */
const TableView = ({ group, index }) => {
  const rows = groupStandings(group, index);
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
        {rows.map((r, i) => {
          const qualifies = i < 2; // top 2 avanzan directo
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
                  {i + 1}
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

const GroupCard = ({ group, index, view }) => (
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
      <TableView group={group} index={index} />
    )}
  </motion.div>
);

const GruposTab = () => {
  const [view, setView] = useState("teams");

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
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-all",
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

      {/* Grilla de grupos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g, i) => (
          <GroupCard key={g.letter} group={g} index={i} view={view} />
        ))}
      </div>

      {view === "table" && (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray/60">
          <Info size={12} />
          Tabla de ejemplo · se llenará en vivo durante el Mundial.
        </p>
      )}
    </div>
  );
};

export default GruposTab;
