import React from "react";
import { isLowEnd } from "./device";

/**
 * Nevada de Navidad: fondo de la sección de música (reemplaza a
 * MusicVisualizer mientras dura la campaña).
 *
 * Es un fondo: el buscador y las canciones van encima. El canvas va pegado
 * (sticky) a la pantalla dentro de la sección, así que la nieve se queda en
 * el aire mientras la lista pasa por delante. Las bolas, en cambio, cuelgan
 * del borde de arriba de la sección y se van con ella.
 *
 * - La nieve cae en tres planos (lejos, medio y cerca, este desenfocado).
 * - El puntero o el dedo la aparta y la arrastra; un toque la sopla.
 * - Las bolas son fotos y cuelgan de su hilo como péndulos: el puntero las
 *   empuja y un toque las hace columpiar.
 * - Con música, la nieve baila: en cada pulso se frena y se va de lado, a un
 *   lado y al otro, y las bolas se mecen. Sin música cae tranquila.
 *
 * El navegador no oye la música (suena en el local, no en el teléfono) y
 * Spotify no entrega el tempo: el pulso es simulado. Cada canción tiene su
 * propio compás, entre 96 y 132 por minuto, sacado de su identificador.
 *
 * Pensada para celulares de gama baja:
 * - el canvas es transparente (el fondo es el color liso de la sección) y
 *   cada copo es un sello de una imagen ya pintada: sin sombras ni
 *   degradados por cuadro;
 * - DPR tope 1,5; en equipos modestos DPR 1, 30 cuadros por segundo y la
 *   mitad de copos;
 * - las bolas se piden cuando la sección se acerca y el bucle se detiene con
 *   la sección fuera de pantalla o la pestaña oculta. Con movimiento
 *   reducido se pinta un solo cuadro quieto.
 */

const IMG = "/images/navidad/musica";

// Medidas de cada foto: gancho (hx, hy) y la inclinación con la que fue
// fotografiada; al colgarla se endereza para que el peso quede bajo el hilo.
const BAUBLES = [
  { src: "bola-1.webp", w: 260, h: 297, hx: 0.702, hy: 0.003, tilt: -0.31 },
  { src: "bola-2.webp", w: 260, h: 315, hx: 0.3, hy: 0.019, tilt: 0.284 },
  { src: "bola-3.webp", w: 260, h: 312, hx: 0.713, hy: 0.019, tilt: -0.309 },
  { src: "bola-4.webp", w: 225, h: 279, hx: 0.796, hy: 0.025, tilt: -0.406 },
  { src: "bola-5.webp", w: 219, h: 279, hx: 0.628, hy: 0.025, tilt: -0.171 },
];

// Dónde cuelga cada bola: x en fracción del ancho, largo del hilo y ancho de
// la bola en px (el celular los escala un poco según su ancho). En el
// celular van cortas, sobre el título; en pantallas anchas las de los lados
// bajan más, por fuera de la columna del buscador.
const HANG_NARROW = [
  { img: 0, x: 0.09, len: 62, size: 58 },
  { img: 1, x: 0.29, len: 20, size: 46 },
  { img: 2, x: 0.5, len: 42, size: 52 },
  { img: 3, x: 0.71, len: 14, size: 44 },
  { img: 4, x: 0.91, len: 70, size: 60 },
];
const HANG_WIDE = [
  { img: 4, x: 0.06, len: 150, size: 92 },
  { img: 1, x: 0.16, len: 58, size: 70 },
  { img: 0, x: 0.3, len: 22, size: 60 },
  { img: 3, x: 0.5, len: 40, size: 64 },
  { img: 2, x: 0.7, len: 18, size: 58 },
  { img: 3, x: 0.84, len: 80, size: 74 },
  { img: 0, x: 0.94, len: 170, size: 96 },
];

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);

// Planos de la nevada: radio del copo, caída en px/s, cuánto lo mueve el
// viento y con qué opacidad se pinta. El de cerca va desenfocado.
const LAYERS = [
  { share: 0.46, r: [0.8, 1.6], fall: [22, 40], drift: 0.45, alpha: 0.55, soft: false },
  { share: 0.4, r: [1.5, 2.7], fall: [42, 72], drift: 0.8, alpha: 0.9, soft: false },
  { share: 0.14, r: [3.4, 6.5], fall: [84, 128], drift: 1.25, alpha: 0.5, soft: true },
];

