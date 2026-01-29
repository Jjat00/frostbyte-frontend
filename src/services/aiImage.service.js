import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para generación de imágenes con IA (OpenAI GPT Image)
 */
export const aiImageService = {
  /**
   * Generar imagen de producto con IA
   * @param {Object} params - Parámetros de generación
   * @param {File} params.originalImage - Imagen original del producto
   * @param {File} params.referenceImage - Imagen de referencia de estilo (opcional)
   * @param {string} params.prompt - Instrucciones adicionales para la IA
   * @param {boolean} params.transparent - Si debe tener fondo transparente
   * @param {function} params.onProgress - Callback para progreso de subida (0-100)
   * @returns {Promise<Object>} Datos de la imagen generada
   */
  async generateImage({
    originalImage,
    referenceImage = null,
    prompt = '',
    transparent = false,
    onProgress = null,
  }) {
    const formData = new FormData();
    formData.append('original_image', originalImage);

    if (referenceImage) {
      formData.append('reference_image', referenceImage);
    }

    if (prompt) {
      formData.append('user_prompt', prompt);
    }

    formData.append('transparent_background', transparent);

    const response = await apiClient.post(ENDPOINTS.AI_GENERATE_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
      // Extended timeout para generación de IA (hasta 2 minutos)
      timeout: 120000,
    });

    return response.data;
  },

  /**
   * Obtener historial de generaciones
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página
   * @param {number} params.page_size - Tamaño de página
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getHistory(params = {}) {
    const response = await apiClient.get(ENDPOINTS.AI_GENERATION_HISTORY, {
      params: {
        page_size: 10,
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Obtener detalles de una generación específica
   * @param {number} id - ID de la generación
   * @returns {Promise<Object>}
   */
  async getGenerationById(id) {
    const response = await apiClient.get(ENDPOINTS.AI_GENERATION_DETAIL(id));
    return response.data;
  },

  /**
   * Guardar imagen generada a un producto
   * @param {number} generationId - ID de la generación
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>}
   */
  async saveToProduct(generationId, productId) {
    const response = await apiClient.post(
      ENDPOINTS.AI_SAVE_TO_PRODUCT(generationId),
      { product_id: productId }
    );
    return response.data;
  },

  /**
   * Descargar imagen generada
   * @param {string} imageUrl - URL de la imagen
   * @param {string} filename - Nombre del archivo para descargar
   */
  async downloadImage(imageUrl, filename = 'generated-image.png') {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      throw error;
    }
  },

  /**
   * Regenerar imagen con nuevos parámetros
   * @param {number} generationId - ID de la generación original
   * @param {Object} newParams - Nuevos parámetros (prompt, transparent)
   * @returns {Promise<Object>}
   */
  async regenerateImage(generationId, newParams = {}) {
    const response = await apiClient.post(
      ENDPOINTS.AI_REGENERATE(generationId),
      newParams,
      {
        timeout: 120000, // 2 minutos
      }
    );
    return response.data;
  },
};

export default aiImageService;
