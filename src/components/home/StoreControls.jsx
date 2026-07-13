import React, { useState } from "react";
import { DoorOpen, DoorClosed, Bike } from "lucide-react";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

/**
 * Controles operativos del local para el staff (admin y empleados), pensados
 * para la fila de "status chips" del dashboard /home.
 *
 * Dos interruptores independientes, cada uno con diálogo de confirmación:
 *  1. Abierto/Cerrado  -> is_open (cerrado = el cliente no puede pedir).
 *  2. Domicilios        -> customer_ordering_enabled.
 */
const StoreControls = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateMutation = useUpdateStoreSettings();
  const { toast } = useToast();

  // Qué confirmación está abierta: null | "store" | "delivery"
  const [confirm, setConfirm] = useState(null);

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
    </>
  );
};

export default StoreControls;
