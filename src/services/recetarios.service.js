import { apiClient } from './api/client';

const BASE_URL = '/recetarios';

export const recetariosService = {
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
