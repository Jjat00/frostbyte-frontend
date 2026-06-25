import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerOrdersService } from "@/services/customerOrders.service";
import { useWebSocket } from "./useWebSocket";

/**
 * Query keys para los pedidos del cliente.
 */
export const myOrderKeys = {
  all: ["my-orders"],
  list: () => [...myOrderKeys.all, "list"],
  detail: (id) => [...myOrderKeys.all, "detail", id],
  config: ["store-config"],
};

/**
 * Configuración del local (tarifa de envío + tipos de pedido habilitados).
 * Endpoint público; sirve para mostrar/ocultar el botón "Agregar" y los tipos
 * en el checkout.
 */
export function useStoreConfig(options = {}) {
  return useQuery({
    queryKey: myOrderKeys.config,
    queryFn: () => customerOrdersService.getConfig(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Lista de pedidos del cliente autenticado ("Mis pedidos").
 */
export function useMyOrders(options = {}) {
  return useQuery({
    queryKey: myOrderKeys.list(),
    queryFn: () => customerOrdersService.list(),
    ...options,
  });
}

/**
 * Detalle/seguimiento de un pedido propio.
 */
export function useMyOrder(id, options = {}) {
  return useQuery({
    queryKey: myOrderKeys.detail(id),
    queryFn: () => customerOrdersService.get(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Mutación para crear un pedido. Invalida la lista al terminar.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => customerOrdersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myOrderKeys.all });
    },
  });
}

/**
 * Seguimiento en vivo de "Mis pedidos".
 *
 * Reusa el mismo WebSocket que el panel del staff (`/ws/orders/`, grupo
 * `orders_updates`). Cuando llega `orders_changed`, invalida las queries del
 * cliente para refrescar estado e items. Incluye respaldo por polling (60s)
 * mientras el WS esté caído (típico en móvil tras bloquear la pantalla).
 */
export function useMyOrdersLive() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: myOrderKeys.all });
  }, [queryClient]);

  const { isConnected } = useWebSocket("/ws/orders/", {
    onMessage: (msg) => {
      if (msg?.type === "orders_changed") invalidate();
    },
  });

  useEffect(() => {
    if (isConnected) return undefined;
    const id = setInterval(invalidate, 60 * 1000);
    return () => clearInterval(id);
  }, [isConnected, invalidate]);

  return { isConnected };
}
