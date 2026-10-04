import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HeroServiceGrid,
  HeroSocial,
  useHeroServices,
} from "@/components/HeroParts";
import { themeColorChannels } from "@/lib/themeColors";
import "./el-espejo.css";

gsap.registerPlugin(useGSAP);

/**
 * Halloween, variante "El espejo" (opción 10 del comparador del 2026-09-22).
 *
 * Juega con el nombre: FROST es escarcha. La parte de arriba del hero es un
 * espejo empañado (un canvas) donde alguien acaba de escribir «Frostbyte»
 * con el dedo, y del trazo escurren gotas. Detrás del vaho, en el cementerio,
 * hay un enmascarado que solo se ve a través de las letras o de lo que uno
 * limpia:
 * 1. Pasar el dedo (o el ratón) limpia el vaho, que vuelve a cerrarse solo.
 *    En el celular basta con hacer scroll con el dedo sobre el espejo: el
 *    toque es pasivo, limpia sin robar el scroll.
 * 2. Si limpias la cara del enmascarado, te descubre: se abalanza contra el
 *    vidrio (destello frío y vibración en Android), el espejo se empaña de
 *    golpe y en el vaho queda escrito un mensaje. Cuando vuelves a limpiar,
 *    ya está en otro sitio, cada vez más cerca.
 * 3. Si nadie toca, aparece una mano apoyada en el vidrio desde el otro lado,
 *    que también escurre.
 *
 * Los accesos y el bloque de Instagram son los del hero habitual
 * (`HeroParts`), solo teñidos de escarcha (la variante redefine
 * `--color-primary`).
 *
 * Rendimiento: el vaho es una sola capa de canvas. El nombre y los mensajes
 * se dibujan una vez en lienzos aparte y cada cuadro solo se estampan; el
 * vaho se rehace con una capa de textura casi transparente por cuadro. DPR
 * máximo 1,5 (1 y 30 fps en equipos modestos) y el bucle se detiene fuera
 * de pantalla. Con movimiento reducido el nombre aparece escrito, sin gotas,
 * mano ni abalanzada; limpiar y descubrir siguen funcionando.
 */

const IMG = "/images/halloween";

// Zona de la cara en la imagen sin voltear [x0, y0, x1, y1]: limpiar ahí es
// lo que lo descubre.
const FACE = [0.05, 0.02, 0.78, 0.58];

// Un rótulo por sitio y lo que escribe en el vaho al descubrirlo.
const STAGES = [
  { line: ["Limpia el espejo.", "No mires atrás."], says: "Te vi." },
  { line: ["Ya no está donde estaba.", "Límpialo otra vez."], says: "Detrás de ti." },
  { line: ["Está más cerca.", "No dejes de limpiar."], says: "Sigo aquí." },
];

const NAME = "Frostbyte";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);

