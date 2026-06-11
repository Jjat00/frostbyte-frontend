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
  AI_SUGGEST_HISTORY: '/ai/suggest-history/',

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

  // Polla Mundialista 2026
  POLLA_TOURNAMENT: '/polla/tournament/',
  POLLA_GROUPS: '/polla/groups/',
  POLLA_STANDINGS: '/polla/standings/',
  POLLA_TOPSCORERS: '/polla/topscorers/',
  POLLA_TEAM_DETAIL: (code) => `/polla/teams/${code}/`,
  POLLA_MATCHES: '/polla/matches/',
  POLLA_MATCH_DETAIL: (slug) => `/polla/matches/${slug}/`,
  POLLA_MATCH_PREDICT: (slug) => `/polla/matches/${slug}/predict/`,
  POLLA_MY_PREDICTIONS: '/polla/predictions/me/',
  POLLA_AWARDS: '/polla/awards/',
  POLLA_AWARD_PICK: (code) => `/polla/awards/${code}/pick/`,
  POLLA_BRACKET: '/polla/bracket/',
  POLLA_BRACKET_PICK: (slug) => `/polla/bracket/${slug}/pick/`,
  POLLA_RANKING: '/polla/ranking/',
  POLLA_MISSIONS: '/polla/missions/',
  POLLA_MY_STATS: '/polla/me/stats/',
  POLLA_REFERRAL: '/polla/referral/',
  POLLA_REFERRAL_CLAIM: '/polla/referral/claim/',

  // Polla - Dashboard de administración (solo staff/admin)
  POLLA_ADMIN_OVERVIEW: '/polla/admin/overview/',
  POLLA_ADMIN_PLAYERS: '/polla/admin/',
  POLLA_ADMIN_PLAYER: (userId) => `/polla/admin/${userId}/`,
};

export default ENDPOINTS;

