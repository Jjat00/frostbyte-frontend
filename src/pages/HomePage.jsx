import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ClipboardList,
  LogOut,
  BarChart3,
  Boxes,
  ShoppingCart,
  Store,
  Music,
  Gamepad2,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification } from '@/hooks';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const modules = [
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Gestiona materiales, stock y órdenes de compra',
      icon: Package,
      path: '/inventario',
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      features: [
        { icon: BarChart3, text: 'Dashboard' },
        { icon: Package, text: 'Materiales' },
        { icon: Boxes, text: 'Stock Bajo' },
        { icon: ClipboardList, text: 'Órdenes' },
      ],
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Gestiona pedidos activos y crea nuevos',
      icon: ShoppingCart,
      path: '/pedidos',
      color: 'from-secondary to-primary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/30',
      features: [
        { icon: ClipboardList, text: 'Activos' },
        { icon: ShoppingCart, text: 'Nuevo Pedido' },
        { icon: BarChart3, text: 'Estadísticas' },
      ],
    },
    {
      id: 'products',
      title: 'Productos',
      description: 'Gestiona productos de la carta, categorías y variantes',
      icon: Store,
      path: '/productos',
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      features: [
        { icon: Store, text: 'Lista de Productos' },
        { icon: Package, text: 'Categorías' },
        { icon: BarChart3, text: 'Variantes' },
      ],
    },
    {
      id: 'music',
      title: 'Música',
      description: 'Gestiona solicitudes de canciones de los clientes',
      icon: Music,
      path: '/musica',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      features: [
        { icon: Music, text: 'Solicitudes' },
        { icon: ClipboardList, text: 'Gestionar Estados' },
        { icon: BarChart3, text: 'Historial' },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'Gestiona comentarios y opiniones de los clientes',
      icon: MessageSquare,
      path: '/feedback',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      features: [
        { icon: MessageSquare, text: 'Comentarios' },
        { icon: ClipboardList, text: 'Gestionar Estados' },
        { icon: BarChart3, text: 'Estadisticas' },
      ],
    },
    {
      id: 'games',
      title: 'Juegos',
      description: 'Administra salas de juego activas por mesa',
      icon: Gamepad2,
      path: '/juegos-admin',
      color: 'from-violet-500 to-amber-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      features: [
        { icon: Gamepad2, text: 'Salas Activas' },
        { icon: ClipboardList, text: 'Terminar Salas' },
        { icon: BarChart3, text: 'Estadísticas' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-dark-secondary/95 backdrop-blur-sm border-b border-gray/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Frostbyte" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-light tracking-wider">FROSTBYTE</h1>
                <p className="text-xs text-gray">Sistema de Gestión</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold">
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-light">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs text-gray">{user?.role_display}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-light mb-2">
            Bienvenido, {user?.first_name || user?.username}
          </h2>
          <p className="text-gray">Selecciona un módulo para comenzar</p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(module.path)}
                className={`relative group cursor-pointer ${module.bgColor} border-2 ${module.borderColor} rounded-2xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${module.color} mb-4 relative`}>
                    <Icon className="w-8 h-8 text-dark" />
                    {module.id === 'music' && hasPendingRequests && (
                      <>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-secondary animate-pulse" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500/20 rounded-full animate-ping" />
                      </>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-light">{module.title}</h3>
                    {module.id === 'music' && hasPendingRequests && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray mb-6">{module.description}</p>

                  {/* Features */}
                  <div className="space-y-2">
                    {module.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray group-hover:text-light transition-colors">
                          <FeatureIcon className="w-4 h-4" />
                          <span>{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray group-hover:text-light transition-colors">
                    <span>Entrar</span>
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats (Optional) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Módulos</p>
                <p className="text-2xl font-bold text-light">6</p>
              </div>
              <Package className="w-8 h-8 text-primary/50" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray">Usuario</p>
                <p className="text-lg font-bold text-light truncate">
                  {user?.full_name || user?.username}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-sm">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

