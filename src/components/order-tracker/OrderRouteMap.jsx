import React, { useMemo, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Layers } from "lucide-react";
import { env } from "@/config";
import { STORE_LOCATION } from "@/lib/deliveryArea";

// Satélite por defecto, igual que el mapa del checkout: en Cumbal las casas
// se ubican mejor viendo los techos que sobre un plano de calles.
const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

/**
 * Mapa de solo lectura del recorrido de un domicilio: el local (Frostbyte)
 * y la casa del cliente, con una línea punteada entre ambos. Se encuadra
 * automáticamente para que los dos puntos queden visibles.
 *
 * Sin `VITE_MAPBOX_TOKEN` o sin coordenadas no renderiza nada (la dirección
 * escrita ya se muestra aparte).
 */
const OrderRouteMap = ({ lat, lng }) => {
  const token = env.MAPBOX_TOKEN;
  const [styleKey, setStyleKey] = useState("satellite");

  const initialViewState = useMemo(
    () => ({
      bounds: [
        [Math.min(lng, STORE_LOCATION.lng), Math.min(lat, STORE_LOCATION.lat)],
        [Math.max(lng, STORE_LOCATION.lng), Math.max(lat, STORE_LOCATION.lat)],
      ],
      fitBoundsOptions: { padding: 60, maxZoom: 16 },
    }),
    [lat, lng]
  );

  const routeGeojson = useMemo(
    () => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [STORE_LOCATION.lng, STORE_LOCATION.lat],
          [lng, lat],
        ],
      },
    }),
    [lat, lng]
  );

  if (!token || lat == null || lng == null) return null;

  return (
    <div className="relative h-48 lg:h-64 rounded-xl overflow-hidden border border-white/10">
      <Map
        initialViewState={initialViewState}
        mapboxAccessToken={token}
        mapStyle={MAP_STYLES[styleKey]}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        cooperativeGestures
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Línea local → casa */}
        <Source id="order-route" type="geojson" data={routeGeojson}>
          <Layer
            id="order-route-line"
            type="line"
            paint={{
              "line-color": "#00e0ff",
              "line-opacity": 0.8,
              "line-width": 2,
              "line-dasharray": [1.5, 1.5],
            }}
          />
        </Source>

        {/* El local */}
        <Marker
          longitude={STORE_LOCATION.lng}
          latitude={STORE_LOCATION.lat}
          anchor="center"
        >
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-dark/85 border-2 border-secondary shadow-lg grid place-items-center">
              <img
                src="/logo.png"
                alt="Frostbyte"
                className="w-6 h-6"
                draggable={false}
              />
            </div>
            <span className="mt-0.5 rounded-full bg-dark/85 border border-white/15 px-2 py-0.5 text-[10px] font-bold text-white/85">
              Frostbyte
            </span>
          </div>
        </Marker>

        {/* La casa del cliente */}
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="flex flex-col items-center pointer-events-none">
            <span className="mb-0.5 rounded-full bg-dark/85 border border-white/15 px-2 py-0.5 text-[10px] font-bold text-white/85">
              Tu casa
            </span>
            <MapPin
              className="w-8 h-8 text-secondary drop-shadow-lg"
              fill="currentColor"
            />
          </div>
        </Marker>
      </Map>

      {/* Alternar satélite / mapa */}
      <button
        type="button"
        onClick={() =>
          setStyleKey((k) => (k === "satellite" ? "dark" : "satellite"))
        }
        className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-dark/80 backdrop-blur-sm border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80 hover:bg-dark/95 transition-colors cursor-pointer"
      >
        <Layers className="w-3.5 h-3.5" />
        {styleKey === "satellite" ? "Mapa" : "Satélite"}
      </button>
    </div>
  );
};

export default OrderRouteMap;
