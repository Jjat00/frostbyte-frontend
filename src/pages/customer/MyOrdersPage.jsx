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
import {
  useMyOrders,
  useMyOrder,
  useMyOrdersLive,
  useMediaQuery,
  useCartaPath,
  useStoreConfig,
} from "@/hooks";
import OrderStatusBadge from "@/components/order-tracker/OrderStatusBadge";
import OrderTracker, {
  OrderTrackerContent,
} from "@/components/order-tracker/OrderTracker";
import CustomerTabBar, { tabBarSpacing } from "@/components/CustomerTabBar";

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
        ? "bg-secondary/[0.08] border-secondary/40"
        : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07]"
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="text-[0.68rem] text-light/40">
            {TYPE_LABEL[order.order_type] || order.order_type}
          </span>
        </div>
        <p className="mt-2 text-[0.8rem] font-medium text-light">
          #{order.order_number}
        </p>
        <p className="text-[0.7rem] text-light/40">
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
        <span className="text-[0.85rem] font-medium text-light">{formatCOP(order.total)}</span>
        <ChevronRight
          className={`w-4 h-4 ${selected ? "text-secondary" : "text-white/30"} lg:hidden`}
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
  // Quien vino del QR de una mesa vuelve a su mesa, no a la carta pública
  const { cartaPath } = useCartaPath();
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: selectedOrder, isLoading: isLoadingOrder } =
    useMyOrder(selectedId);

  const { data: storeConfig } = useStoreConfig();
  const orderingEnabled = !!storeConfig?.customer_ordering_enabled;

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

  if (!isAuthenticated) return <Navigate to={cartaPath} replace />;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (!isDesktop) setSheetOpen(true);
  };

  const list = (
    <>
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="fb-eyebrow fb-eyebrow--accent">
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
          <h2 className="fb-eyebrow">
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
    <div className={`fb-screen fb-screen--plain min-h-screen text-light ${tabBarSpacing}`}>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-dark/95">
        <div className="container mx-auto max-w-2xl lg:max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link
            to={cartaPath}
            aria-label="Volver a la carta"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display flex-1 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
            Mis pedidos
          </h1>
          <Link
            to="/mi-cuenta"
            aria-label="Mi cuenta"
            className="grid place-items-center rounded-full ring-1 ring-white/15 transition-all hover:ring-white/35"
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
            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.09] text-light/35">
              <ClipboardList className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <p className="text-[0.82rem] text-light/50">Aún no has hecho pedidos.</p>
            {/* Con los domicilios en pausa el servicio no se nombra */}
            {orderingEnabled && (
              <Link
                to="/domicilios"
                className="fb-btn fb-btn--accent"
              >
                Pedir a domicilio
              </Link>
            )}
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
                <div className="fb-card overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.1]">
                    <Receipt className="w-5 h-5 text-secondary" />
                    <div>
                      <h3 className="font-display text-[0.88rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
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

      <CustomerTabBar />
    </div>
  );
};

export default MyOrdersPage;
