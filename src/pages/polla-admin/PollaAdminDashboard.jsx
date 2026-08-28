import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Activity,
  Crown,
  Target,
  Search,
  ChevronRight,
  Home,
  RefreshCw,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import {
  usePollaAdminOverview,
  usePollaAdminPlayers,
} from "@/hooks/usePolla";
import MencionesAdminSection from "./MencionesAdminSection";
import { matchesSearch } from "@/lib/search";

const fmt = (n) => new Intl.NumberFormat("es-CO").format(n || 0);

// ── Tarjeta KPI ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, subtitle, accent = "secondary", delay = 0 }) => {
  const palettes = {
    secondary: { border: "border-secondary/30", icon: "text-secondary drop-shadow-[0_0_10px_rgba(242,197,61,0.6)]", bg: "from-secondary/15 to-secondary/5", glow: "hover:shadow-[0_0_30px_rgba(242,197,61,0.2)]" },
    primary: { border: "border-primary/30", icon: "text-primary drop-shadow-[0_0_10px_rgba(30,158,90,0.6)]", bg: "from-primary/15 to-primary/5", glow: "hover:shadow-[0_0_30px_rgba(30,158,90,0.2)]" },
    gold: { border: "border-amber-400/30", icon: "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]", bg: "from-amber-400/15 to-amber-400/5", glow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]" },
    green: { border: "border-emerald-400/30", icon: "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]", bg: "from-emerald-400/15 to-emerald-400/5", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]" },
  };
  const c = palettes[accent] || palettes.secondary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-4 md:p-5 transition-all duration-500 ${c.glow}`}
    >
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,rgba(242,197,61,0.3)_1px,transparent_1px),linear-gradient(rgba(30,158,90,0.3)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray text-xs md:text-sm font-medium">{label}</p>
          <div className="p-2 rounded-xl bg-dark/50 border border-gray/10 flex-shrink-0">
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${c.icon}`} />
          </div>
        </div>
        <p className="text-[clamp(1.25rem,4vw,2rem)] font-bold text-light leading-none">{value}</p>
        {subtitle && <p className="text-xs text-gray mt-1.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

// ── Avatar con inicial ────────────────────────────────────────────────────────
const Avatar = ({ name, size = "w-10 h-10" }) => (
  <div className={`${size} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold flex-shrink-0`}>
    {(name || "?").trim().charAt(0).toUpperCase()}
  </div>
);

// ── Medalla de posición ───────────────────────────────────────────────────────
const PosBadge = ({ pos }) => {
  const styles = {
    1: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    2: "bg-gray-300/20 text-gray-200 border-gray-300/40",
    3: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  };
  const cls = styles[pos] || "bg-white/[0.05] text-gray border-white/10";
  return (
    <span className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-bold ${cls}`}>
      {pos}
    </span>
  );
};

const PlayerRowSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse">
    <div className="w-8 h-8 bg-gray/15 rounded-lg" />
    <div className="w-10 h-10 bg-gray/15 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray/20 rounded w-32" />
      <div className="h-2.5 bg-gray/10 rounded w-44" />
    </div>
    <div className="h-5 bg-gray/15 rounded w-12" />
  </div>
);

const PollaAdminDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: overview, isLoading: loadingOverview } = usePollaAdminOverview();
  const {
    data: playersData,
    isLoading: loadingPlayers,
    isFetching,
    refetch,
  } = usePollaAdminPlayers("");

  const players = playersData?.players || [];
  const totalPlayers = overview?.players?.total ?? players.length;

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    return players.filter((p) => matchesSearch(search, p.name, p.email));
  }, [players, search]);

  return (
    <div className="theme-26 min-h-screen bg-dark relative overflow-hidden">
      {/* Fondo de grilla sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(30,158,90,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(242,197,61,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-[1200px] mx-auto p-4 md:p-6 pb-24 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/home")}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray hover:text-light hover:bg-white/[0.08] transition-colors flex-shrink-0"
              title="Volver al inicio"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-light flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex-shrink-0">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <span className="truncate">Dashboard Polla</span>
              </h1>
              <p className="text-xs md:text-sm text-gray mt-1 ml-12">
                Seguimiento de jugadores del Mundial 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray hover:text-secondary hover:bg-white/[0.08] transition-colors flex-shrink-0"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users}
            label="Jugadores"
            value={loadingOverview ? "…" : fmt(overview?.players?.total)}
            subtitle={`${fmt(overview?.players?.active)} activos · ${fmt(overview?.players?.inactive)} sin jugar`}
            accent="secondary"
            delay={0}
          />
          <StatCard
            icon={Activity}
            label="Pronósticos"
            value={loadingOverview ? "…" : fmt(overview?.predictions?.total)}
            subtitle={`${fmt(overview?.predictions?.exact)} exactos · ${fmt(overview?.predictions?.correct)} aciertos`}
            accent="primary"
            delay={0.05}
          />
          <StatCard
            icon={Target}
            label="Promedio pts"
            value={loadingOverview ? "…" : fmt(overview?.points?.avg)}
            subtitle={`${fmt(overview?.matches?.finished)}/${fmt(overview?.matches?.total)} partidos jugados`}
            accent="green"
            delay={0.1}
          />
          <StatCard
            icon={Crown}
            label="Líder"
            value={loadingOverview ? "…" : `${fmt(overview?.points?.max)} pts`}
            subtitle={players[0]?.name || "—"}
            accent="gold"
            delay={0.15}
          />
        </div>

        {/* ── Avance de misiones ── */}
        <section className="relative liquid-glass rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-light">Avance de misiones</h2>
              <p className="text-xs text-gray">Cuántos jugadores completaron cada misión</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(overview?.missions || []).map((m) => {
              const pct = totalPlayers ? Math.round((m.done / totalPlayers) * 100) : 0;
              return (
                <div
                  key={m.code}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-light truncate">{m.title}</span>
                    <span className="text-xs text-gray flex-shrink-0">
                      {m.bonus_points > 0 ? `+${m.bonus_points} pts` : "Insignia"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    {fmt(m.done)} de {fmt(totalPlayers)} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Menciones del torneo ── */}
        <MencionesAdminSection />

        {/* ── Buscador ── */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador por nombre o correo…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-light placeholder:text-gray/70 focus:outline-none focus:border-secondary/50 transition-colors"
          />
        </div>

        {/* ── Lista de jugadores ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base md:text-lg font-bold text-light">
              Jugadores
              <span className="text-gray font-normal text-sm ml-2">
                {loadingPlayers ? "" : `(${fmt(filtered.length)})`}
              </span>
            </h2>
          </div>

          {loadingPlayers ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <PlayerRowSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray py-12 liquid-glass rounded-2xl relative">
              No se encontraron jugadores.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p, idx) => (
                <motion.button
                  key={p.user_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.3) }}
                  onClick={() => navigate(`/polla-admin/jugador/${p.user_id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-secondary/30 transition-all text-left group"
                >
                  <PosBadge pos={p.pos} />
                  <Avatar name={p.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-light truncate">{p.name}</p>
                    <p className="text-xs text-gray truncate">{p.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-gray">
                        {fmt(p.predicted)} pron.
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-gray">
                        {fmt(p.exact_hits)} exactos
                      </span>
                      {p.referral_points > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-400/10 text-emerald-300">
                          +{fmt(p.referral_points)} ref.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-secondary leading-none">{fmt(p.points)}</p>
                    <p className="text-[10px] text-gray mt-0.5">pts</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray group-hover:text-secondary transition-colors flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PollaAdminDashboard;
