import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, Loader2, Search, Settings2, Instagram, Phone,
  Check, AlertTriangle, ExternalLink, Banknote, Undo2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { matchesSearch } from "@/lib/search";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useContestAdmin,
  useUpdateContestEntry,
  useUpdateContest,
} from "@/hooks/useContest";

/**
 * Panel de la barra para el concurso vigente.
 *
 * El cliente llega, dice su número de inscripción y muestra la cédula. Desde
 * aquí se marca el pago y, tras revisar su perfil, que sigue a Frostbyte en
 * Instagram. Con las dos marcas la inscripción pasa sola a confirmada. La
 * configuración (abrir inscripciones, fecha, premio) es solo del admin.
 */

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const STATUS = {
  pending: { label: "Pendiente", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  confirmed: { label: "Confirmada", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelada", cls: "bg-white/10 text-white/40 border-white/10" },
};

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "cancelled", label: "Canceladas" },
];

const ContestAdminPage = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { data, isLoading, isError } = useContestAdmin();
  const updateEntry = useUpdateContestEntry();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");

  const contest = data?.contest;
  const counts = data?.counts || {};

  const entries = useMemo(() => {
    const list = data?.entries || [];
    const q = query.trim();
    return list.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      if (q.replace(/^#/, "") === String(e.number)) return true;
      return matchesSearch(q, e.full_name, e.instagram_handle, e.phone);
    });
  }, [data?.entries, filter, query]);

  // Cambio que espera confirmación en el diálogo: { entry, changes, confirm }
  const [pending, setPending] = useState(null);

  const save = async (entry, changes) => {
    setError("");
    try {
      await updateEntry.mutateAsync({ id: entry.id, data: changes });
    } catch (e) {
      const d = e.response?.data;
      setError((Array.isArray(d) && d[0]) || d?.detail || "No se pudo guardar el cambio.");
    }
  };

  // Con `confirm` (título, mensaje, tono…) primero pregunta en el diálogo
  const patch = (entry, changes, confirm) => {
    if (confirm) setPending({ entry, changes, confirm });
    else save(entry, changes);
  };

  const confirmPending = async () => {
    await save(pending.entry, pending.changes);
    setPending(null);
  };

  return (
    <div className="min-h-screen bg-dark text-light pb-16">
      <header className="sticky top-0 z-40 bg-dark/90 border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/home"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10"
            aria-label="Volver al dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display flex-1 truncate text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-light">
            {contest?.title || "Concurso"}
          </h1>
          {isAdmin && contest && (
            <button
              onClick={() => setShowSettings((s) => !s)}
              className={cn(
                "grid place-items-center w-9 h-9 rounded-full",
                showSettings ? "bg-white/20 text-light" : "bg-white/5 hover:bg-white/10"
              )}
              aria-label="Configuración del concurso"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 pt-5">
        {isLoading ? (
          <div className="py-24 grid place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-light/45" />
          </div>
        ) : isError || !contest ? (
          <p className="py-24 text-center text-sm text-white/50">No hay concursos creados.</p>
        ) : (
          <>
            {!contest.is_published && (
              <Notice>
                El concurso está oculto: los clientes no lo ven en la app.
                {isAdmin && " Publícalo desde la configuración."}
              </Notice>
            )}
            {contest.is_published && !contest.registrations_open && (
              <Notice>Las inscripciones están cerradas.</Notice>
            )}

            {showSettings && isAdmin && (
              <ContestSettings contest={contest} onDone={() => setShowSettings(false)} />
            )}

            {/* Conteos */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Stat label="Confirmadas" value={counts.confirmed ?? 0} />
              <Stat label="Pendientes" value={counts.pending ?? 0} />
              <Stat
                label="Recaudado"
                value={money(
                  (data.entries || []).filter((e) => e.paid && !e.cancelled).length *
                    Number(contest.entry_fee)
                )}
              />
            </div>

            {/* Buscar y filtrar */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Número, nombre, Instagram o celular"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-white/30"
              />
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors",
                    filter === f.key
                      ? "border-white/40 bg-white/10 text-light"
                      : "border-white/10 text-white/55 hover:text-light"
                  )}
                >
                  {f.label}
                  {f.key !== "all" && counts[f.key] ? ` (${counts[f.key]})` : ""}
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-3 rounded-xl border border-red-500/20 p-3 text-[0.78rem] text-red-300">
                {error}
              </p>
            )}

            {entries.length === 0 ? (
              <p className="py-16 text-center text-sm text-white/45">
                {query ? "Nadie coincide con la búsqueda." : "No hay inscripciones aquí."}
              </p>
            ) : (
              <>
                <div className="hidden lg:block">
                  <EntriesTable
                    entries={entries}
                    contest={contest}
                    busyId={updateEntry.isPending ? updateEntry.variables?.id : null}
                    onPatch={patch}
                  />
                </div>
                <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      contest={contest}
                      busy={updateEntry.isPending && updateEntry.variables?.id === entry.id}
                      onPatch={patch}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!pending}
        title={pending?.confirm.title}
        message={pending?.confirm.message}
        confirmLabel={pending?.confirm.confirmLabel}
        cancelLabel="No"
        tone={pending?.confirm.tone}
        icon={pending?.confirm.icon}
        loading={updateEntry.isPending}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

/* ------------------------------------------------------- subcomponentes -- */

const Notice = ({ children }) => (
  <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-3 text-[0.78rem] text-amber-200">
    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
    <p className="text-[0.65rem] uppercase tracking-wider text-white/45">{label}</p>
    <p className="mt-1 text-lg font-semibold">{value}</p>
  </div>
);

/** Marcar pago siempre pregunta: en la barra se cobra y se mira la cédula. */
const togglePaid = (entry, contest, onPatch) =>
  entry.paid
    ? onPatch(entry, { paid: false }, {
        title: "¿Quitar la marca de pago?",
        message: `La inscripción #${entry.number} de ${entry.full_name} vuelve a quedar pendiente.`,
        confirmLabel: "Sí, quitar",
        tone: "danger",
        icon: Undo2,
      })
    : onPatch(entry, { paid: true }, {
        title: `¿${entry.full_name} pagó ${money(contest.entry_fee)}?`,
        message: `Inscripción #${entry.number}. Revisa la cédula antes de marcar: debe ser mayor de ${contest.min_age} años.`,
        confirmLabel: "Sí, pagó",
        tone: "success",
        icon: Banknote,
      });

/** Cancelar también pregunta, y avisa si ya había pagado. */
const cancelConfirm = (entry) => ({
  title: `¿Cancelar la inscripción #${entry.number}?`,
  message: entry.paid
    ? `${entry.full_name} ya pagó. La devolución del dinero se hace aparte, en la barra.`
    : `${entry.full_name} podrá volver a inscribirse desde la app.`,
  confirmLabel: "Sí, cancelar",
  tone: "danger",
  icon: XCircle,
});

/** Escritorio: una fila por inscrito, con las dos casillas a la vista. */
const EntriesTable = ({ entries, contest, busyId, onPatch }) => (
  <div className="overflow-hidden rounded-2xl border border-white/10">
    <table className="w-full text-left text-[0.82rem]">
      <thead className="bg-white/[0.04] text-[0.68rem] uppercase tracking-wider text-white/45">
        <tr>
          <th className="px-3 py-2.5 font-medium">#</th>
          <th className="px-3 py-2.5 font-medium">Inscrito</th>
          <th className="px-3 py-2.5 font-medium">Instagram</th>
          <th className="px-3 py-2.5 font-medium">Pago</th>
          {contest.requires_instagram_follow && (
            <th className="px-3 py-2.5 font-medium">Sigue en IG</th>
          )}
          <th className="px-3 py-2.5 font-medium">Estado</th>
          <th className="px-3 py-2.5" />
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.06]">
        {entries.map((entry) => {
          const busy = busyId === entry.id;
          const status = STATUS[entry.status];
          return (
            <tr key={entry.id} className={cn("align-middle", entry.cancelled && "opacity-50")}>
              <td className="px-3 py-3 text-base font-bold">#{entry.number}</td>
              <td className="px-3 py-3">
                <p className="font-medium">{entry.full_name}</p>
                <p className="text-[0.72rem] text-white/45">
                  {entry.phone}
                  {entry.costume ? ` · ${entry.costume}` : ""}
                </p>
              </td>
              <td className="px-3 py-3">
                <a
                  href={`https://www.instagram.com/${entry.instagram_handle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/70 hover:text-light"
                >
                  @{entry.instagram_handle} <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              <td className="px-3 py-3">
                {!entry.cancelled && (
                  <CheckToggle
                    compact
                    on={entry.paid}
                    busy={busy}
                    label={entry.paid ? "Pagó" : `Cobrar ${money(contest.entry_fee)}`}
                    hint={entry.paid ? entry.paid_by_name : null}
                    onClick={() => togglePaid(entry, contest, onPatch)}
                  />
                )}
              </td>
              {contest.requires_instagram_follow && (
                <td className="px-3 py-3">
                  {!entry.cancelled && (
                    <CheckToggle
                      compact
                      on={entry.follows_instagram}
                      busy={busy}
                      label={entry.follows_instagram ? "Sí" : "Revisar"}
                      hint={entry.follows_instagram ? entry.instagram_checked_by_name : null}
                      onClick={() => onPatch(entry, { follows_instagram: !entry.follows_instagram })}
                    />
                  )}
                </td>
              )}
              <td className="px-3 py-3">
                <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] font-medium", status?.cls)}>
                  {status?.label}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <button
                  onClick={() =>
                    entry.cancelled
                      ? onPatch(entry, { cancelled: false })
                      : onPatch(entry, { cancelled: true }, cancelConfirm(entry))
                  }
                  disabled={busy}
                  className="text-[0.72rem] text-white/40 hover:text-light disabled:opacity-40"
                >
                  {entry.cancelled ? "Reactivar" : "Cancelar"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const EntryCard = ({ entry, contest, busy, onPatch }) => {
  const status = STATUS[entry.status];
  const cancelled = entry.cancelled;
  return (
    <li className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-4", cancelled && "opacity-60")}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 min-w-11 place-items-center rounded-xl border border-white/10 px-2 text-base font-bold">
          #{entry.number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{entry.full_name}</p>
          <a
            href={`https://www.instagram.com/${entry.instagram_handle}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-[0.78rem] text-white/60 hover:text-light"
          >
            <Instagram className="h-3.5 w-3.5" /> @{entry.instagram_handle}
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-0.5 flex items-center gap-1 text-[0.75rem] text-white/45">
            <Phone className="h-3 w-3" /> {entry.phone}
          </p>
          {entry.costume && (
            <p className="mt-1 text-[0.75rem] text-white/55">Disfraz: {entry.costume}</p>
          )}
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] font-medium", status?.cls)}>
          {status?.label}
        </span>
      </div>

      {!cancelled && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CheckToggle
            on={entry.paid}
            busy={busy}
            label={`Pagó ${money(contest.entry_fee)}`}
            hint={entry.paid && entry.paid_by_name ? `por ${entry.paid_by_name}` : "Pide la cédula"}
            onClick={() => togglePaid(entry, contest, onPatch)}
          />
          {contest.requires_instagram_follow && (
            <CheckToggle
              on={entry.follows_instagram}
              busy={busy}
              label="Nos sigue en IG"
              hint={
                entry.follows_instagram && entry.instagram_checked_by_name
                  ? `revisó ${entry.instagram_checked_by_name}`
                  : "Abre su perfil"
              }
              onClick={() => onPatch(entry, { follows_instagram: !entry.follows_instagram })}
            />
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        {cancelled ? (
          <button
            onClick={() => onPatch(entry, { cancelled: false })}
            disabled={busy}
            className="text-[0.72rem] text-white/45 hover:text-light disabled:opacity-40"
          >
            Reactivar
          </button>
        ) : (
          <button
            onClick={() =>
              onPatch(entry, { cancelled: true }, cancelConfirm(entry))
            }
            disabled={busy}
            className="text-[0.72rem] text-white/35 hover:text-red-300 disabled:opacity-40"
          >
            Cancelar inscripción
          </button>
        )}
      </div>
    </li>
  );
};

/**
 * Casilla grande para la barra: se lee como casilla (cuadro con chulo) y no
 * como botón, porque eso es lo que el staff hace aquí: chulear.
 */
const CheckToggle = ({ on, busy, label, hint, onClick, compact = false }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={on}
    onClick={onClick}
    disabled={busy}
    className={cn(
      "flex items-center gap-2.5 rounded-xl border text-left transition-colors disabled:opacity-50",
      compact ? "px-2.5 py-2" : "px-3 py-2.5",
      on
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : "border-white/15 bg-white/[0.03] text-light hover:bg-white/[0.07]"
    )}
  >
    <span
      aria-hidden
      className={cn(
        "grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border-2",
        on ? "border-emerald-400 bg-emerald-400 text-dark" : "border-white/40"
      )}
    >
      {on && <Check className="h-4 w-4" strokeWidth={3.5} />}
    </span>
    <span className="min-w-0">
      <span className="block text-[0.78rem] font-medium leading-tight">{label}</span>
      {hint && <span className="block text-[0.62rem] leading-tight opacity-70">{hint}</span>}
    </span>
  </button>
);

const ContestSettings = ({ contest, onDone }) => {
  const update = useUpdateContest();
  const [form, setForm] = useState({
    is_published: contest.is_published,
    registrations_open: contest.registrations_open,
    event_date: contest.event_date || "",
    event_time: contest.event_time?.slice(0, 5) || "",
    entry_fee: Number(contest.entry_fee),
    prize: contest.prize || "",
    description: contest.description || "",
  });
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const save = async () => {
    setError("");
    try {
      await update.mutateAsync({
        ...form,
        event_date: form.event_date || null,
        event_time: form.event_time || null,
      });
      onDone();
    } catch (e) {
      const d = e.response?.data;
      const first = d && Object.values(d)[0];
      setError((Array.isArray(first) && first[0]) || d?.detail || "No se pudo guardar.");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-white/30";

  return (
    <section className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="text-sm font-semibold">Configuración</h2>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_published} onChange={set("is_published")}
          className="h-4 w-4 accent-[var(--color-secondary)]" />
        Visible en la app (página y anuncio en la carta)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.registrations_open} onChange={set("registrations_open")}
          className="h-4 w-4 accent-[var(--color-secondary)]" />
        Inscripciones abiertas
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs text-white/55">
          Fecha
          <input type="date" value={form.event_date} onChange={set("event_date")} className={inputCls} />
        </label>
        <label className="grid gap-1 text-xs text-white/55">
          Hora
          <input type="time" value={form.event_time} onChange={set("event_time")} className={inputCls} />
        </label>
      </div>
      <label className="grid gap-1 text-xs text-white/55">
        Valor de la inscripción
        <input type="number" min="0" step="1000" value={form.entry_fee} onChange={set("entry_fee")} className={inputCls} />
      </label>
      <label className="grid gap-1 text-xs text-white/55">
        Premio (vacío = no se menciona)
        <input value={form.prize} onChange={set("prize")} maxLength={200} className={inputCls} />
      </label>
      <label className="grid gap-1 text-xs text-white/55">
        Descripción
        <textarea rows={3} value={form.description} onChange={set("description")} className={inputCls} />
      </label>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onDone} className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-light">
          Cerrar
        </button>
        <button
          onClick={save}
          disabled={update.isPending}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 disabled:opacity-40"
        >
          {update.isPending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </section>
  );
};

export default ContestAdminPage;
