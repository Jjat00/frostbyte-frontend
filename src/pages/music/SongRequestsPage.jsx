import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
  User,
} from 'lucide-react';
import { musicService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    icon: Clock,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  playing: {
    label: 'Reproduciendo',
    color: 'blue',
    icon: Play,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  completed: {
    label: 'Completada',
    color: 'green',
    icon: CheckCircle,
    bgClass: 'bg-green-500/10 border-green-500/30',
    textClass: 'text-green-400',
    badgeClass: 'bg-green-500/20 text-green-400',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'red',
    icon: XCircle,
    bgClass: 'bg-red-500/10 border-red-500/30',
    textClass: 'text-red-400',
    badgeClass: 'bg-red-500/20 text-red-400',
  },
};

const SongRequestCard = ({ request, onUpdateStatus }) => {
  const status = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const { toast } = useToast();

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const created = new Date(dateString);
    const diffMinutes = Math.floor((now - created) / 60000);
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${diffMinutes % 60}m`;
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus(request.id, newStatus);
      toast({
        title: "Estado actualizado",
        description: `La solicitud ahora está ${statusConfig[newStatus].label.toLowerCase()}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-dark-secondary border-2 ${status.bgClass} rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300`}
    >
      {/* Header con badge de estado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 flex-shrink-0 rounded-lg ${status.badgeClass} flex items-center justify-center`}>
            <Music className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-light break-words">{request.song_name}</h3>
            <p className="text-gray text-sm break-words">{request.artist_name}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.badgeClass} flex items-center gap-1.5 self-start flex-shrink-0 whitespace-nowrap`}>
          <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {status.label}
        </div>
      </div>

      {request.notes && (
        <p className="text-gray text-sm mb-4 italic break-words">"{request.notes}"</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatDate(request.created_at)}</span>
        </div>
        {request.played_at && (
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Reproducida: {formatTime(request.played_at)}</span>
          </div>
        )}
      </div>

      {/* Botones de acción según el estado */}
      <div className="flex flex-col sm:flex-row gap-2">
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusChange('playing')}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Play className="w-4 h-4 flex-shrink-0" />
              <span>Reproducir</span>
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>Cancelar</span>
            </button>
          </>
        )}
        
        {request.status === 'playing' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="flex-1 px-3 sm:px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Marcar como Completada</span>
          </button>
        )}
        
        {request.status === 'completed' && (
          <p className="text-sm text-gray italic">Esta canción ya fue reproducida</p>
        )}
        
        {request.status === 'cancelled' && (
          <p className="text-sm text-gray italic">Esta solicitud fue cancelada</p>
        )}
      </div>
    </motion.div>
  );
};

const SongRequestsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);

  // Obtener todas las solicitudes
  const { data: requestsData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['song-requests', 'admin', statusFilter],
    queryFn: () => musicService.getAll(statusFilter ? { status: statusFilter } : {}),
    refetchInterval: 10000, // Actualizar cada 10 segundos
  });

  const requests = requestsData?.results || [];

  // Mutación para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => musicService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['song-requests']);
    },
  });

  const handleUpdateStatus = async (id, status) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    playing: requests.filter(r => r.status === 'playing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  const filteredRequests = statusFilter
    ? requests.filter(r => r.status === statusFilter)
    : requests.filter(r => r.status !== 'completed'); // Por defecto, no mostrar completadas

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-light mb-2 flex items-center gap-2 sm:gap-3">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <span className="truncate">Solicitudes de Canciones</span>
            </h1>
            <p className="text-gray text-sm sm:text-base">Gestiona las solicitudes de canciones de los clientes</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors flex-shrink-0"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filtros de estado */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === null
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Todas ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Pendientes ({statusCounts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('playing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'playing'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Reproduciendo ({statusCounts.playing})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Completadas ({statusCounts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'cancelled'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Canceladas ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20">
          <Music className="w-16 h-16 text-gray/50 mx-auto mb-4" />
          <p className="text-gray text-lg">
            {statusFilter
              ? `No hay solicitudes con estado "${statusConfig[statusFilter]?.label}"`
              : 'No hay solicitudes pendientes'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRequests.map((request) => (
              <SongRequestCard
                key={request.id}
                request={request}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SongRequestsPage;

