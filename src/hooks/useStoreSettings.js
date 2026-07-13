import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeSettingsService } from "@/services/storeSettings.service";
import { myOrderKeys } from "./useCustomerOrders";

/**
 * Hooks del STAFF para la configuración operativa del local
 * (abierto/cerrado y domicilios en línea).
 *
 * La lectura pega contra el endpoint de staff (apiClient). Las mutaciones
 * invalidan tanto la vista del staff como la config pública que consume el
 * Header/carta del cliente, para que el estado se refleje al instante en el
 * mismo navegador.
 */
export const storeSettingsKeys = {
  all: ["store-settings"],
};

export function useStoreSettings(options = {}) {
  return useQuery({
    queryKey: storeSettingsKeys.all,
    queryFn: () => storeSettingsService.get(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => storeSettingsService.update(data),
    onSuccess: (data) => {
      // Refresca la vista del staff con la respuesta del servidor...
      queryClient.setQueryData(storeSettingsKeys.all, data);
      // ...e invalida la config pública (Header/carta) para que el badge y los
      // gates de pedido del cliente se actualicen.
      queryClient.invalidateQueries({ queryKey: myOrderKeys.config });
    },
  });
}
