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
  UserCircle2,
  Drama,
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
import { useCurrentContest, useHalloweenMood } from "@/hooks/useContest";
import ContestAccountCard from "@/components/concurso/ContestAccountCard";
import { cn } from "@/lib/utils";
import {
  useReservationsConfig,
  useMyReservations,
} from "@/hooks/useReservations";

/**
 * Mi cuenta: el hogar del cliente autenticado con Google.
 *
 * Reúne su perfil (editable), el concurso vigente (invitación o su
 * inscripción), pedidos en curso, próximas reservas y accesos. Sin sesión
 * muestra el login de Google con los beneficios — no redirige.
 *
 * Móvil: una columna. Escritorio (lg): cabecera ancha y dos columnas, con
 * los datos y el cierre de sesión en una lateral fija. En temporada de
 * Halloween (`useHalloweenMood`) la pantalla se pone el traje: tokens de
 * .theme-halloween y la cabecera del bosque con luna y niebla.
 */

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

const inputCls =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 " +
  "text-[0.85rem] text-light outline-none placeholder:text-light/25 " +
  "transition-colors focus:border-white/30";

/* ---------------------------------------------------------------- login -- */

const LoginHero = () => {
  const [error, setError] = useState("");
  const { data: reservationsConfig } = useReservationsConfig();
  const { data: storeConfig } = useStoreConfig();
  const reservationsEnabled = !!reservationsConfig?.reservations_enabled;
  // Con los domicilios en pausa la cuenta no los promete: el servicio no se
  // nombra en ninguna parte mientras esté apagado.
  const orderingEnabled = !!storeConfig?.customer_ordering_enabled;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="fb-card px-5 py-8 lg:px-8 lg:py-10"
    >
      <div className="text-center mb-6">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[16px] border border-white/[0.1] bg-white/[0.03]">
          <UserCircle2 className="h-6 w-6 text-light/70" />
        </span>
        <h2 className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-light">Tu cuenta Frostbyte</h2>
        <p className="mx-auto mt-3 max-w-xs text-[0.8rem] leading-relaxed text-light/50">
          Entra con Google y maneja todo desde un solo lugar.
        </p>
      </div>

      {/* Lo que promete la cuenta es lo que de verdad hace por el cliente:
          pedir, seguir el pedido y no volver a escribir sus datos. */}
      <ul className="mx-auto mb-6 grid max-w-xs gap-2 text-[0.78rem] text-light/60">
        {[
          ...(orderingEnabled
            ? [
                [
                  Bike,
                  "Pide a domicilio y sigue tu pedido en vivo hasta tu puerta",
                ],
                [ClipboardList, "Tu historial de pedidos, siempre a mano"],
              ]
            : []),
          [UserCircle2, "Tus datos listos: no los escribes en cada pedido"],
          ...(reservationsEnabled
            ? [[CalendarDays, "Reserva mesa o la Sala VIP en segundos"]]
            : []),
        ].map(([Icon, text]) => (
          <li key={text} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-light/45" />
            {text}
          </li>
        ))}
      </ul>

      <GoogleSignInButton onError={setError} />
      {error && (
        <p className="mt-3 text-center text-[0.78rem] text-red-300">{error}</p>
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
    <section className="fb-card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="fb-eyebrow">Tus datos</h2>
          <p className="mt-2 truncate text-[0.88rem] font-medium text-light">
            {customer?.full_name || customer?.first_name || "Cliente"}
          </p>
          <p className="truncate text-[0.75rem] text-light/45">{customer?.email}</p>
          <p className="text-[0.75rem] text-light/45">
            {customer?.phone || "Sin teléfono: agrégalo para tus pedidos"}
          </p>
        </div>
        <button
          onClick={editing ? () => setEditing(false) : startEditing}
          aria-label={editing ? "Cerrar edición" : "Editar perfil"}
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
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
            <label className="fb-inset flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[0.8rem]">
              <span className="text-light/65">
                Recibir correos de Frostbyte
              </span>
              <input
                type="checkbox"
                checked={!form.email_opt_out}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email_opt_out: !e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--color-secondary)]"
              />
            </label>
            {error && <p className="text-[0.72rem] text-red-300">{error}</p>}
            <button
              onClick={save}
              disabled={saving}
              className="fb-btn fb-btn--accent w-full disabled:opacity-40"
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
    className="fb-card fb-card--link p-4"
  >
    <span className="relative mb-2.5 grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.1] bg-white/[0.03] text-light/70">
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
      {dot && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-dark"
        />
      )}
    </span>
    <span className="block text-[0.82rem] font-medium leading-tight text-light">{label}</span>
    {sub && <span className="mt-1 block text-[0.68rem] text-light/40">{sub}</span>}
  </Link>
);

