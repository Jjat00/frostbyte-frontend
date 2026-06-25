import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  X,
  ArrowLeft,
  Store,
  ShoppingBag,
  Bike,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useStoreConfig, useCreateOrder } from "@/hooks";
import CustomerAuthGate from "./CustomerAuthGate";

// El mapa (Mapbox) es pesado: se carga solo al elegir domicilio para no
// inflar la home.
const DeliveryMap = lazy(() => import("./DeliveryMap"));

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

const PAYMENTS = [
  { key: "cash", label: "Efectivo" },
  { key: "nequi", label: "Nequi" },
  { key: "daviplata", label: "Daviplata" },
  { key: "transfer", label: "Transferencia" },
  { key: "card", label: "Tarjeta" },
];

const TABLE_OPTIONS = [
  { value: 0, label: "Barra" },
  { value: 1, label: "Mesa 1" },
  { value: 2, label: "Mesa 2" },
  { value: 3, label: "Mesa 3" },
  { value: 4, label: "Mesa 4" },
  { value: 5, label: "Mesa 5" },
];

const extractError = (e) => {
  const data = e?.response?.data;
  if (!data) return "No pudimos crear tu pedido. Intenta de nuevo.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  const val = data[firstKey];
  return Array.isArray(val) ? val[0] : String(val);
};

