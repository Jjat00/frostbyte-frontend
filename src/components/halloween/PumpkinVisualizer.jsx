import React from "react";
import { themeColorChannels } from "@/lib/themeColors";

/**
 * El cementerio de las calabazas que cantan: fondo de Halloween de la
 * sección de música (reemplaza a MusicVisualizer mientras dura la campaña).
 *
 * Es un fondo: el buscador y las canciones van encima. El canvas va pegado
 * (sticky) a la pantalla dentro de la sección, así que la escena se queda
 * quieta mientras la lista pasa por delante.
 *
 * Todo sale de fotos, no de figuras dibujadas: el cementerio con niebla
 * (árboles, lápidas y reja), la luna, una niebla violeta que se arrastra y,
 * sobre el camino, cinco calabazas talladas. La luz de cada cara se separa de
 * la foto al cargar (los píxeles amarillos del tallado), así que cada
 * calabaza enciende y apaga su vela por su cuenta:
 * - con música cantan a coro, cada una con su pulso, y sueltan notas;
 * - sin música duermen con la vela casi apagada y sueltan zetas;
 * - con el puntero encima se asustan (la llama se aviva y tiemblan);
 * - al tocarlas escupen murciélagos, y al tocar la luna también salen.
 *
 * Pensada para celulares de gama baja:
 * - las imágenes se piden cuando la sección se acerca a la pantalla (el
 *   celular baja una foto de 960 px) y se decodifican fuera del hilo;
 * - cielo, foto y velo se pintan una vez en un lienzo aparte y cada cuadro
 *   solo lo estampa con luna, niebla y calabazas encima; el canvas es opaco
 *   y sin shadowBlur ni degradados por cuadro;
 * - DPR tope 1,5, y en equipos modestos (≤4 núcleos o ≤3 GB) DPR 1 y
 *   30 cuadros por segundo;
 * - el bucle se detiene con la sección fuera de pantalla o la pestaña
 *   oculta. Con movimiento reducido se pinta un solo cuadro quieto.
 */

const IMG = "/images/halloween";
const SOURCES = {
  photo: `${IMG}/cementerio.webp`,
  photoSmall: `${IMG}/cementerio-movil.webp`,
  moon: `${IMG}/luna-real.webp`,
  fog: `${IMG}/niebla-violeta.webp`,
  pumpkins: `${IMG}/calabazas.webp`,
};

// Coordenadas de la foto de 1600×900 (la del celular es la misma a 960 px
// y se escala a estas medidas); ahí la luna cae sobre cielo abierto, entre los
// árboles.
const PHOTO = { w: 1600, h: 900, moonX: 1010, moonY: 165, moonR: 62 };

// Centro de la cara de cada calabaza en calabazas.webp (1000×667). La del
// medio (índice 2) es la solista: canta más fuerte y de ella salen las notas.
const FACES = [
  { x: 200, y: 430, ph: 0.5, gain: 0.85 },
  { x: 365, y: 250, ph: 0.25, gain: 0.8 },
  { x: 525, y: 455, ph: 0, gain: 1 },
  { x: 700, y: 260, ph: 0.75, gain: 0.8 },
  { x: 835, y: 445, ph: 0.5, gain: 0.85 },
];
const SOLO = 2;

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const css = (c, a = 1) => `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a})`;

const makeLayer = (w, h, dpr = 1) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const g = c.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [c, g];
};

// Se decodifica fuera del hilo principal antes del primer dibujo, para que
// pintarla no trabe el scroll.
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(im));
    im.onerror = reject;
    im.src = src;
  });