const SectionTitle = ({ children }) => (
  <h2 className="fb-eyebrow">
    {children}
  </h2>
);

/* ----------------------------------------------------------------- hero -- */

const HW = "/images/halloween";

/**
 * Cabecera con el saludo. En Halloween, el bosque del hero de la campaña
 * con luna, murciélagos, telaraña y niebla (assets que ya usa la carta).
 */
const AccountHero = ({ customer, hw }) => {
  const firstName =
    customer?.first_name || customer?.full_name?.split(" ")[0] || "";
  return (
    <section className="acc-hero">
      {hw && (
        <>
          <picture>
            <source media="(min-width: 768px)" srcSet={`${HW}/bosque.webp`} />
            <img src={`${HW}/bosque-movil.webp`} alt="" className="acc-hero__bg" />
          </picture>
          <img src={`${HW}/telarana.webp`} alt="" className="acc-hero__fx acc-hero__web" />
          <img src={`${HW}/luna-real.webp`} alt="" className="acc-hero__fx acc-hero__moon" />
          <img src={`${HW}/murcielagos.webp`} alt="" className="acc-hero__fx acc-hero__bats" />
          <img src={`${HW}/niebla-violeta.webp`} alt="" className="acc-hero__fx acc-hero__mist" />
        </>
      )}
      <div className="acc-hero__content flex items-center gap-4">
        {customer ? (
          <CustomerAvatar
            customer={customer}
            className="acc-hero__avatar h-16 w-16 flex-shrink-0 text-2xl lg:h-20 lg:w-20"
          />
        ) : (
          <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full border border-white/[0.14] bg-dark/60 lg:h-20 lg:w-20">
            <UserCircle2 className="h-7 w-7 text-light/70" />
          </span>
        )}
        <div className="min-w-0">
          <p className="acc-hero__hello">
            {customer
              ? `${hw ? "¡Buuu" : "Hola"}${firstName ? `, ${firstName}` : ""}${hw ? "!" : ""}`
              : hw
                ? "¿Te atreves a entrar?"
                : "Tu cuenta Frostbyte"}
          </p>
          <p className="mt-1.5 truncate text-[0.8rem] text-light/65">
            {customer ? customer.email : "Entra con Google y maneja todo desde un solo lugar."}
          </p>
        </div>
      </div>
    </section>
  );
};

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
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { data: contest } = useCurrentContest();
  const hw = useHalloweenMood();

  const orders = ordersData?.results || [];
  const activeOrders = orders.filter((o) =>
    ACTIVE_ORDER_STATUSES.includes(o.status)
  );
  const orderingEnabled = !!storeConfig?.customer_ordering_enabled;
  const reservationsEnabled = !!reservationsConfig?.reservations_enabled;
  // Con las reservas en línea apagadas (solo staff) el cliente no ve nada de
  // reservas, salvo que el staff le haya creado alguna a su nombre
  const showReservations = reservationsEnabled || reservations?.length > 0;
  // Mismo criterio para los pedidos: apagados no se nombran, salvo que el
  // cliente tenga historial que consultar.
  const showOrders = orderingEnabled || orders.length > 0;

  const logoutBlock = confirmLogout ? (
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
  );

  return (
    <div
      className={cn(
        "fb-screen fb-screen--plain min-h-screen text-light md:pb-12",
        tabBarSpacing,
        hw && "theme-halloween acc--hw"
      )}
    >
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-dark/95">
        <div className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <Link
            to={cartaPath}
            aria-label="Volver a la carta"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
            Mi cuenta
          </h1>
          {/* En escritorio no hay barra inferior: los accesos van arriba */}
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Tu cuenta">
            {contest && (
              <Link to="/concurso" className="rounded-full px-3 py-1.5 text-[0.8rem] text-light/65 transition-colors hover:bg-white/[0.06] hover:text-light">
                Concurso
              </Link>
            )}
            {isAuthenticated && showOrders && (
              <Link to="/mis-pedidos" className="rounded-full px-3 py-1.5 text-[0.8rem] text-light/65 transition-colors hover:bg-white/[0.06] hover:text-light">
                Mis pedidos
              </Link>
            )}
            {isAuthenticated && showReservations && (
              <Link to="/mis-reservas" className="rounded-full px-3 py-1.5 text-[0.8rem] text-light/65 transition-colors hover:bg-white/[0.06] hover:text-light">
                Mis reservas
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-lg lg:max-w-6xl mx-auto px-4 lg:px-6 pt-5 lg:pt-8">
        <AccountHero customer={isAuthenticated ? customer : null} hw={hw} />

        {!isAuthenticated ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
            <LoginHero />
            {/* Sin sesión también se invita: entrar es el primer paso */}
            <ContestAccountCard />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-8"
          >
            {/* Móvil: la invitación va primero, antes que los datos */}
            <div className="lg:hidden">
              <ContestAccountCard />
            </div>

            <aside className="grid gap-4 lg:sticky lg:top-20">
              <ProfileCard />
              <div className="hidden lg:block">{logoutBlock}</div>
            </aside>

            <div className="grid gap-6">
              <div className="hidden lg:block">
                <ContestAccountCard />
              </div>

              {/* Pedidos en curso */}
              {activeOrders.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <SectionTitle>Pedidos en curso</SectionTitle>
                    <Link
                      to="/mis-pedidos"
                      className="text-[0.72rem] text-light/60 transition-colors hover:text-light"
                    >
                      Ver todos
                    </Link>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {activeOrders.map((o) => (
                      <Link
                        key={o.id}
                        to="/mis-pedidos"
                        className="fb-card fb-card--link flex items-center justify-between gap-3 p-3.5"
                      >
                        <div className="min-w-0">
                          <OrderStatusBadge status={o.status} />
                          <p className="mt-1.5 text-[0.8rem] font-medium text-light">
                            #{o.order_number}
                            <span className="font-normal text-light/40">
                              {" "}
                              · {o.items_count} producto
                              {o.items_count === 1 ? "" : "s"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[0.82rem] font-medium text-light">
                            {formatCOP(o.total)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-light/30" />
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
                      className="text-[0.72rem] text-light/60 transition-colors hover:text-light"
                    >
                      Ver todas
                    </Link>
                  </div>
                  <MyReservationsList
                    mode="upcoming"
                    limit={3}
                    emptyState={
                      <p className="text-[0.7rem] text-light/40">
                        No tienes reservas próximas.
                        {reservationsEnabled && (
                          <>
                            {" "}
                            <Link
                              to="/reservas"
                              className="text-light underline underline-offset-2"
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
                <div className="grid grid-cols-2 gap-2.5 mt-3 sm:grid-cols-4">
                  {contest && (
                    <QuickAction
                      to="/concurso"
                      icon={Drama}
                      label="Concurso"
                      sub="Disfraces +18"
                    />
                  )}
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
                  {showOrders && (
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
                  )}
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
              </section>

              <div className="lg:hidden">{logoutBlock}</div>
            </div>
          </motion.div>
        )}
      </main>

      <CustomerTabBar />
    </div>
  );
};

export default AccountPage;
