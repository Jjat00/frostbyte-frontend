import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { usePollaRanking, usePollaTournament } from "@/hooks/usePolla";
import GoleadoresSection from "./GoleadoresSection";

const VIEWS = [
  { id: "ranking", label: "Jugadores", icon: Trophy },
  { id: "scorers", label: "Goleadores", icon: Target },
];

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const Avatar = ({ name, src, size = 40, highlight }) => {
  if (src) {
    return (
      <img loading="lazy" decoding="async"
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={cn(
          "rounded-full object-cover",
          highlight ? "ring-2 ring-primary" : "ring-1 ring-white/15"
        )}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
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
};

/* Columna del podio */
const PodiumCol = ({ row, place, name, src }) => {
  const config = {
    1: { h: "h-32", bar: "from-primary to-secondary", text: "text-dark", crown: true },
    2: { h: "h-24", bar: "from-gray/50 to-gray/20", text: "text-light" },
    3: { h: "h-20", bar: "from-amber-600/70 to-amber-800/40", text: "text-light" },
  }[place];

  return (
    <div className="flex flex-1 flex-col items-center justify-end">
      {config.crown && <Crown className="mb-1 text-primary" size={22} />}
      <Avatar name={name} src={src} size={place === 1 ? 56 : 46} />
      <p className="mt-2 line-clamp-2 px-1 text-center text-xs font-bold leading-tight text-light">
        {name}
      </p>
      <p className="mb-2 text-[11px] font-black text-primary">{row.points} pts</p>
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

/* Encabezado: se reutiliza en todos los estados para conservar el diseno.
   Incluye el toggle Jugadores / Goleadores. */
const Header = ({ prize, view, onView }) => {
  const scorers = view === "scorers";
  return (
    <>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/20 to-secondary/20">
          {scorers ? (
            <Target className="text-primary" size={20} />
          ) : (
            <Trophy className="text-primary" size={20} />
          )}
        </div>
        <div>
          <h2 className="text-xl font-black text-light">
            {scorers ? "Goleadores del Mundial" : "Clasificación general"}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-gray">
            {scorers ? (
              <>Así va la tabla de goleadores del torneo, gol a gol.</>
            ) : prize ? (
              <>
                Compite por{" "}
                <span className="font-bold text-secondary">{prize}</span>. Así va
                la tabla de la Polla.
              </>
            ) : (
              <>Así va la tabla de la Polla.</>
            )}
          </p>
        </div>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onView(v.id)}
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
    </>
  );
};

const RankingTab = () => {
  const [view, setView] = useState("ranking");
  const customer = useCustomerAuthStore((s) => s.customer);
  const firstName =
    customer?.first_name || customer?.full_name?.split(" ")[0] || "Tú";

  const {
    data: ranking,
    isLoading: rankingLoading,
    isError: rankingError,
  } = usePollaRanking();
  const { data: tournament } = usePollaTournament();

  const prize = tournament?.prize;
  const prizeNote = tournament?.prize_note;

  // Vista de goleadores: maneja sus propios estados de carga/errores.
  if (view === "scorers") {
    return (
      <div>
        <Header prize={prize} view={view} onView={setView} />
        <GoleadoresSection />
      </div>
    );
  }

  // Estado de carga: skeleton discreto acorde al tema cyberpunk
  if (rankingLoading) {
    return (
      <div>
        <Header prize={prize} view={view} onView={setView} />
        <div className="mb-6 h-[88px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        <div className="mb-4 h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        <div className="liquid-glass overflow-hidden rounded-2xl border border-white/[0.06]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded bg-white/[0.06]" />
                <span className="h-9 w-9 animate-pulse rounded-full bg-white/[0.04]" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.03]" />
              </div>
              <span className="h-4 w-8 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de error: mensaje sobrio
  if (rankingError) {
    return (
      <div>
        <Header prize={prize} view={view} onView={setView} />
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
          <p className="text-sm font-bold text-light">
            No pudimos cargar la clasificación.
          </p>
          <p className="mt-1 text-xs text-gray">
            Inténtalo de nuevo en unos segundos.
          </p>
        </div>
      </div>
    );
  }

  // Sustituye el nombre/avatar de la fila propia por los de la sesion del cliente
  const decorateMe = (r) =>
    r && r.is_you
      ? { ...r, name: firstName, avatar: customer?.avatar_url }
      : r;

  const rows = (ranking?.ranking || []).map(decorateMe);
  const total = ranking?.total ?? rows.length;
  // La fila propia: dentro del top o, si no, ranking.me
  const me = rows.find((r) => r.is_you) || decorateMe(ranking?.me) || null;

  // Estado vacio: aun no hay participantes
  if (rows.length === 0) {
    return (
      <div>
        <Header prize={prize} view={view} onView={setView} />
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
          <Trophy className="mx-auto mb-3 text-gray/50" size={28} />
          <p className="text-sm font-bold text-light">
            La clasificación aún está vacía.
          </p>
          <p className="mt-1 text-xs text-gray">
            Sé el primero en pronosticar y aparecerás en la tabla.
          </p>
        </div>

        {prize && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-secondary/20 bg-secondary/[0.05] px-4 py-3">
            <Trophy className="shrink-0 text-secondary" size={20} />
            <div>
              <p className="text-sm font-bold text-light">
                Premio al campeón: {prize}
              </p>
              {prizeNote && <p className="text-[11px] text-gray">{prizeNote}</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const hasPodium = top3.length >= 3;

  return (
    <div>
      {/* Encabezado */}
      <Header prize={prize} view={view} onView={setView} />

      {/* Tu posicion */}
      {me ? (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-primary/30 bg-linear-to-r from-primary/10 to-secondary/5 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-lg font-black text-primary">
            {me.pos}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-primary">
              Tu posición
            </p>
            <p className="truncate font-black text-light">{me.name}</p>
            <p className="text-xs text-gray">
              Vas en el puesto {me.pos} de {total}. ¡Sigue sumando!
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tabular-nums text-light">
              {me.points}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray">pts</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/15 text-lg font-black text-gray/60">
            —
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-primary">
              Tu posición
            </p>
            <p className="truncate font-black text-light">
              Aún no tienes posición
            </p>
            <p className="text-xs text-gray">
              Haz tu primer pronóstico para entrar a la tabla.
            </p>
          </div>
        </div>
      )}

      {/* Podio: solo si hay al menos 3 filas */}
      {hasPodium && (
        <div className="mb-4 flex items-end gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <PodiumCol row={top3[1]} place={2} name={top3[1].name} src={top3[1].avatar} />
          <PodiumCol row={top3[0]} place={1} name={top3[0].name} src={top3[0].avatar} />
          <PodiumCol row={top3[2]} place={3} name={top3[2].name} src={top3[2].avatar} />
        </div>
      )}

      {/* Premio */}
      {prize && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-secondary/20 bg-secondary/[0.05] px-4 py-3">
          <Trophy className="shrink-0 text-secondary" size={20} />
          <div>
            <p className="text-sm font-bold text-light">
              Premio al campeón: {prize}
            </p>
            {prizeNote && <p className="text-[11px] text-gray">{prizeNote}</p>}
          </div>
        </div>
      )}

      {/* Tabla completa */}
      <div className="liquid-glass overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-white/[0.08] px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray/70">
          <span>Pos · Jugador</span>
          <span />
          <span>Puntos</span>
        </div>
        {rows.map((r) => (
          <motion.div
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
              <Avatar name={r.name} src={r.avatar} size={36} highlight={r.is_you} />
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
            <span className="text-lg font-black tabular-nums bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {r.points}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray/60">
        <TrendingUp size={12} />
        Se actualiza en vivo con cada partido.
      </p>
    </div>
  );
};

export default RankingTab;
