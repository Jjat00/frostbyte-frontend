import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Lock,
  Trophy,
  Loader2,
  Radio,
  Flame,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "@/components/polla/Flag";
import { usePollaBracket, useSavePrediction } from "@/hooks/usePolla";
import { matchDayLabel } from "@/data/mundial2026";

/* ── Geometria del arbol ───────────────────────────────────────────────── */
const CARD_W = 158;
const CARD_H = 96;
const COL_GAP = 46;
const ROW_GAP = 22;
const COL = CARD_W + COL_GAP; // paso horizontal entre rondas
const LEAF = CARD_H + ROW_GAP; // paso vertical entre cruces de 16avos
const PAD = 28; // margen interno del lienzo (que las tarjetas no toquen el borde)
const CENTER_COL = 4; // 16avos(0) 8vos(1) 4tos(2) semi(3) final(4)
const DEPTH = { r32: 4, r16: 3, qf: 2, sf: 1, third: 0, final: 0 };

const winnerSource = (src) => {
  const m = /Ganador\s+(\d+)/i.exec(src || "");
  return m ? parseInt(m[1], 10) : null;
};

/* Posiciona cada cruce en (x,y) armando el arbol desde la final hacia las
   hojas (16avos). Devuelve {nodes, edges, width, height, finalNode}. */
function buildLayout(rounds) {
  const byNum = {};
  rounds.forEach((r) => r.matches.forEach((m) => (byNum[m.number] = { ...m })));

  const finalRound = rounds.find((r) => r.stage === "final");
  const thirdRound = rounds.find((r) => r.stage === "third");
  const finalM = finalRound?.matches?.[0];
  if (!finalM) return null;

  const nodes = [];
  const placed = {};
  const leafIdx = { L: 0, R: 0 };

  const place = (num, side) => {
    const m = byNum[num];
    if (!m) return 0;
    const depth = DEPTH[m.stage] ?? 0;
    const kids = [winnerSource(m.home_source), winnerSource(m.away_source)];
    let y;
    if (kids[0] == null || kids[1] == null) {
      const i = leafIdx[side]++;
      y = i * LEAF + CARD_H / 2;
    } else {
      const y1 = place(kids[0], side);
      const y2 = place(kids[1], side);
      y = (y1 + y2) / 2;
    }
    const x = side === "L" ? (CENTER_COL - depth) * COL : (CENTER_COL + depth) * COL;
    const node = { match: m, x, y, side, children: kids.filter((k) => k != null) };
    nodes.push(node);
    placed[num] = node;
    return y;
  };

  // Hijos de la final: subarbol izquierdo y derecho.
  const [lRoot, rRoot] = [
    winnerSource(finalM.home_source),
    winnerSource(finalM.away_source),
  ];
  const lY = lRoot != null ? place(lRoot, "L") : LEAF * 4;
  const rY = rRoot != null ? place(rRoot, "R") : LEAF * 4;
  const finalY = (lY + rY) / 2;
  const finalNode = {
    match: finalM,
    x: CENTER_COL * COL,
    y: finalY,
    side: "C",
    children: [lRoot, rRoot].filter((k) => k != null),
  };
  nodes.push(finalNode);
  placed[finalM.number] = finalNode;

  // Tercer puesto: tarjeta suelta, centrada bajo la final.
  let thirdNode = null;
  const maxLeafY = Math.max(leafIdx.L, leafIdx.R, 1) * LEAF;
  const thirdM = thirdRound?.matches?.[0];
  if (thirdM) {
    thirdNode = {
      match: thirdM,
      x: CENTER_COL * COL,
      y: maxLeafY + CARD_H,
      side: "C",
      children: [],
    };
    nodes.push(thirdNode);
  }

  // Desplaza todo el arbol para dejar un margen interno (PAD) en los bordes.
  nodes.forEach((n) => { n.x += PAD; n.y += PAD; });

  // Aristas tipo "llave" (codo) de cada hijo a su padre.
  const edges = [];
  nodes.forEach((n) => {
    const homeSrc = winnerSource(n.match.home_source);
    const awaySrc = winnerSource(n.match.away_source);
    n.children.forEach((cn_) => {
      const c = placed[cn_];
      if (!c) return;
      const childLeft = c.x < n.x;
      const x1 = childLeft ? c.x + CARD_W : c.x;
      const x2 = childLeft ? n.x : n.x + CARD_W;
      const midX = (x1 + x2) / 2;
      // "won": el ganador del cruce hijo ya avanzo, es decir, su lugar en el
      // cruce padre ya tiene equipo definido. Esa linea se ilumina.
      let won = false;
      if (homeSrc === cn_) won = Boolean(n.match.home?.code);
      else if (awaySrc === cn_) won = Boolean(n.match.away?.code);
      edges.push({
        d: `M ${x1} ${c.y + CARD_H / 2} H ${midX} V ${n.y + CARD_H / 2} H ${x2}`,
        won,
      });
    });
  });

  const width = Math.max(...nodes.map((n) => n.x + CARD_W)) + PAD;
  const height = Math.max(...nodes.map((n) => n.y + CARD_H)) + PAD;
  return { nodes, edges, width, height, finalNode };
}

