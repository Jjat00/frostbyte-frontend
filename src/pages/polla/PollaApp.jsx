import React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { ArrowLeft, Target, LayoutGrid, Trophy, Flag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useMyStats } from "@/hooks/usePolla";
import PartidosTab from "./PartidosTab";
import GruposTab from "./GruposTab";
import RankingTab from "./RankingTab";
import MisionesTab from "./MisionesTab";

const TABS = [
  { id: "partidos", path: "/partidos", label: "Partidos", icon: Target, Component: PartidosTab },
  { id: "grupos", path: "/grupos", label: "Grupos", icon: LayoutGrid, Component: GruposTab },
  { id: "ranking", path: "/ranking", label: "Ranking", icon: Trophy, Component: RankingTab },
  { id: "misiones", path: "/misiones", label: "Misiones", icon: Flag, Component: MisionesTab },
];

const PollaApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);
  const logout = useCustomerAuthStore((s) => s.logout);
  const { data: stats } = useMyStats();
  const firstName =
    customer?.first_name || customer?.full_name?.split(" ")[0] || "crack";

  // Solo para clientes con sesión; el resto vuelve al landing de la Polla.
  if (!isAuthenticated) return <Navigate to="/polla-mundial" replace />;

  // El tab activo se deriva de la ruta (/partidos, /grupos, …).
  const activeTab = TABS.find((t) => t.path === location.pathname) ?? TABS[0];
  const active = activeTab.id;
  const ActiveComponent = activeTab.Component;

  return (
    <div className="min-h-screen bg-dark text-light">
      <Helmet>
        <title>Mi Polla Mundialista | Frostbyte</title>
      </Helmet>

      {/* Glows de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-primary blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-secondary blur-[130px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-black tracking-widest text-light transition-colors hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">FROSTBYTE</span>
            <span className="sm:hidden">POLLA</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pildora de puntos */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-secondary px-3.5 py-1.5 text-sm font-black text-dark shadow-lg shadow-primary/30">
              {stats?.points ?? 0}
              <span className="text-[11px] font-bold">pts</span>
            </span>

            {/* Avatar */}
            {customer?.avatar_url ? (
              <img loading="lazy" decoding="async"
                src={customer.avatar_url}
                alt={firstName}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-primary/40 object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-sm font-bold text-dark">
                {firstName.charAt(0).toUpperCase()}
              </span>
            )}

            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="rounded-full p-1.5 text-gray transition-colors hover:bg-white/10 hover:text-primary"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tabs (desktop / tablet) */}
        <nav className="mx-auto hidden max-w-2xl gap-1 px-4 pb-2 sm:flex">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.path)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors",
                  isActive ? "text-primary" : "text-gray hover:text-light"
                )}
              >
                <t.icon size={16} />
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline-desktop"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-primary to-secondary"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Contenido ── */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-28 pt-6 sm:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Barra inferior (móvil) ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-dark/90 backdrop-blur-xl sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.path)}
                className="relative flex flex-col items-center gap-1 py-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-underline-mobile"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-linear-to-r from-primary to-secondary"
                  />
                )}
                <t.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-gray"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    isActive ? "text-primary" : "text-gray"
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PollaApp;
