import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pollaService } from "@/services/polla.service";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Hooks de React Query para la Polla Mundialista.
 *
 * Las lecturas tienen un staleTime corto (1 min) porque los datos cambian en
 * vivo durante el torneo. Las mutaciones invalidan las queries afectadas.
 */
export const pollaKeys = {
  all: ["polla"],
  tournament: () => ["polla", "tournament"],
  matches: (params) => ["polla", "matches", params || {}],
  match: (slug) => ["polla", "match", slug],
  matchPulse: (slug) => ["polla", "match", slug, "pulse"],
  groups: () => ["polla", "groups"],
  standings: () => ["polla", "standings"],
  topScorers: () => ["polla", "topscorers"],
  team: (code) => ["polla", "team", code],
  awards: () => ["polla", "awards"],
  bracket: () => ["polla", "bracket"],
  ranking: () => ["polla", "ranking"],
  missions: () => ["polla", "missions"],
  myStats: () => ["polla", "me", "stats"],
  myPredictions: () => ["polla", "predictions", "me"],
  referral: () => ["polla", "referral"],
  adminOverview: () => ["polla", "admin", "overview"],
  adminPlayers: (q) => ["polla", "admin", "players", q || ""],
  adminPlayer: (userId) => ["polla", "admin", "player", String(userId ?? "")],
};

const LIVE_STALE = 60 * 1000; // 1 min
const STATIC_STALE = 30 * 60 * 1000; // 30 min (grupos, torneo: cambian poco)

// Normalizan `kickoff` (ISO string) a Date. DEFINIDAS A NIVEL DE MÓDULO a
// propósito: React Query solo memoiza el resultado de `select` si la función
// mantiene su identidad entre renders. Una `select` inline se re-ejecuta en
// cada render y devuelve un array nuevo, lo que dispara en bucle cualquier
// efecto que dependa de `data` (causaba "Maximum update depth exceeded" en
// PartidosTab).
const selectMatches = (data) =>
  (data || []).map((m) => ({ ...m, kickoff: new Date(m.kickoff) }));

const selectBracket = (data) => ({
  ...data,
  rounds: (data?.rounds || []).map((r) => ({
    ...r,
    matches: (r.matches || []).map((m) => ({ ...m, kickoff: new Date(m.kickoff) })),
  })),
});

export function usePollaTournament(options = {}) {
  return useQuery({
    queryKey: pollaKeys.tournament(),
    queryFn: () => pollaService.getTournament(),
    staleTime: STATIC_STALE,
    ...options,
  });
}

/**
 * Lista de partidos. `params` admite { status, stage, group, team, featured }.
 * Normaliza `kickoff` (ISO string) a objeto Date para los helpers de fecha.
 */
export function usePollaMatches(params = {}, options = {}) {
  return useQuery({
    queryKey: pollaKeys.matches(params),
    queryFn: () => pollaService.getMatches(params),
    select: selectMatches,
    staleTime: LIVE_STALE,
    ...options,
  });
}

export function usePollaGroups(options = {}) {
  return useQuery({
    queryKey: pollaKeys.groups(),
    queryFn: () => pollaService.getGroups(),
    staleTime: STATIC_STALE,
    ...options,
  });
}

