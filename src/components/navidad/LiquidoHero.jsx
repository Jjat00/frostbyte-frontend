import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";
import { useProductsByCategory } from "@/hooks";
import { activeVariants } from "@/lib/variants";
import { NAVIDAD_CUPS } from "@/components/navidad/cups";
import { mountCup, preloadCup } from "@/components/navidad/cupStage";
import { mountLiquid } from "@/components/navidad/liquid";
import "./liquido.css";

gsap.registerPlugin(useGSAP);

/**
 * Navidad, variante "Líquido" (opción 15 del laboratorio `/navidad-lab/`,
 * elegida el 2026-11-13).
 *
 * El fondo es granizado derretido en movimiento (shader) y toma el color del
 * sabor que está en el vaso; el dedo o el ratón lo arrastran como una gota.
 * En el centro, el granizado con gorro y bufanda, con volumen (foto +
 * profundidad), y detrás su nombre gigante, que entra letra por letra.
 *
 * Los sabores son los de la carta: los granizados activos que tienen versión
 * navideña en `cups.js`, con el nombre y el precio que trae la API. Pasan
 * solos cada SECONDS segundos; también con las flechas o deslizando el vaso.
 * Los accesos y el bloque de Instagram son los del hero habitual
 * (`HeroParts`): la campaña cambia la escena, no lo que el local ofrece.
 *
 * Rendimiento: el fondo se pinta a media resolución y se degrada solo si el
 * teléfono no puede (ver liquid.js); fondo, vaso y temporizador se detienen
 * fuera de pantalla y con la pestaña oculta. Con movimiento reducido no hay
 * pase automático ni animación: un fotograma quieto y las flechas.
 */

const SECONDS = 6;
// Mientras llega la carta: rojo de Navidad, sin vaso.
const WAITING_PALETTE = ["#5a0a12", "#9d0812", "#e3122b"];

const formatPrice = (value) => `$${Math.round(Number(value)).toLocaleString("es-CO")}`;

function priceLabel(product) {
  const prices = activeVariants(product)
    .map((variant) => Number(variant.price))
    .filter((price) => price > 0);
  if (!prices.length) return null;
  const lowest = Math.min(...prices);
  return prices.length > 1 ? `Desde ${formatPrice(lowest)}` : formatPrice(lowest);
}

