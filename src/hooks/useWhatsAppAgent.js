import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { whatsappAgentService } from '@/services/whatsappAgent.service';

/**
 * Hooks del módulo de Frosty (agente de WhatsApp) en el panel.
 *
 * La configuración y el banco de stickers son dos consultas separadas porque
 * cambian por caminos distintos: los interruptores se tocan aquí, y el banco
 * también crece por WhatsApp cuando el dueño le manda un sticker al agente.
 *
 * El catálogo de tonos NO tiene consulta propia: viaja dentro de la
 * configuración (`tone_presets`), así que editarlo invalida esa misma clave y
 * no hay dos copias del catálogo que puedan quedar en desacuerdo.
 */
export const whatsappAgentKeys = {
  settings: ['whatsapp-agent-settings'],
  stickers: ['whatsapp-stickers'],
};

export function useAgentSettings(options = {}) {
  return useQuery({
    queryKey: whatsappAgentKeys.settings,
    queryFn: () => whatsappAgentService.getSettings(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUpdateAgentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => whatsappAgentService.updateSettings(data),
    // El interruptor se mueve al tocarlo, no cuando conteste el servidor: en
    // el celular esa espera se lee como que el toque no entró, y el siguiente
    // toque lo devuelve a donde estaba.
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: whatsappAgentKeys.settings });
      const previous = queryClient.getQueryData(whatsappAgentKeys.settings);
      if (previous) {
        queryClient.setQueryData(whatsappAgentKeys.settings, { ...previous, ...data });
      }
      return { previous };
    },
    // Si no se guardó, vuelve a donde estaba: un interruptor mostrando algo
    // que el servidor no aceptó miente sobre lo que hace el agente.
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(whatsappAgentKeys.settings, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(whatsappAgentKeys.settings, data);
    },
  });
}

/** El catálogo de tonos vive dentro de la configuración: se refresca entera. */
const refreshSettings = (queryClient) => () =>
  queryClient.invalidateQueries({ queryKey: whatsappAgentKeys.settings });

export function useCreateTone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => whatsappAgentService.createTone(data),
    onSuccess: refreshSettings(queryClient),
  });
}

export function useUpdateTone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => whatsappAgentService.updateTone(id, data),
    onSuccess: refreshSettings(queryClient),
  });
}

export function useDeleteTone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => whatsappAgentService.deleteTone(id),
    onSuccess: refreshSettings(queryClient),
  });
}

export function useRestoreTone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => whatsappAgentService.restoreTone(id),
    onSuccess: refreshSettings(queryClient),
  });
}

export function useStickers(options = {}) {
  return useQuery({
    queryKey: whatsappAgentKeys.stickers,
    queryFn: () => whatsappAgentService.listStickers(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useCreateSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => whatsappAgentService.createSticker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappAgentKeys.stickers });
    },
  });
}

export function useUpdateSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => whatsappAgentService.updateSticker(id, data),
    // Igual que los de la configuración: el interruptor de cada sticker
    // responde al toque. Con archivo no se adelanta nada —la miniatura la
    // rehace el servidor— y se espera a la respuesta.
    onMutate: async ({ id, archivo, ...data }) => {
      if (archivo) return {};
      await queryClient.cancelQueries({ queryKey: whatsappAgentKeys.stickers });
      const previous = queryClient.getQueryData(whatsappAgentKeys.stickers);
      if (previous) {
        queryClient.setQueryData(
          whatsappAgentKeys.stickers,
          previous.map((sticker) => (sticker.id === id ? { ...sticker, ...data } : sticker))
        );
      }
      return { previous };
    },
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(whatsappAgentKeys.stickers, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: whatsappAgentKeys.stickers });
    },
  });
}

export function useDeleteSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => whatsappAgentService.deleteSticker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappAgentKeys.stickers });
    },
  });
}
