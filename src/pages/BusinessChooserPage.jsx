import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Store,
  UtensilsCrossed,
  LayoutGrid,
  LogOut,
  ArrowRight,
  Loader2,
  Layers,
} from "lucide-react";
import { businessService } from "@/services/business.service";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

// Paleta visual por color de marca del negocio.
const palettes = {
  blue: {
    gradient: "from-secondary to-cyan-400",
    ring: "hover:border-secondary/50",
    glow: "group-hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-secondary)_25%,transparent)]",
    icon: Store,
  },
  orange: {
    gradient: "from-orange-400 to-amber-500",
    ring: "hover:border-orange-400/50",
    glow: "group-hover:shadow-[0_0_40px_rgba(251,146,60,0.25)]",
    icon: UtensilsCrossed,
  },
  _default: {
    gradient: "from-primary to-secondary",
    ring: "hover:border-primary/50",
    glow: "group-hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]",
    icon: Store,
  },
};

const floorLabel = (floor) => {
  if (floor == null) return null;
  return `${floor}.º piso`;
};

const BusinessChooserPage = () => {
  const navigate = useNavigate();
  const { setSelectedBusiness, selectedBusinessSlug } = useBusinessStore();
  const { user, isAdmin, logout } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const businesses = (Array.isArray(data) ? data : data?.results || []).filter(
    (b) => b.is_active !== false
  );

  const enter = (slug) => {
    setSelectedBusiness(slug);
    navigate("/home");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      {/* Fondos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Frostbyte" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold text-light tracking-wider">FROSTBYTE</h1>
            <p className="text-xs text-gray">Sistema de gestión</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Contenido */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-light mb-2">
            Hola, {user?.first_name || user?.username}
          </h2>
          <p className="text-gray text-base md:text-lg">
            ¿A qué negocio quieres entrar?
          </p>
        </motion.div>

        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        ) : (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map((b, idx) => {
              const p = palettes[b.color] || palettes._default;
              const Icon = p.icon;
              return (
                <motion.button
                  key={b.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={() => enter(b.slug)}
                  className={cn(
                    "liquid-glass-interactive group relative text-left rounded-2xl p-6 border border-white/[0.1] bg-white/[0.04] transition-all overflow-hidden",
                    p.ring,
                    p.glow,
                    selectedBusinessSlug === b.slug && "ring-2 ring-secondary/40"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.08] transition-opacity",
                      p.gradient
                    )}
                  />
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "inline-flex p-3 rounded-xl bg-gradient-to-br mb-4 group-hover:scale-110 transition-transform",
                        p.gradient
                      )}
                    >
                      <Icon className="w-7 h-7 text-dark" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-light">{b.name}</h3>
                      {floorLabel(b.floor) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-gray border border-white/[0.1]">
                          {floorLabel(b.floor)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray line-clamp-2 min-h-[2.5rem]">
                      {b.description || "Gestiona este negocio por separado"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-4 text-secondary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Entrar <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {/* "Todos los negocios": el mesero la usa para atender ambos;
                el dueño la ve como consolidado. Disponible para todos los roles. */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: businesses.length * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => enter("")}
              className={cn(
                "liquid-glass-interactive group relative text-left rounded-2xl p-6 border border-white/[0.12] bg-gradient-to-br from-primary/[0.06] to-secondary/[0.06] transition-all overflow-hidden hover:border-primary/40 group-hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
                selectedBusinessSlug === "" && "ring-2 ring-primary/40"
              )}
            >
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7 text-dark" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-light">Todos los negocios</h3>
                </div>
                <p className="text-sm text-gray line-clamp-2 min-h-[2.5rem]">
                  {isAdmin()
                    ? "Vista consolidada: ingresos, inventario y gastos de los dos negocios."
                    : "Atiende los dos negocios a la vez (ideal para meseros)."}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Entrar <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          </div>
        )}

        <p className="text-gray/50 text-xs mt-8 flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5" />
          Puedes cambiar de negocio en cualquier momento desde el panel
        </p>
      </main>
    </div>
  );
};

export default BusinessChooserPage;
