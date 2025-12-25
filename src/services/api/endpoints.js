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
  
  // Song Requests
  SONG_REQUESTS: '/song-requests/',
  SONG_REQUEST_DETAIL: (id) => `/song-requests/${id}/`,
};

export default ENDPOINTS;

