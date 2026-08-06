import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  Loader2,
  LogOut,
  Pencil,
  Trophy,
  UserCircle2,
  X,
} from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import CustomerAvatar from "@/components/auth/CustomerAvatar";
import OrderStatusBadge from "@/components/order-tracker/OrderStatusBadge";
import MyReservationsList from "@/components/reservations/MyReservationsList";
import CustomerTabBar, { tabBarSpacing } from "@/components/CustomerTabBar";
import { ACTIVE_ORDER_STATUSES } from "@/lib/domicilios";
import { useCartaPath, useMyOrders, useMyOrdersLive } from "@/hooks";
import { useStoreConfig } from "@/hooks/useCustomerOrders";
import {
  useReservationsConfig,
  useMyReservations,
} from "@/hooks/useReservations";
import { useMyStats } from "@/hooks/usePolla";

/**
 * Mi cuenta: el hogar del cliente autenticado con Google (mobile-first).
 *
 * Reúne su perfil (editable), pedidos en curso, próximas reservas y accesos
 * a todo lo que puede hacer con su sesión. Sin sesión muestra el login de
 * Google con los beneficios — no redirige.
 */

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] " +
  "text-light text-sm placeholder:text-white/25 outline-none " +
  "focus:border-gold/40 transition-colors";

/* ---------------------------------------------------------------- login -- */

const LoginHero = () => {
  const [error, setError] = useState("");
  const { data: reservationsConfig } = useReservationsConfig();
  const reservationsEnabled = !!reservationsConfig?.reservations_enabled;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-10"
    >
      <div className="text-center mb-6">
        <span className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-linear-to-br from-gold to-amber-600 text-dark">
          <UserCircle2 className="w-8 h-8" />
        </span>
        <h2 className="text-xl font-black">Tu cuenta Frostbyte</h2>
        <p className="text-sm text-white/50 mt-1 max-w-xs mx-auto">
          Entra con Google y maneja todo desde un solo lugar.
        </p>
      </div>

      {/* Lo que promete la cuenta es lo que de verdad hace por el cliente:
          pedir, seguir el pedido y no volver a escribir sus datos. */}
      <ul className="grid gap-2 mb-6 max-w-xs mx-auto text-sm text-white/60">
        {[
          [Bike, "Pide a domicilio y sigue tu pedido en vivo hasta tu puerta"],
          [ClipboardList, "Tu historial de pedidos, siempre a mano"],
          [UserCircle2, "Tus datos listos: no los escribes en cada pedido"],
          ...(reservationsEnabled
            ? [[CalendarDays, "Reserva mesa o la Sala VIP en segundos"]]
            : []),
        ].map(([Icon, text]) => (
          <li key={text} className="flex items-start gap-2.5">
            <Icon className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      <GoogleSignInButton onError={setError} />
      {error && (
        <p className="mt-3 text-sm text-red-300 text-center">{error}</p>
      )}
    </motion.div>
  );
};

/* ----------------------------------------------------------- perfil card -- */

const ProfileCard = () => {
  const { customer, updateProfile } = useCustomerAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  const startEditing = () => {
    setForm({
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      phone: customer?.phone || "",
      email_opt_out: !!customer?.email_opt_out,
    });
    setError("");
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    if (result.success) setEditing(false);
    else setError(result.error);
  };

  return (
    <section className="p-4 rounded-2xl bg-linear-to-br from-gold/10 via-dark-secondary to-transparent border border-gold/25">
      <div className="flex items-center gap-3">
        <CustomerAvatar customer={customer} className="w-14 h-14 text-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-black truncate">
            {customer?.full_name || customer?.first_name || "Cliente"}
          </p>
          <p className="text-xs text-white/40 truncate">{customer?.email}</p>
          {customer?.phone && (
            <p className="text-xs text-white/40">{customer.phone}</p>
          )}
        </div>
        <button
          onClick={editing ? () => setEditing(false) : startEditing}
          aria-label={editing ? "Cerrar edición" : "Editar perfil"}
          className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex-shrink-0"
        >
          {editing ? (
            <X className="w-4 h-4" />
          ) : (
            <Pencil className="w-4 h-4" />
          )}
        </button>
      </div>

      {editing && form && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="grid gap-2.5 mt-4">
            <div className="grid grid-cols-2 gap-2.5">
              <input
                className={inputCls}
                placeholder="Nombre"
                value={form.first_name}
                maxLength={150}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
              />
              <input
                className={inputCls}
                placeholder="Apellido"
                value={form.last_name}
                maxLength={150}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
              />
            </div>
            <input
              className={inputCls}
              type="tel"
              placeholder="Teléfono (WhatsApp)"
              value={form.phone}
              maxLength={20}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
            <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm cursor-pointer">
              <span className="text-white/70">
                Recibir correos (Polla y novedades)
              </span>
              <input
                type="checkbox"
                checked={!form.email_opt_out}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email_opt_out: !e.target.checked }))
                }
                className="w-4 h-4 accent-gold"
              />
            </label>
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};

/* -------------------------------------------------------- quick actions -- */

const QuickAction = ({ to, icon: Icon, label, sub, dot }) => (
  <Link
    to={to}
    className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
  >
    <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-white/10 text-gold mb-2.5">
      <Icon className="w-5 h-5" />
      {dot && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-dark"
        />
      )}
    </span>
    <span className="block text-sm font-black leading-tight">{label}</span>
    {sub && <span className="block text-xs text-white/40 mt-0.5">{sub}</span>}
  </Link>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xs uppercase tracking-wider text-white/50 font-black">
    {children}
  </h2>
);

/* ----------------------------------------------------------------- page -- */

