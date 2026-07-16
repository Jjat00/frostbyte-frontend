import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Target,
  Star,
  Hand,
  Sparkles,
  Search,
  X,
  Check,
  Loader2,
  Trash2,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import Flag from "@/components/polla/Flag";
import { usePollaAdminAwards, useResolveAward } from "@/hooks/usePolla";

const AWARD_ICONS = {
  champion: Trophy,
  runnerup: Medal,
  scorer: Target,
  mvp: Star,
  glove: Hand,
};

// Las que se resuelven solas al terminar la final; el resto (MVP, guante) las
// anuncia la FIFA y hay que marcarlas a mano.
const AUTO_CODES = new Set(["champion", "runnerup", "scorer"]);

const optionsFor = (options, type) =>
  type === "team"
    ? options?.team || []
    : type === "keeper"
    ? options?.keeper || []
    : options?.player || [];

/* ── Modal para elegir el ganador de una mención ── */
const ResolveSheet = ({ award, options, onClose, onResolve, isPending }) => {
  const [q, setQ] = useState("");
  const Icon = AWARD_ICONS[award.code] || Star;
  const isTeam = award.type === "team";
  const opts = optionsFor(options, award.type);
  const filtered = q
    ? opts.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
    : opts;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
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
        className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-dark-secondary sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-dark">
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-light">Resolver: {award.title}</h3>
            <p className="truncate text-xs text-gray">
              Elige al ganador · vale {award.points} pts
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-gray transition-colors hover:bg-white/10 hover:text-light"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-white/[0.06] p-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
            <Search size={15} className="shrink-0 text-gray" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isTeam ? "Buscar selección..." : "Buscar jugador..."}
              className="w-full bg-transparent py-2.5 text-sm text-light placeholder:text-gray/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto p-2">
          {filtered.length ? (
            filtered.map((o) => {
              const optKey = isTeam ? o.code : o.id;
              const optCode = isTeam ? o.code : o.team_code;
              return (
                <button
                  key={optKey}
                  onClick={() =>
                    onResolve(isTeam ? { team_code: o.code } : { player_id: o.id })
                  }
                  disabled={isPending}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <Flag iso2={o.iso2} name={o.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-light">{o.name}</p>
                  </div>
                  <span className="text-xs font-black text-gray/60">{optCode}</span>
                </button>
              );
            })
          ) : (
            <p className="py-10 text-center text-sm text-gray">Sin resultados.</p>
          )}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/40 backdrop-blur-[1px]">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

/* ── Tarjeta de una mención en el panel de staff ── */
const AwardAdminCard = ({ award, onResolve, onClear, clearing }) => {
  const Icon = AWARD_ICONS[award.code] || Star;
  const result = award.result;
  const isAuto = AUTO_CODES.has(award.code);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-light">{award.title}</p>
          <p className="text-[11px] text-gray">{award.points} pts</p>
        </div>
        {award.resolved && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            <CheckCircle2 size={11} /> Resuelta
          </span>
        )}
      </div>

      {award.resolved && result ? (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <Flag iso2={result.iso2} name={result.name} size={26} />
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-secondary">
            {result.name}
          </span>
          <button
            onClick={onResolve}
            className="rounded-lg p-1.5 text-gray transition-colors hover:bg-white/10 hover:text-light"
            title="Cambiar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onClear}
            disabled={clearing}
            className="rounded-lg p-1.5 text-gray transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
            title="Quitar (dejar sin resolver)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-2.5">
          <p className="mb-2 text-[11px] leading-snug text-gray">
            {isAuto
              ? "Se resuelve sola al terminar la final; también puedes marcarla aquí."
              : "La anuncia la FIFA tras la final — márcala a mano."}
          </p>
          <button
            onClick={onResolve}
            className="w-full rounded-lg border border-primary/40 bg-primary/[0.06] py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/[0.12]"
          >
            Resolver
          </button>
        </div>
      )}
    </div>
  );
};

const MencionesAdminSection = () => {
  const { data, isLoading } = usePollaAdminAwards();
  const resolveAward = useResolveAward();
  const [active, setActive] = useState(null);

  const awards = data?.awards || [];
  const options = data?.options || { team: [], player: [], keeper: [] };

  const handleResolve = (payload) => {
    if (!active) return;
    resolveAward.mutate(
      { code: active.code, ...payload },
      { onSuccess: () => setActive(null) }
    );
  };

  const handleClear = (code) => {
    resolveAward.mutate({ code, clear: true });
  };

  return (
    <section className="relative liquid-glass rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <h2 className="text-base font-bold text-light md:text-lg">Menciones del torneo</h2>
          <p className="text-xs text-gray">
            Resuelve campeón, subcampeón, goleador, MVP y guante de oro
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {awards.map((a) => (
            <AwardAdminCard
              key={a.code}
              award={a}
              onResolve={() => setActive(a)}
              onClear={() => handleClear(a.code)}
              clearing={resolveAward.isPending}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <ResolveSheet
            award={active}
            options={options}
            onClose={() => setActive(null)}
            onResolve={handleResolve}
            isPending={resolveAward.isPending}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default MencionesAdminSection;
