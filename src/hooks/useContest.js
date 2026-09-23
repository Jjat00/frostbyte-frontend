import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contestsService, contestsAdminService } from "@/services/contests.service";

export const contestKeys = {
  current: ["contest", "current"],
  myEntry: ["contest", "my-entry"],
  admin: ["contest-admin"],
};

/* ------------------------------------------------------------------ cliente */

/** Concurso vigente; null si no hay ninguno publicado. */
export function useCurrentContest(options = {}) {
  return useQuery({
    queryKey: contestKeys.current,
    queryFn: () => contestsService.getCurrent(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
}

/** Mi inscripción (solo con sesión de cliente). */
export function useMyContestEntry(enabled) {
  return useQuery({
    queryKey: contestKeys.myEntry,
    queryFn: () => contestsService.getMyEntry(),
    enabled: !!enabled,
    // El staff la confirma desde la barra: que el cambio llegue sin recargar
    refetchInterval: 30 * 1000,
  });
}

export function useRegisterContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => contestsService.register(data),
    onSuccess: (entry) => {
      queryClient.setQueryData(contestKeys.myEntry, entry);
    },
  });
}

export function useCancelContestEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => contestsService.cancelMyEntry(),
    onSuccess: () => {
      queryClient.setQueryData(contestKeys.myEntry, null);
    },
  });
}

/* -------------------------------------------------------------------- staff */

export function useContestAdmin() {
  return useQuery({
    queryKey: contestKeys.admin,
    queryFn: () => contestsAdminService.getOverview(),
    // Las inscripciones llegan desde la app mientras la barra atiende
    refetchInterval: 15 * 1000,
    retry: false,
  });
}

export function useUpdateContestEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => contestsAdminService.updateEntry(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contestKeys.admin }),
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => contestsAdminService.updateContest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin });
      queryClient.invalidateQueries({ queryKey: contestKeys.current });
    },
  });
}
