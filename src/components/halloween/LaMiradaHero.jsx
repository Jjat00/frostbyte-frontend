import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";
import "./la-mirada.css";

gsap.registerPlugin(useGSAP);

/**
 * Halloween, variante "La mirada" (opción 7 del comparador del 2026-09-22;
 * prototipo aprobado por Jaime el 2026-09-27).
 *
 * Una máscara encapuchada vigila desde el bosque. Casi todos entran desde el
 * celular, así que no depende del ratón sino de gestos que el cliente ya
 * hace:
 * 1. Mira donde tocas: cualquier toque (también sobre una tarjeta) le hace
 *    girar la cabeza hacia el dedo. Si nadie toca, cada tanto se queda
 *    mirando un acceso.
 * 2. Te sigue con el scroll: baja la cabeza a medida que el hero se va.
 * 3. Se mueve cuando no la miras: si el hero sale de pantalla (o la pestaña
 *    se oculta) y vuelve, está en otro sitio y más cerca, con otro rótulo. A
 *    la cuarta vuelta empieza de nuevo con otra máscara.
 * 4. Tocarle la cara la enoja: se aparta, luego se abalanza con un destello
 *    rojo (y vibración en Android) y a la tercera se va y llega otra.
 * 5. Tocar una letra de FROSTBYTE suelta una gota que se estrella encima de
 *    la tarjeta de abajo. El título también gotea solo.
 *
 * Los accesos y el bloque de Instagram son los del hero habitual
 * (`HeroParts`): la distribución no cambia para quien ya conoce la carta.
 * Solo se tiñen de carmesí (la variante redefine `--color-primary`).
 *
 * Rendimiento: un transform por cuadro sobre la cabeza y efectos de un solo
 * uso con la Web Animations API, todo transform y opacity. Los toques son
 * listeners pasivos (nunca roban el scroll ni retrasan un enlace). Fuera de
 * pantalla el bucle se detiene. Con movimiento reducido no hay tirones,
 * gotas ni abalanzada; la máscara igual cambia de sitio.
 */

const IMG = "/images/halloween";

// face: -1 = de perfil mirando a la izquierda (se voltea para mirar a la
// derecha), 0 = de frente. box: zona de la cara que cuenta como tocarla
// [x0, y0, x1, y1]. eye: de dónde sale la mirada.
const MASKS = [
  { src: `${IMG}/mirada-carmesi.webp`, face: -1, box: [0.08, 0.1, 0.62, 0.72], eye: [0.36, 0.3] },
  { src: `${IMG}/mirada-cromo.webp`, face: 0, box: [0.28, 0.08, 0.78, 0.7], eye: [0.52, 0.34] },
  { src: `${IMG}/mirada-hockey.webp`, face: -1, box: [0.1, 0.05, 0.62, 0.52], eye: [0.33, 0.26] },
];

// Un rótulo por sitio: el primero es el de siempre, los demás avisan.
const KICKERS = [
  "No todas las miradas están vivas.",
  "¿Se movió?",
  "Está más cerca.",
  "No mires atrás.",
];

// Hacia dónde mira en reposo en cada sitio (1 = hacia la izquierda): siempre
// hacia el centro de la pantalla.
const REST_FLIP = [1, -1, 1, 1];

const LETTERS = [..."FROSTBYTE"];

// Un toque es un toque si el dedo casi no se movió; si no, era scroll.
const TAP_SLOP = 10;
const TAP_MS = 500;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);

