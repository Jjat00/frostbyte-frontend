import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, ChevronRight, Loader2 } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useMyOrders, useMyOrder, useMyOrdersLive } from "@/hooks";
import OrderStatusBadge from "@/components/order-tracker/OrderStatusBadge";
import OrderTracker from "@/components/order-tracker/OrderTracker";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

const TYPE_LABEL = {
  dine_in: "En el local",
  pickup: "Para recoger",
  delivery: "Domicilio",
};

const ACTIVE = ["pending", "preparing", "ready"];

const OrderCard = ({ order, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] p-4 transition-colors"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="text-[11px] text-white/40">
            {TYPE_LABEL[order.order_type] || order.order_type}
          </span>
        </div>
        <p className="text-sm text-light font-semibold mt-2">
          #{order.order_number}
        </p>
        <p className="text-xs text-white/40">
          {order.items_count} producto{order.items_count === 1 ? "" : "s"} ·{" "}
          {new Date(order.created_at).toLocaleString("es-CO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-gold font-black">{formatCOP(order.total)}</span>
        <ChevronRight className="w-4 h-4 text-white/30" />
      </div>
    </div>
  </button>
);

const MyOrdersPage = () => {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  // Hooks siempre en el mismo orden (el guard va después)
  useMyOrdersLive();
  const { data, isLoading } = useMyOrders({ enabled: isAuthenticated });
  const [selectedId, setSelectedId] = useState(null);
  const { data: selectedOrder } = useMyOrder(selectedId);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const orders = data?.results || [];
  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const past = orders.filter((o) => !ACTIVE.includes(o.status));

  return (
    <div className="min-h-screen bg-dark text-light">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-dark/90 border-b border-white/10">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            aria-label="Volver a la carta"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-wide">
            Mis pedidos
          </h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 gap-3">
            <span className="grid place-items-center w-14 h-14 rounded-full bg-white/5 text-white/40">
              <ClipboardList className="w-7 h-7" />
            </span>
            <p className="text-white/50">Aún no has hecho pedidos.</p>
            <Link
              to="/"
              className="rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-bold px-5 py-2.5"
            >
              Ver la carta
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-gold/80">
              En curso
            </h2>
            {active.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => setSelectedId(o.id)} />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-white/40">
              Anteriores
            </h2>
            {past.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => setSelectedId(o.id)} />
            ))}
          </section>
        )}
      </main>

      {/* Detalle / seguimiento en vivo */}
      <OrderTracker
        order={selectedOrder}
        show={!!selectedId && !!selectedOrder}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default MyOrdersPage;
