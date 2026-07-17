import { customerClient } from "./api/customerClient";

/**
 * Servicio de RESERVAS DEL CLIENTE (mesa, grupo grande o Sala VIP).
 *
 * Usa `customerClient` (Bearer del cliente Google), NO el apiClient del staff.
 * Espejo del patrón de `customerOrders.service.js`. Pega contra /reservations/.
 */
export const reservationsService = {
  /** Configuración pública del módulo (montos, turnos, horarios). */
  async getConfig() {
    const response = await customerClient.get("/reservations/config/");
    return response.data;
  },

  /**
   * Disponibilidad pública por fecha.
   * Mesa:  { date, type: "table", party_size, floor }
   * Sala:  { date, type: "vip_room" }
   */
  async getAvailability(params) {
    const response = await customerClient.get("/reservations/availability/", {
      params,
    });
    return response.data;
  },

  /** Crea una reserva propia. */
  async create(data) {
    const response = await customerClient.post("/reservations/", data);
    return response.data;
  },

  /** Lista 'Mis reservas' del cliente autenticado. */
  async list() {
    const response = await customerClient.get("/reservations/");
    return response.data;
  },

  /** Cancela una reserva propia futura. */
  async cancel(id) {
    const response = await customerClient.post(`/reservations/${id}/cancel/`);
    return response.data;
  },
};

export default reservationsService;
