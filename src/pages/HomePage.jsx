import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Wallet,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  PieChart,
  DollarSign,
  Zap,
  Activity,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification } from '@/hooks';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allModules = [
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Gestiona materiales, stock y órdenes de compra',
      icon: Package,
      path: '/inventario',
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,0,212,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(0,224,255,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,0,212,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
      features: [
        { icon: Gamepad2, text: 'Salas Activas' },
        { icon: ClipboardList, text: 'Terminar Salas' },
        { icon: BarChart3, text: 'Estadísticas' },
      ],
    },
    {
      id: 'expenses',
      title: 'Gastos',
      description: 'Registra gastos operativos: nomina, servicios, alquiler',
      icon: Wallet,
      path: '/gastos',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      features: [
        { icon: BarChart3, text: 'Dashboard' },
        { icon: ClipboardList, text: 'Lista de Gastos' },
        { icon: RefreshCw, text: 'Recurrentes' },
      ],
    },
    {
      id: 'analytics',
      title: 'Estadisticas',
      description: 'Dashboard ejecutivo con ingresos vs gastos y tendencias',
      icon: TrendingUp,
      path: '/analytics',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]',
      features: [
        { icon: DollarSign, text: 'Ingresos vs Gastos' },
        { icon: PieChart, text: 'Distribucion' },
        { icon: BarChart3, text: 'Tendencias' },
      ],
    },
  ];

  const modules = isAdmin()
    ? allModules
    : allModules.filter(m => ['orders', 'products', 'music', 'feedback', 'games'].includes(m.id));

  // Quick stats data
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,0,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,224,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Header - Modern and sleek */}
      <header className="liquid-glass sticky top-0 z-30 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo section */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              title="Ver Carta Pública"
            >
              <div className="relative">
                <img src="/logo.png" alt="Frostbyte" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-light tracking-wider group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  FROSTBYTE
                </h1>
                <p className="text-xs text-gray tracking-wide">SISTEMA DE GESTIÓN</p>
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* View Menu Button */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-dark transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,212,0.4)]"
                title="Ver Carta Pública"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold">Ver Carta</span>
              </Link>

              {/* User info */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 backdrop-blur-sm bg-white/[0.05] border border-white/[0.1] rounded-lg">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-lg">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-dark rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-light leading-tight">
                    {user?.full_name || user?.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3 text-primary" />
                    <p className="text-xs text-gray">{user?.role_display}</p>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-red-500/30"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Welcome section with quick stats */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              {/* Greeting */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-light mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {greeting}, {user?.first_name || user?.username}
                </h2>
                <p className="text-gray text-lg">Selecciona un módulo para comenzar tu sesión</p>
              </div>

              {/* Quick stats inline */}
              <div className="flex gap-3 flex-wrap">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-3 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg backdrop-blur-sm flex items-center gap-3"
                >
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray">Módulos activos</p>
                    <p className="text-2xl font-bold text-light leading-none">{modules.length}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-4 py-3 bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20 rounded-lg backdrop-blur-sm flex items-center gap-3"
                >
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Activity className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray">Sistema</p>
                    <p className="text-sm font-bold text-light leading-none flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Operativo
                    </p>
                  </div>
                </motion.div>

                {hasPendingRequests && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="px-4 py-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg backdrop-blur-sm flex items-center gap-3 animate-pulse"
                  >
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray">Canciones pendientes</p>
                      <p className="text-2xl font-bold text-light leading-none">{pendingCount}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Module Cards - Compact grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(module.path)}
                className={`liquid-glass-interactive relative group cursor-pointer ${module.bgColor} border ${module.borderColor} rounded-xl p-5 transition-all duration-300 overflow-hidden ${module.glowColor}`}
              >
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon and badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`relative p-3 rounded-lg bg-gradient-to-br ${module.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-dark" />
                      {module.id === 'music' && hasPendingRequests && (
                        <>
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-dark flex items-center justify-center text-[10px] font-bold text-dark">
                            {pendingCount}
                          </span>
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500/50 rounded-full animate-ping" />
                        </>
                      )}
                    </div>
                    <motion.div
                      className="text-gray/50 group-hover:text-primary transition-colors"
                      animate={{ rotate: [0, 90, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-light mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text transition-all">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray text-sm mb-4 line-clamp-2 group-hover:text-light/80 transition-colors">
                    {module.description}
                  </p>

                  {/* Features - Compact pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {module.features.slice(0, 3).map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-dark/50 rounded-md border border-white/[0.1] group-hover:border-white/[0.18] transition-colors"
                        >
                          <FeatureIcon className="w-3 h-3 text-gray" />
                          <span className="text-xs text-gray">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-br ${module.color}`} style={{ zIndex: -1 }} />
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-2 text-sm text-gray"
        >
          <Clock className="w-4 h-4" />
          <p>Conectado como <span className="text-light font-semibold">{user?.role_display}</span></p>
          <span className="w-1 h-1 bg-gray rounded-full" />
          <p>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
