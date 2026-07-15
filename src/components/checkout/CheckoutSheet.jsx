import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Bike, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useStoreConfig, useCreateOrder } from "@/hooks";
import { isWithinDeliveryArea, DELIVERY_RADIUS_KM } from "@/lib/deliveryArea";
import CustomerAuthGate from "./CustomerAuthGate";

// El mapa (Mapbox) es pesado: se carga en diferido para no inflar la home.
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

// Billetes comunes para "¿con cuánto pagas?" (efectivo)
const CASH_BILLS = [10000, 20000, 50000, 100000];

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
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);
  const { data: config } = useStoreConfig();
  const createOrder = useCreateOrder();

  const [payment, setPayment] = useState("");
  // Efectivo: "exact", un billete de CASH_BILLS (string) u "other" + valor libre
  const [cashChoice, setCashChoice] = useState("");
  const [cashOther, setCashOther] = useState("");
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

  // No se puede pedir si el local está cerrado o si los domicilios están pausados.
  const storeClosed = config?.is_open === false;
  const orderingDisabled = config?.can_order === false;
  const orderingDisabledMsg = storeClosed
    ? "El local está cerrado en este momento."
    : "Los domicilios están pausados por el momento.";
  const deliveryFee = Number(config?.delivery_fee || 0);
  const total = subtotal + deliveryFee;

  // Prefijar datos del cliente cuando hay sesión
  useEffect(() => {
    if (customer) {
      setName((n) => n || customer.first_name || customer.full_name || "");
      setPhone((p) => p || customer.phone || "");
    }
  }, [customer]);

  const doSubmit = async () => {
    // El billete viaja en las notas con el mismo formato que usa el agente de
    // WhatsApp, para que el staff lo lea igual en ambos canales
    const cashValue = cashChoice === "other" ? cashOther : cashChoice;
    const cashNote =
      payment === "cash"
        ? cashValue === "exact"
          ? "Paga en efectivo con el valor exacto."
          : `Paga en efectivo con $${Number(cashValue).toLocaleString("es-CO")}.`
        : "";
    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_notes: [orderNotes.trim(), cashNote].filter(Boolean).join("\n"),
      payment_method: payment,
      delivery_address: delivery.address.trim(),
      delivery_reference: delivery.reference.trim(),
      delivery_lat: delivery.lat,
      delivery_lng: delivery.lng,
      items: items.map((it) => ({
        product_variant_id: it.product_variant_id,
        quantity: it.quantity,
        notes: it.notes || "",
      })),
    };

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
    if (orderingDisabled) return setError(orderingDisabledMsg);
    if (!delivery.address.trim())
      return setError("Ingresa la dirección de entrega.");
    if (delivery.lat == null || delivery.lng == null)
      return setError("Marca tu ubicación con el botón de ubicación.");
    if (!isWithinDeliveryArea(delivery.lat, delivery.lng))
      return setError(
        `Tu ubicación está fuera de nuestra zona de domicilios (${DELIVERY_RADIUS_KM} km alrededor del local).`
      );
    if (!payment) return setError("Elige un método de pago.");
    if (payment === "cash") {
      const cashValue = cashChoice === "other" ? cashOther : cashChoice;
      if (!cashValue)
        return setError("Cuéntanos con cuánto vas a pagar en efectivo.");
      if (cashValue !== "exact" && Number(cashValue) < total)
        return setError(
          "El valor con el que pagas no alcanza para el total del pedido."
        );
    }
    if (!name.trim()) return setError("Ingresa tu nombre.");
    if (!phone.trim())
      return setError("Ingresa un teléfono de contacto para el domicilio.");
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
            className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onBack}
            />
            <motion.div
              className="relative w-full max-w-md md:max-w-3xl bg-dark border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh]"
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
                <h2 className="text-base font-black uppercase tracking-wide text-light flex items-center gap-2">
                  <Bike className="w-4 h-4 text-gold" />
                  Pedir a domicilio
                </h2>
                <span className="w-8" />
              </div>

              {/* Body: en md+ el mapa va a la izquierda y pago/datos a la derecha */}
              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 space-y-5">
                {orderingDisabled && (
                  <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    {orderingDisabledMsg} Intenta más tarde.
                  </p>
                )}

                <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
                  {/* Domicilio */}
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

                  <div className="space-y-5">
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
                        Pagas contra entrega.
                      </p>

                      {payment === "cash" && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-white/60">
                            ¿Con cuánto vas a pagar?{" "}
                            <span className="text-white/35">
                              (para alistar tus vueltas)
                            </span>
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <Chip
                              active={cashChoice === "exact"}
                              onClick={() => setCashChoice("exact")}
                            >
                              Exacto
                            </Chip>
                            {CASH_BILLS.filter((b) => b >= total).map((b) => (
                              <Chip
                                key={b}
                                active={cashChoice === String(b)}
                                onClick={() => setCashChoice(String(b))}
                              >
                                {"$" + b.toLocaleString("es-CO")}
                              </Chip>
                            ))}
                            <Chip
                              active={cashChoice === "other"}
                              onClick={() => setCashChoice("other")}
                            >
                              Otro
                            </Chip>
                          </div>
                          {cashChoice === "other" && (
                            <input
                              type="text"
                              inputMode="numeric"
                              value={cashOther}
                              onChange={(e) =>
                                setCashOther(e.target.value.replace(/\D/g, ""))
                              }
                              placeholder="¿Con qué billete? (ej: 60000)"
                              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] px-3 py-2.5 text-sm text-light placeholder:text-white/30 focus:outline-none focus:border-gold/40"
                            />
                          )}
                        </div>
                      )}
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
                        placeholder="Teléfono de contacto *"
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
                </div>
              </div>

              {/* Footer: en md+ los totales van a la izquierda y el botón a la derecha */}
              <div className="border-t border-white/10 px-4 py-3 md:px-6 md:flex md:items-center md:justify-between md:gap-8 space-y-2 md:space-y-0">
                <div className="space-y-2 md:space-y-0.5 md:flex-1 md:max-w-xs">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Subtotal</span>
                    <span className="text-light font-semibold">
                      {formatCOP(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Envío</span>
                    <span className="text-light font-semibold">
                      {formatCOP(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-light">Total</span>
                    <span className="text-xl font-black text-gold">
                      {formatCOP(total)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting || items.length === 0 || orderingDisabled}
                  className="w-full md:w-auto md:px-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-dark font-extrabold py-3 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Enviando…" : "Confirmar domicilio"}
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
