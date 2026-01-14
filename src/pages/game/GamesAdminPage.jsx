import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Gamepad2, Trash2, RefreshCw, AlertCircle,
  Users, Clock, PlayCircle, Loader2, X, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { gamesService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const STATUS_LABELS = {
  waiting: { label: 'Esperando', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  configuring: { label: 'Configurando', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  playing: { label: 'Jugando', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  finished: { label: 'Finalizado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  expired: { label: 'Expirado', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function GamesAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState('all');

  // Obtener todas las salas activas
  const { data: roomsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-games', selectedTable],
    queryFn: async () => {
      const params = { active_only: 'true' };
      if (selectedTable !== 'all') {
        params.table_number = selectedTable;
      }
      return await gamesService.getAdminRooms(params);
    },
    refetchInterval: 5000, // Auto-refresh cada 5 segundos
  });

  // Extraer array de rooms (maneja paginación del backend)
  const rooms = Array.isArray(roomsData) ? roomsData : (roomsData?.results || []);

  // Obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ['admin-game-stats'],
    queryFn: () => gamesService.getAdminStats(),
    refetchInterval: 10000,
  });

  // Mutation para terminar sala
  const terminateRoomMutation = useMutation({
    mutationFn: (roomId) => gamesService.terminateRoom(roomId),
    onSuccess: () => {
      toast({
        title: 'Sala terminada',
        description: 'La sala ha sido terminada correctamente',
      });
      queryClient.invalidateQueries(['admin-games']);
      queryClient.invalidateQueries(['admin-game-stats']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al terminar sala',
        variant: 'destructive',
      });
    },
  });

  // Mutation para limpiar mesa
  const cleanTableMutation = useMutation({
    mutationFn: (tableNumber) => gamesService.cleanTable(tableNumber),
    onSuccess: (data) => {
      toast({
        title: 'Mesa limpiada',
        description: data.message,
      });
      queryClient.invalidateQueries(['admin-games']);
      queryClient.invalidateQueries(['admin-game-stats']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al limpiar mesa',
        variant: 'destructive',
      });
    },
  });

  const handleTerminateRoom = (room) => {
    const mesaLabel = room.table_number === 0 ? 'Barra' : `Mesa ${room.table_number}`;
    if (confirm(`¿Terminar sala ${room.room_code} de ${mesaLabel}?`)) {
      terminateRoomMutation.mutate(room.id);
    }
  };

  const handleCleanTable = (tableNumber) => {
    const mesaLabel = tableNumber === 0 ? 'Barra' : `Mesa ${tableNumber}`;
    if (confirm(`¿Limpiar TODAS las salas activas de ${mesaLabel}?`)) {
      cleanTableMutation.mutate(tableNumber);
    }
  };

  const getTimeSince = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins === 1) return '1 min';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return diffHours === 1 ? '1 hora' : `${diffHours} horas`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="text-gray hover:text-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al menú
          </Button>
        </motion.div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-light">Panel de Juegos</h1>
          </div>
          <p className="text-gray">Gestiona las salas activas y controla los juegos por mesa</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={PlayCircle}
              label="Salas Activas"
              value={stats.total_active_rooms}
              color="text-primary"
            />
            <StatCard
              icon={Users}
              label="Esperando"
              value={stats.by_status.waiting}
              color="text-yellow-400"
            />
            <StatCard
              icon={Users}
              label="Configurando"
              value={stats.by_status.configuring}
              color="text-blue-400"
            />
            <StatCard
              icon={PlayCircle}
              label="Jugando"
              value={stats.by_status.playing}
              color="text-green-400"
            />
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-gray font-medium">Filtrar por mesa:</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="px-4 py-2 bg-dark-secondary border border-gray/20 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las mesas</option>
            <option value="0">Barra</option>
            <option value="1">Mesa 1</option>
            <option value="2">Mesa 2</option>
            <option value="3">Mesa 3</option>
            <option value="4">Mesa 4</option>
            <option value="5">Mesa 5</option>
          </select>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Lista de Salas */}
        {!rooms || rooms.length === 0 ? (
          <div className="text-center py-12 bg-dark-secondary rounded-xl border border-gray/20">
            <AlertCircle className="w-12 h-12 text-gray mx-auto mb-4" />
            <p className="text-gray text-lg">No hay salas activas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onTerminate={handleTerminateRoom}
                onCleanTable={handleCleanTable}
                getTimeSince={getTimeSince}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-secondary border border-gray/20 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <p className="text-gray text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-light">{value}</p>
    </motion.div>
  );
}

// Componente de tarjeta de sala
function RoomCard({ room, onTerminate, onCleanTable, getTimeSince }) {
  const statusConfig = STATUS_LABELS[room.status] || STATUS_LABELS.waiting;
  const mesaLabel = room.table_number === 0 ? 'Barra' : `Mesa ${room.table_number}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-secondary border border-gray/20 rounded-xl p-6 hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-light">
                {mesaLabel}
              </span>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              {statusConfig.label}
            </span>

            <span className="text-sm text-gray">
              Código: <span className="font-mono text-light">{room.room_code}</span>
            </span>
          </div>

          {/* Info */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray" />
              <span className="text-sm text-gray">
                {room.participant_count || 0} jugador(es)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-gray" />
              <span className="text-sm text-gray">
                Ronda {room.current_round}/{room.total_rounds}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray" />
              <span className="text-sm text-gray">
                Hace {getTimeSince(room.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            onClick={() => onTerminate(room)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Terminar
          </Button>

          <Button
            onClick={() => onCleanTable(room.table_number)}
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar Mesa
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
