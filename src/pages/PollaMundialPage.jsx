import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Trophy,
  Target,
  CalendarClock,
  Lock,
  Users,
  Sparkles,
  CircleDot,
  ChevronRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  ListChecks,
  LogOut,
  Check,
  Swords,
  Crown,
  Award,
  TrendingUp,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { usePollaTournament } from "@/hooks/usePolla";
import {
  MatchCardPreview,
  BracketPreview,
  GroupTablePreview,
  RankingPreview,
} from "@/pages/polla/LandingPreviews";
import {
  MundialColorField,
  EmblemaMundial,
  TrofeoMundial,
  Big26,
} from "@/components/mundial/Sistema26";
import { GruposDraw } from "@/components/mundial/GruposDraw";

// Pitazo inicial del Mundial 2026 (respaldo si el backend aun no responde;
// la hora real llega desde el torneo via usePollaTournament).
const KICKOFF_FALLBACK = new Date("2026-06-11T14:00:00-05:00");

// Paleta multicolor del Mundial 2026 (rota por tarjeta para dar el look vibrante
// estilo afiche, en vez del magenta/cyan de Frostbyte).
const ACCENTS = [
  "text-red-400",
  "text-red-400",
  "text-green-400",
  "text-gold",
  "text-secondary",
  "text-blue-400",
];
const CHIPS = [
  "bg-red-500/15 border-red-500/40",
  "bg-red-500/15 border-red-500/40",
  "bg-grass/15 border-grass/40",
  "bg-gold/15 border-gold/40",
  "bg-secondary/15 border-secondary/40",
  "bg-blue-500/15 border-blue-500/40",
];
const SOLIDS = [
  "bg-red-500",
  "bg-red-500",
  "bg-grass",
  "bg-gold",
  "bg-secondary",
  "bg-blue-500",
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

const Section = ({ children, className }) => (
  <motion.section
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.08 }}
    variants={fadeUp}
    className={cn("relative container mx-auto px-4 py-16 sm:py-24", className)}
  >
    {children}
  </motion.section>
);

const SectionTitle = ({ kicker, title, subtitle }) => (
  <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
    {kicker && (
      <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
        {kicker}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-light leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-gray text-base sm:text-lg mt-4 leading-relaxed">
        {subtitle}
      </p>
    )}
  </motion.div>
);

