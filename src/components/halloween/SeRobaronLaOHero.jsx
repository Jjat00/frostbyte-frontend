import React from "react";
import { createPortal } from "react-dom";
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
 * se queda colgando un momento, la agarra y se la lleva: el nombre se queda en
 * "FR STBYTE" con el hueco punteado, hasta que la calabaza cae de vuelta y
 * rebota en su sitio. Los accesos y el bloque de Instagram son los del hero
 * habitual (`HeroParts`).
 *
 * Con la araña a la vista:
 * - Un toque la asusta: suelta la calabaza y sale huyendo.
 * - Se puede arrastrar con el dedo o el ratón. El hilo es un resorte: cuanto
 *   más se jala, más cuesta (goma), y al soltarla vuelve rebotando. Si carga
 *   la calabaza, la calabaza viene con ella.
 * - Si se jala demasiado, el hilo se rompe y la araña salta a la pantalla y
 *   muerde donde estaba el dedo (`mordida.webp`, generada con Codex).
 * Tocar la calabaza quieta la hace reírse (un saltito).
 *
 * Rendimiento: el cielo es CSS (sin imagen que pixele al estirarse), las
 * imágenes son pequeñas y todo anima transform y opacity con GSAP. Fuera de
 * pantalla el robo se pausa y los bucles CSS también (`is-asleep`). Con
 * movimiento reducido la calabaza se queda quieta y la araña no aparece.
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

// El hilo como goma: el desplazamiento visible crece cada vez menos
// (raw / (1 + raw / RUBBER)). Se rompe cuando el dedo se aleja más de
// SNAP px del punto donde agarró; desde TAUT del camino, el hilo avisa.
const RUBBER = 380;
const SNAP_MOBILE = 170;
const SNAP_DESKTOP = 230;
const TAUT = 0.6;

const Letter = ({ c, r, y }) => (
  <span className="hw-thief__letter" style={{ "--r": `${r}deg`, "--y": `${y}em` }}>
    {c}
  </span>
);

