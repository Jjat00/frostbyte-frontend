import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar feedback de clientes
 */
export const feedbackService = {
  /**
   * Obtener todos los feedback (requiere autenticacion)
   * @param {Object} params - Parametros de consulta {status, type, rating}
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.FEEDBACK, { params });
    return response.data;
  },

  /**
   * Obtener un feedback por ID
   * @param {number} id - ID del feedback
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.FEEDBACK_DETAIL(id));
    return response.data;
  },

  /**
   * Crear un nuevo feedback (publico)
   * @param {Object} data - Datos del feedback {customer_name?, comment, rating?, feedback_type}
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.FEEDBACK, data);
    return response.data;
  },

  /**
   * Actualizar el estado de un feedback
   * @param {number} id - ID del feedback
   * @param {string} status - Nuevo estado (pending, reviewed, responded, archived)
   * @param {string} adminNotes - Notas del administrador (opcional)
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status, adminNotes = '') {
    const response = await apiClient.post(
      `${ENDPOINTS.FEEDBACK_DETAIL(id)}update_status/`,
      { status, admin_notes: adminNotes }
    );
    return response.data;
  },

  /**
   * Obtener estadisticas de feedback
   * @returns {Promise<Object>}
   */
  async getStats() {
    const response = await apiClient.get(`${ENDPOINTS.FEEDBACK}stats/`);
    return response.data;
  },

  /**
   * Eliminar un feedback
   * @param {number} id - ID del feedback
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.FEEDBACK_DETAIL(id));
    return response.data;
  },
};

export default feedbackService;