const useCountdown = (target) => {
  const targetMs = target ? target.getTime() : null;
  const compute = () => {
    if (targetMs == null)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, live: false };
    const diff = targetMs - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, live: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      live: false,
    };
  };
  const [time, setTime] = useState(compute);
  // Recalcula al montar y cada vez que cambie el kickoff (p. ej. al llegar del backend).
  useEffect(() => {
    setTime(compute());
    const id = setInterval(() => setTime(compute()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return time;
};

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="liquid-glass relative overflow-hidden min-w-[62px] sm:min-w-[88px] px-2.5 sm:px-3 py-3 sm:py-4 rounded-2xl border border-gold/30">
      <span className="t26-num block text-3xl sm:text-5xl text-gold">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray mt-2">
      {label}
    </span>
  </div>
);

const STEPS = [
  {
    icon: Users,
    title: "1. Entra en un toque",
    desc: "Entras con tu cuenta de Google, sin contraseñas ni formularios eternos. Quedas registrado en la Polla Mundialista al instante.",
  },
  {
    icon: Target,
    title: "2. Pronostica los marcadores",
    desc: "Antes de cada partido dices el marcador exacto que crees que va a quedar. Ejemplo: Colombia 2 - 1 Brasil.",
  },
  {
    icon: Swords,
    title: "3. Arma tu eliminación",
    desc: "Cuando terminan los grupos, la llave se arma con los clasificados reales y eliges quién avanza hasta tu campeón.",
  },
  {
    icon: Lock,
    title: "4. Cierre al pitazo inicial",
    desc: "Cuando arranca el partido tus pronósticos se bloquean. No se edita después: el que madruga, juega.",
  },
  {
    icon: Sparkles,
    title: "5. Suma por varias vías",
    desc: "Marcadores, avance en la eliminación, menciones del torneo y misiones: todo suma a tu puntaje, automáticamente.",
  },
  {
    icon: Trophy,
    title: "6. Escala y gana el premio",
    desc: "Una tabla en vivo muestra quién va ganando. Quien más puntos acumule al final se corona y se lleva el premio.",
  },
];

const SCORING = [
  {
    points: "3",
    icon: Flame,
    title: "Marcador exacto",
    desc: "Acertaste el resultado clavado. Dijiste 2-1 y quedó 2-1.",
    accent: "from-gold to-grass",
    iconColor: "text-gold",
    highlight: true,
  },
  {
    points: "1",
    icon: Target,
    title: "Resultado correcto",
    desc: "Acertaste quién gana o el empate, pero no el marcador exacto.",
    accent: "from-secondary to-blue-500",
    iconColor: "text-secondary",
  },
  {
    points: "0",
    icon: CircleDot,
    title: "Resultado incorrecto",
    desc: "Cero puntos, pero siempre queda el próximo partido para remontar.",
    accent: "from-gray/40 to-gray/10",
    iconColor: "text-gray",
  },
];

const RULES = [
  {
    icon: Lock,
    title: "Cierre justo y parejo",
    desc: "Los pronósticos se cierran automáticamente al pitazo inicial. Nadie puede pronosticar con el partido empezado.",
  },
  {
    icon: ShieldCheck,
    title: "Una cuenta por persona",
    desc: "El acceso es con Google, así cada jugador tiene una sola identidad y la tabla es limpia.",
  },
  {
    icon: CalendarClock,
    title: "Resultados oficiales",
    desc: "Los marcadores se traen automáticamente de los datos oficiales de cada partido. Sin discusiones.",
  },
  {
    icon: ListChecks,
    title: "Cuenta todo el Mundial",
    desc: "Grupos, eliminación, menciones y misiones: hay varias formas de sumar de principio a fin.",
  },
];

// Otras vías de puntos además del marcador
const EXTRA_POINTS = [
  {
    icon: TrendingUp,
    title: "Avance en la eliminación",
    desc: "Arma tu llave y acierta quién pasa cada ronda. Suma desde +2 por cruce y hasta +20 por coronar a tu campeón.",
  },
  {
    icon: Award,
    title: "Menciones del torneo",
    desc: "Tus apuestas grandes: campeón, subcampeón, goleador y más. Si le atinas, suman al final.",
  },
  {
    icon: ListChecks,
    title: "Misiones",
    desc: "Retos que dan puntos extra: completa tus pronósticos, encadena aciertos y más.",
  },
];

// Cómo funciona el bracket de eliminación (con los clasificados reales)
const BRACKET_STEPS = [
  {
    icon: Target,
    title: "Termina la fase de grupos",
    desc: "Al cerrarse los grupos del Mundial ya se conocen las 32 selecciones que avanzan a la eliminación.",
  },
  {
    icon: GitBranch,
    title: "Se abre la llave real",
    desc: "Tu bracket se arma con los clasificados reales: todos parten de los mismos equipos verdaderos.",
  },
  {
    icon: Swords,
    title: "Eliges quién avanza",
    desc: "Ronda por ronda decides quién pasa. Si tu elegido cae, la llave se reconecta con el que avanzó de verdad.",
  },
  {
    icon: Crown,
    title: "Hasta tu campeón",
    desc: "Sigues hasta coronar al que crees que levanta la copa. Acertar el avance suma más en cada ronda.",
  },
];

const PollaMundialPage = () => {
  const { data: tournament } = usePollaTournament();
  const kickoff = tournament?.kickoff
    ? new Date(tournament.kickoff)
    : KICKOFF_FALLBACK;
  const t = useCountdown(kickoff);
  const heroRef = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const customer = useCustomerAuthStore((s) => s.customer);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const logout = useCustomerAuthStore((s) => s.logout);

  // Llegando desde el QR / anuncio (?login=1): abrir el login de Google de una.
  useEffect(() => {
    if (!isAuthenticated && searchParams.get("login") === "1") {
      setAuthOpen(true);
    }
  }, [isAuthenticated, searchParams]);

  const firstName =
    customer?.first_name || customer?.full_name?.split(" ")[0] || "crack";

  const POLLA_BENEFITS = [
    "Quedas inscrito en la Polla Mundialista",
    "Te avisamos cuando abran los pronósticos",
    "Sin contraseñas: entras con tu cuenta de Google",
  ];

  // Cuando el cliente inicia sesión, la app de la Polla vive en sus propias
  // rutas (/partidos, /grupos, …). El landing es solo para quien no ha entrado.
  if (isAuthenticated) {
    return <Navigate to="/partidos" replace />;
  }

  return (
    <div className="theme-26 min-h-screen bg-dark text-light overflow-x-hidden">
      <Helmet>
        <title>Polla Mundialista 2026 | Frostbyte</title>
        <meta
          name="description"
          content="Participa en la Polla Mundialista de Frostbyte: pronostica los marcadores del Mundial 2026, arma tu bracket de eliminación, suma con menciones y misiones, y gana $500.000. Pronostica, acierta y corónate campeón."
        />
      </Helmet>

      {/* Nav minimal */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-dark/60 border-b border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md text-sm font-bold tracking-widest text-light transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            <ArrowLeft size={18} />
            FROSTBYTE
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {customer?.avatar_url ? (
                <img loading="lazy" decoding="async"
                  src={customer.avatar_url}
                  alt={firstName}
                  className="h-8 w-8 rounded-full border border-gold/40 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-grass to-secondary text-sm font-bold text-dark">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden text-sm font-semibold text-light sm:inline">
                {firstName}
              </span>
              <button
                onClick={logout}
                aria-label="Cerrar sesión"
                className="rounded-full p-1.5 text-gray transition-colors hover:bg-white/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-grass to-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-dark shadow-lg shadow-grass/30 transition-transform hover:scale-105"
            >
              <Trophy size={14} />
              Empezar a jugar
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        {/* Campo de color estilo póster del Mundial */}
        <MundialColorField scrim="full" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="flex justify-center">
              <EmblemaMundial className="h-24 sm:h-28" loading="eager" />
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/40 rounded-full text-gold text-xs sm:text-sm font-bold tracking-wider">
              <Trophy size={16} />
              MUNDIAL 2026 · FROSTBYTE
            </span>

            <h1 className="text-[clamp(2.2rem,8.5vw,5.25rem)] font-black leading-[1.02] pb-[0.08em]">
              <span className="block text-light">POLLA</span>
              <span className="block text-gold">
                MUNDIALISTA
              </span>
            </h1>

            <p className="text-gray text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Pronostica los marcadores, arma tu camino al campeón y suma puntos
              con cada acierto. El que mejor lea el Mundial se corona y se lleva
              el premio.
            </p>

            {/* Premio destacado en el hero (visible sin scroll) */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-4 sm:gap-5 rounded-2xl border border-gold/40 bg-linear-to-r from-gold/10 via-dark-secondary/40 to-grass/10 px-6 py-4 sm:px-8 sm:py-5 backdrop-blur-sm shadow-xl shadow-gold/10">
                <Trophy className="text-gold shrink-0" size={40} />
                <div className="text-left">
                  <span className="block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gray font-bold">
                    Premio al campeón
                  </span>
                  <span className="t26-num block text-4xl text-gold sm:text-6xl leading-none">
                    $500.000
                  </span>
                  <span className="block text-sm sm:text-base font-semibold text-grass mt-0.5">
                    medio millón de pesos · en efectivo
                  </span>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold">
                {t.live ? "¡El balón ya rueda!" : "Faltan para el pitazo inicial"}
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-5">
                <CountdownUnit value={t.days} label="Días" />
                <CountdownUnit value={t.hours} label="Horas" />
                <CountdownUnit value={t.minutes} label="Min" />
                <CountdownUnit value={t.seconds} label="Seg" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {isAuthenticated ? (
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-grass/50 bg-grass/10 px-7 py-4 text-lg font-bold text-grass">
                  <Check size={20} />
                  ¡Estás dentro, {firstName}!
                </span>
              ) : (
                <Button
                  onClick={() => setAuthOpen(true)}
                  className="bg-linear-to-r from-grass to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-grass/50 transition-all duration-300"
                >
                  <Trophy size={20} className="mr-1" />
                  Empezar a jugar
                </Button>
              )}
              <Button
                onClick={() =>
                  document
                    .getElementById("como-funciona")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                variant="outline"
                className="border-2 border-gold/50 text-gold font-bold text-lg px-8 py-6 hover:bg-gold/10 transition-all duration-300"
              >
                Cómo funciona
                <ChevronRight size={20} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ¿QUÉ ES? */}
      <Section>
        <SectionTitle
          kicker="La dinámica"
          title="¿Qué es la Polla Mundialista?"
          subtitle="Una polla (o quiniela) es un juego de pronósticos: dices cómo crees que van a quedar los partidos del Mundial. Mientras más le atines a los marcadores, más puntos sumas. Es gratis, es entre todos, y solo hay un campeón."
        />
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Target, label: "Pronosticas", value: "Cada partido" },
            { icon: Sparkles, label: "Sumas puntos", value: "Por cada acierto" },
            { icon: Trophy, label: "Te coronas", value: "Campeón de la Polla" },
          ].map((item, i) => (
            <div
              key={i}
              className="liquid-glass relative overflow-hidden rounded-2xl p-6 text-center border border-white/[0.06]"
            >
              <item.icon
                className={cn("mx-auto mb-3", ACCENTS[i % ACCENTS.length])}
                size={28}
              />
              <p className="text-xs uppercase tracking-widest text-gray">
                {item.label}
              </p>
              <p className="text-lg font-bold text-light mt-1">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* LOS GRUPOS DEL MUNDIAL (sorteo oficial, recreado en código) */}
      <Section>
        <SectionTitle
          kicker="Sorteo oficial"
          title="Así quedaron los grupos del Mundial 2026"
          subtitle="Ya están definidos los 12 grupos. Colombia quedó en el Grupo K. En la polla pronosticas todos los partidos de la fase de grupos, partido por partido."
        />
        <motion.div variants={fadeUp} className="max-w-5xl mx-auto">
          <GruposDraw />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 py-2 font-bold text-gold">
              🇨🇴 Colombia · Grupo K
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-gray">
              48 selecciones · 12 grupos · 104 partidos
            </span>
          </div>
        </motion.div>
      </Section>

      {/* CÓMO FUNCIONA */}
      <Section className="bg-dark-secondary/30 max-w-none" >
        <div id="como-funciona" className="scroll-mt-24" />
        <SectionTitle
          kicker="Paso a paso"
          title="Cómo funciona"
          subtitle="De entrar a ganar en seis pasos. Sencillo para jugar, emocionante para competir."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="liquid-glass-interactive group relative overflow-hidden rounded-2xl p-6 border border-white/[0.06] hover:border-white/20 transition-colors"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center mb-4",
                  CHIPS[i % CHIPS.length],
                )}
              >
                <step.icon className={ACCENTS[i % ACCENTS.length]} size={22} />
              </div>
              <h3 className="text-lg font-bold text-light mb-2">{step.title}</h3>
              <p className="text-gray text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* SISTEMA DE PUNTOS */}
      <Section>
        <SectionTitle
          kicker="El que más acierte, gana"
          title="Sistema de puntos"
          subtitle="Acertar el marcador exacto vale más que solo el ganador. Y además sumas por avanzar en la eliminación, por tus menciones y por misiones."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {SCORING.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={cn(
                "relative rounded-2xl p-6 border overflow-hidden",
                s.highlight
                  ? "border-gold/50 liquid-glass"
                  : "border-white/[0.06] liquid-glass-light"
              )}
            >
              {s.highlight && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-gold text-dark font-bold px-2 py-0.5 rounded-full">
                  Máximo
                </span>
              )}
              <div
                className={cn("text-5xl font-black mb-3", s.iconColor)}
              >
                {s.points}
                <span className="text-base font-bold text-gray ml-1">pts</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={s.iconColor} size={18} />
                <h3 className="font-bold text-light">{s.title}</h3>
              </div>
              <p className="text-gray text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold text-light mb-5">
            Y suma por otras tres vías
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EXTRA_POINTS.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="liquid-glass-light relative overflow-hidden rounded-2xl p-6 border border-white/[0.06]"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl border flex items-center justify-center mb-4",
                    CHIPS[(i + 3) % CHIPS.length],
                  )}
                >
                  <s.icon className={ACCENTS[(i + 3) % ACCENTS.length]} size={20} />
                </div>
                <h3 className="font-bold text-light mb-2">{s.title}</h3>
                <p className="text-gray text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ASÍ SE VE TU PRONÓSTICO (vista real) */}
      <Section className="bg-dark-secondary/30">
        <SectionTitle
          kicker="Tal cual lo verás"
          title="Así se ve tu pronóstico"
          subtitle="Escribes tu marcador antes del partido y, al terminar, ves cuántos puntos sumaste. Marcador exacto: +3. Solo el resultado: +1."
        />
        <motion.div variants={fadeUp}>
          <MatchCardPreview />
        </motion.div>
      </Section>

      {/* CAMINO AL CAMPEÓN (BRACKET) */}
      <Section>
        <SectionTitle
          kicker="Lo nuevo"
          title="Arma tu camino al campeón"
          subtitle="Cuando termina la fase de grupos se abre la llave con los 32 clasificados reales: eliges quién avanza ronda a ronda y, si tu elegido cae, se reconecta con el que pasó de verdad. Nunca quedas fuera."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {BRACKET_STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="liquid-glass-interactive group relative overflow-hidden rounded-2xl p-6 border border-white/[0.06] hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-dark",
                    SOLIDS[i % SOLIDS.length],
                  )}
                >
                  {i + 1}
                </span>
                <step.icon className={ACCENTS[i % ACCENTS.length]} size={20} />
              </div>
              <h3 className="text-base font-bold text-light mb-2">{step.title}</h3>
              <p className="text-gray text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="mt-10">
          <BracketPreview />
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="text-center text-xs text-gray/70 mt-8 max-w-2xl mx-auto"
        >
          Acertar quién avanza suma aparte del marcador: más puntos mientras más
          avanzada la ronda, y el premio gordo por coronar a tu campeón.
        </motion.p>
      </Section>

      {/* GRUPOS Y POSICIONES (vista real) */}
      <Section className="bg-dark-secondary/30">
        <SectionTitle
          kicker="Las tablas"
          title="Grupos y posiciones"
          subtitle="Sigue los 12 grupos con las posiciones en vivo. Los 2 primeros de cada grupo (más los 8 mejores terceros) avanzan a la eliminación."
        />
        <motion.div variants={fadeUp}>
          <GroupTablePreview />
        </motion.div>
      </Section>

      {/* CLASIFICACIÓN (vista real) */}
      <Section>
        <SectionTitle
          kicker="La competencia"
          title="Clasificación general"
          subtitle="Una tabla en vivo con podio muestra quién va ganando durante todo el Mundial. Así se ve por dentro."
        />
        <motion.div variants={fadeUp}>
          <RankingPreview />
        </motion.div>
      </Section>

      {/* PREMIO */}
      <Section className="bg-dark-secondary/30">
        <motion.div
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center liquid-glass rounded-3xl p-10 sm:p-14 border border-gold/30 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold/20 rounded-full blur-3xl" />
          <Big26 className="pointer-events-none absolute -bottom-6 -left-2 text-[9rem] text-white/[0.05]" />
          {/* Halo oscuro detrás del trofeo: el mix-blend screen necesita fondo
              oscuro para fundir el negro de la imagen y que el trofeo "flote". */}
          <div className="relative mx-auto mb-4 w-fit">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#0a0b14_55%,transparent_72%)]" />
            <TrofeoMundial className="relative h-32 w-auto sm:h-40" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-light mb-3">
            El premio
          </h2>
          <p className="text-gray text-lg leading-relaxed mb-6">
            El campeón de la Polla Mundialista —quien más puntos acumule al
            final del Mundial— se lleva:
          </p>
          <div className="t26-num relative text-5xl text-gold sm:text-7xl leading-none">
            $500.000
          </div>
          <p className="text-grass text-lg font-semibold mt-3">
            medio millón de pesos
          </p>
          <span className="inline-block mt-6 text-xs uppercase tracking-[0.3em] text-gray font-semibold">
            En efectivo · Un solo ganador
          </span>
        </motion.div>
      </Section>

      {/* REGLAS CLAVE */}
      <Section>
        <SectionTitle
          kicker="Juego limpio"
          title="Reglas clave"
          subtitle="Para que todos compitan en igualdad de condiciones."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {RULES.map((rule, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex gap-4 liquid-glass-light relative overflow-hidden rounded-2xl p-6 border border-white/[0.06]"
            >
              <div
                className={cn(
                  "shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center",
                  CHIPS[i % CHIPS.length],
                )}
              >
                <rule.icon className={ACCENTS[i % ACCENTS.length]} size={20} />
              </div>
              <div>
                <h3 className="font-bold text-light mb-1">{rule.title}</h3>
                <p className="text-gray text-sm leading-relaxed">{rule.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section className="text-center">
        <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-light mb-4">
            ¿Listo para demostrar que sabes de fútbol?
          </h2>
          <p className="text-gray text-lg mb-8">
            {isAuthenticated
              ? "Ya estás inscrito en la Polla Mundialista. Te avisaremos apenas abran los pronósticos del primer partido."
              : "Entra gratis y prepárate para competir por el premio de la Polla Mundialista 2026."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-grass/50 bg-grass/10 px-8 py-4 text-lg font-bold text-grass">
                <Check size={20} />
                Ya estás jugando
              </span>
            ) : (
              <Button
                onClick={() => setAuthOpen(true)}
                className="bg-linear-to-r from-grass to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-grass/50 transition-all duration-300"
              >
                <Trophy size={20} className="mr-1" />
                Empezar a jugar
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="border-2 border-gold/50 text-gold font-bold text-lg px-8 py-6 hover:bg-gold/10 transition-all duration-300"
            >
              <a
                href="https://www.instagram.com/frostbyte.col/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Síguenos en Instagram
              </a>
            </Button>
          </div>
        </motion.div>
      </Section>

      <Footer />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Únete a la Polla"
        subtitle="Entra y compite por $500.000 en la Polla Mundialista."
        benefits={POLLA_BENEFITS}
      />
    </div>
  );
};

export default PollaMundialPage;
