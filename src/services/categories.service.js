import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar categorías
 */
export const categoriesService = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll() {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES);
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
};

export default categoriesService;

