// Products hooks
export { useProducts, useProduct, useProductsByCategory, productKeys } from './useProducts';

// Categories hooks
export { useCategories, useCategory, useActiveCategories, categoryKeys } from './useCategories';

// Music hooks
export { useSongRequestsNotification } from './useSongRequestsNotification';

// WebSocket hook
export { useWebSocket } from './useWebSocket';

// Carrito: agregar producto (el login del cliente se pide antes, en /domicilios)
export { useAddToCart } from './useAddToCart';

// A dónde vuelve "la carta": recuerda la mesa del QR durante la visita
export { useCartaPath, isTablePath } from './useCartaPath';

// Customer orders hooks (pedidos en línea del cliente)
export {
  useStoreConfig,
  useMyOrders,
  useMyOrder,
  useCreateOrder,
  useMyOrdersLive,
  myOrderKeys,
} from './useCustomerOrders';

// Configuración operativa del local (staff): abierto/cerrado, domicilios
export {
  useStoreSettings,
  useUpdateStoreSettings,
  storeSettingsKeys,
} from './useStoreSettings';

// Agente de WhatsApp (Frosty): configuración y banco de stickers (solo admin)
export {
  useAgentSettings,
  useUpdateAgentSettings,
  useCreateTone,
  useUpdateTone,
  useDeleteTone,
  useRestoreTone,
  useStickers,
  useCreateSticker,
  useUpdateSticker,
  useDeleteSticker,
  whatsappAgentKeys,
} from './useWhatsAppAgent';

// AI Image Generation hooks
export { useImageGeneration, useGenerationHistory, useImageValidation } from './useImageGeneration';
export { useImageUpload } from './useImageUpload';

// Viewport visibility hook
export { useInViewport } from './useInViewport';

// Mobile detection hook
export { useIsMobile, useMediaQuery } from './useIsMobile';

