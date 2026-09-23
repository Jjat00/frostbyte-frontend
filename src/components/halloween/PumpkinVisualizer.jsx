import React from "react";
import { themeColorChannels } from "@/lib/themeColors";

/**
 * La calabaza que canta: versión de Halloween del visualizador de la sección
 * de música (reemplaza a MusicVisualizer mientras dura la campaña).
 *
 * Una calabaza de partículas con la cara tallada encendida por dentro:
 * - mira al cursor (o al dedo): gira la cara hacia donde esté el puntero y,
 *   si nadie la mira, deja vagar la vista;
 * - canta: con música sonando la boca se abre al pulso y la vela arde; sin
 *   música se queda dormida, con la luz casi apagada;
 * - se asusta: con el puntero encima tiembla, abre la boca y aparta las
 *   partículas de la cáscara;
 * - al tocarla escupe murciélagos.
 *
 * Pensada para celulares de gama baja: sin shadowBlur, cuadraditos en vez de
 * arcos, un color por grupo (solo cambia globalAlpha), DPR tope 1,5 y el
 * bucle se detiene con la sección fuera de pantalla o la pestaña oculta.
 * Con movimiento reducido se pinta un solo cuadro quieto.
 *
 * La calabaza se centra sobre `stageRef` (un hueco reservado en el flujo de
 * la sección), no en el centro del canvas: ahí la taparía el buscador.
 */

const TAU = Math.PI * 2;

// Cara tallada en coordenadas de la esfera: θ (longitud, 0 = de frente,
// positiva a la derecha del que mira) y φ (latitud, positiva arriba).
const EYE_L = [[-0.64, 0.17], [-0.14, 0.07], [-0.44, 0.47]];
const EYE_R = EYE_L.map(([t, f]) => [-t, f]);
const NOSE = [[-0.09, -0.06], [0.09, -0.06], [0, 0.1]];
const MOUTH_W = 0.8;
const mouthTop = (t) => -0.2 - 0.14 * (1 - (t / MOUTH_W) ** 2);
const mouthBottom = (t) => -0.3 - 0.27 * (1 - (t / MOUTH_W) ** 2);