export function usePollaStandings(options = {}) {
  return useQuery({
    queryKey: pollaKeys.standings(),
    queryFn: () => pollaService.getStandings(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

/**
 * Detalle de un partido (incluye eventos y estadisticas en vivo).
 * Se monta al abrir el sheet de detalle; el WS lo mantiene fresco.
 */
export function useMatchDetail(slug, options = {}) {
  return useQuery({
    queryKey: pollaKeys.match(slug),
    queryFn: () => pollaService.getMatch(slug),
    enabled: !!slug,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Pulso de la comunidad para un partido: % por resultado y marcadores más
 * pronosticados. El backend lo oculta hasta que el usuario pronostique (o el
 * partido cierre); cae bajo el prefijo ["polla","match"] que el WS invalida.
 */
export function useMatchPulse(slug, options = {}) {
  return useQuery({
    queryKey: pollaKeys.matchPulse(slug),
    queryFn: () => pollaService.getMatchPulse(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
    ...options,
  });
}

/** Ficha de una selección: { team, standing, players, matches }. */
export function usePollaTeam(code, options = {}) {
  return useQuery({
    queryKey: pollaKeys.team(code),
    queryFn: () => pollaService.getTeam(code),
    enabled: !!code,
    staleTime: LIVE_STALE,
    ...options,
  });
}

/** Tabla de goleadores del torneo: { scorers: [...], updated_at }. */
export function usePollaTopScorers(options = {}) {
  return useQuery({
    queryKey: pollaKeys.topScorers(),
    queryFn: () => pollaService.getTopScorers(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

export function usePollaAwards(options = {}) {
  return useQuery({
    queryKey: pollaKeys.awards(),
    queryFn: () => pollaService.getAwards(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

/**
 * Bracket encadenado de la fase de eliminación. Normaliza `kickoff` (ISO) a
 * Date en cada cruce de cada ronda.
 */
export function usePollaBracket(options = {}) {
  return useQuery({
    queryKey: pollaKeys.bracket(),
    queryFn: () => pollaService.getBracket(),
    select: selectBracket,
    staleTime: LIVE_STALE,
    ...options,
  });
}

export function usePollaRanking(options = {}) {
  return useQuery({
    queryKey: pollaKeys.ranking(),
    queryFn: () => pollaService.getRanking(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

export function usePollaMissions(options = {}) {
  return useQuery({
    queryKey: pollaKeys.missions(),
    queryFn: () => pollaService.getMissions(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

export function useMyStats(options = {}) {
  return useQuery({
    queryKey: pollaKeys.myStats(),
    queryFn: () => pollaService.getMyStats(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

/** Guarda (upsert) el pronóstico de un partido. */
export function useSavePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, home_score, away_score }) =>
      pollaService.savePrediction(slug, { home_score, away_score }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polla", "matches"] });
      // Detalle y pulso del partido: el pronostico propio los desbloquea/cambia.
      qc.invalidateQueries({ queryKey: ["polla", "match"] });
      qc.invalidateQueries({ queryKey: pollaKeys.myStats() });
      qc.invalidateQueries({ queryKey: pollaKeys.missions() });
      qc.invalidateQueries({ queryKey: pollaKeys.ranking() });
      qc.invalidateQueries({ queryKey: pollaKeys.myPredictions() });
      // Los marcadores de grupo definen el desbloqueo y la siembra del bracket.
      qc.invalidateQueries({ queryKey: pollaKeys.bracket() });
      // Si este usuario fue invitado, su 1er pronóstico califica al invitador.
      qc.invalidateQueries({ queryKey: pollaKeys.referral() });
    },
  });
}

/** Guarda el pick de avance de un cruce de eliminación. */
export function useSaveBracketPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, winner_code }) =>
      pollaService.saveBracketPick(slug, { winner_code }),
    onSuccess: () => {
      // El backend propaga y poda picks de abajo: refrescamos el bracket entero.
      qc.invalidateQueries({ queryKey: pollaKeys.bracket() });
      qc.invalidateQueries({ queryKey: pollaKeys.myStats() });
      qc.invalidateQueries({ queryKey: pollaKeys.ranking() });
    },
  });
}

/** Guarda (upsert) la elección de una mención. */
export function useSaveAwardPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }) => pollaService.saveAwardPick(code, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pollaKeys.awards() });
      qc.invalidateQueries({ queryKey: pollaKeys.myStats() });
      qc.invalidateQueries({ queryKey: pollaKeys.ranking() });
    },
  });
}

/** Quita (deja vacía) la elección de una mención. */
export function useClearAwardPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code) => pollaService.clearAwardPick(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pollaKeys.awards() });
      qc.invalidateQueries({ queryKey: pollaKeys.myStats() });
      qc.invalidateQueries({ queryKey: pollaKeys.ranking() });
    },
  });
}

/**
 * Estado de invitación del cliente: { code, invited, qualified, points, cap,
 * points_per }. Requiere sesión (endpoint IsAuthenticated).
 */
export function useReferral(options = {}) {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: pollaKeys.referral(),
    queryFn: () => pollaService.getReferral(),
    enabled: isAuthenticated,
    staleTime: LIVE_STALE,
    ...options,
  });
}

/** Registra que el cliente fue invitado con un código. */
export function useClaimReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code) => pollaService.claimReferral(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pollaKeys.referral() });
      qc.invalidateQueries({ queryKey: pollaKeys.myStats() });
    },
  });
}

