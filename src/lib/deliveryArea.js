import distance from "@turf/distance";

// Zona de cobertura de domicilios: el local (Cra. 8 #18-13, Cumbal) y el radio
// máximo de entrega. El centro es fijo (debe coincidir con DELIVERY_CENTER_* del
// backend); el radio lo configura el admin desde el dashboard y llega en la
// config pública (`delivery_radius_km` de /my-orders/config/). La constante de
// abajo es solo el respaldo mientras esa config carga. Vive aparte de
// DeliveryMap para que el checkout pueda validar sin cargar el bundle de Mapbox.

export const STORE_LOCATION = { lat: 0.9082643, lng: -77.7904203 };

export const DEFAULT_DELIVERY_RADIUS_KM = 1.5;

/** Normaliza el radio que llega de la API; cae al default si viene inservible. */
export const resolveDeliveryRadiusKm = (value) => {
  const km = Number(value);
  return Number.isFinite(km) && km > 0 ? km : DEFAULT_DELIVERY_RADIUS_KM;
};

/** Radio legible para mensajes al cliente: 1.5 -> "1.5 km", 2.0 -> "2 km". */
export const formatRadiusKm = (radiusKm) =>
  `${Number(resolveDeliveryRadiusKm(radiusKm).toFixed(2))} km`;

/**
 * Zoom que deja ver completo el círculo de cobertura: 13.2 encuadra 1.5 km en
 * un mapa de altura normal, y cada duplicación del radio resta un nivel. Baja
 * `baseZoom` cuando el mapa es más pequeño (ej: el preview del dashboard).
 */
export const fitZoomForRadiusKm = (radiusKm, baseZoom = 13.2) => {
  const km = resolveDeliveryRadiusKm(radiusKm);
  return Math.min(16, Math.max(9, baseZoom - Math.log2(km / 1.5)));
};

/** Área cubierta en km², para dimensionar el radio de un vistazo. */
export const coverageAreaKm2 = (radiusKm) => {
  const km = resolveDeliveryRadiusKm(radiusKm);
  return Math.PI * km * km;
};

export const isWithinDeliveryArea = (lat, lng, radiusKm) =>
  distance([STORE_LOCATION.lng, STORE_LOCATION.lat], [lng, lat], {
    units: "kilometers",
  }) <= resolveDeliveryRadiusKm(radiusKm);