const inTri = (t, f, [a, b, c]) => {
  const d1 = (t - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (f - b[1]);
  const d2 = (t - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (f - c[1]);
  const d3 = (t - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (f - a[1]);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
};

const inMouth = (t, f) => {
  if (Math.abs(t) > MOUTH_W) return false;
  const top = mouthTop(t);
  const bottom = mouthBottom(t);
  if (f > top || f < bottom) return false;
  // Dientes: dos cuelgan de arriba, tres suben de abajo.
  for (const c of [-0.24, 0.24]) if (Math.abs(t - c) < 0.07 && f > top - 0.08) return false;
  for (const c of [-0.46, 0, 0.46]) if (Math.abs(t - c) < 0.065 && f < bottom + 0.08) return false;
  return true;
};

const featureAt = (t, f) => {
  if (inTri(t, f, EYE_L) || inTri(t, f, EYE_R)) return "eye";
  if (inTri(t, f, NOSE)) return "nose";
  if (inMouth(t, f)) return "mouth";
  return null;
};

// Gajos: diez bultos alrededor, con el surco marcado.
const ribOf = (t) => Math.abs(Math.cos(5 * t));
const radiusAt = (t) => 0.95 + 0.07 * ribOf(t);

// Punto de la cáscara en coordenadas locales (y hacia arriba, z hacia quien
// mira), achatado como una calabaza.
const shellPoint = (t, f, scale = 1) => {
  const r = radiusAt(t) * scale;
  const cf = Math.cos(f);
  return {
    x: cf * Math.sin(t) * r * 1.12,
    y: Math.sin(f) * r * 0.8 - 0.06 * Math.max(0, Math.sin(f)) ** 8, // hoyuelo del tallo
    z: cf * Math.cos(t) * r * 1.12,
  };
};

function buildPumpkin() {
  const shell = [];
  const N = 1500;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const ry = Math.sqrt(1 - y * y);
    const a = golden * i;
    const t = Math.atan2(ry * Math.cos(a), ry * Math.sin(a));
    const f = Math.asin(y);
    if (featureAt(t, f)) continue; // hueco tallado
    shell.push({ ...shellPoint(t, f), rib: ribOf(t), size: 1 + Math.random() * 1.1 });
  }

  // La luz de dentro, que se ve por los huecos. Se muestrea dentro de cada
  // figura; la boca guarda su borde superior para poder abrirse.
  const glow = [];
  const fill = (kind, count, [t0, t1], [f0, f1]) => {
    let n = 0;
    while (n < count) {
      const t = t0 + Math.random() * (t1 - t0);
      const f = f0 + Math.random() * (f1 - f0);
      if (featureAt(t, f) !== kind) continue;
      glow.push({ kind, t, f, size: 1.3 + Math.random() * 1.3, phase: Math.random() * TAU });
      n++;
    }
  };
  fill("eye", 150, [-0.66, 0.66], [0.05, 0.48]);
  fill("nose", 26, [-0.1, 0.1], [-0.07, 0.11]);
  fill("mouth", 240, [-MOUTH_W, MOUTH_W], [-0.58, -0.19]);

  // Tallo curvo encima.
  const stem = [];
  for (let i = 0; i < 150; i++) {
    const k = Math.random();
    const a = Math.random() * TAU;
    const r = 0.08 * (1 - 0.4 * k);
    stem.push({
      x: 0.16 * k * k + Math.cos(a) * r,
      y: 0.72 + 0.3 * k,
      z: Math.sin(a) * r - 0.05 * k,
      size: 1 + Math.random() * 0.9,
      lit: Math.cos(a) < 0, // cara que da a la luz
    });
  }
  return { shell, glow, stem };
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;

export default function PumpkinVisualizer({ isPlaying = false, stageRef }) {
  const canvasRef = React.useRef(null);
  const playingRef = React.useRef(isPlaying);
  playingRef.current = isPlaying;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const ctx = canvas.getContext("2d");

    // El tema de la campaña cuelga del contenedor de la carta, no del body:
    // los tokens se leen desde el propio canvas.
    const read = (token, fallback) => themeColorChannels(token, canvas) || fallback;
    const rgb = (token, fallback, k = 1) => {
      const c = read(token, fallback);
      return `rgb(${Math.round(c[0] * k)}, ${Math.round(c[1] * k)}, ${Math.round(c[2] * k)})`;
    };
    const night = read("--hw-night", [5, 3, 5]);
    const C = {
      shell: rgb("--color-primary", [255, 138, 31]),
      groove: rgb("--color-primary", [255, 138, 31], 0.5),
      vineDark: rgb("--hw-vine", [122, 154, 60], 0.55),
      ember: rgb("--hw-ember", [255, 179, 71]),
      hot: rgb("--color-light", [245, 236, 226]),
      vine: rgb("--hw-vine", [122, 154, 60]),
      spirit: rgb("--color-secondary", [166, 107, 255]),
      night: `rgba(${night[0]}, ${night[1]}, ${night[2]}, 0.3)`,
      nightSolid: `rgb(${night[0]}, ${night[1]}, ${night[2]})`,
    };
    const glowRgb = read("--color-primary", [255, 138, 31]);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { shell, glow, stem } = buildPumpkin();

    const s = {
      w: 0, h: 0, cx: 0, cy: 0, R: 100,
      time: 0, energy: isPlaying ? 1 : 0.05,
      yaw: 0, pitch: 0.1, scare: 0, jolt: 0,
      pointer: { x: 0, y: 0, active: false, last: 0 },
      blinkAt: 2.5, blink: 0,
      bats: [],
      wisps: Array.from({ length: 22 }, () => ({
        ox: (Math.random() - 0.5) * 1.6, p: Math.random(), v: 0.08 + Math.random() * 0.12,
        ph: Math.random() * TAU, size: 1.2 + Math.random() * 1.6,
      })),
      waves: [],
    };

    // ── Tamaño y posición ─────────────────────────────────────────────
    let dpr = 1;
    const measure = () => {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const stage = stageRef?.current?.getBoundingClientRect();
      if (stage && stage.height) {
        s.cx = stage.left - rect.left + stage.width / 2;
        s.cy = stage.top - rect.top + stage.height * 0.52;
        s.R = Math.min(stage.height * 0.36, rect.width * 0.26, 150);
      } else {
        s.cx = rect.width / 2;
        s.cy = rect.height * 0.3;
        s.R = Math.min(rect.width * 0.26, 110);
      }
      ctx.fillStyle = C.nightSolid;
      ctx.fillRect(0, 0, s.w, s.h);
    };

    // ── Proyección ────────────────────────────────────────────────────
    const FOV = 4.5; // en radios
    let cy = 0, sy = 0, cp = 1, sp = 0, ox = 0, oy = 0;
    const project = (p, out) => {
      const x1 = p.x * cy + p.z * sy;
      const z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cp - z1 * sp;
      const z2 = p.y * sp + z1 * cp;
      const k = FOV / (FOV - z2);
      out.x = ox + x1 * s.R * k;
      out.y = oy - y2 * s.R * k;
      out.z = z2;
      return out;
    };
    const tmp = { x: 0, y: 0, z: 0 };

    // ── Un cuadro ─────────────────────────────────────────────────────
    const frame = (dt) => {
      s.time += dt;
      const t = s.time;
      const { w, h, R } = s;
      const now = performance.now();

      s.energy = lerp(s.energy, playingRef.current ? 1 : 0.05, 0.03);
      const energy = s.energy;
      const beat = Math.pow(Math.sin((t * 124) / 60 * Math.PI) * 0.5 + 0.5, 4) * energy;

      // Mirada: al puntero si alguien lo mueve; si no, vaga sola.
      const pt = s.pointer;
      if (pt.active && now - pt.last > 2600) pt.active = false;
      let yawT, pitchT;
      if (pt.active) {
        yawT = clamp((pt.x - s.cx) / (w * 0.42), -1, 1) * 0.72;
        pitchT = clamp((pt.y - s.cy) / (h * 0.4), -1, 1) * 0.42;
      } else {
        yawT = Math.sin(t * 0.37) * 0.34 + Math.sin(t * 0.91) * 0.08;
        pitchT = 0.06 + Math.sin(t * 0.29) * 0.08;
      }
      s.yaw = lerp(s.yaw, yawT, 0.07);
      s.pitch = lerp(s.pitch, pitchT, 0.07);

      // Susto: puntero encima o un toque reciente.
      const near = pt.active && Math.hypot(pt.x - s.cx, pt.y - s.cy) < R * 1.35;
      s.scare = lerp(s.scare, near ? 1 : 0, near ? 0.12 : 0.04);
      s.jolt = Math.max(0, s.jolt - dt * 1.6);
      const fright = Math.min(1, s.scare + s.jolt);

      // Parpadeo de la luz de los ojos (la calabaza no tiene párpados).
      if (t > s.blinkAt) {
        s.blink = 1;
        s.blinkAt = t + 2.5 + Math.random() * 4;
      }
      s.blink = Math.max(0, s.blink - dt * 7);

      cy = Math.cos(s.yaw); sy = Math.sin(s.yaw);
      cp = Math.cos(s.pitch); sp = Math.sin(s.pitch);
      const shake = fright * 2.2;
      ox = s.cx + (Math.random() - 0.5) * shake;
      oy = s.cy - beat * 5 + (Math.random() - 0.5) * shake;

      // Estela: cada cuadro vela el anterior con la noche.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.night;
      ctx.fillRect(0, 0, w, h);

      // Vela: flama que titila; dormida casi no alumbra.
      const flicker = 0.82 + 0.1 * Math.sin(t * 13.1) * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 23.7);
      const light = clamp((0.36 + energy * 0.5 + fright * 0.45) * flicker + beat * 0.25, 0, 1.25);

      // Halo detrás.
      const halo = ctx.createRadialGradient(ox, oy, R * 0.4, ox, oy, R * 2.3);
      halo.addColorStop(0, `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, ${0.05 + light * 0.1})`);
      halo.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(ox - R * 2.3, oy - R * 2.3, R * 4.6, R * 4.6);

      // Almas que suben de la calabaza.
      ctx.fillStyle = C.spirit;
      for (const wsp of s.wisps) {
        wsp.p += dt * wsp.v * (0.6 + energy * 0.8);
        if (wsp.p > 1) { wsp.p = 0; wsp.ox = (Math.random() - 0.5) * 1.6; }
        const x = ox + wsp.ox * R + Math.sin(t * 1.4 + wsp.ph) * R * 0.18;
        const y = oy - R * 0.55 - wsp.p * R * 2.4;
        ctx.globalAlpha = Math.sin(wsp.p * Math.PI) * (0.25 + energy * 0.35);
        ctx.fillRect(x, y, wsp.size, wsp.size);
      }

      // Ondas del toque.
      for (let i = s.waves.length - 1; i >= 0; i--) {
        const wv = s.waves[i];
        wv.r += dt * 320;
        if (wv.r > wv.max) s.waves.splice(i, 1);
      }

      // Cáscara: primero la mitad de atrás, luego la de adelante.
      const repel = pt.active ? 95 : 0;
      const drawShell = (front, ridge) => {
        ctx.fillStyle = ridge ? C.shell : C.groove;
        for (const p of shell) {
          if (p.rib > 0.5 !== ridge) continue;
          project(p, tmp);
          if ((tmp.z >= 0) !== front) continue;
          let { x, y } = tmp;
          if (repel) {
            const dx = x - pt.x, dy = y - pt.y;
            const d = Math.hypot(dx, dy);
            if (d < repel && d > 0) {
              const f = (1 - d / repel) * (14 + fright * 16);
              x += (dx / d) * f; y += (dy / d) * f;
            }
          }
          for (const wv of s.waves) {
            const dx = x - wv.x, dy = y - wv.y;
            const d = Math.hypot(dx, dy);
            const off = Math.abs(d - wv.r);
            if (off < 40 && d > 0) {
              const f = (1 - off / 40) * 18 * (1 - wv.r / wv.max);
              x += (dx / d) * f; y += (dy / d) * f;
            }
          }
          const depth = (tmp.z + 1.2) / 2.4;
          ctx.globalAlpha = clamp(
            (0.12 + depth * 0.7) * (0.7 + 0.3 * p.rib) * (0.6 + 0.4 * Math.max(energy, fright)),
            0, 1
          );
          const sz = p.size * (0.55 + depth * 0.7);
          ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
      };
      drawShell(false, false);
      drawShell(false, true);
      drawShell(true, false);
      drawShell(true, true);

      // Tallo.
      for (const lit of [false, true]) {
        ctx.fillStyle = lit ? C.vine : C.vineDark;
        for (const p of stem) {
          if (p.lit !== lit) continue;
          project(p, tmp);
          ctx.globalAlpha = 0.45 + ((tmp.z + 1) / 2) * 0.45;
          const sz = p.size * 1.3;
          ctx.fillRect(tmp.x - sz / 2, tmp.y - sz / 2, sz, sz);
        }
      }

      // Luz por los huecos. La boca se abre con el pulso y con el susto.
      ctx.globalCompositeOperation = "lighter";
      const mouthOpen = beat * 0.9 + fright * 0.55 + Math.sin(t * 2.1) * 0.05 * energy;
      const eyeLight = light * (1 - s.blink * 0.9);
      for (const g of glow) {
        let f = g.f;
        if (g.kind === "mouth") {
          const top = mouthTop(g.t);
          f = top + (g.f - top) * (1 + mouthOpen * 0.75);
        }
        const q = shellPoint(g.t, f, 0.985);
        project(q, tmp);
        const base = g.kind === "eye" ? eyeLight : light;
        const tw = 0.75 + 0.25 * Math.sin(t * 9 + g.phase);
        ctx.globalAlpha = clamp(base * tw * 0.85, 0, 1);
        ctx.fillStyle = fright > 0.6 && g.phase > 4.2 ? C.hot : C.ember;
        const sz = g.size * (0.9 + light * 0.5);
        ctx.fillRect(tmp.x - sz / 2, tmp.y - sz / 2, sz, sz);
      }

      // Resplandor de la vela en la cara.
      project(shellPoint(0, -0.08), tmp);
      const candle = ctx.createRadialGradient(tmp.x, tmp.y, 0, tmp.x, tmp.y, R * 0.95);
      candle.addColorStop(0, `rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, ${0.1 * light})`);
      candle.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = candle;
      ctx.fillRect(tmp.x - R, tmp.y - R, R * 2, R * 2);
      const mouthX = tmp.x, mouthY = tmp.y + R * 0.3;
      ctx.globalCompositeOperation = "source-over";

      // Murciélagos.
      ctx.fillStyle = C.spirit;
      for (let i = s.bats.length - 1; i >= 0; i--) {
        const b = s.bats[i];
        if (b.fresh) { b.x = mouthX; b.y = mouthY; b.fresh = false; }
        b.life -= dt * 0.45;
        if (b.life <= 0 || b.x < -40 || b.x > w + 40 || b.y < -40) { s.bats.splice(i, 1); continue; }
        b.vx *= 0.995;
        b.vy = b.vy * 0.995 - dt * 14;
        b.x += b.vx * dt;
        b.y += b.vy * dt + Math.sin(t * 6 + b.ph) * 0.6;
        const flap = Math.sin(t * 22 + b.ph);
        const k = b.size;
        ctx.globalAlpha = Math.min(1, b.life * 1.6) * 0.9;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + k * 0.25);
        ctx.lineTo(b.x - k * 0.35, b.y - k * 0.05);
        ctx.lineTo(b.x - k, b.y - k * 0.55 * flap);
        ctx.lineTo(b.x - k * 0.6, b.y + k * 0.1);
        ctx.lineTo(b.x - k * 0.3, b.y + k * 0.05);
        ctx.lineTo(b.x, b.y + k * 0.25);
        ctx.lineTo(b.x + k * 0.3, b.y + k * 0.05);
        ctx.lineTo(b.x + k * 0.6, b.y + k * 0.1);
        ctx.lineTo(b.x + k, b.y - k * 0.55 * flap);
        ctx.lineTo(b.x + k * 0.35, b.y - k * 0.05);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // ── Bucle: solo con la sección en pantalla y la pestaña visible ──
    let raf = 0;
    let visible = false;
    let lastTs = 0;
    const loop = (ts) => {
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      frame(dt);
      raf = requestAnimationFrame(loop);
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

    measure();
    if (reduced) {
      s.blinkAt = Infinity;
      s.wisps = [];
      frame(0);
    }

    const ro = new ResizeObserver(() => {
      measure();
      if (reduced) frame(0);
    });
    ro.observe(parent);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(parent);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // ── Puntero ───────────────────────────────────────────────────────
    const aim = (clientX, clientY) => {
      const rect = parent.getBoundingClientRect();
      s.pointer.x = clientX - rect.left;
      s.pointer.y = clientY - rect.top;
      s.pointer.active = true;
      s.pointer.last = performance.now();
    };
    const onPointer = (e) => aim(e.clientX, e.clientY);
    const onTouch = (e) => {
      const touch = e.touches[0];
      if (touch) aim(touch.clientX, touch.clientY);
    };
    const onLeave = () => { s.pointer.active = false; };
    const onClick = (e) => {
      if (e.target.closest("input, button, a, [role='button'], label")) return;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.hypot(x - s.cx, y - s.cy) > s.R * 1.7) return;
      s.jolt = 1;
      s.waves.push({ x: s.cx, y: s.cy, r: 0, max: s.R * 3 });
      const room = 36 - s.bats.length;
      const count = Math.min(room, 5 + Math.floor(Math.random() * 3));
      for (let i = 0; i < count; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
        const v = 140 + Math.random() * 160;
        s.bats.push({
          fresh: true, x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, ph: Math.random() * TAU, size: 7 + Math.random() * 7,
        });
      }
    };

    if (!reduced) {
      parent.addEventListener("pointermove", onPointer);
      parent.addEventListener("pointerleave", onLeave);
      parent.addEventListener("touchmove", onTouch, { passive: true });
      parent.addEventListener("click", onClick);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      parent.removeEventListener("pointermove", onPointer);
      parent.removeEventListener("pointerleave", onLeave);
      parent.removeEventListener("touchmove", onTouch);
      parent.removeEventListener("click", onClick);
    };
  }, [stageRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />;
}
