import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar solicitudes de canciones
 */
export const musicService = {
  /**
   * Obtener todas las solicitudes de canciones
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS, { params });
    return response.data;
  },

  /**
   * Obtener una solicitud por ID
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUEST_DETAIL(id));
    return response.data;
  },

  /**
   * Crear una nueva solicitud de canción
   * @param {Object} data - Datos de la solicitud {song_name, artist_name, notes?}
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.SONG_REQUESTS, data);
    return response.data;
  },

  /**
   * Actualizar el estado de una solicitud
   * @param {number} id - ID de la solicitud
   * @param {string} status - Nuevo estado (pending, playing, completed, cancelled)
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    const response = await apiClient.post(
      `${ENDPOINTS.SONG_REQUEST_DETAIL(id)}update_status/`,
      { status }
    );
    return response.data;
  },

  /**
   * Eliminar una solicitud
   * @param {number} id - ID de la solicitud
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.SONG_REQUEST_DETAIL(id));
    return response.data;
  },
};

export default musicService;

