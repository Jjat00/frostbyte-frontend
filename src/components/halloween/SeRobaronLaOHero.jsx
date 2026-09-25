import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";
import "./se-robaron-la-o.css";

gsap.registerPlugin(useGSAP);

/**
 * Halloween, variante "Se robaron la O" (opción 1 del comparador del
 * 2026-09-22, idea de Jaime).
 *
 * La O de FROSTBYTE es una calabaza. Cada tanto baja una araña por su hilo,
 * la agarra y se la lleva: el nombre se queda en "FR STBYTE" con el hueco
 * punteado, hasta que la calabaza cae de vuelta y rebota en su sitio. Si
 * alguien toca a la araña mientras baja o carga la calabaza, la suelta y sale
 * huyendo; tocar la calabaza quieta la hace reírse (un saltito). Los accesos y
 * el bloque de Instagram son los del hero habitual (`HeroParts`).
 *
 * Rendimiento: el cielo es CSS (sin imagen que pixele al estirarse), las
 * imágenes son pequeñas y el robo anima solo transform y opacity con GSAP.
 * Fuera de pantalla el robo se pausa y los bucles CSS también (`is-asleep`).
 * Con movimiento reducido la calabaza se queda quieta y la araña no aparece.
 */

const IMG = "/images/halloween";

// FR·O·STBYTE: cada letra algo torcida, como el lettering de la referencia.
const BEFORE = [
  { c: "F", r: -4, y: 0 },
  { c: "R", r: 3, y: 0.03 },
];
const AFTER = [
  { c: "S", r: -3, y: -0.02 },
  { c: "T", r: 4, y: 0 },
  { c: "B", r: -2, y: 0.04 },
  { c: "Y", r: 5, y: -0.03 },
  { c: "T", r: -4, y: 0 },
  { c: "E", r: 3, y: 0.02 },
];

const Letter = ({ c, r, y }) => (
  <span className="hw-thief__letter" style={{ "--r": `${r}deg`, "--y": `${y}em` }}>
    {c}
  </span>
);

