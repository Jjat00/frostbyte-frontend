import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useMyReservations,
  useReservationsConfig,
  useCancelReservation,
} from "@/hooks/useReservations";

/**
 * Lista de reservas del cliente autenticado, reutilizable en /reservas,
 * /mis-reservas y /mi-cuenta.
 *
 * mode="full": secciones "Próximas" y "Anteriores" con cancelación.
 * mode="upcoming": solo las próximas (sin encabezados; el padre titula),
 * opcionalmente limitadas con `limit`.
 */

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const ACTIVE_STATUSES = [
  "pending_review",
  "pending_payment",
  "confirmed",
  "seated",
];

const CANCELLABLE = ["pending_review", "pending_payment", "confirmed"];

const STATUS_CHIP = {
  pending_payment: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending_review: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  seated: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  completed: "bg-white/10 text-white/50 border-white/10",
  cancelled: "bg-white/10 text-white/40 border-white/10",
  no_show: "bg-red-500/15 text-red-300 border-red-500/30",
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export const formatLongDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const ReservationCard = ({ reservation: r }) => {
  const { data: config } = useReservationsConfig();
  const cancelReservation = useCancelReservation();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="fb-card p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.82rem] font-medium text-light">
          {r.type_display} · {formatLongDate(r.date)}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap",
            STATUS_CHIP[r.status] || STATUS_CHIP.completed
          )}
        >
          {r.status_display}
        </span>
      </div>
      <p className="mt-1.5 text-[0.72rem] text-light/50">
        {String(r.start_time).slice(0, 5)} · {r.party_size} personas
        {r.floor ? ` · Piso ${r.floor}` : ""}
        {Number(r.deposit_amount) > 0 &&
          ` · Anticipo ${money(r.deposit_amount)}`}
      </p>
      {r.status === "pending_review" && (
        <p className="fb-inset mt-2 p-2.5 text-[0.72rem] leading-relaxed text-light/60">
          Estamos revisando tu solicitud; te confirmamos por WhatsApp.
        </p>
      )}
      {r.status === "pending_payment" && config?.payment_instructions && (
        <p className="fb-inset mt-2 whitespace-pre-line p-2.5 text-[0.72rem] leading-relaxed text-light/60">
          ¡Solicitud aprobada! Para confirmarla falta el anticipo de{" "}
          <strong>{money(r.deposit_amount)}</strong>.{" "}
          {config.payment_instructions}
        </p>
      )}
      {CANCELLABLE.includes(r.status) &&
        (confirming ? (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                cancelReservation.mutate(r.id);
                setConfirming(false);
              }}
              className="rounded-lg border border-red-500/25 px-3 py-1.5 text-[0.72rem] text-red-300"
            >
              Sí, cancelar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 text-[0.72rem] text-light/50"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="mt-2 text-[0.72rem] text-light/40 underline underline-offset-2"
          >
            Cancelar reserva
          </button>
        ))}
    </div>
  );
};

const MyReservationsList = ({ mode = "full", limit, emptyState = null }) => {
  const { data: reservations } = useMyReservations();

  if (!reservations?.length) return emptyState;

  const today = todayISO();
  const upcoming = reservations
    .filter((r) => r.date >= today && ACTIVE_STATUSES.includes(r.status))
    .sort((a, b) =>
      a.date === b.date
        ? String(a.start_time).localeCompare(String(b.start_time))
        : a.date.localeCompare(b.date)
    );
  const past = reservations.filter((r) => !upcoming.includes(r));

  if (mode === "upcoming") {
    const shown = limit ? upcoming.slice(0, limit) : upcoming;
    if (!shown.length) return emptyState;
    return (
      <div className="grid gap-2">
        {shown.map((r) => (
          <ReservationCard key={r.id} reservation={r} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {upcoming.length > 0 && (
        <section>
          <h2 className="fb-eyebrow mb-3 block">
            Próximas
          </h2>
          <div className="grid gap-2">
            {upcoming.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="fb-eyebrow mb-3 block">
            Anteriores
          </h2>
          <div className="grid gap-2">
            {past.slice(0, 15).map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}
      {upcoming.length === 0 && past.length === 0 && emptyState}
    </div>
  );
};

export default MyReservationsList;
