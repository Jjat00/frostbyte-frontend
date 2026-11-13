import React from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useActiveCategories, useProductsByCategory } from "@/hooks";
import { activeVariants } from "@/lib/variants";
import { GRANIZADO_EXTRAS } from "@/components/Granizados";
import { MICHELADA_EXTRAS } from "@/components/Micheladas";
import { NAVIDAD_MENU_IMAGES } from "@/components/navidad/menuImages";
import "./navidad-menu.css";

/**
 * La carta en Navidad: una sola carta con fotos, en lugar de la lista de
 * precios (CartaList) + las secciones de detalle (MenuSections, Desguayabator,
 * WaterSection), que con la campaña encendida no se pintan.
 *
 * - Una barra de categorías fija arriba: toca y baja a esa categoría; al
 *   bajar, se marca sola la que estás viendo. Al final, lo que no es carta
 *   (pedir canción, opinión, descuentos...).
 * - Cada producto es una tarjeta con su foto navideña sobre fondo plano
 *   (rojo, verde pino o crema), el nombre y el precio. Si tiene tamaños, los
 *   precios van en fila. Tocarla abre la ficha con la descripción.
 * - Las categorías y productos son los activos de la API, en el mismo orden
 *   de la carta habitual (Frostbyte Food primero). Un producto sin foto
 *   navideña usa su foto de siempre sobre el mismo fondo plano.
 * - Las anclas de siempre (#carta, #granizados, #frappes...) siguen
 *   existiendo, así que el hero, el QuickNav y los enlaces viejos funcionan.
 */

const SECTION_IDS = {
  granizados: "granizados",
  frappes: "frappes",
  "sodas-italianas": "sodas",
  "sodas-micheladas": "sodas",
  sodas: "sodas",
  mocktails: "mocktails",
  cocteles: "mocktails",
  shots: "shots",
  micheladas: "micheladas",
  vinos: "vinos",
  cervezas: "cervezas",
  cuates: "cuates",
  luladas: "luladas",
  desguayabator: "desguayabator",
  agua: "agua",
};

const EXTRAS = { granizados: GRANIZADO_EXTRAS, micheladas: MICHELADA_EXTRAS };

// Lo que no es carta pero vive en la página (cada uno con su sección).
const MORE = [
  { id: "que-te-provoca", name: "¿Qué te provoca?" },
  { id: "descuento-redes", name: "10 % por redes" },
  { id: "descuento-cumple", name: "Cumpleaños" },
  { id: "feedback", name: "Tu opinión" },
  { id: "frostbyte-play", name: "Frostbyte Play", tableOnly: true },
];

// Fondos planos de las fotos, por turno: los mismos del hero.
const TILES = ["#9d0812", "#073d29", "#f3ece4"];

const sectionId = (category) => SECTION_IDS[category.slug] || `cat-${category.slug}`;
const formatPrice = (value) => `$${Math.round(Number(value)).toLocaleString("es-CO")}`;

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 118;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
};

