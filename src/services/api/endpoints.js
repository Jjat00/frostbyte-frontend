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
  SONG_REQUESTS_SEARCH: '/song-requests/search/',
  SONG_REQUESTS_NOW_PLAYING: '/song-requests/now-playing/',
  SONG_REQUESTS_QUEUE_STATUS: '/song-requests/queue-status/',
  SONG_REQUESTS_SPOTIFY_STATUS: '/song-requests/spotify-status/',

  // Lyrics
  SONG_REQUESTS_LYRICS: '/song-requests/lyrics/',

  // Spotify Player Controls
  PLAYER_PAUSE: '/song-requests/player/pause/',
  PLAYER_RESUME: '/song-requests/player/resume/',
  PLAYER_NEXT: '/song-requests/player/next/',
  PLAYER_PREVIOUS: '/song-requests/player/previous/',
  PLAYER_PLAY_TRACK: '/song-requests/player/play-track/',
  PLAYER_VOLUME: '/song-requests/player/volume/',

  // Spotify Auth
  SPOTIFY_AUTH: '/spotify/auth/',
  SPOTIFY_DISCONNECT: '/spotify/disconnect/',

  // Music Settings
  MUSIC_SETTINGS: '/music-settings/',

  // Feedback
  FEEDBACK: '/feedback/',
  FEEDBACK_DETAIL: (id) => `/feedback/${id}/`,

  // AI Drink Recommender
  AI_MOOD_RECOMMEND: '/motivational/recommend/',
  AI_QUIZ_RECOMMEND: '/motivational/quiz/',
  AI_VOICE_TRANSCRIBE: '/motivational/transcribe/',

  // Día de la Madre
  MOTHERS_DAY_PHRASE: '/motivational/phrase/dia-madre/',
  MOTHERS_DAY_GENERATE_PHRASE: '/motivational/generate-mothers-day-phrase/',
  MOTHERS_DAY_GENERATE_IMAGE: '/motivational/generate-mothers-day-image/',
  MOTHER_DEDICATIONS: '/motivational/mother-dedications/',
  MOTHER_DEDICATIONS_CREATE: '/motivational/mother-dedications/create/',

  // Recetarios
  RECETARIOS: '/recetarios/recipes/',
  RECETARIO_DETAIL: (slug) => `/recetarios/recipes/${slug}/`,

  // YouTube Video Requests
  VIDEO_REQUESTS: '/video-requests/',
  VIDEO_REQUEST_DETAIL: (id) => `/video-requests/${id}/`,
  VIDEO_REQUESTS_SEARCH: '/video-requests/search/',
  VIDEO_REQUESTS_RECOMMENDATIONS: '/video-requests/recommendations/',
  VIDEO_REQUESTS_QUOTA_STATUS: '/video-requests/quota-status/',
  VIDEO_REQUESTS_QUOTA_RESET: '/video-requests/quota-reset/',
  VIDEO_REQUESTS_NOW_PLAYING: '/video-requests/now-playing/',
  VIDEO_REQUESTS_LAST_PLAYED: '/video-requests/last-played/',
  VIDEO_REQUESTS_QUEUE: '/video-requests/queue/',
  VIDEO_PLAYER_PLAY: '/video-requests/player/play/',
  VIDEO_PLAYER_NEXT: '/video-requests/player/next/',
  VIDEO_PLAYER_PAUSE: '/video-requests/player/pause/',
  VIDEO_PLAYER_RESUME: '/video-requests/player/resume/',
};

export default ENDPOINTS;

