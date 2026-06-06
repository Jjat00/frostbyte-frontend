import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Image,
  Mic,
  MessageSquare,
  Brain,
  ShoppingCart,
  Package,
  BarChart3,
  DollarSign,
  Gamepad2,
  ChevronDown,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Check,
  ExternalLink,
  Layers,
  Bot,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BYTE_BINARY = "01000010011110010111010001100101";

// --- HERO SECTION ---
const HeroSection = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

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
          let r = 255, g = 255, b = 255;

          const colorCycle = Math.sin(t * 0.5 + phase * 1.5);
          if (colorCycle > 0.3) { r = 180; g = 240; b = 255; }
          else if (colorCycle < -0.3) { r = 255; g = 180; b = 240; }

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let drawX = x;
          let drawY = y;
          if (dist < HOVER_RADIUS) {
            const intensity = 1 - dist / HOVER_RADIUS;
            const ease = intensity * intensity;

            // Ripple wave distortion
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
            ctx.shadowColor = `rgba(30,158,90, ${ease * 0.7})`;
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 backdrop-blur-xl bg-black/[0.3]" />
      <div className="absolute inset-0 bg-linear-to-b from-white/[0.04] via-transparent to-white/[0.03]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/[0.1] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-xs sm:text-sm font-semibold tracking-wider">
              <Bot size={16} />
              POTENCIADO CON INTELIGENCIA ARTIFICIAL
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,11vw,9rem)] font-black text-light leading-none tracking-tight">
            FROSTBYTE
            <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-widest mt-2">
              TU NEGOCIO. OTRO NIVEL.
            </span>
          </h1>

          <p className="text-gray text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            La plataforma all-in-one que transforma la forma en que gestionas
            tu restaurante o bar. Menu digital con IA que recomienda, genera
            contenido y entiende a tus clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() =>
                document
                  .getElementById("ai-features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
            >
              Descubrir Frostbyte
              <ArrowRight size={20} className="ml-2" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary/50 text-primary font-bold text-lg px-8 py-6 hover:bg-primary/10 hover:border-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={20} className="mr-2" />
                Ver Demo en Vivo
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              "Menu inteligente",
              "Recomendaciones por voz",
              "Imagenes generadas con IA",
              "Gestion en tiempo real",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 text-gray/70 text-sm font-medium"
              >
                <Check size={14} className="text-secondary" />
                {item}
              </span>
            ))}
          </div>
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

// --- STATS SECTION ---
const stats = [
  { value: "5+", label: "Funciones de IA activas", icon: Brain },
  { value: "10+", label: "Modulos integrados", icon: Layers },
  { value: "0", label: "Apps que instalar", icon: Globe },
  { value: "24/7", label: "Disponible para tus clientes", icon: Clock },
];

