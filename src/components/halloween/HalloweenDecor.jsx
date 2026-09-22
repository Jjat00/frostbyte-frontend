import React from "react";
import { createPortal } from "react-dom";

/**
 * Adornos de Halloween a lo largo de la carta (compartidos por todas las
 * variantes del hero).
 *
 * Cada sección recibe su escena en una capa propia (`.hw-decor`) que se
 * monta DENTRO de la sección con un portal: queda recortada por el
 * overflow de fb-section y debajo del contenido (que va en un contenedor
 * z-10), sin tocar el JSX de ninguna sección. Los lados se alternan para que
 * la carta no quede cargada a la derecha.
 *
 * Tres tipos de movimiento, todos solo transform/opacity (ver halloween.css):
 * - scroll (`hw-drift`, `hw-peek-*`, `hw-rise`): parallax y piezas que se
 *   asoman ligadas al scroll, con animation-timeline: view(); corren en el
 *   compositor y donde no hay soporte la pieza queda quieta.
 * - bucle (`hw-loop`): la araña que baja, el murciélago que se mece, la
 *   niebla que se arrastra... Solo corren con la sección en pantalla
 *   (clase `hw-live`).
 * - nada, con movimiento reducido.
 *
 * Las imágenes son `loading="lazy"`: se piden al acercarse la sección.
 */

const IMG = "/images/halloween";

const Img = ({ name, w, h, className = "" }) => (
  <img
    className={className}
    src={`${IMG}/${name}.webp`}
    width={w}
    height={h}
    alt=""
    loading="lazy"
    decoding="async"
  />
);

const Fog = ({ className = "" }) => (
  <span className={`hw-p hw-p--fog ${className}`}>
    <Img name="niebla" w={720} h={240} className="hw-loop" />
  </span>
);

// Escena por id de sección. El orden sigue el de la carta: izquierda y
// derecha se alternan.
const DECOR = {
  menu: (
    <span className="hw-p hw-p--flock">
      <Img name="murcielagos" w={280} h={306} className="hw-loop" />
    </span>
  ),
  carta: (
    <>
      <span className="hw-p hw-p--web">
        <Img name="telarana" w={440} h={451} />
      </span>
      <span className="hw-p hw-p--spider hw-loop">
        <i className="hw-thread" />
        <Img name="arana" w={280} h={233} />
      </span>
    </>
  ),
  granizados: (
    <span className="hw-p hw-p--moon hw-drift">
      <i className="hw-glow hw-loop" />
      <Img name="luna" w={280} h={280} />
    </span>
  ),
  frappes: (
    <span className="hw-p hw-p--ghost hw-drift">
      <Img name="fantasma-hielo" w={280} h={336} className="hw-loop" />
    </span>
  ),
  micheladas: (
    <span className="hw-p hw-p--jack hw-rise">
      <i className="hw-glow hw-loop" />
      <Img name="calabaza" w={280} h={286} />
    </span>
  ),
  sodas: (
    <span className="hw-p hw-p--bat">
      <Img name="murcielago" w={240} h={360} className="hw-loop" />
    </span>
  ),
  cervezas: (
    <>
      <span className="hw-p hw-p--mansion hw-drift">
        <Img name="mansion" w={280} h={297} />
      </span>
      <Fog className="hw-p--fog-right" />
    </>
  ),
  cuates: (
    <>
      <span className="hw-p hw-p--tombs hw-rise">
        <Img name="lapidas" w={320} h={266} />
      </span>
      <Fog className="hw-p--fog-left" />
    </>
  ),
  mocktails: (
    <span className="hw-p hw-p--branches">
      <Img name="ramas" w={280} h={336} className="hw-loop" />
    </span>
  ),
  vinos: (
    <span className="hw-p hw-p--castle hw-drift">
      <Img name="castillo" w={280} h={331} />
    </span>
  ),
  shots: (
    <span className="hw-p hw-p--crimson hw-peek-r">
      <Img name="mascara-carmesi" w={260} h={390} />
    </span>
  ),
  luladas: (
    <span className="hw-p hw-p--tree hw-drift">
      <Img name="arbol" w={260} h={390} className="hw-loop" />
    </span>
  ),
  desguayabator: (
    <span className="hw-p hw-p--clown hw-rise">
      <Img name="payaso" w={280} h={334} />
    </span>
  ),
  agua: (
    <>
      <Fog className="hw-p--fog-wide" />
      <Fog className="hw-p--fog-wide hw-p--fog-back" />
    </>
  ),
  "que-te-provoca": (
    <span className="hw-p hw-p--chrome hw-peek-l">
      <Img name="mascara-cromo" w={280} h={328} />
    </span>
  ),
  "sala-vip": (
    <span className="hw-p hw-p--creature hw-drift">
      <Img name="criatura" w={280} h={315} className="hw-loop" />
    </span>
  ),
  "solicitar-cancion": (
    <span className="hw-p hw-p--pale-bats hw-drift">
      <Img name="murcielagos-palidos" w={280} h={316} className="hw-loop" />
    </span>
  ),
  "frostbyte-play": (
    <span className="hw-p hw-p--slasher hw-peek-r">
      <Img name="enmascarado" w={260} h={390} />
    </span>
  ),
  features: (
    <>
      <span className="hw-p hw-p--village hw-rise">
        <Img name="pueblo" w={480} h={320} />
      </span>
      <Fog className="hw-p--fog-wide" />
    </>
  ),
};

const IDS = Object.keys(DECOR);

export default function HalloweenDecor() {
  const [targets, setTargets] = React.useState({});

  // Busca las secciones; MenuSections pinta las suyas cuando llegan las
  // categorías, así que se vuelve a mirar cuando cambia el <main>.
  React.useEffect(() => {
    const main = document.querySelector(".hw-menu-body");
    if (!main) return undefined;

    const scan = () =>
      setTargets((prev) => {
        const next = {};
        let changed = false;
        for (const id of IDS) {
          const el = document.getElementById(id);
          if (el && main.contains(el)) next[id] = el;
          if (next[id] !== prev[id]) changed = true;
        }
        return changed ? next : prev;
      });
    scan();

    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
    };
  }, []);

  // Los bucles solo corren con la sección en pantalla.
  React.useEffect(() => {
    const sections = Object.values(targets);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("hw-live", entry.isIntersecting));
    });
    sections.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      sections.forEach((el) => el.classList.remove("hw-live"));
    };
  }, [targets]);

  return Object.entries(targets).map(([id, el]) =>
    createPortal(
      <div className={`hw-decor hw-decor--${id}`} aria-hidden="true">
        {DECOR[id]}
      </div>,
      el,
      id
    )
  );
}
