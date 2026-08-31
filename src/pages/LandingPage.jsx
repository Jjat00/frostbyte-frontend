import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Sparkles,
  Image as ImageIcon,
  Mic,
  MessageSquare,
  Brain,
  ShoppingCart,
  Package,
  BarChart3,
  DollarSign,
  Gamepad2,
  ArrowRight,
  Globe,
  Check,
  ExternalLink,
  Layers,
  TrendingUp,
  Users,
  Clock,
  Shield,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

gsap.registerPlugin(useGSAP);

/**
 * Landing pública del SaaS (`/landing`): Frostbyte como plataforma para
 * restaurantes y bares.
 *
 * Hasta el 2026-08-28 seguía en el lenguaje anterior de la carta (titulares
 * `font-black` con el texto en degradado, `backdrop-blur-xl`, orbes de
 * `blur-[120px]`, un canvas binario con `requestAnimationFrame` permanente,
 * `animate-pulse` y tarjetas flotando en bucle, botones de bloque saturado y
 * un degradado distinto por tarjeta). La ruta `/` había pasado el 2026-08-20
 * al lenguaje del hero de servicios (`minimal.css`), así que al saltar de una
 * a otra la marca cambiaba de personalidad.
 *
 * Ahora habla igual que la carta: fondo de degradado con grano (`fb-section`),
 * vidrio rebajado sin `backdrop-filter` (`fb-card`), Orbitron 500/600 con
 * tracking amplio, botones de borde (`fb-btn`) y entradas cortas
 * (`fb-reveal`, GSAP en el hero). El color significa algo: magenta para lo
 * que hace la IA, cyan para la gestión de la plataforma, neutro el resto.
 *
 * Las secciones y el contenido son los mismos; solo cambia cómo se ven.
 */

// Acento cyan para la sección de gestión: el mismo mecanismo que usan las
// secciones de producto de la carta (`--fb-accent` en el contenedor).
const CYAN_SECTION = {
  "--fb-accent": "var(--color-secondary)",
  "--fb-accent-2": "var(--color-primary)",
};

