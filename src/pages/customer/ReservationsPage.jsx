import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Crown, UtensilsCrossed, Users, Minus, Plus, Clock,
  MessageCircle, CheckCircle2, Loader2, CalendarDays, Wallet, PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] " +
  "text-light text-sm placeholder:text-white/25 outline-none " +
  "focus:border-gold/40 transition-colors";

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
    <div className="min-h-screen bg-dark text-light pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
            aria-label="Volver a la carta"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black uppercase tracking-wide flex-1">
            Reservas <span className="text-gold">Frostbyte</span>
          </h1>
          {isAuthenticated && (
            <Link
              to="/mi-cuenta"
              aria-label="Mi cuenta"
              className="grid place-items-center rounded-full ring-2 ring-gold/40 hover:ring-gold transition-all"
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
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
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
                    s <= step ? "bg-gold" : "bg-white/10"
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
                <h2 className="text-lg font-black mb-1">¿Qué quieres reservar?</h2>
                <p className="text-sm text-white/50 mb-4">
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
                    gold
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
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-gold" />
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
                            ? "bg-gold text-dark border-gold font-black"
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
                <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gold" />
                    <span className="text-sm font-semibold">Personas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stepper
                      onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      disabled={partySize <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Stepper>
                    <span className="w-8 text-center text-lg font-black">
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
                  <p className="mt-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
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
                          "py-3 rounded-xl border text-sm font-bold transition-colors",
                          floor === f
                            ? "bg-gold/15 border-gold/50 text-gold"
                            : "bg-white/[0.04] border-white/10 text-white/60"
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
                    <h3 className="text-sm font-bold text-white/70 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold" />
                      {isVip ? "Elige el turno" : "Hora de llegada"}
                      {availLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />
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
                                ? "bg-gold/15 border-gold/60"
                                : "bg-white/[0.04] border-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black uppercase text-sm">
                                {s.label}
                              </span>
                              <span className="text-xs text-white/60">
                                {s.start} – {s.end}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                              <span>
                                Anticipo{" "}
                                <strong className="text-gold">
                                  {money(s.deposit)}
                                </strong>{" "}
                                (se abona)
                              </span>
                              <span>
                                Consumo mínimo{" "}
                                <strong className="text-gold">
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
                              "py-2.5 rounded-xl border text-sm font-bold transition-colors",
                              !s.available
                                ? "bg-white/[0.02] border-white/5 text-white/20 line-through"
                                : time === s.time
                                ? "bg-gold text-dark border-gold"
                                : "bg-white/[0.04] border-white/10 text-white/80"
                            )}
                          >
                            {s.time}
                          </button>
                        ))}
                        {!availLoading &&
                          availability &&
                          !availability.slots?.some((s) => s.available) && (
                            <p className="col-span-4 text-xs text-white/50 bg-white/[0.04] border border-white/10 rounded-xl p-3">
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
                <h2 className="text-lg font-black mb-4">Tus datos</h2>

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
                <div className="mt-4 p-4 rounded-xl bg-linear-to-br from-gold/10 via-dark-secondary to-transparent border border-gold/25">
                  <h3 className="text-sm font-black uppercase text-gold mb-2 flex items-center gap-2">
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
                          gold
                        />
                        <SummaryRow
                          label="Consumo mínimo"
                          value={money(selectedVip.min_consumption)}
                          gold
                        />
                      </>
                    )}
                    {isGroup && (
                      <SummaryRow
                        label="Anticipo (se abona)"
                        value={money(config.group_deposit)}
                        gold
                      />
                    )}
                  </dl>
                  {!isVip && !isGroup && (
                    <p className="mt-2 text-xs text-white/40">
                      Guardamos tu mesa {config?.table_hold_minutes ?? 15}{" "}
                      minutos después de tu hora de llegada.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-white/40">
                    Enviarás una solicitud de reserva: nuestro equipo la
                    confirma por WhatsApp.
                  </p>
                </div>

                {error && (
                  <p className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
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
                  <h2 className="text-sm font-black uppercase text-white/50">
                    Tus reservas
                  </h2>
                  <Link
                    to="/mis-reservas"
                    className="text-xs font-bold text-gold"
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

const TypeCard = ({ active, onClick, icon: Icon, title, subtitle, gold }) => (
  <button
    onClick={onClick}
    className={cn(
      "text-left p-4 rounded-2xl border transition-all flex items-start gap-3",
      active
        ? "bg-gold/15 border-gold/60 shadow-[0_0_24px_rgba(242,197,61,0.15)]"
        : "bg-white/[0.04] border-white/10 hover:border-white/20"
    )}
  >
    <span
      className={cn(
        "grid place-items-center w-11 h-11 rounded-xl flex-shrink-0",
        gold
          ? "bg-linear-to-br from-gold to-amber-600 text-dark"
          : "bg-white/10 text-gold"
      )}
    >
      <Icon className="w-5 h-5" />
    </span>
    <span>
      <span className="block font-black uppercase text-sm">{title}</span>
      <span className="block text-xs text-white/50 mt-1 leading-relaxed">
        {subtitle}
      </span>
    </span>
  </button>
);

const Stepper = ({ children, ...props }) => (
  <button
    {...props}
    className="grid place-items-center w-9 h-9 rounded-full bg-white/10 disabled:opacity-30 active:scale-95 transition-transform"
  >
    {children}
  </button>
);

const PrimaryButton = ({ className, ...props }) => (
  <button
    {...props}
    className={cn(
      "w-full py-3.5 rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark",
      "font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2",
      "active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100",
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

const SummaryRow = ({ label, value, gold }) => (
  <div className="flex justify-between gap-4">
    <dt className="text-white/40">{label}</dt>
    <dd className={cn("font-bold text-right", gold && "text-gold")}>
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

const DisabledNotice = () => (
  <div className="py-16 text-center px-4">
    <PartyPopper className="w-10 h-10 text-gold mx-auto mb-4" />
    <h2 className="text-lg font-black mb-2">Muy pronto</h2>
    <p className="text-sm text-white/50 mb-6 max-w-xs mx-auto">
      Las reservas en línea aún no están activas. Mientras tanto escríbenos por
      WhatsApp y te guardamos el puesto.
    </p>
    <a
      href="https://wa.me/573164277879?text=Hola%2C%20quiero%20hacer%20una%20reserva"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark font-bold text-sm uppercase"
    >
      <MessageCircle className="w-4 h-4" /> Reservar por WhatsApp
    </a>
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
      <span className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-300">
        <CheckCircle2 className="w-8 h-8" />
      </span>
      <h2 className="text-xl font-black mb-1">¡Solicitud enviada!</h2>
      <p className="text-sm text-white/60 mb-5">
        {reservation.type_display} · {formatLongDate(reservation.date)} ·{" "}
        {String(reservation.start_time).slice(0, 5)}
      </p>

      <p className="text-left text-xs text-violet-200/90 bg-violet-500/10 border border-violet-500/25 rounded-xl p-4 mb-4">
        Nuestro equipo revisará tu solicitud y te escribirá por WhatsApp para
        confirmarla. También puedes ver el estado aquí, en "Tus reservas".
      </p>

      {hasDeposit && (
        <div className="text-left p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-4">
          <h3 className="text-sm font-black text-amber-300 mb-1 flex items-center gap-2">
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
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold"
        >
          Volver a la carta
        </Link>
        <button onClick={onNew} className="text-xs text-white/40 py-2">
          Hacer otra reserva
        </button>
      </div>
    </motion.div>
  );
};

export default ReservationsPage;
