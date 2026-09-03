import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Configuración de Frosty, el agente de pedidos por WhatsApp.
 *
 * Todos los endpoints exigen rol admin: es el dueño quien decide cómo habla su
 * negocio. Las reglas del pedido (cobertura, pagos, cómo se cotiza) no se
 * exponen a propósito; eso vive en el prompt, con tests detrás.
 */
export const whatsappAgentService = {
  /** Identidad, tono (el elegido y el catálogo completo), dueño y los cuatro interruptores. */
  async getSettings() {
    const response = await apiClient.get(ENDPOINTS.WHATSAPP_AGENT_SETTINGS);
    return response.data;
  },

  /** @param {{ agent_name?: string, tone_preset?: string, tone?: string, owner_phones?: string, stickers_enabled?: boolean, reactions_enabled?: boolean, product_photos_enabled?: boolean, quick_replies_enabled?: boolean }} data */
  async updateSettings(data) {
    const response = await apiClient.patch(ENDPOINTS.WHATSAPP_AGENT_SETTINGS, data);
    return response.data;
  },

  /**
   * Crea un tono nuevo. La clave se genera del nombre en el servidor: es lo
   * que apunta desde la configuración y por eso no se teclea.
   * @param {{ name: string, description: string, sample?: string, persona: string }} data
   */
  async createTone(data) {
    const response = await apiClient.post(ENDPOINTS.WHATSAPP_AGENT_TONES, data);
    return response.data;
  },

  /** Afina un tono: su nombre, cómo se describe o la personalidad que lee el agente. */
  async updateTone(id, data) {
    const response = await apiClient.patch(ENDPOINTS.WHATSAPP_AGENT_TONE_DETAIL(id), data);
    return response.data;
  },

  /**
   * Borra un tono. El servidor se niega si es el que está en uso o el último
   * que queda: sin catálogo no habría nada que elegir.
   */
  async deleteTone(id) {
    await apiClient.delete(ENDPOINTS.WHATSAPP_AGENT_TONE_DETAIL(id));
  },

  /** Devuelve un tono de fábrica al texto con el que vino. */
  async restoreTone(id) {
    const response = await apiClient.post(ENDPOINTS.WHATSAPP_AGENT_TONE_RESTORE(id));
    return response.data;
  },

  /** El banco completo (activos e inactivos), con su miniatura en base64. */
  async listStickers() {
    const response = await apiClient.get(ENDPOINTS.WHATSAPP_STICKERS);
    return response.data;
  },

  /**
   * Sube un sticker nuevo. El archivo puede ser cualquier imagen, un GIF o un
   * video corto: el backend lo convierte al WebP que exige WhatsApp.
   * @param {{ archivo: File, label: string, description: string }} data
   */
  async createSticker({ archivo, label, description }) {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('label', label);
    form.append('description', description);
    const response = await apiClient.post(ENDPOINTS.WHATSAPP_STICKERS, form);
    return response.data;
  },

  /**
   * Cambia el texto, el estado o la imagen misma. Sin `archivo` la imagen
   * guardada se conserva: editar el "cuándo usarlo" no debería obligar a
   * volver a buscar el original en la galería.
   */
  async updateSticker(id, { archivo, ...data }) {
    let payload = data;
    if (archivo) {
      payload = new FormData();
      payload.append('archivo', archivo);
      Object.entries(data).forEach(([key, value]) => payload.append(key, value));
    }
    const response = await apiClient.patch(ENDPOINTS.WHATSAPP_STICKER_DETAIL(id), payload);
    return response.data;
  },

  async deleteSticker(id) {
    await apiClient.delete(ENDPOINTS.WHATSAPP_STICKER_DETAIL(id));
  },
};

export default whatsappAgentService;
