import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Trophy,
  Target,
  CalendarClock,
  Lock,
  Users,
  Medal,
  Sparkles,
  CircleDot,
  ChevronRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

// Pitazo inicial del Mundial 2026
const KICKOFF = new Date("2026-06-11T18:00:00-05:00");

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
      <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
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
  const compute = () => {
    const diff = target.getTime() - Date.now();
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
  useEffect(() => {
    const id = setInterval(() => setTime(compute()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="liquid-glass min-w-[68px] sm:min-w-[88px] px-3 py-3 sm:py-4 rounded-2xl border border-primary/30">
      <span className="block text-3xl sm:text-5xl font-black bg-linear-to-b from-light to-secondary bg-clip-text text-transparent tabular-nums">
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
    title: "1. Inscríbete con Google",
    desc: "Entra con tu cuenta de Google en un toque. Sin contraseñas, sin formularios eternos. Quedas registrado en la Polla Mundialista.",
  },
  {
    icon: Target,
    title: "2. Pronostica cada partido",
    desc: "Antes de cada juego dices el marcador exacto que crees que va a quedar. Ejemplo: Colombia 2 - 1 Brasil.",
  },
  {
    icon: Lock,
    title: "3. Cierre al pitazo inicial",
    desc: "Cuando arranca el partido tus pronósticos se bloquean. No se puede editar después: el que madruga, juega.",
  },
  {
    icon: Sparkles,
    title: "4. Suma puntos automáticamente",
    desc: "Al terminar cada partido el sistema compara tu pronóstico con el resultado real y te asigna puntos al instante.",
  },
  {
    icon: Trophy,
    title: "5. Escala en la tabla",
    desc: "Una tabla de posiciones en vivo muestra quién va ganando durante todo el Mundial. La rivalidad está servida.",
  },
  {
    icon: Medal,
    title: "6. Gana el premio",
    desc: "Quien más puntos acumule al final del Mundial se corona campeón de la Polla y se lleva el premio.",
  },
];

const SCORING = [
  {
    points: "3",
    icon: Flame,
    title: "Marcador exacto",
    desc: "Acertaste el resultado clavado. Dijiste 2-1 y quedó 2-1.",
    accent: "from-primary to-secondary",
    highlight: true,
  },
  {
    points: "1",
    icon: Target,
    title: "Resultado correcto",
    desc: "Acertaste quién gana o el empate, pero no el marcador exacto.",
    accent: "from-secondary to-primary",
  },
  {
    points: "0",
    icon: CircleDot,
    title: "Resultado incorrecto",
    desc: "Cero puntos, pero siempre queda el próximo partido para remontar.",
    accent: "from-gray/40 to-gray/10",
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
    title: "Todos los partidos cuentan",
    desc: "Desde la fase de grupos hasta la gran final. Cada acierto te acerca al premio.",
  },
];

const FLAGS = ["🇦🇷", "🇧🇷", "🇨🇴", "🇫🇷", "🇪🇸", "🇩🇪", "🇲🇽", "🇵🇹", "🇺🇾", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🇳🇱", "🇺🇸"];

const PollaMundialPage = () => {
  const t = useCountdown(KICKOFF);
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-dark text-light overflow-x-hidden">
      <Helmet>
        <title>Polla Mundialista 2026 | Frostbyte</title>
        <meta
          name="description"
          content="Participa en la Polla Mundialista de Frostbyte: pronostica los marcadores del Mundial 2026, suma puntos y gana el premio. Pronostica, acierta y corónate campeón."
        />
      </Helmet>

      {/* Nav minimal */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-dark/60 border-b border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-light hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            FROSTBYTE
          </Link>
          <span className="hidden sm:inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Polla Mundialista 2026
          </span>
        </div>
      </nav>

      {/* HERO */}
      <header
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-24 left-8 w-96 h-96 bg-primary rounded-full filter blur-[130px] animate-pulse" />
          <div
            className="absolute bottom-16 right-8 w-96 h-96 bg-secondary rounded-full filter blur-[130px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Banderas flotantes de fondo */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {FLAGS.map((flag, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl sm:text-4xl opacity-20"
              style={{
                left: `${(i * 8.3 + 4) % 92}%`,
                top: `${(i * 37) % 80 + 8}%`,
              }}
              animate={{ y: [0, -14, 0] }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              {flag}
            </motion.span>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-xs sm:text-sm font-semibold tracking-wider">
              <Trophy size={16} />
              MUNDIAL 2026 · FROSTBYTE
            </span>

            <h1 className="text-[clamp(2.6rem,10vw,7rem)] font-black leading-[0.95] tracking-tight">
              <span className="block text-light">POLLA</span>
              <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                MUNDIALISTA
              </span>
            </h1>

            <p className="text-gray text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Pronostica los marcadores del Mundial, suma puntos con cada acierto
              y compite contra todo Frostbyte. El que mejor adivine se corona
              campeón y se lleva <span className="text-secondary font-semibold">$500.000</span>.
            </p>

            {/* Countdown */}
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
                {t.live ? "¡El balón ya rueda!" : "Faltan para el pitazo inicial"}
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <CountdownUnit value={t.days} label="Días" />
                <CountdownUnit value={t.hours} label="Horas" />
                <CountdownUnit value={t.minutes} label="Min" />
                <CountdownUnit value={t.seconds} label="Seg" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                onClick={() =>
                  document
                    .getElementById("como-funciona")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
              >
                Cómo funciona
                <ChevronRight size={20} className="ml-1" />
              </Button>
              <Button
                variant="outline"
                disabled
                className="border-2 border-primary/40 text-primary/80 font-bold text-lg px-8 py-6 cursor-not-allowed"
              >
                Inscripciones muy pronto
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
          className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Target, label: "Pronosticas", value: "Cada partido" },
            { icon: Sparkles, label: "Sumas puntos", value: "Por cada acierto" },
            { icon: Trophy, label: "Te coronas", value: "Campeón de la Polla" },
          ].map((item, i) => (
            <div
              key={i}
              className="liquid-glass rounded-2xl p-6 text-center border border-white/[0.06]"
            >
              <item.icon className="mx-auto text-primary mb-3" size={28} />
              <p className="text-xs uppercase tracking-widest text-gray">
                {item.label}
              </p>
              <p className="text-lg font-bold text-light mt-1">{item.value}</p>
            </div>
          ))}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="liquid-glass-interactive group rounded-2xl p-6 border border-white/[0.06] hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-4">
                <step.icon className="text-primary" size={22} />
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
          subtitle="Acertar el marcador exacto vale más que solo acertar al ganador. Así premia el riesgo y la buena lectura del partido."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {SCORING.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={cn(
                "relative rounded-2xl p-6 border overflow-hidden",
                s.highlight
                  ? "border-primary/50 liquid-glass"
                  : "border-white/[0.06] liquid-glass-light"
              )}
            >
              {s.highlight && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-primary text-dark font-bold px-2 py-0.5 rounded-full">
                  Máximo
                </span>
              )}
              <div
                className={cn(
                  "text-5xl font-black bg-linear-to-r bg-clip-text text-transparent mb-3",
                  s.accent
                )}
              >
                {s.points}
                <span className="text-base font-bold text-gray ml-1">pts</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="text-primary" size={18} />
                <h3 className="font-bold text-light">{s.title}</h3>
              </div>
              <p className="text-gray text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          variants={fadeUp}
          className="text-center text-xs text-gray/70 mt-8 max-w-2xl mx-auto"
        >
          * El puntaje final puede ajustarse antes del inicio del torneo. Las
          reglas exactas se confirmarán al abrir las inscripciones.
        </motion.p>
      </Section>

      {/* EJEMPLO PRÁCTICO */}
      <Section className="bg-dark-secondary/30">
        <SectionTitle
          kicker="Así se ven los puntos"
          title="Ejemplo práctico"
          subtitle="Partido: Argentina vs México. Pronosticaste 2-1 y el partido quedó 2-1: marcador exacto."
        />
        <motion.div
          variants={fadeUp}
          className="max-w-3xl mx-auto grid sm:grid-cols-[1fr_auto_1fr] items-center gap-5"
        >
          {/* Tu pronóstico */}
          <div className="liquid-glass rounded-2xl p-6 border border-primary/30 text-center">
            <p className="text-[11px] uppercase tracking-widest text-primary font-semibold mb-4">
              Tu pronóstico
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🇦🇷</span>
              <span className="text-3xl font-black text-light tabular-nums">
                2 - 1
              </span>
              <span className="text-3xl">🇲🇽</span>
            </div>
          </div>

          {/* VS */}
          <div className="text-center text-gray font-black text-lg">VS</div>

          {/* Resultado real */}
          <div className="liquid-glass rounded-2xl p-6 border border-secondary/30 text-center">
            <p className="text-[11px] uppercase tracking-widest text-secondary font-semibold mb-4">
              Resultado real
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🇦🇷</span>
              <span className="text-3xl font-black text-light tabular-nums">
                2 - 1
              </span>
              <span className="text-3xl">🇲🇽</span>
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="text-center mt-6">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-primary to-secondary text-dark font-bold">
            <Flame size={18} />
            +3 puntos · ¡Marcador exacto!
          </span>
        </motion.div>
      </Section>

      {/* TABLA DE POSICIONES (EJEMPLO) */}
      <Section>
        <SectionTitle
          kicker="La competencia"
          title="Tabla de posiciones"
          subtitle="Una tabla en vivo muestra quién va ganando durante todo el Mundial. Así se vería (ejemplo)."
        />
        <motion.div
          variants={fadeUp}
          className="max-w-2xl mx-auto liquid-glass rounded-2xl border border-white/[0.06] overflow-hidden"
        >
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 border-b border-white/[0.08] text-[11px] uppercase tracking-widest text-gray font-semibold">
            <span>Pos</span>
            <span>Participante</span>
            <span>Puntos</span>
          </div>
          {[
            { pos: 1, name: "Mariana", pts: 23, medal: "🥇" },
            { pos: 2, name: "Juan", pts: 15, medal: "🥈" },
            { pos: 3, name: "Ana", pts: 10, medal: "🥉" },
          ].map((row) => (
            <div
              key={row.pos}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center border-b border-white/[0.04] last:border-0",
                row.pos === 1 && "bg-primary/[0.06]"
              )}
            >
              <span className="text-xl w-8 text-center">{row.medal}</span>
              <span className="font-bold text-light">{row.name}</span>
              <span className="text-xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent tabular-nums">
                {row.pts}
              </span>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* PREMIO */}
      <Section className="bg-dark-secondary/30">
        <motion.div
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center liquid-glass rounded-3xl p-10 sm:p-14 border border-primary/30 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-3xl" />
          <Trophy className="mx-auto text-primary mb-5" size={48} />
          <h2 className="text-3xl sm:text-4xl font-black text-light mb-3">
            El premio
          </h2>
          <p className="text-gray text-lg leading-relaxed mb-6">
            El campeón de la Polla Mundialista —quien más puntos acumule al
            final del Mundial— se lleva:
          </p>
          <div className="text-5xl sm:text-7xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            $500.000
          </div>
          <p className="text-secondary text-lg font-semibold mt-3">
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
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {RULES.map((rule, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex gap-4 liquid-glass-light rounded-2xl p-6 border border-white/[0.06]"
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <rule.icon className="text-primary" size={20} />
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
            Las inscripciones abren muy pronto. Síguenos para no quedarte por
            fuera de la Polla Mundialista 2026.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              disabled
              className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 cursor-not-allowed opacity-80"
            >
              Inscripciones muy pronto
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary/50 text-primary font-bold text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-300"
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
    </div>
  );
};

export default PollaMundialPage;