function ProductCard({ product, index, onOpen }) {
  const variants = activeVariants(product);
  if (!variants.length) return null;
  const christmas = NAVIDAD_MENU_IMAGES.has(product.slug);
  const image = christmas ? `/images/navidad/menu/${product.slug}.webp` : product.image_url;
  // 320 px para el teléfono (~11 KB), 640 px para pantallas grandes.
  const srcSet = christmas
    ? `/images/navidad/menu/${product.slug}-sm.webp 320w, /images/navidad/menu/${product.slug}.webp 640w`
    : undefined;
  const tile = TILES[index % TILES.length];
  const prices = variants.map((variant) => Number(variant.price)).filter((price) => price > 0);
  const lowest = prices.length ? Math.min(...prices) : 0;

  return (
    <li>
      <button type="button" className="nv-card" onClick={() => onOpen(product)} style={{ "--nv-tile": tile }}>
        <span className={`nv-card__img${christmas ? "" : " nv-card__img--plain"}`}>
          {image ? (
            <img
              src={image}
              srcSet={srcSet}
              sizes="(min-width: 1024px) 260px, (min-width: 640px) 30vw, 46vw"
              alt=""
              loading="lazy"
              decoding="async"
              width="640"
              height="800"
            />
          ) : (
            <span className="nv-card__initial" aria-hidden="true">{product.name.charAt(0)}</span>
          )}
        </span>
        <span className="nv-card__body">
          <span className="nv-card__name">{product.name}</span>
          <span className="nv-card__price">
            {variants.length > 1 ? (
              <>
                <small>Desde</small> {formatPrice(lowest)}
              </>
            ) : (
              formatPrice(lowest)
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

function CategorySection({ category, onOpen, register, onEmpty }) {
  const { data, isLoading } = useProductsByCategory(category.slug);
  const products = (data?.results || []).filter(
    (product) => product.is_active !== false && activeVariants(product).length
  );
  const id = sectionId(category);
  const extras = EXTRAS[category.slug];
  const empty = !isLoading && !products.length;

  // Avisa a la barra: una categoría activa sin productos no tiene pestaña.
  React.useEffect(() => {
    onEmpty(category.slug, empty);
  }, [category.slug, empty, onEmpty]);

  if (empty) return null;

  return (
    <section id={id} ref={(el) => register(id, el)} className="nv-cat" aria-labelledby={`${id}-title`}>
      <header className="nv-cat__head">
        <h3 id={`${id}-title`} className="nv-cat__title">{category.name}</h3>
        {!isLoading && <span className="nv-cat__count">{products.length}</span>}
      </header>
      {category.description && <p className="nv-cat__desc">{category.description}</p>}

      <ul className="nv-grid">
        {isLoading
          ? [0, 1, 2, 3].map((i) => (
              <li key={i} className="nv-card nv-card--skeleton" aria-hidden="true">
                <span className="nv-card__img" />
                <span className="nv-card__body"><span /><span /></span>
              </li>
            ))
          : products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onOpen={onOpen} />
            ))}
      </ul>

      {category.show_extras !== false && extras && !isLoading && (
        <div className="nv-extras">
          {extras.map((group) => (
            <div key={group.title} className="nv-extras__group">
              <p className="nv-extras__title">{group.title}</p>
              <p className="nv-extras__desc">{group.description}</p>
              <ul className="nv-extras__list">
                {group.options.map((option) => (
                  <li key={option.name}>
                    <span>
                      {option.name}
                      {option.detalle && <small> · {option.detalle}</small>}
                    </span>
                    <b>{option.price}</b>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ProductSheet({ product, onClose }) {
  const closeRef = React.useRef(null);
  const panelRef = React.useRef(null);
  React.useEffect(() => {
    if (!product) return undefined;
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // El foco no sale de la ficha mientras está abierta.
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    // Lo de detrás no se puede tocar ni enfocar mientras la ficha está abierta.
    const outside = [...document.body.children].filter((el) => !el.contains(panelRef.current));
    outside.forEach((el) => el.setAttribute("inert", ""));
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      outside.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [product, onClose]);

  if (!product) return null;
  const variants = activeVariants(product);
  const christmas = NAVIDAD_MENU_IMAGES.has(product.slug);
  const image = christmas ? `/images/navidad/menu/${product.slug}.webp` : product.image_url;

  // En un portal sobre <body>: así todo lo demás (la app entera) queda inerte.
  return createPortal(
    <div className="nv-sheet" role="dialog" aria-modal="true" aria-labelledby="nv-sheet-title">
      <button type="button" className="nv-sheet__scrim" aria-label="Cerrar" onClick={onClose} tabIndex={-1} />
      <div ref={panelRef} className="nv-sheet__panel fb-sheet">
        <button ref={closeRef} type="button" className="nv-sheet__close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
        <div className={`nv-sheet__img${christmas ? "" : " nv-card__img--plain"}`} style={{ "--nv-tile": TILES[0] }}>
          {image && <img src={image} alt={product.name} decoding="async" />}
        </div>
        <div className="nv-sheet__body">
          <h3 id="nv-sheet-title" className="nv-sheet__name">{product.name}</h3>
          {product.description && <p className="nv-sheet__desc">{product.description}</p>}
          <ul className="nv-sheet__prices">
            {variants.map((variant) => (
              <li key={variant.id || variant.name}>
                <span>{variants.length > 1 ? variant.name : "Precio"}</span>
                <b>{formatPrice(variant.price)}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function NavidadMenu() {
  const { pathname } = useLocation();
  const isTable = pathname.startsWith("/mesa/");
  const { data, isLoading } = useActiveCategories();
  const categories = React.useMemo(() => {
    const isFood = (cat) => cat.business_name === "Frostbyte Food";
    return (data?.results || [])
      .filter((cat) => cat.is_active)
      .sort((a, b) => isFood(b) - isFood(a) || a.display_order - b.display_order);
  }, [data]);

  const [open, setOpen] = React.useState(null);
  const [empty, setEmpty] = React.useState(() => new Set());
  const onEmpty = React.useCallback((slug, isEmpty) => {
    setEmpty((prev) => {
      if (prev.has(slug) === isEmpty) return prev;
      const next = new Set(prev);
      if (isEmpty) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }, []);
  const [current, setCurrent] = React.useState(null);
  const sections = React.useRef(new Map());
  const barRef = React.useRef(null);
  const close = React.useCallback(() => setOpen(null), []);

  const register = React.useCallback((id, el) => {
    if (el) sections.current.set(id, el);
    else sections.current.delete(id);
  }, []);

  // Marca en la barra la categoría que está a la vista.
  React.useEffect(() => {
    if (!categories.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-130px 0px -60% 0px" }
    );
    const timer = setTimeout(() => sections.current.forEach((el) => io.observe(el)), 300);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [categories]);

  // La pastilla activa siempre a la vista dentro de la barra.
  React.useEffect(() => {
    const chip = barRef.current?.querySelector('[aria-current="true"]');
    if (!chip) return;
    const bar = barRef.current;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2;
    bar.scrollTo({ left, behavior: "smooth" });
  }, [current]);

  if (isLoading) {
    return (
      <section id="carta" className="nv-menu" aria-busy="true">
        <div className="nv-menu__inner">
          <p className="nv-menu__eyebrow">Bebidas y comida</p>
          <h2 className="nv-menu__title">La carta</h2>
        </div>
      </section>
    );
  }
  if (!categories.length) return null;

  const more = MORE.filter((item) => !item.tableOnly || isTable);

  return (
    <section id="carta" className="nv-menu">
      <div className="nv-menu__inner">
        <p className="nv-menu__eyebrow">Bebidas y comida · Navidad</p>
        <h2 className="nv-menu__title">La carta</h2>
        <p className="nv-menu__lead">Toca una categoría para ir directo. Toca un producto para ver su descripción.</p>
      </div>

      <nav className="nv-bar" aria-label="Categorías de la carta">
        <div ref={barRef} className="nv-bar__track">
          {/* Pedir canción va primero: es de lo más usado y así queda a la mano. */}
          <a
            href="#solicitar-cancion"
            className="nv-bar__song"
            onClick={(event) => {
              if (!document.getElementById("solicitar-cancion")) return;
              event.preventDefault();
              scrollToId("solicitar-cancion");
            }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 12.5V3.5l7-1.5v9" />
              <circle cx="4.25" cy="12.5" r="1.75" />
              <circle cx="11.25" cy="11" r="1.75" />
            </svg>
            Pedir canción
          </a>
          <span className="nv-bar__sep" aria-hidden="true" />
          {/* Mismo orden que las secciones de abajo; sin las que no tienen productos. */}
          {categories.filter((category) => !empty.has(category.slug)).map((category) => {
            const id = sectionId(category);
            return (
              <a
                key={category.slug}
                href={`#${id}`}
                aria-current={current === id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId(id);
                }}
              >
                {category.name}
              </a>
            );
          })}
          <span className="nv-bar__sep" aria-hidden="true" />
          {more.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="nv-bar__more"
              onClick={(event) => {
                if (!document.getElementById(item.id)) return;
                event.preventDefault();
                scrollToId(item.id);
              }}
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="nv-menu__inner nv-menu__list">
        {categories.map((category) => (
          <CategorySection key={category.slug} category={category} onOpen={setOpen} register={register} onEmpty={onEmpty} />
        ))}
      </div>

      <ProductSheet product={open} onClose={close} />
    </section>
  );
}
