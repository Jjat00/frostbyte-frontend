import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";
import "./apaga-la-luz.css";

gsap.registerPlugin(useGSAP);

/**
 * Halloween, variante "Apaga la luz" (opción 5 del comparador del
 * 2026-09-22).
 *
 * El bosque está a oscuras y el dedo (o el ratón) es una linterna: al moverlo
 * aparecen la cabra, el espantapájaros, el fantasma y las calabazas. En lo
 * oscuro brillan pares de ojos que se esconden cuando la luz se les acerca.
 * Si nadie toca, la linterna se pasea sola, y cada tanto falla y deja todo en
 * negro un instante, con solo los ojos a la vista. Los accesos y el bloque de
 * Instagram son los del hero habitual (`HeroParts`), así que la campaña no
 * cambia lo que el local ofrece.
 *
 * Rendimiento (la home ya fundía GPUs de gama baja): la oscuridad es UNA capa
 * del doble del hero con el degradado radial pintado una sola vez; mover la
 * linterna es trasladar esa capa (transform), nunca repintar el degradado.
 * Todo lo demás anima opacity o transform. Fuera de pantalla se detiene.
 */

const IMG = "/images/halloween";

// Posiciones en % del hero. `t`/`l` en móvil, `mt`/`ml` desde md.
const EYES = [
  { t: "9%", l: "22%", mt: "15%", ml: "20%", d: -1 },
  { t: "19%", l: "80%", mt: "30%", ml: "88%", red: true, d: -2.4 },
  { t: "31%", l: "9%", mt: "47%", ml: "7%", d: -0.3 },
  { t: "13%", l: "55%", mt: "11%", ml: "58%", red: true, d: -3.2 },
  { t: "36%", l: "74%", mt: "50%", ml: "72%", d: -1.8 },
  { t: "4%", l: "68%", mt: "7%", ml: "76%", red: true, d: -2.9 },
];

