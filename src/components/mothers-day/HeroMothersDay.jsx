import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Instagram, MapPin, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
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

function drawCanvasFlower(ctx, cx, cy, size, opacity) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = opacity;

  // Flores rosa pastel cálidas
  const outerColors = ["#f48fb1", "#f8a5b8", "#ffc8d9", "#e8a4b8", "#fbd5e1"];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size * 0.8, size * 0.8, -size * 0.4, 0, -size);
    ctx.bezierCurveTo(-size * 0.8, -size * 0.4, -size * 0.5, -size * 0.8, 0, 0);
    ctx.fillStyle = outerColors[i];
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.3, -size * 0.5, size * 0.5, -size * 0.3, 0, -size * 0.65);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.3, -size * 0.5, 0, 0);
    ctx.fillStyle = "#ffd0e0";
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#fff5e6";
  ctx.fill();
  ctx.restore();
}

const HeroMothersDay = () => {
  const [aiPhrase, setAiPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchPhrase = async () => {
      try {
        const response = await fetch(
          `${env.API_BASE_URL}/motivational/phrase/dia-madre/?nocache=1`
        );
        const data = await response.json();
        if (response.ok && data.phrase) {
          setAiPhrase(data.phrase);
        }
      } catch (error) {
        console.error("Error al obtener frase:", error);
      } finally {
        setIsLoadingPhrase(false);
      }
    };
    fetchPhrase();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    let rafId;
    const mouse = { x: -9999, y: -9999 };
    const isMobile = window.innerWidth < 768;
    const COL_W = isMobile ? 36 : 24;
    const ROW_H = isMobile ? 32 : 22;
    const FONT_SIZE = isMobile ? 11 : 13;
    const HOVER_RADIUS = isMobile ? 100 : 150;
    const GRID_CHARS = "♡+.o♥.:+♡.o+.:♥";

    let flickerPhases = [];
    let cols = 0;
    let rows = 0;

    const flowers = [];
    const FLOWER_COUNT = isMobile ? 5 : 10;

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
    const handleTouchMove = (e) => {
      const rect = section.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    };
    const handleLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleLeave);
    section.addEventListener("touchmove", handleTouchMove, { passive: true });
    section.addEventListener("touchend", handleLeave);

    for (let i = 0; i < FLOWER_COUNT; i++) {
      flowers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 10 + Math.random() * 16,
        speedY: -0.12 - Math.random() * 0.25,
        speedX: (Math.random() - 0.5) * 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.004,
        opacity: 0.15 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
      });
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;

      ctx.font = `${FONT_SIZE}px 'Georgia', serif`;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = col * rows + row;
          const x = col * COL_W + COL_W / 2;
          const y = row * ROW_H + ROW_H / 2;

          const ch = GRID_CHARS[idx % GRID_CHARS.length];

          const phase = flickerPhases[idx];
          const flicker = 0.5 + 0.5 * Math.sin(t * 0.7 + phase);
          let alpha = 0.04 + flicker * 0.08;

          let r = 255, g = 200, b = 215;

          const colorCycle = Math.sin(t * 0.4 + phase * 1.3);
          if (colorCycle > 0.3) {
            r = 255; g = 180; b = 195;
          } else if (colorCycle < -0.3) {
            r = 250; g = 215; b = 180;
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
            const waveAmp = 7;
            const wave = Math.sin(dist * waveFreq - t * 4) * waveAmp * ease;

            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * wave;
            drawY += Math.sin(angle) * wave;

            alpha = Math.min(1, alpha + ease * 0.8);

            r = Math.round(r * (1 - ease) + 244 * ease);
            g = Math.round(g * (1 - ease) + 143 * ease);
            b = Math.round(b * (1 - ease) + 177 * ease);

            const scale = 1 + ease * 0.5;
            ctx.font = `${Math.round(FONT_SIZE * scale)}px 'Georgia', serif`;

            ctx.shadowColor = `rgba(244, 143, 177, ${ease * 0.6})`;
            ctx.shadowBlur = ease * 14;
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillText(ch, drawX, drawY);

          if (dist < HOVER_RADIUS) {
            ctx.font = `${FONT_SIZE}px 'Georgia', serif`;
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        }
      }

      // Flores flotantes
      for (const fl of flowers) {
        fl.y += fl.speedY;
        fl.x += fl.speedX + Math.sin(t + fl.phase) * 0.18;
        fl.rotation += fl.rotSpeed;
        if (fl.y < -30) {
          fl.y = canvas.height + 30;
          fl.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.rotation);
        drawCanvasFlower(ctx, 0, 0, fl.size, fl.opacity);
        ctx.restore();
      }

      // Destellos
      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(t * 0.3 + i * 2.1) * 0.5 + 0.5) * canvas.width;
        const py = (Math.cos(t * 0.2 + i * 1.7) * 0.5 + 0.5) * canvas.height;
        const ps = 2 + Math.sin(t + i) * 1;
        ctx.beginPath();
        ctx.arc(px, py, ps, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 180, ${0.2 + Math.sin(t * 2 + i) * 0.08})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleLeave);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("touchend", handleLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Fondo cálido: rosa profundo a durazno tenue */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1218] via-[#241019] to-[#1a0c14]" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(244,143,177,0.4) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(255,180,140,0.3) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(232,200,150,0.2) 0%, transparent 60%)`,
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-300/15 rounded-full filter blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/12 rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-300/[0.1] rounded-full filter blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-300/20 to-amber-300/20 border border-pink-300/50 rounded-full text-pink-200 text-xs sm:text-sm font-semibold tracking-wider">
              <Heart size={14} className="fill-pink-300 text-pink-300" />
              BEBIDAS HELADAS &middot; CUMBAL, NARI&Ntilde;O
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[clamp(2.8rem,11vw,9rem)] font-black text-light leading-none tracking-tight w-full"
          >
            FROSTBYTE
            <span className="block bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-widest mt-2">
              FELIZ D&Iacute;A MAM&Aacute;
            </span>
          </motion.h1>

          {!isLoadingPhrase && aiPhrase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="max-w-2xl mx-auto"
            >
              <div className="px-6 py-3 bg-gradient-to-r from-pink-300/10 via-rose-300/10 to-amber-300/10 border border-pink-300/30 rounded-2xl backdrop-blur-sm">
                <p className="text-pink-100 text-base md:text-lg font-semibold italic">
                  &ldquo;{aiPhrase}&rdquo;
                </p>
              </div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-pink-100/75 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Hoy celebramos a esa mujer que nos dio la vida, el amor y todo. Consiente a
            mam&aacute; con granizados, frappes y c&oacute;cteles &uacute;nicos en Cumbal, Nari&ntilde;o.
          </motion.p>

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
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-pink-400/50 transition-all duration-300 border-0"
            >
              Explorar Carta
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-pink-300/50 text-pink-100 font-bold text-lg px-8 py-6 hover:bg-pink-400/10 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-400/30 transition-all duration-300"
            >
              <a
                href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={20} className="mr-2" />
                Ubicaci&oacute;n en Cumbal
              </a>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 text-stone-900 font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-pink-400/50 hover:from-rose-300 hover:via-pink-200 hover:to-amber-200 transition-all duration-300 border-0"
            >
              <Link to="/dia-madre/generador">
                <Sparkles size={20} className="mr-2" />
                Crea tu tarjeta para Mam&aacute;
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <span className="text-pink-200/65 text-sm">S&iacute;guenos:</span>
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-300/10 to-amber-300/10 border border-pink-300/40 rounded-full text-pink-100 hover:from-pink-400 hover:to-rose-400 hover:text-white hover:border-transparent hover:shadow-[0_0_20px_rgba(248,165,184,0.5)] transition-all duration-300"
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
          <ChevronDown className="text-pink-300" size={40} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroMothersDay;
