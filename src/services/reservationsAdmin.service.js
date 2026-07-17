import { apiClient } from "./api/client";

/**
 * Servicio de GESTIÓN DE RESERVAS (staff).
 *
 * Usa `apiClient` (sesión del staff). Pega contra /reservations/admin/.
 */
export const reservationsAdminService = {
  /** Reservas de un día + contexto de ocupación (mesas por piso). */
  async getDay(date) {
    const response = await apiClient.get("/reservations/admin/day/", {
      params: date ? { date } : {},
    });
    return response.data;
  },

  /** Conteo de reservas por día para pintar el calendario mensual. */
  async getCalendar(year, month) {
    const response = await apiClient.get("/reservations/admin/calendar/", {
      params: { year, month },
    });
    return response.data;
  },

  /** Actualiza una reserva: estado, mesa asignada, notas, datos. */
  async update(id, data) {
    const response = await apiClient.patch(
      `/reservations/admin/${id}/`, data);
    return response.data;
  },

  /** Crea una reserva a nombre del cliente (teléfono / en persona). */
  async create(data) {
    const response = await apiClient.post("/reservations/admin/", data);
    return response.data;
  },

  /** Elimina una reserva definitivamente (el UI confirma antes). */
  async remove(id) {
    await apiClient.delete(`/reservations/admin/${id}/`);
  },

  /** Configuración del módulo. */
  async getSettings() {
    const response = await apiClient.get("/reservations/admin/settings/");
    return response.data;
  },

  async updateSettings(data) {
    const response = await apiClient.patch(
      "/reservations/admin/settings/", data);
    return response.data;
  },

  /** Mesas activas para asignar (opcionalmente por piso). */
  async getTables(floor) {
    const response = await apiClient.get("/reservations/admin/tables/", {
      params: floor ? { floor } : {},
    });
    return response.data;
  },
};

export default reservationsAdminService;