// Un copo como sello: disco blanco con el borde difuminado.
function makeFlake(size, core) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  const half = size / 2;
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(core, "rgba(255, 255, 255, 0.92)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(im));
    im.onerror = reject;
    im.src = src;
  });

// Compás de la canción: fijo para cada una, distinto entre canciones.
function tempoFor(key) {
  let h = 0;
  const str = String(key || "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return 96 + (h % 37);
}

// Solo en desarrollo: con ?ritmo=1 la nieve baila aunque no suene nada, para
// poder probarla sin Spotify. En producción esta constante es false.
const DEMO =
  import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("ritmo");

export default function SnowVisualizer({ isPlaying = false, trackKey = "" }) {
  const canvasRef = React.useRef(null);
  const playingRef = React.useRef(isPlaying || DEMO);
  const tempoRef = React.useRef(tempoFor(trackKey));
  playingRef.current = isPlaying || DEMO;
  tempoRef.current = tempoFor(trackKey);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section) return undefined;
    const ctx = canvas.getContext("2d");
    const lowEnd = isLowEnd();
    // Se vuelve a leer si el cliente la cambia con la carta abierta.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    const sharp = makeFlake(32, 0.45);
    const soft = makeFlake(48, 0.12);

    const s = {
      w: 0,
      h: 0,
      top: 0, // borde de arriba de la sección, en coordenadas del canvas
      flakes: [],
      baubles: [],
      images: null,
      energy: 0,
      beat: 0, // tiempo en pulsos; la parte entera es el pulso actual
      pulse: 0, // 1 en el golpe, cae a 0 antes del siguiente
      wind: 0,
      time: 0,
      pointer: { x: 0, y: 0, vx: 0, vy: 0, active: false, at: 0 },
    };
    let dpr = 1;
    let dead = false;
    let stale = true; // hay que volver a medir dónde está la sección

    const newFlake = (layer, anywhere) => {
      const L = LAYERS[layer];
      return {
        layer,
        x: Math.random() * s.w,
        y: anywhere ? Math.random() * s.h : -10 - Math.random() * 40,
        r: rand(L.r[0], L.r[1]),
        fall: rand(L.fall[0], L.fall[1]),
        ph: Math.random() * TAU,
        freq: rand(0.5, 1.4),
        sway: rand(6, 18) * L.drift,
        ix: 0,
        iy: 0,
      };
    };

    const seed = () => {
      const total = Math.round(clamp((s.w * s.h) / 2600, 70, 260) * (lowEnd ? 0.55 : 1));
      s.flakes = [];
      LAYERS.forEach((L, layer) => {
        const n = Math.round(total * L.share);
        for (let i = 0; i < n; i++) s.flakes.push(newFlake(layer, true));
      });
    };

    const hang = () => {
      const wide = s.w >= 900;
      const k = wide ? clamp(s.w / 1280, 0.9, 1.15) : clamp(s.w / 375, 0.9, 1.45);
      const prev = s.baubles;
      s.baubles = (wide ? HANG_WIDE : HANG_NARROW).map((spot, i) => {
        const meta = BAUBLES[spot.img];
        const w = spot.size * k;
        const h = (w * meta.h) / meta.w;
        const len = spot.len * k;
        return {
          meta,
          img: spot.img,
          x: spot.x * s.w,
          len,
          w,
          h,
          // Largo del péndulo: del clavo al centro de la bola.
          arm: len + h * 0.55,
          a: prev[i]?.a ?? 0,
          v: prev[i]?.v ?? 0,
        };
      });
    };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const first = !s.w;
      const kx = first ? 1 : rect.width / s.w;
      const ky = first ? 1 : rect.height / s.h;
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(s.w * dpr);
      canvas.height = Math.round(s.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first) seed();
      else
        s.flakes.forEach((f) => {
          f.x *= kx;
          f.y *= ky;
        });
      hang();
      stale = true;
    };

    const locate = () => {
      stale = false;
      s.top = section.getBoundingClientRect().top - canvas.getBoundingClientRect().top;
    };

    // Centro de una bola en coordenadas del canvas.
    const centerOf = (b) => ({
      x: b.x + Math.sin(-b.a) * b.arm,
      y: s.top + Math.cos(b.a) * b.arm,
    });

    // Un pulso: la nieve se frena un instante y se va de lado (a un lado y
    // al otro; el primero de cada cuatro, más fuerte); las bolas reciben su
    // empujón cada dos pulsos, alternando el sentido.
    const onBeat = (n) => {
      const e = s.energy;
      if (e < 0.05) return;
      s.pulse = 1;
      const dir = n % 2 ? 1 : -1;
      const accent = n % 4 === 0 ? 1.5 : 1;
      for (const f of s.flakes) {
        const drift = LAYERS[f.layer].drift;
        f.ix += dir * (24 + 34 * drift) * accent * e;
        f.iy -= f.fall * 0.85 * accent * e;
      }
      s.baubles.forEach((b, i) => {
        if ((n + i) % 2) return;
        const way = Math.floor((n + i) / 2) % 2 ? 1 : -1;
        b.v += way * 0.5 * accent * e;
      });
    };

    const step = (dt) => {
      s.time += dt;
      const target = playingRef.current ? 1 : 0;
      s.energy += (target - s.energy) * Math.min(1, dt * 1.6);
      const e = s.energy;

      const before = Math.floor(s.beat);
      s.beat += (dt * tempoRef.current) / 60;
      const now = Math.floor(s.beat);
      if (now !== before) onBeat(now);
      s.pulse *= Math.exp(-dt * 5);

      // Viento de fondo, lento; con música sopla algo más.
      s.wind = Math.sin(s.time * 0.21) * 9 + Math.sin(s.time * 0.53 + 1.7) * 5 * (1 + e);

      const P = s.pointer;
      const reach = s.w < 640 ? 92 : 120;
      const fade = Math.exp(-dt * 3.2);
      for (const f of s.flakes) {
        const L = LAYERS[f.layer];
        if (P.active) {
          const dx = f.x - P.x;
          const dy = f.y - P.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach * reach && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const k = 1 - d / reach;
            // Se aparta del puntero y se deja llevar por su movimiento.
            f.ix += ((dx / d) * 760 * k + (P.vx - f.ix) * 5 * k) * dt;
            f.iy += ((dy / d) * 760 * k + (P.vy - f.iy) * 5 * k) * dt;
          }
        }
        f.x += (s.wind * L.drift + Math.sin(s.time * f.freq + f.ph) * f.sway + f.ix) * dt;
        f.y += (f.fall * (1 + e * 0.2) + f.iy) * dt;
        f.ix *= fade;
        f.iy *= fade;

        if (f.y > s.h + 12) {
          f.y = -12;
          f.x = Math.random() * s.w;
          f.ix = 0;
          f.iy = 0;
        } else if (f.y < -60) f.y = -60;
        if (f.x < -12) f.x += s.w + 24;
        else if (f.x > s.w + 12) f.x -= s.w + 24;
      }

      // El puntero pierde velocidad si se queda quieto.
      const slow = Math.exp(-dt * 9);
      P.vx *= slow;
      P.vy *= slow;

      for (const b of s.baubles) {
        if (P.active) {
          const c = centerOf(b);
          const near = Math.hypot(P.x - c.x, P.y - c.y) < b.w * 0.75;
          if (near) {
            // Pasar por encima la empuja; quedarse quieto la aparta.
            b.v -= (clamp(P.vx, -900, 900) / b.arm) * 3 * dt;
            b.v -= Math.sign(c.x - P.x || 1) * 2.4 * dt;
          }
        }
        b.v += (-(1800 / b.arm) * Math.sin(b.a) - b.v * 0.9) * dt;
        b.a = clamp(b.a + b.v * dt, -0.7, 0.7);
        if (Math.abs(b.a) === 0.7) b.v *= -0.3;
      }
    };

    const drawLayer = (layer) => {
      const L = LAYERS[layer];
      const sprite = L.soft ? soft : sharp;
      // El copo late con el pulso: crece un poco y se aclara.
      const grow = 1 + s.pulse * s.energy * (L.soft ? 0.14 : 0.3);
      ctx.globalAlpha = Math.min(1, L.alpha * (1 + s.pulse * s.energy * 0.25));
      for (const f of s.flakes) {
        if (f.layer !== layer) continue;
        const d = f.r * 2.4 * grow;
        ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };

    const drawBaubles = () => {
      if (!s.images) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(243, 236, 228, 0.55)";
      for (const b of s.baubles) {
        // Fuera de la pantalla (la sección ya subió): no se pinta.
        if (s.top + b.len + b.h < -20 || s.top > s.h) continue;
        ctx.save();
        ctx.translate(b.x, s.top);
        ctx.rotate(b.a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, b.len + 2);
        ctx.stroke();
        ctx.translate(0, b.len);
        ctx.rotate(b.meta.tilt);
        ctx.drawImage(s.images[b.img], -b.meta.hx * b.w, -b.meta.hy * b.h, b.w, b.h);
        ctx.restore();
      }
    };

    const frame = (dt) => {
      if (!s.w) return;
      if (stale) locate();
      if (dt > 0) step(dt);
      ctx.clearRect(0, 0, s.w, s.h);
      drawLayer(0);
      drawLayer(1);
      drawBaubles();
      drawLayer(2);
    };

    // ── Bucle: solo con la sección en pantalla y la pestaña visible ──
    let raf = 0;
    let visible = false;
    let lastTs = 0;
    const minStep = lowEnd ? 1000 / 31 : 0;
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      if (lastTs && ts - lastTs < minStep) return;
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      frame(dt);
    };
    const start = () => {
      if (raf || reduced || !visible || document.hidden) return;
      lastTs = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        measure();
        frame(0);
      });
    });
    ro.observe(canvas);

    let loading = false;
    const load = () => {
      if (loading) return;
      loading = true;
      Promise.all(BAUBLES.map((b) => loadImage(`${IMG}/${b.src}`)))
        .then((images) => {
          if (dead) return;
          s.images = images;
          frame(0);
        })
        .catch(() => {
          // Sin las fotos de las bolas la nevada sigue igual.
        });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          load();
          start();
        } else stop();
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(section);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // El canvas va pegado a la pantalla y la sección no: al hacer scroll
    // cambia dónde cuelgan las bolas respecto al canvas.
    const onScroll = () => {
      stale = true;
      if (reduced) frame(0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Puntero ───────────────────────────────────────────────────────
    const aim = (clientX, clientY) => {
      if (reduced) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const P = s.pointer;
      const t = performance.now();
      const gap = (t - P.at) / 1000;
      if (P.active && gap > 0.001 && gap < 0.12) {
        P.vx = clamp(P.vx * 0.5 + ((x - P.x) / gap) * 0.5, -1400, 1400);
        P.vy = clamp(P.vy * 0.5 + ((y - P.y) / gap) * 0.5, -1400, 1400);
      } else {
        P.vx = 0;
        P.vy = 0;
      }
      P.x = x;
      P.y = y;
      P.at = t;
      P.active = true;
    };
    const onPointer = (e) => aim(e.clientX, e.clientY);
    const onTouch = (e) => {
      const touch = e.touches[0];
      if (touch) aim(touch.clientX, touch.clientY);
    };
    const onLeave = () => {
      s.pointer.active = false;
    };
    // Un toque sopla la nieve de alrededor y columpia la bola que esté cerca.
    const onClick = (e) => {
      if (reduced || e.target.closest("input, button, a, [role='button'], label, .fb-card, .fb-inset")) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const reach = 170;
      for (const f of s.flakes) {
        const dx = f.x - x;
        const dy = f.y - y;
        const d = Math.hypot(dx, dy);
        if (d > reach || d < 0.01) continue;
        const k = 1 - d / reach;
        f.ix += (dx / d) * 300 * k;
        f.iy += (dy / d) * 300 * k;
      }
      for (const b of s.baubles) {
        const c = centerOf(b);
        if (Math.hypot(x - c.x, y - c.y) > b.w * 0.9) continue;
        b.v += (x > c.x ? 1 : -1) * 2.6;
      }
    };

    section.addEventListener("pointermove", onPointer);
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("touchmove", onTouch, { passive: true });
    section.addEventListener("touchend", onLeave, { passive: true });
    section.addEventListener("touchcancel", onLeave, { passive: true });
    section.addEventListener("click", onClick);

    // Movimiento reducido activado a mitad de visita: el bucle se detiene, las
    // bolas vuelven a su sitio y queda un cuadro quieto. Al quitarlo, sigue.
    const onMotion = () => {
      reduced = motion.matches;
      if (!reduced) {
        start();
        return;
      }
      stop();
      s.pointer.active = false;
      s.baubles.forEach((b) => {
        b.a = 0;
        b.v = 0;
      });
      frame(0);
    };
    motion.addEventListener?.("change", onMotion);

    return () => {
      dead = true;
      stop();
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener?.("change", onMotion);
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("touchmove", onTouch);
      section.removeEventListener("touchend", onLeave);
      section.removeEventListener("touchcancel", onLeave);
      section.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="nv-snow" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
