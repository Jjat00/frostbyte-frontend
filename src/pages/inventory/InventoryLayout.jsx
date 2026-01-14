import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
  Boxes,
  ClipboardList,
  Home,
  Store,
  Music,
  Gamepad2,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSongRequestsNotification } from "@/hooks";

const InventoryLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Home",
      shortName: "Home",
      path: "/home",
      icon: Home,
    },
    {
      name: "Menú",
      shortName: "Menú",
      path: "/",
      icon: Store,
      external: true,
    },
    {
      name: "Dashboard",
      shortName: "Inicio",
      path: "/inventario",
      icon: BarChart3,
      end: true,
    },
    {
      name: "Materiales",
      shortName: "Material",
      path: "/inventario/materiales",
      icon: Package,
    },
    {
      name: "Stock Bajo",
      shortName: "Stock",
      path: "/inventario/stock-bajo",
      icon: Boxes,
    },
    {
      name: "Órdenes",
      shortName: "Órdenes",
      path: "/inventario/ordenes",
      icon: ClipboardList,
    },
    {
      name: "Música",
      shortName: "Música",
      path: "/musica",
      icon: Music,
      hasNotification: true,
    },
    {
      name: "Juegos",
      shortName: "Juegos",
      path: "/juegos-admin",
      icon: Gamepad2,
    },
  ];

  const isActive = (path, end) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-14 bg-dark-secondary/95 backdrop-blur-sm border-b border-gray/20 flex items-center justify-between px-4 sticky top-0 z-30">
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
          className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-dark-secondary border-l border-gray/20 z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-gray/20 flex items-center justify-between">
                <span className="font-bold text-light">Menú</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="p-4 border-b border-gray/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-lg">
                    {user?.first_name?.charAt(0) ||
                      user?.username?.charAt(0) ||
                      "U"}
                  </div>
                  <div>
                    <p className="font-medium text-light">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-sm text-gray">{user?.role_display}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const baseClasses =
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-gray hover:text-light hover:bg-gray/10";

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
                            ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-light border border-primary/30"
                            : ""
                        }`
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
                        <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-gray/20">
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
      <aside className="hidden md:flex w-64 h-screen bg-dark-secondary border-r border-gray/20 flex-col fixed left-0 top-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray/20">
          <NavLink
            to="/home"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            title="Ir al Home"
          >
            <img
              src="/logo.png"
              alt="Frostbyte"
              className="w-10 h-10 group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="text-lg font-bold text-light tracking-wider group-hover:text-primary transition-colors">
                FROSTBYTE
              </h1>
              <p className="text-xs text-gray">Inventario</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const baseClasses =
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray hover:text-light hover:bg-gray/10";

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
                  `${baseClasses} ${
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-light border border-primary/30"
                      : ""
                  }`
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
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray">{user?.role_display}</p>
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
        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-secondary/95 backdrop-blur-sm border-t border-gray/20 z-30 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems
            .filter((item) => item.path !== "/home" && item.path !== "/")
            .map((item) => {
              const active = !item.external && isActive(item.path, item.end);
              const baseClasses = `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] transition-colors ${
                active ? "text-primary" : "text-gray"
              }`;

              if (item.external) {
                return (
                  <a key={item.path} href={item.path} className={baseClasses}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">
                      {item.shortName}
                    </span>
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
                    <item.icon
                      className={`w-5 h-5 ${active ? "text-primary" : ""}`}
                    />
                    {item.hasNotification && hasPendingRequests && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-dark-secondary animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">
                    {item.shortName}
                  </span>
                </NavLink>
              );
            })}
        </div>
      </nav>
    </div>
  );
};

export default InventoryLayout;
