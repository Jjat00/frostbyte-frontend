import React, { useState } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  GeolocateControl,
  NavigationControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, LocateFixed, Loader2, Check, Layers } from "lucide-react";
import circle from "@turf/circle";
import { env } from "@/config";
import {
  STORE_LOCATION,
  DELIVERY_RADIUS_KM,
  isWithinDeliveryArea,
} from "@/lib/deliveryArea";

// Radio de cobertura como capa GeoJSON
const COVERAGE_GEOJSON = circle(
  [STORE_LOCATION.lng, STORE_LOCATION.lat],
  DELIVERY_RADIUS_KM,
  { steps: 64, units: "kilometers" }
);

// Satélite por defecto: en Cumbal las casas se ubican mejor viendo los techos
// que sobre un plano de calles.
const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

const round7 = (n) => Number(Number(n).toFixed(7));

/**
 * Captura de ubicación para domicilio.
 *
 * Con `VITE_MAPBOX_TOKEN` muestra un mapa interactivo: pin arrastrable, botón
 * "usar mi ubicación" (GPS) y selección tocando el mapa. Sin token, cae a un
 * modo GPS-only para no romper el checkout. En Cumbal lo importante es el pin +
 * la referencia escrita (el geocoding por dirección es poco fiable allí).
 *
 * value: { address, reference, lat, lng }
 * onChange: (partial) => void
 */
const DeliveryMap = ({ value, onChange }) => {
  const token = env.MAPBOX_TOKEN;
  const hasCoords = value?.lat != null && value?.lng != null;
  const lat = value?.lat ?? STORE_LOCATION.lat;
  const lng = value?.lng ?? STORE_LOCATION.lng;
  const outOfArea = hasCoords && !isWithinDeliveryArea(value.lat, value.lng);

  const [viewState, setViewState] = useState({
    longitude: lng,
    latitude: lat,
    // zoom 13.2 deja ver el círculo de cobertura completo al abrir
    zoom: hasCoords ? 16 : 13.2,
  });
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [styleKey, setStyleKey] = useState("satellite");

  const setPoint = (la, lo, recenter = true) => {
    onChange({ lat: round7(la), lng: round7(lo) });
    if (recenter) {
      setViewState((v) => ({
        ...v,
        latitude: la,
        longitude: lo,
        zoom: Math.max(v.zoom || 14, 16),
      }));
    }
  };

  const Inputs = (
    <>
      <input
        type="text"
        value={value?.address || ""}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="Dirección de entrega *"
        maxLength={300}
        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
      />
      <input
        type="text"
        value={value?.reference || ""}
        onChange={(e) => onChange({ reference: e.target.value })}
        placeholder="Referencia (ej: casa de 2 pisos, portón verde)"
        maxLength={300}
        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
      />
    </>
  );

  // ── Fallback sin token: solo GPS ──────────────────────────────────────────
  if (!token) {
    const useMyLocation = () => {
      if (!("geolocation" in navigator)) {
        setGeoError("Tu dispositivo no permite geolocalización.");
        return;
      }
      setLocating(true);
      setGeoError("");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPoint(pos.coords.latitude, pos.coords.longitude, false);
          setLocating(false);
        },
        () => {
          setGeoError("No pudimos obtener tu ubicación. Actívala e intenta de nuevo.");
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    return (
      <div className="space-y-3">
        <div className="relative h-40 rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] grid place-items-center">
          <div className="flex flex-col items-center gap-1 text-white/40">
            <MapPin className={`w-7 h-7 ${hasCoords ? "text-gold" : ""}`} />
            <span className="text-xs">
              {hasCoords
                ? `Ubicación marcada (${value.lat}, ${value.lng})`
                : "Marca tu ubicación de entrega"}
            </span>
            <span className="text-[10px] text-white/30">
              Entregamos hasta {DELIVERY_RADIUS_KM} km alrededor del local
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold text-sm font-semibold py-2.5 transition-colors disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasCoords ? (
            <Check className="w-4 h-4" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          {locating ? "Obteniendo ubicación…" : "Usar mi ubicación"}
        </button>
        {geoError && <p className="text-xs text-red-400">{geoError}</p>}
        {outOfArea && (
          <p className="text-xs text-red-400">
            Tu ubicación está fuera de nuestra zona de domicilios (
            {DELIVERY_RADIUS_KM} km alrededor del local).
          </p>
        )}
        {Inputs}
      </div>
    );
  }

  // ── Mapa interactivo (Mapbox) ─────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="relative h-56 rounded-xl overflow-hidden border border-white/10">
        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          onClick={(e) => setPoint(e.lngLat.lat, e.lngLat.lng, false)}
          mapboxAccessToken={token}
          mapStyle={MAP_STYLES[styleKey]}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          {/* Radio de cobertura de domicilios */}
          <Source id="delivery-coverage" type="geojson" data={COVERAGE_GEOJSON}>
            <Layer
              id="delivery-coverage-fill"
              type="fill"
              paint={{ "fill-color": "#f2c53d", "fill-opacity": 0.08 }}
            />
            <Layer
              id="delivery-coverage-line"
              type="line"
              paint={{
                "line-color": "#f2c53d",
                "line-opacity": 0.7,
                "line-width": 1.5,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>

          {/* El local */}
          <Marker
            longitude={STORE_LOCATION.lng}
            latitude={STORE_LOCATION.lat}
            anchor="center"
          >
            <div
              className="w-9 h-9 rounded-full bg-dark/85 border-2 border-gold shadow-lg grid place-items-center pointer-events-none"
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

          <GeolocateControl
            position="top-right"
            trackUserLocation={false}
            showUserHeading={false}
            onGeolocate={(e) =>
              setPoint(e.coords.latitude, e.coords.longitude)
            }
          />
          <NavigationControl position="top-right" showCompass={false} />
          {hasCoords && (
            <Marker
              longitude={lng}
              latitude={lat}
              draggable
              anchor="bottom"
              onDragEnd={(e) => setPoint(e.lngLat.lat, e.lngLat.lng, false)}
            >
              <MapPin
                className={`w-8 h-8 drop-shadow-lg ${
                  outOfArea ? "text-red-500" : "text-gold"
                }`}
                fill="currentColor"
              />
            </Marker>
          )}
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

        {!hasCoords && (
          <div className="absolute inset-x-0 bottom-0 bg-dark/80 backdrop-blur-sm px-3 py-2 text-center">
            <p className="text-[11px] text-white/70">
              Toca el mapa o usa el botón de ubicación para marcar tu entrega
            </p>
            <p className="text-[11px] text-gold/90 font-semibold">
              Entregamos solo dentro del área dorada ({DELIVERY_RADIUS_KM} km
              alrededor del local)
            </p>
          </div>
        )}
      </div>

      {hasCoords && !outOfArea && (
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Ubicación dentro de la zona de
          entrega · arrastra el pin para ajustar
        </p>
      )}
      {outOfArea && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" /> Tu ubicación está fuera de
          nuestra zona de domicilios: mueve el pin dentro del área dorada (
          {DELIVERY_RADIUS_KM} km alrededor del local)
        </p>
      )}

      {Inputs}
    </div>
  );
};

export default DeliveryMap;