/* ── Caja de marcador (editable o solo lectura) ───────────────────────────── */
const ScoreBox = ({ value, editable, disabled, onChange, onCommit, tone }) => {
  const filled = value !== "" && value != null;
  if (!editable) {
    return (
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-black tabular-nums",
          filled
            ? tone === "live"
              ? "bg-white/[0.06] text-light ring-1 ring-red-500/30"
              : "bg-white/[0.07] text-light"
            : "border border-dashed border-white/15 text-gray/30"
        )}
      >
        {filled ? value : "·"}
      </span>
    );
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value ?? ""}
      disabled={disabled}
      data-no-pan
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={onCommit}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "").slice(0, 2);
        onChange(d === "" ? "" : String(Math.min(20, parseInt(d, 10))));
      }}
      aria-label="Marcador"
      className={cn(
        "h-7 w-7 shrink-0 appearance-none rounded-md text-center text-sm font-black tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
        filled
          ? "bg-linear-to-br from-primary to-secondary text-dark"
          : "border border-dashed border-primary/40 bg-primary/[0.06] text-light"
      )}
    />
  );
};

const TeamRow = ({ team, source, score, editable, disabled, onChange, onCommit, finished, realScore, won }) => {
  const defined = Boolean(team?.code);
  const label = defined ? team.code : "—";
  return (
    <div className="flex items-center gap-1.5">
      <Flag iso2={team?.iso2} name={defined ? team.name : source} size={20} rounded="rounded-[3px]" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-extrabold",
          defined ? (won ? "text-secondary" : "text-light") : "text-gray/50"
        )}
        title={defined ? team.name : source || "Por definir"}
      >
        {defined ? label : <span className="italic font-bold">{source || "?"}</span>}
      </span>
      {finished ? (
        <ScoreBox value={realScore} tone="final" />
      ) : editable ? (
        <ScoreBox value={score} editable disabled={disabled} onChange={onChange} onCommit={onCommit} />
      ) : (
        <span className="h-7 w-7 shrink-0" />
      )}
    </div>
  );
};

