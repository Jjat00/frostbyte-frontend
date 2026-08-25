import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero5.css";

/* Opción 5 — "Historias"
   Referente: stories de Instagram/TikTok, el formato donde el cliente de
   Frostbyte ya vive. El hero es un carrusel vertical a pantalla completa
   con barras de progreso y zonas de tap. Tipografía: Syne + DM Sans. */

const DURACION_MS = 4200;

const SLIDES = [
  {
    tag: "01 · La casa",
    titulo: "Granizados",
    texto: "Hielo tricolor y fruta de verdad. El clásico de Cumbal.",
    accent: "mag",
  },
  {
    tag: "02 · La noche",
    titulo: "Cocteles & shots",
    texto: "Mojitos, margaritas, cuates. La noche empieza bien fría.",
    accent: "cyan",
  },
  {
    tag: "03 · El remedio",
    titulo: "Desguayabator",
    texto: "Electrolit, Bonfiest y fruta helada. Te revive, palabra.",
    accent: "mag",
  },
  {
    tag: "04 · A tu casa",
    titulo: "Domicilios",
    texto: "Hasta tu puerta, 1,5 km a la redonda.",
    accent: "cyan",
    cta: { label: "Pedir ahora", to: "/domicilios" },
  },
];

const Hero5Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, DURACION_MS);
    return () => clearTimeout(id);
  }, [idx]);

  const slide = SLIDES[idx];

  return (
    <div className={`hx5 is-${slide.accent}`}>
      <div className="hx5-bars" role="presentation">
        {SLIDES.map((s, i) => (
          <span key={s.tag} className="hx5-bar">
            <span
              className={
                i < idx ? "is-full" : i === idx ? "is-filling" : undefined
              }
              key={i === idx ? `fill-${idx}` : undefined}
            />
          </span>
        ))}
      </div>

      <header className="hx5-head">
        <span className="hx5-avatar" aria-hidden="true">
          F
        </span>
        <div>
          <strong>frostbyte.col</strong>
          <span>Cumbal, Nariño</span>
        </div>
      </header>

      <main className="hx5-slide" key={idx}>
        <p className="hx5-tag">{slide.tag}</p>
        <h1 className="hx5-titulo">{slide.titulo}</h1>
        <p className="hx5-texto">{slide.texto}</p>
        {slide.cta ? (
          <Link to={slide.cta.to} className="hx5-cta">
            {slide.cta.label}
          </Link>
        ) : (
          <Link to="/" className="hx5-link">
            Ver en la carta
          </Link>
        )}
      </main>

      {/* Zonas de tap como en cualquier story */}
      <button
        type="button"
        className="hx5-zone hx5-zone-left"
        aria-label="Historia anterior"
        onClick={() =>
          setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)
        }
      />
      <button
        type="button"
        className="hx5-zone hx5-zone-right"
        aria-label="Siguiente historia"
        onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}
      />

      <HeroSwitch />
    </div>
  );
};

export default Hero5Page;
