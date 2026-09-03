import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { whatsappAgentService } from '@/services/whatsappAgent.service';

/**
 * Hooks del módulo de Frosty (agente de WhatsApp) en el panel.
 *
 * La configuración y el banco de stickers son dos consultas separadas porque
 * cambian por caminos distintos: los interruptores se tocan aquí, y el banco
 * también crece por WhatsApp cuando el dueño le manda un sticker al agente.
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
    onSuccess: (data) => {
      queryClient.setQueryData(whatsappAgentKeys.settings, data);
    },
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
    onSuccess: () => {
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