const SeRobaronLaOHero = () => {
  const rootRef = React.useRef(null);
  const { services, featuredCount, handleAnchorClick } = useHeroServices();

  useGSAP(
    (_context, contextSafe) => {
      const section = rootRef.current;
      const slot = section.querySelector(".hw-thief__slot");
      const pumpkin = section.querySelector(".hw-thief__pumpkin");
      const rig = section.querySelector(".hw-thief__rig");
      const spider = section.querySelector(".hw-thief__spider");
      const hole = section.querySelector(".hw-thief__hole");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Entrada de las tarjetas, igual que el hero habitual.
      if (!reduce) {
        gsap.set(".hero-reveal", { transition: "none" });
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 14,
          duration: 0.5,
          stagger: 0.04,
          delay: 0.35,
          ease: "power2.out",
          clearProps: "opacity,transform,transition",
        });
      }

      if (reduce) return undefined;

      // Distancia del hueco de la O al borde de arriba del hero: la araña
      // vive justo por encima (recortada por el overflow de la sección). Se
      // mide en cada robo porque la letra web puede cargar después.
      const travel = () =>
        slot.getBoundingClientRect().bottom - section.getBoundingClientRect().top + 24;

      gsap.set(rig, { y: -travel(), autoAlpha: 1 });

      let heist = null;
      let next = null;
      let visible = false;
      // "idle": la calabaza en su sitio; "coming": la araña baja;
      // "carrying": se la lleva; "gone": la O no está; "dropping": cae.
      let phase = "idle";

      const setStolen = (value) => section.classList.toggle("is-stolen", value);

      const schedule = contextSafe((seconds) => {
        next?.kill();
        next = gsap.delayedCall(seconds, () => steal());
        if (!visible) next.pause();
      });

      // La calabaza cae desde lo alto del hero y rebota en su sitio.
      const dropBack = contextSafe((from) =>
        gsap
          .timeline({
            onStart: () => {
              phase = "dropping";
            },
            onComplete: () => {
              phase = "idle";
              setStolen(false);
              schedule(gsap.utils.random(6, 10));
            },
          })
          .set(pumpkin, { y: from, rotation: gsap.utils.random(-25, 25) })
          .to(pumpkin, { y: 0, duration: 0.9, ease: "bounce.out" })
          .to(pumpkin, { rotation: 0, duration: 0.5, ease: "back.out(3)" }, "<0.45")
          .to(hole, { opacity: 0, duration: 0.25 }, "<")
      );

      const steal = contextSafe(() => {
        if (phase !== "idle") return;
        const distance = travel();
        phase = "coming";
        setStolen(true);
        heist = gsap
          .timeline({ onComplete: () => { heist = null; } })
          // Baja por su hilo, se pasa un poco y se asienta.
          .set(rig, { y: -distance })
          .to(rig, { y: 0, duration: 2.2, ease: "power2.out" })
          // La agarra: dos sacudidas.
          .to(rig, { rotation: -7, duration: 0.12 })
          .to(rig, { rotation: 6, duration: 0.12 })
          .to(rig, { rotation: 0, duration: 0.14 })
          .add(() => { phase = "carrying"; })
          // Y se la lleva, con la calabaza ladeándose.
          .to([rig, pumpkin], { y: -distance, duration: 1.7, ease: "power2.in" }, "+=0.2")
          .to(pumpkin, { rotation: -14, duration: 1.7, ease: "power1.in" }, "<")
          .to(hole, { opacity: 1, duration: 0.4 }, "<1.1")
          .add(() => { phase = "gone"; })
          // "FR STBYTE" un momento, y la calabaza vuelve cayendo.
          .add(() => dropBack(-distance), "+=1.8");
        if (!visible) heist.pause();
      });

      // Tocar a la araña mientras baja o carga: suelta la calabaza y huye.
      const onSpider = contextSafe(() => {
        if (phase !== "coming" && phase !== "carrying") return;
        const distance = travel();
        const carried = phase === "carrying";
        heist?.kill();
        heist = null;
        phase = "gone";
        gsap.to(rig, { rotation: 0, duration: 0.1 });
        gsap.to(rig, { y: -distance, duration: 0.55, ease: "power3.in" });
        if (carried) {
          // La suelta a medio camino: cae desde donde iba.
          dropBack(gsap.getProperty(pumpkin, "y"));
        } else {
          phase = "idle";
          setStolen(false);
          schedule(gsap.utils.random(6, 10));
        }
      });

      // Tocar la calabaza quieta: se ríe (un saltito con estirón).
      const onPumpkin = contextSafe(() => {
        if (phase !== "idle" || gsap.isTweening(pumpkin)) return;
        gsap
          .timeline()
          .to(pumpkin, { y: "-=18", scaleY: 1.08, scaleX: 0.94, duration: 0.18, ease: "power2.out" })
          .to(pumpkin, { y: 0, scaleY: 1, scaleX: 1, duration: 0.5, ease: "bounce.out" });
      });

      spider.addEventListener("pointerdown", onSpider);
      pumpkin.addEventListener("pointerdown", onPumpkin);

      // ── Fuera de pantalla no trabaja nada.
      const setVisible = (value) => {
        if (value === visible) return;
        visible = value;
        section.classList.toggle("is-asleep", !value);
        if (value) {
          heist?.resume();
          next?.resume();
        } else {
          heist?.pause();
          next?.pause();
        }
      };
      const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
      io.observe(section);
      setVisible(true);

      // El primer robo, poco después de entrar.
      schedule(2.6);

      return () => {
        io.disconnect();
        next?.kill();
        spider.removeEventListener("pointerdown", onSpider);
        pumpkin.removeEventListener("pointerdown", onPumpkin);
      };
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="hw-thief">
      <div className="hw-thief__scene" aria-hidden="true">
        <div className="hw-thief__sky" />
        <img className="hw-thief__moon" src={`${IMG}/robo-luna.webp`} alt="" width="480" height="480" decoding="async" />
        <img className="hw-thief__tree hw-thief__tree--l" src={`${IMG}/robo-arbol.webp`} alt="" width="600" height="900" decoding="async" />
        <img className="hw-thief__tree hw-thief__tree--r" src={`${IMG}/robo-arbol.webp`} alt="" width="600" height="900" decoding="async" />
        <img className="hw-thief__bats" src={`${IMG}/robo-murcielagos.webp`} alt="" width="420" height="459" decoding="async" />
        <img className="hw-thief__tombs" src={`${IMG}/robo-lapidas.webp`} alt="" width="700" height="582" decoding="async" />
        <div className="hw-thief__shade" />
      </div>

      <div className="hw-thief__content container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:gap-10">
          <div className="hero-reveal hw-thief__head">
            <div className="hw-thief__title">
              <p className="hw-thief__kicker">
                <span className="hw-thief__kicker-calm">Temporada de Halloween</span>
                <span className="hw-thief__kicker-alarm" aria-hidden="true">
                  ¡Toca la araña, se lleva la O!
                </span>
              </p>
              <h1 className="hw-thief__brand">
                <span className="sr-only">FROSTBYTE</span>
                <span className="hw-thief__word" aria-hidden="true">
                  {BEFORE.map((l, i) => <Letter key={i} {...l} />)}
                  <span className="hw-thief__slot">
                    <span className="hw-thief__hole" />
                    <span className="hw-thief__pumpkin">
                      <img src={`${IMG}/robo-calabaza.webp`} alt="" width="320" height="307" decoding="async" />
                    </span>
                    <span className="hw-thief__rig">
                      <span className="hw-thief__thread" />
                      <img className="hw-thief__spider" src={`${IMG}/robo-arana.webp`} alt="" width="300" height="240" decoding="async" />
                    </span>
                  </span>
                  {AFTER.map((l, i) => <Letter key={i} {...l} />)}
                </span>
              </h1>
              <p className="hw-thief__loc">CUMBAL · NARIÑO</p>
            </div>

            <div className="hw-thief__side">
              <p className="hw-thief__tag">
                Granizados, frappés, cócteles, micheladas y shots en Cumbal,
                Nariño.
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

export default SeRobaronLaOHero;
