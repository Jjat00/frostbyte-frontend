import React, { useEffect, useMemo, useState, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";

const STAGE_W = 1920;
const STAGE_H = 1080;
const SLIDE_DURATION = 8000;

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "—";
  const n = Number(price);
  if (!Number.isFinite(n)) return String(price);
  return n.toLocaleString("es-CO");
};

const accents = [
  { c2: "#ff00d4", tint: "#0a0b14", glow: "rgba(255,0,212,.45)" },
  { c2: "#7a2bff", tint: "#0a0420", glow: "rgba(122,43,255,.45)" },
  { c2: "#ff3355", tint: "#1a0210", glow: "rgba(255,51,85,.45)" },
  { c2: "#6fbf4a", tint: "#0a1808", glow: "rgba(111,191,74,.45)" },
  { c2: "#00e0ff", tint: "#04101a", glow: "rgba(0,224,255,.45)" },
  { c2: "#ff9500", tint: "#1a0a00", glow: "rgba(255,149,0,.45)" },
];

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Instrument+Serif:ital@0;1&family=Archivo+Black&display=swap";

const STYLE_ID = "frostbyte-tv-style";
const FONT_LINK_ID = "frostbyte-tv-fonts";

const Chrome = ({ label, liveLabel = "EN VIVO", liveColor }) => (
  <div className="ft-chrome">
    <div className="ft-brand">
      <span className="ft-brand-mark" />
      FROSTBYTE
    </div>
    <div className="ft-chrome-center">{label}</div>
    <div className="ft-live" style={liveColor ? { color: liveColor } : undefined}>
      {liveLabel}
    </div>
  </div>
);

const Footer = ({ left, center, right }) => (
  <div className="ft-footer">
    <span>{left}</span>
    <span>{center}</span>
    <span>{right}</span>
  </div>
);

const BinaryRain = () => {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";
    const cols = 48;
    const chars = "01 01 01 10 10 11 00 FF 7A 2B 00 F0 FF 2D A8";
    for (let i = 0; i < cols; i++) {
      const c = document.createElement("div");
      c.className = "ft-rain-col";
      c.style.left = (i / cols) * 100 + "%";
      c.style.animationDuration = 8 + Math.random() * 12 + "s";
      c.style.animationDelay = -Math.random() * 10 + "s";
      c.style.opacity = 0.4 + Math.random() * 0.6;
      let s = "";
      for (let j = 0; j < 60; j++) {
        s += chars[Math.floor(Math.random() * chars.length)] + "\n";
      }
      c.textContent = s;
      host.appendChild(c);
    }
  }, []);
  return <div ref={hostRef} className="ft-binary" aria-hidden="true" />;
};

const IntroSlide = ({ issueNumber }) => (
  <section className="ft-slide ft-s-intro">
    <BinaryRain />
    <Chrome
      label={`N° ${String(issueNumber).padStart(3, "0")} · VOL.01`}
      liveLabel="EN VIVO"
    />
    <div className="ft-intro-stack">
      <div className="ft-kicker">Granizados · Frappés · Cócteles helados</div>
      <h1 className="ft-intro-title">FROSTBYTE</h1>
      <div className="ft-intro-tagline">
        Servido a <em>−4°C</em>, pensado a temperatura de boutique.
      </div>
      <div className="ft-intro-sub">
        <span>CUMBAL</span>
        <span className="ft-dot" />
        <span>NARIÑO</span>
        <span className="ft-dot" />
        <span>COLOMBIA</span>
      </div>
    </div>
    <Footer
      left="© MMXXVI · FROSTBYTE"
      center={
        <>
          <b>PEQUEÑO</b> $10.000 · <b>GRANDE</b> $12.000
        </>
      }
      right="@FROSTBYTE.COL"
    />
  </section>
);