// ── Tiempo real ──────────────────────────────────────────────────────────────

// Queries que muestran datos que cambian con cada gol / partido finalizado.
const LIVE_QUERY_KEYS = [
  ["polla", "matches"], // prefijo: cubre todas las variantes de params
  ["polla", "match"], // prefijo: detalle abierto en el sheet (eventos en vivo)
  ["polla", "team"], // prefijo: ficha de selección abierta (forma, posición)
  pollaKeys.standings(),
  pollaKeys.topScorers(),
  pollaKeys.bracket(),
  pollaKeys.ranking(),
  pollaKeys.missions(),
  pollaKeys.myStats(),
  pollaKeys.awards(),
];

/**
 * Mantiene frescos los datos de la Polla para todos los participantes.
 * Montar UNA vez en el shell (PollaApp).
 *
 * Tres mecanismos, del más al menos inmediato:
 *  1. WebSocket /ws/polla/: el backend emite `polla_changed` cuando el sync
 *     detecta cambios; aquí invalidamos las queries vivas y React Query
 *     refetchea solo las que están en pantalla.
 *  2. Heartbeat: query ligera de partidos en vivo cada 60 s (cada 5 min si no
 *     hay ninguno) para detectar transiciones aunque el WS esté caído.
 *  3. Respaldo: si hay partidos en vivo y el WS no conecta (típico en móvil
 *     tras bloquear la pantalla), invalida las queries vivas cada 60 s.
 */
export function usePollaLive() {
  const qc = useQueryClient();

  const invalidateLive = useCallback(() => {
    LIVE_QUERY_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
  }, [qc]);

  // Heartbeat: ¿hay partidos en vivo ahora mismo?
  const { data: liveMatches } = useQuery({
    queryKey: pollaKeys.matches({ status: "live" }),
    queryFn: () => pollaService.getMatches({ status: "live" }),
    select: selectMatches,
    refetchInterval: (query) =>
      query.state.data?.length ? 60 * 1000 : 5 * 60 * 1000,
    staleTime: 30 * 1000,
  });
  const hasLive = (liveMatches?.length ?? 0) > 0;

  const { isConnected } = useWebSocket("/ws/polla/", {
    onMessage: (msg) => {
      if (msg?.type === "polla_changed") invalidateLive();
    },
  });

  // Respaldo por polling cuando el WS está caído durante partidos en vivo.
  useEffect(() => {
    if (isConnected || !hasLive) return undefined;
    const id = setInterval(invalidateLive, 60 * 1000);
    return () => clearInterval(id);
  }, [isConnected, hasLive, invalidateLive]);

  return { isConnected, hasLive, liveMatches };
}

// ── Administración (sesión de staff) ────────────────────────────────────────
// Estos hooks consumen los endpoints `/polla/admin/*` con la sesión de staff
// (token admin). No usan la sesión de cliente Google.

/** KPIs agregados del torneo y avance global de misiones. */
export function usePollaAdminOverview(options = {}) {
  return useQuery({
    queryKey: pollaKeys.adminOverview(),
    queryFn: () => pollaService.adminOverview(),
    staleTime: LIVE_STALE,
    ...options,
  });
}

/** Lista de jugadores con su desglose de puntos. `q` filtra por nombre/email. */
export function usePollaAdminPlayers(q = "", options = {}) {
  return useQuery({
    queryKey: pollaKeys.adminPlayers(q),
    queryFn: () => pollaService.adminPlayers(q),
    staleTime: LIVE_STALE,
    ...options,
  });
}

/** Detalle de un jugador: score, pronósticos, misiones y referidos. */
export function usePollaAdminPlayer(userId, options = {}) {
  return useQuery({
    queryKey: pollaKeys.adminPlayer(userId),
    queryFn: () => pollaService.adminPlayer(userId),
    enabled: !!userId,
    staleTime: LIVE_STALE,
    ...options,
  });
}
