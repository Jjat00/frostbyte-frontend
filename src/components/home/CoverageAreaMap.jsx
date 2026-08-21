import React, { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layers, Undo2, Trash2, X, PenLine, Check } from "lucide-react";
import circle from "@turf/circle";
import { env } from "@/config";
import {
  STORE_LOCATION,
  COVERAGE_LIMITS,
  coverageGeoJson,
  coverageViewport,
  formatRadiusKm,
} from "@/lib/deliveryArea";
import { themeColorRaw } from "@/lib/themeColors";
import { cn } from "@/lib/utils";

// Mismo par de estilos que el mapa del checkout: el satélite ayuda a reconocer
// qué barrios entran en el área; el plano, a leer las calles.
const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

// Con muchos vértices los puntos medios saturan la pantalla (y el pulgar)
const MAX_POINTS_WITH_MIDPOINTS = 40;

const round7 = (n) => Number(Number(n).toFixed(7));

const polygonFeature = (points) => ({
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [[...points, points[0]]] },
});

const lineFeature = (points) => ({
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: points },
});

const midpoint = ([lng1, lat1], [lng2, lat2]) => [
  (lng1 + lng2) / 2,
  (lat1 + lat2) / 2,
];

/**
 * Mapa de la zona de domicilios: el local y el área cubierta, igual que la ve
 * el cliente al pedir.
 *
 * Con `editable` la zona se puede retocar, pero los puntos NO salen de una:
 * una figura ya trazada se ve limpia, solo su línea, y los vértices aparecen
 * al pulsar "Editar puntos" (una zona vacía entra a dibujar directo). En
 * edición está pensado para el pulgar: tocar el mapa agrega un vértice, los
 * vértices se arrastran, el punto medio de cada lado inserta uno nuevo y al
 * tocar un vértice aparece el botón de quitarlo. `onChange` recibe la lista de
 * puntos [lng, lat] de la figura en edición (la primera); las demás figuras se
 * pintan de contexto.
 *
 * Carga Mapbox (bundle pesado), así que se importa en diferido desde el
 * diálogo y no desde el dashboard.
 *
 * @param {{ polygons: number[][][], radiusKm: number, isPolygon: boolean }} coverage
 */