const ApagaLaLuzHero = () => {
  const rootRef = React.useRef(null);
  const { services, featuredCount, handleAnchorClick } = useHeroServices();

  useGSAP(
    (_context, contextSafe) => {
      const section = rootRef.current;
      const dark = section.querySelector(".hw-lamp__dark");
      const off = section.querySelector(".hw-lamp__off");
      const content = section.querySelector(".hw-lamp__content");
      const eyes = [...section.querySelectorAll(".hw-lamp__eye")];
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

      // ── Medidas. La capa oscura mide 2W × 2H con el hueco de luz en su
      // centro: trasladarla (x − W, y − H) pone la luz en (x, y).
      let W = 0;
      let H = 0;
      let sceneBottom = 0;
      let reach = 130;
      let spots = [];
      const light = { x: 0, y: 0 };

      const measure = () => {
        W = section.offsetWidth;
        H = section.offsetHeight;
        // La linterna ronda la escena, no las tarjetas.
        sceneBottom = Math.max(H * 0.3, content.offsetTop + 60);
        reach = W >= 768 ? 200 : 130;
        spots = eyes.map((el) => ({
          el,
          x: el.offsetLeft + el.offsetWidth / 2,
          y: el.offsetTop + el.offsetHeight / 2,
          lit: el.classList.contains("is-lit"),
        }));
      };
      measure();

      const moveX = gsap.quickTo(dark, "x", { duration: reduce ? 0 : 0.5, ease: "power3" });
      const moveY = gsap.quickTo(dark, "y", { duration: reduce ? 0 : 0.5, ease: "power3" });
      const aim = (x, y) => {
        moveX(x - W);
        moveY(y - H);
      };

      // Arranca alumbrando las calabazas.
      light.x = W * 0.5;
      light.y = sceneBottom * 0.62;
      gsap.set(dark, { x: light.x - W, y: light.y - H });

      // Los ojos se esconden de la luz (lectura barata: seis distancias).
      const checkEyes = () => {
        const lx = gsap.getProperty(dark, "x") + W;
        const ly = gsap.getProperty(dark, "y") + H;
        for (const spot of spots) {
          const lit = Math.hypot(spot.x - lx, spot.y - ly) < reach;
          if (lit !== spot.lit) {
            spot.lit = lit;
            spot.el.classList.toggle("is-lit", lit);
          }
        }
      };

      // ── La linterna se pasea sola mientras nadie la toma.
      let visible = false;
      let started = false;
      let wander = null;
      let resume = null;
      const wanderStep = contextSafe(() => {
        started = true;
        // Fuera de pantalla no se agenda nada; al volver se retoma.
        if (!visible) {
          wander = null;
          return;
        }
        wander = gsap.to(light, {
          x: W * gsap.utils.random(0.12, 0.88),
          y: gsap.utils.random(H * 0.07, sceneBottom * 0.9),
          duration: gsap.utils.random(1.8, 3),
          ease: "sine.inOut",
          onUpdate: () => aim(light.x, light.y),
          onComplete: wanderStep,
        });
      });

      // ── Falla de la linterna: negro total un instante, solo los ojos.
      let flickerCall = null;
      const flicker = contextSafe(() =>
        gsap
          .timeline()
          .to(off, { opacity: 1, duration: 0.05 })
          .to(off, { opacity: 0, duration: 0.07 })
          .to(off, { opacity: 0.92, duration: 0.05, delay: 0.1 })
          .to(off, { opacity: 0, duration: 0.3, delay: 0.35 })
      );
      const scheduleFlicker = contextSafe(() => {
        flickerCall = gsap.delayedCall(gsap.utils.random(8, 14), () => {
          flicker();
          scheduleFlicker();
        });
      });

      if (reduce) {
        gsap.set(off, { opacity: 0 });
      } else {
        // Se enciende con un par de parpadeos, y luego empieza a rondar.
        gsap
          .timeline({ delay: 0.25, onComplete: () => { wanderStep(); scheduleFlicker(); } })
          .to(off, { opacity: 0, duration: 0.06 })
          .to(off, { opacity: 1, duration: 0.05, delay: 0.08 })
          .to(off, { opacity: 0, duration: 0.5, delay: 0.12 });
      }

      // ── El dedo o el ratón toman la linterna.
      const takeLight = contextSafe((clientX, clientY) => {
        const rect = section.getBoundingClientRect();
        light.x = clientX - rect.left;
        light.y = clientY - rect.top;
        wander?.kill();
        wander = null;
        aim(light.x, light.y);
        section.classList.add("is-touched");
        resume?.kill();
        if (!reduce) resume = gsap.delayedCall(3, wanderStep);
      });
      const onPointer = (event) => {
        if (event.pointerType === "mouse") takeLight(event.clientX, event.clientY);
      };
      // touchmove sigue llegando mientras la página hace scroll, así que el
      // dedo alumbra sin robarle el scroll a nadie (listeners pasivos).
      const onTouch = (event) => {
        const touch = event.touches[0];
        if (touch) takeLight(touch.clientX, touch.clientY);
      };
      section.addEventListener("pointermove", onPointer);
      section.addEventListener("touchstart", onTouch, { passive: true });
      section.addEventListener("touchmove", onTouch, { passive: true });

      // ── Fuera de pantalla no trabaja nada.
      const setVisible = (value) => {
        if (value === visible) return;
        visible = value;
        section.classList.toggle("is-asleep", !value);
        if (value) {
          gsap.ticker.add(checkEyes);
          flickerCall?.resume();
          if (wander) wander.resume();
          else if (started && !reduce && !resume?.isActive()) wanderStep();
        } else {
          gsap.ticker.remove(checkEyes);
          wander?.pause();
          flickerCall?.pause();
        }
      };
      const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
      io.observe(section);
      setVisible(true);

      const ro = new ResizeObserver(() => {
        measure();
        aim(light.x, light.y);
      });
      ro.observe(section);

      return () => {
        io.disconnect();
        ro.disconnect();
        gsap.ticker.remove(checkEyes);
        section.removeEventListener("pointermove", onPointer);
        section.removeEventListener("touchstart", onTouch);
        section.removeEventListener("touchmove", onTouch);
      };
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="hw-lamp">
      <div className="hw-lamp__scene" aria-hidden="true">
        <div className="hw-lamp__bg" />
        <img className="hw-lamp__web" src={`${IMG}/telarana.webp`} alt="" width="440" height="451" decoding="async" />
        <img className="hw-lamp__goat" src={`${IMG}/cabra.webp`} alt="" width="600" height="750" decoding="async" />
        <img className="hw-lamp__scarecrow" src={`${IMG}/espantapajaros.webp`} alt="" width="420" height="630" decoding="async" />
        <img className="hw-lamp__ghost" src={`${IMG}/fantasma-verde.webp`} alt="" width="320" height="384" decoding="async" />
        <img className="hw-lamp__pumpkins" src={`${IMG}/calabazas.webp`} alt="" width="1000" height="667" decoding="async" />
        <div className="hw-lamp__dark" />
        <div className="hw-lamp__off" />
        <div className="hw-lamp__shade" />
        {EYES.map((eye, index) => (
          <span
            key={index}
            className={`hw-lamp__eye${eye.red ? " hw-lamp__eye--red" : ""}`}
            style={{ "--t": eye.t, "--l": eye.l, "--mt": eye.mt, "--ml": eye.ml, "--d": `${eye.d}s` }}
          >
            <i />
            <i />
          </span>
        ))}
      </div>

      <p className="hw-lamp__hint" aria-hidden="true">
        <span className="hw-lamp__hint-touch">Mueve el dedo para alumbrar</span>
        <span className="hw-lamp__hint-mouse">Mueve el ratón para alumbrar</span>
      </p>

      <div className="hw-lamp__content container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:gap-10">
          <div className="hero-reveal hw-lamp__head">
            <div className="hw-lamp__title">
              <p className="hw-lamp__kicker">Apaga la luz</p>
              <h1 className="hw-lamp__brand" data-text="FROSTBYTE">
                FROSTBYTE
              </h1>
              <p className="hw-lamp__loc">CUMBAL · NARIÑO</p>
            </div>

            <div className="hw-lamp__side">
              <p className="hw-lamp__tag">
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

export default ApagaLaLuzHero;
