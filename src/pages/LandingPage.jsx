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
  Wallet,
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
  QrCode,
  ChefHat,
  Bike,
  MapPin,
  Route,
  Bell,
  Building2,
  LayoutGrid,
  Store,
  PenLine,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

gsap.registerPlugin(useGSAP);

/**
 * Landing pública del SaaS (`/landing`): Frostbyte como plataforma para
 * restaurantes y bares.
 *
 * Lenguaje visual: el mismo de la carta (`minimal.css`) desde el 2026-08-28
 * (fondo con grano `fb-section`, vidrio rebajado `fb-card` sin
 * `backdrop-filter`, Orbitron con tracking amplio, botones de borde `fb-btn`,
 * entradas cortas `fb-reveal` y GSAP solo en el hero). El color significa
 * algo: magenta para lo que hace la IA, cyan para la operación del negocio,
 * neutro el resto.
 *
 * Contenido: hasta el 2026-08-31 la página solo contaba el menú digital con
 * IA y se había quedado atrás frente a lo que la plataforma hace hoy. Ahora
 * cuenta las tres puertas por las que entra un pedido (QR de mesa, app del
 * cliente y agente de IA en WhatsApp), los domicilios propios con la zona
 * dibujada en el mapa, y la operación completa (cocina en vivo, mesas por
 * piso con sus QR, inventario, gastos, analítica y dos negocios en un mismo
 * sistema).
 *
 * Regla al editar este archivo: solo se anuncia lo que existe en `main`. Nada
 * de multi-sede, facturación electrónica ni integraciones que aún no están.
 */

// Acento cyan para las secciones de operación: el mismo mecanismo que usan
// las secciones de producto de la carta (`--fb-accent` en el contenedor).
const CYAN_SECTION = {
  "--fb-accent": "var(--color-secondary)",
  "--fb-accent-2": "var(--color-primary)",
};

// --- HERO ---
const heroChecks = [
  "Agente de IA en WhatsApp",
  "Domicilios propios",
  "QR por mesa",
  "Cocina en tiempo real",
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
            Plataforma para bares y restaurantes
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
            El sistema completo de tu local: carta con QR en cada mesa, pedidos
            por WhatsApp que atiende una IA, domicilios propios sin comisiones,
            cocina en vivo, inventario y caja. Un solo lugar, sin apps que
            instalar.
          </p>

          <div className="hero-reveal flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => scrollTo("canales")}
              className="fb-btn fb-btn--accent cursor-pointer"
            >
              Ver todo lo que hace
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
  { value: "3", label: "Canales de pedido, una sola cocina", icon: Layers },
  { value: "14", label: "Módulos en la misma cuenta", icon: LayoutGrid },
  { value: "0", label: "Comisiones por pedido", icon: Wallet },
  { value: "24/7", label: "IA respondiendo en WhatsApp", icon: Clock },
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

// --- CANALES DE PEDIDO ---
const channels = [
  {
    icon: QrCode,
    title: "El QR de la mesa",
    description:
      "Cada mesa tiene su código, y el código sabe en qué piso está. El cliente escanea, ve la carta con fotos y precios al día, pide su canción, sigue el estado de su pedido y juega mientras espera.",
    detail: "Sin descargar nada, sin registrarse",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp con agente de IA",
    description:
      "Un agente atiende el chat del negocio a toda hora: arma el pedido, cotiza el total, revisa si la dirección entra en tu zona y lo crea en el sistema. Si el cliente se sale del libreto, le pasa la conversación a una persona.",
    detail: "Contesta a las 11 de la noche y en hora pico",
  },
  {
    icon: ShoppingCart,
    title: "Pedidos desde la app",
    description:
      "El cliente entra con Google, arma el carrito con variantes y adiciones, marca su casa en el mapa y paga contra entrega. Después sigue su pedido en vivo, con estados y la ruta hasta su puerta.",
    detail: "Domicilio o para recoger, cada uno con su interruptor",
  },
];

const ChannelsSection = () => (
  <section id="canales" className="fb-section scroll-mt-16 py-16 md:py-20">
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Por dónde entran los pedidos"
        title="Tres puertas, una sola cocina"
        description="Tus clientes piden como les quede cómodo. Da igual por dónde entre: el pedido cae en la misma pantalla de cocina, con el mismo historial y las mismas cuentas."
        className="mb-12"
      />

      <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.title}
            className="fb-card fb-card--lift fb-reveal flex h-full flex-col p-5"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
              <channel.icon size={18} className="text-primary" />
            </span>

            <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
              {channel.title}
            </h3>

            <p className="mt-2.5 flex-1 text-[0.75rem] leading-relaxed text-light/50">
              {channel.description}
            </p>

            <p className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[0.68rem] leading-snug text-light/65">
              <Check size={13} className="flex-shrink-0 text-primary" />
              {channel.detail}
            </p>
          </div>
        ))}
      </div>

      <p className="fb-reveal mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2.5 text-center text-[0.72rem] leading-relaxed text-light/45">
        <ChefHat size={14} className="flex-shrink-0 text-light/35" />
        Mesa, WhatsApp y app terminan en la misma comanda, con el mismo número
        de pedido y el mismo estado.
      </p>
    </div>
  </section>
);

