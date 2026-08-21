import circle from "@turf/circle";
import distance from "@turf/distance";
import area from "@turf/area";
import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

// Zona de cobertura de domicilios. El local (Cra. 8 #18-13, Cumbal) es fijo y
// debe coincidir con DELIVERY_CENTER_* del backend; la zona la configura el
// admin y llega en la config pública (/my-orders/config/) de dos formas:
//
//   `delivery_area`      -> polígonos dibujados a mano. Si vienen, MANDAN.
//   `delivery_radius_km` -> el círculo de siempre, respaldo mientras no haya
//                           polígono (un círculo cubre barrios que no interesan
//                           y deja fuera calles que sí).
//
// Vive aparte de DeliveryMap para que el checkout pueda validar sin cargar el
// bundle de Mapbox.

export const STORE_LOCATION = { lat: 0.9082643, lng: -77.7904203 };

export const DEFAULT_DELIVERY_RADIUS_KM = 1.5;

// Deben coincidir con MAX_COVERAGE_POLYGONS / MIN / MAX_POLYGON_POINTS del
// backend, que es quien valida de verdad.
export const COVERAGE_LIMITS = {
  maxPolygons: 8,
  minPoints: 3,
  maxPoints: 200,
};

/** Normaliza el radio que llega de la API; cae al default si viene inservible. */
export const resolveDeliveryRadiusKm = (value) => {
  const km = Number(value);
  return Number.isFinite(km) && km > 0 ? km : DEFAULT_DELIVERY_RADIUS_KM;
};

const isPoint = (value) =>
  Array.isArray(value) &&
  value.length === 2 &&
  Number.isFinite(Number(value[0])) &&
  Number.isFinite(Number(value[1]));

/**
 * Deja `delivery_area` en su forma canónica: lista de figuras, cada una lista
 * de puntos [lng, lat] con el anillo abierto (el cierre lo pone el GeoJSON).
 * Lo que no sirva se descarta en silencio: mejor caer al círculo que dejar el
 * pueblo entero fuera de zona por un dato corrupto.
 */
export const normalizeDeliveryArea = (value) => {
  if (!Array.isArray(value) || value.length === 0) return [];
  // Una figura suelta ([[lng, lat], ...]) también vale
  const polygons = isPoint(value[0]) ? [value] : value;
  return polygons
    .filter(Array.isArray)
    .map((polygon) => {
      const points = polygon
        .filter(isPoint)
        .map(([lng, lat]) => [Number(lng), Number(lat)]);
      const [first] = points;
      const last = points[points.length - 1];
      // Anillo cerrado explícito: el punto repetido sobra
      if (points.length > 1 && first[0] === last[0] && first[1] === last[1]) {
        points.pop();
      }
      return points;
    })
    .filter((points) => points.length >= COVERAGE_LIMITS.minPoints)
    .slice(0, COVERAGE_LIMITS.maxPolygons);
};

/**
 * Zona vigente a partir de la config pública (o de valores en edición).
 * @returns {{ polygons: number[][][], radiusKm: number, isPolygon: boolean }}
 */
export const resolveCoverage = (config) => {
  const polygons = normalizeDeliveryArea(
    config?.delivery_area ?? config?.polygons
  );
  return {
    polygons,
    radiusKm: resolveDeliveryRadiusKm(
      config?.delivery_radius_km ?? config?.radiusKm
    ),
    isPolygon: polygons.length > 0,
  };
};

/** El anillo que espera GeoJSON: mismo primer y último punto. */
const closeRing = (points) => [...points, points[0]];

/**
 * Figuras que ya encierran un área. Mientras el admin dibuja hay una figura de
 * 1 o 2 puntos que todavía no es un polígono: pintarla o medirla daría
 * geometrías inválidas, así que estas funciones la ignoran y tratan la zona
 * como el círculo hasta que se cierre.
 */
const drawablePolygons = (coverage) =>
  (coverage?.polygons || []).filter(
    (points) => Array.isArray(points) && points.length >= COVERAGE_LIMITS.minPoints
  );

/** La zona como GeoJSON, lista para pintarse en Mapbox (polígono o círculo). */
export const coverageGeoJson = (coverage) => {
  const polygons = drawablePolygons(coverage);
  if (!polygons.length) {
    return circle(
      [STORE_LOCATION.lng, STORE_LOCATION.lat],
      resolveDeliveryRadiusKm(coverage?.radiusKm),
      { steps: 64, units: "kilometers" }
    );
  }
  return {
    type: "FeatureCollection",
    features: polygons.map((points) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [closeRing(points)] },
    })),
  };
};

