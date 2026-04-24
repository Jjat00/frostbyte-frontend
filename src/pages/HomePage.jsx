import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
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
  BookOpen,
  ChefHat,
  UtensilsCrossed,
  ExternalLink,
  TrendingUp,
  PieChart,
  DollarSign,
  Activity,
  Shield,
  Clock,
  Receipt,
  AlertTriangle,
  Star,
  CircleDollarSign,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification } from '@/hooks';
import { ordersService } from '@/services/orders.service';

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatCurrencyCompact = (value) => {
  const num = parseFloat(value || 0);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return formatCurrency(num);
};

const KpiCard = ({ icon: Icon, label, value, subtitle, accent = 'secondary', isLoading, delay = 0, onClick, badge }) => {
  const palettes = {
    secondary: {
      gradient: 'from-secondary to-primary',
      glow: 'group-hover:shadow-[0_0_30px_rgba(0,224,255,0.3)]',
    },
    primary: {
      gradient: 'from-primary to-secondary',
      glow: 'group-hover:shadow-[0_0_30px_rgba(255,0,212,0.3)]',
    },
    green: {
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    },
    amber: {
      gradient: 'from-amber-400 to-orange-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    },
    purple: {
      gradient: 'from-purple-400 to-pink-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    },
  };

  const c = palettes[accent] || palettes.secondary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={onClick ? { y: -4 } : undefined}
      onClick={onClick}
      className={`
        liquid-glass-interactive relative group
        rounded-2xl p-4 md:p-5
        flex flex-col h-full min-w-0
        transition-all duration-300 ${c.glow}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Subtle gradient wash tied to accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full min-w-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${c.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg shrink-0`}>
            <Icon className="w-5 h-5 text-dark" />
          </div>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 backdrop-blur-sm shrink-0">
              {badge}
            </span>
          )}
        </div>

        <p className="text-[11px] text-gray font-medium uppercase tracking-wider mb-1.5 truncate">
          {label}
        </p>

        {isLoading ? (
          <div className="space-y-2 mt-auto">
            <div className="h-7 bg-white/[0.08] rounded-lg w-32 animate-pulse" />
            <div className="h-3 bg-white/[0.05] rounded w-24 animate-pulse" />
          </div>
        ) : (
          <div className="mt-auto min-w-0">
            <p
              className="font-bold text-light leading-tight truncate"
              style={{ fontSize: 'clamp(1.125rem, 2.2vw, 1.75rem)' }}
              title={typeof value === 'string' ? value : undefined}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray mt-1.5 truncate" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();
  const isAdminUser = isAdmin();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: todayStats, isLoading: isLoadingToday } = useQuery({
    queryKey: ['home-today-stats'],
    queryFn: () => ordersService.getStats('today'),
    enabled: isAdminUser,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: topProductsToday, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['home-top-products-today'],
    queryFn: () => ordersService.getProductStats('today'),
    enabled: isAdminUser,
    staleTime: 60_000,
  });

  const ventasHoy = parseFloat(todayStats?.total_revenue || 0);
  const pedidosHoy = todayStats?.total_orders || 0;
  const pagosPendientes = parseFloat(todayStats?.unpaid_total || 0);
  const itemsPendientes = todayStats?.total_unpaid_items || 0;
  const ticketPromedio = pedidosHoy > 0 ? ventasHoy / pedidosHoy : 0;

  const topProducto = topProductsToday?.data?.[0];

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
      id: 'recetarios',
      title: 'Recetarios',
      description: 'Guias de preparacion paso a paso para cada bebida',
      icon: BookOpen,
      path: '/recetarios',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      features: [
        { icon: BookOpen, text: 'Recetas' },
        { icon: UtensilsCrossed, text: 'Ingredientes' },
        { icon: ChefHat, text: 'Pasos' },
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
    : allModules.filter(m => ['orders', 'products', 'music', 'feedback', 'recetarios', 'games'].includes(m.id));

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
              <div className="hidden md:flex items-center gap-3 px-4 py-2 backdrop-blur-sm bg-white/[0.09] border border-white/[0.1] rounded-lg">
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
        {/* Welcome section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              {/* Greeting */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-light mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {greeting}, {user?.first_name || user?.username}
                </h2>
                <p className="text-gray text-base md:text-lg">
                  {isAdminUser
                    ? 'Panorama de tu negocio en tiempo real'
                    : 'Selecciona un módulo para comenzar tu sesión'}
                </p>
              </div>

              {/* Status chips */}
              <div className="flex gap-2.5 flex-wrap">
                <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg backdrop-blur-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray">Sistema</span>
                  <span className="text-xs font-semibold text-light">Operativo</span>
                </div>
                {hasPendingRequests && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate('/musica')}
                    className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg backdrop-blur-sm flex items-center gap-2 hover:bg-purple-500/20 transition-colors"
                  >
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray">Canciones</span>
                    <span className="text-xs font-bold text-light px-1.5 py-0.5 rounded-full bg-purple-500/30">
                      {pendingCount}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Admin KPIs ── */}
          {isAdminUser && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              aria-label="Indicadores clave del negocio"
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/20">
                    <Activity className="w-4 h-4 text-secondary" />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-light tracking-wide">
                    Hoy en Frostbyte
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-gray ml-1">
                    Actualizado automáticamente
                  </span>
                </div>
                <button
                  onClick={() => navigate('/analytics')}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-secondary hover:text-light transition-colors"
                >
                  Ver dashboard completo
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                <KpiCard
                  icon={CircleDollarSign}
                  label="Ventas de hoy"
                  value={formatCurrencyCompact(ventasHoy)}
                  subtitle={`${todayStats?.total_paid_items || 0} items cobrados`}
                  accent="green"
                  isLoading={isLoadingToday}
                  delay={0.05}
                  onClick={() => navigate('/analytics')}
                />
                <KpiCard
                  icon={ShoppingCart}
                  label="Pedidos de hoy"
                  value={pedidosHoy}
                  subtitle={pedidosHoy === 1 ? '1 pedido registrado' : `${pedidosHoy} pedidos registrados`}
                  accent="secondary"
                  isLoading={isLoadingToday}
                  delay={0.1}
                  onClick={() => navigate('/pedidos')}
                />
                <KpiCard
                  icon={Receipt}
                  label="Ticket promedio"
                  value={formatCurrencyCompact(ticketPromedio)}
                  subtitle="Por pedido de hoy"
                  accent="primary"
                  isLoading={isLoadingToday}
                  delay={0.15}
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Pagos pendientes"
                  value={formatCurrencyCompact(pagosPendientes)}
                  subtitle={`${itemsPendientes} items sin cobrar`}
                  accent="amber"
                  isLoading={isLoadingToday}
                  delay={0.2}
                  onClick={() => navigate('/pedidos')}
                  badge={itemsPendientes > 0 ? 'Revisar' : null}
                />
                <KpiCard
                  icon={Star}
                  label="Top producto hoy"
                  value={topProducto?.product_name || 'Sin ventas'}
                  subtitle={
                    topProducto
                      ? `${topProducto.quantity_sold} vendidos · ${formatCurrencyCompact(topProducto.revenue)}`
                      : 'Aún no hay registros'
                  }
                  accent="purple"
                  isLoading={isLoadingTopProducts}
                  delay={0.25}
                />
              </div>
            </motion.section>
          )}
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
