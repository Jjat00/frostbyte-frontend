import { customerClient } from "./api/customerClient";
import { apiClient } from "./api/client";

/**
 * Servicio de CONCURSOS (el primero: disfraces de Halloween).
 *
 * La parte del cliente va con `customerClient` (sesión de Google) y la del
 * staff con `apiClient`, igual que en reservas. Pega contra /contests/.
 */
export const contestsService = {
  /** Concurso vigente, o null si no hay ninguno publicado. */
  async getCurrent() {
    const response = await customerClient.get("/contests/current/");
    return response.data;
  },

  /** Mi inscripción al concurso vigente, o null. */
  async getMyEntry() {
    const response = await customerClient.get("/contests/current/entry/");
    return response.data;
  },

  /** Inscribirme: queda pendiente de pago en barra e Instagram. */
  async register(data) {
    const response = await customerClient.post("/contests/current/entry/", data);
    return response.data;
  },

  /** Cancelar mi inscripción (solo si aún no está pagada). */
  async cancelMyEntry() {
    await customerClient.post("/contests/current/entry/cancel/");
  },
};

export const contestsAdminService = {
  /** Concurso vigente con todos los inscritos y los conteos por estado. */
  async getOverview() {
    const response = await apiClient.get("/contests/admin/");
    return response.data;
  },

  /** Marca pago, Instagram, cancelación o notas de una inscripción. */
  async updateEntry(id, data) {
    const response = await apiClient.patch(`/contests/admin/entries/${id}/`, data);
    return response.data;
  },

  /** Configuración del concurso (solo admin). */
  async updateContest(data) {
    const response = await apiClient.patch("/contests/admin/contest/", data);
    return response.data;
  },
};

export default contestsService;
