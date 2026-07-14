import distance from "@turf/distance";

// Zona de cobertura de domicilios: el local (Cra. 8 #18-13, Cumbal) y el radio
// máximo de entrega. Debe coincidir con DELIVERY_CENTER_* / DELIVERY_RADIUS_KM
// del backend (config/settings.py). Vive aparte de DeliveryMap para que el
// checkout pueda validar sin cargar el bundle de Mapbox.

export const STORE_LOCATION = { lat: 0.9082643, lng: -77.7904203 };

export const DELIVERY_RADIUS_KM = 1.5;

export const isWithinDeliveryArea = (lat, lng) =>
  distance([STORE_LOCATION.lng, STORE_LOCATION.lat], [lng, lat], {
    units: "kilometers",
  }) <= DELIVERY_RADIUS_KM;
