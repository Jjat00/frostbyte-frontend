import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import MyReservationsList from "@/components/reservations/MyReservationsList";
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
    <div className="min-h-screen bg-dark text-light pb-16">
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/mi-cuenta"
            aria-label="Volver a mi cuenta"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-black uppercase tracking-wide flex-1">
            Mis <span className="text-gold">reservas</span>
          </h1>
          {reservationsEnabled && (
            <Link
              to="/reservas"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-linear-to-r from-gold to-amber-600 text-dark text-xs font-black uppercase"
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
              <span className="grid place-items-center w-14 h-14 rounded-full bg-white/5 text-white/40">
                <CalendarDays className="w-7 h-7" />
              </span>
              <p className="text-white/50">Aún no has hecho reservas.</p>
              {reservationsEnabled && (
                <Link
                  to="/reservas"
                  className="rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark font-bold px-5 py-2.5 text-sm"
                >
                  Reservar mesa o Sala VIP
                </Link>
              )}
            </div>
          }
        />
      </main>
    </div>
  );
};

export default MyReservationsPage;
