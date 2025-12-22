import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar productos
 */
export const productsService = {
  /**
   * Obtener todos los productos
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.category - Filtrar por slug de categoría
   * @param {boolean} params.coming_soon - Filtrar productos próximamente
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  /**
   * Obtener un producto por slug
   * @param {string} slug - Slug del producto
   * @returns {Promise<Object>}
   */
  async getBySlug(slug) {
    const response = await apiClient.get(ENDPOINTS.PRODUCT_DETAIL(slug));
    return response.data;
  },

  /**
   * Obtener productos por categoría
   * @param {string} categorySlug - Slug de la categoría
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getByCategory(categorySlug) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS, {
      params: { category: categorySlug }
    });
    return response.data;
  },

  /**
   * Obtener variantes de un producto
   * @param {string} slug - Slug del producto
   * @returns {Promise<Array>}
   */
  async getVariants(slug) {
    const response = await apiClient.get(ENDPOINTS.PRODUCT_VARIANTS(slug));
    return response.data;
  },
};

export default productsService;

