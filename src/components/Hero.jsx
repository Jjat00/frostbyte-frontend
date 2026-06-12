import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, Instagram, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/config/env";
import { MundialColorField, EmblemaMundial } from "@/components/mundial/Sistema26";

gsap.registerPlugin(useGSAP);

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/frostbyte.col/",
    label: "Instagram",
  },
  {
    icon: TikTokIcon,
    href: "https://www.tiktok.com/@frostbyte.col",
    label: "TikTok",
  },
];

const DAY_NAMES = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "BUENOS DIAS";
  if (hour >= 12 && hour < 18) return "BUENAS TARDES";
  return "BUENAS NOCHES";
};

const getDateStrip = () => {
  const today = new Date();
  const dates = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({ day: d.getDate(), isCurrent: i === 0 });
  }
  return dates;
};

// Clave de fecha local (YYYY-MM-DD) para cachear la frase del día en el cliente.
const PHRASE_STORAGE_KEY = "frostbyte_motivational_phrase_mundial";
const localDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const Hero = () => {
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
  const sectionRef = useRef(null);
  const greeting = getGreeting();
  const dayName = DAY_NAMES[new Date().getDay()];
  const dateStrip = getDateStrip();

  useEffect(() => {
    const today = localDateKey();

    // 1) Si ya tenemos la frase de hoy en cache local, la usamos al instante:
    //    sin red ni parpadeo de carga (la frase es la misma todo el día).
    try {
      const raw = localStorage.getItem(PHRASE_STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.phrase && cached?.date === today) {
          setMotivationalPhrase(cached.phrase);
          setIsLoadingPhrase(false);
          return;
        }
      }
    } catch {
      // localStorage no disponible o JSON inválido: continuamos al fetch.
    }

    // 2) Sin cache válida: pedimos al backend (que también cachea la frase del día).
    const fetchMotivationalPhrase = async () => {
      try {
        const response = await fetch(
          `${env.API_BASE_URL}/motivational/phrase/`,
        );
        const data = await response.json();
        if (response.ok && data.phrase) {
          setMotivationalPhrase(data.phrase);
          try {
            localStorage.setItem(
              PHRASE_STORAGE_KEY,
              JSON.stringify({ phrase: data.phrase, date: data.date || today }),
            );
          } catch {
            // Si no se puede escribir en localStorage, no es crítico.
          }
        }
      } catch (error) {
        console.error("Error al obtener la frase motivacional:", error);
      } finally {
        setIsLoadingPhrase(false);
      }
    };
    fetchMotivationalPhrase();
  }, []);

  // Rebote sutil del indicador de scroll.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const scrollIndicator = section.querySelector(".hero-scroll-indicator");
      if (scrollIndicator) {
        gsap.to(scrollIndicator, {
          y: 10,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Fondo estilo póster del Mundial (bloques de color + patrón + "26") */}
      <MundialColorField scrim="center" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-7 pb-16">
          {/* Emblema oficial del Mundial */}
          <div className="flex justify-center">
            <EmblemaMundial className="h-24 sm:h-32" loading="eager" />
          </div>

          {/* Badge */}
          <div>
            <span className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/40 rounded-full text-gold text-xs sm:text-sm font-bold tracking-wider whitespace-nowrap">
              <Trophy size={15} />
              BEBIDAS HELADAS · MUNDIAL 2026 · CUMBAL
            </span>
          </div>

          {/* Greeting, Day & Date strip */}
          <div className="hero-greeting flex flex-col items-center gap-1">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-white/70">
              {greeting}
            </span>
            <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-secondary">
              {dayName}
            </span>
            <div className="hero-subtitle flex items-center gap-4">
              {dateStrip.map((d, i) => (
                <span
                  key={i}
                  className={`text-xs sm:text-sm font-medium ${
                    d.isCurrent ? "text-secondary" : "text-white/30"
                  }`}
                >
                  {String(d.day).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          {/* Headline */}
          <h1 className="w-full text-center font-black text-light leading-none tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]">
            {/* flex + justify-center centra aunque el texto sea más ancho que el
                contenedor (text-align no lo hace); el clamp lo mantiene dentro del viewport */}
            <span className="flex w-full justify-center whitespace-nowrap text-[clamp(2rem,9vw,7.5rem)]">
              FROSTBYTE
            </span>
            <span className="mt-2 block text-gold text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-widest">
              CUMBAL, NARIÑO
            </span>
          </h1>

          {/* Frase motivacional */}
          {!isLoadingPhrase && motivationalPhrase && (
            <div className="hero-phrase max-w-2xl mx-auto text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold">
                Para hoy
              </p>
              <div className="w-16 h-[2px] bg-linear-to-r from-gold to-grass mx-auto mt-2 mb-4" />
              <p className="text-secondary text-base sm:text-lg md:text-xl leading-relaxed font-medium italic">
                &ldquo;{motivationalPhrase}&rdquo;
              </p>
            </div>
          )}

          {/* Descripción */}
          <p className="hero-description text-light/85 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Granizados, frappés, cocteles, shots y micheladas con amigos o en
            familia. Bebidas heladas premium con un estilo único en Cumbal,
            Nariño.
          </p>

          {/* CTA destacado: Polla Mundialista */}
          <div className="flex justify-center">
            <Link
              to="/polla-mundial"
              className="hero-cta-btn group relative w-full max-w-xl flex flex-col gap-3 px-5 sm:px-7 py-5 rounded-2xl bg-linear-to-r from-grass to-gold text-dark overflow-hidden shadow-2xl shadow-grass/40 hover:shadow-gold/50 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Glow / shimmer + anillo */}
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
              <span className="absolute -inset-1 rounded-2xl ring-2 ring-gold/60 animate-pulse pointer-events-none" />

              {/* Fila 1: identidad de la polla */}
              <div className="relative flex items-center gap-3 sm:gap-4 w-full">
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-dark/15 backdrop-blur-sm flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em]">
                    ⚽ Mundial 2026 · ¡Participa ya!
                  </span>
                  <span className="block text-xl sm:text-2xl font-black leading-tight">
                    Polla Mundialista
                  </span>
                </div>
                <ArrowRight className="shrink-0 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Fila 2: premio destacado */}
              <div className="relative flex items-center justify-center gap-2 sm:gap-3 w-full border-t border-dark/20 pt-3">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                  Gana
                </span>
                <span className="t26-num text-3xl sm:text-4xl tracking-tight leading-none">
                  $500.000
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                  medio millón
                </span>
              </div>
            </Link>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-gray text-sm">Síguenos:</span>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="hero-social-link flex items-center gap-2 px-4 py-2 bg-linear-to-r from-grass/10 to-gold/10 border border-gold/40 rounded-full text-gold hover:from-grass hover:to-gold hover:text-dark hover:border-transparent hover:shadow-[0_0_20px_rgba(242,197,61,0.4)] transition-all duration-300"
              >
                <social.icon size={20} />
                <span className="text-sm font-semibold">{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <ChevronDown className="text-gold" size={40} />
      </div>
    </section>
  );
};

export default Hero;
