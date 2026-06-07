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
import { MundialColorField, EmblemaMundial } from "@/components/mundial/Sistema26";

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

const STEPS = [
  {
    icon: Smartphone,
    title: "Entra gratis",
    desc: "Escanea el código con la cámara de tu celular y entra con tu cuenta de Google. Sin pagar, sin contraseñas.",
    block: "bg-blue-600",
  },
  {
    icon: Target,
    title: "Predice los partidos",
    desc: "Antes de cada partido del Mundial dices el marcador que crees que va a quedar.",
    block: "bg-red-600",
  },
  {
    icon: Trophy,
    title: "Acierta y gana",
    desc: "Cada acierto suma puntos. Quien más acumule se lleva los $500.000 en efectivo.",
    block: "bg-grass",
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
    <div className="theme-26 relative flex h-screen flex-col overflow-x-hidden overflow-y-auto bg-dark text-light">
      <Helmet>
        <title>Gana $500.000 gratis en el Mundial 2026 | Frostbyte</title>
        <meta
          name="description"
          content="Predice los partidos del Mundial 2026 en Frostbyte y gana $500.000 en efectivo. Participar es totalmente gratis: entra con tu cuenta de Google y empieza a sumar puntos."
        />
      </Helmet>

      {/* Campo de color estilo póster del Mundial */}
      <MundialColorField scrim="left" />

      {/* Marca / nav minimal */}
      <header className="relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            <img
              src="/logo.png"
              alt="Frostbyte"
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
            />
            <span className="t26-display text-xl font-black tracking-[0.16em] text-light sm:text-2xl">
              FROSTBYTE
            </span>
          </Link>
          <EmblemaMundial className="h-11 p-1.5" />
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
          {/* Lockup de marca: deja claro que la polla es de Frostbyte */}
          <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
            <img
              src="/logo.png"
              alt="Frostbyte"
              width={64}
              height={64}
              loading="eager"
              className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
            />
            <span className="t26-display text-[clamp(1.75rem,5vw,3.75rem)] font-black uppercase leading-none tracking-[0.1em] text-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Frostbyte
            </span>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold sm:text-sm">
            <Gift size={15} />
            100% Gratis · Mundial 2026
          </span>

          <h1 className="mt-4 leading-[0.9] tracking-tight">
            <span className="block text-[clamp(1.5rem,4.5vw,4rem)] font-black uppercase text-light">
              Gánate
            </span>
            <span className="t26-num block whitespace-nowrap text-[clamp(2.75rem,9vw,11rem)] text-gold drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]">
              $500.000
            </span>
            <span className="mt-1 block text-[clamp(1.1rem,3.2vw,2.75rem)] font-black uppercase text-light">
              en el Mundial
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-light/80 sm:text-lg lg:mx-0">
            Predice los marcadores de los partidos del Mundial 2026 en{" "}
            <span className="font-semibold text-secondary">Frostbyte</span>.
            Entrar es totalmente gratis y el que más le atine se lleva{" "}
            <span className="font-semibold text-gold">
              medio millón de pesos en efectivo
            </span>
            .
          </p>

          {/* Pasos */}
          <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3 lg:mx-0">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="liquid-glass-light relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 text-left"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${step.block}`}
                  >
                    <span className="t26-num text-base leading-none">
                      {i + 1}
                    </span>
                  </span>
                  <step.icon size={18} className="text-secondary/80" />
                </div>
                <h2 className="text-sm font-bold text-light">{step.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-light/70">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Urgencia */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-grass/50 bg-grass/15 px-4 py-2 text-sm font-bold text-grass sm:text-base">
              <CalendarClock size={18} />
              {live
                ? "¡El Mundial ya arrancó!"
                : `Faltan ${days} días para el Mundial`}
            </span>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-light/60 lg:justify-start">
            <BadgeCheck size={14} className="text-grass" />
            Participar es 100% gratis · Un solo ganador · Premio en efectivo
          </p>
        </motion.div>

        {/* ── Flyer oficial: emblema + QR en tarjeta blanca ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-2xl shadow-black/50 sm:p-7">
            {/* Emblema oficial (su fondo blanco se funde con la tarjeta) */}
            <img
              src="/mundial/emblema.webp"
              alt="FIFA Mundial 2026"
              loading="eager"
              decoding="async"
              className="mx-auto h-24 w-auto select-none object-contain sm:h-28"
            />

            <div className="my-4 h-px bg-black/10" />

            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-dark">
              <ScanLine size={15} className="text-red-600" />
              Escanea y juega gratis
            </span>

            {/* QR (alto contraste para lectura fiable en TV) */}
            <div className="mx-auto mt-4 w-full max-w-[280px]">
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

            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-dark">
              <Smartphone size={16} className="text-red-600" />
              Apunta la cámara de tu celular al código
            </p>
            <p className="mt-1 text-xs text-dark/60">
              o entra a{" "}
              <span className="font-bold text-red-600">
                frostbyte.com.co/polla-mundial
              </span>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MundialPromoPage;