/** ¿La ubicación entra en la zona? El polígono manda; si no hay, el círculo. */
export const isWithinCoverage = (lat, lng, coverage) => {
  const polygons = drawablePolygons(coverage);
  if (polygons.length) {
    const point = { type: "Point", coordinates: [lng, lat] };
    return polygons.some((points) =>
      booleanPointInPolygon(point, {
        type: "Polygon",
        coordinates: [closeRing(points)],
      })
    );
  }
  return (
    distance([STORE_LOCATION.lng, STORE_LOCATION.lat], [lng, lat], {
      units: "kilometers",
    }) <= resolveDeliveryRadiusKm(coverage?.radiusKm)
  );
};

/** Área cubierta en km², para dimensionar la zona de un vistazo. */
export const coverageAreaKm2 = (coverage) => {
  const km = resolveDeliveryRadiusKm(coverage?.radiusKm);
  if (!drawablePolygons(coverage).length) return Math.PI * km * km;
  return area(coverageGeoJson(coverage)) / 1e6;
};

/** Distancia del local al punto más lejano de la zona dibujada, en km. */
export const coverageReachKm = (coverage) => {
  const polygons = drawablePolygons(coverage);
  if (!polygons.length) return resolveDeliveryRadiusKm(coverage?.radiusKm);
  return polygons.reduce(
    (max, points) =>
      points.reduce(
        (m, [lng, lat]) =>
          Math.max(
            m,
            distance([STORE_LOCATION.lng, STORE_LOCATION.lat], [lng, lat], {
              units: "kilometers",
            })
          ),
        max
      ),
    0
  );
};

/**
 * El círculo vigente convertido en puntos editables. Dibujar desde cero cuesta;
 * casi siempre lo que se quiere es "esto, pero recortando allá y estirando
 * acá", así que el editor puede arrancar del círculo y mover sus vértices.
 */
export const circleToPolygonPoints = (radiusKm, steps = 12) => {
  const ring = circle(
    [STORE_LOCATION.lng, STORE_LOCATION.lat],
    resolveDeliveryRadiusKm(radiusKm),
    { steps, units: "kilometers" }
  ).geometry.coordinates[0];
  // Turf cierra el anillo repitiendo el primer punto; aquí el cierre es implícito
  return ring
    .slice(0, -1)
    .map(([lng, lat]) => [Number(lng.toFixed(7)), Number(lat.toFixed(7))]);
};

/** Radio legible para mensajes al cliente: 1.5 -> "1.5 km", 2.0 -> "2 km". */
export const formatRadiusKm = (radiusKm) =>
  `${Number(resolveDeliveryRadiusKm(radiusKm).toFixed(2))} km`;

/**
 * La zona en palabras, para los mensajes al cliente. Con polígono no se puede
 * decir "X km alrededor del local" sin mentir: la zona es irregular.
 */
export const coverageLabel = (coverage) =>
  drawablePolygons(coverage).length
    ? "la zona marcada en el mapa"
    : `${formatRadiusKm(coverage?.radiusKm)} alrededor del local`;

/**
 * Zoom que deja ver completa un área de `km` de radio: 13.2 encuadra 1.5 km en
 * un mapa de altura normal, y cada duplicación resta un nivel. Baja `baseZoom`
 * cuando el mapa es más pequeño (ej: el preview del dashboard).
 */
export const fitZoomForRadiusKm = (radiusKm, baseZoom = 13.2) => {
  const km = resolveDeliveryRadiusKm(radiusKm);
  return Math.min(16, Math.max(9, baseZoom - Math.log2(km / 1.5)));
};

/**
 * Encuadre que muestra la zona completa. El círculo se centra en el local; el
 * polígono, en su propio bbox: una zona dibujada no tiene por qué rodear al
 * local (puede estirarse hacia un solo lado del pueblo).
 */
export const coverageViewport = (coverage, baseZoom = 13.2) => {
  if (!drawablePolygons(coverage).length) {
    return {
      longitude: STORE_LOCATION.lng,
      latitude: STORE_LOCATION.lat,
      zoom: fitZoomForRadiusKm(coverage?.radiusKm, baseZoom),
    };
  }
  const [minLng, minLat, maxLng, maxLat] = bbox(coverageGeoJson(coverage));
  // Radio equivalente: media diagonal del bbox, para reusar la misma escala
  const halfDiagonalKm =
    distance([minLng, minLat], [maxLng, maxLat], { units: "kilometers" }) / 2;
  return {
    longitude: (minLng + maxLng) / 2,
    latitude: (minLat + maxLat) / 2,
    zoom: fitZoomForRadiusKm(Math.max(halfDiagonalKm, 0.05), baseZoom),
  };
};
