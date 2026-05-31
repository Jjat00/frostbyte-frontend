/**
 * Previsualizaciones estáticas de las vistas reales de la Polla para la landing
 * pública (`/polla-mundial`). Replican el markup y los estilos de PartidosTab,
 * EliminacionBracket, GruposTab y RankingTab con datos de ejemplo, sin hooks ni
 * sesión. La idea es que el visitante vea EXACTAMENTE cómo se ve la app por
 * dentro antes de entrar. Si cambian las vistas reales, actualizar aquí también.
 */
import React from "react";
import { Flame, Lock, Check, Trophy, Crown, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";

/* ════════════════ 1. Tarjeta de partido + marcación de puntos ════════════════ */

const BOX =
  "h-13 w-13 rounded-2xl text-2xl font-black tabular-nums sm:h-14 sm:w-14 sm:text-3xl";

const TeamCol = ({ name, iso2 }) => (
  <div className="flex flex-col items-center gap-1.5 text-center">
    <Flag iso2={iso2} name={name} size={48} rounded="rounded-md" />
    <p className="line-clamp-2 text-xs font-bold leading-tight text-light">{name}</p>
  </div>
);

const ScoreRO = ({ value }) => (
  <div className={cn("flex items-center justify-center", BOX, "bg-white/[0.06] text-light")}>
    {value}
  </div>
);

const ScoreFilled = ({ value }) => (
  <div
    className={cn(
      "flex items-center justify-center",
      BOX,
      "bg-linear-to-br from-primary to-secondary text-dark"
    )}
  >
    {value}
  </div>
);

const PointsBadge = ({ kind }) => {
  if (kind === "exact")
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-linear-to-r from-primary to-secondary px-2 py-0.5 text-[10px] font-bold text-dark">
        <Flame size={10} />+3
      </span>
    );
  if (kind === "outcome")
    return (
      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
        +1
      </span>
    );
  return (
    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-gray">
      +0
    </span>
  );
};

/* Partido próximo: cajas de marcador (cómo se pronostica) — Grupo A real */
const UpcomingRow = () => (
  <div className="relative px-2 py-4">
    <p className="mb-3 text-center text-[11px] text-gray">
      Grupo A · Jornada 1 · <span className="text-light/80">2:00 PM</span>
    </p>
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
      <TeamCol name="México" iso2="mx" />
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex items-center gap-2">
          <ScoreFilled value="2" />
          <span className="text-[11px] font-bold text-gray">VS</span>
          <ScoreFilled value="0" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray/70">
          Estadísticas <Lock size={10} />
        </span>
      </div>
      <TeamCol name="Sudáfrica" iso2="za" />
    </div>
  </div>
);

/* Partido finalizado: marcador real + tu pronóstico + puntos ganados */
const FinishedRow = ({ home, away, hs, as, mine, kind, group, jornada, time }) => (
  <div className="relative px-2 py-4">
    <p className="mb-3 text-center text-[11px] text-gray">
      {group} · {jornada} · <span className="text-light/80">{time}</span>
    </p>
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
      <TeamCol name={home.name} iso2={home.iso2} />
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex items-center gap-2">
          <ScoreRO value={hs} />
          <span className="text-sm font-black text-gray">-</span>
          <ScoreRO value={as} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray">
            Tu: <b className="text-light">{mine}</b>
          </span>
          <PointsBadge kind={kind} />
        </div>
      </div>
      <TeamCol name={away.name} iso2={away.iso2} />
    </div>
  </div>
);

export const MatchCardPreview = () => (
  <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <span className="text-xs font-bold uppercase tracking-widest text-gray">
        Grupo A · Mundial 2026
      </span>
      <span className="rounded-md border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
        3/3 pronósticos
      </span>
    </div>
    <div className="divide-y divide-white/[0.05]">
      <UpcomingRow />
      <FinishedRow
        group="Grupo A"
        jornada="Jornada 1"
        time="9:00 PM"
        home={{ name: "Corea del Sur", iso2: "kr" }}
        away={{ name: "Rep. Checa", iso2: "cz" }}
        hs="1"
        as="2"
        mine="1-2"
        kind="exact"
      />
      <FinishedRow
        group="Grupo A"
        jornada="Jornada 2"
        time="8:00 PM"
        home={{ name: "México", iso2: "mx" }}
        away={{ name: "Corea del Sur", iso2: "kr" }}
        hs="2"
        as="1"
        mine="1-0"
        kind="outcome"
      />
    </div>
  </div>
);

/* ════════════════════════ 2. Gráfico del bracket ════════════════════════ */

const Pick = ({ name, iso2, score, selected }) => (
  <div className="flex items-center gap-2">
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-1.5 text-left",
        selected ? "border-secondary/60 bg-secondary/10" : "border-white/[0.08]"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-secondary bg-secondary text-dark" : "border-white/25"
        )}
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
      <Flag iso2={iso2} name={name} size={24} rounded="rounded" />
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-light">{name}</span>
    </div>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-base font-black tabular-nums text-light">
      {score}
    </span>
  </div>
);

