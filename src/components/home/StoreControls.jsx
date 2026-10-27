import React, { lazy, Suspense, useState } from "react";
import {
  DoorOpen,
  DoorClosed,
  Bike,
  Ruler,
  Hexagon,
  Loader2,
  MapPinned,
  Coins,
} from "lucide-react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  COVERAGE_LIMITS,
  circleToPolygonPoints,
  coverageAreaKm2,
  coverageReachKm,
  resolveCoverage,
  resolveMinOrder,
} from "@/lib/deliveryArea";
import { cn } from "@/lib/utils";

// Mapbox pesa: solo se carga al abrir el diálogo de la zona, no con el dashboard
const CoverageAreaMap = lazy(() => import("./CoverageAreaMap"));

const formatKm2 = (value) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);

// "13:30" -> "1:30 p. m." Solo para mostrar: al backend siempre va HH:MM.
const formatHora = (hhmm) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const DEFAULT_OPENING_TIME = "13:30";

// Límites del radio de domicilios (deben coincidir con MIN/MAX_DELIVERY_RADIUS_KM
// del backend, que es quien valida de verdad).
const RADIUS_MIN_KM = 0.1;
const RADIUS_MAX_KM = 50;
const RADIUS_PRESETS = [1, 1.5, 2, 3];

// Pedido mínimo a domicilio. El tope del radio libre coincide con
// MAX_MIN_ORDER_FREE_RADIUS_M del backend.
const MIN_ORDER_PRESETS = [0, 12000, 16000, 20000];
const FREE_RADIUS_MAX_M = 5000;
const FREE_RADIUS_PRESETS = [100, 200, 300, 500];

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

// "16.000" o "$16000" -> 16000: en el celular la gente escribe con puntos
const parsePesos = (text) => {
  const digits = String(text ?? "").replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
};

/**
 * Controles operativos del local para el staff (admin y empleados), pensados
 * para la fila de "status chips" del dashboard /home.
 *
 * Tres controles independientes, cada uno con su diálogo. Recoger no es uno de
 * ellos: con el local abierto el cliente siempre puede pasar por su pedido, así
 * que no hay nada que decidir (Jaime, 15/09).
 *
 * Tres controles:
 *  1. Abierto/Cerrado  -> is_open (cerrado = no se puede pedir por ningún canal).
 *     Al cerrar se ajusta también `opening_time`: es la hora que el agente de
 *     WhatsApp le responde a quien escriba mientras el local está cerrado.
 *  2. Domicilios        -> customer_ordering_enabled.
 *  3. Zona de entrega   -> delivery_area / delivery_radius_km (solo admin; los
 *     empleados la ven). La zona se dibuja como polígono; el círculo por radio
 *     queda como respaldo para volver atrás rápido.
 *  4. Pedido mínimo     -> delivery_min_order y su zona libre, dibujada
 *     (delivery_min_order_free_area) o por radio (..._free_radius_m), solo
 *     admin. En la zona libre se pide de cualquier valor; fuera, el subtotal
 *     debe llegar al mínimo. Aplica en la app y en WhatsApp.
 */