/* ── Tarjeta de un cruce posicionada en el arbol ──────────────────────────── */
const CrossCard = ({ node, scores, setScore, onSave, pending }) => {
  const m = node.match;
  const isLive = m.status === "live";
  const finished = m.status === "finished";
  const both = Boolean(m.home?.code && m.away?.code);
  const editable = !m.is_locked && !finished && both;
  const sc = scores[m.slug] || { h: "", a: "" };
  const mp = m.my_prediction;
  const pts = m.points || { outcome: 0, exact: 0 };

  const commit = () => {
    const cur = scores[m.slug];
    if (cur && cur.h !== "" && cur.h != null && cur.a !== "" && cur.a != null) {
      onSave(m.slug, cur);
    }
  };

  // ganador real (para resaltar) cuando el cruce ya termino
  let homeWon = false, awayWon = false;
  if (finished && m.home_score != null && m.away_score != null) {
    homeWon = m.home_score > m.away_score;
    awayWon = m.away_score > m.home_score;
  }

  return (
    <div
      className={cn(
        "absolute rounded-xl border bg-dark-secondary/70 p-2 backdrop-blur-sm transition-colors",
        finished ? "border-white/15" : both ? "border-primary/25" : "border-white/[0.06]",
        isLive && "border-red-500/40"
      )}
      style={{ left: node.x, top: node.y, width: CARD_W, height: CARD_H }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="truncate text-[8px] font-bold uppercase tracking-wide text-gray/70">
          {m.round_label}
        </span>
        {isLive && m.minute != null ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/15 px-1 text-[8px] font-bold text-red-400">
            <Radio size={7} className="animate-pulse" />
            {m.minute}&apos;
          </span>
        ) : finished && mp ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1 text-[8px] font-black",
              mp.points_earned > 0
                ? mp.is_exact
                  ? "bg-linear-to-r from-primary to-secondary text-dark"
                  : "bg-secondary/20 text-secondary"
                : "bg-white/[0.06] text-gray"
            )}
          >
            {mp.is_exact && <Flame size={8} />}+{mp.points_earned}
          </span>
        ) : both && !finished ? (
          <span
            className="flex items-center gap-1"
            title={`Aciertas el ganador: +${pts.outcome} · Marcador exacto: +${pts.exact}`}
          >
            <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-primary">
              <Check size={8} strokeWidth={3} />
              {pts.outcome}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-secondary">
              <Flame size={8} />
              {pts.exact}
            </span>
          </span>
        ) : (
          <span className="text-[8px] font-semibold text-gray/40">{matchDayLabel(m.kickoff)}</span>
        )}
      </div>
      <div className="space-y-0.5">
        <TeamRow
          team={m.home}
          source={m.home_source}
          score={sc.h}
          editable={editable}
          disabled={pending === m.slug}
          onChange={(h) => setScore(m.slug, { ...sc, h })}
          onCommit={commit}
          finished={finished}
          realScore={m.home_score != null ? String(m.home_score) : ""}
          won={homeWon}
        />
        <TeamRow
          team={m.away}
          source={m.away_source}
          score={sc.a}
          editable={editable}
          disabled={pending === m.slug}
          onChange={(a) => {
            const next = { ...sc, a };
            setScore(m.slug, next);
            if (next.h !== "" && next.h != null && a !== "" && a != null) onSave(m.slug, next);
          }}
          onCommit={commit}
          finished={finished}
          realScore={m.away_score != null ? String(m.away_score) : ""}
          won={awayWon}
        />
      </div>
    </div>
  );
};

/* ── Pan / zoom del lienzo ─────────────────────────────────────────────────── */
function useBracketView(contentW, contentH) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.5);
  const didFit = useRef(false);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el || contentW <= 1) return false;
    const cw = el.clientWidth, ch = el.clientHeight;
    if (!cw || !ch) return false;
    setScale(Math.min(cw / contentW, ch / contentH) * 0.96);
    return true;
  }, [contentW, contentH]);

  // Permite un re-ajuste automatico cuando cambia el contenido (carga del arbol).
  useEffect(() => { didFit.current = false; }, [contentW, contentH]);

  // Auto-fit en cuanto el contenedor Y el contenido tengan dimensiones reales.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const tryFit = () => {
      if (didFit.current) return;
      if (fit()) didFit.current = true;
      else raf = requestAnimationFrame(tryFit);
    };
    tryFit();
    const ro = new ResizeObserver(() => { if (!didFit.current) tryFit(); });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [fit]);

  const zoom = (f) => setScale((s) => Math.max(0.2, Math.min(2.2, s * f)));

  const focusFinal = (nx, ny) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({
      left: nx * scale - el.clientWidth / 2,
      top: ny * scale - el.clientHeight / 2,
      behavior: "smooth",
    });
  };

  // Arrastrar con el mouse mueve el scroll (en tactil el desplazamiento es nativo).
  const drag = useRef(null);
  const onPointerDown = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("input,button")) return;
    drag.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.st - (e.clientY - drag.current.y);
  };
  const onPointerUp = () => { drag.current = null; };

  return { ref, scale, fit, zoom, focusFinal, onPointerDown, onPointerMove, onPointerUp };
}

