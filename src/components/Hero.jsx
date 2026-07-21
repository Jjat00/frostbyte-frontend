import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, Instagram } from "lucide-react";
import { env } from "@/config/env";

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

// Cache local de la frase: válida 30 min (alineado con el caché del backend,
// que rota la frase cada media hora).
const PHRASE_STORAGE_KEY = "frostbyte_motivational_phrase";
const PHRASE_TTL_MS = 30 * 60 * 1000;

const Hero = () => {
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
  const sectionRef = useRef(null);
  const greeting = getGreeting();
  const dayName = DAY_NAMES[new Date().getDay()];
  const dateStrip = getDateStrip();

  useEffect(() => {
    // 1) Si la frase en cache local sigue fresca (< 30 min), la usamos al
    //    instante: sin red ni parpadeo de carga.
    try {
      const raw = localStorage.getItem(PHRASE_STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.phrase && cached?.ts && Date.now() - cached.ts < PHRASE_TTL_MS) {
          setMotivationalPhrase(cached.phrase);
          setIsLoadingPhrase(false);
          return;
        }
      }
    } catch {
      // localStorage no disponible o JSON inválido: continuamos al fetch.
    }

    // 2) Sin cache fresca: pedimos al backend (que también cachea por franja de 30 min).
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
              JSON.stringify({ phrase: data.phrase, ts: Date.now() }),
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
      <div className="absolute inset-0 backdrop-blur-xl bg-black/[0.3]" />
      <div className="absolute inset-0 bg-linear-to-b from-white/[0.04] via-transparent to-white/[0.03]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/[0.1] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-7 pb-16">
          {/* Badge */}
          <div>
            <span className="hero-badge inline-block px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-xs sm:text-sm font-semibold tracking-wider whitespace-nowrap">
              BEBIDAS HELADAS · CUMBAL, NARIÑO
            </span>
          </div>

          {/* Greeting, Day & Date strip */}
          <div className="hero-greeting flex flex-col items-center gap-1">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-white/70">
              {greeting}
            </span>
            <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-primary">
              {dayName}
            </span>
            <div className="hero-subtitle flex items-center gap-4">
              {dateStrip.map((d, i) => (
                <span
                  key={i}
                  className={`text-xs sm:text-sm font-medium ${
                    d.isCurrent ? "text-primary" : "text-white/30"
                  }`}
                >
                  {String(d.day).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          {/* Headline */}
          <h1 className="w-full text-center font-black text-light leading-none tracking-tight">
            {/* flex + justify-center centra aunque el texto sea más ancho que el
                contenedor (text-align no lo hace); el clamp lo mantiene dentro del viewport */}
            <span className="flex w-full justify-center whitespace-nowrap text-[clamp(2rem,9vw,7.5rem)]">
              FROSTBYTE
            </span>
            <span className="mt-2 block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-widest">
              CUMBAL, NARIÑO
            </span>
          </h1>

          {/* Frase motivacional */}
          {!isLoadingPhrase && motivationalPhrase && (
            <div className="hero-phrase max-w-2xl mx-auto text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
                Para hoy
              </p>
              <div className="w-16 h-[2px] bg-linear-to-r from-primary to-secondary mx-auto mt-2 mb-4" />
              <p className="text-secondary text-base sm:text-lg md:text-xl leading-relaxed font-medium italic">
                &ldquo;{motivationalPhrase}&rdquo;
              </p>
            </div>
          )}

          {/* Descripción */}
          <p className="hero-description text-gray text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Granizados, frappés, cocteles, shots y micheladas con amigos o en
            familia. Bebidas heladas premium con un estilo único en Cumbal,
            Nariño.
          </p>

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
                className="hero-social-link flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/40 rounded-full text-primary hover:from-primary hover:to-secondary hover:text-dark hover:border-transparent hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300"
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
        <ChevronDown className="text-primary" size={40} />
      </div>
    </section>
  );
};

export default Hero;
