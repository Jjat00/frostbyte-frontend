import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Trash2, RefreshCw, AlertCircle,
  Users, Clock, PlayCircle, Loader2, X, ArrowLeft,
  Menu, LogOut, Home, Store, ShoppingCart, Music, Package
} from 'lucide-react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { gamesService } from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification, useWebSocket } from '@/hooks';

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
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, logout } = useAuthStore();
  const [selectedTable, setSelectedTable] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

  // WebSocket para actualizaciones en tiempo real
  useWebSocket('/ws/games/admin/', {
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      queryClient.invalidateQueries({ queryKey: ['admin-game-stats'] });
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', shortName: 'Home', path: '/home', icon: Home },
    { name: 'Carta', shortName: 'Carta', path: '/', icon: Store, external: true },
    { name: 'Pedidos', shortName: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
    { name: 'Inventario', shortName: 'Inventario', path: '/inventario', icon: Package },
    { name: 'Música', shortName: 'Música', path: '/musica', icon: Music, hasNotification: true },
    { name: 'Juegos', shortName: 'Juegos', path: '/juegos-admin', icon: Gamepad2, end: true },
  ];

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

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
    refetchInterval: 60000, // Fallback: refrescar cada 60s (WebSocket es la fuente primaria)
  });

  // Extraer array de rooms (maneja paginación del backend)
  const rooms = Array.isArray(roomsData) ? roomsData : (roomsData?.results || []);

  // Obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ['admin-game-stats'],
    queryFn: () => gamesService.getAdminStats(),
    refetchInterval: 60000,
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
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-14 backdrop-blur-xl bg-white/[0.04] border-b border-white/[0.1] flex items-center justify-between px-4 sticky top-0 z-30">
        <NavLink
          to="/home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
          title="Ir al Home"
        >
          <img src="/logo.png" alt="Frostbyte" className="w-8 h-8" />
          <span className="font-bold text-light">FROSTBYTE</span>
        </NavLink>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="liquid-glass fixed right-0 top-0 bottom-0 w-72 backdrop-blur-xl bg-white/[0.06] border-l border-white/[0.15] z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
                <span className="font-bold text-light">Menú</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="p-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-lg">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-light">{user?.full_name || user?.username}</p>
                    <p className="text-sm text-gray">{user?.role_display || 'Admin'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const baseClasses = "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-gray hover:text-light hover:bg-white/[0.06]";
                  
                  if (item.external) {
                    return (
                      <a key={item.path} href={item.path} onClick={() => setSidebarOpen(false)} className={baseClasses}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </a>
                    );
                  }
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `${baseClasses} ${isActive ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-light border border-primary/30' : ''}`
                      }
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                        {item.hasNotification && hasPendingRequests && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-secondary animate-pulse" />
                        )}
                      </div>
                      <span className="font-medium flex-1">{item.name}</span>
                      {item.hasNotification && hasPendingRequests && (
                        <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">{pendingCount}</span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/[0.08]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="liquid-glass hidden md:flex w-64 h-screen backdrop-blur-xl bg-white/[0.04] border-r border-white/[0.1] flex-col fixed left-0 top-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.08]">
          <NavLink
            to="/home"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            title="Ir al Home"
          >
            <img src="/logo.png" alt="Frostbyte" className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-lg font-bold text-light tracking-wider group-hover:text-primary transition-colors">FROSTBYTE</h1>
              <p className="text-xs text-primary">Juegos</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray hover:text-light hover:bg-white/[0.06]";
            
            if (item.external) {
              return (
                <a key={item.path} href={item.path} className={baseClasses}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            }
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-light border border-primary/30' : ''}`
                }
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.hasNotification && hasPendingRequests && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-secondary animate-pulse" />
                  )}
                </div>
                <span className="font-medium flex-1">{item.name}</span>
                {item.hasNotification && hasPendingRequests && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">{pendingCount}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray">{user?.role_display || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
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
                <StatCard icon={PlayCircle} label="Salas Activas" value={stats.total_active_rooms} color="text-primary" />
                <StatCard icon={Users} label="Esperando" value={stats.by_status.waiting} color="text-yellow-400" />
                <StatCard icon={Users} label="Configurando" value={stats.by_status.configuring} color="text-blue-400" />
                <StatCard icon={PlayCircle} label="Jugando" value={stats.by_status.playing} color="text-green-400" />
              </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <label className="text-gray font-medium">Filtrar por mesa:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-4 py-2 backdrop-blur-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas las mesas</option>
                <option value="0">Barra</option>
                <option value="1">Mesa 1</option>
                <option value="2">Mesa 2</option>
                <option value="3">Mesa 3</option>
                <option value="4">Mesa 4</option>
                <option value="5">Mesa 5</option>
              </select>

              <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {/* Lista de Salas */}
            {!rooms || rooms.length === 0 ? (
              <div className="text-center py-12 backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] rounded-xl">
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
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/[0.04] border-t border-white/[0.1] z-30 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems
            .filter(item => item.path !== '/home' && item.path !== '/')
            .map((item) => {
              const active = !item.external && isActive(item.path, item.end);
              const baseClasses = `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] transition-colors ${active ? 'text-primary' : 'text-gray'}`;
              
              if (item.external) {
                return (
                  <a key={item.path} href={item.path} className={baseClasses}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.shortName}</span>
                  </a>
                );
              }
              
              return (
                <NavLink key={item.path} to={item.path} end={item.end} className={baseClasses}>
                  <div className="relative">
                    <item.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                    {item.hasNotification && hasPendingRequests && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-dark-secondary animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.shortName}</span>
                </NavLink>
              );
            })}
        </div>
      </nav>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
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
      className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-primary/50 transition-all"
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