const CoverageAreaMap = ({
  coverage,
  editable = false,
  onChange,
  heightClass = "h-56 sm:h-72",
}) => {
  const token = env.MAPBOX_TOKEN;
  const [styleKey, setStyleKey] = useState("satellite");
  const [selected, setSelected] = useState(null);
  const secondaryColor = useMemo(() => themeColorRaw("--color-secondary"), []);
  // Al soltar un vértice, el navegador dispara también un click: sin esta
  // guarda, arrastrar terminaría alternando la selección del punto. El propio
  // click la consume, así que no hace falta un temporizador.
  const draggedRef = useRef(false);

  const points = coverage.polygons?.[0] || [];
  const extraPolygons = coverage.polygons?.slice(1) || [];
  // Una figura ya cerrada se muestra limpia; hasta que no lo esté, no hay nada
  // que mirar todavía y se sigue dibujando.
  const [editing, setEditing] = useState(() => points.length < 3);
  const drawing = editable && (editing || points.length < 3);

  const [viewState, setViewState] = useState(() =>
    coverageViewport(coverage, 12.6)
  );

  // En modo círculo el mapa reencuadra con cada cambio del radio: es justo lo
  // que se está evaluando. Dibujando un polígono NO se mueve solo, que sería
  // mareante mientras se colocan los puntos.
  const radiusKey = coverage.isPolygon ? null : coverage.radiusKm;
  useEffect(() => {
    if (radiusKey == null) return;
    setViewState((v) => ({
      ...v,
      longitude: STORE_LOCATION.lng,
      latitude: STORE_LOCATION.lat,
      zoom: coverageViewport(coverage, 12.6).zoom,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKey]);

  const commit = (next) => {
    onChange?.(next);
  };

  const addPoint = (lng, lat) => {
    if (points.length >= COVERAGE_LIMITS.maxPoints) return;
    commit([...points, [round7(lng), round7(lat)]]);
    setSelected(null);
  };

  const movePoint = (index, lng, lat) => {
    const next = points.map((p, i) =>
      i === index ? [round7(lng), round7(lat)] : p
    );
    commit(next);
  };

  const insertPoint = (index, point) => {
    if (points.length >= COVERAGE_LIMITS.maxPoints) return;
    const next = [...points];
    next.splice(index, 0, [round7(point[0]), round7(point[1])]);
    commit(next);
    setSelected(index);
  };

  const removePoint = (index) => {
    commit(points.filter((_, i) => i !== index));
    setSelected(null);
  };

  // Lo que se pinta: en lectura, la zona vigente; editando, la figura en curso
  // (más las figuras extra, que no se tocan aquí).
  const geoJson = useMemo(() => {
    if (!drawing) return coverageGeoJson(coverage);
    const features = extraPolygons
      .filter((p) => p.length >= 3)
      .map(polygonFeature);
    if (points.length >= 3) features.push(polygonFeature(points));
    else if (points.length === 2) features.push(lineFeature(points));
    return { type: "FeatureCollection", features };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing, coverage, points]);

  // Editando siempre se ve el círculo de respaldo como referencia de escala
  const referenceCircle = useMemo(
    () =>
      drawing
        ? circle([STORE_LOCATION.lng, STORE_LOCATION.lat], coverage.radiusKm, {
            steps: 64,
            units: "kilometers",
          })
        : null,
    [drawing, coverage.radiusKm]
  );

  const midpoints = useMemo(() => {
    if (!drawing || points.length < 2) return [];
    if (points.length > MAX_POINTS_WITH_MIDPOINTS) return [];
    // El último par cierra el anillo (último → primero); con solo dos puntos
    // ese cierre cae encima del primer punto medio, así que sobra.
    const pairs = points.map((point, i) => ({
      index: i + 1,
      coords: midpoint(point, points[(i + 1) % points.length]),
    }));
    return points.length === 2 ? pairs.slice(0, 1) : pairs;
  }, [drawing, points]);

  if (!token) {
    return (
      <div
        className={cn(
          heightClass,
          "rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center text-center px-4"
        )}
      >
        <p className="text-xs text-gray">
          Sin mapa disponible (falta el token de Mapbox).
          {editable
            ? " Sin él no se puede dibujar la zona: usa el círculo por radio."
            : ` La zona se guarda igual: ${formatRadiusKm(coverage.radiusKm)} alrededor del local.`}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        heightClass,
        "relative rounded-xl overflow-hidden border border-white/10"
      )}
    >
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={
          drawing ? (e) => addPoint(e.lngLat.lng, e.lngLat.lat) : undefined
        }
        mapboxAccessToken={token}
        mapStyle={MAP_STYLES[styleKey]}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
        cursor={drawing ? "crosshair" : "grab"}
      >
        {referenceCircle && (
          <Source id="coverage-reference" type="geojson" data={referenceCircle}>
            <Layer
              id="coverage-reference-line"
              type="line"
              paint={{
                "line-color": "#ffffff",
                "line-opacity": 0.25,
                "line-width": 1,
                "line-dasharray": [3, 3],
              }}
            />
          </Source>
        )}

        <Source id="coverage-preview" type="geojson" data={geoJson}>
          <Layer
            id="coverage-preview-fill"
            type="fill"
            paint={{ "fill-color": secondaryColor, "fill-opacity": 0.12 }}
          />
          <Layer
            id="coverage-preview-line"
            type="line"
            paint={{
              "line-color": secondaryColor,
              "line-opacity": 0.85,
              "line-width": 1.5,
              "line-dasharray": [2, 2],
            }}
          />
        </Source>

        <Marker
          longitude={STORE_LOCATION.lng}
          latitude={STORE_LOCATION.lat}
          anchor="center"
        >
          <div
            className="w-9 h-9 rounded-full bg-dark/85 border-2 border-secondary shadow-lg grid place-items-center pointer-events-none"
            title="Frostbyte"
          >
            <img
              src="/logo.png"
              alt="Frostbyte"
              className="w-6 h-6"
              draggable={false}
            />
          </div>
        </Marker>

        {/* Puntos medios: tocarlos inserta un vértice en ese lado */}
        {midpoints.map(({ index, coords }) => (
          <Marker
            key={`mid-${index}`}
            longitude={coords[0]}
            latitude={coords[1]}
            anchor="center"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                insertPoint(index, coords);
              }}
              className="w-6 h-6 grid place-items-center cursor-pointer"
              title="Insertar un punto aquí"
            >
              <span className="w-2.5 h-2.5 rounded-full border border-white/70 bg-dark/60" />
            </button>
          </Marker>
        ))}

        {/* Vértices de la figura en edición */}
        {drawing &&
          points.map((point, index) => (
            <Marker
              key={`vertex-${index}`}
              longitude={point[0]}
              latitude={point[1]}
              anchor="center"
              draggable
              onDragStart={() => {
                draggedRef.current = false;
                setSelected(index);
              }}
              onDrag={(e) => {
                draggedRef.current = true;
                movePoint(index, e.lngLat.lng, e.lngLat.lat);
              }}
              onDragEnd={(e) => movePoint(index, e.lngLat.lng, e.lngLat.lat)}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  // Click de cierre de un arrastre: se consume y no alterna
                  if (draggedRef.current) {
                    draggedRef.current = false;
                    return;
                  }
                  setSelected((s) => (s === index ? null : index));
                }}
                className="w-7 h-7 grid place-items-center cursor-grab active:cursor-grabbing"
              >
                <span
                  className={cn(
                    "block rounded-full border-2 shadow-md transition-all",
                    selected === index
                      ? "w-4 h-4 bg-primary border-white"
                      : "w-3 h-3 bg-secondary border-white/80"
                  )}
                />
              </div>
            </Marker>
          ))}

        <NavigationControl position="top-right" showCompass={false} />
      </Map>

      {/* Barra de herramientas */}
      <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setStyleKey((k) => (k === "satellite" ? "dark" : "satellite"))}
          className="flex items-center gap-1.5 rounded-full bg-dark/80 border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80 hover:bg-dark/95 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          {styleKey === "satellite" ? "Mapa" : "Satélite"}
        </button>

        {editable && !drawing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full bg-dark/80 border border-secondary/40 px-2.5 py-1.5 text-[11px] font-bold text-secondary hover:bg-dark/95 transition-colors cursor-pointer"
            title="Mostrar los puntos para ajustar la zona"
          >
            <PenLine className="w-3.5 h-3.5" />
            Editar puntos
          </button>
        )}

        {drawing && points.length > 0 && (
          <>
            {points.length >= COVERAGE_LIMITS.minPoints && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setSelected(null);
                }}
                className="flex items-center gap-1.5 rounded-full bg-dark/80 border border-secondary/40 px-2.5 py-1.5 text-[11px] font-bold text-secondary hover:bg-dark/95 transition-colors cursor-pointer"
                title="Ocultar los puntos y ver la zona limpia"
              >
                <Check className="w-3.5 h-3.5" />
                Listo
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                commit(points.slice(0, -1));
                setSelected(null);
              }}
              className="flex items-center gap-1.5 rounded-full bg-dark/80 border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80 hover:bg-dark/95 transition-colors cursor-pointer"
              title="Quitar el último punto"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Deshacer
            </button>
            <button
              type="button"
              onClick={() => {
                commit([]);
                setSelected(null);
              }}
              className="flex items-center gap-1.5 rounded-full bg-dark/80 border border-red-400/30 px-2.5 py-1.5 text-[11px] font-bold text-red-300 hover:bg-dark/95 transition-colors cursor-pointer"
              title="Borrar todos los puntos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </>
        )}
      </div>

      {/* Pie: instrucción o el punto seleccionado */}
      {drawing && (
        <div className="absolute inset-x-0 bottom-0 bg-dark/85 px-3 py-2">
          {selected != null ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/70">
                Punto {selected + 1} de {points.length} · arrástralo para ajustar
              </span>
              <button
                type="button"
                onClick={() => removePoint(selected)}
                className="flex items-center gap-1 rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Quitar
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-white/70 text-center">
              {points.length === 0
                ? "Toca el mapa para marcar la primera esquina de tu zona"
                : points.length < 3
                ? `Marca al menos ${COVERAGE_LIMITS.minPoints} esquinas (llevas ${points.length})`
                : "Toca para agregar · arrastra un punto para ajustar · toca el punto pequeño de un lado para insertar"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CoverageAreaMap;
