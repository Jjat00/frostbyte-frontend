import React, { lazy, Suspense, useState } from "react";
import { DoorOpen, DoorClosed, Bike, Ruler, Loader2 } from "lucide-react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { coverageAreaKm2 } from "@/lib/deliveryArea";
import { cn } from "@/lib/utils";

// Mapbox pesa: solo se carga al abrir el diálogo del radio, no con el dashboard
const CoverageAreaMap = lazy(() => import("./CoverageAreaMap"));

const formatKm2 = (value) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);

// Límites del radio de domicilios (deben coincidir con MIN/MAX_DELIVERY_RADIUS_KM
// del backend, que es quien valida de verdad).
const RADIUS_MIN_KM = 0.1;
const RADIUS_MAX_KM = 50;
const RADIUS_PRESETS = [1, 1.5, 2, 3];

/**
 * Controles operativos del local para el staff (admin y empleados), pensados
 * para la fila de "status chips" del dashboard /home.
 *
 * Tres controles independientes, cada uno con su diálogo:
 *  1. Abierto/Cerrado  -> is_open (cerrado = el cliente no puede pedir).
 *  2. Domicilios        -> customer_ordering_enabled.
 *  3. Radio de entrega  -> delivery_radius_km (solo admin; los empleados lo ven).
 */
const StoreControls = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateMutation = useUpdateStoreSettings();
  const { isAdmin } = useAuthStore();
  const isAdminUser = isAdmin();
  const { toast } = useToast();

  // Qué confirmación está abierta: null | "store" | "delivery" | "radius"
  const [confirm, setConfirm] = useState(null);
  // Valor en edición del radio (texto: el usuario puede escribir "1,5")
  const [radiusDraft, setRadiusDraft] = useState("");

  if (isLoading || !settings) {
    return (
      <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg backdrop-blur-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-gray/40 rounded-full animate-pulse" />
        <span className="text-xs text-gray">Cargando estado…</span>
      </div>
    );
  }

  const isOpen = !!settings.is_open;
  const deliveryOn = !!settings.customer_ordering_enabled;
  const radiusKm = Number(settings.delivery_radius_km ?? 0);
  const radiusLabel = `${Number(radiusKm.toFixed(2))} km`;

  // Se acepta coma decimal: en el celular es lo que sale del teclado en es-CO
  const radiusValue = Number(String(radiusDraft).replace(",", "."));
  const radiusValid =
    Number.isFinite(radiusValue) &&
    radiusValue >= RADIUS_MIN_KM &&
    radiusValue <= RADIUS_MAX_KM;
  const radiusRounded = radiusValid ? Number(radiusValue.toFixed(2)) : null;
  // El mapa previsualiza el último valor utilizable: mientras se escribe "1,"
  // no tiene sentido saltar al radio mínimo.
  const radiusPreview = radiusRounded ?? radiusKm;
  // Para el empleado el radio es informativo: se muestra sin acción.
  const RadiusTag = isAdminUser ? "button" : "div";

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
            error.response?.data?.error ||
            "No se pudo actualizar el estado.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      {/* Chip: Abierto / Cerrado */}
      <button
        onClick={() => setConfirm("store")}
        className={cn(
          "px-3 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border transition-colors",
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
          "px-3 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border transition-colors",
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

      {/* Chip: radio de cobertura de domicilios (lo cambia solo el admin) */}
      <RadiusTag
        {...(isAdminUser
          ? {
              onClick: () => {
                setRadiusDraft(String(radiusKm));
                setConfirm("radius");
              },
              title: "Cambiar el radio de domicilios",
            }
          : { title: "Solo un administrador puede cambiar el radio" })}
        className={cn(
          "px-3 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border transition-colors bg-white/[0.04] border-white/[0.08]",
          isAdminUser && "hover:bg-white/[0.08] cursor-pointer"
        )}
      >
        <Ruler className="w-4 h-4 text-secondary" />
        <span className="text-xs text-gray">Radio</span>
        <span className="text-xs font-semibold text-light">{radiusLabel}</span>
      </RadiusTag>

      {/* Confirmación: abrir/cerrar local */}
      <ConfirmDialog
        open={confirm === "store"}
        tone={isOpen ? "danger" : "success"}
        icon={isOpen ? DoorClosed : DoorOpen}
        title={isOpen ? "¿Cerrar Frostbyte?" : "¿Abrir Frostbyte?"}
        message={
          isOpen
            ? "Los clientes verán el local como 'Cerrado' en la carta y en las mesas, y no podrán hacer pedidos en línea."
            : "Los clientes verán el local como 'Abierto' y podrán hacer pedidos (si los domicilios están activos)."
        }
        confirmLabel={isOpen ? "Sí, cerrar" : "Sí, abrir"}
        loading={updateMutation.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          apply(
            { is_open: !isOpen },
            isOpen ? "Frostbyte está cerrado" : "Frostbyte está abierto"
          )
        }
      />

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

      {/* Edición del radio de cobertura */}
      <ConfirmDialog
        open={confirm === "radius"}
        tone="default"
        icon={Ruler}
        title="Radio de domicilios"
        message="Hasta dónde entregamos, medido desde el local. Afecta el mapa del checkout, el bloqueo de pedidos fuera de zona y lo que responde el agente de WhatsApp."
        confirmLabel="Guardar"
        loading={updateMutation.isPending}
        confirmDisabled={!radiusValid || radiusRounded === radiusKm}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          apply(
            { delivery_radius_km: radiusRounded },
            `Radio de domicilios: ${radiusRounded} km`
          )
        }
      >
        <div className="space-y-3">
          {/* La misma vista que ve el cliente al pedir: local + área cubierta */}
          <Suspense
            fallback={
              <div className="h-44 sm:h-52 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
              </div>
            }
          >
            <CoverageAreaMap radiusKm={radiusPreview} />
          </Suspense>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={radiusDraft}
              onChange={(e) => setRadiusDraft(e.target.value)}
              placeholder="1.5"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3 py-2.5 text-base text-light placeholder:text-white/30 focus:outline-none focus:border-secondary/50"
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
              Cubre ≈ {formatKm2(coverageAreaKm2(radiusRounded))} km² alrededor
              del local.
            </p>
          ) : (
            radiusDraft !== "" && (
              <p className="text-xs text-red-400">
                Ingresa un radio entre {RADIUS_MIN_KM} y {RADIUS_MAX_KM} km.
              </p>
            )
          )}
        </div>
      </ConfirmDialog>
    </>
  );
};

export default StoreControls;
