/**
 * Fondo "granizado derretido" del hero Líquido: ruido fractal deformado
 * (domain warping) en un shader, pintado con los tres tonos del sabor que
 * está en el vaso. El puntero lo arrastra como una gota; sin puntero, la
 * gota se pasea sola. Viene de la opción 15 de `public/navidad-lab/`.
 *
 * Rendimiento (la home ya fundía GPUs de gama baja):
 * - Se pinta a media resolución: es un fondo suave y nadie lo nota.
 * - Vigila el tiempo por fotograma: si va lento baja a un tercio, y si
 *   sigue lento se queda en una imagen fija.
 * - El componente lo pausa fuera de pantalla y con la pestaña oculta.
 * - Con movimiento reducido pinta un solo fotograma.
 */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5*uRes)/uRes.y;
  vec2 dv=p-m;float d2=dot(dv,dv);
  float pull=exp(-d2*5.);
  p-=dv*pull*.32;
  float t=uTime*.06;
  vec2 q=vec2(fbm(p*1.5+vec2(t,-t*.6)),fbm(p*1.5+vec2(5.2,1.3)-t));
  float n=fbm(p*1.7+q*1.9+vec2(t*.5,t*.3));
  n=(n-.5)*2.3+.5+pull*.2;
  vec3 col=mix(uA,uB,smoothstep(.12,.58,n));
  col=mix(col,uC,smoothstep(.62,1.02,n));
  float vein=1.-smoothstep(0.,.045,abs(fract(n*2.5)-.5));
  col=mix(col,uC,vein*.28);
  float ice=noise(gl_FragCoord.xy*.42+vec2(0.,uTime*.4));
  col+=(ice-.5)*.04;
  gl_FragColor=vec4(col,1.);
}`;

const toRGB = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/**
 * Monta el fondo en `canvas`. `area` recibe el puntero. `palette`: tres
 * colores hex (oscuro, medio, claro). Devuelve null si no hay WebGL.
 */
export function mountLiquid({ canvas, area, palette, still = false, scale: startScale = 0.5 }) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  let program;
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch {
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(program, name);
  const uniforms = { res: u("uRes"), time: u("uTime"), mouse: u("uMouse"), a: u("uA"), b: u("uB"), c: u("uC") };

  const current = palette.map(toRGB);
  let target = current.map((color) => [...color]);
  let scale = startScale;
  const pointer = { x: 0, y: 0, last: -1e9, inside: false };
  const mouse = { x: 0, y: 0, ready: false };
  const state = { paused: false, dead: false, raf: 0, frozen: still, t0: performance.now(), prev: 0, samples: [] };

  const resize = () => {
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * scale));
  };
  resize();
  const observer = new ResizeObserver(() => {
    resize();
    if (state.frozen || state.paused) draw(performance.now());
  });
  observer.observe(canvas);

  const onMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.last = performance.now();
    pointer.inside = true;
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  area.addEventListener("pointermove", onMove, { passive: true });
  area.addEventListener("pointerleave", onLeave);

  function draw(now, dt = 0) {
    const t = (now - state.t0) / 1000;
    const W = canvas.width;
    const H = canvas.height;
    const active = pointer.inside && now - pointer.last < 2400;
    const goal = active
      ? { x: pointer.x * scale, y: H - pointer.y * scale }
      : { x: W / 2 + Math.cos(t * 0.5) * W * 0.22, y: H * 0.6 + Math.sin(t * 0.7) * H * 0.14 };
    if (!mouse.ready) {
      mouse.x = goal.x;
      mouse.y = goal.y;
      mouse.ready = true;
    }
    mouse.x += (goal.x - mouse.x) * 0.08;
    mouse.y += (goal.y - mouse.y) * 0.08;
    const k = dt ? Math.min(1, dt * 2.6) : 1;
    current.forEach((color, i) => color.forEach((value, j) => { color[j] = value + (target[i][j] - value) * k; }));
    gl.viewport(0, 0, W, H);
    gl.uniform2f(uniforms.res, W, H);
    gl.uniform1f(uniforms.time, (t + 18) % 3600);
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
    gl.uniform3fv(uniforms.a, current[0]);
    gl.uniform3fv(uniforms.b, current[1]);
    gl.uniform3fv(uniforms.c, current[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Degradar solo: con 60 fotogramas medidos, si la media pasa de 28 ms se
  // baja la resolución; si aun así pasa, el fondo se queda quieto.
  const watch = (frameMs) => {
    state.samples.push(frameMs);
    if (state.samples.length < 60) return;
    const mean = state.samples.reduce((sum, value) => sum + value, 0) / state.samples.length;
    state.samples = [];
    if (mean <= 28) return;
    if (scale > 0.34) {
      scale = 0.33;
      resize();
    } else {
      state.frozen = true;
    }
  };

  const frame = (now) => {
    if (state.dead) return;
    state.raf = requestAnimationFrame(frame);
    const dt = state.prev ? Math.min(0.05, (now - state.prev) / 1000) : 0.016;
    const frameMs = state.prev ? now - state.prev : 16;
    state.prev = now;
    if (state.paused || state.frozen) return;
    draw(now, dt);
    watch(frameMs);
  };

  draw(performance.now());
  if (!still) state.raf = requestAnimationFrame(frame);

  return {
    setPalette(next) {
      target = next.map(toRGB);
      if (state.frozen || state.paused) {
        current.forEach((color, i) => color.splice(0, 3, ...target[i]));
        draw(performance.now());
      }
    },
    setPaused(value) {
      state.paused = value;
      state.prev = 0;
    },
    destroy() {
      state.dead = true;
      cancelAnimationFrame(state.raf);
      observer.disconnect();
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    },
  };
}
