import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, Loader2, Instagram, CheckCircle2, Circle, ArrowDown, ArrowRight, LogOut, XCircle,
} from "lucide-react";
import { SOCIAL } from "@/lib/social";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import CustomerAuthGate from "@/components/checkout/CustomerAuthGate";
import CustomerAvatar from "@/components/auth/CustomerAvatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ConcursoPoster from "@/components/concurso/ConcursoPoster";
import {
  useCurrentContest,
  useMyContestEntry,
  useRegisterContest,
  useCancelContestEntry,
} from "@/hooks/useContest";

/**
 * Página del concurso vigente (hoy: disfraces de Halloween, solo +18).
 *
 * Arriba el mismo póster del anuncio de la carta; debajo, cómo participar y
 * el formulario o, si ya estás inscrito, en qué va tu inscripción.
 *
 * La participación se confirma con tres cosas: inscripción con la cuenta de
 * Google, pago en la barra (donde se revisa la cédula) y seguir a Frostbyte
 * en Instagram. Las dos últimas las marca el staff; aquí el cliente solo ve
 * en qué va. El login de Google salta al enviar el formulario, como en
 * reservas, y el envío sigue solo al volver.
 */

const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const errorMessage = (e, fallback) => {
  const data = e?.response?.data;
  if (Array.isArray(data) && data[0]) return String(data[0]);
  if (data?.detail) return String(data.detail);
  const first = data && Object.values(data)[0];
  if (Array.isArray(first) && first[0]) return String(first[0]);
  return fallback;
};