const SeRobaronLaOHero = () => {
  const rootRef = React.useRef(null);
  const biteRef = React.useRef(null);
  const { services, featuredCount, handleAnchorClick } = useHeroServices();

  useGSAP(
    (_context, contextSafe) => {
      const section = rootRef.current;
      const slot = section.querySelector(".hw-thief__slot");
      const pumpkin = section.querySelector(".hw-thief__pumpkin");
      const rig = section.querySelector(".hw-thief__rig");
      const body = section.querySelector(".hw-thief__body");
      const thread = section.querySelector(".hw-thief__thread");
      const hole = section.querySelector(".hw-thief__hole");
      const bite = biteRef.current;
      const biteSpider = bite.querySelector(".hw-bite__spider");
      const biteFlash = bite.querySelector(".hw-bite__flash");
      const biteMarks = bite.querySelector(".hw-bite__marks");
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
      gsap.set(thread, { transformOrigin: "50% 100%" });

      let heist = null;
      let next = null;
      let visible = false;
      // "idle": la calabaza en su sitio; "coming": la araña baja o cuelga;
      // "carrying": se la lleva; "gone": la O no está; "dropping": cae;
      // "biting": el hilo se rompió y la araña está mordiendo.
      let phase = "idle";

      const setStolen = (value) => section.classList.toggle("is-stolen", value);

      const schedule = contextSafe((seconds) => {
        next?.kill();
        next = gsap.delayedCall(seconds, () => steal());
        if (!visible) next.pause();
      });

      const rest = () => {
        phase = "idle";
        setStolen(false);
        schedule(gsap.utils.random(6, 10));
      };

      // La calabaza cae desde `from` y rebota en su sitio.
      const dropBack = contextSafe((from) =>
        gsap
          .timeline({
            onStart: () => {
              phase = "dropping";
            },
            onComplete: rest,
          })
          .set(pumpkin, { y: from, rotation: gsap.utils.random(-25, 25) })
          .to(pumpkin, { x: 0, y: 0, duration: 0.9, ease: "bounce.out" })
          .to(pumpkin, { rotation: 0, duration: 0.5, ease: "back.out(3)" }, "<0.45")
          .to(hole, { opacity: 0, duration: 0.25 }, "<")
      );

      const steal = contextSafe(() => {
        if (phase !== "idle") return;
        const distance = travel();
        phase = "coming";
        setStolen(true);
        // La imagen de la mordida se pide cuando aparece la araña, no antes.
        if (!biteSpider.getAttribute("src")) biteSpider.src = biteSpider.dataset.src;
        heist = gsap
          .timeline({ onComplete: () => { heist = null; } })
          // Baja por su hilo y se queda colgando, meciéndose: es el rato
          // para agarrarla.
          .set(rig, { y: -distance, rotation: 0 })
          .to(rig, { y: 0, duration: 2.2, ease: "power2.out" })
          .to(rig, { rotation: 5, duration: 0.6, ease: "sine.inOut" })
          .to(rig, { rotation: -5, duration: 1.2, ease: "sine.inOut" })
          .to(rig, { rotation: 0, duration: 0.6, ease: "sine.inOut" })
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

      // ── La araña en la mano ──────────────────────────────────────────
      // `pos` es cuánto se aparta el cuerpo de donde cuelga; el hilo va de
      // su punto de anclaje (el techo del hero) hasta el cuerpo.
      const pos = { x: 0, y: 0 };
      let grab = null;
      let anchorH = 0;
      let spring = null;

      const snapAt = () => (window.innerWidth >= 768 ? SNAP_DESKTOP : SNAP_MOBILE);

      const sync = () => {
        const len = Math.hypot(pos.x, anchorH + pos.y);
        gsap.set(body, { x: pos.x, y: pos.y, rotation: gsap.utils.clamp(-28, 28, pos.x * 0.18) });
        gsap.set(thread, {
          x: pos.x,
          y: pos.y,
          rotation: (Math.atan2(-pos.x, anchorH + pos.y) * 180) / Math.PI,
          scaleY: len / anchorH,
        });
        // Si carga la calabaza, la calabaza viene con ella.
        const hold = grab ?? spring;
        if (hold?.holding) gsap.set(pumpkin, { x: pos.x, y: hold.pumpkinY + pos.y });
      };

      // El hilo vuelve a su largo normal cuando la araña ya no se aparta.
      const relaxThread = () => {
        gsap.set(thread, { clearProps: "height,x,y,rotation,scaleY,clipPath" });
        gsap.set(thread, { transformOrigin: "50% 100%" });
        section.classList.remove("is-taut");
        anchorH = 0;
      };

      // Un toque (sin arrastrar): se asusta, suelta la calabaza y huye.
      const flee = contextSafe(() => {
        const distance = travel();
        const carried = phase === "carrying";
        heist?.kill();
        heist = null;
        phase = "gone";
        gsap.to(rig, { rotation: 0, duration: 0.1 });
        gsap.to(rig, { y: -distance, duration: 0.55, ease: "power3.in" });
        if (carried) dropBack(gsap.getProperty(pumpkin, "y"));
        else rest();
      });

      // El hilo se rompe: la araña salta a la pantalla y muerde donde estaba
      // el dedo.
      const snap = contextSafe((clientX, clientY) => {
        const carried = grab.holding;
        const pumpkinY = grab.pumpkinY + pos.y;
        grab = null;
        heist?.kill();
        heist = null;
        phase = "biting";
        section.classList.remove("is-taut");
        navigator.vibrate?.([40, 30, 90]);

        const rect = body.getBoundingClientRect();
        const size = biteSpider.offsetWidth;
        const biteX = clientX - size / 2;
        gsap
          .timeline({
            onComplete: () => {
              // Vuelve a su sitio de siempre, fuera de la vista.
              pos.x = 0;
              pos.y = 0;
              gsap.set(body, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 });
              gsap.set(rig, { y: -travel(), rotation: 0 });
              relaxThread();
              if (carried) dropBack(pumpkinY);
              else rest();
            },
          })
          // El hilo se recoge hacia arriba y la araña se lanza hacia ti.
          .to(thread, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.22, ease: "power4.out" }, 0)
          .to(body, { scale: 1.7, autoAlpha: 0, duration: 0.14, ease: "power2.in" }, 0)
          .set(bite, { autoAlpha: 1 }, 0)
          .fromTo(
            biteSpider,
            {
              x: rect.left + rect.width / 2 - size / 2,
              y: rect.top + rect.height / 2 - size / 2,
              scale: 0.15,
              autoAlpha: 0,
            },
            {
              x: biteX,
              y: clientY - size / 2,
              scale: 1.15,
              autoAlpha: 1,
              duration: 0.2,
              ease: "power4.in",
            },
            0.04
          )
          // La mordida: destello, sacudida y las dos marcas.
          .set(biteMarks, { x: clientX, y: clientY }, 0.24)
          .fromTo(biteMarks, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.18, ease: "back.out(3)" }, 0.24)
          .fromTo(biteFlash, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.24)
          .to(biteFlash, { autoAlpha: 0, duration: 0.5 }, 0.32)
          .to(biteSpider, { keyframes: { x: [biteX + 14, biteX - 10, biteX + 8, biteX] }, duration: 0.24, ease: "none" }, 0.24)
          // Se suelta y desaparece; las marcas se quedan un rato.
          .to(biteSpider, { scale: 1.5, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0.62)
          .to(biteMarks, { autoAlpha: 0, duration: 0.6 }, 1.9)
          .set(bite, { autoAlpha: 0 });
      });

      const onDown = contextSafe((event) => {
        if (phase !== "coming" && phase !== "carrying") return;
        if (grab) return;
        event.preventDefault();
        body.setPointerCapture?.(event.pointerId);
        heist?.pause();
        spring?.tween.kill();
        const holding = phase === "carrying" || !!spring?.holding;
        const pumpkinY = spring?.pumpkinY ?? gsap.getProperty(pumpkin, "y");
        spring = null;
        if (!anchorH) {
          // Largo del hilo en reposo: del cuerpo al techo del hero.
          anchorH = Math.max(
            40,
            thread.getBoundingClientRect().bottom - section.getBoundingClientRect().top
          );
          gsap.set(thread, { height: anchorH });
        }
        grab = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          // Si la agarran mientras rebota, se sigue desde donde va.
          rawX: pos.x,
          rawY: pos.y,
          time: performance.now(),
          moved: false,
          holding,
          pumpkinY,
        };
        section.classList.add("is-grabbing");
      });

      const onMove = contextSafe((event) => {
        if (!grab || event.pointerId !== grab.id) return;
        const rawX = grab.rawX + event.clientX - grab.startX;
        const rawY = grab.rawY + event.clientY - grab.startY;
        const raw = Math.hypot(rawX, rawY);
        if (raw > 6) grab.moved = true;
        const limit = snapAt();
        if (raw > limit) {
          snap(event.clientX, event.clientY);
          return;
        }
        const k = 1 / (1 + raw / RUBBER);
        pos.x = rawX * k;
        pos.y = rawY * k;
        section.classList.toggle("is-taut", raw > limit * TAUT);
        sync();
      });

      const onUp = contextSafe((event) => {
        if (!grab || event.pointerId !== grab.id) return;
        const { moved, time, holding, pumpkinY } = grab;
        grab = null;
        section.classList.remove("is-grabbing", "is-taut");
        if (!moved && performance.now() - time < 350 && pos.x === 0 && pos.y === 0) {
          relaxThread();
          flee();
          return;
        }
        // Suelta: el hilo tira de ella y vuelve rebotando como un resorte.
        spring = {
          holding,
          pumpkinY,
          tween: gsap.to(pos, {
            x: 0,
            y: 0,
            duration: 1.4,
            ease: "elastic.out(1.1, 0.28)",
            onUpdate: sync,
            onComplete: () => {
              spring = null;
              gsap.set(body, { rotation: 0 });
              relaxThread();
              heist?.resume();
            },
          }),
        };
      });

      body.addEventListener("pointerdown", onDown);
      body.addEventListener("pointermove", onMove);
      body.addEventListener("pointerup", onUp);
      body.addEventListener("pointercancel", onUp);

      // Tocar la calabaza quieta: se ríe (un saltito con estirón).
      const onPumpkin = contextSafe(() => {
        if (phase !== "idle" || gsap.isTweening(pumpkin)) return;
        gsap
          .timeline()
          .to(pumpkin, { y: "-=18", scaleY: 1.08, scaleX: 0.94, duration: 0.18, ease: "power2.out" })
          .to(pumpkin, { y: 0, scaleY: 1, scaleX: 1, duration: 0.5, ease: "bounce.out" });
      });
      pumpkin.addEventListener("pointerdown", onPumpkin);

      // ── Fuera de pantalla no trabaja nada.
      const setVisible = (value) => {
        if (value === visible) return;
        visible = value;
        section.classList.toggle("is-asleep", !value);
        if (value) {
          if (!grab && !spring) heist?.resume();
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
        body.removeEventListener("pointerdown", onDown);
        body.removeEventListener("pointermove", onMove);
        body.removeEventListener("pointerup", onUp);
        body.removeEventListener("pointercancel", onUp);
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
                  ¡Agarra a la araña, se lleva la O!
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
                      <span className="hw-thief__body">
                        <img className="hw-thief__spider" src={`${IMG}/robo-arana.webp`} alt="" width="300" height="240" decoding="async" draggable="false" />
                      </span>
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

      {/* La mordida va sobre toda la pantalla. El portal la saca del hero
          (que recorta con overflow) y del contenedor del tema, así que lleva
          la clase del tema consigo. */}
      {createPortal(
        <div ref={biteRef} className="theme-halloween hw-bite" aria-hidden="true">
          <div className="hw-bite__flash" />
          <img className="hw-bite__spider" data-src={`${IMG}/mordida.webp`} alt="" width="640" height="640" decoding="async" />
          <div className="hw-bite__marks">
            <i />
            <i />
            <span>¡Auch!</span>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default SeRobaronLaOHero;
