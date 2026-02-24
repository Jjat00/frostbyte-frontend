/**
 * Endpoints de la API centralizados
 */
export const ENDPOINTS = {
  // Categories
  CATEGORIES: '/categories/',
  CATEGORY_DETAIL: (slug) => `/categories/${slug}/`,
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (slug) => `/products/${slug}/`,
  PRODUCTS_BY_CATEGORY: (categorySlug) => `/products/?category=${categorySlug}`,
  PRODUCT_VARIANTS: (slug) => `/products/${slug}/variants/`,
  
  // Variants
  VARIANTS: '/variants/',
  VARIANT_DETAIL: (id) => `/variants/${id}/`,

  // Upload
  UPLOAD_IMAGE: '/upload/image/',

  // AI Image Generation
  AI_GENERATE_IMAGE: '/ai/generations/',
  AI_GENERATION_HISTORY: '/ai/generations/',
  AI_GENERATION_DETAIL: (id) => `/ai/generations/${id}/`,
  AI_SAVE_TO_R2: (generationId) => `/ai/generations/${generationId}/save_to_r2/`,
  AI_SAVE_TO_PRODUCT: (generationId) => `/ai/generations/${generationId}/save_to_product/`,
  AI_DISCARD: (generationId) => `/ai/generations/${generationId}/discard/`,
  AI_TEMP_IMAGE: (generationId, type) => `/ai/generations/${generationId}/temp-image/${type}/`,
  AI_SUGGEST_DESCRIPTION: '/ai/suggest-description/',

  // Song Requests
  SONG_REQUESTS: '/song-requests/',
  SONG_REQUEST_DETAIL: (id) => `/song-requests/${id}/`,

  // Feedback
  FEEDBACK: '/feedback/',
  FEEDBACK_DETAIL: (id) => `/feedback/${id}/`,

  // AI Drink Recommender
  AI_MOOD_RECOMMEND: '/motivational/recommend/',
  AI_QUIZ_RECOMMEND: '/motivational/quiz/',
  AI_VOICE_TRANSCRIBE: '/motivational/transcribe/',
};

export default ENDPOINTS;

