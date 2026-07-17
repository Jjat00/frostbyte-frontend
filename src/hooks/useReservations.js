import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsService } from "@/services/reservations.service";
import { reservationsAdminService } from "@/services/reservationsAdmin.service";
import { useWebSocket } from "./useWebSocket";

/**
 * Query keys de reservas (cliente y staff).
 */
export const reservationKeys = {
  all: ["reservations"],
  config: ["reservations", "config"],
  availability: (params) => ["reservations", "availability", params],
  mine: () => ["reservations", "mine"],
  admin: ["reservations-admin"],
  adminDay: (date) => ["reservations-admin", "day", date],
  adminCalendar: (year, month) => ["reservations-admin", "calendar", year, month],
  adminSettings: ["reservations-admin", "settings"],
  adminTables: ["reservations-admin", "tables"],
};

/* ------------------------------------------------------------------ cliente */

/** Configuración pública del módulo de reservas. */
export function useReservationsConfig(options = {}) {
  return useQuery({
    queryKey: reservationKeys.config,
    queryFn: () => reservationsService.getConfig(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/** Disponibilidad por fecha (horas de mesa o turnos de la sala). */
export function useReservationAvailability(params, options = {}) {
  return useQuery({
    queryKey: reservationKeys.availability(params),
    queryFn: () => reservationsService.getAvailability(params),
    enabled: !!params?.date,
    // Disponibilidad cambia con cada reserva ajena: mantenerla fresca
    staleTime: 30 * 1000,
    ...options,
  });
}

/** 'Mis reservas' del cliente autenticado. */
export function useMyReservations(options = {}) {
  return useQuery({
    queryKey: reservationKeys.mine(),
    queryFn: () => reservationsService.list(),
    ...options,
  });
}

/** Crea una reserva propia e invalida lista + disponibilidad. */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

/** Cancela una reserva propia. */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

/* -------------------------------------------------------------------- staff */

/** Reservas de un día + contexto de ocupación (staff). */
export function useReservationsDay(date, options = {}) {
  return useQuery({
    queryKey: reservationKeys.adminDay(date),
    queryFn: () => reservationsAdminService.getDay(date),
    ...options,
  });
}

/** Resumen mensual para el calendario (staff). */
export function useReservationsCalendar(year, month, options = {}) {
  return useQuery({
    queryKey: reservationKeys.adminCalendar(year, month),
    queryFn: () => reservationsAdminService.getCalendar(year, month),
    ...options,
  });
}

/** Actualiza una reserva (estado, mesa, notas) e invalida las vistas staff. */
export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => reservationsAdminService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.admin });
    },
  });
}

/** Elimina una reserva definitivamente (la confirmación la pide el UI). */
export function useDeleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => reservationsAdminService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.admin });
    },
  });
}

/** Crea una reserva desde el dashboard (teléfono / en persona). */
export function useCreateStaffReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reservationsAdminService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.admin });
    },
  });
}

/** Configuración del módulo (staff). */
export function useReservationSettings(options = {}) {
  return useQuery({
    queryKey: reservationKeys.adminSettings,
    queryFn: () => reservationsAdminService.getSettings(),
    ...options,
  });
}

export function useUpdateReservationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reservationsAdminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.adminSettings });
      // La config pública del cliente refleja los mismos valores
      queryClient.invalidateQueries({ queryKey: reservationKeys.config });
    },
  });
}

/** Mesas activas para el selector de asignación. */
export function useReservationTables(options = {}) {
  return useQuery({
    queryKey: reservationKeys.adminTables,
    queryFn: () => reservationsAdminService.getTables(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Actualización en vivo del dashboard de reservas.
 *
 * Escucha `reservations_changed` por WS (`/ws/reservations/`) e invalida las
 * queries del staff. Respaldo por polling (60s) si el WS está caído — mismo
 * patrón que useMyOrdersLive.
 */
export function useReservationsLive() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: reservationKeys.admin });
  }, [queryClient]);

  const { isConnected } = useWebSocket("/ws/reservations/", {
    onMessage: (msg) => {
      if (msg?.type === "reservations_changed") invalidate();
    },
  });

  useEffect(() => {
    if (isConnected) return undefined;
    const id = setInterval(invalidate, 60 * 1000);
    return () => clearInterval(id);
  }, [isConnected, invalidate]);

  return { isConnected };
}
