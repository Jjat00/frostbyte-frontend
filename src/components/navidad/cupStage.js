/**
 * Granizado con volumen para los héroes de Navidad: foto recortada (WebP
 * con alfa) + mapa de profundidad en un shader de paralaje, WebGL a mano y
 * sin dependencias, más una inclinación CSS leve. Viene del laboratorio
 * `public/navidad-lab/cup3d.js` y del hero cinematográfico.
 *
 * Si WebGL o las texturas fallan queda la <img> con la inclinación, así que
 * el vaso nunca se ve vacío. `swap` cambia de sabor reusando el programa.
 *
 * Trampas (ver la nota del vault "Hero 3D con foto y mapa de profundidad"):
 * - La profundidad va muy suavizada al exportarla: con poco suavizado la
 *   pajilla deja un fantasma al girar.
 * - Fuera de la silueta la profundidad repite la del borde: si el fondo
 *   quedara "lejos", el paralaje rompería el contorno.
 * - Alfa premultiplicado en la textura de color y blend ONE, 1-SRC_ALPHA.
 */

const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision mediump float;
uniform sampler2D uTex,uDepth;uniform vec2 uView;uniform float uStr;varying vec2 v;
void main(){
  float d=texture2D(uDepth,v).r;
  vec2 uv=v-uView*(d-.5)*uStr;
  d=texture2D(uDepth,uv).r; uv=v-uView*(d-.5)*uStr;
  d=texture2D(uDepth,uv).r; uv=v-uView*(d-.5)*uStr;
  vec4 c=texture2D(uTex,uv);
  float e=.006;
  float dx=texture2D(uDepth,uv+vec2(e,0.)).r-texture2D(uDepth,uv-vec2(e,0.)).r;
  float dy=texture2D(uDepth,uv+vec2(0.,e)).r-texture2D(uDepth,uv-vec2(0.,e)).r;
  vec3 n=normalize(vec3(-dx*5.,-dy*5.,1.));
  vec3 l=normalize(vec3(-.35+uView.x*.7,.45+uView.y*.5,.8));
  c.rgb*=.9+.24*max(dot(n,l),0.);
  float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
  gl_FragColor=c*inside;
}`;

const cache = new Map();

function loadImage(src) {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => {
          cache.delete(src);
          reject(new Error(`No cargó ${src}`));
        };
        image.src = src;
      })
    );
  }
  return cache.get(src);
}

/** Descarga foto y profundidad de un vaso para que el cambio no espere. */
export const preloadCup = (cup) => Promise.all([loadImage(cup.src), loadImage(cup.depth)]);

function buildGL(canvas) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const textures = [gl.createTexture(), gl.createTexture()];
  const upload = (unit, image, premultiply) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "uDepth"), 1);
  const uView = gl.getUniformLocation(program, "uView");
  const uStr = gl.getUniformLocation(program, "uStr");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  return {
    setTextures(color, depth) {
      upload(0, color, true);
      upload(1, depth, false);
    },
    draw(x, y, strength) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uView, x, y);
      gl.uniform1f(uStr, strength);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

/**
 * Monta el vaso. `root` lleva dentro `.tilt > img` (y opcional `.cup-shadow`
 * vía `shadow`); `area` es el elemento que escucha el puntero.
 * Devuelve { swap(cup), setPaused(bool), destroy() }.
 */
export function mountCup({ root, tilt, img, shadow, area, cup, still = false, strength = 0.045, maxDpr = 2 }) {
  const state = { px: 0, py: 0, x: 0, y: 0, lastMove: -1e9, paused: false, raf: 0, dead: false, t0: performance.now(), drawnX: NaN, drawnY: NaN };
  let gl = null;
  let canvas = null;
  let observer = null;

  const onMove = (event) => {
    const rect = area.getBoundingClientRect();
    state.px = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    state.py = Math.max(-1, Math.min(1, -((event.clientY - rect.top) / rect.height - 0.5) * 2));
    state.lastMove = performance.now();
  };
  area.addEventListener("pointermove", onMove, { passive: true });

  const size = () => {
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  };

  const apply = () => {
    tilt.style.transform = `rotateY(${(state.x * 7).toFixed(2)}deg) rotateX(${(state.y * 5).toFixed(2)}deg)`;
    if (shadow) {
      shadow.style.transform = `translateX(${(-state.x * 7).toFixed(2)}%) scaleX(${(1 - Math.abs(state.x) * 0.06).toFixed(3)})`;
    }
    if (gl) gl.draw(state.x, state.y, strength);
  };

  const frame = (now) => {
    if (state.dead) return;
    state.raf = requestAnimationFrame(frame);
    if (state.paused) return;
    const t = (now - state.t0) / 1000;
    // El puntero manda mientras se mueve; al soltarlo vuelve el vaivén.
    const k = Math.max(0, 1 - (now - state.lastMove) / 2600);
    const swayX = still ? 0 : Math.sin(t * 0.7) * 0.62;
    const swayY = still ? 0 : Math.cos(t * 0.5) * 0.3;
    state.x += (state.px * k + swayX * (1 - k) - state.x) * 0.07;
    state.y += (state.py * k + swayY * (1 - k) - state.y) * 0.07;
    // Quieto (sin vaivén y sin dedo) no se repinta: cero trabajo de GPU.
    if (Math.abs(state.x - state.drawnX) < 0.0005 && Math.abs(state.y - state.drawnY) < 0.0005) return;
    state.drawnX = state.x;
    state.drawnY = state.y;
    apply();
  };

  const ready = preloadCup(cup)
    .then(([color, depth]) => {
      if (state.dead) return;
      const c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true");
      tilt.appendChild(c);
      canvas = c;
      size();
      try {
        gl = buildGL(c);
        gl?.setTextures(color, depth);
      } catch {
        gl = null;
      }
      if (!gl) {
        c.remove();
        canvas = null;
        return;
      }
      root.classList.add("is-3d");
      observer = new ResizeObserver(() => {
        size();
        apply();
      });
      state.drawnX = NaN;
      observer.observe(c);
      apply();
    })
    .catch(() => {});

  state.raf = requestAnimationFrame(frame);

  return {
    /** Cambia de vaso. Resuelve cuando el nuevo ya está pintado. */
    swap(next) {
      return Promise.all([ready, preloadCup(next)]).then(([, [color, depth]]) => {
        if (state.dead) return;
        img.src = next.src;
        if (gl) {
          try {
            gl.setTextures(color, depth);
          } catch {
            gl = null;
            canvas?.remove();
            canvas = null;
            root.classList.remove("is-3d");
          }
        }
        apply();
      });
    },
    setPaused(value) {
      state.paused = value;
    },
    destroy() {
      state.dead = true;
      cancelAnimationFrame(state.raf);
      area.removeEventListener("pointermove", onMove);
      observer?.disconnect();
      // Sin loseContext(): si React vuelve a montar sobre el mismo canvas,
      // getContext devolvería el contexto perdido. El canvas se va con el DOM.
      canvas?.remove();
    },
  };
}
