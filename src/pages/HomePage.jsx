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
  Trophy,
  Users,
  Layers,
  ChevronRight,
  CalendarDays,
  Crown,
  Bot,
  Smile,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification } from '@/hooks';
import StoreControls from '@/components/home/StoreControls';
import { ordersService } from '@/services/orders.service';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';

// Punto de color por negocio (alineado con BusinessSelector)
const businessDot = (color) => {
  const map = { blue: 'bg-secondary', orange: 'bg-orange-400' };
  return map[color] || 'bg-gradient-to-br from-primary to-secondary';
};

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

const KpiCard = ({ icon: Icon, label, value, subtitle, isLoading, delay = 0, onClick, badge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={onClick ? { y: -4 } : undefined}
      onClick={onClick}
      className={`fb-card group flex h-full min-w-0 flex-col p-4 md:p-5 ${
        onClick ? 'fb-card--halo cursor-pointer' : ''
      }`}
    >

      <div className="relative z-10 flex flex-col h-full min-w-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
            <Icon className="h-[18px] w-[18px] text-light/70" strokeWidth={1.6} />
          </span>
          {badge && (
            <span className="fb-pill shrink-0 text-[0.6rem] uppercase tracking-[0.16em]">
              {badge}
            </span>
          )}
        </div>

        <p className="fb-eyebrow mb-2 block truncate">{label}</p>

        {isLoading ? (
          <div className="space-y-2 mt-auto">
            <div className="h-7 bg-white/[0.08] rounded-lg w-32 animate-pulse" />
            <div className="h-3 bg-white/[0.05] rounded w-24 animate-pulse" />
          </div>
        ) : (
          <div className="mt-auto min-w-0">
            <p
              className="truncate font-medium leading-tight text-light"
              style={{ fontSize: 'clamp(1.05rem, 2vw, 1.5rem)' }}
              title={typeof value === 'string' ? value : undefined}
            >
              {value}
            </p>
            {subtitle && (
              <p className="mt-1.5 truncate text-[0.7rem] text-light/40" title={subtitle}>
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

  // Negocio activo (contexto global elegido tras el login)
  const { selectedBusinessSlug } = useBusinessStore();
  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData)
    ? businessesData
    : businessesData?.results || [];
  const activeBusiness = businesses.find((b) => b.slug === selectedBusinessSlug);
  const contextName = selectedBusinessSlug
    ? activeBusiness?.name || 'Negocio'
    : 'Todos los negocios';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: todayStats, isLoading: isLoadingToday } = useQuery({
    queryKey: ['home-today-stats', selectedBusinessSlug],
    queryFn: () => ordersService.getStats('today', null, null, selectedBusinessSlug || undefined),
    enabled: isAdminUser,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: topProductsToday, isLoading: isLoadingTopProducts } = useQuery({
    queryKey: ['home-top-products-today', selectedBusinessSlug],
    queryFn: () => ordersService.getProductStats('today', null, null, selectedBusinessSlug || undefined),
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
      features: [
        { icon: ClipboardList, text: 'Activos' },
        { icon: ShoppingCart, text: 'Nuevo Pedido' },
        { icon: BarChart3, text: 'Estadísticas' },
      ],
    },
    {
      id: 'reservations',
      title: 'Reservas',
      description: 'Mesas, grupos grandes y la Sala VIP del piso 3',
      icon: CalendarDays,
      path: '/reservas-admin',
      features: [
        { icon: CalendarDays, text: 'Calendario' },
        { icon: Crown, text: 'Sala VIP' },
        { icon: Users, text: 'Grupos' },
      ],
    },
    {
      id: 'products',
      title: 'Productos',
      description: 'Gestiona productos de la carta, categorías y variantes',
      icon: Store,
      path: '/productos',
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
      features: [
        { icon: DollarSign, text: 'Ingresos vs Gastos' },
        { icon: PieChart, text: 'Distribucion' },
        { icon: BarChart3, text: 'Tendencias' },
      ],
    },
    {
      id: 'whatsapp-agent',
      title: 'Agente de WhatsApp',
      description: 'Como habla Frosty, que puede mandar y su banco de stickers',
      icon: Bot,
      path: '/agente-whatsapp',
      features: [
        { icon: MessageSquare, text: 'Tono' },
        { icon: Smile, text: 'Stickers' },
        { icon: Shield, text: 'Permisos' },
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
    <div className="fb-screen fb-screen--plain min-h-screen">
      {/* Header - Modern and sleek */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-dark/95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo section */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              title="Ver Carta Pública"
            >
              <div className="relative">
                <img loading="lazy" decoding="async" src="/logo.png" alt="Frostbyte" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                              </div>
              <div>
                <h1 className="font-display text-[1.05rem] font-semibold tracking-[0.16em] text-light transition-colors group-hover:text-light/70">
                  FROSTBYTE
                </h1>
                <p className="text-xs text-gray tracking-wide">SISTEMA DE GESTIÓN</p>
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Negocio activo - clic para cambiar */}
              <button
                onClick={() => navigate('/seleccionar-negocio')}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg hover:bg-white/[0.1] transition-colors"
                title="Cambiar de negocio"
              >
                {selectedBusinessSlug ? (
                  <span className={`w-2.5 h-2.5 rounded-full ${businessDot(activeBusiness?.color)}`} />
                ) : (
                  <Layers className="w-4 h-4 text-primary" />
                )}
                <span className="hidden sm:inline text-sm font-semibold text-light max-w-[140px] truncate">
                  {contextName}
                </span>
                <ChevronRight className="w-4 h-4 text-gray" />
              </button>

              {/* View Menu Button */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-dark transition-all duration-300 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
                title="Ver Carta Pública"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold">Ver Carta</span>
              </Link>

              {/* User info */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/[0.09] border border-white/[0.1] rounded-lg">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border border-white/[0.12] bg-white/[0.04] flex items-center justify-center text-dark font-bold text-lg">
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
                <h2 className="font-display mb-2 text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-light">
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
                {/* Controles del local (abierto/cerrado + domicilios) para el staff */}
                <StoreControls />
                <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray">Sistema</span>
                  <span className="text-xs font-semibold text-light">Operativo</span>
                </div>
                {hasPendingRequests && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate('/musica')}
                    className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-2 hover:bg-purple-500/20 transition-colors"
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
                    Hoy · {contextName}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-gray ml-1">
                    {selectedBusinessSlug ? 'Datos de este negocio' : 'Consolidado · ver desglose en Estadísticas'}
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
                  isLoading={isLoadingToday}
                  delay={0.05}
                  onClick={() => navigate('/analytics')}
                />
                <KpiCard
                  icon={ShoppingCart}
                  label="Pedidos de hoy"
                  value={pedidosHoy}
                  subtitle={pedidosHoy === 1 ? '1 pedido registrado' : `${pedidosHoy} pedidos registrados`}
                  isLoading={isLoadingToday}
                  delay={0.1}
                  onClick={() => navigate('/pedidos')}
                />
                <KpiCard
                  icon={Receipt}
                  label="Ticket promedio"
                  value={formatCurrencyCompact(ticketPromedio)}
                  subtitle="Por pedido de hoy"
                  isLoading={isLoadingToday}
                  delay={0.15}
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Pagos pendientes"
                  value={formatCurrencyCompact(pagosPendientes)}
                  subtitle={`${itemsPendientes} items sin cobrar`}
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
                className="fb-card fb-card--halo group relative cursor-pointer overflow-hidden p-5"
              >

                <div className="relative z-10">
                  {/* Icon and badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/[0.1] bg-white/[0.03]">
                      <Icon className="h-5 w-5 text-light/70" strokeWidth={1.6} />
                      {module.id === 'music' && hasPendingRequests && (
                        <>
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dark bg-secondary text-[0.6rem] font-semibold text-dark">
                            {pendingCount}
                          </span>
                        </>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-light/25 transition-colors group-hover:text-light/60" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display mb-2 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
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
