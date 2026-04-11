import { apiClient } from './api/client';

const BASE_URL = '/recetarios';

export const recetariosService = {
  // ============= CATEGORIES =============

  async getCategories(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/categories/`, { params });
    return response.data;
  },

  async getCategory(slug) {
    const response = await apiClient.get(`${BASE_URL}/categories/${slug}/`);
    return response.data;
  },

  async createCategory(data) {
    const response = await apiClient.post(`${BASE_URL}/categories/`, data);
    return response.data;
  },

  async updateCategory(slug, data) {
    const response = await apiClient.patch(`${BASE_URL}/categories/${slug}/`, data);
    return response.data;
  },

  async deleteCategory(slug) {
    const response = await apiClient.delete(`${BASE_URL}/categories/${slug}/`);
    return response.data;
  },

  // ============= RECIPES =============

  async getRecipes(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/recipes/`, { params });
    return response.data;
  },

  async getRecipe(slug) {
    const response = await apiClient.get(`${BASE_URL}/recipes/${slug}/`);
    return response.data;
  },

  async createRecipe(data) {
    const response = await apiClient.post(`${BASE_URL}/recipes/`, data);
    return response.data;
  },

  async updateRecipe(slug, data) {
    const response = await apiClient.put(`${BASE_URL}/recipes/${slug}/`, data);
    return response.data;
  },

  async deleteRecipe(slug) {
    const response = await apiClient.delete(`${BASE_URL}/recipes/${slug}/`);
    return response.data;
  },
};