const Chip = ({ active, onClick, children, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "border-gold bg-gold/15 text-gold"
        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const CheckoutSheet = ({ open, onBack, onSuccess }) => {
  const location = useLocation();
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);
  const { data: config } = useStoreConfig();
  const createOrder = useCreateOrder();

  const [orderType, setOrderType] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [payment, setPayment] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [delivery, setDelivery] = useState({
    address: "",
    reference: "",
    lat: null,
    lng: null,
  });
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const pendingSubmit = useRef(false);

  const availableTypes = [];
  if (config?.dine_in_enabled)
    availableTypes.push({ key: "dine_in", label: "En el local", icon: Store });
  if (config?.pickup_enabled)
    availableTypes.push({ key: "pickup", label: "Para recoger", icon: ShoppingBag });
  if (config?.delivery_enabled)
    availableTypes.push({ key: "delivery", label: "Domicilio", icon: Bike });

  const deliveryFee =
    orderType === "delivery" ? Number(config?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  // Preseleccionar tipo: si entró por /mesa/:n, fijar mesa; si no, el primero disponible
  useEffect(() => {
    if (!open || orderType) return;
    const match = location.pathname.match(/^\/mesa\/(\d+)/);
    if (match && config?.dine_in_enabled) {
      const n = parseInt(match[1], 10);
      if (n >= 0 && n <= 5) {
        setOrderType("dine_in");
        setTableNumber(n);
        return;
      }
    }
    if (availableTypes.length) setOrderType(availableTypes[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, config]);

  // Prefijar datos del cliente cuando hay sesión
  useEffect(() => {
    if (customer) {
      setName((n) => n || customer.first_name || customer.full_name || "");
      setPhone((p) => p || customer.phone || "");
    }
  }, [customer]);

  const doSubmit = async () => {
    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_notes: orderNotes.trim(),
      payment_method: payment,
      order_type: orderType,
      items: items.map((it) => ({
        product_variant_id: it.product_variant_id,
        quantity: it.quantity,
        notes: it.notes || "",
      })),
    };
    if (orderType === "dine_in") payload.table_number = tableNumber;
    if (orderType === "delivery") {
      payload.delivery_address = delivery.address.trim();
      payload.delivery_reference = delivery.reference.trim();
      payload.delivery_lat = delivery.lat;
      payload.delivery_lng = delivery.lng;
    }

    try {
      const order = await createOrder.mutateAsync(payload);
      onSuccess(order);
    } catch (e) {
      setError(extractError(e));
    }
  };

  // Tras autenticarse, continuar el envío automáticamente
  useEffect(() => {
    if (isAuthenticated && pendingSubmit.current) {
      pendingSubmit.current = false;
      setShowAuth(false);
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleConfirm = () => {
    if (!orderType) return setError("Elige cómo quieres tu pedido.");
    if (orderType === "dine_in" && tableNumber == null)
      return setError("Selecciona tu mesa o la barra.");
    if (!payment) return setError("Elige un método de pago.");
    if (!name.trim()) return setError("Ingresa tu nombre.");
    if (orderType === "delivery") {
      if (!delivery.address.trim())
        return setError("Ingresa la dirección de entrega.");
      if (delivery.lat == null || delivery.lng == null)
        return setError("Marca tu ubicación con el botón de ubicación.");
      if (!phone.trim())
        return setError("Ingresa un teléfono de contacto para el domicilio.");
    }
    setError("");

    if (!isAuthenticated) {
      pendingSubmit.current = true;
      setShowAuth(true);
      return;
    }
    doSubmit();
  };

  const submitting = createOrder.isPending;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onBack}
            />
            <motion.div
              className="relative w-full max-w-md bg-dark border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Volver al carrito"
                  className="grid place-items-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-black uppercase tracking-wide text-light">
                  Finalizar pedido
                </h2>
                <span className="w-8" />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Tipo de pedido */}
                <section>
                  <h3 className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    ¿Cómo quieres tu pedido?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTypes.map((t) => (
                      <Chip
                        key={t.key}
                        icon={t.icon}
                        active={orderType === t.key}
                        onClick={() => setOrderType(t.key)}
                      >
                        {t.label}
                      </Chip>
                    ))}
                  </div>
                </section>

                {/* Mesa */}
                {orderType === "dine_in" && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-2">
                      Tu mesa
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {TABLE_OPTIONS.map((t) => (
                        <Chip
                          key={t.value}
                          active={tableNumber === t.value}
                          onClick={() => setTableNumber(t.value)}
                        >
                          {t.label}
                        </Chip>
                      ))}
                    </div>
                  </section>
                )}

                {/* Domicilio */}
                {orderType === "delivery" && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-2">
                      ¿A dónde lo llevamos?
                    </h3>
                    <Suspense
                      fallback={
                        <div className="h-40 grid place-items-center text-white/40">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      }
                    >
                      <DeliveryMap
                        value={delivery}
                        onChange={(partial) =>
                          setDelivery((d) => ({ ...d, ...partial }))
                        }
                      />
                    </Suspense>
                  </section>
                )}

                {/* Método de pago */}
                <section>
                  <h3 className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    Método de pago
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENTS.map((p) => (
                      <Chip
                        key={p.key}
                        active={payment === p.key}
                        onClick={() => setPayment(p.key)}
                      >
                        {p.label}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30 mt-2">
                    {orderType === "delivery"
                      ? "Pagas contra entrega."
                      : "Pagas en el local."}
                  </p>
                </section>

                {/* Datos */}
                <section className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider text-white/40">
                    Tus datos
                  </h3>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre *"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={
                      orderType === "delivery"
                        ? "Teléfono de contacto *"
                        : "Teléfono (opcional)"
                    }
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
                  />
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Notas del pedido (opcional)"
                    rows={2}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40 resize-none"
                  />
                </section>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-light font-semibold">
                    {formatCOP(subtotal)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Envío</span>
                    <span className="text-light font-semibold">
                      {formatCOP(deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-light">Total</span>
                  <span className="text-xl font-black text-gold">
                    {formatCOP(total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-extrabold py-3 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Enviando…" : "Confirmar pedido"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomerAuthGate
        open={showAuth}
        onClose={() => {
          setShowAuth(false);
          pendingSubmit.current = false;
        }}
        onAuthenticated={() => {
          /* el useEffect sobre isAuthenticated dispara doSubmit */
        }}
        onError={(m) => setError(m)}
      />
    </>
  );
};

export default CheckoutSheet;