const StoreControls = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateMutation = useUpdateStoreSettings();
  const { isAdmin } = useAuthStore();
  const isAdminUser = isAdmin();
  const { toast } = useToast();

  // Qué confirmación está abierta: null | "store" | "delivery" | "area" | "minOrder"
  const [confirm, setConfirm] = useState(null);
  // Cómo se define la zona en el diálogo: "polygon" (dibujada) | "circle" (radio)
  const [mode, setMode] = useState("polygon");
  // Figura en edición: lista de puntos [lng, lat]
  const [draftPoints, setDraftPoints] = useState([]);
  // Valor en edición del radio (texto: el usuario puede escribir "1,5")
  const [radiusDraft, setRadiusDraft] = useState("");
  // Hora de apertura en edición, formato HH:MM del <input type="time">
  const [openingDraft, setOpeningDraft] = useState("");
  // Pedido mínimo en edición (texto: se aceptan puntos de miles)
  const [minOrderDraft, setMinOrderDraft] = useState("");
  const [freeRadiusDraft, setFreeRadiusDraft] = useState("");
  // Zona sin mínimo, igual que la de domicilios: "polygon" | "circle"
  const [freeMode, setFreeMode] = useState("circle");
  const [freePoints, setFreePoints] = useState([]);

  if (isLoading || !settings) {
    return (
      <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center gap-2">
        <span className="w-2 h-2 bg-gray/40 rounded-full animate-pulse" />
        <span className="text-xs text-gray">Cargando estado…</span>
      </div>
    );
  }

  const isOpen = !!settings.is_open;
  const deliveryOn = !!settings.customer_ordering_enabled;
  const openingTime = settings.opening_time || DEFAULT_OPENING_TIME;

  // Zona vigente (la que ya ve el cliente)
  const coverage = resolveCoverage(settings);
  // Figuras extra: la UI edita una sola, pero el dato admite varias y no se
  // pierden por pasar por aquí.
  const extraPolygons = coverage.polygons.slice(1);
  const savedAreaLabel = coverage.isPolygon
    ? `${formatKm2(coverageAreaKm2(coverage))} km²`
    : `${Number(coverage.radiusKm.toFixed(2))} km`;

  // Se acepta coma decimal: en el celular es lo que sale del teclado en es-CO
  const radiusValue = Number(String(radiusDraft).replace(",", "."));
  const radiusValid =
    Number.isFinite(radiusValue) &&
    radiusValue >= RADIUS_MIN_KM &&
    radiusValue <= RADIUS_MAX_KM;
  const radiusRounded = radiusValid ? Number(radiusValue.toFixed(2)) : null;
  // El mapa previsualiza el último valor utilizable: mientras se escribe "1,"
  // no tiene sentido saltar al radio mínimo.
  const radiusPreview = radiusRounded ?? coverage.radiusKm;

  const drawingPolygon = mode === "polygon";
  const pointsValid =
    draftPoints.length >= COVERAGE_LIMITS.minPoints &&
    draftPoints.length <= COVERAGE_LIMITS.maxPoints;
  // Lo que se está evaluando en el diálogo, en el mismo formato que el mapa
  // espera. Con menos de 3 puntos aún no hay área, pero sí hay que pintarlos.
  const draftCoverage = drawingPolygon
    ? {
        polygons: [draftPoints, ...extraPolygons],
        radiusKm: coverage.radiusKm,
        isPolygon: true,
      }
    : { polygons: [], radiusKm: radiusPreview, isPolygon: false };

  const draftAreaKm2 = pointsValid
    ? coverageAreaKm2({
        polygons: [draftPoints, ...extraPolygons],
        radiusKm: coverage.radiusKm,
        isPolygon: true,
      })
    : 0;

  const areaChanged = drawingPolygon
    ? JSON.stringify(draftPoints) !== JSON.stringify(coverage.polygons[0] || [])
    : !coverage.isPolygon
    ? radiusRounded !== Number(coverage.radiusKm.toFixed(2))
    : true; // pasar de polígono a círculo siempre es un cambio

  // Para el empleado la zona y el mínimo son informativos: sin acción.
  const AreaTag = isAdminUser ? "button" : "div";

  const minOrder = resolveMinOrder(settings);
  const minOrderLabel = minOrder.amount
    ? `${formatCOP(minOrder.amount)}${
        minOrder.isPolygon
          ? " · zona libre"
          : minOrder.freeRadiusM
          ? ` · libre a ${minOrder.freeRadiusM} m`
          : ""
      }`
    : "Sin mínimo";
  const minOrderValue = parsePesos(minOrderDraft);
  const freeRadiusValue = parsePesos(freeRadiusDraft);
  const minOrderValid = minOrderValue !== null;
  const drawingFree = freeMode === "polygon";
  const freePointsValid =
    freePoints.length >= COVERAGE_LIMITS.minPoints &&
    freePoints.length <= COVERAGE_LIMITS.maxPoints;
  const freeRadiusValid =
    freeRadiusValue !== null && freeRadiusValue <= FREE_RADIUS_MAX_M;
  // Sin mínimo la zona libre no importa: no se exige dibujarla
  const freeZoneValid =
    !minOrderValue || (drawingFree ? freePointsValid : freeRadiusValid);
  const savedFreePolygon = minOrder.polygons[0] || [];
  const freeZoneChanged = drawingFree
    ? JSON.stringify(freePoints) !== JSON.stringify(savedFreePolygon)
    : minOrder.isPolygon || freeRadiusValue !== minOrder.freeRadiusM;
  const minOrderChanged = minOrderValue !== minOrder.amount || freeZoneChanged;
  // El radio en km que entiende el mapa; con 0 m se usa uno chico solo como
  // escala de referencia (la zona propia se oculta).
  const freeRadiusKm =
    (freeRadiusValid && freeRadiusValue ? freeRadiusValue : minOrder.freeRadiusM || 200) /
    1000;
  const freeCoverage = drawingFree
    ? { polygons: [freePoints], radiusKm: freeRadiusKm, isPolygon: true }
    : { polygons: [], radiusKm: freeRadiusKm, isPolygon: false };

  const openMinOrderDialog = () => {
    setMinOrderDraft(String(minOrder.amount));
    setFreeRadiusDraft(String(minOrder.freeRadiusM));
    setFreeMode(minOrder.isPolygon ? "polygon" : "circle");
    setFreePoints(savedFreePolygon);
    setConfirm("minOrder");
  };

  const saveMinOrder = () => {
    const data = { delivery_min_order: minOrderValue };
    if (minOrderValue && drawingFree) {
      // Figuras extra guardadas (la UI edita una) se conservan
      data.delivery_min_order_free_area = [freePoints, ...minOrder.polygons.slice(1)];
    } else if (minOrderValue) {
      // Lista vacía = se borra el dibujo y vuelve a mandar el radio
      data.delivery_min_order_free_radius_m = freeRadiusValue;
      data.delivery_min_order_free_area = [];
    }
    apply(
      data,
      minOrderValue
        ? `Pedido mínimo: ${formatCOP(minOrderValue)}`
        : "Domicilios sin pedido mínimo"
    );
  };

  const apply = (data, successMsg) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setConfirm(null);
        toast({ title: successMsg });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error.response?.data?.detail ||
            error.response?.data?.delivery_area ||
            error.response?.data?.delivery_radius_km ||
            error.response?.data?.delivery_min_order ||
            error.response?.data?.delivery_min_order_free_radius_m ||
            error.response?.data?.delivery_min_order_free_area ||
            error.response?.data?.error ||
            "No se pudo actualizar el estado.",
          variant: "destructive",
        });
      },
    });
  };

  const saveArea = () => {
    if (drawingPolygon) {
      apply(
        { delivery_area: [draftPoints, ...extraPolygons] },
        `Zona de domicilios: ${formatKm2(draftAreaKm2)} km²`
      );
    } else {
      // Lista vacía = se borra el polígono y vuelve a mandar el círculo
      apply(
        { delivery_radius_km: radiusRounded, delivery_area: [] },
        `Zona de domicilios: ${radiusRounded} km a la redonda`
      );
    }
  };

  return (
    <>
      {/* Chip: Abierto / Cerrado */}
      <button
        onClick={() => {
          setOpeningDraft(openingTime);
          setConfirm("store");
        }}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
          isOpen
            ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
            : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
        )}
        title="Cambiar estado del local"
      >
        <span className="relative flex h-2 w-2">
          {isOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              isOpen ? "bg-green-400" : "bg-red-400"
            )}
          />
        </span>
        {isOpen ? (
          <DoorOpen className="w-4 h-4 text-green-400" />
        ) : (
          <DoorClosed className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs text-gray">Frostbyte</span>
        <span
          className={cn(
            "text-xs font-semibold",
            isOpen ? "text-green-400" : "text-red-400"
          )}
        >
          {isOpen ? "Abierto" : "Cerrado"}
        </span>
      </button>

      {/* Chip: Domicilios activos / inactivos */}
      <button
        onClick={() => setConfirm("delivery")}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
          deliveryOn
            ? "bg-secondary/10 border-secondary/30 hover:bg-secondary/20"
            : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]"
        )}
        title="Activar o desactivar los domicilios en línea"
      >
        <Bike className={cn("w-4 h-4", deliveryOn ? "text-secondary" : "text-gray")} />
        <span className="text-xs text-gray">Domicilios</span>
        <span
          className={cn(
            "text-xs font-semibold",
            deliveryOn ? "text-secondary" : "text-gray"
          )}
        >
          {deliveryOn ? "Activos" : "Inactivos"}
        </span>
      </button>

      {/* Chip: zona de cobertura de domicilios (la cambia solo el admin) */}
      <AreaTag
        {...(isAdminUser
          ? {
              onClick: openAreaDialog,
              title: "Cambiar la zona de domicilios",
            }
          : { title: "Solo un administrador puede cambiar la zona" })}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition-colors",
          isAdminUser && "hover:bg-white/[0.08] cursor-pointer"
        )}
      >
        {coverage.isPolygon ? (
          <Hexagon className="w-4 h-4 text-secondary" />
        ) : (
          <Ruler className="w-4 h-4 text-secondary" />
        )}
        <span className="text-xs text-gray">
          {coverage.isPolygon ? "Zona" : "Radio"}
        </span>
        <span className="text-xs font-semibold text-light">{savedAreaLabel}</span>
      </AreaTag>

      {/* Chip: pedido mínimo a domicilio (lo cambia solo el admin) */}
      <AreaTag
        {...(isAdminUser
          ? {
              onClick: openMinOrderDialog,
              title: "Cambiar el pedido mínimo a domicilio",
            }
          : { title: "Solo un administrador puede cambiar el pedido mínimo" })}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition-colors",
          isAdminUser && "hover:bg-white/[0.08] cursor-pointer"
        )}
      >
        <Coins className="w-4 h-4 text-secondary" />
        <span className="text-xs text-gray">Mínimo</span>
        <span className="text-xs font-semibold text-light">{minOrderLabel}</span>
      </AreaTag>

      {/* Confirmación: abrir/cerrar local */}
      <ConfirmDialog
        open={confirm === "store"}
        tone={isOpen ? "danger" : "success"}
        icon={isOpen ? DoorClosed : DoorOpen}
        title={isOpen ? "¿Cerrar Frostbyte?" : "¿Abrir Frostbyte?"}
        message={
          isOpen
            ? "Los clientes verán el local como 'Cerrado' en la carta y en las mesas, y no podrán hacer pedidos en línea."
            : `Los clientes verán el local como 'Abierto' y podrán hacer pedidos (si los domicilios están activos). Mientras estuvo cerrado, el agente de WhatsApp respondió que normalmente abren a las ${formatHora(openingTime)}.`
        }
        confirmLabel={isOpen ? "Sí, cerrar" : "Sí, abrir"}
        loading={updateMutation.isPending}
        confirmDisabled={isOpen && !openingDraft}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          apply(
            isOpen
              ? { is_open: false, opening_time: openingDraft }
              : { is_open: true },
            isOpen ? "Frostbyte está cerrado" : "Frostbyte está abierto"
          )
        }
      >
        {/* Al cerrar, lo único que le queda al cliente es saber cuándo volver:
            esta hora es la que responde el agente de WhatsApp mientras tanto. */}
        {isOpen && (
          <div className="space-y-2">
            <label
              htmlFor="opening-time"
              className="block text-xs font-semibold text-gray"
            >
              ¿A qué hora abren normalmente?
            </label>
            <input
              id="opening-time"
              type="time"
              value={openingDraft}
              onChange={(e) => setOpeningDraft(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3 py-2.5 text-base text-light focus:outline-none focus:border-white/30"
            />
            <p className="text-xs text-gray">
              Es lo que el agente de WhatsApp le responde a quien escriba con el
              local cerrado ("normalmente abrimos a las{" "}
              {formatHora(openingDraft) || "…"}"). No abre el local: eso lo
              siguen haciendo ustedes desde aquí.
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Confirmación: activar/desactivar domicilios */}
      <ConfirmDialog
        open={confirm === "delivery"}
        tone={deliveryOn ? "danger" : "success"}
        icon={Bike}
        title={deliveryOn ? "¿Desactivar domicilios?" : "¿Activar domicilios?"}
        message={
          deliveryOn
            ? "Se ocultará la opción de pedir a domicilio en la app para los clientes."
            : "Los clientes podrán hacer pedidos a domicilio desde la app (con el local abierto)."
        }
        confirmLabel={deliveryOn ? "Sí, desactivar" : "Sí, activar"}
        loading={updateMutation.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          apply(
            { customer_ordering_enabled: !deliveryOn },
            deliveryOn ? "Domicilios desactivados" : "Domicilios activados"
          )
        }
      />

      {/* Edición de la zona de cobertura */}
      <ConfirmDialog
        open={confirm === "area"}
        tone="default"
        size="lg"
        icon={MapPinned}
        title="Zona de domicilios"
        message="Hasta dónde entregamos. Afecta el mapa del checkout, el bloqueo de pedidos fuera de zona y lo que responde el agente de WhatsApp."
        confirmLabel="Guardar"
        loading={updateMutation.isPending}
        confirmDisabled={
          !areaChanged ||
          (drawingPolygon ? !pointsValid : !radiusValid)
        }
        onCancel={() => setConfirm(null)}
        onConfirm={saveArea}
      >
        <div className="space-y-3">
          {/* Cómo se define la zona */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "polygon", icon: Hexagon, label: "Dibujar zona" },
              { key: "circle", icon: Ruler, label: "Círculo por radio" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                  mode === key
                    ? "border-secondary bg-secondary/15 text-secondary"
                    : "border-white/10 bg-white/[0.04] text-gray hover:bg-white/[0.08]"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* La misma vista que ve el cliente al pedir; editable si se dibuja */}
          <Suspense
            fallback={
              <div className="h-56 sm:h-72 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
              </div>
            }
          >
            <CoverageAreaMap
              key={mode}
              coverage={draftCoverage}
              editable={drawingPolygon}
              onChange={setDraftPoints}
            />
          </Suspense>

          {drawingPolygon ? (
            <>
              {pointsValid ? (
                <p className="text-xs text-gray">
                  {draftPoints.length} puntos · cubre ≈ {formatKm2(draftAreaKm2)}{" "}
                  km² y llega hasta{" "}
                  {coverageReachKm({
                    polygons: [draftPoints],
                    radiusKm: coverage.radiusKm,
                    isPolygon: true,
                  }).toFixed(1)}{" "}
                  km del local.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-400">
                    Marca al menos {COVERAGE_LIMITS.minPoints} puntos en el mapa
                    para cerrar la zona. El círculo punteado es el radio de{" "}
                    {Number(coverage.radiusKm.toFixed(2))} km, como referencia.
                  </p>
                  {draftPoints.length === 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPoints(circleToPolygonPoints(coverage.radiusKm))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray hover:bg-white/[0.08] transition-colors"
                    >
                      Partir del círculo actual y ajustarlo
                    </button>
                  )}
                </div>
              )}
              {extraPolygons.length > 0 && (
                <p className="text-xs text-gray">
                  Hay {extraPolygons.length} figura(s) adicional(es) guardadas:
                  se conservan tal cual.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={radiusDraft}
                  onChange={(e) => setRadiusDraft(e.target.value)}
                  placeholder="1.5"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3 py-2.5 text-base text-light placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
                <span className="text-sm text-gray shrink-0">km</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {RADIUS_PRESETS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setRadiusDraft(String(km))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                      radiusRounded === km
                        ? "border-secondary bg-secondary/15 text-secondary"
                        : "border-white/10 bg-white/[0.04] text-gray hover:bg-white/[0.08]"
                    )}
                  >
                    {km} km
                  </button>
                ))}
              </div>
              {radiusValid ? (
                <p className="text-xs text-gray">
                  Cubre ≈{" "}
                  {formatKm2(
                    coverageAreaKm2({
                      polygons: [],
                      radiusKm: radiusRounded,
                      isPolygon: false,
                    })
                  )}{" "}
                  km² alrededor del local.
                  {coverage.isPolygon &&
                    " Al guardar se borra la zona dibujada."}
                </p>
              ) : (
                radiusDraft !== "" && (
                  <p className="text-xs text-red-400">
                    Ingresa un radio entre {RADIUS_MIN_KM} y {RADIUS_MAX_KM} km.
                  </p>
                )
              )}
            </>
          )}
        </div>
      </ConfirmDialog>

      {/* Edición del pedido mínimo a domicilio */}
      <ConfirmDialog
        open={confirm === "minOrder"}
        tone="default"
        size="lg"
        icon={Coins}
        title="Pedido mínimo a domicilio"
        message="Cuánto debe sumar un domicilio en productos (sin contar el envío). En la zona cercana al local se puede pedir de cualquier valor. Aplica en la app y en el agente de WhatsApp; para recoger no hay mínimo."
        confirmLabel="Guardar"
        loading={updateMutation.isPending}
        confirmDisabled={!minOrderChanged || !minOrderValid || !freeZoneValid}
        onCancel={() => setConfirm(null)}
        onConfirm={saveMinOrder}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="min-order"
              className="block text-xs font-semibold text-gray"
            >
              Pedido mínimo (pesos)
            </label>
            <input
              id="min-order"
              type="text"
              inputMode="numeric"
              value={minOrderDraft}
              onChange={(e) => setMinOrderDraft(e.target.value)}
              placeholder="16000"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3 py-2.5 text-base text-light placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
            <div className="flex flex-wrap gap-2">
              {MIN_ORDER_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMinOrderDraft(String(value))}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    minOrderValue === value
                      ? "border-secondary bg-secondary/15 text-secondary"
                      : "border-white/10 bg-white/[0.04] text-gray hover:bg-white/[0.08]"
                  )}
                >
                  {value ? formatCOP(value) : "Sin mínimo"}
                </button>
              ))}
            </div>
          </div>

          {minOrderValue ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray">
                Zona sin pedido mínimo
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "polygon", icon: Hexagon, label: "Dibujar zona" },
                  { key: "circle", icon: Ruler, label: "Círculo por radio" },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFreeMode(key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                      freeMode === key
                        ? "border-secondary bg-secondary/15 text-secondary"
                        : "border-white/10 bg-white/[0.04] text-gray hover:bg-white/[0.08]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* La zona de domicilios va de fondo: el mínimo aplica en lo que
                  queda entre las dos */}
              <Suspense
                fallback={
                  <div className="h-56 sm:h-72 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                  </div>
                }
              >
                <CoverageAreaMap
                  key={`free-${freeMode}`}
                  coverage={freeCoverage}
                  editable={drawingFree}
                  onChange={setFreePoints}
                  context={coverage}
                  hideArea={!drawingFree && !freeRadiusValue}
                />
              </Suspense>

              {drawingFree ? (
                freePointsValid ? (
                  <p className="text-xs text-gray">
                    {freePoints.length} puntos · dentro de la figura se pide de
                    cualquier valor; en el resto de la zona de domicilios (borde
                    blanco), mínimo {formatCOP(minOrderValue)}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-400">
                      Marca al menos {COVERAGE_LIMITS.minPoints} puntos en el mapa
                      para cerrar la zona sin mínimo.
                    </p>
                    {freePoints.length === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFreePoints(circleToPolygonPoints(freeRadiusKm))
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray hover:bg-white/[0.08] transition-colors"
                      >
                        Partir del círculo de {Math.round(freeRadiusKm * 1000)} m y
                        ajustarlo
                      </button>
                    )}
                  </div>
                )
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      id="free-radius"
                      type="text"
                      inputMode="numeric"
                      value={freeRadiusDraft}
                      onChange={(e) => setFreeRadiusDraft(e.target.value)}
                      placeholder="200"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3 py-2.5 text-base text-light placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                    <span className="text-sm text-gray shrink-0">m</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FREE_RADIUS_PRESETS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFreeRadiusDraft(String(value))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                          freeRadiusValue === value
                            ? "border-secondary bg-secondary/15 text-secondary"
                            : "border-white/10 bg-white/[0.04] text-gray hover:bg-white/[0.08]"
                        )}
                      >
                        {value} m
                      </button>
                    ))}
                  </div>
                  {freeRadiusValid ? (
                    <p className="text-xs text-gray">
                      {freeRadiusValue
                        ? `A ${freeRadiusValue} m o menos del local (en línea recta) se pide de cualquier valor; más lejos, mínimo ${formatCOP(
                            minOrderValue
                          )}.`
                        : `El mínimo de ${formatCOP(minOrderValue)} aplica en toda la zona.`}
                      {minOrder.isPolygon && " Al guardar se borra la zona dibujada."}
                    </p>
                  ) : (
                    freeRadiusDraft !== "" && (
                      <p className="text-xs text-red-400">
                        Ingresa una distancia entre 0 y {FREE_RADIUS_MAX_M} m.
                      </p>
                    )
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray">
              Sin pedido mínimo: se puede pedir de cualquier valor en toda la zona.
            </p>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
};

export default StoreControls;
