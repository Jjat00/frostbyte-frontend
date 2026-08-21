import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Music,
  Youtube,
  LogOut,
  Menu,
  X,
  Home,
  Store,
  Package,
  ShoppingCart,
  Gamepad2,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { musicService } from '@/services';

const MusicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: musicSettings } = useQuery({
    queryKey: ['music-settings'],
    queryFn: () => musicService.getSettings(),
    staleTime: 30000,
  });

  const updateSourceMutation = useMutation({
    mutationFn: (source) => musicService.updateSettings({ source }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music-settings'] });
    },
  });

  const activeSource = musicSettings?.source || 'youtube';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allNavItems = [
    {
      name: 'Home',
      shortName: 'Home',
      path: '/home',
      icon: Home,
    },
    {
      name: 'Carta',
      shortName: 'Carta',
      path: '/',
      icon: Store,
      external: true,
    },
    {
      name: 'Inventario',
      shortName: 'Inventario',
      path: '/inventario',
      icon: Package,
      adminOnly: true,
    },
    {
      name: 'Pedidos',
      shortName: 'Pedidos',
      path: '/pedidos',
      icon: ShoppingCart,
    },
    {
      name: 'Productos',
      shortName: 'Productos',
      path: '/productos',
      icon: Store,
    },
    {
      name: 'Spotify',
      shortName: 'Spotify',
      path: '/musica',
      icon: Music,
      end: true,
    },
    {
      name: 'YouTube',
      shortName: 'YouTube',
      path: '/musica/youtube',
      icon: Youtube,
      end: true,
    },
    {
      name: 'Juegos',
      shortName: 'Juegos',
      path: '/juegos-admin',
      icon: Gamepad2,
    },
  ];

  // Filtrar items según el rol
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin());

  const isActive = (path, end) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fb-screen fb-screen--plain flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.07] bg-dark/95 px-4 md:hidden">
        <NavLink 
          to="/home" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
          title="Ir al Home"
        >
          <img loading="lazy" decoding="async" src="/logo.png" alt="Frostbyte" className="w-8 h-8" />
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
              className="fixed bottom-0 right-0 top-0 z-50 flex w-72 flex-col border-l border-white/[0.07] bg-dark md:hidden"
            >
              <div className="p-4 border-b border-white/[0.1] flex items-center justify-between">
                <span className="font-bold text-light">Menú</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="p-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-[0.85rem] font-medium text-light">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-light">{user?.full_name || user?.username}</p>
                    <p className="text-sm text-gray">{user?.role_display || 'Usuario'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const baseClasses = "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-gray hover:text-light hover:bg-white/[0.06]";
                  
                  if (item.external) {
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={baseClasses}
                      >
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
                        `${baseClasses} ${
                          isActive
                            ? 'bg-gradient-to-r from-secondary/20 to-primary/20 text-light border border-secondary/30'
                            : ''
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/[0.1]">
                <button
                  onClick={handleLogout}
                  className="fb-btn w-full border-red-500/25 text-red-400 hover:border-red-500/45 hover:text-red-300"
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
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/[0.07] bg-dark md:flex">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.07]">
          <NavLink 
            to="/home" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            title="Ir al Home"
          >
            <img loading="lazy" decoding="async" src="/logo.png" alt="Frostbyte" className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-lg font-bold text-light tracking-wider group-hover:text-secondary transition-colors">FROSTBYTE</h1>
              <p className="text-xs text-secondary">Música</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray hover:text-light hover:bg-white/[0.06]";
            
            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={baseClasses}
                >
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
                  `${baseClasses} ${
                    isActive
                      ? 'bg-gradient-to-r from-secondary/20 to-primary/20 text-light border border-secondary/30'
                      : ''
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.1]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-[0.8rem] font-medium text-light">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray">{user?.role_display || 'Usuario'}</p>
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
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0">
        {/* Source selector - visible para admin */}
        {isAdmin() && (
          <div className="sticky top-0 md:top-0 z-20 bg-dark/80 border-b border-white/[0.08] px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4 text-secondary" />
                <span className="text-white/60">Fuente publica:</span>
                <span className="font-bold text-white">
                  {activeSource === 'youtube' ? 'YouTube' : 'Spotify'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
                <button
                  onClick={() => updateSourceMutation.mutate('youtube')}
                  disabled={updateSourceMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeSource === 'youtube'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  YouTube
                </button>
                <button
                  onClick={() => updateSourceMutation.mutate('spotify')}
                  disabled={updateSourceMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeSource === 'spotify'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  Spotify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.07] bg-dark/95 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems
            .filter(item => item.path !== '/home' && item.path !== '/')
            .map((item) => {
              const active = !item.external && isActive(item.path, item.end);
              const baseClasses = `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] transition-colors ${
                active ? 'text-secondary' : 'text-gray'
              }`;
              
              if (item.external) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={baseClasses}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.shortName}</span>
                  </a>
                );
              }
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={baseClasses}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-secondary' : ''}`} />
                  <span className="text-[10px] font-medium">{item.shortName}</span>
                </NavLink>
              );
            })}
        </div>
      </nav>
    </div>
  );
};

export default MusicLayout;

