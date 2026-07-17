import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Crown, UtensilsCrossed, Users, Phone,
  CalendarDays, Settings2, Loader2, Wifi, WifiOff, Plus, X, CheckCircle2,
  Trash2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useReservationsDay,
  useReservationsCalendar,
  useUpdateReservation,
  useDeleteReservation,
  useCreateStaffReservation,
  useReservationSettings,
  useUpdateReservationSettings,
  useReservationTables,
  useReservationsLive,
} from "@/hooks/useReservations";

/**
 * Dashboard de reservas del staff.
 *
 * Calendario mensual (hecho a mano, sin dependencias) + panel del día con las
 * reservas por hora, acciones de estado, asignación de mesa y configuración
 * del módulo. Se actualiza en vivo por WebSocket con respaldo de polling.
 */

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const STATUS_STYLE = {
  pending_payment: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending_review: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  seated: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  completed: "bg-white/10 text-white/50 border-white/10",
  cancelled: "bg-white/10 text-white/40 border-white/10",
  no_show: "bg-red-500/15 text-red-300 border-red-500/30",
};

/** Acciones disponibles por estado (etiqueta → nuevo estado). */
const ACTIONS = {
  pending_payment: [
    { label: "Confirmar pago", to: "confirmed", style: "ok" },
    { label: "Cancelar", to: "cancelled", style: "danger" },
  ],
  confirmed: [
    { label: "Sentar", to: "seated", style: "ok" },
    { label: "No llegó", to: "no_show", style: "warn" },
    { label: "Cancelar", to: "cancelled", style: "danger" },
  ],
  seated: [{ label: "Completar", to: "completed", style: "ok" }],
  no_show: [{ label: "Revivir", to: "confirmed", style: "ok" }],
};

/** Toda reserva del cliente entra como solicitud (pending_review); al
 * aprobarla, las que llevan anticipo pasan a pedirlo y el resto queda
 * confirmada de una vez. */
const actionsFor = (r) => {
  if (r.status === "pending_review") {
    return [
      Number(r.deposit_amount) > 0
        ? { label: "Aprobar → pedir anticipo", to: "pending_payment", style: "ok" }
        : { label: "Aprobar y confirmar", to: "confirmed", style: "ok" },
      { label: "Rechazar", to: "cancelled", style: "danger" },
    ];
  }
  return ACTIONS[r.status] || [];
};

const ACTION_STYLE = {
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/10 text-red-300/80 border-red-500/20",
};