const StatsSection = () => (
  <section className="py-16 relative">
    <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="liquid-glass-light relative text-center rounded-2xl p-6 border border-white/[0.08]"
          >
            <stat.icon size={24} className="text-primary/50 mx-auto mb-3" />
            <p className="text-4xl md:text-5xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {stat.value}
            </p>
            <p className="text-gray text-sm font-medium tracking-wide">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- AI FEATURES SECTION ---
const aiFeatures = [
  {
    icon: Image,
    title: "Fotos profesionales al instante",
    description:
      "Sube una foto basica de tu producto y obtene una imagen profesional lista para tu menu. Sin fotografo, sin edicion manual. La IA transforma tus fotos en contenido de alta calidad.",
    highlight: "Ahorra horas de produccion fotografica",
    color: "from-primary to-pink-500",
  },
  {
    icon: Brain,
    title: "Recomendaciones que venden",
    description:
      "Tus clientes dicen como se sienten o responden un quiz rapido, y Frostbyte les recomienda el producto perfecto de tu menu. Cada interaccion es una oportunidad de venta.",
    highlight: "Aumenta el ticket promedio automaticamente",
    color: "from-secondary to-blue-500",
  },
  {
    icon: Mic,
    title: "Pedidos y busquedas por voz",
    description:
      "Los clientes hablan naturalmente y la IA entiende. Dictan su estado de animo, lo que buscan o lo que quieren, y el sistema responde con la mejor opcion del menu.",
    highlight: "Experiencia accesible y sin friccion",
    color: "from-purple-500 to-primary",
  },
  {
    icon: Sparkles,
    title: "Contenido fresco cada dia",
    description:
      "Tu menu digital nunca se ve igual. Frases unicas, datos curiosos y contenido dinamico que se renueva automaticamente para mantener la atencion de tus clientes.",
    highlight: "Tu marca siempre activa, sin esfuerzo",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Descripciones que enamoran",
    description:
      "Agrega un producto y la IA escribe una descripcion irresistible automaticamente. Copy profesional en segundos, optimizado para convertir visitas en pedidos.",
    highlight: "Copywriting profesional automatizado",
    color: "from-emerald-500 to-secondary",
  },
  {
    icon: Layers,
    title: "Biblioteca visual inteligente",
    description:
      "Cada imagen generada se guarda con su historial. Reutiliza, compara y asigna directamente a cualquier producto de tu catalogo con un solo clic.",
    highlight: "Todo tu contenido visual organizado",
    color: "from-rose-500 to-primary",
  },
];

const AIFeaturesSection = () => (
  <section id="ai-features" className="py-24 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[150px]" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-semibold tracking-wider mb-4">
          <Zap size={14} />
          INTELIGENCIA ARTIFICIAL
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
          LA IA TRABAJA{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            POR TI
          </span>
        </h2>
        <p className="text-gray text-lg max-w-2xl mx-auto">
          Cada funcion de IA esta disenada para ahorrarte tiempo, vender mas
          y darle a tus clientes una experiencia que no van a olvidar.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <div className="liquid-glass-interactive relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 h-full flex flex-col transition-all duration-500 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(30,158,90,0.15)] hover:-translate-y-1">
              <div
                className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
              >
                <feature.icon className="text-dark" size={28} />
              </div>

              <h3 className="text-xl font-bold text-light mb-3 tracking-wide">
                {feature.title}
              </h3>

              <p className="text-gray leading-relaxed mb-6 flex-1">
                {feature.description}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray/10">
                <TrendingUp size={14} className="text-secondary flex-shrink-0" />
                <span className="text-secondary text-sm font-semibold">
                  {feature.highlight}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- PLATFORM FEATURES SECTION ---
const platformFeatures = [
  {
    icon: Globe,
    title: "Menu Digital sin App",
    description:
      "Tus clientes escanean un QR y acceden al menu completo. Sin descargas, sin registros. Categorias dinamicas, fotos y precios siempre actualizados.",
    color: "primary",
  },
  {
    icon: ShoppingCart,
    title: "Pedidos en Control Total",
    description:
      "Desde que el cliente pide hasta que se entrega. Tracking en tiempo real por mesa, estados claros y notas personalizadas para cada pedido.",
    color: "secondary",
  },
  {
    icon: Package,
    title: "Inventario que se Cuida Solo",
    description:
      "Sabes exactamente que tienes, que necesitas y cuando pedir. Alertas de stock bajo, recetas vinculadas y ordenes de compra en un solo lugar.",
    color: "primary",
  },
  {
    icon: DollarSign,
    title: "Finanzas Claras",
    description:
      "Registra gastos diarios y recurrentes, establece limites y visualiza a donde va tu dinero. Reportes que te ayudan a tomar mejores decisiones.",
    color: "secondary",
  },
  {
    icon: BarChart3,
    title: "Datos que Importan",
    description:
      "Dashboards con las metricas que necesitas: ventas, productos mas pedidos, horarios pico. Informacion accionable para crecer tu negocio.",
    color: "primary",
  },
  {
    icon: Gamepad2,
    title: "Experiencias para tus Clientes",
    description:
      "Juegos interactivos multijugador en tiempo real. Tus clientes se divierten, se quedan mas tiempo y vuelven. Entretenimiento que genera lealtad.",
    color: "secondary",
  },
];

const PlatformSection = () => (
  <section id="platform" className="py-24 relative overflow-hidden backdrop-blur-md bg-white/[0.02] border-y border-white/[0.08]">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-secondary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-semibold tracking-wider mb-4">
          <Shield size={14} />
          GESTION COMPLETA
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
          TODO EN{" "}
          <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
            UN SOLO LUGAR
          </span>
        </h2>
        <p className="text-gray text-lg max-w-2xl mx-auto">
          Olvida las hojas de calculo, los cuadernos y las apps separadas.
          Frostbyte centraliza toda la operacion de tu negocio.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {platformFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            <div className="liquid-glass-interactive relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 h-full flex flex-col items-start transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(30,158,90,0.15)]">
              <div
                className={`w-16 h-16 bg-linear-to-br ${
                  feature.color === "primary"
                    ? "from-primary/20 to-primary/5"
                    : "from-secondary/20 to-secondary/5"
                } border ${
                  feature.color === "primary"
                    ? "border-primary/30"
                    : "border-secondary/30"
                } rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={
                    feature.color === "primary" ? "text-primary" : "text-secondary"
                  }
                  size={28}
                />
              </div>

              <h3 className="text-xl font-bold text-light mb-3 tracking-wide">
                {feature.title}
              </h3>

              <p className="text-gray leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- DEMO / CASE STUDY SECTION ---
const DemoSection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full filter blur-[200px]" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-semibold tracking-wider mb-4">
            <Globe size={14} />
            EN PRODUCCION
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            VELO EN{" "}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              ACCION
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Esto no es un mockup. Es un menu digital real, funcionando en
            produccion, con todas las funciones de IA activas. Exploralo tu mismo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Browser mockup */}
          <div className="liquid-glass relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.04] border-b border-white/[0.08]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-1.5 text-gray text-sm font-mono flex items-center gap-2 max-w-md w-full">
                  <Shield size={12} className="text-green-400" />
                  <span className="text-gray/50">frostbyte.app</span>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-primary text-xs font-semibold">
                    MENU DIGITAL EN VIVO
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-light">
                  FROSTBYTE
                </h3>
                <p className="text-gray max-w-lg mx-auto">
                  Explora el menu con recomendaciones personalizadas,
                  busqueda por voz y contenido generado con IA.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Brain, label: "Quiz IA", desc: "Te recomienda segun tu mood" },
                  { icon: Mic, label: "Busqueda por Voz", desc: "Habla y encuentra" },
                  { icon: Sparkles, label: "Contenido Diario", desc: "Siempre fresco" },
                  { icon: Users, label: "Sin Registro", desc: "Acceso inmediato" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="liquid-glass-light relative bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 text-center space-y-2"
                  >
                    <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto">
                      <item.icon size={18} className="text-primary" />
                    </div>
                    <p className="text-light text-sm font-bold">{item.label}</p>
                    <p className="text-gray text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -right-4 top-1/4 hidden lg:block"
          >
            <div className="liquid-glass-light relative bg-white/[0.08] backdrop-blur-xl border border-primary/30 rounded-xl p-4 shadow-[0_8px_32px_rgba(30,158,90,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Image size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-light text-sm font-bold">Foto generada</p>
                  <p className="text-gray text-xs">En 10 segundos</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute -left-4 bottom-1/4 hidden lg:block"
          >
            <div className="liquid-glass-light relative bg-white/[0.08] backdrop-blur-xl border border-secondary/30 rounded-xl p-4 shadow-[0_8px_32px_rgba(242,197,61,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Brain size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-light text-sm font-bold">"Quiero algo frio"</p>
                  <p className="text-gray text-xs">IA: Granizado de mango</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button
            asChild
            className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              Explorar Demo Completa
              <ArrowRight size={20} className="ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
);

// --- CTA SECTION ---
const CTASection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-secondary/5" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <h2 className="text-4xl md:text-6xl font-black text-light">
          LISTO PARA{" "}
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            EL SIGUIENTE
          </span>
          <br />
          NIVEL?
        </h2>
        <p className="text-gray text-lg max-w-xl mx-auto">
          Tu competencia sigue con cuadernos y hojas de calculo.
          Tu puedes tener IA trabajando para ti ahora mismo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-10 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              Ver Demo
              <ArrowRight size={20} className="ml-2" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-gray/30 text-gray font-bold text-lg px-10 py-6 hover:bg-gray/10 hover:border-gray/50 transition-all duration-300"
          >
            <Link to="/login">
              Iniciar Sesion
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- FOOTER ---
const LandingFooter = () => (
  <footer className="backdrop-blur-xl bg-white/[0.04] border-t border-white/[0.08] py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-dark">F</span>
          </div>
          <span className="text-2xl font-bold text-light tracking-wider">
            FROSTBYTE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray hover:text-primary transition-colors text-sm font-medium"
          >
            Demo
          </a>
          <Link
            to="/login"
            className="text-gray hover:text-primary transition-colors text-sm font-medium"
          >
            Login
          </Link>
          <a
            href="#ai-features"
            className="text-gray hover:text-primary transition-colors text-sm font-medium"
          >
            IA
          </a>
          <a
            href="#platform"
            className="text-gray hover:text-primary transition-colors text-sm font-medium"
          >
            Plataforma
          </a>
        </div>

        <p className="text-gray/50 text-sm">
          &copy; 2026 Frostbyte. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);

// --- NAVBAR ---
const LandingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "liquid-glass backdrop-blur-xl bg-white/[0.08] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/landing" className="flex items-center space-x-2">
            <img loading="lazy" decoding="async"
              src="/logo.png"
              alt="Frostbyte"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-light tracking-wider">
              FROSTBYTE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#ai-features"
              className="text-gray hover:text-primary transition-colors text-sm font-medium tracking-wide"
            >
              IA
            </a>
            <a
              href="#platform"
              className="text-gray hover:text-primary transition-colors text-sm font-medium tracking-wide"
            >
              Plataforma
            </a>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray hover:text-primary transition-colors text-sm font-medium tracking-wide"
            >
              Demo
            </a>
            <Button
              asChild
              className="bg-linear-to-r from-primary to-secondary text-dark font-bold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              <Link to="/login">Iniciar Sesion</Link>
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

// --- MAIN LANDING PAGE ---
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <AIFeaturesSection />
        <PlatformSection />
        <DemoSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