const Chevron = ({ flip = false }) => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={flip ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"} />
  </svg>
);

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LiquidoHero = () => {
  const rootRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const cupRef = React.useRef(null);
  const tiltRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const shadowRef = React.useRef(null);
  const wordRef = React.useRef(null);
  const barRef = React.useRef(null);
  const liquid = React.useRef(null);
  const cupStage = React.useRef(null);
  const timer = React.useRef(null);
  const halted = React.useRef(false);
  const shown = React.useRef(null);

  const { services, featuredCount, handleAnchorClick } = useHeroServices();
  const { data } = useProductsByCategory("granizados");

  // La carta manda: activo, no "próximamente", con versión navideña y precio.
  const flavors = React.useMemo(
    () =>
      (data?.results || [])
        .filter((product) => product.is_active !== false && !product.is_coming_soon && NAVIDAD_CUPS[product.slug])
        .map((product) => ({ ...NAVIDAD_CUPS[product.slug], name: product.name, slug: product.slug, price: priceLabel(product) }))
        .filter((flavor) => flavor.price),
    [data]
  );

  const [index, setIndex] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const count = flavors.length;
  const flavor = count ? flavors[index % count] : null;
  const flavorKey = flavor?.key;

  const go = React.useCallback(
    (step) => {
      if (count < 2) return;
      setDir(step);
      setIndex((current) => (current + step + count) % count);
    },
    [count]
  );

  // ── Fondo líquido: vive todo el tiempo que el hero esté montado.
  React.useEffect(() => {
    const instance = mountLiquid({
      canvas: canvasRef.current,
      area: rootRef.current,
      palette: WAITING_PALETTE,
      still: reducedMotion(),
    });
    if (!instance) rootRef.current.classList.add("nv-liq--flat");
    liquid.current = instance;
    return () => {
      instance?.destroy();
      liquid.current = null;
    };
  }, []);

  // ── Vaso con volumen: se monta cuando la carta trae el primer sabor.
  const hasCup = count > 0;
  React.useEffect(() => {
    if (!hasCup) return undefined;
    const first = flavors[index % flavors.length];
    const instance = mountCup({
      root: cupRef.current,
      tilt: tiltRef.current,
      img: imgRef.current,
      shadow: shadowRef.current,
      area: rootRef.current,
      cup: first,
      still: reducedMotion(),
    });
    instance.setPaused(halted.current);
    cupStage.current = instance;
    shown.current = first.key;
    return () => {
      instance.destroy();
      cupStage.current = null;
      shown.current = null;
    };
    // Solo al aparecer o desaparecer el vaso; los cambios de sabor van abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCup]);

  // Si la carta cambia y el índice queda fuera, vuelve al primero.
  React.useEffect(() => {
    if (count && index >= count) setIndex(0);
  }, [count, index]);

  // ── Temporizador del pase automático (barra de progreso incluida).
  const restartTimer = React.useCallback(() => {
    timer.current?.kill();
    timer.current = null;
    const bar = barRef.current;
    if (bar) bar.style.transform = "scaleX(0)";
    if (count < 2 || reducedMotion()) return;
    timer.current = gsap.to(bar || {}, {
      scaleX: 1,
      duration: SECONDS,
      ease: "none",
      onComplete: () => go(1),
    });
    if (halted.current) timer.current.pause();
  }, [count, go]);

  // ── Cambio de sabor: color del fondo, vaso, palabra y temporizador.
  React.useEffect(() => {
    if (!flavor) return undefined;
    liquid.current?.setPalette(flavor.liquid);
    restartTimer();

    const word = wordRef.current;
    const animate = !reducedMotion();
    if (word && animate && word.children.length) {
      gsap.fromTo(word.children, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.035, ease: "power3.out", overwrite: true });
    }

    const next = flavors[(index + 1) % count];
    if (next) preloadCup(next).catch(() => {});

    const stage = cupStage.current;
    const cup = cupRef.current;
    if (!stage || !cup || shown.current === flavor.key) return undefined;
    shown.current = flavor.key;
    let alive = true;
    const loaded = preloadCup(flavor).catch(() => null);
    const out = animate
      ? gsap.to(cup, { opacity: 0, xPercent: -7 * dir, duration: 0.2, ease: "power2.in", overwrite: true }).then()
      : Promise.resolve();
    Promise.all([out, loaded])
      .then(() => (alive ? stage.swap(flavor) : null))
      .then(() => {
        if (!alive) return;
        if (animate) gsap.fromTo(cup, { opacity: 0, xPercent: 7 * dir }, { opacity: 1, xPercent: 0, duration: 0.45, ease: "power3.out", overwrite: true });
        else gsap.set(cup, { opacity: 1, xPercent: 0 });
      });
    return () => {
      alive = false;
    };
    // `flavors`/`index` se leen solo para precargar el siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavorKey, restartTimer]);

  // ── Detener todo fuera de pantalla y con la pestaña oculta.
  React.useEffect(() => {
    const root = rootRef.current;
    let visible = true;
    const sync = () => {
      const halt = !visible || document.hidden;
      halted.current = halt;
      liquid.current?.setPaused(halt);
      cupStage.current?.setPaused(halt);
      if (halt) timer.current?.pause();
      else timer.current?.resume();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      timer.current?.kill();
    };
  }, []);

  // ── La palabra gigante ocupa el ancho del escenario sin pasarse de alto.
  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!stage || !word) return undefined;
    const fit = () => {
      word.style.fontSize = "100px";
      const width = word.offsetWidth;
      if (!width) return;
      const size = Math.min((100 * stage.clientWidth * 0.98) / width, stage.clientHeight * 0.62);
      word.style.fontSize = `${size.toFixed(1)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [flavor?.word]);

  // ── Entrada del bloque, igual que el hero habitual.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.set(".hero-reveal", { transition: "none" });
      gsap.from(".hero-reveal", {
        opacity: 0,
        y: 14,
        duration: 0.5,
        stagger: 0.04,
        delay: 0.15,
        ease: "power2.out",
        clearProps: "opacity,transform,transition",
      });
    },
    { scope: rootRef }
  );

  // Deslizar el vaso con el dedo.
  const swipe = React.useRef(null);
  const onPointerDown = (event) => {
    swipe.current = event.clientX;
  };
  const onPointerUp = (event) => {
    if (swipe.current === null) return;
    const dx = event.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
  };

  const word = flavor?.word ?? "Navidad";

  return (
    <section ref={rootRef} className="nv-liq" style={flavor ? { "--nv-flavor": flavor.liquid[1] } : undefined}>
      <canvas ref={canvasRef} className="nv-liq__canvas" aria-hidden="true" />
      <div className="nv-liq__veil" aria-hidden="true" />

      <div className="nv-liq__content container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:gap-10">
          <div className="nv-liq__top">
            <div className="hero-reveal nv-liq__head">
              <h1 className="nv-liq__brand">FROSTBYTE</h1>
              <p className="nv-liq__loc">Feliz Navidad · Cumbal, Nariño</p>
            </div>

            <div ref={stageRef} className="nv-liq__stage">
              <p className="nv-liq__word" aria-hidden="true">
                <span ref={wordRef}>
                  {[...word].map((letter, i) => (
                    <i key={`${word}-${i}`}>{letter === " " ? "\u00A0" : letter}</i>
                  ))}
                </span>
              </p>

              {flavor && (
                <div className="nv-liq__cupline">
                  <button type="button" className="nv-liq__nav" onClick={() => go(-1)} aria-label="Sabor anterior" disabled={count < 2}>
                    <Chevron />
                  </button>
                  <div
                    ref={cupRef}
                    className="nv-liq__cup"
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => { swipe.current = null; }}
                  >
                    <div ref={shadowRef} className="nv-liq__shadow" />
                    <div ref={tiltRef} className="nv-liq__tilt">
                      <img ref={imgRef} src={flavor.src} alt="" draggable="false" decoding="async" />
                    </div>
                  </div>
                  <button type="button" className="nv-liq__nav" onClick={() => go(1)} aria-label="Sabor siguiente" disabled={count < 2}>
                    <Chevron flip />
                  </button>
                </div>
              )}
            </div>

            <div className="hero-reveal nv-liq__info">
              {flavor && (
                <div className="nv-liq__flavor">
                  <p className="nv-liq__now" aria-live="polite">
                    <span className="nv-liq__name">{flavor.name}</span>
                    <span className="nv-liq__price">{flavor.price}</span>
                  </p>
                  <span className="nv-liq__progress" aria-hidden="true">
                    <b ref={barRef} />
                  </span>
                  <a href="#granizados" onClick={handleAnchorClick} className="nv-liq__more">
                    Ver todos los granizados
                  </a>
                </div>
              )}
              <p className="nv-liq__tag">
                Granizados, frappés, cócteles, micheladas y shots en Cumbal, Nariño.
              </p>
              <HeroSocial onAnchorClick={handleAnchorClick} />
            </div>
          </div>

          <HeroServiceGrid
            services={services}
            featuredCount={featuredCount}
            onAnchorClick={handleAnchorClick}
          />
        </div>
      </div>
    </section>
  );
};

export default LiquidoHero;