const ProductSlide = ({ product, index, total, accent }) => {
  const variants = product.variants || [];
  const recommended =
    variants.find((v) => v.is_default) || variants[variants.length - 1] || null;
  const smaller = variants.find((v) => v !== recommended) || null;
  const categoryLabel = product.category_name
    ? `${product.category_name}`
    : "Producto premium";
  const nameUpper = String(product.name || "").toUpperCase();
  const longestWord = nameUpper.split(/\s+/).reduce(
    (max, w) => (w.length > max ? w.length : max),
    0
  );
  // Escala el tamaño del título según la longitud del nombre y de la palabra más larga
  // para que nombres largos no se encimen con la descripción de abajo.
  const titleFontSize =
    nameUpper.length <= 9 && longestWord <= 9
      ? 140
      : nameUpper.length <= 14 && longestWord <= 12
      ? 112
      : nameUpper.length <= 22 && longestWord <= 14
      ? 88
      : 72;
  const bgStyle = {
    background: `radial-gradient(ellipse at 80% 50%, ${accent.glow}, transparent 55%), ${accent.tint}`,
    "--ft-c2": accent.c2,
  };

  return (
    <section className="ft-slide ft-s-product" style={bgStyle}>
      <Chrome
        label={`DROP ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")} · ${String(
          product.name || ""
        ).toUpperCase()}`}
      />

      <div className="ft-prod-left">
        <div className="ft-prod-num">
          Drop N° {String(index + 1).padStart(2, "0")} · {categoryLabel}
        </div>
        <h2
          className="ft-prod-title"
          style={{ fontSize: `${titleFontSize}px` }}
        >
          {nameUpper}
        </h2>
        {product.description ? (
          <div className="ft-prod-tag">{product.description}</div>
        ) : null}

        {variants.length > 0 && (
          <div className="ft-prod-prices">
            {smaller && (
              <div className="ft-price">
                <span className="ft-price-size">{smaller.name}</span>
                <span className="ft-price-v">
                  ${formatPrice(smaller.price).split(",")[0]}
                </span>
                {smaller.sku ? (
                  <span className="ft-price-oz">{smaller.sku}</span>
                ) : null}
              </div>
            )}
            {recommended && (
              <div className="ft-price ft-price-featured">
                <span className="ft-price-size">{recommended.name}</span>
                <span className="ft-price-v">
                  ${formatPrice(recommended.price).split(",")[0]}
                </span>
                <span className="ft-price-oz">Recomendado</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ft-prod-right">
        <div className="ft-scan" />
        <div className="ft-glow-ring" />
        {product.image_url ? (
          <img loading="lazy" decoding="async" src={product.image_url} alt={product.name} className="ft-prod-img" />
        ) : (
          <div className="ft-prod-placeholder">
            <span>{String(product.name || "").slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <div className="ft-edge-label">
          VOL.{String(index + 1).padStart(2, "0")} · {categoryLabel.toUpperCase()}
        </div>
      </div>

      <Footer
        left={
          <>
            <b>CATEGORÍA</b> · {categoryLabel.toUpperCase()}
          </>
        }
        center="EL EXCESO DE ALCOHOL ES PERJUDICIAL PARA LA SALUD · LEY 30"
        right={`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
      />
    </section>
  );
};

const InfoSlide = () => (
  <section className="ft-slide ft-s-info">
    <Chrome label="VISÍTANOS" liveLabel="ABIERTO AHORA" />
    <div className="ft-info-panel">
      <div className="ft-info-label">Horario</div>
      <div className="ft-info-clock">
        12<span className="ft-info-sep">:</span>00
        <br />
        23<span className="ft-info-sep">:</span>00
      </div>
      <div className="ft-info-days">
        <span className="on">Lun</span>
        <span className="on">Mar</span>
        <span className="on">Mié</span>
        <span className="on">Jue</span>
        <span className="on">Vie</span>
        <span className="on">Sáb</span>
        <span className="on">Dom</span>
      </div>
      <div className="ft-info-big">
        Granizados frescos <em>todos los días</em> de la semana.
      </div>
    </div>
    <div className="ft-info-panel ft-info-panel-r">
      <div className="ft-info-label">Ubicación</div>
      <h2 className="ft-info-h2">
        CUMBAL
        <br />
        <span className="ft-info-accent">NARIÑO</span>
      </h2>
      <dl className="ft-info-coords">
        <dt>Ciudad</dt>
        <dd>Cumbal, Nariño — Colombia</dd>
        <dt>Coord.</dt>
        <dd>0.905°N · 77.792°W</dd>
        <dt>Altitud</dt>
        <dd>3.050 m · Frío natural</dd>
        <dt>Estado</dt>
        <dd className="ft-info-open">● Abierto hasta las 23:00</dd>
      </dl>
    </div>
    <Footer
      left="© MMXXVI FROSTBYTE"
      center={
        <>
          <b>PEQUEÑO</b> $10.000 · <b>GRANDE</b> $12.000
        </>
      }
      right="@FROSTBYTE.COL"
    />
  </section>
);

const SocialSlide = () => (
  <section className="ft-slide ft-s-social">
    <Chrome label="SÍGUENOS" liveLabel="COMUNIDAD" />
    <div className="ft-social-wrap">
      <div className="ft-social-kicker">Síguenos en redes</div>
      <h2 className="ft-social-h2">
        @<span className="ft-hollow">FROSTBYTE</span>.COL
      </h2>
      <div className="ft-social-handles">
        <div className="ft-handle ft-handle-ig">
          <div className="ft-handle-ic">IG</div>
          <span>Instagram</span>
          <b>@frostbyte.col</b>
        </div>
        <div className="ft-handle ft-handle-tt">
          <div className="ft-handle-ic">TT</div>
          <span>TikTok</span>
          <b>@frostbyte.col</b>
        </div>
      </div>
      <div className="ft-social-note">
        Etiquétanos en tu granizado y <em>sal en nuestras historias.</em>
      </div>
    </div>
    <Footer
      left="© MMXXVI FROSTBYTE"
      center={
        <>
          <b>CUMBAL</b> · NARIÑO · COLOMBIA
        </>
      }
      right="12:00 → 23:00"
    />
  </section>
);

function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const sx = window.innerWidth / STAGE_W;
      const sy = window.innerHeight / STAGE_H;
      setScale(Math.min(sx, sy));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

const FrostbyteTVPage = () => {
  const { data, isLoading } = useProducts(
    { active_only: true },
    { refetchInterval: 5 * 60 * 1000 }
  );
  const products = useMemo(() => data?.results || [], [data]);

  // Inject Google Fonts y la hoja de estilos del slideshow
  useEffect(() => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_HREF;
      document.head.appendChild(link);
    }
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = FROSTBYTE_TV_CSS;
      document.head.appendChild(style);
    }
    const prevBg = document.body.style.background;
    const prevOverflow = document.body.style.overflow;
    document.body.style.background = "#000";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.background = prevBg;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const slides = useMemo(() => {
    const productSlides = products.map((p, i) => ({
      key: `p-${p.id}`,
      render: (idx, total) => (
        <ProductSlide
          product={p}
          index={idx}
          total={total}
          accent={accents[i % accents.length]}
        />
      ),
    }));
    const base = [
      { key: "intro", render: () => <IntroSlide issueNumber={products.length || 1} /> },
      ...productSlides,
      { key: "info", render: () => <InfoSlide /> },
      { key: "social", render: () => <SocialSlide /> },
    ];
    return base;
  }, [products]);

  const [index, setIndex] = useState(0);

  // Reinicia el índice si cambia la cantidad de slides (p.ej. llega data)
  useEffect(() => {
    setIndex((i) => (i >= slides.length ? 0 : i));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      SLIDE_DURATION
    );
    return () => clearTimeout(id);
  }, [index, slides.length]);

  const scale = useStageScale();
  const scaledW = STAGE_W * scale;
  const scaledH = STAGE_H * scale;

  const productCount = products.length;

  return (
    <div className="ft-root">
      <div
        className="ft-stage-wrap"
        style={{
          width: scaledW,
          height: scaledH,
        }}
      >
        <div
          className="ft-stage"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
          }}
        >
          {slides.map((slide, i) => {
            let productIdx = 0;
            let total = Math.max(productCount, 1);
            if (slide.key.startsWith("p-")) {
              productIdx = slides
                .filter((s) => s.key.startsWith("p-"))
                .findIndex((s) => s.key === slide.key);
            }
            return (
              <div
                key={slide.key}
                className={`ft-slide-holder ${i === index ? "is-active" : ""}`}
                aria-hidden={i !== index}
              >
                {slide.render(productIdx, total)}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="ft-loading">
          <div className="ft-loading-spinner" />
          <div className="ft-loading-text">Cargando catálogo...</div>
        </div>
      ) : null}
    </div>
  );
};

export default FrostbyteTVPage;

const FROSTBYTE_TV_CSS = `
.ft-root{position:fixed;inset:0;background:#000;color:#e8f6ff;font-family:'Orbitron',sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ft-stage-wrap{position:relative}
.ft-stage{position:relative;transform-origin:top left;background:#0a0b14}

.ft-slide-holder{position:absolute;inset:0;opacity:0;transition:opacity 900ms ease, transform 1200ms cubic-bezier(.22,.61,.36,1);transform:scale(1.015);pointer-events:none;will-change:opacity,transform}
.ft-slide-holder.is-active{opacity:1;transform:scale(1);pointer-events:auto}

.ft-slide{position:absolute;inset:0;background:#0a0b14;color:#e8f6ff;overflow:hidden}

.ft-chrome{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:40px 64px;z-index:5;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.22em;text-transform:uppercase;color:#8a8d9c;border-bottom:1px solid rgba(232,246,255,.12)}
.ft-brand{display:flex;align-items:center;gap:16px;color:#e8f6ff;font-weight:700;letter-spacing:.3em;font-size:20px}
.ft-brand-mark{width:26px;height:26px;position:relative;display:inline-block}
.ft-brand-mark::before{content:"";position:absolute;inset:0;border:2px solid #e8f6ff;transform:rotate(45deg)}
.ft-brand-mark::after{content:"";position:absolute;width:10px;height:10px;background:#ff00d4;left:50%;top:50%;transform:translate(-50%,-50%) rotate(45deg)}
.ft-chrome-center{text-align:center;flex:1}
.ft-live{display:flex;align-items:center;gap:12px;color:#00e0ff}
.ft-live::before{content:"";width:10px;height:10px;border-radius:50%;background:currentColor;animation:ft-pulse 1.6s ease-in-out infinite}
@keyframes ft-pulse{50%{opacity:.3}}

.ft-footer{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;padding:32px 64px;z-index:5;font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.24em;text-transform:uppercase;color:#8a8d9c;border-top:1px solid rgba(232,246,255,.12)}
.ft-footer b{color:#e8f6ff;font-weight:500}

/* ---- INTRO ---- */
.ft-s-intro{background:radial-gradient(ellipse at 30% 40%, rgba(122,43,255,.4), transparent 55%),radial-gradient(ellipse at 75% 70%, rgba(0,224,255,.28), transparent 50%),#0a0b14}
.ft-binary{position:absolute;inset:0;pointer-events:none;z-index:1;font-family:'JetBrains Mono',monospace;font-size:16px;line-height:1.3;color:#00e0ff;opacity:.18;overflow:hidden;mask-image:radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)}
.ft-rain-col{position:absolute;top:-50%;white-space:pre;animation:ft-rain linear infinite;writing-mode:vertical-rl;text-orientation:upright}
@keyframes ft-rain{from{transform:translateY(0)}to{transform:translateY(50%)}}
.ft-intro-stack{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;text-align:center;padding:0 64px}
.ft-kicker{font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.4em;text-transform:uppercase;color:#ff00d4}
.ft-intro-title{margin:0;font-family:'Archivo Black','Orbitron',sans-serif;font-size:280px;line-height:.82;letter-spacing:-.05em;color:#e8f6ff;animation:ft-glow 4s ease-in-out infinite;white-space:nowrap}
@keyframes ft-glow{0%,100%{text-shadow:0 0 40px rgba(255,45,168,.2)}50%{text-shadow:0 0 80px rgba(0,240,255,.35)}}
.ft-intro-tagline{font-family:'Orbitron',sans-serif;font-weight:400;font-size:44px;color:#e8f6ff;max-width:26ch;line-height:1.2;letter-spacing:.01em}
.ft-intro-tagline em{font-style:normal;color:#00e0ff;font-weight:600}
.ft-intro-sub{margin-top:18px;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.3em;text-transform:uppercase;color:#8a8d9c;display:flex;gap:28px;align-items:center}
.ft-dot{width:6px;height:6px;border-radius:50%;background:#00e0ff;display:inline-block}

/* ---- PRODUCT ---- */
.ft-s-product{display:grid;grid-template-columns:1.05fr 1fr;width:100%;height:100%;--ft-c2:#ff00d4}
.ft-prod-left{position:relative;display:flex;flex-direction:column;justify-content:center;padding:140px 60px 180px 72px;gap:26px}
.ft-prod-num{font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.32em;text-transform:uppercase;color:var(--ft-c2);display:flex;align-items:center;gap:16px}
.ft-prod-num::before{content:"";width:48px;height:1px;background:var(--ft-c2)}
.ft-prod-title{margin:0;font-family:'Archivo Black','Orbitron',sans-serif;font-size:140px;line-height:.92;letter-spacing:-.045em;color:#e8f6ff;text-wrap:balance;max-width:14ch;overflow-wrap:break-word;word-break:break-word;hyphens:auto}
.ft-prod-tag{font-family:'Instrument Serif',serif;font-style:italic;font-size:32px;line-height:1.2;color:#8a8d9c;max-width:24ch}

.ft-prod-prices{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:640px}
.ft-price{position:relative;overflow:hidden;padding:22px 26px;border:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;gap:6px;background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 8px 32px rgba(0,0,0,.3)}
.ft-price::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg, rgba(255,255,255,.06), transparent 40%);border-radius:inherit}
.ft-price-featured{background:linear-gradient(135deg, color-mix(in oklab,var(--ft-c2) 90%,white 10%), var(--ft-c2));border-color:color-mix(in oklab,var(--ft-c2) 60%,white 10%);color:#0a0b14;box-shadow:inset 0 1px 0 rgba(255,255,255,.25), 0 8px 32px color-mix(in oklab,var(--ft-c2) 40%,transparent)}
.ft-price-size{font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:.3em;text-transform:uppercase;opacity:.7}
.ft-price-oz{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.22em;text-transform:uppercase;opacity:.55}
.ft-price-v{font-family:'Archivo Black','Orbitron',sans-serif;font-size:52px;line-height:.95;letter-spacing:-.02em}
.ft-price-featured .ft-price-v{color:#0a0b14}

.ft-prod-right{position:relative;display:flex;align-items:center;justify-content:center;padding:0 48px;overflow:hidden}
.ft-glow-ring{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle, color-mix(in oklab,var(--ft-c2) 30%,transparent), transparent 60%);filter:blur(40px);animation:ft-halo 8s ease-in-out infinite}
@keyframes ft-halo{50%{transform:scale(1.08)}}
.ft-prod-img{position:relative;z-index:2;max-width:100%;max-height:86%;width:auto;height:auto;object-fit:contain;animation:ft-bob 6s ease-in-out infinite;filter:drop-shadow(0 40px 80px rgba(0,0,0,.5))}
@keyframes ft-bob{50%{transform:translateY(-14px)}}
.ft-prod-placeholder{position:relative;z-index:2;width:520px;height:520px;border-radius:50%;background:linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);animation:ft-bob 6s ease-in-out infinite}
.ft-prod-placeholder span{font-family:'Archivo Black','Orbitron',sans-serif;font-size:260px;line-height:1;color:rgba(255,255,255,.35)}
.ft-edge-label{position:absolute;right:40px;top:50%;writing-mode:vertical-rl;font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:.4em;text-transform:uppercase;color:#8a8d9c;transform:translateY(-50%)}
.ft-scan{position:absolute;inset:0;pointer-events:none;z-index:1;background:linear-gradient(90deg,rgba(232,246,255,.12) 1px,transparent 1px),linear-gradient(rgba(232,246,255,.12) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%);opacity:.5}

/* ---- INFO ---- */
.ft-s-info{display:grid;grid-template-columns:1fr 1fr;width:100%;height:100%;background:#0a0b14;position:relative}
.ft-s-info::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at 20% 30%, rgba(122,43,255,.35), transparent 55%),radial-gradient(ellipse at 85% 70%, rgba(0,224,255,.22), transparent 50%)}
.ft-info-panel{position:relative;z-index:2;padding:160px 80px 150px;display:flex;flex-direction:column;justify-content:center;gap:30px}
.ft-info-panel-r{border-left:1px solid rgba(232,246,255,.12)}
.ft-info-label{font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.38em;text-transform:uppercase;color:#ff00d4;display:flex;align-items:center;gap:18px}
.ft-info-label::before{content:"";width:60px;height:1px;background:#ff00d4}
.ft-info-h2{margin:0;font-family:'Archivo Black','Orbitron',sans-serif;font-size:130px;line-height:.85;letter-spacing:-.04em;color:#e8f6ff}
.ft-info-accent{color:#00e0ff}
.ft-info-clock{font-family:'Archivo Black','Orbitron',sans-serif;font-size:220px;line-height:.85;letter-spacing:-.05em;color:#e8f6ff;font-variant-numeric:tabular-nums}
.ft-info-sep{color:#ff00d4}
.ft-info-days{display:flex;flex-wrap:wrap;gap:10px;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.22em;text-transform:uppercase;color:#8a8d9c;margin-top:10px}
.ft-info-days span{border:1px solid rgba(255,255,255,.1);padding:12px 18px;border-radius:999px;background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.ft-info-days span.on{background:#e8f6ff;color:#0a0b14;border-color:#e8f6ff}
.ft-info-big{font-family:'Instrument Serif',serif;font-style:italic;font-size:38px;line-height:1.2;color:#8a8d9c;max-width:24ch}
.ft-info-big em{font-style:normal;color:#e8f6ff;font-family:'Orbitron',sans-serif;font-weight:500}
.ft-info-coords{font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.2em;text-transform:uppercase;color:#8a8d9c;display:grid;grid-template-columns:auto 1fr;gap:12px 24px;border-top:1px solid rgba(232,246,255,.12);padding-top:22px;margin-top:8px}
.ft-info-coords dt{color:#e8f6ff;font-weight:500}
.ft-info-coords dd{margin:0}
.ft-info-open{color:#00e0ff !important}

/* ---- SOCIAL ---- */
.ft-s-social{background:radial-gradient(ellipse at 50% 50%, rgba(122,43,255,.4), transparent 60%),#0a0b14;position:relative}
.ft-s-social::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background-image:linear-gradient(rgba(232,246,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(232,246,255,.12) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)}
.ft-social-wrap{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 80px;gap:30px;text-align:center}
.ft-social-kicker{font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.4em;text-transform:uppercase;color:#00e0ff}
.ft-social-h2{margin:0;font-family:'Archivo Black','Orbitron',sans-serif;font-size:200px;line-height:.82;letter-spacing:-.045em;color:#e8f6ff;text-wrap:balance}
.ft-hollow{-webkit-text-stroke:2px #e8f6ff;color:transparent}
.ft-social-handles{display:flex;gap:36px;margin-top:24px}
.ft-handle{display:flex;align-items:center;gap:22px;border:1px solid rgba(255,255,255,.1);padding:24px 38px;border-radius:999px;background:linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);font-family:'Orbitron',sans-serif;font-weight:600;font-size:42px;letter-spacing:-.01em;color:#e8f6ff;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.ft-handle-ic{width:52px;height:52px;border-radius:50%;background:#ff00d4;color:#0a0b14;display:flex;align-items:center;justify-content:center;font-family:'Archivo Black','Orbitron',sans-serif;font-size:22px;letter-spacing:0}
.ft-handle-ig .ft-handle-ic{background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af)}
.ft-handle-tt .ft-handle-ic{background:#000;border:1px solid #e8f6ff;color:#e8f6ff}
.ft-handle b{color:#e8f6ff;font-weight:700}
.ft-handle span{color:#8a8d9c;margin-right:6px;font-weight:400}
.ft-social-note{font-family:'Instrument Serif',serif;font-style:italic;font-size:40px;color:#8a8d9c;max-width:24ch;margin-top:30px}
.ft-social-note em{font-style:normal;color:#ff00d4;font-family:'Orbitron',sans-serif;font-weight:500}

/* ---- LOADING ---- */
.ft-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:10;pointer-events:none;background:rgba(10,11,20,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ft-loading-spinner{width:64px;height:64px;border:3px solid rgba(255,0,212,.2);border-top-color:#ff00d4;border-radius:50%;animation:ft-spin 1s linear infinite}
@keyframes ft-spin{to{transform:rotate(360deg)}}
.ft-loading-text{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.3em;text-transform:uppercase;color:#e8f6ff}
`;
