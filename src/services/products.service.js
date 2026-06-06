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
   * @param {boolean} params.active_only - Filtrar solo productos activos (default: true)
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
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS}${id}/`);
    return response.data;
  },

  /**
   * Crear un nuevo producto
   * @param {Object} data - Datos del producto
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS, data);
    return response.data;
  },

  /**
   * Actualizar un producto
   * @param {string} slug - Slug del producto
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(slug, data) {
    const response = await apiClient.put(ENDPOINTS.PRODUCT_DETAIL(slug), data);
    return response.data;
  },

  /**
   * Actualizar parcialmente un producto
   * @param {string} slug - Slug del producto
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async partialUpdate(slug, data) {
    const response = await apiClient.patch(ENDPOINTS.PRODUCT_DETAIL(slug), data);
    return response.data;
  },

  /**
   * Eliminar un producto (soft delete)
   * @param {string} slug - Slug del producto
   * @returns {Promise<void>}
   */
  async delete(slug) {
    const response = await apiClient.delete(ENDPOINTS.PRODUCT_DETAIL(slug));
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

  /**
   * Sugerir descripción de producto con IA
   * @param {string} productName - Nombre del producto
   * @returns {Promise<string>} Descripción sugerida
   */
  async suggestDescription(productName) {
    const response = await apiClient.post(ENDPOINTS.AI_SUGGEST_DESCRIPTION, {
      product_name: productName,
    });
    return response.data.description;
  },

  /**
   * Sugerir historia/origen de un cóctel con IA
   * @param {string} productName - Nombre del cóctel
   * @returns {Promise<string>} Historia sugerida
   */
  async suggestHistory(productName) {
    const response = await apiClient.post(ENDPOINTS.AI_SUGGEST_HISTORY, {
      product_name: productName,
    });
    return response.data.history;
  },
};

/**
 * Servicio para gestionar variantes de productos
 */
export const variantsService = {
  /**
   * Obtener todas las variantes
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.product - Filtrar por ID de producto
   * @param {boolean} params.active_only - Filtrar solo variantes activas
   * @returns {Promise<Array>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.VARIANTS, { params });
    return response.data;
  },

  /**
   * Obtener una variante por ID
   * @param {number} id - ID de la variante
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.VARIANT_DETAIL(id));
    return response.data;
  },

  /**
   * Crear una nueva variante
   * @param {Object} data - Datos de la variante
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.VARIANTS, data);
    return response.data;
  },

  /**
   * Actualizar una variante
   * @param {number} id - ID de la variante
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const response = await apiClient.put(ENDPOINTS.VARIANT_DETAIL(id), data);
    return response.data;
  },

  /**
   * Actualizar parcialmente una variante
   * @param {number} id - ID de la variante
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>}
   */
  async partialUpdate(id, data) {
    const response = await apiClient.patch(ENDPOINTS.VARIANT_DETAIL(id), data);
    return response.data;
  },

  /**
   * Eliminar una variante (soft delete)
   * @param {number} id - ID de la variante
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.VARIANT_DETAIL(id));
    return response.data;
  },
};

export default productsService;