const scrollTo = (id) => (event) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const ContestPage = () => {
  const { customer, isAuthenticated, logout } = useCustomerAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { data: contest, isLoading, isError } = useCurrentContest();
  const { data: entry, isLoading: entryLoading } = useMyContestEntry(
    isAuthenticated && !!contest
  );
  const register = useRegisterContest();
  const cancel = useCancelContestEntry();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [costume, setCostume] = useState("");
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  // "Inicia sesión" sin llenar el formulario: solo cambia el texto del login
  const [loginOnly, setLoginOnly] = useState(false);
  const pendingSubmit = useRef(false);

  useEffect(() => {
    if (customer) {
      setName((n) => n || customer.full_name || customer.first_name || "");
      setPhone((p) => p || customer.phone || "");
    }
  }, [customer]);

  const doSubmit = async () => {
    try {
      await register.mutateAsync({
        full_name: name.trim(),
        phone: phone.trim(),
        instagram_handle: instagram.trim(),
        costume: costume.trim(),
        declared_adult: adult,
      });
      document.getElementById("inscripcion")?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      setError(errorMessage(e, "No pudimos inscribirte. Intenta de nuevo."));
    }
  };

  // Tras entrar con Google, el envío sigue solo
  useEffect(() => {
    if (!isAuthenticated) return;
    setShowAuth(false);
    if (pendingSubmit.current) {
      pendingSubmit.current = false;
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim().length < 3) return setError("Escribe tu nombre completo.");
    if (phone.replace(/\D/g, "").length < 7)
      return setError("Ingresa un celular válido.");
    if (!instagram.trim()) return setError("Escribe tu usuario de Instagram.");
    if (!adult)
      return setError(`El concurso es solo para mayores de ${contest.min_age} años.`);
    setError("");
    if (!isAuthenticated) {
      pendingSubmit.current = true;
      setLoginOnly(false);
      setShowAuth(true);
      return;
    }
    doSubmit();
  };

  const [askCancel, setAskCancel] = useState(false);
  const handleCancel = () => setAskCancel(true);
  const confirmCancel = async () => {
    try {
      await cancel.mutateAsync();
    } catch (e) {
      setError(errorMessage(e, "No pudimos cancelar tu inscripción."));
    }
    setAskCancel(false);
  };

  const canRegister = contest?.registrations_open && !entry;

  return (
    <div className="theme-concurso cz-ground min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[var(--cz-ink)]">
        <div className="max-w-lg lg:max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="cz-muted grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] transition-colors hover:text-[var(--cz-bone)]"
            aria-label="Volver a la carta"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="cz-hand flex-1 text-lg uppercase">Concurso</h1>
          {isAuthenticated && (
            <>
              <Link
                to="/mi-cuenta"
                aria-label="Mi cuenta"
                className="grid place-items-center rounded-full ring-1 ring-white/15 transition-all hover:ring-white/35"
              >
                <CustomerAvatar customer={customer} className="w-8 h-8 text-sm" />
              </Link>
              {confirmLogout ? (
                <span className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      await logout();
                      // Recarga para empezar limpio: sin la inscripción de la
                      // sesión anterior en caché y con el formulario de nuevo
                      window.location.reload();
                    }}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[0.75rem] font-bold text-red-300"
                  >
                    Sí, salir
                  </button>
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="cz-muted px-1.5 py-1.5 text-[0.75rem]"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="cz-muted flex items-center gap-1.5 rounded-full border border-white/[0.12] px-3 py-1.5 text-[0.75rem] transition-colors hover:text-[var(--cz-bone)]"
                >
                  <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="py-24 grid place-items-center">
          <Loader2 className="cz-muted h-7 w-7 animate-spin" />
        </div>
      ) : isError || !contest ? (
        <NoContest />
      ) : (
        <>
          <ConcursoPoster
            contest={contest}
            cta={
              canRegister ? (
                <a href="#inscripcion" onClick={scrollTo("inscripcion")} className="cz-cta">
                  Inscríbete aquí <ArrowDown size={20} strokeWidth={2.5} />
                </a>
              ) : entry ? (
                <a href="#inscripcion" onClick={scrollTo("inscripcion")} className="cz-cta cz-cta--toxic">
                  Mi inscripción #{entry.number} <ArrowDown size={20} strokeWidth={2.5} />
                </a>
              ) : null
            }
          />

          {/* Escritorio: cómo participar a la izquierda y el formulario (o
              tu inscripción) a la derecha, en vez de una columna angosta */}
          <main className="max-w-lg mx-auto px-4 grid gap-5 lg:mt-6 lg:max-w-5xl lg:grid-cols-[5fr_6fr] lg:items-start lg:gap-8">
            {contest.description && (
              <p className="cz-muted text-center text-[0.88rem] leading-relaxed lg:col-span-2 lg:mx-auto lg:max-w-2xl lg:text-base">
                {contest.description}
              </p>
            )}

            <div className="lg:sticky lg:top-20">
              <HowTo contest={contest} />
            </div>

            <div id="inscripcion" className="scroll-mt-20">
              {isAuthenticated && entryLoading ? (
                <div className="py-10 grid place-items-center">
                  <Loader2 className="cz-muted h-6 w-6 animate-spin" />
                </div>
              ) : entry ? (
                <EntryStatus
                  entry={entry}
                  contest={contest}
                  onCancel={handleCancel}
                  cancelling={cancel.isPending}
                  error={error}
                />
              ) : !contest.registrations_open ? (
                <div className="cz-panel cz-panel--scream text-center">
                  <p className="cz-hand cz-blood text-xl uppercase">Inscripciones cerradas</p>
                  <p className="cz-muted mt-2 text-[0.82rem]">Vuelve pronto: te avisamos por Instagram.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="cz-panel cz-form" noValidate>
                  <div className="cz-form__head">
                    <p className="cz-label">Formulario de inscripción</p>
                    <h2 className="cz-heading mt-1 text-3xl">Inscríbete</h2>
                    <p className="mt-2 max-w-[16rem] text-[0.85rem] leading-snug">
                      Llénalo en un minuto. El pago de {money(contest.entry_fee)} lo haces en la barra.
                    </p>
                  </div>

                  <div className="cz-form__body">
                    <Field label="Nombre completo" htmlFor="cz-name">
                      <input
                        id="cz-name"
                        className="cz-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Como aparece en tu cédula"
                      />
                    </Field>
                    <Field label="Celular" htmlFor="cz-phone">
                      <input
                        id="cz-phone"
                        className="cz-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="300 123 4567"
                      />
                    </Field>
                    <Field label="Tu usuario de Instagram" htmlFor="cz-ig">
                      <input
                        id="cz-ig"
                        className="cz-input"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="@tu.usuario"
                      />
                    </Field>
                    <Field label="¿De qué vienes disfrazado?" hint="Opcional" htmlFor="cz-costume">
                      <input
                        id="cz-costume"
                        className="cz-input"
                        value={costume}
                        onChange={(e) => setCostume(e.target.value)}
                        maxLength={120}
                        placeholder="Puedes dejarlo en secreto"
                      />
                    </Field>

                    <label className="cz-consent text-[0.88rem] leading-relaxed">
                      <input
                        type="checkbox"
                        checked={adult}
                        onChange={(e) => setAdult(e.target.checked)}
                        className="cz-check mt-0.5 h-5 w-5 flex-shrink-0"
                      />
                      <span>
                        Soy mayor de {contest.min_age} años. Sé que en la barra me
                        pedirán la cédula para confirmarlo.
                      </span>
                    </label>

                    {error && (
                      <p className="cz-blood text-[0.88rem]" role="alert">{error}</p>
                    )}

                    <button type="submit" disabled={register.isPending} className="cz-cta cz-cta--block mt-1">
                      {register.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : null}
                      {isAuthenticated ? "Inscribirme" : "Inscribirme con Google"}
                      {!register.isPending && <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
                    </button>
                    <p className="cz-muted -mt-1 text-center text-[0.78rem]">
                      Queda pendiente hasta que pagues {money(contest.entry_fee)} en la barra.
                    </p>
                    {!isAuthenticated && (
                      <p className="border-t border-white/10 pt-4 text-center text-[0.88rem]">
                        ¿Ya te inscribiste?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            // Solo entrar: sin envío pendiente. Al volver con
                            // sesión, si hay inscripción se muestra sola.
                            pendingSubmit.current = false;
                            setLoginOnly(true);
                            setShowAuth(true);
                          }}
                          className="cz-ok font-semibold underline underline-offset-4"
                        >
                          Inicia sesión
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </main>
        </>
      )}

      <ConfirmDialog
        open={askCancel}
        title="¿Cancelar tu inscripción?"
        message="Pierdes tu número. Si cambias de opinión, puedes volver a inscribirte mientras las inscripciones sigan abiertas."
        confirmLabel="Sí, cancelar"
        cancelLabel="No"
        tone="danger"
        icon={XCircle}
        loading={cancel.isPending}
        onConfirm={confirmCancel}
        onCancel={() => setAskCancel(false)}
      />

      <CustomerAuthGate
        open={showAuth}
        onClose={() => {
          setShowAuth(false);
          pendingSubmit.current = false;
        }}
        onAuthenticated={() => {}}
        title={loginOnly ? "Entra con tu cuenta de Google" : "Entra con Google para inscribirte"}
        description={
          loginOnly
            ? "Usa la misma cuenta con la que te inscribiste y verás tu número y lo que te falta."
            : "Tu inscripción queda en tu cuenta: ahí ves si ya confirmamos tu pago y tu Instagram."
        }
      />
    </div>
  );
};

/* ------------------------------------------------------- subcomponentes -- */

const HowTo = ({ contest }) => (
  <section className="cz-panel cz-panel--ghost">
    <h2 className="cz-heading mb-4">Cómo participar</h2>
    <ol className="grid gap-3.5 text-[0.86rem] leading-relaxed">
      <Step n={1}>Inscríbete aquí con tu cuenta de Google.</Step>
      <Step n={2}>
        Paga <strong className="cz-blood">{money(contest.entry_fee)}</strong> en
        la barra de Frostbyte. Lleva tu cédula.
      </Step>
      {contest.requires_instagram_follow && (
        <Step n={3}>
          Síguenos en Instagram{" "}
          <a
            href={SOCIAL.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cz-ok font-semibold underline underline-offset-2"
          >
            {SOCIAL.instagram.handle}
          </a>
          .
        </Step>
      )}
    </ol>
    <p className="cz-hand cz-ok mt-4 text-base uppercase">
      Con todo listo, quedas confirmado.
    </p>
  </section>
);

const Step = ({ n, children }) => (
  <li className="flex items-start gap-3">
    <span className="cz-step-n">{n}</span>
    <span className="pt-1">{children}</span>
  </li>
);

const Field = ({ label, hint, htmlFor, children }) => (
  <div className="grid gap-1.5">
    <label htmlFor={htmlFor} className="cz-label">
      {label}
      {hint && <span className="cz-muted ml-2 font-sans text-[0.72rem] normal-case">{hint}</span>}
    </label>
    {children}
  </div>
);

const EntryStatus = ({ entry, contest, onCancel, cancelling, error }) => {
  const confirmed = entry.status === "confirmed";
  const checks = [
    { done: true, text: "Inscripción con tu cuenta de Google" },
    {
      done: entry.paid,
      text: entry.paid
        ? "Pago recibido en la barra"
        : `Pago de ${money(contest.entry_fee)} en la barra`,
    },
    contest.requires_instagram_follow && {
      done: entry.follows_instagram,
      text: entry.follows_instagram
        ? `Nos sigues en Instagram (@${entry.instagram_handle})`
        : `Seguir a ${SOCIAL.instagram.handle} desde @${entry.instagram_handle}`,
    },
  ].filter(Boolean);

  return (
    <section className="cz-panel cz-panel--scream">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="cz-label">Tu inscripción</p>
          <p className={`cz-hand mt-1 text-2xl uppercase ${confirmed ? "cz-ok" : ""}`}>
            {confirmed ? "¡Estás dentro!" : "Casi listo"}
          </p>
        </div>
        <span className="cz-number" aria-label={`Número ${entry.number}`}>
          #{entry.number}
        </span>
      </div>

      <ul className="mt-4 grid gap-2.5">
        {checks.map(({ done, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-[0.86rem]">
            {done ? (
              <CheckCircle2 className="cz-ok mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <Circle className="cz-muted mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <span className={done ? "" : "cz-muted"}>{text}</span>
          </li>
        ))}
      </ul>

      {!entry.paid && (
        <p className="cz-muted mt-4 border-t border-white/10 pt-4 text-[0.8rem] leading-relaxed">
          En la barra di tu número,{" "}
          <strong className="cz-blood">#{entry.number}</strong>, y muestra tu
          cédula. {contest.payment_instructions}
        </p>
      )}

      {contest.requires_instagram_follow && !entry.follows_instagram && (
        <div className="mt-5 text-center">
          <a
            href={SOCIAL.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cz-cta cz-cta--toxic"
          >
            <Instagram className="h-5 w-5" /> Seguir a {SOCIAL.instagram.handle}
          </a>
        </div>
      )}

      {error && <p className="cz-blood mt-3 text-[0.82rem]" role="alert">{error}</p>}

      {!entry.paid && (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="cz-muted mt-5 w-full text-center text-[0.75rem] underline-offset-2 hover:underline disabled:opacity-40"
        >
          Cancelar mi inscripción
        </button>
      )}
    </section>
  );
};

const NoContest = () => (
  <div className="py-24 text-center px-4">
    <p className="cz-hand text-2xl uppercase">Sin concursos por ahora</p>
    <p className="cz-muted mt-2 text-sm">Cuando haya uno, lo anunciamos en la carta.</p>
    <Link to="/" className="cz-cta mt-8">Volver a la carta</Link>
  </div>
);

export default ContestPage;
