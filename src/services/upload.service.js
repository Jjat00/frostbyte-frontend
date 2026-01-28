import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para subir archivos
 */
export const uploadService = {
  /**
   * Sube una imagen al servidor
   * @param {File} file - Archivo de imagen a subir
   * @param {function} onProgress - Callback para progreso (0-100)
   * @returns {Promise<{url: string}>} URL de la imagen subida
   */
  async uploadImage(file, onProgress = null) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(ENDPOINTS.UPLOAD_IMAGE, formData, {
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
    });

    return response.data;
  },
};

export default uploadService;
