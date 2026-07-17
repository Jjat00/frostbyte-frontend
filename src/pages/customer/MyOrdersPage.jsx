import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  ChevronRight,
  Loader2,
  Receipt,
} from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import CustomerAvatar from "@/components/auth/CustomerAvatar";
import { useMyOrders, useMyOrder, useMyOrdersLive, useMediaQuery } from "@/hooks";
import OrderStatusBadge from "@/components/order-tracker/OrderStatusBadge";
import OrderTracker, {
  OrderTrackerContent,
} from "@/components/order-tracker/OrderTracker";

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

const OrderCard = ({ order, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left rounded-xl border p-4 transition-colors ${
      selected
        ? "bg-gold/[0.08] border-gold/40"
        : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07]"
    }`}
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
        <ChevronRight
          className={`w-4 h-4 ${selected ? "text-gold" : "text-white/30"} lg:hidden`}
        />
      </div>
    </div>
  </button>
);

const MyOrdersPage = () => {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);

  // Hooks siempre en el mismo orden (el guard va después)
  useMyOrdersLive();
  const { data, isLoading } = useMyOrders({ enabled: isAuthenticated });
  // En lg+ la página es maestro-detalle: lista a la izquierda, detalle fijo
  // a la derecha. En pantallas menores el detalle abre como bottom sheet.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: selectedOrder, isLoading: isLoadingOrder } =
    useMyOrder(selectedId);

  const orders = data?.results || [];
  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const past = orders.filter((o) => !ACTIVE.includes(o.status));

  // Autoseleccionar el pedido más relevante para que el panel de desktop
  // nunca abra vacío (en móvil solo precarga el detalle, no abre el sheet).
  useEffect(() => {
    if (!selectedId && orders.length > 0) {
      setSelectedId((active[0] || orders[0]).id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (!isDesktop) setSheetOpen(true);
  };

  const list = (
    <>
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-gold/80">
            En curso
          </h2>
          {active.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              selected={isDesktop && o.id === selectedId}
              onClick={() => handleSelect(o.id)}
            />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-white/40">
            Anteriores
          </h2>
          {past.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              selected={isDesktop && o.id === selectedId}
              onClick={() => handleSelect(o.id)}
            />
          ))}
        </section>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-dark text-light">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-dark/90 border-b border-white/10">
        <div className="container mx-auto max-w-2xl lg:max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            aria-label="Volver a la carta"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-wide flex-1">
            Mis pedidos
          </h1>
          <Link
            to="/mi-cuenta"
            aria-label="Mi cuenta"
            className="grid place-items-center rounded-full ring-2 ring-gold/40 hover:ring-gold transition-all"
          >
            <CustomerAvatar customer={customer} className="w-8 h-8 text-sm" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl lg:max-w-6xl px-4 py-6">
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
              to="/domicilios"
              className="rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-bold px-5 py-2.5"
            >
              Pedir a domicilio
            </Link>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-8 lg:items-start">
            {/* Lista */}
            <div className="space-y-6">{list}</div>

            {/* Detalle inline (solo desktop); el mapa es pesado, así que el
                panel no se monta en pantallas menores */}
            {isDesktop && (
              <aside className="hidden lg:block sticky top-20">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.1]">
                    <Receipt className="w-5 h-5 text-secondary" />
                    <div>
                      <h3 className="font-bold text-light text-lg leading-tight">
                        {selectedOrder
                          ? `Pedido #${selectedOrder.order_number}`
                          : "Detalle del pedido"}
                      </h3>
                      {selectedOrder && (
                        <p className="text-xs text-gray">
                          {TYPE_LABEL[selectedOrder.order_type] ||
                            selectedOrder.order_type}{" "}
                          ·{" "}
                          {new Date(selectedOrder.created_at).toLocaleString(
                            "es-CO",
                            {
                              day: "2-digit",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-5 space-y-4">
                    {selectedOrder ? (
                      <OrderTrackerContent order={selectedOrder} />
                    ) : isLoadingOrder ? (
                      <div className="flex items-center justify-center py-16 text-white/30">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <p className="text-sm text-white/40 text-center py-16">
                        Selecciona un pedido para ver su seguimiento.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </main>

      {/* Detalle / seguimiento en vivo (bottom sheet hasta lg) */}
      <OrderTracker
        order={selectedOrder}
        show={sheetOpen && !!selectedOrder && !isDesktop}
        onClose={() => setSheetOpen(false)}
        desktopPanel={false}
      />
    </div>
  );
};

export default MyOrdersPage;
