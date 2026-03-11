import { apiClient } from './api/client';

const BASE_URL = '/impostor';

export const impostorService = {
  // ============= CATEGORIAS Y PALABRAS =============

  async getCategories() {
    const response = await apiClient.get(`${BASE_URL}/categories/`);
    return response.data;
  },

  async getCategoryWords(slug) {
    const response = await apiClient.get(`${BASE_URL}/categories/${slug}/words/`);
    return response.data;
  },

  // ============= SESIONES (TRAZABILIDAD) =============

  async createSession(data) {
    const response = await apiClient.post(`${BASE_URL}/sessions/create-session/`, data);
    return response.data;
  },

  async saveRound(sessionId, data) {
    const response = await apiClient.post(
      `${BASE_URL}/sessions/${sessionId}/save-round/`,
      data
    );
    return response.data;
  },

  async finishSession(sessionId, data = {}) {
    const response = await apiClient.patch(
      `${BASE_URL}/sessions/${sessionId}/finish/`,
      data
    );
    return response.data;
  },
};

export default impostorService;
