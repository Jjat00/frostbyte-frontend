import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { QRCodeSVG } from "qrcode.react";
import {
  Trophy,
  Gift,
  Target,
  ScanLine,
  CalendarClock,
  Smartphone,
  BadgeCheck,
} from "lucide-react";
import { usePollaTournament } from "@/hooks/usePolla";

// Pitazo inicial del Mundial 2026 (respaldo si el backend aún no responde;
// la hora real llega desde el torneo vía usePollaTournament).
const KICKOFF_FALLBACK = new Date("2026-06-11T14:00:00-05:00");

// URL absoluta a la página donde el cliente inicia sesión y queda inscrito.
// En producción usamos siempre el dominio canónico para que el QR funcione al
// escanearlo desde cualquier celular; en desarrollo, el origin local para poder
// probar el flujo completo. `?login=1` abre el login de Google al instante, así
// el QR lleva directo a participar.
const ORIGIN = import.meta.env.PROD
  ? "https://frostbyte.com.co"
  : window.location.origin;
const JOIN_PATH = "/polla-mundial?login=1";
const JOIN_URL = `${ORIGIN}${JOIN_PATH}`;

const FLAGS = ["🇦🇷", "🇧🇷", "🇨🇴", "🇫🇷", "🇪🇸", "🇩🇪", "🇲🇽", "🇵🇹", "🇺🇾", "🇳🇱"];

const STEPS = [
  {
    icon: Smartphone,
    title: "Entra gratis",
    desc: "Escanea el código con la cámara de tu celular y entra con tu cuenta de Google. Sin pagar, sin contraseñas.",
  },
  {
    icon: Target,
    title: "Predice los partidos",
    desc: "Antes de cada partido del Mundial dices el marcador que crees que va a quedar.",
  },
  {
    icon: Trophy,
    title: "Acierta y gana",
    desc: "Cada acierto suma puntos. Quien más acumule se lleva los $500.000 en efectivo.",
  },
];

const useCountdownDays = (target) => {
  const targetMs = target ? target.getTime() : null;
  const compute = () => {
    if (targetMs == null) return { days: 0, live: false };
    const diff = targetMs - Date.now();
    if (diff <= 0) return { days: 0, live: true };
    return { days: Math.ceil(diff / 86400000), live: false };
  };
  const [state, setState] = useState(compute);
  useEffect(() => {
    setState(compute());
    const id = setInterval(() => setState(compute()), 60000);
    return () => clearInterval(id);
  }, [targetMs]);
  return state;
};

const MundialPromoPage = () => {
  const { data: tournament } = usePollaTournament();
  const kickoff = tournament?.kickoff
    ? new Date(tournament.kickoff)
    : KICKOFF_FALLBACK;
  const { days, live } = useCountdownDays(kickoff);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-dark text-light">
      <Helmet>
        <title>Gana $500.000 gratis en el Mundial | Frostbyte</title>
        <meta
          name="description"
          content="Predice los partidos del Mundial 2026 en Frostbyte y gana $500.000 en efectivo. Participar es totalmente gratis: entra con tu cuenta de Google y empieza a sumar puntos."
        />
      </Helmet>

      {/* Glows de fondo (estáticos para no recalentar GPUs móviles) */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-10 -left-10 h-96 w-96 rounded-full bg-primary blur-[130px]" />
        <div className="absolute -bottom-10 -right-10 h-96 w-96 rounded-full bg-secondary blur-[130px]" />
      </div>

      {/* Banderas flotantes (solo en pantallas grandes / cartel) */}
      <div className="pointer-events-none absolute inset-0 hidden select-none md:block">
        {FLAGS.map((flag, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-15 lg:text-5xl"
            style={{
              left: `${(i * 9.7 + 3) % 92}%`,
              top: `${((i * 41) % 78) + 6}%`,
            }}
            animate={{ y: [0, -16, 0] }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {flag}
          </motion.span>
        ))}
      </div>

      {/* Marca / nav minimal */}
      <header className="relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="text-sm font-black tracking-[0.3em] text-light transition-colors hover:text-primary"
          >
            FROSTBYTE
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">
            <Trophy size={13} />
            Mundial 2026
          </span>
        </div>
      </header>

      {/* Contenido principal: cartel a pantalla completa (TV), sin scroll */}
      <main className="container relative z-10 mx-auto grid flex-1 content-center items-center gap-8 px-4 py-4 lg:grid-cols-2 lg:gap-12 lg:py-0">
        {/* ── Pitch ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary sm:text-sm">
            <Gift size={15} />
            100% Gratis
          </span>

          <h1 className="mt-5 font-black leading-[0.95] tracking-tight">
            <span className="block text-[clamp(1.6rem,4.5vw,2.75rem)] text-light">
              Gánate
            </span>
            <span className="block whitespace-nowrap text-[clamp(2.4rem,6.5vw,4.25rem)] tabular-nums tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              $500.000
            </span>
            <span className="mt-1 block text-[clamp(1.1rem,3.5vw,2rem)] font-bold text-light">
              en el Mundial
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray sm:text-lg lg:mx-0">
            Predice los marcadores de los partidos del Mundial 2026 en{" "}
            <span className="font-semibold text-light">Frostbyte</span>. Entrar es
            totalmente gratis y el que más le atine se lleva{" "}
            <span className="font-semibold text-secondary">
              medio millón de pesos en efectivo
            </span>
            .
          </p>

          {/* Pasos */}
          <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3 lg:mx-0">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="liquid-glass-light relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 text-left"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 text-primary">
                    <step.icon size={17} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-light">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Urgencia */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary sm:text-base">
              <CalendarClock size={18} />
              {live
                ? "¡El Mundial ya arrancó!"
                : `Faltan ${days} días para el Mundial`}
            </span>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray/70 lg:justify-start">
            <BadgeCheck size={14} className="text-secondary" />
            Participar es 100% gratis · Un solo ganador · Premio en efectivo
          </p>
        </motion.div>

        {/* ── Panel del QR ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="liquid-glass relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-primary/30 p-7 text-center sm:p-9">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                <ScanLine size={15} />
                Escanea para participar
              </span>

              {/* QR (fondo blanco + quiet zone para lectura fiable) */}
              <div className="mx-auto mt-5 w-full max-w-[300px] rounded-3xl bg-white p-5 shadow-xl shadow-black/30">
                <QRCodeSVG
                  value={JOIN_URL}
                  size={320}
                  level="M"
                  marginSize={1}
                  bgColor="#ffffff"
                  fgColor="#0a0b14"
                  title="Escanea para participar gratis en el Mundial de Frostbyte"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-light">
                <Smartphone size={16} className="text-secondary" />
                Apunta la cámara de tu celular al código
              </p>
              <p className="mt-2 text-xs text-gray">
                o entra a{" "}
                <span className="font-semibold text-secondary">
                  frostbyte.com.co/polla-mundial
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MundialPromoPage;
