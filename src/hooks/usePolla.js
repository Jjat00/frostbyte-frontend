import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pollaService } from "@/services/polla.service";

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
  ranking: () => ["polla", "ranking"],
  missions: () => ["polla", "missions"],
  myStats: () => ["polla", "me", "stats"],
  myPredictions: () => ["polla", "predictions", "me"],
};

const LIVE_STALE = 60 * 1000; // 1 min
const STATIC_STALE = 30 * 60 * 1000; // 30 min (grupos, torneo: cambian poco)

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
    select: (data) =>
      (data || []).map((m) => ({ ...m, kickoff: new Date(m.kickoff) })),
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
