import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pollaService } from "@/services/polla.service";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";

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
  groups: () => ["polla", "groups"],
  standings: () => ["polla", "standings"],
  awards: () => ["polla", "awards"],
  bracket: () => ["polla", "bracket"],
  ranking: () => ["polla", "ranking"],
  missions: () => ["polla", "missions"],
  myStats: () => ["polla", "me", "stats"],
  myPredictions: () => ["polla", "predictions", "me"],
  referral: () => ["polla", "referral"],
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
