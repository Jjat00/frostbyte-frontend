import React, { useEffect, useMemo, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layers } from "lucide-react";
import circle from "@turf/circle";
import { env } from "@/config";
import {
  STORE_LOCATION,
  resolveDeliveryRadiusKm,
  formatRadiusKm,
  fitZoomForRadiusKm,
} from "@/lib/deliveryArea";
import { themeColorRaw } from "@/lib/themeColors";

// Mismo par de estilos que el mapa del checkout: el satélite ayuda a reconocer
// qué barrios entran en el área; el plano, a leer las calles.
const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

/**
 * Vista previa (solo lectura) de la zona de domicilios: el local y el círculo
 * de cobertura, igual que lo ve el cliente al pedir. La usa el staff para
 * dimensionar el radio antes de guardarlo, así que se redibuja con cada
 * cambio del valor en edición.
 *
 * Carga Mapbox (bundle pesado), así que se importa en diferido desde el
 * diálogo y no desde el dashboard.
 */
const CoverageAreaMap = ({ radiusKm }) => {
  const token = env.MAPBOX_TOKEN;
  const radius = resolveDeliveryRadiusKm(radiusKm);
  const [styleKey, setStyleKey] = useState("satellite");
  const secondaryColor = useMemo(() => themeColorRaw("--color-secondary"), []);

  // El preview es más bajo que el mapa del checkout: se abre un punto más lejos
  const [viewState, setViewState] = useState({
    longitude: STORE_LOCATION.lng,
    latitude: STORE_LOCATION.lat,
    zoom: fitZoomForRadiusKm(radius, 12.6),
  });

  // Al cambiar el radio, reencuadra: es justo lo que se está evaluando
  useEffect(() => {
    setViewState((v) => ({
      ...v,
      longitude: STORE_LOCATION.lng,
      latitude: STORE_LOCATION.lat,
      zoom: fitZoomForRadiusKm(radius, 12.6),
    }));
  }, [radius]);

  const coverageGeoJson = useMemo(
    () =>
      circle([STORE_LOCATION.lng, STORE_LOCATION.lat], radius, {
        steps: 64,
        units: "kilometers",
      }),
    [radius]
  );

  if (!token) {
    return (
      <div className="h-44 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center text-center px-4">
        <p className="text-xs text-gray">
          Sin mapa disponible (falta el token de Mapbox). El radio se guarda
          igual: {formatRadiusKm(radius)} alrededor del local.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden border border-white/10">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={token}
        mapStyle={MAP_STYLES[styleKey]}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
      >
        <Source id="coverage-preview" type="geojson" data={coverageGeoJson}>
          <Layer
            id="coverage-preview-fill"
            type="fill"
            paint={{ "fill-color": secondaryColor, "fill-opacity": 0.08 }}
          />
          <Layer
            id="coverage-preview-line"
            type="line"
            paint={{
              "line-color": secondaryColor,
              "line-opacity": 0.7,
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

        <NavigationControl position="top-right" showCompass={false} />
      </Map>

      <button
        type="button"
        onClick={() => setStyleKey((k) => (k === "satellite" ? "dark" : "satellite"))}
        className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-dark/80 border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80 hover:bg-dark/95 transition-colors cursor-pointer"
      >
        <Layers className="w-3.5 h-3.5" />
        {styleKey === "satellite" ? "Mapa" : "Satélite"}
      </button>
    </div>
  );
};

export default CoverageAreaMap;
