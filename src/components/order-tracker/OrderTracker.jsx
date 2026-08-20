import React, { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, MapPin, Loader2 } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemsList from "./OrderItemsList";
import DeliveryStatusTimeline from "./DeliveryStatusTimeline";
import RecommendedProducts from "./RecommendedProducts";
import WhileYouWait from "./WhileYouWait";

// El mapa (Mapbox) es pesado: se carga en diferido y solo para domicilios.
const OrderRouteMap = lazy(() => import("./OrderRouteMap"));

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

/**
 * Contenido del seguimiento de un pedido (estado, items, domicilio, total).
 * Vive aparte del modal para poder mostrarse también inline, como en el
 * panel de detalle de "Mis pedidos" en desktop.
 */
export const OrderTrackerContent = ({ order }) => {
  if (!order) return null;

  const isDelivery = order.order_type === "delivery";
  const hasCoords = order.delivery_lat != null && order.delivery_lng != null;

  // Nombres de productos en el pedido para filtrar recomendados
  const orderProductNames = (order.items || []).map((i) => i.product_name);

  return (
    <>
      {/* Status: timeline para domicilios, badge para el resto */}
      {isDelivery ? (
        <DeliveryStatusTimeline status={order.status} />
      ) : (
        <div className="flex items-center justify-center">
          <OrderStatusBadge status={order.status} />
        </div>
      )}

      {/* Delivered status */}
      {order.status === "delivered" && !order.is_paid && (
        <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="text-xs text-yellow-400 font-medium">
            Pedido entregado · Pendiente de pago
          </p>
        </div>
      )}

      {/* Delivery progress */}
      <div className="flex items-center justify-between px-3 py-2 backdrop-blur-sm bg-white/[0.06] rounded-lg border border-white/[0.1]">
        <span className="text-xs text-gray">Entregados</span>
        <span className="text-sm text-light font-medium">
          {order.delivered_items_count || 0} / {order.items_count || 0}
        </span>
      </div>

      {/* Items */}
      <OrderItemsList items={order.items} />

      {/* Domicilio: mapa del recorrido + dirección */}
      {isDelivery && (
        <div className="space-y-2">
          {hasCoords && (
            <Suspense
              fallback={
                <div className="h-48 lg:h-64 rounded-xl bg-white/[0.04] border border-white/10 grid place-items-center text-white/30">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              }
            >
              <OrderRouteMap
                lat={Number(order.delivery_lat)}
                lng={Number(order.delivery_lng)}
              />
            </Suspense>
          )}
          <div className="px-3 py-2 backdrop-blur-sm bg-white/[0.06] rounded-lg border border-white/[0.1] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray">
              <MapPin className="w-3.5 h-3.5" /> Entrega a domicilio
            </div>
            {order.delivery_address && (
              <p className="text-sm text-light">{order.delivery_address}</p>
            )}
            {order.delivery_reference && (
              <p className="text-xs text-gray">{order.delivery_reference}</p>
            )}
          </div>
        </div>
      )}

      {/* Desglose */}
      {Number(order.delivery_fee) > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray">Envío</span>
          <span className="text-light">{formatCurrency(order.delivery_fee)}</span>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.1]">
        <span className="text-gray font-medium">Total</span>
        <span className="text-xl font-bold text-secondary">
          {formatCurrency(order.total)}
        </span>
      </div>

      {/* While you wait */}
      <WhileYouWait status={order.status} />

      {/* Recommended (excluding products already in order) */}
      <RecommendedProducts excludeProducts={orderProductNames} />
    </>
  );
};

/**
 * Modal de seguimiento: bottom sheet en móvil y panel lateral en desktop.
 *
 * Con `desktopPanel={false}` solo existe el bottom sheet (hasta lg), para
 * páginas que ya muestran el detalle inline en pantallas grandes.
 */
const OrderTracker = ({ order, show, onClose, desktopPanel = true }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${
            desktopPanel ? "" : "lg:hidden"
          }`}
          onClick={onClose}
        >
          {/* Mobile: bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`${
              desktopPanel ? "md:hidden" : "lg:hidden"
            } absolute bottom-0 left-0 right-0 flex max-h-[90vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-dark/97`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.1]">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-bold text-light text-lg">Tu Pedido</h3>
                  <p className="text-xs text-gray">
                    #{order.order_number?.slice(-6)} · {order.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <OrderTrackerContent order={order} />
            </div>
          </motion.div>

          {/* Desktop: centered modal / side panel */}
          {desktopPanel && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-y-0 right-0 hidden w-full max-w-lg flex-col border-l border-white/[0.08] bg-dark/97 md:flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1]">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-secondary" />
                  <div>
                    <h3 className="font-bold text-light text-xl">Tu Pedido</h3>
                    <p className="text-sm text-gray">
                      #{order.order_number?.slice(-6)} · {order.customer_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <OrderTrackerContent order={order} />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderTracker;
