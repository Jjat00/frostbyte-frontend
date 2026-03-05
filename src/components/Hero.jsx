import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/frostbyte.col/", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@frostbyte.col", label: "TikTok" },
];

// "Byte" in binary: B=01000010 y=01111001 t=01110100 e=01100101
const BYTE_BINARY = "01000010011110010111010001100101";

const Hero = () => {
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  // Binary grid canvas animation
  useEffect(() => {
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

    // Pre-compute random phase offsets per cell (created once on resize)
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
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001; // seconds

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = col * rows + row;
          const x = col * COL_W + COL_W / 2;
          const y = row * ROW_H + ROW_H / 2;

          // Binary digit from "Byte"
          const digit = BYTE_BINARY[idx % BYTE_BINARY.length];

          // Flicker: each cell has its own phase, slow oscillation
          const phase = flickerPhases[idx];
          const flicker = 0.5 + 0.5 * Math.sin(t * 0.8 + phase);
          // Base opacity varies between 0.06 and 0.18
          let alpha = 0.06 + flicker * 0.12;

          // Color channels (base: white with subtle tint)
          let r = 255, g = 255, b = 255;

          // Subtle color cycling per cell
          const colorCycle = Math.sin(t * 0.5 + phase * 1.5);
          if (colorCycle > 0.3) {
            // Cyan tint
            r = 180; g = 240; b = 255;
          } else if (colorCycle < -0.3) {
            // Magenta tint
            r = 255; g = 180; b = 240;
          }

          // Mouse hover effect
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Wave distortion — displaces characters in a ripple pattern
          let drawX = x;
          let drawY = y;
          if (dist < HOVER_RADIUS) {
            const intensity = 1 - dist / HOVER_RADIUS;
            const ease = intensity * intensity; // quadratic ease for smoother falloff

            // Ripple wave: concentric rings radiating from cursor
            const waveFreq = 0.06;
            const waveAmp = 8;
            const wave = Math.sin(dist * waveFreq - t * 4) * waveAmp * ease;

            // Displace along the vector from mouse to character
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * wave;
            drawY += Math.sin(angle) * wave;

            // Boost opacity
            alpha = Math.min(1, alpha + ease * 0.85);

            // Shift color toward magenta/cyan gradient
            r = Math.round(r * (1 - ease) + 255 * ease);
            g = Math.round(g * (1 - ease) + 0 * ease);
            b = Math.round(b * (1 - ease) + 212 * ease);

            // Scale effect via font size
            const scale = 1 + ease * 0.5;
            ctx.font = `${Math.round(FONT_SIZE * scale)}px 'Courier New', monospace`;

            // Glow (shadow)
            ctx.shadowColor = `rgba(255, 0, 212, ${ease * 0.7})`;
            ctx.shadowBlur = ease * 16;
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillText(digit, drawX, drawY);

          // Reset font/shadow if modified
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
  }, []);

  useEffect(() => {
    const fetchMotivationalPhrase = async () => {
      try {
        const response = await fetch(
          `${env.API_BASE_URL}/motivational/phrase/`
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

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-dark via-dark-secondary to-dark" />

      {/* Binary grid: "Byte" encoded as 0s and 1s */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-xs sm:text-sm font-semibold tracking-wider whitespace-nowrap">
              BEBIDAS HELADAS · CUMBAL, NARIÑO
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[clamp(2.8rem,11vw,9rem)] font-black text-light leading-none tracking-tight w-full"
          >
            FROSTBYTE
            <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-widest mt-2">
              CUMBAL, NARIÑO
            </span>
          </motion.h1>

          {/* Frase motivacional */}
          {!isLoadingPhrase && motivationalPhrase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="max-w-2xl mx-auto"
            >
              <div className="px-6 py-3 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm">
                <p className="text-primary text-base md:text-lg font-semibold italic">
                  "{motivationalPhrase}"
                </p>
              </div>
            </motion.div>
          )}

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Granizados, frappés, cocteles, shots y micheladas con amigos o en familia.
            Bebidas heladas premium con un estilo único en Cumbal, Nariño.
          </motion.p>

          {/* Botones + redes en una fila en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() =>
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
            >
              Explorar Carta
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary/50 text-primary font-bold text-lg px-8 py-6 hover:bg-primary/10 hover:border-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <a
                href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={20} className="mr-2" />
                Ubicación en Cumbal
              </a>
            </Button>
          </motion.div>

          {/* Redes sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <span className="text-gray text-sm">Síguenos:</span>
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/40 rounded-full text-primary hover:from-primary hover:to-secondary hover:text-dark hover:border-transparent hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300"
              >
                <social.icon size={20} />
                <span className="text-sm font-semibold">{social.label}</span>
              </motion.a>
            ))}
          </motion.div>

        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="text-primary" size={40} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
