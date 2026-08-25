import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChefHat,
  CheckCircle,
  Loader2,
  RefreshCw,
  Utensils,
  CircleDot,
  Undo2,
} from "lucide-react";
import { ordersService } from "@/services/orders.service";
import { businessService } from "@/services/business.service";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { useWebSocket } from "@/hooks";
import { PaymentPendingBadge, SourceBadge } from "@/components/orders/DeliveryInfo";
import { cn } from "@/lib/utils";

// Config visual por estado de preparación del item
const prepConfig = {
  pending: {
    label: "Pendiente",
    icon: CircleDot,
    cardClass: "border-yellow-500/30 bg-yellow-500/[0.06]",
    badgeClass: "bg-yellow-500/20 text-yellow-300",
    next: "preparing",
    nextLabel: "Empezar",
    nextBtn: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  preparing: {
    label: "Preparando",
    icon: ChefHat,
    cardClass: "border-blue-500/30 bg-blue-500/[0.06]",
    badgeClass: "bg-blue-500/20 text-blue-300",
    next: "ready",
    nextLabel: "Listo",
    nextBtn: "bg-green-500 hover:bg-green-600 text-white",
  },
  ready: {
    label: "Listo",
    icon: CheckCircle,
    cardClass: "border-green-500/30 bg-green-500/[0.06]",
    badgeClass: "bg-green-500/20 text-green-300",
    next: null,
    nextLabel: "Listo",
    nextBtn: "",
  },
};

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

const minutesSince = (dateString) =>
  Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

const timeSinceLabel = (dateString) => {
  const m = minutesSince(dateString);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

/** Tarjeta de un pedido en la cocina: solo los items de ESTE negocio. */
const KitchenOrderCard = ({ order, onSetPrep, onAllReady, pendingItemId, busyOrderId }) => {
  const waitMin = minutesSince(order.created_at);
  const waitColor =
    waitMin > 10 ? "text-red-400" : waitMin > 5 ? "text-yellow-400" : "text-gray";

  const allReady = order.items.every((i) => i.prep_status === "ready");
  const tableLabel =
    order.order_type === "delivery"
      ? "Domicilio"
      : order.order_type === "pickup"
      ? "Para recoger"
      : order.table_label ??
        (order.table_number === 0
          ? "Barra"
          : order.table_number != null
          ? `Mesa ${order.table_number}`
          : "Sin mesa");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fb-card flex flex-col p-4",
        allReady ? "border-green-500/40 bg-green-500/[0.08]" : "border-white/[0.1] bg-white/[0.04]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-white/[0.08]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-light text-lg">
              #{order.order_number?.slice(-6)}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-xs font-bold border border-secondary/20">
              {tableLabel}
            </span>
            <SourceBadge order={order} />
            <PaymentPendingBadge order={order} />
          </div>
          <p className="text-sm text-light/80 mt-1 truncate">
            {order.customer_name || "Cliente"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end text-xs text-gray">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(order.created_at)}
          </div>
          <p className={cn("text-sm font-bold mt-0.5", waitColor)}>
            {timeSinceLabel(order.created_at)}
          </p>
        </div>
      </div>

      {/* Nota del cliente */}
      {order.customer_notes && (
        <p className="text-xs text-secondary mb-3 bg-secondary/10 px-2 py-1.5 rounded">
          Nota: {order.customer_notes}
        </p>
      )}

      {/* Items */}
      <div className="space-y-2 flex-1">
        {order.items.map((item) => {
          const cfg = prepConfig[item.prep_status] || prepConfig.pending;
          const Icon = cfg.icon;
          const busy = pendingItemId === item.id;
          return (
            <div
              key={item.id}
              className={cn("rounded-lg border p-2.5 transition-colors", cfg.cardClass)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-light font-medium text-sm break-words">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray">{item.variant_name}</p>
                  {item.notes && (
                    <p className="text-xs text-amber-300 mt-1">▸ {item.notes}</p>
                  )}
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0",
                    cfg.badgeClass
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {cfg.next ? (
                  <button
                    disabled={busy}
                    onClick={() => onSetPrep(item.id, cfg.next)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50",
                      cfg.nextBtn
                    )}
                  >
                    {busy ? "..." : cfg.nextLabel}
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => onSetPrep(item.id, "preparing")}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray hover:text-light bg-white/[0.06] hover:bg-white/[0.1] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Undo2 className="w-3 h-3" /> Reabrir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acción rápida: marcar todo el pedido como listo */}
      {!allReady && (
        <button
          disabled={busyOrderId === order.id}
          onClick={() => onAllReady(order)}
          className="mt-3 w-full py-2 rounded-lg text-sm font-bold bg-green-500/90 hover:bg-green-500 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {busyOrderId === order.id ? "Marcando..." : "Todo listo"}
        </button>
      )}
    </motion.div>
  );
};

const KitchenPage = () => {
  const queryClient = useQueryClient();
  const { selectedBusinessSlug } = useBusinessStore();

  // Negocios disponibles (para las pestañas de cocina y sus colores)
  const { data: businessesData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData)
    ? businessesData
    : businessesData?.results || [];

  // Si estás dentro de un negocio, la cocina ES la de ese negocio (no se pregunta).
  // Solo en Consolidado se eligen las cocinas con pestañas.
  const isConsolidated = !selectedBusinessSlug;
  const [pickedKitchen, setPickedKitchen] = useState("");
  const kitchenSlug = isConsolidated
    ? pickedKitchen || businesses[0]?.slug || ""
    : selectedBusinessSlug;

  const currentBusiness = businesses.find((b) => b.slug === kitchenSlug);

  // Refresco en tiempo real
  useWebSocket("/ws/orders/", {
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });

  const {
    data: kitchenOrders,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["kitchen-orders", kitchenSlug],
    queryFn: () => ordersService.getKitchenOrders(kitchenSlug),
    enabled: !!kitchenSlug,
    refetchInterval: 30000,
    staleTime: 2000,
  });

  const [pendingItemId, setPendingItemId] = useState(null);
  const prepMutation = useMutation({
    mutationFn: ({ itemId, prepStatus }) =>
      ordersService.setItemPrepStatus(itemId, prepStatus),
    onMutate: ({ itemId }) => setPendingItemId(itemId),
    onSettled: () => {
      setPendingItemId(null);
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      queryClient.invalidateQueries({ queryKey: ["active-orders"] });
    },
  });

  const handleSetPrep = (itemId, prepStatus) =>
    prepMutation.mutate({ itemId, prepStatus });

  const [busyOrderId, setBusyOrderId] = useState(null);
  const allReadyMutation = useMutation({
    mutationFn: async (order) => {
      const targets = order.items.filter((i) => i.prep_status !== "ready");
      await Promise.all(
        targets.map((i) => ordersService.setItemPrepStatus(i.id, "ready"))
      );
    },
    onMutate: (order) => setBusyOrderId(order.id),
    onSettled: () => {
      setBusyOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      queryClient.invalidateQueries({ queryKey: ["active-orders"] });
    },
  });

  const handleAllReady = (order) => allReadyMutation.mutate(order);

  const orders = kitchenOrders || [];

  // Métricas rápidas de la cocina
  const stats = useMemo(() => {
    let pend = 0;
    let prep = 0;
    let ready = 0;
    for (const o of orders) {
      for (const it of o.items) {
        if (it.prep_status === "pending") pend++;
        else if (it.prep_status === "preparing") prep++;
        else if (it.prep_status === "ready") ready++;
      }
    }
    return { pend, prep, ready };
  }, [orders]);

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-[12px] border border-white/[0.1] bg-white/[0.03] p-2.5">
            <Utensils className="w-5 h-5 text-dark" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-light">
              Cocina {currentBusiness ? `· ${currentBusiness.name}` : ""}
            </h1>
            <p className="text-sm text-gray">
              Solo los platos de esta cocina. {stats.pend} por empezar ·{" "}
              {stats.prep} en preparación · {stats.ready} listos
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          title="Refrescar"
        >
          <RefreshCw className={cn("w-5 h-5", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Pestañas de cocina: solo en Consolidado. Dentro de un negocio no se pregunta. */}
      {isConsolidated && businesses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {businesses.map((b) => (
            <button
              key={b.slug}
              onClick={() => setPickedKitchen(b.slug)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border",
                kitchenSlug === b.slug
                  ? "bg-secondary/20 text-secondary border-secondary/40"
                  : "bg-white/[0.06] text-gray hover:text-light border-transparent"
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 text-green-400/40 mx-auto mb-4" />
          <p className="text-light font-medium">No hay nada por preparar</p>
          <p className="text-gray text-sm">
            Los pedidos de {currentBusiness?.name || "esta cocina"} aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onSetPrep={handleSetPrep}
                onAllReady={handleAllReady}
                pendingItemId={pendingItemId}
                busyOrderId={busyOrderId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default KitchenPage;