// --- DOMICILIOS ---
const deliveryPoints = [
  {
    icon: MapPin,
    title: "Dibujas hasta dónde llegas",
    description:
      "La cobertura no es un círculo que te sobra por un lado y te falta por el otro: marcas la zona en el mapa, calle por calle. Fuera de ella el sistema no deja crear el pedido, ni en la app ni por WhatsApp.",
  },
  {
    icon: Wallet,
    title: "Sin comisiones de terceros",
    description:
      "El domicilio es tuyo. El valor del envío se registra aparte y no se mezcla con las ventas del local, así el margen sigue siendo el que es.",
  },
  {
    icon: Route,
    title: "El cliente ve dónde va su pedido",
    description:
      "Estados claros, tiempo estimado y la ruta hasta su casa, con un código de acceso para consultarlo. Nadie tiene que llamar a preguntar si ya salió.",
  },
  {
    icon: Bell,
    title: "Avisos automáticos",
    description:
      "Cuando el pedido se confirma, sale o queda listo para recoger, el cliente se entera solo, por WhatsApp o en la app.",
  },
];

const DeliverySection = () => (
  <section
    id="domicilios"
    className="fb-section scroll-mt-16 border-y border-white/[0.06] py-16 md:py-20"
    style={CYAN_SECTION}
  >
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Domicilios propios"
        title="Tus domicilios, tus reglas"
        description="Sin plataformas de por medio, sin comisiones y sin entregarle tus clientes a nadie. Tú decides la zona, el horario y cuándo se prende o se apaga el servicio."
        className="mb-12"
      />

      <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
        {deliveryPoints.map((point) => (
          <div
            key={point.title}
            className="fb-card fb-reveal flex h-full gap-4 p-5"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
              <point.icon size={18} className="text-secondary" />
            </span>

            <div>
              <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
                {point.title}
              </h3>
              <p className="mt-2.5 text-[0.75rem] leading-relaxed text-light/50">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="fb-reveal mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2">
        <span className="fb-pill">
          <Bike size={12} className="text-secondary" />
          Domicilio
        </span>
        <span className="fb-pill">
          <Store size={12} className="text-secondary" />
          Para recoger
        </span>
        <span className="fb-pill">
          <Users size={12} className="text-secondary" />
          En el local
        </span>
        <span className="fb-pill">
          <Shield size={12} className="text-secondary" />
          Cerrado significa cerrado: lo impone el sistema, no un aviso
        </span>
      </div>
    </div>
  </section>
);

// --- FUNCIONES DE IA ---
const aiFeatures = [
  {
    icon: MessageSquare,
    title: "Un agente que toma pedidos",
    description:
      "Conoce tu carta, los precios y lo que ese cliente pidió la última vez. Cotiza, verifica cobertura, crea el pedido, lo modifica o lo cancela, y avisa cuando va en camino. Cuando conviene, llama a una persona del equipo.",
    highlight: "Atiende el chat cuando tú no puedes",
  },
  {
    icon: ImageIcon,
    title: "Fotos profesionales al instante",
    description:
      "Sube una foto básica del producto y obtén una imagen lista para la carta. Sin fotógrafo y sin edición manual. Cada imagen queda guardada en tu biblioteca para reutilizarla o asignarla a otro producto.",
    highlight: "Ahorra horas de producción fotográfica",
  },
  {
    icon: Brain,
    title: "Recomendaciones que venden",
    description:
      "Tus clientes dicen cómo se sienten o responden un quiz rápido, y la app les recomienda el producto perfecto de tu carta. Cada consulta es una oportunidad de venta, no una lista de precios más.",
    highlight: "Sube el ticket promedio sin presionar a nadie",
  },
  {
    icon: Mic,
    title: "Búsqueda por voz",
    description:
      "El cliente habla como hablaría en la barra, dice qué se le antoja o qué anda buscando, y el sistema responde con lo mejor de tu carta. Sin escribir y sin menús interminables.",
    highlight: "Experiencia accesible y sin fricción",
  },
  {
    icon: PenLine,
    title: "Descripciones que enamoran",
    description:
      "Agregas un producto y la IA escribe su descripción. Copy que suena a tu negocio, en segundos, para los cien productos que nunca ibas a sentarte a redactar.",
    highlight: "Tu carta completa, bien contada",
  },
  {
    icon: Sparkles,
    title: "Contenido fresco cada día",
    description:
      "La carta no se ve igual dos días seguidos: frases propias, historias reales de cada trago y detalles que cambian solos para que quien vuelve encuentre algo nuevo.",
    highlight: "Tu marca siempre activa, sin esfuerzo",
  },
];

const AIFeaturesSection = () => (
  <section id="ia" className="fb-section scroll-mt-16 py-16 md:py-20">
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Inteligencia artificial"
        title="La IA trabaja por ti"
        description="No es un chatbot pegado encima. La IA está metida donde duele: atender, vender, producir contenido y quitarte trabajo de encima."
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

// --- OPERACIÓN ---
const platformFeatures = [
  {
    icon: ChefHat,
    title: "Cocina en vivo",
    description:
      "Los pedidos entran a la pantalla de cocina en el momento, con sus notas y sus adiciones, y cambian de estado a la vista de todos. Se acabó gritar comandas y perder papeles.",
  },
  {
    icon: QrCode,
    title: "Mesas por piso, con sus QR",
    description:
      "Cada piso con su numeración y su barra. Generas los códigos con el estilo de tu marca y los imprimes en hoja, con las copias que necesites para reponer.",
  },
  {
    icon: Package,
    title: "Inventario que avisa",
    description:
      "Materias primas, movimientos, alertas de stock bajo y órdenes de compra a proveedores. Con la receta de cada producto sabes cuánto te cuesta de verdad lo que vendes.",
  },
  {
    icon: Wallet,
    title: "Gastos y margen sin trampas",
    description:
      "Gastos del día y recurrentes, separando lo que es gasto de lo que es inversión. El margen que ves es el margen que hay, no un número inflado.",
  },
  {
    icon: BarChart3,
    title: "Los números que sí decides",
    description:
      "Ventas por día y por hora, productos que más salen, horarios pico e histórico completo. Sabes qué quitar de la carta y a qué hora poner más gente.",
  },
  {
    icon: Building2,
    title: "Dos negocios, un sistema",
    description:
      "Puedes tener la cocina y el bar como negocios distintos, cada uno con su catálogo y sus ventas, operados por el mismo equipo desde la misma cuenta.",
  },
];

const extraModules = [
  "Reservas de mesa y salón",
  "Música por piso con Spotify",
  "Pantallas del local",
  "Feedback de clientes",
  "Juegos multijugador",
  "Variantes y adiciones",
  "Recetarios del equipo",
  "Roles de administrador y empleado",
  "Historial y estadísticas de pedidos",
];

const PlatformSection = () => (
  <section
    id="operacion"
    className="fb-section scroll-mt-16 border-y border-white/[0.06] py-16 md:py-20"
    style={CYAN_SECTION}
  >
    <div className="container relative z-10 mx-auto px-5">
      <SectionHeading
        eyebrow="Operación completa"
        title="Todo el negocio en un solo lugar"
        description="Olvida los cuadernos, las hojas de cálculo y las cinco apps sueltas. Lo que pasa en la mesa, en la cocina, en la bodega y en la caja vive en el mismo sistema."
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

      <div className="fb-reveal mx-auto mt-8 max-w-4xl">
        <p className="mb-3 text-center text-[0.7rem] uppercase tracking-[0.18em] text-light/35">
          Y además
        </p>
        <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
          {extraModules.map((item) => (
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

// --- DEMO EN PRODUCCIÓN ---
const demoHighlights = [
  { icon: Brain, label: "Quiz IA", desc: "Recomienda según tu mood" },
  { icon: Mic, label: "Búsqueda por voz", desc: "Habla y encuentra" },
  { icon: Bike, label: "Domicilios", desc: "Carrito, mapa y ruta" },
  { icon: Users, label: "Sin registro", desc: "Acceso inmediato" },
];

// Las dos notas al costado del navegador. Antes flotaban en bucle infinito;
// ahora están quietas (regla 5 del lenguaje: nada infinito).
const demoNotes = [
  {
    icon: MessageSquare,
    title: "«¿Tienen salchipapas?»",
    desc: "La IA arma el pedido y cotiza",
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
          description="Esto no es un mockup. Es un bar real operando con Frostbyte todos los días: carta, domicilios, cocina, inventario y caja, con clientes reales pidiendo ahora mismo."
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
                  frostbyte.com.co
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6 md:p-10">
              <div className="text-center">
                <span className="fb-eyebrow fb-eyebrow--accent inline-flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Carta digital en vivo
                </span>
                <h3 className="font-display m-0 mt-3 text-xl font-semibold leading-none tracking-[0.16em] text-light md:text-2xl">
                  FROSTBYTE
                </h3>
                <p className="mx-auto mt-3 max-w-md text-[0.75rem] leading-relaxed text-light/50">
                  Explora la carta con recomendaciones personalizadas, búsqueda
                  por voz, historias de cada trago y pedido a domicilio.
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
          description="Un local no necesita cinco apps sueltas ni pagarle comisión a nadie por sus propios clientes. Necesita un sistema, y este ya está funcionando."
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
  { label: "Canales", href: "#canales" },
  { label: "Domicilios", href: "#domicilios" },
  { label: "IA", href: "#ia" },
  { label: "Operación", href: "#operacion" },
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
  { label: "Canales", href: "#canales" },
  { label: "IA", href: "#ia" },
  { label: "Operación", href: "#operacion" },
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
        <ChannelsSection />
        <DeliverySection />
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
