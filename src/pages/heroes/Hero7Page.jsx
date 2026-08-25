import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero7.css";

/* Opción 7 — "Juguetona"
   Referente: Glovo y las apps de delivery que se atreven a ser tiernas:
   todo redondo, colores caramelo sobre hielo claro, tarjetas que flotan.
   Tipografía: Baloo 2 + Nunito. */

const CARDS = [
  {
    nombre: "Granizado",
    frase: "Fruta y hielo tricolor",
    clase: "hx7-card-mag",
  },
  {
    nombre: "Frappé",
    frase: "Café con frío encima",
    clase: "hx7-card-cyan",
  },
  {
    nombre: "Michelada",
    frase: "La más pedida de la noche",
    clase: "hx7-card-mix",
  },
];

const Hero7Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;600;800&display=swap",
  );

  return (
    <div className="hx7">
      <div className="hx7-blob hx7-blob-mag" aria-hidden="true" />
      <div className="hx7-blob hx7-blob-cyan" aria-hidden="true" />

      <main className="hx7-main">
        <span className="hx7-badge">Frostbyte · Cumbal, Nariño</span>
        <h1 className="hx7-title">
          Un granizado
          <br />
          te está <span className="hx7-title-mag">buscando</span>
        </h1>
        <p className="hx7-sub">
          Quédate donde estás: lo preparamos bien frío y te lo llevamos, o te
          guardamos la mesa.
        </p>

        <div className="hx7-cards">
          {CARDS.map((c, i) => (
            <Link
              to="/"
              key={c.nombre}
              className={`hx7-card ${c.clase}`}
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              <strong>{c.nombre}</strong>
              <span>{c.frase}</span>
            </Link>
          ))}
        </div>

        <div className="hx7-actions">
          <Link to="/" className="hx7-cta">
            Ver la carta
          </Link>
          <Link to="/domicilios" className="hx7-cta-soft">
            Pedir domicilio
          </Link>
        </div>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero7Page;