const Cross = ({ stadium, date, a, b }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-dark-secondary/40 p-3">
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray">
        {stadium}
      </p>
      <span className="shrink-0 text-[10px] font-semibold text-primary/80">{date}</span>
    </div>
    <div className="space-y-1.5">
      <Pick {...a} />
      <Pick {...b} />
    </div>
    <div className="mt-2 flex min-h-[18px] items-center justify-between gap-2">
      <span className="text-[10px] text-gray/50">Toca quién avanza</span>
      <span className="shrink-0 text-[10px] font-bold text-gray/40">+{a.roundPts} pts</span>
    </div>
  </div>
);

const BRACKET_COLS = [
  {
    label: "Octavos",
    points: 4,
    matches: [
      {
        stadium: "Azteca",
        date: "4 jul",
        a: { name: "Argentina", iso2: "ar", score: "2", selected: true, roundPts: 4 },
        b: { name: "Croacia", iso2: "hr", score: "1", roundPts: 4 },
      },
      {
        stadium: "MetLife",
        date: "5 jul",
        a: { name: "Brasil", iso2: "br", score: "3", selected: true, roundPts: 4 },
        b: { name: "Uruguay", iso2: "uy", score: "1", roundPts: 4 },
      },
    ],
  },
  {
    label: "Cuartos",
    points: 7,
    matches: [
      {
        stadium: "SoFi",
        date: "9 jul",
        a: { name: "Argentina", iso2: "ar", score: "2", selected: true, roundPts: 7 },
        b: { name: "Brasil", iso2: "br", score: "0", roundPts: 7 },
      },
    ],
  },
  {
    label: "Semifinal",
    points: 12,
    matches: [
      {
        stadium: "AT&T",
        date: "14 jul",
        a: { name: "Argentina", iso2: "ar", score: "1", selected: true, roundPts: 12 },
        b: { name: "Francia", iso2: "fr", score: "0", roundPts: 12 },
      },
    ],
  },
  {
    label: "Final",
    points: 20,
    matches: [
      {
        stadium: "MetLife",
        date: "19 jul",
        a: { name: "Argentina", iso2: "ar", score: "2", selected: true, roundPts: 20 },
        b: { name: "España", iso2: "es", score: "1", roundPts: 20 },
      },
    ],
  },
];

export const BracketPreview = () => (
  <div className="mx-auto max-w-5xl">
    <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-3 [scrollbar-width:thin]">
      {BRACKET_COLS.map((col) => (
        <section key={col.label} className="w-[280px] shrink-0 snap-start sm:w-[260px]">
          <div className="mb-2 flex items-center justify-between rounded-xl border border-white/[0.08] bg-dark/80 px-3 py-2">
            <span className="text-xs font-black uppercase tracking-wider text-light">
              {col.label}
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              +{col.points} pts
            </span>
          </div>
          <div className="space-y-3">
            {col.matches.map((m, i) => (
              <Cross key={i} {...m} />
            ))}
          </div>
        </section>
      ))}
    </div>

    {/* Banner del campeón */}
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/[0.08] to-secondary/[0.08] p-5 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-dark">
        <Trophy size={24} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray">
        Tu campeón del Mundial 2026
      </p>
      <div className="mt-2 flex flex-col items-center gap-1.5">
        <Flag iso2="ar" name="Argentina" size={56} className="ring-2 ring-primary/50" />
        <p className="text-lg font-black text-light">Argentina</p>
      </div>
    </div>
  </div>
);

/* ════════════════════════ 3. Tablas de grupos ════════════════════════ */

const GROUPS = [
  {
    letter: "A",
    rows: [
      { rank: 1, code: "MEX", iso2: "mx", pj: 3, dg: 4, pts: 9 },
      { rank: 2, code: "CZE", iso2: "cz", pj: 3, dg: 1, pts: 4 },
      { rank: 3, code: "KOR", iso2: "kr", pj: 3, dg: -1, pts: 4 },
      { rank: 4, code: "RSA", iso2: "za", pj: 3, dg: -4, pts: 0 },
    ],
  },
  {
    letter: "C",
    rows: [
      { rank: 1, code: "BRA", iso2: "br", pj: 3, dg: 6, pts: 9 },
      { rank: 2, code: "MAR", iso2: "ma", pj: 3, dg: 2, pts: 6 },
      { rank: 3, code: "SCO", iso2: "gb-sct", pj: 3, dg: -3, pts: 3 },
      { rank: 4, code: "HAI", iso2: "ht", pj: 3, dg: -5, pts: 0 },
    ],
  },
  {
    letter: "J",
    rows: [
      { rank: 1, code: "ARG", iso2: "ar", pj: 3, dg: 5, pts: 9 },
      { rank: 2, code: "AUT", iso2: "at", pj: 3, dg: 1, pts: 4 },
      { rank: 3, code: "ALG", iso2: "dz", pj: 3, dg: -2, pts: 3 },
      { rank: 4, code: "JOR", iso2: "jo", pj: 3, dg: -4, pts: 1 },
    ],
  },
  {
    letter: "K",
    rows: [
      { rank: 1, code: "COL", iso2: "co", pj: 3, dg: 4, pts: 7 },
      { rank: 2, code: "POR", iso2: "pt", pj: 3, dg: 3, pts: 7 },
      { rank: 3, code: "COD", iso2: "cd", pj: 3, dg: -3, pts: 3 },
      { rank: 4, code: "UZB", iso2: "uz", pj: 3, dg: -4, pts: 0 },
    ],
  },
];