// Equipo modesto: pocos núcleos o poca memoria (deviceMemory solo existe en
// Chrome; donde no está se asume que alcanza).
const isLowEnd = () =>
  (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;

/**
 * Pinta un texto una vez en un lienzo aparte (negro opaco, lo que importa es
 * la forma) para estamparlo después con `destination-out`.
 */
function textStamp(text, size, dpr, font) {
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `${size}px ${font}`;
  const m = probe.measureText(text);
  const ascent = m.actualBoundingBoxAscent || size * 0.9;
  const descent = m.actualBoundingBoxDescent || size * 0.4;
  const pad = size * 0.25;
  const w = m.width + pad * 2;
  const h = ascent + descent + pad * 2;
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(w * dpr);
  cv.height = Math.ceil(h * dpr);
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  c.font = `${size}px ${font}`;
  c.fillStyle = "#000";
  c.fillText(text, pad, pad + ascent);
  // baseline: distancia del borde de arriba a la línea base
  return { cv, w, h, baseline: pad + ascent, pad };
}

/** Una mano abierta, apoyada con la palma hacia el vidrio. */
function drawHand(ctx, x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.34, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // índice, medio, anular y meñique
  const fingers = [
    [-0.24, 0.62, -0.14],
    [-0.08, 0.7, -0.03],
    [0.08, 0.66, 0.05],
    [0.23, 0.5, 0.16],
  ];
  // Cada dedo es una elipse alargada que nace del borde de la palma.
  const finger = (fx, fy, len, width, ang) => {
    ctx.save();
    ctx.translate(fx * s, fy * s);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, (-len * s) / 2, (width * s) / 2, (len * s) / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  fingers.forEach(([fx, len, ang]) => finger(fx, -0.26, len, 0.13, ang));
  // pulgar, abierto hacia un lado
  finger(-0.28, 0.04, 0.44, 0.15, -1.05);
  ctx.restore();
}

const ElEspejoHero = () => {
  const rootRef = React.useRef(null);
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
    const canvas = root.querySelector(".hw-mirror__fog");
    const figure = root.querySelector(".hw-mirror__figure");
    const figImg = root.querySelector(".hw-mirror__figure img");
    const flash = root.querySelector(".hw-mirror__flash");
    const scene = root.querySelector(".hw-mirror__scene");
    const lineA = root.querySelector(".hw-mirror__line-a");
    const lineB = root.querySelector(".hw-mirror__line-b");
    const inner = root.querySelector(".hw-mirror__inner");
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEnd = isLowEnd();
    const dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const minFrame = lowEnd ? 30 : 0;
    const font =
      getComputedStyle(canvas).getPropertyValue("--hw-font-salt").trim() || "cursive";

    // ── Textura del vaho (una vez) ───────────────────────────────────
    const [fr, fg, fb] = themeColorChannels("--hw-fog", canvas) || [127, 147, 158];
    const tile = document.createElement("canvas");
    tile.width = tile.height = 180;
    const t = tile.getContext("2d");
    t.fillStyle = `rgb(${fr},${fg},${fb})`;
    t.fillRect(0, 0, 180, 180);
    for (let i = 0; i < 1600; i += 1) {
      t.fillStyle =
        Math.random() < 0.6
          ? `rgba(255,255,255,${Math.random() * 0.14})`
          : `rgba(10,20,26,${Math.random() * 0.12})`;
      t.beginPath();
      t.arc(Math.random() * 180, Math.random() * 180, 0.4 + Math.random() * 2.2, 0, Math.PI * 2);
      t.fill();
    }
    const fog = ctx.createPattern(tile, "repeat");

    let W = 0;
    let H = 0;
    let desk = false;
    let name = null;
    let nameAt = { x: 0, y: 0 };
    let fontReady = false;
    let writeStart = 0;
    let written = false;
    let msg = null;
    let drips = [];
    let pts = [];
    let stamps = [];
    let lastP = null;
    let lastMove = 0;
    let lastTouch = 0;
    let nextHand = performance.now() + 6000;
    let fastUntil = 0;
    let score = 0;
    let stage = 0;
    let busy = false;
    let frame = 0;
    let lastFrame = 0;
    let lastTick = performance.now();
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    const fillFog = (alpha) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    };

    // ── Medidas ──────────────────────────────────────────────────────
    const layout = () => {
      if (!fontReady || !W) return;
      desk = W >= 768;
      const probe = document.createElement("canvas").getContext("2d");
      probe.font = `100px ${font}`;
      const m = probe.measureText(NAME).width || 640;
      const maxW = desk ? Math.min(W * 0.5, 700) : W * 0.84;
      const size = Math.min(desk ? 150 : 84, (100 * maxW) / m);
      name = textStamp(NAME, size, dpr, font);
      // En escritorio el nombre arranca donde arranca el contenido.
      const c = canvas.getBoundingClientRect();
      const left = inner ? inner.getBoundingClientRect().left - c.left : 32;
      nameAt = {
        x: desk ? left - name.pad : (W - name.w) / 2,
        y: (desk ? H * 0.38 : H * 0.4) - name.baseline,
      };
    };
    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || (w === W && h === H)) return;
      W = w;
      H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fillFog(1);
      layout();
    };

    const fontsReady = () => {
      if (fontReady) return;
      fontReady = true;
      layout();
      writeStart = performance.now() + 500;
    };
    // Si la letra llega después del plazo, el nombre se rehace con ella.
    if (document.fonts?.load)
      document.fonts.load(`80px ${font}`).then(() => {
        fontsReady();
        layout();
      }, fontsReady);
    later(fontsReady, 2500);

    // ── Limpiar con el dedo ──────────────────────────────────────────
    const addPoint = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const p = { x: ((clientX - r.left) * W) / r.width, y: ((clientY - r.top) * H) / r.height };
      const now = performance.now();
      if (lastP && now - lastMove < 120) {
        const dx = p.x - lastP.x;
        const dy = p.y - lastP.y;
        const n = Math.min(14, Math.ceil(Math.hypot(dx, dy) / 10));
        for (let s = 1; s <= n; s += 1) pts.push({ x: lastP.x + (dx * s) / n, y: lastP.y + (dy * s) / n });
      } else {
        pts.push(p);
      }
      lastP = p;
      lastMove = now;
      lastTouch = now;
      root.classList.add("is-touched");
    };
    const onPointer = (event) => {
      if (event.pointerType === "touch") return;
      addPoint(event.clientX, event.clientY);
    };
    const onTouch = (event) => {
      const p = event.touches[0];
      if (p) addPoint(p.clientX, p.clientY);
    };
    root.addEventListener("pointermove", onPointer, { passive: true });
    root.addEventListener("touchstart", onTouch, { passive: true });
    root.addEventListener("touchmove", onTouch, { passive: true });

    // ── Te descubre ──────────────────────────────────────────────────
    const faceBox = () => {
      const c = canvas.getBoundingClientRect();
      const r = figImg.getBoundingClientRect();
      let [x0, y0, x1, y1] = FACE;
      if (root.classList.contains("is-s1")) [x0, x1] = [1 - x1, 1 - x0];
      const k = W / (c.width || 1);
      return {
        x0: (r.left - c.left + r.width * x0) * k,
        x1: (r.left - c.left + r.width * x1) * k,
        y0: (r.top - c.top + r.height * y0) * k,
        y1: (r.top - c.top + r.height * y1) * k,
      };
    };
    const setLines = () => {
      [lineA.textContent, lineB.textContent] = STAGES[stage].line;
    };
    const applyStage = () => {
      root.classList.remove("is-s0", "is-s1", "is-s2");
      root.classList.add(`is-s${stage}`);
    };
    const caught = () => {
      busy = true;
      const box = faceBox();
      const says = STAGES[stage].says;
      try {
        navigator.vibrate?.([40, 30, 120]);
      } catch {
        // sin vibración (iPhone, escritorio): el susto sigue siendo visual
      }
      flash.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.12 }, { opacity: 0 }], { duration: 700 });
      if (!reduce) {
        const c = canvas.getBoundingClientRect();
        const f = figure.getBoundingClientRect();
        const dx = c.left + c.width / 2 - (f.left + f.width / 2);
        figure.animate(
          [
            { transform: "none" },
            { transform: `translate(${dx * 0.6}px, 2rem) scale(1.35)`, offset: 0.14 },
            { transform: `translate(${dx * 0.6 + 5}px, 2rem) scale(1.38)`, offset: 0.6 },
            { transform: `translate(${dx * 0.6}px, 2rem) scale(1.35)` },
          ],
          { duration: 900, easing: "cubic-bezier(.2,.9,.25,1)", fill: "forwards" }
        );
        scene.animate(
          [{ translate: "0 0" }, { translate: "-6px 3px" }, { translate: "5px -3px" }, { translate: "0 0" }],
          { duration: 300, easing: "steps(3, end)" }
        );
      }
      // El vidrio se empaña de golpe, él se va y queda el mensaje.
      later(() => {
        fastUntil = performance.now() + 900;
        figure.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" });
      }, reduce ? 0 : 750);
      later(() => {
        const size = Math.min(desk ? 92 : 46, (name ? name.h : 80) * 0.5);
        const stamp = textStamp(says, size, dpr, font);
        const cx = clamp((box.x0 + box.x1) / 2, stamp.w / 2 + 8, W - stamp.w / 2 - 8);
        const cy = clamp((box.y0 + box.y1) / 2, stamp.h / 2 + 64, H - stamp.h);
        msg = { stamp, x: cx - stamp.w / 2, y: cy - stamp.h / 2, start: performance.now(), until: performance.now() + 3600 };
        stage = (stage + 1) % STAGES.length;
        setLines();
      }, reduce ? 300 : 1700);
      // Ya en otro sitio, otra vez detrás del vaho.
      later(() => {
        figure.getAnimations().forEach((a) => a.cancel());
        applyStage();
        score = 0;
        busy = false;
      }, reduce ? 1200 : 5200);
    };

    // ── Bucle: solo con el hero en pantalla ──────────────────────────
    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      if (now - lastFrame < minFrame) return;
      lastFrame = now;
      const dt = Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;
      if (!W) return;

      // El vaho vuelve: ~30 % por segundo (de golpe tras descubrirlo).
      fillFog(now < fastUntil ? clamp(dt * 9, 0, 1) : clamp(dt * 0.3, 0, 1));
      ctx.globalCompositeOperation = "destination-out";

      // El nombre se escribe solo y se mantiene limpio.
      if (name && now > writeStart) {
        const p = reduce ? 1 : clamp((now - writeStart) / 2400, 0, 1);
        const sw = name.w * p;
        if (sw > 1) ctx.drawImage(name.cv, 0, 0, sw * dpr, name.cv.height, nameAt.x, nameAt.y, sw, name.h);
        if (p >= 1) written = true;
        if (written && !reduce && drips.length < (lowEnd ? 7 : 12) && Math.random() < dt * 1.8) {
          drips.push({
            x: nameAt.x + name.pad + Math.random() * (name.w - name.pad * 2),
            y: nameAt.y + name.baseline - Math.random() * name.h * 0.25,
            v: rand(15, 42),
            left: rand(60, 220),
            r: rand(1.6, 3.2),
          });
        }
      }

      // El mensaje se escribe y luego se deja empañar.
      if (msg) {
        const p = reduce ? 1 : clamp((now - msg.start) / 1400, 0, 1);
        const sw = msg.stamp.w * p;
        if (sw > 1) ctx.drawImage(msg.stamp.cv, 0, 0, sw * dpr, msg.stamp.cv.height, msg.x, msg.y, sw, msg.stamp.h);
        if (now > msg.until) msg = null;
      }

      ctx.fillStyle = "#000";
      if (drips.length) {
        drips = drips.filter((d) => {
          const step = d.v * dt;
          d.y += step;
          d.left -= step;
          d.x += (Math.random() - 0.5) * 0.4;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
          return d.left > 0;
        });
      }

      // Una mano del otro lado del vidrio, si nadie toca.
      if (!reduce && written && !busy && now - lastTouch > 7000 && now > nextHand) {
        const s = desk ? rand(110, 150) : rand(74, 96);
        const hx = rand(s, W - s);
        const hy = rand(H * 0.18 + s * 0.6, H * 0.62);
        stamps.push({ x: hx, y: hy, s, rot: rand(-0.35, 0.35), left: 5 });
        for (let k = 0; k < 3; k += 1)
          drips.push({ x: hx + rand(-s * 0.25, s * 0.25), y: hy + s * 0.3, v: rand(14, 30), left: rand(50, 140), r: rand(2, 3.4) });
        nextHand = now + rand(9000, 15000);
      }
      if (stamps.length) {
        ctx.globalAlpha = 0.3;
        stamps = stamps.filter((h) => {
          drawHand(ctx, h.x, h.y, h.s, h.rot);
          h.left -= 1;
          return h.left > 0;
        });
        ctx.globalAlpha = 1;
      }

      // Lo que limpió el dedo.
      if (pts.length) {
        const rad = desk ? 62 : 40;
        const box = busy ? null : faceBox();
        pts.splice(0).forEach((q) => {
          const g = ctx.createRadialGradient(q.x, q.y, rad * 0.35, q.x, q.y, rad);
          g.addColorStop(0, "rgba(0,0,0,.9)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(q.x, q.y, rad, 0, Math.PI * 2);
          ctx.fill();
          if (box && q.x > box.x0 && q.x < box.x1 && q.y > box.y0 && q.y < box.y1) score += 1;
        });
      }
      ctx.globalCompositeOperation = "source-over";

      // Limpiar la cara tiene que ser a propósito: lo que no se sigue
      // limpiando se olvida.
      score = Math.max(0, score - dt * 5);
      if (!busy && score > (desk ? 16 : 20)) caught();
    };

    const setVisible = (value) => {
      root.classList.toggle("is-asleep", !value);
      if (value && !frame) {
        lastTick = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!value) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(root);
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    setLines();
    applyStage();

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      root.removeEventListener("pointermove", onPointer);
      root.removeEventListener("touchstart", onTouch);
      root.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <section ref={rootRef} className="hw-mirror is-s0">
      <div className="hw-mirror__scene" aria-hidden="true">
        <div className="hw-mirror__bg" />
        <img className="hw-mirror__ghost" src={`${IMG}/fantasma-hielo.webp`} alt="" width="280" height="336" decoding="async" />
        <div className="hw-mirror__figure">
          <img src={`${IMG}/espejo-enmascarado.webp`} alt="" width="560" height="840" decoding="async" draggable="false" />
        </div>
        <canvas className="hw-mirror__fog" />
        <div className="hw-mirror__shade" />
      </div>

      <p className="hw-mirror__hint" aria-hidden="true">Pasa el dedo por el espejo</p>

      <div className="hw-mirror__content container relative z-10 mx-auto px-5 md:px-8">
        <div className="hw-mirror__inner mx-auto flex max-w-6xl flex-col gap-7 md:gap-10">
          <div className="hero-reveal hw-mirror__head-row">
            <div className="hw-mirror__title">
              {/* El nombre está escrito en el vaho (canvas) */}
              <h1 className="sr-only">FROSTBYTE</h1>
              {/* El texto lo pone el efecto: cambia cada vez que te descubre */}
              <p className="hw-mirror__line" aria-hidden="true">
                <span className="hw-mirror__line-a" />
                <span className="hw-mirror__line-b" />
              </p>
              <p className="hw-mirror__loc">CUMBAL · NARIÑO</p>
            </div>

            <div className="hw-mirror__side">
              <p className="hw-mirror__tag">
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

      <div className="hw-mirror__flash" aria-hidden="true" />
    </section>
  );
};

export default ElEspejoHero;
