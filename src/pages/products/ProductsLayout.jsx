import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  PlusCircle,
  List,
  Tag,
  Layers,
  Calculator,
  LogOut,
  Menu,
  X,
  Home,
  Store,
  Music,
  Gamepad2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSongRequestsNotification } from '@/hooks';
import BusinessContextBadge from '@/components/BusinessContextBadge';

const ProductsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

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
      name: 'Productos',
      shortName: 'Productos',
      path: '/productos',
      icon: List,
      end: true,
    },
    {
      name: 'Nuevo Producto',
      shortName: 'Nuevo',
      path: '/productos/nuevo',
      icon: PlusCircle,
      adminOnly: true,
    },
    {
      name: 'Categorías',
      shortName: 'Categorías',
      path: '/productos/categorias',
      icon: Tag,
      adminOnly: true,
    },
    {
      name: 'Modificadores',
      shortName: 'Opciones',
      path: '/productos/modificadores',
      icon: Layers,
      adminOnly: true,
    },
    {
      name: 'Costeo',
      shortName: 'Costeo',
      path: '/productos/costeo',
      icon: Calculator,
      adminOnly: true,
    },
    {
      name: 'Música',
      shortName: 'Música',
      path: '/musica',
      icon: Music,
      hasNotification: true,
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
                    <p className="text-sm text-gray">{user?.role_display || 'Admin'}</p>
                  </div>
                </div>
              </div>

              {/* Selector de negocio */}
              {isAdmin() && (
                <div className="p-4 border-b border-white/[0.07]">
                  <BusinessContextBadge />
                </div>
              )}

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
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                        {item.hasNotification && hasPendingRequests && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark animate-pulse" />
                        )}
                      </div>
                      <span className="font-medium flex-1">{item.name}</span>
                      {item.hasNotification && hasPendingRequests && (
                        <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">
                          {pendingCount}
                        </span>
                      )}
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
              <p className="text-xs text-secondary">Productos</p>
            </div>
          </NavLink>
        </div>

        {/* Selector de negocio */}
        {isAdmin() && (
          <div className="p-3 border-b border-white/[0.07]">
            <BusinessContextBadge />
          </div>
        )}

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
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.hasNotification && hasPendingRequests && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark animate-pulse" />
                  )}
                </div>
                <span className="font-medium flex-1">{item.name}</span>
                {item.hasNotification && hasPendingRequests && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">
                    {pendingCount}
                  </span>
                )}
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
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0">
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
                  <div className="relative">
                    <item.icon className={`w-5 h-5 ${active ? 'text-secondary' : ''}`} />
                    {item.hasNotification && hasPendingRequests && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-dark animate-pulse" />
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
};

export default ProductsLayout;

