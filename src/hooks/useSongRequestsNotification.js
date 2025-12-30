import { useQuery } from '@tanstack/react-query';
import { musicService } from '@/services';
import { authService } from '@/services/auth.service';

/**
 * Hook para verificar si hay solicitudes de canciones pendientes
 * Solo verifica si el usuario está autenticado
 */
export const useSongRequestsNotification = () => {
  const isAuthenticated = authService.isAuthenticated();

  const { data, isLoading } = useQuery({
    queryKey: ['song-requests', 'notification'],
    queryFn: async () => {
      try {
        const response = await musicService.getAll();
        // Contar solo las pendientes y reproduciendo
        const pendingCount = (response?.results || []).filter(
          (request) => request.status === 'pending' || request.status === 'playing'
        ).length;
        return { count: pendingCount, hasPending: pendingCount > 0 };
      } catch (error) {
        // Si hay error (por ejemplo, no autenticado), retornar sin notificación
        return { count: 0, hasPending: false };
      }
    },
    enabled: isAuthenticated, // Solo ejecutar si está autenticado
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 10000, // Considerar datos frescos por 10 segundos
  });

  return {
    hasPendingRequests: data?.hasPending || false,
    pendingCount: data?.count || 0,
    isLoading,
  };
};