// Equipo modesto: pocos núcleos o poca memoria (deviceMemory solo existe en
// Chrome; donde no está se asume que alcanza).
const isLowEnd = () =>
  (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;

/**
 * Separa las velas de la foto de las calabazas: devuelve el grupo con las
 * caras apagadas (huecos oscuros) y, por calabaza, un recorte con solo su
 * luz. La luz se reconoce por el color: el tallado encendido es amarillo y la
 * cáscara es rojiza y oscura.
 */
function splitPumpkins(img, PW) {
  const PH = Math.round((PW * img.height) / img.width);
  const [base, gb] = makeLayer(PW, PH);
  gb.drawImage(img, 0, 0, PW, PH);
  const src = gb.getImageData(0, 0, PW, PH);
  const d = src.data;
  const sc = PW / 1000;
  const n = PW * PH;
  const mask = new Float32Array(n);
  const owner = new Uint8Array(n);
  const boxes = FACES.map(() => [PW, PH, -1, -1]);

  for (let i = 0; i < n; i++) {
    const p = i * 4;
    if (d[p + 3] < 8) continue;
    const m = clamp((d[p + 1] - 95) / 80, 0, 1) * clamp((d[p] - 150) / 60, 0, 1);
    if (m <= 0) continue;
    const x = i % PW;
    const y = (i / PW) | 0;
    let best = 0;
    let bestD = Infinity;
    FACES.forEach((f, k) => {
      const dd = (x - f.x * sc) ** 2 + (y - f.y * sc) ** 2;
      if (dd < bestD) {
        bestD = dd;
        best = k;
      }
    });
    mask[i] = m;
    owner[i] = best;
    const b = boxes[best];
    if (x < b[0]) b[0] = x;
    if (y < b[1]) b[1] = y;
    if (x > b[2]) b[2] = x;
    if (y > b[3]) b[3] = y;
  }

  const glows = boxes.map((b) => {
    if (b[2] < 0) return null;
    const w = b[2] - b[0] + 1;
    const h = b[3] - b[1] + 1;
    return { x: b[0], y: b[1], w, h, data: new ImageData(w, h) };
  });

  // Huecos apagados: el hueco de una calabaza sin vela es casi negro.
  const unlit = gb.createImageData(PW, PH);
  const u = unlit.data;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const m = mask[i];
    u[p] = d[p] * (1 - m) + 38 * m;
    u[p + 1] = d[p + 1] * (1 - m) + 12 * m;
    u[p + 2] = d[p + 2] * (1 - m) + 4 * m;
    u[p + 3] = d[p + 3];
    if (m > 0) {
      const gl = glows[owner[i]];
      const x = (i % PW) - gl.x;
      const y = ((i / PW) | 0) - gl.y;
      const q = (y * gl.w + x) * 4;
      gl.data.data[q] = d[p];
      gl.data.data[q + 1] = d[p + 1];
      gl.data.data[q + 2] = d[p + 2];
      gl.data.data[q + 3] = d[p + 3] * m;
    }
  }
  gb.putImageData(unlit, 0, 0);

  return {
    base,
    w: PW,
    h: PH,
    glows: glows.map((gl) => {
      if (!gl) return null;
      const [c, g] = makeLayer(gl.w, gl.h);
      g.putImageData(gl.data, 0, 0);
      return { c, x: gl.x, y: gl.y, w: gl.w, h: gl.h };
    }),
  };
}

