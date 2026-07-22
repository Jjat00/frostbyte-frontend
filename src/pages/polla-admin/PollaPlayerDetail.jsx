import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Target,
  Crosshair,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  Hash,
  Users,
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { usePollaAdminPlayer } from "@/hooks/usePolla";

const fmt = (n) => new Intl.NumberFormat("es-CO").format(n || 0);

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
};

const BREAKDOWN = [
  { key: "match_points", label: "Partidos", accent: "text-secondary" },
  { key: "mission_points", label: "Misiones", accent: "text-primary" },
  { key: "award_points", label: "Menciones", accent: "text-amber-300" },
  { key: "referral_points", label: "Referidos", accent: "text-emerald-300" },
];

const PollaPlayerDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePollaAdminPlayer(userId);

  const user = data?.user;
  const score = data?.score;
  const predictions = data?.predictions || [];
  const missions = data?.missions || [];
  const referral = data?.referral;

  return (
    <div className="theme-26 min-h-screen bg-dark relative overflow-hidden">
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

      <div className="relative max-w-[1000px] mx-auto p-4 md:p-6 pb-24 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/polla-admin")}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray hover:text-light hover:bg-white/[0.08] transition-colors flex-shrink-0"
            title="Volver al dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-light">Detalle del jugador</h1>
        </div>

        {isLoading ? (
          <div className="liquid-glass rounded-2xl p-8 relative text-center text-gray">
            Cargando jugador…
          </div>
        ) : isError || !user ? (
          <div className="liquid-glass rounded-2xl p-8 relative text-center text-gray">
            No se pudo cargar este jugador.
          </div>
        ) : (
          <>
            {/* ── Perfil + puntos ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative liquid-glass rounded-2xl p-5 md:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-2xl flex-shrink-0">
                    {(user.name || "?").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-light truncate">{user.name}</h2>
                    <p className="text-sm text-gray flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {user.id} · {user.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {fmtDate(user.date_joined)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="sm:ml-auto flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray mb-0.5">Posición</p>
                    <p className="text-2xl font-bold text-amber-300 flex items-center gap-1">
                      <Trophy className="w-5 h-5" /> {score?.pos || "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray mb-0.5">Puntos</p>
                    <p className="text-3xl font-bold text-secondary">{fmt(score?.points)}</p>
                  </div>
                </div>
              </div>

              {/* Desglose de puntos */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5">
                {BREAKDOWN.map((b) => (
                  <div
                    key={b.key}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
                  >
                    <p className={`text-lg font-bold ${b.accent}`}>{fmt(score?.[b.key])}</p>
                    <p className="text-[11px] text-gray mt-0.5">{b.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Stats rápidas ── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative liquid-glass rounded-2xl p-4 text-center">
                <Crosshair className="w-5 h-5 text-secondary mx-auto mb-1.5" />
                <p className="text-xl font-bold text-light">{fmt(score?.exact_hits)}</p>
                <p className="text-xs text-gray">Marcadores exactos</p>
              </div>
              <div className="relative liquid-glass rounded-2xl p-4 text-center">
                <Target className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-xl font-bold text-light">{fmt(score?.correct_hits)}</p>
                <p className="text-xs text-gray">Resultados correctos</p>
              </div>
              <div className="relative liquid-glass rounded-2xl p-4 text-center">
                <ClipboardList className="w-5 h-5 text-emerald-300 mx-auto mb-1.5" />
                <p className="text-xl font-bold text-light">{fmt(score?.predicted)}</p>
                <p className="text-xs text-gray">Pronósticos</p>
              </div>
            </div>

            {/* ── Misiones ── */}
            <section className="relative liquid-glass rounded-2xl p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <ListChecks className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-light">Misiones</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {missions.map((m) => {
                  const pct = m.target ? Math.min(100, Math.round((m.progress / m.target) * 100)) : 0;
                  return (
                    <div
                      key={m.code}
                      className={`p-3 rounded-xl border ${m.done ? "bg-secondary/[0.06] border-secondary/25" : "bg-white/[0.03] border-white/[0.06]"}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-light flex items-center gap-1.5 truncate">
                          {m.done ? (
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray/50 flex-shrink-0" />
                          )}
                          <span className="truncate">{m.title}</span>
                        </span>
                        <span className="text-xs text-gray flex-shrink-0">
                          {m.progress}/{m.target}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.done ? "bg-secondary" : "bg-gradient-to-r from-primary/60 to-secondary/60"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Referidos ── */}
            {referral && (
              <section className="relative liquid-glass rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                    <Users className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-light">Referidos</h2>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xl font-bold text-light">{fmt(referral.invited)}</p>
                    <p className="text-xs text-gray">Invitados</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-300">{fmt(referral.qualified)}</p>
                    <p className="text-xs text-gray">Calificados (ya jugaron)</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── Pronósticos ── */}
            <section className="relative liquid-glass rounded-2xl p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20">
                  <ClipboardList className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-light">
                  Pronósticos
                  <span className="text-gray font-normal text-sm ml-2">({fmt(predictions.length)})</span>
                </h2>
              </div>

              {predictions.length === 0 ? (
                <p className="text-center text-gray py-6">Este jugador aún no ha pronosticado.</p>
              ) : (
                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {predictions.map((p) => {
                    const played = p.real_home !== null && p.real_home !== undefined;
                    const badge = !p.scored
                      ? null
                      : p.is_exact
                      ? { cls: "bg-emerald-400/15 text-emerald-300", label: `+${p.points_earned}` }
                      : p.is_correct_outcome
                      ? { cls: "bg-secondary/15 text-secondary", label: `+${p.points_earned}` }
                      : { cls: "bg-white/[0.05] text-gray", label: "0" };
                    return (
                      <div
                        key={p.slug}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm"
                      >
                        <span className="text-[10px] text-gray w-12 flex-shrink-0">
                          #{p.match_number}
                        </span>
                        <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
                          <span className="text-light truncate text-right flex-1">
                            {p.home?.code || p.home?.name}
                          </span>
                          <span className="font-bold text-light whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/[0.06]">
                            {p.pred_home}-{p.pred_away}
                          </span>
                          <span className="text-light truncate flex-1">
                            {p.away?.code || p.away?.name}
                          </span>
                        </div>
                        <div className="w-16 flex-shrink-0 text-right">
                          {played ? (
                            <span className="text-xs text-gray">
                              real {p.real_home}-{p.real_away}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray/60">pendiente</span>
                          )}
                        </div>
                        {badge && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PollaPlayerDetail;
