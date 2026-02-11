import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  Store,
  Music,
  Gamepad2,
  TrendingUp,
  Wallet,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSongRequestsNotification } from "@/hooks";

const SIDEBAR_WIDTH = 256; // w-64
const SIDEBAR_COLLAPSED_WIDTH = 72; // w-18 (icon + padding)

const AnalyticsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { hasPendingRequests, pendingCount } = useSongRequestsNotification();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", shortName: "Home", path: "/home", icon: Home },
    { name: "Carta", shortName: "Carta", path: "/", icon: Store, external: true },
    { name: "Dashboard", shortName: "Dashboard", path: "/analytics", icon: BarChart3, end: true },
    { name: "Gastos", shortName: "Gastos", path: "/gastos", icon: Wallet },
    { name: "Musica", shortName: "Musica", path: "/musica", icon: Music, hasNotification: true },
    { name: "Juegos", shortName: "Juegos", path: "/juegos-admin", icon: Gamepad2 },
  ];

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

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
                <span className="font-bold text-light">Menu</span>
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
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
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
                  <span className="font-medium">Cerrar sesion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex h-screen bg-dark-secondary border-r border-gray/20 flex-col fixed left-0 top-0 z-20 overflow-hidden"
      >
        {/* Logo */}
        <div className={`border-b border-gray/20 ${collapsed ? "p-3" : "p-5"}`}>
          <NavLink
            to="/home"
            className={`flex items-center hover:opacity-80 transition-opacity group ${collapsed ? "justify-center" : "gap-3"}`}
            title="Ir al Home"
          >
            <img
              src="/logo.png"
              alt="Frostbyte"
              className={`${collapsed ? "w-9 h-9" : "w-10 h-10"} group-hover:scale-105 transition-transform flex-shrink-0`}
            />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-light tracking-wider group-hover:text-primary transition-colors whitespace-nowrap">
                  FROSTBYTE
                </h1>
                <p className="text-xs text-gray flex items-center gap-1 whitespace-nowrap">
                  <TrendingUp className="w-3 h-3" />
                  Estadisticas
                </p>
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? "p-2" : "p-3"} space-y-1 overflow-y-auto overflow-x-hidden`}>
          {navItems.map((item) => {
            const activeClass = "bg-gradient-to-r from-primary/20 to-secondary/20 text-light border border-primary/30";
            const baseClasses = `flex items-center rounded-lg transition-all duration-200 text-gray hover:text-light hover:bg-gray/10 ${
              collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
            }`;

            const content = (isActiveState) => (
              <>
                <div className="relative flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                  {item.hasNotification && hasPendingRequests && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-secondary animate-pulse" />
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1 whitespace-nowrap">{item.name}</span>
                    {item.hasNotification && hasPendingRequests && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-green-500 text-dark rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </>
            );

            if (item.external) {
              return (
                <a key={item.path} href={item.path} className={baseClasses} title={collapsed ? item.name : undefined}>
                  {content(false)}
                </a>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? activeClass : ""}`
                }
              >
                {({ isActive: isActiveState }) => content(isActiveState)}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`border-t border-gray/20 ${collapsed ? "p-2" : "p-3"}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold text-sm cursor-default"
                title={user?.full_name || user?.username}
              >
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Cerrar sesion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-dark font-bold flex-shrink-0">
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
                <span className="text-sm whitespace-nowrap">Cerrar sesion</span>
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <div className="border-t border-gray/20 p-2">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center p-2 text-gray hover:text-secondary hover:bg-gray/10 rounded-lg transition-colors"
            title={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-h-screen md:transition-[margin-left] md:duration-[250ms] md:ease-in-out"
        style={{ '--sidebar-w': `${sidebarWidth}px` }}
      >
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto md:ml-[var(--sidebar-w)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-secondary/95 backdrop-blur-sm border-t border-gray/20 z-30 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems
            .filter((item) => item.path !== "/home" && item.path !== "/" && item.path !== "/musica" && item.path !== "/juegos-admin" && item.path !== "/gastos")
            .map((item) => {
              const active = !item.external && isActive(item.path, item.end);
              const baseClasses = `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] transition-colors ${
                active ? "text-primary" : "text-gray"
              }`;

              if (item.external) {
                return (
                  <a key={item.path} href={item.path} className={baseClasses}>
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
                    <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
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
};

export default AnalyticsLayout;