export default function PumpkinVisualizer({ isPlaying = false }) {
  const canvasRef = React.useRef(null);
  const playingRef = React.useRef(isPlaying);
  playingRef.current = isPlaying;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    // canvas → capa .hw-scene → la sección.
    const section = canvas?.parentElement?.parentElement;
    if (!canvas || !section) return undefined;
    // Opaco: el fondo lo cubre entero y así el navegador compone más barato.
    const ctx = canvas.getContext("2d", { alpha: false });
    let dead = false;
    const lowEnd = isLowEnd();

    // El tema de la campaña cuelga del contenedor de la carta, no del body:
    // los tokens se leen desde el propio canvas.
    const read = (token, fallback) => themeColorChannels(token, canvas) || fallback;
    const P = read("--color-primary", [255, 138, 31]);
    const S = read("--color-secondary", [166, 107, 255]);
    const L = read("--color-light", [245, 236, 226]);
    const D = read("--color-dark", [11, 8, 16]);
    const N = read("--hw-night", [5, 3, 5]);
    const E = read("--hw-ember", [255, 179, 71]);
    const fontBody = getComputedStyle(canvas).getPropertyValue("--font-body").trim() || "sans-serif";
    const C = {
      star: css(L),
      bat: css(mix(N, S, 0.05)),
      batBurst: css(mix(N, S, 0.35)),
      note: css(E),
      zz: css(L),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const s = {
      w: 0, h: 0, M: 16, key: "",
      photo: { x: 0, y: 0, w: 0, h: 0 },
      moon: { x: 0, y: 0, r: 30 },
      group: { x: 0, y: 0, w: 0, h: 0, k: 1, fk: 1 },
      time: 0, energy: isPlaying ? 1 : 0.05,
      par: 0, scare: 0, jolt: 0,
      pointer: { x: 0, y: 0, active: false, last: 0 },
      beatIdx: 0, zAt: 0,
      bats: [], floaters: [],
      fogX: Math.random() * 1000,
    };
    let A = null; // imágenes y lienzos preparados
    let bg = null; // cielo + foto + velo, pre-pintado
    let glowSprite = null; // resplandor de las velas en el suelo

    // ── Tamaño y composición ─────────────────────────────────────────
    let dpr = 1;
    const paintBackground = (W, H) => {
      const { M } = s;
      const ph = s.photo;
      const [c, g] = makeLayer(W + M * 2, H, dpr);
      g.translate(M, 0);
      // Color del borde de arriba de la foto, para que el cielo empalme.
      const [, gp] = makeLayer(16, 1);
      gp.drawImage(A.photo, 0, 0, A.photo.width, 3, 0, 0, 16, 1);
      const px = gp.getImageData(0, 0, 16, 1).data;
      let edge = [0, 0, 0];
      for (let i = 0; i < 16; i++) edge = edge.map((v, j) => v + px[i * 4 + j] / 16);

      const sky = g.createLinearGradient(0, 0, 0, Math.max(1, ph.y + 2));
      sky.addColorStop(0, css(D));
      sky.addColorStop(1, css(edge));
      g.fillStyle = sky;
      g.fillRect(-M, 0, W + M * 2, Math.max(0, ph.y) + 2);
      g.drawImage(A.photo, 0, 0, A.photo.width, A.photo.height, ph.x, ph.y, ph.w, ph.h);
      if (ph.y > 0) {
        // Empalme suave entre el cielo liso y la foto.
        const seam = g.createLinearGradient(0, ph.y, 0, ph.y + ph.h * 0.12);
        seam.addColorStop(0, css(edge));
        seam.addColorStop(1, css(edge, 0));
        g.fillStyle = seam;
        g.fillRect(-M, ph.y, W + M * 2, ph.h * 0.12);
      }
      // Velo para leer el buscador y la lista; se aclara al pie, donde
      // están las calabazas, y arriba deja ver el cielo.
      const veil = g.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0, css(D, 0.15));
      veil.addColorStop(0.3, css(D, 0.4));
      veil.addColorStop(0.62, css(D, 0.32));
      veil.addColorStop(1, css(D, 0));
      g.fillStyle = veil;
      g.fillRect(-M, 0, W + M * 2, H);
      bg = c;

      const [gs, gg] = makeLayer(64, 64);
      const rg = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, css(P, 0.3));
      rg.addColorStop(1, css(P, 0));
      gg.fillStyle = rg;
      gg.fillRect(0, 0, 64, 64);
      glowSprite = gs;
    };

    const measure = () => {
      if (!A) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const W = rect.width;
      const H = rect.height;
      s.w = W;
      s.h = H;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // La foto se asienta abajo. En pantallas anchas cubre todo; en el
      // celular se deja a ~70% del alto para que quepan las lápidas de los
      // lados, y encima queda cielo liso del mismo color que su borde.
      const M = (s.M = Math.max(12, Math.round(W * 0.025)));
      const k = Math.max((W + M * 2) / PHOTO.w, (H * 0.7) / PHOTO.h);
      const pw = PHOTO.w * k;
      const ph = PHOTO.h * k;
      s.photo = { x: (W - pw) / 2, y: H - ph, w: pw, h: ph, k };

      const mr = Math.max(PHOTO.moonR * k, Math.min(W * 0.11, 70));
      s.moon = {
        x: Math.min(s.photo.x + PHOTO.moonX * k, W - mr * 1.6),
        y: Math.max(mr * 1.4, Math.min(s.photo.y + PHOTO.moonY * k, H * 0.16)),
        r: mr,
      };

      // Las calabazas, sobre el camino al pie de la pantalla.
      const gw = clamp(W * 0.7, 220, 440);
      const gh = (gw * A.pumpkins.h) / A.pumpkins.w;
      // k escala los recortes de luz; fk, las coordenadas de FACES (en 1000 px).
      s.group = { x: W / 2 - gw / 2, y: H - gh - H * 0.03, w: gw, h: gh, k: gw / A.pumpkins.w, fk: gw / 1000 };

      const key = [W, H, dpr].join("|");
      if (key !== s.key) {
        s.key = key;
        paintBackground(W, H);
      }
    };

    // ── Piezas animadas ───────────────────────────────────────────────
    const drawBat = (x, y, k, flap) => {
      const wy = -k * 0.6 * flap;
      ctx.beginPath();
      ctx.moveTo(x, y - k * 0.2);
      ctx.lineTo(x + k * 0.1, y - k * 0.32);
      ctx.lineTo(x + k * 0.12, y - k * 0.14);
      ctx.quadraticCurveTo(x + k * 0.45, y - k * 0.35 + wy * 0.5, x + k * 1.05, y + wy);
      ctx.quadraticCurveTo(x + k * 0.88, y + k * 0.08 + wy * 0.4, x + k * 0.72, y + k * 0.2 + wy * 0.3);
      ctx.quadraticCurveTo(x + k * 0.55, y + k * 0.1, x + k * 0.4, y + k * 0.28);
      ctx.quadraticCurveTo(x + k * 0.24, y + k * 0.1, x, y + k * 0.32);
      ctx.quadraticCurveTo(x - k * 0.24, y + k * 0.1, x - k * 0.4, y + k * 0.28);
      ctx.quadraticCurveTo(x - k * 0.55, y + k * 0.1, x - k * 0.72, y + k * 0.2 + wy * 0.3);
      ctx.quadraticCurveTo(x - k * 0.88, y + k * 0.08 + wy * 0.4, x - k * 1.05, y + wy);
      ctx.quadraticCurveTo(x - k * 0.45, y - k * 0.35 + wy * 0.5, x - k * 0.12, y - k * 0.14);
      ctx.lineTo(x - k * 0.1, y - k * 0.32);
      ctx.closePath();
      ctx.fill();
    };

    // Estrellas en la franja de cielo.
    const STARS = Array.from({ length: 26 }, () => ({
      x: Math.random(), y: Math.random(), sp: 0.6 + Math.random() * 0.9,
    }));

    // ── Un cuadro ─────────────────────────────────────────────────────
    const frame = (dt) => {
      if (!A || !bg) return;
      s.time += dt;
      const t = s.time;
      const { w: W, h: H, M, moon, group: G } = s;
      const now = performance.now();

      s.energy = lerp(s.energy, playingRef.current ? 1 : 0.05, 0.03);
      const energy = s.energy;
      const beatPhase = (t * 124) / 60;
      const pulse = (ph) => Math.pow(Math.sin((beatPhase + ph) * Math.PI) * 0.5 + 0.5, 4) * energy;

      const pt = s.pointer;
      if (pt.active && now - pt.last > 2600) pt.active = false;
      const parT = pt.active ? clamp((pt.x - W / 2) / (W / 2), -1, 1) : Math.sin(t * 0.13) * 0.4;
      s.par = lerp(s.par, parT, 0.04);
      const shift = -s.par * M * 0.8;

      const inGroup = pt.active && pt.x > G.x && pt.x < G.x + G.w && pt.y > G.y && pt.y < G.y + G.h;
      s.scare = lerp(s.scare, inGroup ? 1 : 0, inGroup ? 0.12 : 0.04);
      s.jolt = Math.max(0, s.jolt - dt * 1.4);
      const fright = Math.min(1, s.scare + s.jolt);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Fondo (opaco: borra el cuadro anterior).
      ctx.drawImage(bg, -M + shift * 0.4, 0, W + M * 2, H);

      // Estrellas que titilan sobre el cielo.
      const skyH = Math.max(H * 0.22, s.photo.y + s.photo.h * 0.25);
      ctx.fillStyle = C.star;
      for (const st of STARS) {
        ctx.globalAlpha = 0.25 + 0.55 * Math.max(0, Math.sin(t * st.sp + st.x * 20));
        ctx.fillRect(st.x * W, st.y * skyH, 1.5, 1.5);
      }

      // Luna: se funde con el cielo (screen).
      const mx = moon.x + shift * 0.2;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.95;
      ctx.drawImage(A.moon, mx - moon.r * 1.45, moon.y - moon.r * 1.45, moon.r * 2.9, moon.r * 2.9);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Murciélagos que rondan la luna.
      ctx.fillStyle = C.bat;
      for (let i = 0; i < 3; i++) {
        const a = t * (0.35 + i * 0.07) + i * 2.1;
        const bx = mx + Math.cos(a) * moon.r * (2 + i * 0.4);
        const by = moon.y + Math.sin(a) * moon.r * 0.7 + Math.sin(t * 3 + i) * 4 - i * 6;
        drawBat(bx, by, moon.r * (0.16 + i * 0.03), Math.sin(t * 16 + i * 1.7));
      }

      // Niebla que se arrastra (dos copias para que no se acabe).
      const fw = W * 1.3;
      const fh = (fw * A.fog.height) / A.fog.width;
      const drawFog = (y, speed, alpha, flip) => {
        const off = (((s.fogX + t * speed) % fw) + fw) % fw;
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = alpha;
        for (const x of [off - fw, off]) {
          if (flip) {
            ctx.save();
            ctx.translate(x + fw, y);
            ctx.scale(-1, 1);
            ctx.drawImage(A.fog, 0, 0, fw, fh);
            ctx.restore();
          } else {
            ctx.drawImage(A.fog, x, y, fw, fh);
          }
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      };
      drawFog(G.y + G.h * 0.35 - fh * 0.6, 7, 0.4, false);

      // Resplandor de las velas en el suelo.
      const lightAll = clamp(0.25 + energy * 0.55 + fright * 0.35, 0, 1.2);
      const gx = G.x + shift * 0.8;
      const cxg = W / 2 + shift * 0.8;
      const gcy = G.y + G.h * 0.8;
      const gr = G.w * 0.9;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(1, lightAll);
      ctx.drawImage(glowSprite, cxg - gr, gcy - gr, gr * 2, gr * 2);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Las calabazas: el grupo apagado y encima la vela de cada una.
      const solo = pulse(FACES[SOLO].ph);
      const shake = fright * 2;
      ctx.save();
      ctx.translate(gx + G.w / 2 + (Math.random() - 0.5) * shake, G.y + G.h + (Math.random() - 0.5) * shake);
      ctx.scale(1, 1 + solo * 0.025);
      ctx.translate(-G.w / 2, -G.h);
      ctx.drawImage(A.pumpkins.base, 0, 0, G.w, G.h);
      const k = G.k;
      A.pumpkins.glows.forEach((gl, i) => {
        if (!gl) return;
        const f = FACES[i];
        const flick = 0.85 + 0.08 * Math.sin(t * 13.1 + i * 1.7) * Math.sin(t * 7.3 + i) + 0.07 * Math.sin(t * 23.7 + i * 2.3);
        const light = clamp((0.22 + energy * 0.6 * f.gain + fright * 0.4) * flick + pulse(f.ph) * 0.35, 0.1, 1.4);
        const x = gl.x * k;
        const y = gl.y * k;
        const w = gl.w * k;
        const h = gl.h * k;
        ctx.globalAlpha = Math.min(1, light);
        ctx.drawImage(gl.c, x, y, w, h);
        if (light > 0.85) {
          // Pasado el tope, la llama se aviva: se suma encima.
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = Math.min(0.8, (light - 0.85) * 1.6);
          ctx.drawImage(gl.c, x, y, w, h);
          ctx.globalCompositeOperation = "source-over";
        }
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      // Niebla del frente, baja, sobre la base de las calabazas.
      drawFog(G.y + G.h - fh * 0.45, -10, 0.28, true);

      // Notas cuando cantan, zetas cuando duermen (salen de la solista).
      const sx = gx + FACES[SOLO].x * G.fk;
      const sy = G.y + FACES[SOLO].y * G.fk;
      const bi = Math.floor(beatPhase);
      if (bi !== s.beatIdx) {
        s.beatIdx = bi;
        if (energy > 0.5 && bi % 2 === 0 && s.floaters.length < 14) {
          s.floaters.push({
            ch: Math.random() < 0.5 ? "♪" : "♫", note: true,
            x: sx + (Math.random() - 0.5) * G.w * 0.5, y: sy,
            vx: (Math.random() - 0.5) * 40, vy: -45 - Math.random() * 25, age: 0, life: 2.6,
            size: G.w * (0.06 + Math.random() * 0.03),
          });
        }
      }
      if (energy < 0.3 && t > s.zAt) {
        s.zAt = t + 1.4;
        s.floaters.push({
          ch: "z", note: false, x: sx + G.w * 0.12, y: sy - G.h * 0.35,
          vx: 12, vy: -16, age: 0, life: 2.6, size: G.w * 0.05,
        });
      }
      ctx.textAlign = "center";
      for (let i = s.floaters.length - 1; i >= 0; i--) {
        const f = s.floaters[i];
        f.age += dt;
        if (f.age > f.life) {
          s.floaters.splice(i, 1);
          continue;
        }
        const q = f.age / f.life;
        const size = f.note ? f.size : f.size * (0.7 + q * 0.9);
        ctx.globalAlpha = Math.sin(Math.min(1, q * 1.2) * Math.PI) * (f.note ? 0.95 : 0.55);
        ctx.fillStyle = f.note ? C.note : C.zz;
        ctx.font = `700 ${Math.round(size)}px ${fontBody}`;
        ctx.fillText(f.ch, f.x + f.vx * f.age + Math.sin(f.age * 4) * 6, f.y + f.vy * f.age);
      }
      ctx.globalAlpha = 1;

      // Murciélagos del toque.
      ctx.fillStyle = C.batBurst;
      for (let i = s.bats.length - 1; i >= 0; i--) {
        const b = s.bats[i];
        b.life -= dt * 0.45;
        if (b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) {
          s.bats.splice(i, 1);
          continue;
        }
        b.vx *= 0.995;
        b.vy = b.vy * 0.995 - dt * 14;
        b.x += b.vx * dt;
        b.y += b.vy * dt + Math.sin(t * 6 + b.ph) * 0.6;
        ctx.globalAlpha = Math.min(1, b.life * 1.6) * 0.95;
        drawBat(b.x, b.y, b.size, Math.sin(t * 22 + b.ph));
      }
      ctx.globalAlpha = 1;
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
      if (raf || reduced || !visible || document.hidden || !A) return;
      lastTs = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const still = () => {
      s.energy = playingRef.current ? 1 : 0.05;
      frame(0);
    };

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        measure();
        if (reduced) still();
        else frame(0);
      });
    });
    ro.observe(canvas);

    // Con margen: las imágenes se piden y el bucle arranca un poco antes de
    // que la sección entre, para que no aparezca en blanco.
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

    let loading = false;
    function load() {
      if (loading) return;
      loading = true;
      const width = canvas.getBoundingClientRect().width || window.innerWidth;
      const photoSrc = width < 768 ? SOURCES.photoSmall : SOURCES.photo;
      Promise.all([photoSrc, SOURCES.moon, SOURCES.fog, SOURCES.pumpkins].map(loadImage))
        .then(([photo, moon, fog, pumpkins]) => {
          if (dead) return;
          // Las caras se separan al tamaño al que se van a pintar, no más.
          const scale = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
          const pw = Math.round(clamp(Math.min(width * 0.7, 440) * scale, 300, 660));
          A = { photo, moon, fog, pumpkins: splitPumpkins(pumpkins, pw) };
          measure();
          if (reduced) still();
          else start();
        })
        .catch(() => {
          // Sin imágenes la sección queda con su fondo liso; el buscador sigue.
        });
    }

    // ── Puntero ───────────────────────────────────────────────────────
    const aim = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
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
    const onLeave = () => {
      s.pointer.active = false;
    };
    const burst = (x, y, count, spread, dir) => {
      const room = 36 - s.bats.length;
      for (let i = 0; i < Math.min(room, count); i++) {
        const a = dir + (Math.random() - 0.5) * spread;
        const v = 140 + Math.random() * 160;
        s.bats.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, ph: Math.random() * TAU, size: s.group.w * (0.04 + Math.random() * 0.04),
        });
      }
    };
    const onClick = (e) => {
      if (!A || e.target.closest("input, button, a, [role='button'], label, .fb-card, .fb-inset")) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const G = s.group;
      if (x > G.x && x < G.x + G.w && y > G.y && y < G.y + G.h) {
        s.jolt = 1;
        burst(G.x + FACES[SOLO].x * G.fk, G.y + FACES[SOLO].y * G.fk, 6 + Math.floor(Math.random() * 3), 2.6, -Math.PI / 2);
        return;
      }
      if (Math.hypot(x - s.moon.x, y - s.moon.y) < s.moon.r * 1.4) burst(s.moon.x, s.moon.y, 6, TAU, 0);
    };

    if (!reduced) {
      section.addEventListener("pointermove", onPointer);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("touchmove", onTouch, { passive: true });
      section.addEventListener("click", onClick);
    }

    return () => {
      dead = true;
      stop();
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("touchmove", onTouch);
      section.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="hw-scene" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