const LaMiradaHero = () => {
  const rootRef = React.useRef(null);
  const gridRef = React.useRef(null);
  const { services, featuredCount, handleAnchorClick } = useHeroServices();

  // Entrada de las tarjetas, igual que los otros héroes.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    },
    { scope: rootRef }
  );

  React.useEffect(() => {
    const root = rootRef.current;
    const scene = root.querySelector(".hw-gaze__scene");
    const watch = root.querySelector(".hw-gaze__watch");
    const head = root.querySelector(".hw-gaze__head");
    const img = root.querySelector(".hw-gaze__mask");
    const fx = root.querySelector(".hw-gaze__fx");
    const flash = root.querySelector(".hw-gaze__flash");
    const kicker = root.querySelector(".hw-gaze__kicker");
    const letters = [...root.querySelectorAll(".hw-gaze__letter")];
    const cards = () => [...gridRef.current.querySelectorAll("a")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let stage = 0;
    let mask = 0;
    let cur = { x: 0, y: 0, r: 0, f: 1 };
    let tgt = { ...cur };
    let lookUntil = 0;
    let lastTouch = 0;
    let nextGlance = performance.now() + 3500;
    let nextDrip = performance.now() + 2500;
    let taps = 0;
    let busy = false;
    let visible = false;
    let hiddenAt = 0;
    let frame = 0;
    let lastTransform = "";
    let down = null;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    // Las otras máscaras se piden cuando la primera ya está, sin prisa.
    later(() => MASKS.slice(1).forEach(({ src }) => { new Image().src = src; }), 4000);

    // ── Medidas en coordenadas del hero ──────────────────────────────
    const toLocal = (clientX, clientY) => {
      const r = root.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };
    const rectLocal = (el) => {
      const e = el.getBoundingClientRect();
      const { x, y } = toLocal(e.left, e.top);
      return { x, y, w: e.width, h: e.height };
    };
    const eyePoint = () => {
      const m = MASKS[mask];
      const b = rectLocal(img);
      const ex = cur.f < 0 ? 1 - m.eye[0] : m.eye[0];
      return { x: b.x + b.w * ex, y: b.y + b.h * m.eye[1] };
    };

    // Ancho de la máscara, medido fuera del bucle (leerlo en cada cuadro
    // forzaría un layout por cuadro).
    let headWidth = head.offsetWidth;

    const write = () => {
      // |f| nunca llega a 0: el giro pasa "de canto" sin desaparecer.
      const f = Math.abs(cur.f) < 0.06 ? (cur.f < 0 ? -0.06 : 0.06) : cur.f;
      // Voltear la imagen sobre su centro llevaría la cara (que está en la
      // mitad izquierda del perfil) al otro lado, y contra el borde derecho
      // del celular quedaba cortada. Se corrige el desplazamiento para que
      // la cara gire en su sitio y lo que se mueva sea la capucha.
      const [x0, , x1] = MASKS[mask].box;
      const faceShift = ((1 - f) / 2) * (1 - (x0 + x1)) * headWidth;
      const x = cur.x - faceShift;
      const t = `translate(${x.toFixed(1)}px,${cur.y.toFixed(1)}px) scaleX(${f.toFixed(3)}) rotate(${cur.r.toFixed(2)}deg)`;
      if (t !== lastTransform) {
        head.style.transform = t;
        lastTransform = t;
      }
    };

    // ── 2 · Te sigue con el scroll ───────────────────────────────────
    const restPose = () => {
      const r = root.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height * 0.8), 0, 1);
      const front = MASKS[mask].face === 0;
      return { x: 0, y: p * 46, r: front ? 0 : -p * 18, f: front ? 1 : REST_FLIP[stage] };
    };

    // ── 1 · Mira donde tocas ─────────────────────────────────────────
    const twitch = () =>
      img.animate(
        [
          { rotate: "0deg", translate: "0 0" },
          { rotate: "5deg", translate: "7px -2px" },
          { rotate: "-3deg", translate: "-4px 1px" },
          { rotate: "0deg", translate: "0 0" },
        ],
        { duration: 380, easing: "steps(3, end)" }
      );
    const lookAt = (x, y, hold = 2600, withTwitch = true) => {
      const m = MASKS[mask];
      const c = eyePoint();
      const dx = x - c.x;
      const dy = y - c.y;
      let f = cur.f;
      let r;
      if (m.face === 0) {
        f = 1;
        r = clamp(dx * 0.035, -12, 12);
      } else {
        if (dx > 24) f = -1;
        else if (dx < -24) f = 1;
        const angle = (Math.atan2(dy, Math.abs(dx) + 1) * 180) / Math.PI;
        r = -clamp(angle * 0.42, -16, 24);
      }
      tgt = { x: clamp(dx * 0.05, -18, 18), y: clamp(dy * 0.05, -14, 26), r, f };
      lookUntil = performance.now() + hold;
      if (withTwitch && !reduce) twitch();
    };

    // ── 3 · Se mueve cuando no la miras ──────────────────────────────
    const setMask = (i) => {
      mask = i;
      img.src = MASKS[i].src;
    };
    const applyStage = () => {
      root.classList.remove("is-s0", "is-s1", "is-s2", "is-s3");
      root.classList.add(`is-s${stage}`);
      kicker.textContent = KICKERS[stage];
      headWidth = head.offsetWidth;
      // En el sitio nuevo ya te está mirando: sin giro visible.
      cur = restPose();
      tgt = { ...cur };
      lookUntil = 0;
      write();
    };
    const advance = () => {
      const wrapped = stage === 3;
      stage = wrapped ? 0 : stage + 1;
      if (wrapped) setMask((mask + 1) % MASKS.length);
      applyStage();
      if (reduce) return;
      // Recién llegada: un temblor, como si acabara de detenerse.
      img.animate(
        [
          { rotate: "0deg", translate: "0 0" },
          { rotate: "-3deg", translate: "-6px 2px" },
          { rotate: "2deg", translate: "4px 0" },
          { rotate: "0deg", translate: "0 0" },
        ],
        { duration: 900, easing: "ease-out" }
      );
      if (stage === 3) flash.animate([{ opacity: 0 }, { opacity: 0.45 }, { opacity: 0 }], { duration: 700 });
    };
    const markAway = () => {
      if (!hiddenAt) hiddenAt = performance.now();
    };
    const comeBack = () => {
      if (!hiddenAt) return;
      const gone = performance.now() - hiddenAt;
      hiddenAt = 0;
      if (gone > 600 && !busy) advance();
    };

    // ── 4 · Tocarle la cara la enoja ─────────────────────────────────
    const whisper = (text, x, y) => {
      const el = document.createElement("span");
      el.className = "hw-gaze__whisper";
      el.textContent = text;
      el.style.left = `${clamp(x, 70, root.offsetWidth - 70)}px`;
      el.style.top = `${y - 14}px`;
      fx.append(el);
      el.animate(
        [
          { opacity: 0, translate: "0 8px" },
          { opacity: 1, translate: "0 0", offset: 0.15 },
          { opacity: 1, translate: "0 -6px", offset: 0.75 },
          { opacity: 0, translate: "0 -14px" },
        ],
        { duration: 1500, easing: "ease-out" }
      ).onfinish = () => el.remove();
    };
    const hitFace = (clientX, clientY) => {
      if (busy) return false;
      const r = img.getBoundingClientRect();
      let [x0, y0, x1, y1] = MASKS[mask].box;
      if (cur.f < 0) [x0, x1] = [1 - x1, 1 - x0];
      return (
        clientX > r.left + r.width * x0 &&
        clientX < r.left + r.width * x1 &&
        clientY > r.top + r.height * y0 &&
        clientY < r.top + r.height * y1
      );
    };
    const lunge = () => {
      const w = rectLocal(watch);
      const dx = root.offsetWidth / 2 - (w.x + w.w / 2);
      const dy = Math.min(root.offsetHeight, window.innerHeight) * 0.3 - (w.y + w.h * 0.35);
      try {
        navigator.vibrate?.([50, 40, 140]);
      } catch {
        // sin vibración (iPhone, escritorio): el susto sigue siendo visual
      }
      flash.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.15 }, { opacity: 0 }], { duration: 650 });
      if (reduce) return;
      watch.animate(
        [
          { transform: "none" },
          { transform: `translate(${dx}px,${dy}px) scale(1.8)`, offset: 0.18 },
          { transform: `translate(${dx + 6}px,${dy - 4}px) scale(1.84)`, offset: 0.55 },
          { transform: "none" },
        ],
        { duration: 1250, easing: "cubic-bezier(.2,.9,.25,1)" }
      );
      scene.animate(
        [
          { translate: "0 0" },
          { translate: "-7px 3px" },
          { translate: "6px -4px" },
          { translate: "-3px 2px" },
          { translate: "0 0" },
        ],
        { duration: 320, easing: "steps(4, end)" }
      );
    };
    const leave = (p) => {
      busy = true;
      whisper("Ya vuelvo.", p.x, p.y);
      const out = watch.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(-24px) scale(.82)" },
        ],
        { duration: reduce ? 1 : 650, easing: "ease-in", fill: "forwards" }
      );
      out.onfinish = () =>
        later(() => {
          setMask((mask + 1) % MASKS.length);
          applyStage();
          out.cancel();
          watch.animate(
            [
              { opacity: 0, transform: `translateX(${stage === 1 ? -70 : 70}px)` },
              { opacity: 1, transform: "none" },
            ],
            { duration: reduce ? 1 : 1000, easing: "cubic-bezier(.2,.8,.2,1)" }
          ).onfinish = () => {
            busy = false;
          };
        }, 1100);
    };
    let tapReset = 0;
    const poke = (p) => {
      clearTimeout(tapReset);
      tapReset = later(() => {
        taps = 0;
      }, 4000);
      taps += 1;
      if (taps === 1) {
        whisper("No me toques.", p.x, p.y);
        if (!reduce) {
          img.animate(
            [
              { translate: "0 0", rotate: "0deg" },
              { translate: "26px -12px", rotate: "9deg", offset: 0.25 },
              { translate: "0 0", rotate: "0deg" },
            ],
            { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)" }
          );
        }
      } else if (taps === 2) {
        lunge();
      } else {
        taps = 0;
        leave(p);
      }
    };

    // ── 5 · Las gotas del título ─────────────────────────────────────
    const splat = (x, y) => {
      const make = (cls) => {
        const el = document.createElement("span");
        el.className = cls;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        fx.append(el);
        return el;
      };
      const s = make("hw-gaze__splat");
      s.animate(
        [
          { scale: "0 0", opacity: 1 },
          { scale: "1 1", opacity: 1, offset: 0.12 },
          { scale: "1.05 1", opacity: 1, offset: 0.7 },
          { scale: "1.1 .8", opacity: 0 },
        ],
        { duration: 1700, easing: "ease-out" }
      ).onfinish = () => s.remove();
      for (let k = 0; k < 6; k += 1) {
        const d = make("hw-gaze__speck");
        const dx = rand(-30, 30);
        const up = rand(10, 26);
        d.animate(
          [
            { translate: "0 0", opacity: 1 },
            { translate: `${dx * 0.6}px ${-up}px`, opacity: 1, offset: 0.4 },
            { translate: `${dx}px 4px`, opacity: 0 },
          ],
          { duration: rand(500, 750), easing: "ease-out" }
        ).onfinish = () => d.remove();
      }
    };
    const drip = (letter, big) => {
      if (reduce) return;
      const L = rectLocal(letter);
      const x = L.x + L.w * rand(0.3, 0.7);
      const y0 = L.y + L.h * 0.84;
      if (big) letter.animate([{ translate: "0 0" }, { translate: "0 4px" }, { translate: "0 0" }], { duration: 280 });

      // Una gota tocada cae sobre el borde de la tarjeta que está debajo;
      // las que gotean solas caen un poco y se desvanecen.
      let land = null;
      if (big) {
        for (const card of cards()) {
          const r = rectLocal(card);
          if (x > r.x + 4 && x < r.x + r.w - 4 && r.y > y0 && (land === null || r.y < land)) land = r.y;
        }
        if (land === null) land = y0 + 160;
      } else {
        land = y0 + rand(36, 70);
      }

      const run = document.createElement("span");
      run.className = "hw-gaze__run";
      run.style.left = `${x}px`;
      run.style.top = `${y0 - 4}px`;
      const drop = document.createElement("span");
      drop.className = "hw-gaze__drop";
      drop.style.left = `${x}px`;
      drop.style.top = `${y0 + 10}px`;
      fx.append(run, drop);

      run.animate([{ scale: "1 0" }, { scale: "1 1" }], { duration: 320, easing: "ease-out", fill: "forwards" });
      const dist = land - (y0 + 10);
      drop.animate(
        [
          { translate: "0 -10px", scale: ".3 .3", opacity: 1 },
          { translate: "0 0", scale: "1 1", opacity: 1, offset: 0.28 },
          { translate: `0 ${dist}px`, scale: ".85 1.5", opacity: big ? 1 : 0 },
        ],
        {
          duration: big ? 320 + clamp(Math.sqrt(dist) * 42, 300, 900) : 1100,
          easing: "cubic-bezier(.5,0,.95,.6)",
        }
      ).onfinish = () => {
        drop.remove();
        run.animate(
          [{ scale: "1 1", opacity: 1 }, { scale: "1 .2", opacity: 0 }],
          { duration: 900, fill: "forwards" }
        ).onfinish = () => run.remove();
        if (big) splat(x, land);
      };
    };

    // ── Toques ───────────────────────────────────────────────────────
    // pointerdown: mirar hacia el dedo (aunque luego sea scroll).
    // pointerup sin moverse: tocar la cara o una letra. Si el navegador se
    // queda el gesto para hacer scroll llega pointercancel y no cuenta.
    const onDown = (event) => {
      lastTouch = performance.now();
      root.classList.add("is-touched");
      down = { x: event.clientX, y: event.clientY, t: lastTouch };
      const p = toLocal(event.clientX, event.clientY);
      const onFace = !event.target.closest("a,button") && hitFace(event.clientX, event.clientY);
      if (!onFace) lookAt(p.x, p.y, 2600, !event.target.closest(".hw-gaze__letter"));
    };
    const onUp = (event) => {
      const start = down;
      down = null;
      if (!start) return;
      if (
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP ||
        performance.now() - start.t > TAP_MS
      )
        return;
      const p = toLocal(event.clientX, event.clientY);
      const letter = event.target.closest(".hw-gaze__letter");
      if (letter) {
        drip(letter, true);
        return;
      }
      if (!event.target.closest("a,button") && hitFace(event.clientX, event.clientY)) poke(p);
    };
    const onCancel = () => {
      down = null;
    };
    root.addEventListener("pointerdown", onDown, { passive: true });
    root.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("pointercancel", onCancel, { passive: true });

    // ── Bucle: un transform por cuadro, solo con el hero en pantalla ──
    const tick = () => {
      const now = performance.now();
      if (now > lookUntil) tgt = restPose();

      if (!reduce && !busy && now - lastTouch > 5000 && now > nextGlance) {
        const all = cards();
        const card = all[Math.floor(Math.random() * all.length)];
        if (card) {
          const r = rectLocal(card);
          lookAt(r.x + r.w / 2, r.y + r.h / 2, 1800);
        }
        nextGlance = now + rand(4500, 7500);
      }
      if (!reduce && now > nextDrip) {
        drip(letters[Math.floor(Math.random() * letters.length)], false);
        nextDrip = now + rand(2800, 5200);
      }

      const k = reduce ? 1 : 0.14;
      cur.x += (tgt.x - cur.x) * k;
      cur.y += (tgt.y - cur.y) * k;
      cur.r += (tgt.r - cur.r) * k;
      cur.f += (tgt.f - cur.f) * (reduce ? 1 : 0.16);
      write();
      frame = requestAnimationFrame(tick);
    };

    const setVisible = (value) => {
      if (value === visible) return;
      visible = value;
      root.classList.toggle("is-asleep", !value);
      if (value) {
        comeBack();
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        markAway();
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(root);
    const ro = new ResizeObserver(() => {
      headWidth = head.offsetWidth;
    });
    ro.observe(head);
    const onVisibility = () => {
      if (document.hidden) markAway();
      else if (visible) comeBack();
    };
    document.addEventListener("visibilitychange", onVisibility);

    applyStage();

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onCancel);
      fx.replaceChildren();
    };
  }, []);

  return (
    <section ref={rootRef} className="hw-gaze is-s0">
      <div className="hw-gaze__scene" aria-hidden="true">
        <div className="hw-gaze__bg" />
        <div className="hw-gaze__watch">
          <div className="hw-gaze__head">
            <img className="hw-gaze__mask" src={MASKS[0].src} alt="" width="640" height="960" decoding="async" draggable="false" />
          </div>
        </div>
        <div className="hw-gaze__shade" />
      </div>

      <p className="hw-gaze__hint" aria-hidden="true">Toca donde quieras</p>

      <div className="hw-gaze__content container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:gap-10">
          <div className="hero-reveal hw-gaze__head-row">
            <div className="hw-gaze__title">
              {/* El texto lo pone el efecto: cambia cuando la máscara se mueve */}
              <p className="hw-gaze__kicker" aria-hidden="true" />
              <h1 className="hw-gaze__brand">
                <span className="sr-only">FROSTBYTE</span>
                {LETTERS.map((letter, index) => (
                  <span key={index} className="hw-gaze__letter" aria-hidden="true">
                    {letter}
                  </span>
                ))}
              </h1>
              <p className="hw-gaze__loc">CUMBAL · NARIÑO</p>
            </div>

            <div className="hw-gaze__side">
              <p className="hw-gaze__tag">
                Granizados, frappés, cócteles, micheladas y shots en Cumbal,
                Nariño.
              </p>
              <HeroSocial onAnchorClick={handleAnchorClick} />
            </div>
          </div>

          <div ref={gridRef}>
            <HeroServiceGrid
              services={services}
              featuredCount={featuredCount}
              onAnchorClick={handleAnchorClick}
            />
          </div>
        </div>
      </div>

      <div className="hw-gaze__flash" aria-hidden="true" />
      <div className="hw-gaze__fx" aria-hidden="true" />
    </section>
  );
};

export default LaMiradaHero;
