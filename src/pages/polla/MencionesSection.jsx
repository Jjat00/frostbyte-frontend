import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Target,
  Star,
  Hand,
  Sparkles,
  ChevronDown,
  Plus,
  Check,
  X,
  Search,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaAwards, useSaveAwardPick } from "@/hooks/usePolla";

const AWARD_ICONS = {
  champion: Trophy,
  runnerup: Medal,
  scorer: Target,
  mvp: Star,
  glove: Hand,
};

/* Lista de opciones segun el tipo de mencion */
const optionsFor = (options, type) =>
  type === "team"
    ? options?.team || []
    : type === "keeper"
    ? options?.keeper || []
    : options?.player || [];

/* ── Hoja de seleccion (modal bottom-sheet mobile) ── */
const PickerSheet = ({ award, options, onClose, onPick, isPending }) => {
  const [q, setQ] = useState("");
  const Icon = AWARD_ICONS[award.code] || Star;
  const isTeam = award.type === "team";
  const opts = optionsFor(options, award.type);
  const filtered = q
    ? opts.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
    : opts;

  return (
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
        className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-dark-secondary sm:rounded-3xl"
      >
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-dark">
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-light">{award.title}</h3>
            <p className="truncate text-xs text-gray">
              {award.hint} · vale {award.points} pts
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

        {/* Buscador */}
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

        {/* Lista */}
        <div className="relative flex-1 overflow-y-auto p-2">
          {filtered.length ? (
            filtered.map((o) => {
              // team opt: {code,name,iso2}; player/keeper opt: {id,name,team_code,iso2}
              const optKey = isTeam ? o.code : o.id;
              const optCode = isTeam ? o.code : o.team_code;
              return (
                <button
                  key={optKey}
                  onClick={() => onPick(o)}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <Flag iso2={o.iso2} name={o.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-light">
                      {o.name}
                    </p>
                  </div>
                  <span className="text-xs font-black text-gray/60">
                    {optCode}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="py-10 text-center text-sm text-gray">Sin resultados.</p>
          )}

          {/* Overlay mientras se guarda la eleccion */}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/40 backdrop-blur-[1px]">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Tarjeta de una mencion ── */
const AwardCard = ({ award, onOpen }) => {
  const Icon = AWARD_ICONS[award.code] || Star;
  const pick = award.my_pick;
  const chosen = Boolean(pick);
  return (
    <button
      onClick={onOpen}
      className={cn(
        "liquid-glass-interactive relative flex w-full flex-col items-center gap-2 rounded-2xl border p-2.5 sm:p-3 text-center transition-all",
        chosen
          ? "border-secondary/40 bg-secondary/[0.04]"
          : "border-white/[0.07] hover:border-primary/40"
      )}
    >
      {award.resolved && (
        <span className="absolute right-1.5 top-1.5 text-gray/60">
          <Lock size={11} />
        </span>
      )}

      {chosen ? (
        <div className="relative">
          <Flag
            iso2={pick.iso2}
            name={pick.name}
            size={44}
            className="ring-2 ring-secondary/50"
          />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-dark">
            <Check size={12} strokeWidth={3} />
          </span>
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/15 to-secondary/15 text-primary">
          <Icon size={22} />
        </div>
      )}

      <div className="w-full">
        {chosen ? (
          <p className="truncate text-[11px] font-bold text-secondary">
            {pick.name}
          </p>
        ) : (
          <p className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <Plus size={10} /> Elegir
          </p>
        )}
        <p className="mt-0.5 text-xs font-black leading-tight text-light">
          {award.title}
        </p>
        <p className="bg-linear-to-r from-primary to-secondary bg-clip-text text-sm font-black tabular-nums text-transparent">
          {award.points} pts
        </p>
      </div>
    </button>
  );
};

/* ── Esqueleto de carga (5 tarjetas: 3 + 2) ── */
const AwardCardSkeleton = () => (
  <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5 sm:p-3">
    <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/[0.06]" />
    <div className="mt-0.5 h-2.5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
    <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
  </div>
);

const MencionesSection = () => {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(null);

  const { data, isLoading, isError } = usePollaAwards();
  const saveAwardPick = useSaveAwardPick();

  const awards = data?.awards || [];
  const options = data?.options || { team: [], player: [], keeper: [] };

  const chosen = awards.filter((a) => a.my_pick).length;
  const total = awards.length;
  const firstRow = awards.slice(0, 3);
  const secondRow = awards.slice(3);

  const handlePick = (opt) => {
    if (!active) return;
    const payload =
      active.type === "team"
        ? { code: active.code, team_code: opt.code }
        : { code: active.code, player_id: opt.id };
    saveAwardPick.mutate(payload, {
      onSuccess: () => setActive(null),
    });
  };

  return (
    <div className="mb-6">
      {/* Cabecera plegable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="font-black text-light">Menciones</span>
        </span>
        <span className="flex items-center gap-2">
          {!isLoading && !isError && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {chosen}/{total} pronósticos
            </span>
          )}
          <ChevronDown
            size={18}
            className={cn(
              "text-gray transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-1 pb-3 pt-3 text-xs leading-snug text-gray">
              Pronósticos de todo el torneo. Se eligen una sola vez y valen más
              puntos que un partido.
            </p>

            {isLoading ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <AwardCardSkeleton key={i} />
                  ))}
                </div>
                <div className="mx-auto grid w-2/3 grid-cols-2 gap-2 sm:gap-2.5">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <AwardCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : isError ? (
              <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8 text-center text-sm text-gray">
                No pudimos cargar las menciones. Intenta de nuevo.
              </p>
            ) : !awards.length ? (
              <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8 text-center text-sm text-gray">
                No hay menciones disponibles por ahora.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {firstRow.map((a) => (
                    <AwardCard
                      key={a.code}
                      award={a}
                      onOpen={() => setActive(a)}
                    />
                  ))}
                </div>
                {secondRow.length > 0 && (
                  <div className="mx-auto grid w-2/3 grid-cols-2 gap-2 sm:gap-2.5">
                    {secondRow.map((a) => (
                      <AwardCard
                        key={a.code}
                        award={a}
                        onOpen={() => setActive(a)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector */}
      <AnimatePresence>
        {active && !active.resolved && (
          <PickerSheet
            award={active}
            options={options}
            onClose={() => setActive(null)}
            onPick={handlePick}
            isPending={saveAwardPick.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MencionesSection;
