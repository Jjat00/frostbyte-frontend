import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import MyReservationsList from "@/components/reservations/MyReservationsList";
import CustomerTabBar, { tabBarSpacing } from "@/components/CustomerTabBar";
import { useReservationsConfig } from "@/hooks/useReservations";

/**
 * Mis reservas: historial completo del cliente (próximas y anteriores),
 * con cancelación y acceso directo a crear una nueva.
 */
const MyReservationsPage = () => {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const { data: config } = useReservationsConfig();
  const reservationsEnabled = !!config?.reservations_enabled;

  if (!isAuthenticated) return <Navigate to="/mi-cuenta" replace />;

  return (
    <div className={`fb-screen fb-screen--plain min-h-screen text-light ${tabBarSpacing}`}>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-dark/95">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/mi-cuenta"
            aria-label="Volver a mi cuenta"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display flex-1 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
            Mis reservas
          </h1>
          {reservationsEnabled && (
            <Link
              to="/reservas"
              className="fb-pill"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <MyReservationsList
          mode="full"
          emptyState={
            <div className="flex flex-col items-center text-center py-16 gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.09] text-light/35">
                <CalendarDays className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <p className="text-[0.82rem] text-light/50">Aún no has hecho reservas.</p>
              {reservationsEnabled && (
                <Link
                  to="/reservas"
                  className="fb-btn fb-btn--accent"
                >
                  Reservar mesa o Sala VIP
                </Link>
              )}
            </div>
          }
        />
      </main>

      <CustomerTabBar />
    </div>
  );
};

export default MyReservationsPage;