const GroupCard = ({ group }) => (
  <div className="liquid-glass relative overflow-hidden rounded-2xl border border-white/[0.07] p-4">
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
        {group.rows.map((r) => {
          const qualifies = r.rank <= 2;
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
                  <Flag iso2={r.iso2} name={r.code} size={20} />
                  <span className="text-xs font-bold text-light">{r.code}</span>
                </div>
              </td>
              <td className="py-2 text-center tabular-nums text-gray">{r.pj}</td>
              <td className="py-2 text-center tabular-nums text-gray">
                {r.dg > 0 ? `+${r.dg}` : r.dg}
              </td>
              <td className="py-2 pr-1 text-center">
                <span className="font-black tabular-nums text-light">{r.pts}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const GroupTablePreview = () => (
  <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
    {GROUPS.map((g) => (
      <GroupCard key={g.letter} group={g} />
    ))}
  </div>
);

/* ════════════════════════ 4. Clasificación (ranking) ════════════════════════ */

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const Avatar = ({ name, size = 36, highlight }) => (
  <span
    className={cn(
      "flex items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary font-black text-dark",
      highlight && "ring-2 ring-primary ring-offset-2 ring-offset-dark"
    )}
    style={{ width: size, height: size, fontSize: size * 0.36 }}
  >
    {initials(name)}
  </span>
);

const PodiumCol = ({ place, name, points }) => {
  const config = {
    1: { h: "h-32", bar: "from-primary to-secondary", text: "text-dark", crown: true },
    2: { h: "h-24", bar: "from-gray/50 to-gray/20", text: "text-light" },
    3: { h: "h-20", bar: "from-amber-600/70 to-amber-800/40", text: "text-light" },
  }[place];
  return (
    <div className="flex flex-1 flex-col items-center justify-end">
      {config.crown && <Crown className="mb-1 text-primary" size={22} />}
      <Avatar name={name} size={place === 1 ? 56 : 46} />
      <p className="mt-2 line-clamp-2 px-1 text-center text-xs font-bold leading-tight text-light">
        {name}
      </p>
      <p className="mb-2 text-[11px] font-black text-primary">{points} pts</p>
      <div
        className={cn(
          "flex w-full items-start justify-center rounded-t-xl bg-linear-to-b pt-2",
          config.h,
          config.bar
        )}
      >
        <span className={cn("text-2xl font-black", config.text)}>{place}</span>
      </div>
    </div>
  );
};

const RANK_ROWS = [
  { pos: 1, name: "Mariana", points: 27, exact: 7 },
  { pos: 2, name: "Juan David", points: 23, exact: 5 },
  { pos: 3, name: "Ana", points: 19, exact: 4 },
  { pos: 4, name: "Tú", points: 18, exact: 4, is_you: true },
  { pos: 5, name: "Camilo", points: 14, exact: 3 },
];

export const RankingPreview = () => {
  const top3 = RANK_ROWS.slice(0, 3);
  const me = RANK_ROWS.find((r) => r.is_you);
  return (
    <div className="mx-auto max-w-xl">
      {/* Tu posición */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-primary/30 bg-linear-to-r from-primary/10 to-secondary/5 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-lg font-black text-primary">
          {me.pos}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-primary">Tu posición</p>
          <p className="truncate font-black text-light">{me.name}</p>
          <p className="text-xs text-gray">
            Vas en el puesto {me.pos} de 128. ¡Sigue sumando!
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums text-light">{me.points}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray">pts</p>
        </div>
      </div>

      {/* Podio */}
      <div className="mb-4 flex items-end gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <PodiumCol place={2} name={top3[1].name} points={top3[1].points} />
        <PodiumCol place={1} name={top3[0].name} points={top3[0].points} />
        <PodiumCol place={3} name={top3[2].name} points={top3[2].points} />
      </div>

      {/* Tabla */}
      <div className="liquid-glass overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-white/[0.08] px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray/70">
          <span>Pos · Jugador</span>
          <span />
          <span>Puntos</span>
        </div>
        {RANK_ROWS.map((r) => (
          <div
            key={r.pos}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0",
              r.is_you && "bg-primary/[0.07]"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-5 text-center text-sm font-black tabular-nums",
                  r.pos <= 3 ? "text-primary" : "text-gray/60"
                )}
              >
                {r.pos}
              </span>
              <Avatar name={r.name} size={36} highlight={r.is_you} />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-bold",
                  r.is_you ? "text-primary" : "text-light"
                )}
              >
                {r.name}
                {r.is_you && (
                  <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary">
                    tú
                  </span>
                )}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-gray">
                <Target size={11} /> {r.exact} exactos
              </p>
            </div>
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-lg font-black tabular-nums text-transparent">
              {r.points}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray/60">
        <TrendingUp size={12} />
        Se actualiza en vivo con cada partido.
      </p>
    </div>
  );
};
