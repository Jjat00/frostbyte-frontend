import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar categorías
 */
export const categoriesService = {
  /**
   * Obtener todas las categorías
   * @param {Object} params - Parámetros de consulta
   * @param {boolean} params.active_only - Filtrar solo categorías activas
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES, { params });
    return response.data;
  },

  /**
   * Obtener una categoría por slug con sus productos
   * @param {string} slug - Slug de la categoría
   * @returns {Promise<Object>}
   */
  async getBySlug(slug) {
    const response = await apiClient.get(ENDPOINTS.CATEGORY_DETAIL(slug));
    return response.data;
  },

  /**
   * Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.CATEGORIES}${id}/`);
    return response.data;
  },

  /**
   * Crear una nueva categoría
   * @param {Object} data - Datos de la categoría
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.CATEGORIES, data);
    return response.data;
  },

  /**
   * Actualizar una categoría
   * @param {string} slug - Slug de la categoría
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(slug, data) {
    const response = await apiClient.put(ENDPOINTS.CATEGORY_DETAIL(slug), data);
    return response.data;
  },

  /**
   * Actualizar parcialmente una categoría
   * @param {string} slug - Slug de la categoría
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async partialUpdate(slug, data) {
    const response = await apiClient.patch(ENDPOINTS.CATEGORY_DETAIL(slug), data);
    return response.data;
  },

  /**
   * Eliminar una categoría (soft delete)
   * @param {string} slug - Slug de la categoría
   * @returns {Promise<void>}
   */
  async delete(slug) {
    const response = await apiClient.delete(ENDPOINTS.CATEGORY_DETAIL(slug));
    return response.data;
  },
};

export default categoriesService;