const AccountPage = () => {
  const { customer, isAuthenticated, logout } = useCustomerAuthStore();
  // Quien vino del QR de una mesa vuelve a su mesa, no a la carta pública
  const { cartaPath } = useCartaPath();

  // Hooks siempre en el mismo orden; el estado sin sesión se pinta abajo
  useMyOrdersLive();
  const { data: ordersData } = useMyOrders({ enabled: isAuthenticated });
  const { data: reservations } = useMyReservations({
    enabled: isAuthenticated,
  });
  const { data: storeConfig } = useStoreConfig();
  const { data: reservationsConfig } = useReservationsConfig();
  const { data: pollaStats } = useMyStats({ enabled: isAuthenticated });
  const [confirmLogout, setConfirmLogout] = useState(false);

  const orders = ordersData?.results || [];
  const activeOrders = orders.filter((o) =>
    ACTIVE_ORDER_STATUSES.includes(o.status)
  );
  const orderingEnabled = !!storeConfig?.customer_ordering_enabled;
  const reservationsEnabled = !!reservationsConfig?.reservations_enabled;
  // Con las reservas en línea apagadas (solo staff) el cliente no ve nada de
  // reservas, salvo que el staff le haya creado alguna a su nombre
  const showReservations = reservationsEnabled || reservations?.length > 0;
  // Todo cliente con sesión tiene fila en el ranking, así que jugar la Polla se
  // mide por actividad real: pronósticos hechos o puntos (bracket, menciones,
  // referidos). Quien no jugó no ve el acceso.
  const playedPolla =
    pollaStats?.predicted > 0 || pollaStats?.points > 0;

  return (
    <div className={`min-h-screen bg-dark text-light ${tabBarSpacing}`}>
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to={cartaPath}
            aria-label="Volver a la carta"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-black uppercase tracking-wide">
            Mi <span className="text-gold">cuenta</span>
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {!isAuthenticated ? (
          <LoginHero />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6"
          >
            <ProfileCard />

            {/* Pedidos en curso */}
            {activeOrders.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle>Pedidos en curso</SectionTitle>
                  <Link
                    to="/mis-pedidos"
                    className="text-xs font-bold text-gold"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="grid gap-2">
                  {activeOrders.map((o) => (
                    <Link
                      key={o.id}
                      to="/mis-pedidos"
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <OrderStatusBadge status={o.status} />
                        <p className="text-sm font-semibold mt-1.5">
                          #{o.order_number}
                          <span className="text-white/40 font-normal">
                            {" "}
                            · {o.items_count} producto
                            {o.items_count === 1 ? "" : "s"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-gold font-black text-sm">
                          {formatCOP(o.total)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Próximas reservas */}
            {showReservations && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle>Próximas reservas</SectionTitle>
                  <Link
                    to="/mis-reservas"
                    className="text-xs font-bold text-gold"
                  >
                    Ver todas
                  </Link>
                </div>
                <MyReservationsList
                  mode="upcoming"
                  limit={3}
                  emptyState={
                    <p className="text-xs text-white/40">
                      No tienes reservas próximas.
                      {reservationsEnabled && (
                        <>
                          {" "}
                          <Link
                            to="/reservas"
                            className="text-gold font-bold underline underline-offset-2"
                          >
                            Reserva aquí
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  }
                />
              </section>
            )}

            {/* Accesos */}
            <section>
              <SectionTitle>¿Qué quieres hacer?</SectionTitle>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {orderingEnabled && (
                  <QuickAction
                    to="/domicilios"
                    icon={Bike}
                    label="Pedir a domicilio"
                    sub="Te lo llevamos"
                  />
                )}
                {reservationsEnabled && (
                  <QuickAction
                    to="/reservas"
                    icon={CalendarDays}
                    label="Reservar"
                    sub="Mesa o Sala VIP"
                  />
                )}
                <QuickAction
                  to="/mis-pedidos"
                  icon={ClipboardList}
                  label="Mis pedidos"
                  dot={activeOrders.length > 0}
                  sub={
                    activeOrders.length
                      ? `${activeOrders.length} en curso`
                      : orders.length
                        ? `${orders.length} en total`
                        : "Tu historial"
                  }
                />
                {showReservations && (
                  <QuickAction
                    to="/mis-reservas"
                    icon={CalendarCheck2}
                    label="Mis reservas"
                    sub={
                      reservations?.length
                        ? `${reservations.length} en total`
                        : "Tu historial"
                    }
                  />
                )}
              </div>
              {playedPolla && (
                <Link
                  to="/polla-mundial"
                  className="mt-2.5 p-4 rounded-2xl bg-linear-to-r from-primary/20 to-secondary/20 border border-white/10 flex items-center gap-3 hover:border-white/20 transition-colors"
                >
                  <Trophy className="w-6 h-6 text-gold flex-shrink-0" />
                  <span className="flex-1">
                    <span className="block text-sm font-black">
                      Polla Mundialista
                    </span>
                    <span className="block text-xs text-white/40">
                      Tus pronósticos, ranking y misiones
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
              )}
            </section>

            {/* Cerrar sesión */}
            {confirmLogout ? (
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="text-sm text-white/60">¿Cerrar sesión?</span>
                <button
                  onClick={() => logout()}
                  className="text-sm font-bold text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-2"
                >
                  Sí, salir
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="text-sm text-white/50 px-3 py-2"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full py-3 rounded-xl border border-white/10 text-white/50 text-sm font-bold flex items-center justify-center gap-2 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            )}
          </motion.div>
        )}
      </main>

      <CustomerTabBar />
    </div>
  );
};

export default AccountPage;
