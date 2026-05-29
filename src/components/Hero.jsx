import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown, Instagram, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/config/env";
import { useInViewport, useIsMobile } from "@/hooks";

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

// "Byte" in binary: B=01000010 y=01111001 t=01110100 e=01100101
const BYTE_BINARY = "01000010011110010111010001100101";

const FROSTBYTE_LETTERS = ["F", "R", "O", "S", "T", "B", "Y", "T", "E"];

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

const Hero = () => {
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [displayedPhrase, setDisplayedPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const isInView = useInViewport(sectionRef);
  const isMobile = useIsMobile();
  const greeting = getGreeting();
  const dayName = DAY_NAMES[new Date().getDay()];
  const dateStrip = getDateStrip();

  // Binary grid canvas animation — pausada cuando la seccion no esta en viewport
  useEffect(() => {
    if (!isInView) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    const mouse = { x: -9999, y: -9999 };
    const COL_W = 22;
    const ROW_H = 20;
    const FONT_SIZE = 12;
    const HOVER_RADIUS = 140;
    let flickerPhases = [];
    let cols = 0;
    let rows = 0;
    const buildGrid = () => {
      cols = Math.ceil(canvas.width / COL_W) + 1;
      rows = Math.ceil(canvas.height / ROW_H) + 1;
      const total = cols * rows;
      flickerPhases = new Float32Array(total);
      for (let i = 0; i < total; i++) {
        flickerPhases[i] = Math.random() * Math.PI * 2;
      }
    };
    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      buildGrid();
    };
    resize();
    window.addEventListener("resize", resize);
    const handleMouseMove = (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);
    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = col * rows + row;
          const x = col * COL_W + COL_W / 2;
          const y = row * ROW_H + ROW_H / 2;
          const digit = BYTE_BINARY[idx % BYTE_BINARY.length];
          const phase = flickerPhases[idx];
          const flicker = 0.5 + 0.5 * Math.sin(t * 0.8 + phase);
          let alpha = 0.06 + flicker * 0.12;
          let r = 255,
            g = 255,
            b = 255;
          const colorCycle = Math.sin(t * 0.5 + phase * 1.5);
          if (colorCycle > 0.3) {
            r = 180;
            g = 240;
            b = 255;
          } else if (colorCycle < -0.3) {
            r = 255;
            g = 180;
            b = 240;
          }
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let drawX = x;
          let drawY = y;
          if (dist < HOVER_RADIUS) {
            const intensity = 1 - dist / HOVER_RADIUS;
            const ease = intensity * intensity;
            const waveFreq = 0.06;
            const waveAmp = 8;
            const wave = Math.sin(dist * waveFreq - t * 4) * waveAmp * ease;
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * wave;
            drawY += Math.sin(angle) * wave;
            alpha = Math.min(1, alpha + ease * 0.85);
            r = Math.round(r * (1 - ease) + 255 * ease);
            g = Math.round(g * (1 - ease) + 0 * ease);
            b = Math.round(b * (1 - ease) + 212 * ease);
            const scale = 1 + ease * 0.5;
            ctx.font = `${Math.round(FONT_SIZE * scale)}px 'Courier New', monospace`;
            ctx.shadowColor = `rgba(255, 0, 212, ${ease * 0.7})`;
            ctx.shadowBlur = ease * 16;
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillText(digit, drawX, drawY);
          if (dist < HOVER_RADIUS) {
            ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [isInView]);

  useEffect(() => {
    const fetchMotivationalPhrase = async () => {
      try {
        const response = await fetch(
          `${env.API_BASE_URL}/motivational/phrase/`,
        );
        const data = await response.json();
        if (response.ok && data.phrase) {
          setMotivationalPhrase(data.phrase);
        }
      } catch (error) {
        console.error("Error al obtener la frase motivacional:", error);
      } finally {
        setIsLoadingPhrase(false);
      }
    };
    fetchMotivationalPhrase();
  }, []);

  // Streaming effect word by word
  useEffect(() => {
    if (!motivationalPhrase || isLoadingPhrase) return;
    const words = motivationalPhrase.split(" ");
    setIsStreaming(true);
    setDisplayedPhrase("");
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedPhrase(words.slice(0, index).join(" "));
      if (index >= words.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [motivationalPhrase, isLoadingPhrase]);

  // GSAP entrance animations
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const badge = section.querySelector(".hero-badge");
      const greeting = section.querySelector(".hero-greeting");
      const dateStrip = section.querySelector(".hero-subtitle");
      const letters = section.querySelectorAll(".hero-title-letter");
      const phrase = section.querySelector(".hero-phrase");
      const description = section.querySelector(".hero-description");
      const ctaBtns = section.querySelectorAll(".hero-cta-btn");
      const socialLinks = section.querySelectorAll(".hero-social-link");
      const scrollIndicator = section.querySelector(".hero-scroll-indicator");

      // Set initial invisible states
      gsap.set(badge, { autoAlpha: 0, y: -10 });
      gsap.set(greeting, { autoAlpha: 0, y: -20 });
      gsap.set(dateStrip, { autoAlpha: 0, y: 20 });
      gsap.set(letters, { autoAlpha: 0 });
      if (phrase) gsap.set(phrase, { autoAlpha: 0, y: 30 });
      gsap.set(description, { autoAlpha: 0, y: 30 });
      gsap.set(ctaBtns, { autoAlpha: 0, y: 40 });
      gsap.set(socialLinks, { autoAlpha: 0, x: -40 });
      gsap.set(scrollIndicator, { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Badge — fade-down suave
      tl.to(badge, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // 2. Greeting
      tl.to(
        greeting,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3",
      );

      // 3. Date strip
      tl.to(
        dateStrip,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3",
      );

      // 3. Letters: fade-in suave con stagger sutil
      tl.to(
        letters,
        {
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
        },
        "-=0.2",
      );

      // 4. Motivational phrase
      if (phrase) {
        tl.to(
          phrase,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.2",
        );
      }

      // 5. Description
      tl.to(
        description,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.2",
      );

      // 6. CTA buttons — fade-up suave sin overshoot
      tl.to(
        ctaBtns,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.2",
      );

      // 7. Social links — fade lateral suave
      tl.to(
        socialLinks,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.2",
      );

      // 8. Scroll indicator + infinite bounce
      tl.to(
        scrollIndicator,
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: "power1.out",
          onComplete: () => {
            gsap.to(scrollIndicator, {
              y: 10,
              duration: 1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          },
        },
        "-=0.2",
      );
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
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 pb-16">
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
          <h1 className="text-[clamp(2.8rem,11vw,9rem)] font-black text-light leading-none tracking-tight w-full">
            <span className="inline-flex justify-center" aria-label="FROSTBYTE">
              {FROSTBYTE_LETTERS.map((letter, i) => (
                <span
                  key={i}
                  className="hero-title-letter inline-block"
                  aria-hidden="true"
                >
                  {letter}
                </span>
              ))}
            </span>
            <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-widest mt-2">
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
                &ldquo;{displayedPhrase}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-5 bg-secondary ml-0.5 animate-pulse align-middle" />
                )}
                {!isStreaming && <>&rdquo;</>}
              </p>
            </div>
          )}

          {/* Descripción */}
          <p className="hero-description text-gray text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Granizados, frappés, cocteles, shots y micheladas con amigos o en
            familia. Bebidas heladas premium con un estilo único en Cumbal,
            Nariño.
          </p>

          {/* CTA destacado: Polla Mundialista */}
          <div className="flex justify-center">
            <Link
              to="/polla-mundial"
              className="hero-cta-btn group relative w-full max-w-xl inline-flex items-center gap-4 sm:gap-5 px-6 sm:px-8 py-5 rounded-2xl bg-linear-to-r from-primary to-secondary text-dark overflow-hidden shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Glow / shimmer */}
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <span className="absolute -inset-1 rounded-2xl ring-2 ring-primary/50 animate-pulse pointer-events-none" />

              <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-dark/15 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="relative flex-1 text-left">
                <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                  ⚽ Mundial 2026 · ¡Participa ya!
                </span>
                <span className="block text-lg sm:text-2xl font-black leading-tight">
                  Polla Mundialista
                </span>
                <span className="block text-xs sm:text-sm font-bold">
                  Pronostica y gana $500.000
                </span>
              </div>

              <ArrowRight className="relative shrink-0 w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