/* ── Estados auxiliares ─────────────────────────────────────────────────────── */
const WaitingState = ({ onGoToGroups }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/15 to-secondary/15 text-primary">
      <Lock size={26} />
    </div>
    <h3 className="text-lg font-black text-light">La eliminación aún no abre</h3>
    <p className="mx-auto mt-1 max-w-sm text-sm leading-snug text-gray">
      La llave se arma con los <b className="text-light">clasificados reales</b>: cada
      cruce aparece cuando el Mundial define a sus equipos. Ahí marcas el resultado,
      igual que en grupos. Mientras tanto, asegura tus marcadores de grupos.
    </p>
    <button
      onClick={onGoToGroups}
      className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-secondary px-5 py-2.5 text-sm font-black text-dark shadow-lg shadow-primary/30"
    >
      Ir a pronosticar
      <ChevronRight size={15} />
    </button>
  </div>
);

const ZoomBtn = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-dark/80 text-light backdrop-blur transition-colors hover:border-primary/50 hover:text-primary"
  >
    {children}
  </button>
);

const EMPTY_ROUNDS = [];

const EliminacionBracket = ({ onGoToGroups }) => {
  const { data, isLoading, isError } = usePollaBracket();
  const savePred = useSavePrediction();
  const [scores, setScores] = useState({});

  const rounds = data?.rounds ?? EMPTY_ROUNDS;
  const layout = useMemo(() => (rounds.length ? buildLayout(rounds) : null), [rounds]);

  const bv = useBracketView(layout?.width || 1, layout?.height || 1);

  // Siembra marcadores locales desde my_prediction.
  useEffect(() => {
    setScores((prev) => {
      const next = { ...prev };
      rounds.forEach((r) =>
        r.matches.forEach((m) => {
          if (!(m.slug in next)) {
            const mp = m.my_prediction;
            next[m.slug] =
              mp && mp.home_score != null && mp.away_score != null
                ? { h: String(mp.home_score), a: String(mp.away_score) }
                : { h: "", a: "" };
          }
        })
      );
      return next;
    });
  }, [rounds]);

  const setScore = (slug, val) => setScores((p) => ({ ...p, [slug]: val }));
  const onSave = (slug, val) =>
    savePred.mutate({ slug, home_score: Number(val.h), away_score: Number(val.a) });
  const pending = savePred.isPending ? savePred.variables?.slug : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
        <Loader2 className="animate-spin text-primary" size={26} />
      </div>
    );
  }
  if (isError) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] py-10 text-center text-sm text-red-400">
        No pudimos cargar la llave. Intenta de nuevo en un momento.
      </p>
    );
  }
  if (!data?.open || !layout) {
    return <WaitingState onGoToGroups={onGoToGroups} />;
  }

  const champ = data.champion;

  return (
    <div>
      <p className="mb-2 text-[11px] leading-snug text-gray">
        Marca el resultado de cada cruce ya definido (arrastra y haz zoom para
        recorrer la llave). Aciertas más puntos en cada fase, y el marcador
        exacto da el máximo.
      </p>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(circle_at_50%_0%,rgba(30,158,90,0.10),transparent_60%)]">
        {/* Lienzo: arrastrar para mover (mouse) o deslizar (tactil) + zoom; barras ocultas */}
        <div
          ref={bv.ref}
          onPointerDown={bv.onPointerDown}
          onPointerMove={bv.onPointerMove}
          onPointerUp={bv.onPointerUp}
          onPointerLeave={bv.onPointerUp}
          className="h-[clamp(420px,70vh,640px)] w-full cursor-grab overflow-auto overscroll-contain rounded-2xl [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          <div
            style={{
              width: layout.width * bv.scale,
              height: (layout.height + 60) * bv.scale,
              position: "relative",
            }}
          >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: layout.width,
              height: layout.height + 60,
              transform: `scale(${bv.scale})`,
            }}
          >
            {/* Lineas de la llave */}
            <svg
              className="pointer-events-none absolute left-0 top-0"
              width={layout.width}
              height={layout.height}
            >
              <defs>
                <linearGradient id="wonEdge" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e9e5a" />
                  <stop offset="100%" stopColor="#f2c53d" />
                </linearGradient>
              </defs>
              {/* Primero las lineas tenues; luego las del ganador, encima */}
              {layout.edges.filter((e) => !e.won).map((e, i) => (
                <path key={`d${i}`} d={e.d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
              ))}
              {layout.edges.filter((e) => e.won).map((e, i) => (
                <path
                  key={`w${i}`}
                  d={e.d}
                  fill="none"
                  stroke="url(#wonEdge)"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Trofeo + campeón al centro, bajo la final */}
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: layout.finalNode.x,
                top: layout.finalNode.y + CARD_H + 14,
                width: CARD_W,
              }}
            >
              <Trophy size={30} className="text-secondary drop-shadow-[0_0_10px_rgba(242,197,61,0.5)]" />
              {champ ? (
                <div className="mt-1 flex flex-col items-center">
                  <Flag iso2={champ.iso2} name={champ.name} size={34} className="ring-2 ring-secondary/60" />
                  <span className="mt-0.5 text-[10px] font-black text-secondary">{champ.name}</span>
                </div>
              ) : (
                <span className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-gray/60">
                  Campeón<br />por definir
                </span>
              )}
            </div>

            {/* Tarjetas de cruces */}
            {layout.nodes.map((n) => (
              <CrossCard
                key={n.match.slug}
                node={n}
                scores={scores}
                setScore={setScore}
                onSave={onSave}
                pending={pending}
              />
            ))}
          </div>
          </div>
        </div>

        {/* Controles */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <ZoomBtn onClick={() => bv.zoom(1.25)} label="Acercar">
            <Plus size={16} />
          </ZoomBtn>
          <ZoomBtn onClick={() => bv.zoom(0.8)} label="Alejar">
            <Minus size={16} />
          </ZoomBtn>
          <ZoomBtn onClick={bv.fit} label="Ver toda la llave">
            <Maximize2 size={15} />
          </ZoomBtn>
          <ZoomBtn
            onClick={() => bv.focusFinal(layout.finalNode.x + CARD_W / 2, layout.finalNode.y + CARD_H / 2)}
            label="Ir a la final"
          >
            <Crosshair size={15} />
          </ZoomBtn>
        </div>

        {/* Clave: que significan el verde y el oro de los puntos */}
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-3 rounded-full border border-white/10 bg-dark/80 px-3 py-1 text-[10px] font-bold backdrop-blur">
          <span className="inline-flex items-center gap-1 text-primary">
            <Check size={11} strokeWidth={3} /> aciertas el ganador
          </span>
          <span className="inline-flex items-center gap-1 text-secondary">
            <Flame size={11} /> marcador exacto
          </span>
          <span className="hidden text-gray sm:inline">· vale más cada fase</span>
        </div>
      </div>
    </div>
  );
};

export default EliminacionBracket;