// --- HERO ---
const heroChecks = [
  "Menú inteligente",
  "Recomendaciones por voz",
  "Imágenes generadas con IA",
  "Gestión en tiempo real",
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const HeroSection = () => {
  const sectionRef = useRef(null);

  // Misma entrada que el hero de la carta: opacidad y 14 px, en cascada.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="fb-section flex min-h-[100svh] items-center pt-24 pb-14 md:pt-28"
    >
      <div className="container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:gap-8">
          <span className="hero-reveal fb-eyebrow fb-eyebrow--accent">
            Potenciado con inteligencia artificial
          </span>

          <h1 className="hero-reveal m-0 flex flex-col items-center gap-3 md:gap-4">
            <span className="font-display text-[clamp(2.2rem,11vw,3.25rem)] font-semibold leading-none tracking-[0.16em] text-light md:text-[clamp(3.5rem,8vw,6.5rem)] md:tracking-[0.03em]">
              FROSTBYTE
            </span>
            <span className="font-display text-[0.7rem] font-medium uppercase tracking-[0.32em] text-light/60 md:text-[0.95rem]">
              Tu negocio. Otro nivel.
            </span>
          </h1>

          <span aria-hidden className="hero-reveal fb-rule" />

          <p className="hero-reveal max-w-xl text-xs leading-relaxed text-light/55 md:text-[0.9rem]">
            La plataforma all-in-one que transforma la forma en que gestionas
            tu restaurante o bar. Menú digital con IA que recomienda, genera
            contenido y entiende a tus clientes.
          </p>

          <div className="hero-reveal flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => scrollTo("ai-features")}
              className="fb-btn fb-btn--accent cursor-pointer"
            >
              Descubrir Frostbyte
              <ArrowRight size={15} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn"
            >
              <ExternalLink size={15} />
              Ver demo en vivo
            </a>
          </div>

          <ul className="hero-reveal m-0 flex list-none flex-wrap justify-center gap-2 p-0">
            {heroChecks.map((item) => (
              <li key={item} className="fb-pill">
                <Check size={12} className="text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// --- CIFRAS ---
const stats = [
  { value: "5+", label: "Funciones de IA activas", icon: Brain },
  { value: "10+", label: "Módulos integrados", icon: Layers },
  { value: "0", label: "Apps que instalar", icon: Globe },
  { value: "24/7", label: "Disponible para tus clientes", icon: Clock },
];

const StatsSection = () => (
  <section className="fb-section fb-section--plain border-y border-white/[0.06] py-10">
    <div className="container relative z-10 mx-auto px-5">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="fb-card fb-reveal flex flex-col items-center p-5 text-center"
          >
            <stat.icon size={16} className="mb-3 text-light/45" />
            <span className="font-display text-2xl font-semibold leading-none tracking-[0.06em] text-light md:text-3xl">
              {stat.value}
            </span>
            <span className="mt-2.5 text-[0.68rem] leading-snug text-light/50">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- FUNCIONES DE IA ---
const aiFeatures = [
  {
    icon: ImageIcon,
    title: "Fotos profesionales al instante",
    description:
      "Sube una foto básica de tu producto y obtén una imagen profesional lista para tu menú. Sin fotógrafo, sin edición manual. La IA transforma tus fotos en contenido de alta calidad.",
    highlight: "Ahorra horas de producción fotográfica",
  },
  {
    icon: Brain,
    title: "Recomendaciones que venden",
    description:
      "Tus clientes dicen cómo se sienten o responden un quiz rápido, y Frostbyte les recomienda el producto perfecto de tu menú. Cada interacción es una oportunidad de venta.",
    highlight: "Aumenta el ticket promedio automáticamente",
  },
  {
    icon: Mic,
    title: "Pedidos y búsquedas por voz",
    description:
      "Los clientes hablan naturalmente y la IA entiende. Dictan su estado de ánimo, lo que buscan o lo que quieren, y el sistema responde con la mejor opción del menú.",
    highlight: "Experiencia accesible y sin fricción",
  },
  {
    icon: Sparkles,
    title: "Contenido fresco cada día",
    description:
      "Tu menú digital nunca se ve igual. Frases únicas, datos curiosos y contenido dinámico que se renueva automáticamente para mantener la atención de tus clientes.",
    highlight: "Tu marca siempre activa, sin esfuerzo",
  },
  {
    icon: MessageSquare,
    title: "Descripciones que enamoran",
    description:
      "Agrega un producto y la IA escribe una descripción irresistible automáticamente. Copy profesional en segundos, optimizado para convertir visitas en pedidos.",
    highlight: "Copywriting profesional automatizado",
  },
  {
    icon: Layers,
    title: "Biblioteca visual inteligente",
    description:
      "Cada imagen generada se guarda con su historial. Reutiliza, compara y asigna directamente a cualquier producto de tu catálogo con un solo clic.",
    highlight: "Todo tu contenido visual organizado",
  },
];

const AIFeaturesSection = () => (
  <section id="ai-features" className="fb-section scroll-mt-16 py-16 md:py-20">
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Inteligencia artificial"
        title="La IA trabaja por ti"
        description="Cada función de IA está diseñada para ahorrarte tiempo, vender más y darle a tus clientes una experiencia que no van a olvidar."
        className="mb-12"
      />

      <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {aiFeatures.map((feature) => (
          <div
            key={feature.title}
            className="fb-card fb-card--lift fb-reveal flex h-full flex-col p-5"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
              <feature.icon size={18} className="text-primary" />
            </span>

            <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
              {feature.title}
            </h3>

            <p className="mt-2.5 flex-1 text-[0.75rem] leading-relaxed text-light/50">
              {feature.description}
            </p>

            <p className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[0.68rem] leading-snug text-light/65">
              <TrendingUp size={13} className="flex-shrink-0 text-primary" />
              {feature.highlight}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- PLATAFORMA ---
const platformFeatures = [
  {
    icon: Globe,
    title: "Menú digital sin app",
    description:
      "Tus clientes escanean un QR y acceden al menú completo. Sin descargas, sin registros. Categorías dinámicas, fotos y precios siempre actualizados.",
  },
  {
    icon: ShoppingCart,
    title: "Pedidos en control total",
    description:
      "Desde que el cliente pide hasta que se entrega. Tracking en tiempo real por mesa, estados claros y notas personalizadas para cada pedido.",
  },
  {
    icon: Package,
    title: "Inventario que se cuida solo",
    description:
      "Sabes exactamente qué tienes, qué necesitas y cuándo pedir. Alertas de stock bajo, recetas vinculadas y órdenes de compra en un solo lugar.",
  },
  {
    icon: DollarSign,
    title: "Finanzas claras",
    description:
      "Registra gastos diarios y recurrentes, establece límites y visualiza a dónde va tu dinero. Reportes que te ayudan a tomar mejores decisiones.",
  },
  {
    icon: BarChart3,
    title: "Datos que importan",
    description:
      "Dashboards con las métricas que necesitas: ventas, productos más pedidos, horarios pico. Información accionable para crecer tu negocio.",
  },
  {
    icon: Gamepad2,
    title: "Experiencias para tus clientes",
    description:
      "Juegos interactivos multijugador en tiempo real. Tus clientes se divierten, se quedan más tiempo y vuelven. Entretenimiento que genera lealtad.",
  },
];

const PlatformSection = () => (
  <section
    id="platform"
    className="fb-section scroll-mt-16 border-y border-white/[0.06] py-16 md:py-20"
    style={CYAN_SECTION}
  >
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Gestión completa"
        title="Todo en un solo lugar"
        description="Olvida las hojas de cálculo, los cuadernos y las apps separadas. Frostbyte centraliza toda la operación de tu negocio."
        className="mb-12"
      />

      <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platformFeatures.map((feature) => (
          <div
            key={feature.title}
            className="fb-card fb-card--lift fb-reveal flex h-full flex-col p-5"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
              <feature.icon size={18} className="text-secondary" />
            </span>

            <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
              {feature.title}
            </h3>

            <p className="mt-2.5 text-[0.75rem] leading-relaxed text-light/50">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- DEMO EN PRODUCCIÓN ---
const demoHighlights = [
  { icon: Brain, label: "Quiz IA", desc: "Te recomienda según tu mood" },
  { icon: Mic, label: "Búsqueda por voz", desc: "Habla y encuentra" },
  { icon: Sparkles, label: "Contenido diario", desc: "Siempre fresco" },
  { icon: Users, label: "Sin registro", desc: "Acceso inmediato" },
];

// Las dos notas al costado del navegador. Antes flotaban en bucle infinito;
// ahora están quietas (regla 5 del lenguaje: nada infinito).
const demoNotes = [
  {
    icon: ImageIcon,
    title: "Foto generada",
    desc: "En 10 segundos",
    accent: "text-primary",
    position: "-right-4 top-1/4",
  },
  {
    icon: Brain,
    title: "«Quiero algo frío»",
    desc: "IA: Granizado de mango",
    accent: "text-secondary",
    position: "-left-4 bottom-1/4",
  },
];

const DemoSection = () => (
  <section className="fb-section fb-section--plain py-16 md:py-20">
    <div className="container relative z-10 mx-auto px-5">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="En producción"
          title="Velo en acción"
          description="Esto no es un mockup. Es un menú digital real, funcionando en producción, con todas las funciones de IA activas. Explóralo tú mismo."
          className="mb-10"
        />

        <div className="relative">
          {/* Ventana de navegador */}
          <div className="fb-card fb-reveal overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
              </div>
              <div className="flex flex-1 justify-center">
                <span className="fb-inset flex w-full max-w-xs items-center justify-center gap-2 px-3 py-1 text-[0.68rem] text-light/40">
                  <Shield size={11} />
                  frostbyte.app
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6 md:p-10">
              <div className="text-center">
                <span className="fb-eyebrow fb-eyebrow--accent inline-flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Menú digital en vivo
                </span>
                <h3 className="font-display m-0 mt-3 text-xl font-semibold leading-none tracking-[0.16em] text-light md:text-2xl">
                  FROSTBYTE
                </h3>
                <p className="mx-auto mt-3 max-w-md text-[0.75rem] leading-relaxed text-light/50">
                  Explora el menú con recomendaciones personalizadas, búsqueda
                  por voz y contenido generado con IA.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {demoHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="fb-inset flex flex-col items-center gap-2 p-3.5 text-center"
                  >
                    <item.icon size={16} className="text-light/55" />
                    <span className="text-[0.72rem] font-medium leading-tight text-light">
                      {item.label}
                    </span>
                    <span className="text-[0.62rem] leading-tight text-light/45">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {demoNotes.map((note) => (
            <div
              key={note.title}
              className={`fb-card absolute hidden p-3.5 lg:block ${note.position}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/[0.1] bg-white/[0.03]">
                  <note.icon size={16} className={note.accent} />
                </span>
                <div>
                  <p className="m-0 text-[0.75rem] font-medium text-light">
                    {note.title}
                  </p>
                  <p className="m-0 text-[0.65rem] text-light/45">{note.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fb-reveal mt-8 text-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="fb-btn fb-btn--accent"
          >
            Explorar demo completa
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  </section>
);

// --- CTA ---
const CTASection = () => (
  <section className="fb-section border-t border-white/[0.06] py-16 md:py-20">
    <div className="container relative z-10 mx-auto px-5">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          title="¿Listo para el siguiente nivel?"
          description="Tu competencia sigue con cuadernos y hojas de cálculo. Tú puedes tener IA trabajando para ti ahora mismo."
        />

        <div className="fb-reveal mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="fb-btn fb-btn--accent"
          >
            Ver demo
            <ArrowRight size={15} />
          </a>
          <Link to="/login" className="fb-btn">
            Iniciar sesión
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// --- PIE ---
const footerLinks = [
  { label: "Demo", href: "/", external: true },
  { label: "IA", href: "#ai-features" },
  { label: "Plataforma", href: "#platform" },
];

const LandingFooter = () => (
  <footer className="fb-section fb-section--plain border-t border-white/[0.06] py-12">
    <div className="container relative z-10 mx-auto px-5">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-linear-to-br from-primary to-secondary">
            <span className="font-display text-base font-semibold text-dark">
              F
            </span>
          </span>
          <span className="font-display text-base font-semibold tracking-[0.14em] text-light">
            FROSTBYTE
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.78rem] text-light/50 transition-colors hover:text-light"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.78rem] text-light/50 transition-colors hover:text-light"
              >
                {link.label}
              </a>
            )
          )}
          <Link
            to="/login"
            className="text-[0.78rem] text-light/50 transition-colors hover:text-light"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>

      <span aria-hidden className="fb-hairline my-8" />

      <p className="m-0 text-center text-[0.72rem] text-light/35">
        © 2026 Frostbyte. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

// --- BARRA DE NAVEGACIÓN ---
const navLinks = [
  { label: "IA", href: "#ai-features" },
  { label: "Plataforma", href: "#platform" },
  { label: "Demo", href: "/", external: true },
];

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-dark/92 border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-4 py-2.5">
        <Link to="/landing" className="flex flex-shrink-0 items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Frostbyte"
            width={40}
            height={40}
            className="h-9 w-9 object-contain md:h-10 md:w-10"
          />
          <span className="font-display text-base font-semibold tracking-[0.14em] text-light">
            FROSTBYTE
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="hidden text-[0.78rem] font-medium tracking-wide text-light/55 transition-colors hover:text-light md:block"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="fb-btn fb-btn--accent rounded-full px-4 py-2 text-[0.7rem]"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};

// --- PÁGINA ---
const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-dark">
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
