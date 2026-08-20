import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Crown, UtensilsCrossed, Users, Minus, Plus, Clock,
  MessageCircle, CheckCircle2, Loader2, CalendarDays, Wallet, PartyPopper,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RESERVATIONS_PHONE,
  reservationsTelLink,
  reservationsWaLink,
} from "@/lib/reservas";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import CustomerAuthGate from "@/components/checkout/CustomerAuthGate";
import CustomerAvatar from "@/components/auth/CustomerAvatar";
import MyReservationsList from "@/components/reservations/MyReservationsList";
import {
  useReservationsConfig,
  useReservationAvailability,
  useCreateReservation,
} from "@/hooks/useReservations";

/**
 * Página de reservas del cliente (mobile-first).
 *
 * Flujo en 3 pasos: qué reservar (mesa o Sala VIP) → cuándo (fecha, personas
 * y hora/turno) → datos y confirmación. El login de Google salta solo al
 * confirmar, igual que en el checkout de domicilios. Los montos (anticipo,
 * consumo mínimo) los decide siempre el backend; aquí solo se muestran.
 */

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const inputCls =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 " +
  "text-[0.85rem] text-light outline-none placeholder:text-light/25 " +
  "transition-colors focus:border-white/30";

const ReservationsPage = () => {
  const { customer, isAuthenticated } = useCustomerAuthStore();
  const { data: config, isLoading: configLoading } = useReservationsConfig();

  // Paso 1: tipo · Paso 2: fecha/personas/hora · Paso 3: datos y confirmación
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null); // "table" | "vip_room"
  const [date, setDate] = useState(null); // "YYYY-MM-DD"
  const [partySize, setPartySize] = useState(2);
  const [floor, setFloor] = useState(2);
  const [time, setTime] = useState(null); // "HH:MM" (mesa)
  const [vipSlot, setVipSlot] = useState(null); // 1 | 2
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [created, setCreated] = useState(null); // reserva creada (pantalla final)
  const pendingSubmit = useRef(false);

  const createReservation = useCreateReservation();

  const enabled = !!config?.reservations_enabled;
  const isVip = type === "vip_room";
  // Mesa también admite grupos grandes (el backend los convierte a "group")
  const maxParty = config?.vip_capacity || 15;
  const isGroup =
    !isVip && config && partySize > (config.table_max_party || 6);

  // Prefijar datos del cliente cuando hay sesión (patrón del checkout)
  useEffect(() => {
    if (customer) {
      setName((n) => n || customer.first_name || customer.full_name || "");
      setPhone((p) => p || customer.phone || "");
    }
  }, [customer]);

  // Fechas ofrecibles: hoy → hoy + antelación máxima
  const dates = useMemo(() => {
    const days = [];
    const max = config?.max_advance_days ?? 30;
    const base = new Date();
    for (let i = 0; i <= max; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  }, [config?.max_advance_days]);

  const availabilityParams = useMemo(() => {
    if (!date || !type) return null;
    if (isVip) return { date, type: "vip_room" };
    return { date, type: "table", party_size: partySize, floor };
  }, [date, type, isVip, partySize, floor]);

  const { data: availability, isFetching: availLoading } =
    useReservationAvailability(availabilityParams);

  // Si cambia fecha/personas/piso, la hora elegida puede dejar de valer
  useEffect(() => {
    setTime(null);
    setVipSlot(null);
  }, [date, partySize, floor, type]);

  const doSubmit = async () => {
    const payload = {
      reservation_type: isVip ? "vip_room" : "table",
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      party_size: partySize,
      date,
      notes: notes.trim(),
      ...(isVip ? { vip_slot: vipSlot } : { start_time: time, floor }),
    };
    try {
      const reservation = await createReservation.mutateAsync(payload);
      setCreated(reservation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const data = e.response?.data;
      const msg =
        (Array.isArray(data) && data[0]) ||
        data?.detail ||
        (data && Object.values(data)?.[0]?.[0]) ||
        "No pudimos crear tu reserva. Intenta de nuevo.";
      setError(String(msg));
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
    if (!name.trim() || name.trim().length < 3)
      return setError("Escribe tu nombre completo.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7)
      return setError("Ingresa un teléfono de contacto válido.");
    setError("");
    if (!isAuthenticated) {
      pendingSubmit.current = true;
      setShowAuth(true);
      return;
    }
    doSubmit();
  };

  const reset = () => {
    setCreated(null);
    setStep(1);
    setType(null);
    setDate(null);
    setTime(null);
    setVipSlot(null);
    setNotes("");
    createReservation.reset();
  };

  const vipSlots = isVip ? availability?.slots || [] : [];
  const selectedVip = vipSlots.find((s) => s.slot === vipSlot);

  const canContinueStep2 = date && (isVip ? !!vipSlot : !!time);

  return (
    <div className="fb-screen fb-screen--plain min-h-screen pb-24 text-light">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-dark/95">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
            aria-label="Volver a la carta"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display flex-1 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
            Reservas
          </h1>
          {isAuthenticated && (
            <Link
              to="/mi-cuenta"
              aria-label="Mi cuenta"
              className="grid place-items-center rounded-full ring-1 ring-white/15 transition-all hover:ring-white/35"
            >
              <CustomerAvatar
                customer={customer}
                className="w-8 h-8 text-sm"
              />
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {configLoading ? (
          <div className="py-24 grid place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-light/45" />
          </div>
        ) : !enabled ? (
          <DisabledNotice />
        ) : created ? (
          <SuccessScreen reservation={created} onNew={reset} />
        ) : (
          <>
            {/* Pasos */}
            <div className="flex items-center gap-2 mb-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    s <= step ? "bg-secondary/70" : "bg-white/10"
                  )}
                />
              ))}
            </div>

            {/* Paso 1: tipo */}
            {step === 1 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-display mb-2 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">¿Qué quieres reservar?</h2>
                <p className="mb-5 text-[0.8rem] leading-relaxed text-light/50">
                  Sin filas ni sorpresas: tu puesto te espera.
                </p>
                <div className="grid gap-3">
                  <TypeCard
                    active={type === "table"}
                    onClick={() => setType("table")}
                    icon={UtensilsCrossed}
                    title="Una mesa"
                    subtitle="Para ti y tus amigos, en el piso que prefieras. Gratis."
                  />
                  <TypeCard
                    active={type === "vip_room"}
                    onClick={() => setType("vip_room")}
                    icon={Crown}
                    duo
                    title="Sala VIP · Piso 3"
                    subtitle={`El salón completo solo para ustedes (hasta ${
                      config?.vip_capacity ?? 15
                    } personas). Por turnos, con anticipo abonable.`}
                  />
                </div>
                <PrimaryButton
                  className="mt-5"
                  disabled={!type}
                  onClick={() => setStep(2)}
                >
                  Continuar
                </PrimaryButton>
              </motion.section>
            )}

            {/* Paso 2: fecha, personas y hora/turno */}
            {step === 2 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <BackLink onClick={() => setStep(1)} />
                <h2 className="font-display mb-4 flex items-center gap-2 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
                  <CalendarDays className="h-4 w-4 text-light/45" />
                  {isVip ? "¿Cuándo es la celebración?" : "¿Cuándo vienes?"}
                </h2>

                {/* Fecha */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                  {dates.map((d) => {
                    const iso = toISO(d);
                    const active = date === iso;
                    return (
                      <button
                        key={iso}
                        onClick={() => setDate(iso)}
                        className={cn(
                          "flex flex-col items-center min-w-[3.5rem] px-2 py-2 rounded-xl border snap-start transition-colors",
                          active
                            ? "border-secondary/45 bg-secondary/[0.1] text-light"
                            : "bg-white/[0.04] border-white/10 text-white/70"
                        )}
                      >
                        <span className="text-[10px] uppercase">
                          {WEEKDAYS[d.getDay()]}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {d.getDate()}
                        </span>
                        <span className="text-[10px] uppercase">
                          {MONTHS[d.getMonth()]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Personas */}
                <div className="fb-card mt-4 flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-light/45" />
                    <span className="text-sm font-semibold">Personas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stepper
                      onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      disabled={partySize <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Stepper>
                    <span className="w-8 text-center text-[1.05rem] font-medium text-light">
                      {partySize}
                    </span>
                    <Stepper
                      onClick={() =>
                        setPartySize((p) => Math.min(maxParty, p + 1))
                      }
                      disabled={partySize >= maxParty}
                    >
                      <Plus className="w-4 h-4" />
                    </Stepper>
                  </div>
                </div>

                {/* Aviso grupo grande */}
                {isGroup && (
                  <p className="fb-inset mt-2 p-3 text-[0.72rem] leading-relaxed text-light/60">
                    Los grupos de más de {config.table_max_party} ocupan varias
                    mesas juntas: pedimos un anticipo de{" "}
                    <strong>{money(config.group_deposit)}</strong> que se abona
                    completo a su consumo.
                  </p>
                )}

                {/* Piso (solo mesa) */}
                {!isVip && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(config?.floors || [2, 3]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFloor(f)}
                        className={cn(
                          "rounded-xl border py-3 text-[0.8rem] font-medium transition-colors",
                          floor === f
                            ? "border-secondary/45 bg-secondary/[0.1] text-light"
                            : "border-white/[0.1] bg-white/[0.03] text-light/55"
                        )}
                      >
                        Piso {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hora / turno */}
                {date && (
                  <div className="mt-5">
                    <h3 className="fb-eyebrow mb-2.5 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-light/45" />
                      {isVip ? "Elige el turno" : "Hora de llegada"}
                      {availLoading && (
                        <Loader2 className="h-3 w-3 animate-spin text-light/40" />
                      )}
                    </h3>

                    {isVip ? (
                      <div className="grid gap-3">
                        {vipSlots.map((s) => (
                          <button
                            key={s.slot}
                            disabled={!s.available}
                            onClick={() => setVipSlot(s.slot)}
                            className={cn(
                              "text-left p-4 rounded-xl border transition-colors",
                              !s.available
                                ? "bg-white/[0.02] border-white/5 opacity-40"
                                : vipSlot === s.slot
                                ? "border-secondary/45 bg-secondary/[0.07]"
                                : "border-white/[0.1] bg-white/[0.03]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[0.8rem] font-medium text-light">
                                {s.label}
                              </span>
                              <span className="text-xs text-white/60">
                                {s.start} – {s.end}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                              <span>
                                Anticipo{" "}
                                <strong className="font-medium text-light">
                                  {money(s.deposit)}
                                </strong>{" "}
                                (se abona)
                              </span>
                              <span>
                                Consumo mínimo{" "}
                                <strong className="font-medium text-light">
                                  {money(s.min_consumption)}
                                </strong>
                              </span>
                            </div>
                            {!s.available && (
                              <p className="mt-1 text-xs text-red-300/80">
                                No disponible para esta fecha
                              </p>
                            )}
                            {s.available && s.needs_review && (
                              <p className="mt-1 text-xs text-violet-300/90">
                                Sujeto a confirmación del equipo (hay reservas
                                de mesa ese día)
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {(availability?.slots || []).map((s) => (
                          <button
                            key={s.time}
                            disabled={!s.available}
                            onClick={() => setTime(s.time)}
                            className={cn(
                              "rounded-xl border py-2.5 text-[0.8rem] font-medium transition-colors",
                              !s.available
                                ? "border-white/5 bg-white/[0.02] text-light/20 line-through"
                                : time === s.time
                                ? "border-secondary/45 bg-secondary/[0.1] text-light"
                                : "border-white/[0.1] bg-white/[0.03] text-light/75"
                            )}
                          >
                            {s.time}
                          </button>
                        ))}
                        {!availLoading &&
                          availability &&
                          !availability.slots?.some((s) => s.available) && (
                            <p className="fb-inset col-span-4 p-3 text-[0.72rem] leading-relaxed text-light/55">
                              No quedan mesas reservables para ese día en este
                              piso. Prueba otra fecha u otro piso — también
                              puedes llegar directamente: siempre guardamos
                              mesas para quienes llegan sin reserva.
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                )}

                <PrimaryButton
                  className="mt-6"
                  disabled={!canContinueStep2}
                  onClick={() => setStep(3)}
                >
                  Continuar
                </PrimaryButton>
              </motion.section>
            )}

            {/* Paso 3: datos y confirmación */}
            {step === 3 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <BackLink onClick={() => setStep(2)} />
                <h2 className="font-display mb-4 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">Tus datos</h2>

                <div className="grid gap-3">
                  <input
                    className={inputCls}
                    placeholder="Nombre y apellido"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="Teléfono (WhatsApp)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                  />
                  <textarea
                    className={cn(inputCls, "resize-none")}
                    rows={2}
                    placeholder={
                      isVip
                        ? "¿Celebran algo? Cuéntanos (cumpleaños, grado...)"
                        : "Notas (opcional)"
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={300}
                  />
                </div>

                {/* Resumen */}
                <div className="fb-card mt-4 p-4">
                  <h3 className="fb-eyebrow mb-2.5 flex items-center gap-2">
                    {isVip ? (
                      <Crown className="w-4 h-4" />
                    ) : (
                      <UtensilsCrossed className="w-4 h-4" />
                    )}
                    {isVip
                      ? "Sala VIP · Piso 3"
                      : isGroup
                      ? `Grupo grande · Piso ${floor}`
                      : `Mesa · Piso ${floor}`}
                  </h3>
                  <dl className="text-sm text-white/70 grid gap-1">
                    <SummaryRow
                      label="Fecha"
                      value={date && formatLongDate(date)}
                    />
                    <SummaryRow
                      label={isVip ? "Turno" : "Llegada"}
                      value={
                        isVip
                          ? selectedVip &&
                            `${selectedVip.label} (${selectedVip.start} – ${selectedVip.end})`
                          : time
                      }
                    />
                    <SummaryRow label="Personas" value={partySize} />
                    {isVip && selectedVip && (
                      <>
                        <SummaryRow
                          label="Anticipo (se abona)"
                          value={money(selectedVip.deposit)}
                          destacado
                        />
                        <SummaryRow
                          label="Consumo mínimo"
                          value={money(selectedVip.min_consumption)}
                          destacado
                        />
                      </>
                    )}
                    {isGroup && (
                      <SummaryRow
                        label="Anticipo (se abona)"
                        value={money(config.group_deposit)}
                        destacado
                      />
                    )}
                  </dl>
                  {!isVip && !isGroup && (
                    <p className="mt-2 text-[0.7rem] text-light/40">
                      Guardamos tu mesa {config?.table_hold_minutes ?? 15}{" "}
                      minutos después de tu hora de llegada.
                    </p>
                  )}
                  <p className="mt-2 text-[0.7rem] text-light/40">
                    Enviarás una solicitud de reserva: nuestro equipo la
                    confirma por WhatsApp.
                  </p>
                </div>

                {error && (
                  <p className="mt-3 rounded-xl border border-red-500/20 p-3 text-[0.78rem] text-red-300">
                    {error}
                  </p>
                )}

                <PrimaryButton
                  className="mt-4"
                  disabled={createReservation.isPending}
                  onClick={handleConfirm}
                >
                  {createReservation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Enviar solicitud"
                  )}
                </PrimaryButton>
              </motion.section>
            )}

            {/* Mis reservas */}
            {isAuthenticated && step === 1 && (
              <section className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="fb-eyebrow">
                    Tus reservas
                  </h2>
                  <Link
                    to="/mis-reservas"
                    className="text-[0.72rem] text-light/60 transition-colors hover:text-light"
                  >
                    Ver todas
                  </Link>
                </div>
                <MyReservationsList
                  mode="upcoming"
                  emptyState={
                    <p className="text-xs text-white/40">
                      No tienes reservas próximas.
                    </p>
                  }
                />
              </section>
            )}
          </>
        )}
      </main>

      <CustomerAuthGate
        open={showAuth}
        onClose={() => {
          setShowAuth(false);
          pendingSubmit.current = false;
        }}
        onAuthenticated={() => {}}
        title="Inicia sesión para reservar"
        description="Vincula la reserva a tu cuenta para verla, cancelarla y recibir la confirmación. Solo te tomará un segundo."
      />
    </div>
  );
};

/* ------------------------------------------------------- subcomponentes -- */

const TypeCard = ({ active, onClick, icon: Icon, title, subtitle, duo }) => (
  <button
    onClick={onClick}
    className={cn(
      "text-left p-4 rounded-2xl border transition-all flex items-start gap-3",
      active
        ? "border-secondary/45 bg-secondary/[0.07]"
        : "hover:border-white/20"
    )}
  >
    <span
      className={cn(
        "grid place-items-center w-11 h-11 rounded-xl flex-shrink-0",
        duo
          ? "border border-white/[0.12] bg-linear-to-br from-primary/15 to-secondary/15 text-light/75"
          : "border border-white/[0.1] bg-white/[0.03] text-light/70"
      )}
    >
      <Icon className="w-5 h-5" />
    </span>
    <span>
      <span className="font-display block text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-light">{title}</span>
      <span className="mt-1.5 block text-[0.72rem] leading-relaxed text-light/50">
        {subtitle}
      </span>
    </span>
  </button>
);

const Stepper = ({ children, ...props }) => (
  <button
    {...props}
    className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-light/70 transition-transform active:scale-95 disabled:opacity-30"
  >
    {children}
  </button>
);

const PrimaryButton = ({ className, ...props }) => (
  <button
    {...props}
    className={cn(
      "fb-btn fb-btn--accent w-full",
      "active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
      className
    )}
  />
);

const BackLink = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mb-3 text-xs text-white/40 flex items-center gap-1 hover:text-white/70"
  >
    <ChevronLeft className="w-3.5 h-3.5" /> Atrás
  </button>
);

// `destacado` (antes `gold`, por el dorado que ya no existe) marca las filas de dinero del resumen: son las
// que el cliente tiene que ver sí o sí, pero ya no llevan color propio.
const SummaryRow = ({ label, value, destacado }) => (
  <div className="flex justify-between gap-4">
    <dt className="text-light/40">{label}</dt>
    <dd className={cn("text-right", destacado ? "font-medium text-light" : "text-light/75")}>
      {value ?? "—"}
    </dd>
  </div>
);

const formatLongDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// Mientras el módulo lo opere solo el staff, la reserva del cliente (mesa,
// grupo o Sala VIP) se hace escribiendo o llamando a la línea de reservas.
const DisabledNotice = () => (
  <div className="py-16 text-center px-4">
    <PartyPopper className="mx-auto mb-4 h-8 w-8 text-light/45" strokeWidth={1.6} />
    <h2 className="font-display mb-3 text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">Reserva con nosotros</h2>
    <p className="text-sm text-white/50 mb-6 max-w-xs mx-auto">
      Las reservas en línea aún no están activas. Escríbenos o llámanos al{" "}
      <span className="font-medium text-light">{RESERVATIONS_PHONE.display}</span> y
      te guardamos el puesto, sea mesa, grupo o la Sala VIP.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={reservationsWaLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fb-btn fb-btn--accent"
      >
        <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
      </a>
      <a
        href={reservationsTelLink}
        className="fb-btn"
      >
        <Phone className="w-4 h-4" /> Llamar
      </a>
    </div>
  </div>
);

const SuccessScreen = ({ reservation, onNew }) => {
  const hasDeposit = Number(reservation.deposit_amount) > 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-secondary/25 bg-secondary/10 text-secondary">
        <CheckCircle2 className="w-8 h-8" />
      </span>
      <h2 className="font-display mb-2 text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-light">Solicitud enviada</h2>
      <p className="text-sm text-white/60 mb-5">
        {reservation.type_display} · {formatLongDate(reservation.date)} ·{" "}
        {String(reservation.start_time).slice(0, 5)}
      </p>

      <p className="fb-inset mb-4 p-4 text-left text-[0.72rem] leading-relaxed text-light/60">
        Nuestro equipo revisará tu solicitud y te escribirá por WhatsApp para
        confirmarla. También puedes ver el estado aquí, en "Tus reservas".
      </p>

      {hasDeposit && (
        <div className="fb-inset mb-4 p-4 text-left">
          <h3 className="fb-eyebrow mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Anticipo:{" "}
            {money(reservation.deposit_amount)}
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Se envía <strong>solo cuando confirmemos tu solicitud</strong> — en
            ese momento te pasamos los datos de pago. Se abona completo a tu
            consumo y se devuelve si cancelas con más de 24 horas de
            anticipación.
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Link
          to="/"
          className="fb-btn w-full"
        >
          Volver a la carta
        </Link>
        <button onClick={onNew} className="py-2 text-[0.72rem] text-light/40">
          Hacer otra reserva
        </button>
      </div>
    </motion.div>
  );
};

export default ReservationsPage;