const ReservationsAdminPage = () => {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { isConnected } = useReservationsLive();
  const { data: day, isLoading: dayLoading } = useReservationsDay(selectedDate);
  const { data: calendar } = useReservationsCalendar(viewYear, viewMonth);

  const reservations = day?.reservations || [];
  const kpis = useMemo(() => {
    const blocking = ["pending_payment", "pending_review", "confirmed", "seated"];
    return {
      total: reservations.filter((r) => blocking.includes(r.status)).length,
      pending: reservations.filter((r) =>
        ["pending_payment", "pending_review"].includes(r.status)).length,
      vip: reservations.filter(
        (r) => r.reservation_type === "vip_room" &&
          blocking.includes(r.status)).length,
    };
  }, [reservations]);

  const shiftMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <div className="min-h-screen bg-dark text-light pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/home"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
            aria-label="Volver al dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black uppercase tracking-wide flex-1">
            Reservas
          </h1>
          <span
            title={isConnected ? "Tiempo real activo" : "Reconectando…"}
            className={cn(
              "grid place-items-center w-8 h-8 rounded-full",
              isConnected ? "text-emerald-400" : "text-white/30"
            )}
          >
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </span>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className={cn(
              "grid place-items-center w-9 h-9 rounded-full",
              showSettings ? "bg-gold/20 text-gold" : "bg-white/5 hover:bg-white/10"
            )}
            aria-label="Configuración"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 pt-5 grid gap-5 lg:grid-cols-[380px_1fr] items-start">
        {/* Columna izquierda: calendario + KPIs + config */}
        <div className="grid gap-4">
          {/* Calendario */}
          <section className="liquid-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-black text-sm uppercase tracking-wide">
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </h2>
              <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <MonthGrid
              year={viewYear}
              month={viewMonth}
              days={calendar?.days || {}}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
            <div className="mt-3 flex gap-4 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <i className="w-2 h-2 rounded-full bg-gold inline-block" /> Con reservas
              </span>
              <span className="flex items-center gap-1">
                <i className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Pendientes
              </span>
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-gold" /> Sala VIP
              </span>
            </div>
          </section>

          {/* KPIs del día */}
          <section className="grid grid-cols-3 gap-2">
            <Kpi label="Activas" value={kpis.total} />
            <Kpi label="Pendientes" value={kpis.pending} accent={kpis.pending > 0} />
            <Kpi label="Sala VIP" value={kpis.vip} gold={kpis.vip > 0} />
          </section>

          {/* Contexto de ocupación */}
          {day && (
            <p className="text-xs text-white/40 px-1">
              Mesas físicas — Piso 2: {day.tables_by_floor?.["2"] ?? "?"} ·
              Piso 3: {day.tables_by_floor?.["3"] ?? "?"} · Reservables por
              franja: {day.max_reserved_tables_per_slot} · Mesas dentro de la
              sala: {day.vip_room_table_count}
            </p>
          )}

          {/* Configuración */}
          <AnimatePresence>
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          </AnimatePresence>
        </div>

        {/* Columna derecha: reservas del día */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black uppercase text-sm tracking-wide flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gold" />
              {formatLongDate(selectedDate)}
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva
            </button>
          </div>

          {dayLoading ? (
            <div className="py-16 grid place-items-center">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : reservations.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/40">
              Sin reservas para este día.
            </p>
          ) : (
            <div className="grid gap-2.5">
              {reservations.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {showCreate && (
          <CreateModal
            date={selectedDate}
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --------------------------------------------------------------- calendario */

const MonthGrid = ({ year, month, days, selected, onSelect }) => {
  const cells = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    // Lunes como primer día de la semana
    const lead = (first.getDay() + 6) % 7;
    const total = new Date(year, month, 0).getDate();
    const list = Array(lead).fill(null);
    for (let d = 1; d <= total; d++) list.push(d);
    return list;
  }, [year, month]);

  const iso = (d) =>
    `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const today = todayISO();

  return (
    <div className="grid grid-cols-7 gap-1">
      {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
        <span key={i} className="text-center text-[10px] text-white/30 font-bold py-1">
          {d}
        </span>
      ))}
      {cells.map((d, i) => {
        if (!d) return <span key={`e${i}`} />;
        const dayIso = iso(d);
        const info = days[dayIso];
        const isSelected = selected === dayIso;
        const isToday = today === dayIso;
        return (
          <button
            key={dayIso}
            onClick={() => onSelect(dayIso)}
            className={cn(
              "relative aspect-square rounded-lg text-sm font-semibold grid place-items-center transition-colors",
              isSelected
                ? "bg-gold text-dark font-black"
                : isToday
                ? "bg-white/10 text-gold"
                : "hover:bg-white/5 text-white/70"
            )}
          >
            {d}
            {info && info.total > 0 && !isSelected && (
              <span className="absolute bottom-1 flex gap-0.5">
                <i className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                {info.pending > 0 && (
                  <i className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                )}
                {info.vip > 0 && (
                  <Crown className="w-2 h-2 text-gold" />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const Kpi = ({ label, value, accent, gold }) => (
  <div className="liquid-glass rounded-xl p-3 text-center">
    <p
      className={cn(
        "text-2xl font-black",
        gold ? "text-gold" : accent ? "text-violet-300" : "text-light"
      )}
    >
      {value}
    </p>
    <p className="text-[10px] uppercase tracking-wide text-white/40 font-bold">
      {label}
    </p>
  </div>
);

/* ------------------------------------------------------------ tarjeta día -- */

const ReservationCard = ({ reservation: r }) => {
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: tables } = useReservationTables();
  const isVip = r.reservation_type === "vip_room";
  const actions = actionsFor(r);
  const floorTables = (tables || []).filter((t) => t.floor === r.floor);
  const canAssignTable =
    !isVip && ["confirmed", "seated"].includes(r.status);

  const setStatus = (to) =>
    updateReservation.mutate({ id: r.id, data: { status: to } });

  return (
    <article
      className={cn(
        "rounded-xl border p-3.5",
        isVip
          ? "bg-linear-to-br from-gold/10 via-dark-secondary to-transparent border-gold/30"
          : "bg-white/[0.03] border-white/[0.08]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "grid place-items-center w-9 h-9 rounded-lg flex-shrink-0",
              isVip ? "bg-gold/20 text-gold" : "bg-white/10 text-white/60"
            )}
          >
            {isVip ? <Crown className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">
              {String(r.start_time).slice(0, 5)} · {r.customer_name}
            </p>
            <p className="text-xs text-white/50 flex flex-wrap gap-x-2">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {r.party_size}
              </span>
              <span>{isVip ? `Turno ${r.vip_slot_display}` : `Piso ${r.floor}`}</span>
              {!isVip && r.tables_needed > 1 && (
                <span>{r.tables_needed} mesas</span>
              )}
              {r.table_label && <span className="text-gold">{r.table_label}</span>}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex-shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full border",
            STATUS_STYLE[r.status]
          )}
        >
          {r.status_display}
        </span>
      </div>

      {(Number(r.deposit_amount) > 0 || Number(r.min_consumption) > 0) && (
        <p className="mt-2 text-xs text-white/50">
          {Number(r.deposit_amount) > 0 && (
            <>Anticipo <strong className="text-gold">{money(r.deposit_amount)}</strong></>
          )}
          {Number(r.min_consumption) > 0 && (
            <> · Consumo mínimo <strong className="text-gold">{money(r.min_consumption)}</strong></>
          )}
        </p>
      )}
      {r.notes && (
        <p className="mt-1.5 text-xs text-white/40 italic">“{r.notes}”</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/57${String(r.customer_phone).replace(/\D/g, "").replace(/^57/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60"
        >
          <Phone className="w-3 h-3" /> {r.customer_phone}
        </a>

        {canAssignTable && floorTables.length > 0 && (
          <select
            value={r.table || ""}
            onChange={(e) =>
              updateReservation.mutate({
                id: r.id,
                data: { table: e.target.value || null },
              })
            }
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/70 outline-none"
          >
            <option value="">Sin mesa asignada</option>
            {floorTables.map((t) => (
              <option key={t.id} value={t.id} className="bg-dark">
                {t.label}
              </option>
            ))}
          </select>
        )}

        <span className="flex-1" />

        {actions.map((a) => (
          <button
            key={a.to}
            disabled={updateReservation.isPending}
            onClick={() => setStatus(a.to)}
            className={cn(
              "text-xs font-bold px-2.5 py-1.5 rounded-lg border disabled:opacity-40",
              ACTION_STYLE[a.style]
            )}
          >
            {a.label}
          </button>
        ))}

        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deleteReservation.isPending}
          aria-label="Eliminar reserva"
          className="grid place-items-center w-7 h-7 rounded-lg border border-white/10 text-white/30 hover:text-red-300 hover:border-red-500/30 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        reservation={r}
        pending={deleteReservation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteReservation.mutate(r.id, {
            onSettled: () => setConfirmDelete(false),
          })
        }
      />
    </article>
  );
};

/** Diálogo de confirmación para el borrado definitivo de una reserva. */
const ConfirmDeleteDialog = ({
  open,
  reservation: r,
  pending,
  onCancel,
  onConfirm,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-label="Confirmar eliminación de la reserva"
          className="w-full max-w-sm rounded-2xl bg-dark-secondary border border-white/10 p-5 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-red-500/15 text-red-300 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-black text-sm">¿Eliminar esta reserva?</h3>
              <p className="mt-1 text-xs text-white/60 leading-relaxed">
                {r.customer_name} · {String(r.start_time).slice(0, 5)} ·{" "}
                {r.party_size} personas. Se borra definitivamente y no se
                puede deshacer. Si solo quieres liberar el cupo, usa
                Cancelar o Rechazar.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="text-xs font-bold px-3.5 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white/90"
            >
              Conservar
            </button>
            <button
              onClick={onConfirm}
              disabled={pending}
              className="text-xs font-bold px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 disabled:opacity-40 flex items-center gap-1.5"
            >
              {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Eliminar
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ------------------------------------------------------------ configuración */

const SETTING_FIELDS = [
  { key: "vip_deposit", label: "Anticipo Sala VIP", type: "money" },
  { key: "vip_min_consumption_weekday", label: "Consumo mín. entre semana", type: "money" },
  { key: "vip_min_consumption_weekend", label: "Consumo mín. vie/sáb", type: "money" },
  { key: "group_deposit", label: "Anticipo grupo grande", type: "money" },
  { key: "table_max_party", label: "Personas máx. por mesa", type: "number" },
  { key: "seats_per_table", label: "Puestos por mesa", type: "number" },
  { key: "max_reserved_tables_per_slot", label: "Mesas reservables por franja", type: "number" },
  { key: "vip_room_table_count", label: "Mesas dentro de la sala", type: "number" },
  { key: "table_hold_minutes", label: "Tolerancia llegada (min)", type: "number" },
  { key: "max_advance_days", label: "Antelación máx. (días)", type: "number" },
  { key: "reservable_from", label: "Reservas desde", type: "time" },
  { key: "reservable_until", label: "Reservas hasta", type: "time" },
  { key: "vip_slot_1_start", label: "Turno tarde inicia", type: "time" },
  { key: "vip_slot_1_end", label: "Turno tarde termina", type: "time" },
  { key: "vip_slot_2_start", label: "Turno noche inicia", type: "time" },
  { key: "vip_slot_2_end", label: "Turno noche termina", type: "time" },
];

const SettingsPanel = ({ onClose }) => {
  const { data: settings, isLoading } = useReservationSettings();
  const updateSettings = useUpdateReservationSettings();
  const [draft, setDraft] = useState({});
  const [saved, setSaved] = useState(false);

  const value = (key) => draft[key] ?? settings?.[key] ?? "";

  const save = () => {
    if (!Object.keys(draft).length) return;
    updateSettings.mutate(draft, {
      onSuccess: () => {
        setDraft({});
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="liquid-glass rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-sm uppercase flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-gold" /> Configuración
          </h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gold mx-auto my-6" />
        ) : (
          <>
            {/* Interruptor general */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 mb-3 cursor-pointer">
              <span className="text-sm font-bold">Reservas en línea</span>
              <input
                type="checkbox"
                checked={!!(draft.reservations_enabled ?? settings?.reservations_enabled)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, reservations_enabled: e.target.checked }))
                }
                className="w-5 h-5 accent-[#f2c53d]"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              {SETTING_FIELDS.map((f) => (
                <label key={f.key} className="text-[10px] uppercase font-bold text-white/40">
                  {f.label}
                  <input
                    type={f.type === "time" ? "time" : "number"}
                    value={
                      f.type === "time"
                        ? String(value(f.key)).slice(0, 5)
                        : value(f.key)
                    }
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    className="mt-1 w-full px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-light text-sm font-normal outline-none focus:border-gold/40"
                  />
                </label>
              ))}
            </div>

            <label className="block mt-2 text-[10px] uppercase font-bold text-white/40">
              Instrucciones de pago del anticipo
              <textarea
                rows={3}
                value={value("payment_instructions")}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, payment_instructions: e.target.value }))
                }
                className="mt-1 w-full px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-light text-sm font-normal outline-none focus:border-gold/40 resize-none"
              />
            </label>

            <button
              onClick={save}
              disabled={!Object.keys(draft).length || updateSettings.isPending}
              className="mt-3 w-full py-2.5 rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark text-sm font-black uppercase disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Guardado
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </>
        )}
      </div>
    </motion.section>
  );
};

/* --------------------------------------------------------- crear (teléfono) */

const CreateModal = ({ date, onClose }) => {
  const createReservation = useCreateStaffReservation();
  const [form, setForm] = useState({
    reservation_type: "table",
    customer_name: "",
    customer_phone: "",
    party_size: 2,
    floor: 2,
    date,
    start_time: "19:00",
    vip_slot: 2,
    notes: "",
  });
  const [error, setError] = useState("");
  const isVip = form.reservation_type === "vip_room";
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    const payload = {
      reservation_type: form.reservation_type,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      party_size: Number(form.party_size) || 1,
      date: form.date,
      notes: form.notes,
      ...(isVip
        ? { vip_slot: Number(form.vip_slot) }
        : { start_time: form.start_time, floor: Number(form.floor) }),
    };
    try {
      await createReservation.mutateAsync(payload);
      onClose();
    } catch (e) {
      const data = e.response?.data;
      const msg =
        (Array.isArray(data) && data[0]) ||
        data?.detail ||
        (data && Object.values(data)?.[0]?.[0]) ||
        "No se pudo crear la reserva.";
      setError(String(msg));
    }
  };

  const fieldCls =
    "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-light text-sm outline-none focus:border-gold/40";

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-dark border border-white/10 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        exit={{ y: 24 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase text-sm">Nueva reserva (staff)</h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "table", label: "Mesa / grupo" },
              { v: "vip_room", label: "Sala VIP" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => set("reservation_type", o.v)}
                className={cn(
                  "py-2.5 rounded-xl border text-sm font-bold",
                  form.reservation_type === o.v
                    ? "bg-gold/15 border-gold/50 text-gold"
                    : "bg-white/[0.04] border-white/10 text-white/60"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <input
            className={fieldCls}
            placeholder="Nombre del cliente"
            value={form.customer_name}
            onChange={(e) => set("customer_name", e.target.value)}
          />
          <input
            className={fieldCls}
            type="tel"
            placeholder="Teléfono"
            value={form.customer_phone}
            onChange={(e) => set("customer_phone", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] uppercase font-bold text-white/40">
              Fecha
              <input
                type="date"
                className={cn(fieldCls, "mt-1")}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </label>
            <label className="text-[10px] uppercase font-bold text-white/40">
              Personas
              <input
                type="number"
                min={1}
                className={cn(fieldCls, "mt-1")}
                value={form.party_size}
                onChange={(e) => set("party_size", e.target.value)}
              />
            </label>
          </div>

          {isVip ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 1, label: "Tarde" },
                { v: 2, label: "Noche" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => set("vip_slot", o.v)}
                  className={cn(
                    "py-2.5 rounded-xl border text-sm font-bold",
                    Number(form.vip_slot) === o.v
                      ? "bg-gold/15 border-gold/50 text-gold"
                      : "bg-white/[0.04] border-white/10 text-white/60"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] uppercase font-bold text-white/40">
                Hora de llegada
                <input
                  type="time"
                  className={cn(fieldCls, "mt-1")}
                  value={form.start_time}
                  onChange={(e) => set("start_time", e.target.value)}
                />
              </label>
              <label className="text-[10px] uppercase font-bold text-white/40">
                Piso
                <select
                  className={cn(fieldCls, "mt-1")}
                  value={form.floor}
                  onChange={(e) => set("floor", e.target.value)}
                >
                  <option value={2} className="bg-dark">Piso 2</option>
                  <option value={3} className="bg-dark">Piso 3</option>
                </select>
              </label>
            </div>
          )}

          <textarea
            rows={2}
            className={cn(fieldCls, "resize-none")}
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />

          {error && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={createReservation.isPending}
            className="w-full py-3 rounded-xl bg-linear-to-r from-gold to-amber-600 text-dark font-black text-sm uppercase disabled:opacity-40 flex items-center justify-center"
          >
            {createReservation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Crear reserva"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const formatLongDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export default ReservationsAdminPage;
