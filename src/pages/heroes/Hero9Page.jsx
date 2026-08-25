import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero9.css";

/* Opción 9 — "La estrella de la casa"
   Referente: el hero de temporada de Starbucks: un solo producto en el
   centro del escenario. El vaso está dibujado 100 % en CSS con las capas
   de granizado en magenta y cyan. Tipografía: Bodoni Moda + Sora. */

const NOTAS = ["Electrolit", "Bonfiest", "Fruta bien fría"];

const Hero9Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@1,6..96,400;1,6..96,500;1,6..96,600&family=Sora:wght@400;600;700&display=swap",
  );

  return (
    <div className="hx9">
      <main className="hx9-main">
        <p className="hx9-eyebrow">La estrella de la casa</p>
        <h1 className="hx9-title">Desguayabator</h1>
        <p className="hx9-sub">
          El remedio oficial del día siguiente,
          <br />
          servido <em>bajo cero</em>.
        </p>

        <div className="hx9-escena">
          <div className="hx9-halo" aria-hidden="true" />
          <div
            className="hx9-vaso"
            role="img"
            aria-label="Vaso de Desguayabator con capas de granizado magenta y cyan"
          >
            <span className="hx9-pitillo" />
            <span className="hx9-escarcha" />
            <span className="hx9-liquido">
              <i className="hx9-burbuja" />
              <i className="hx9-burbuja" />
              <i className="hx9-burbuja" />
            </span>
            <span className="hx9-brillo" />
          </div>
        </div>

        <ul className="hx9-notas">
          {NOTAS.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <div className="hx9-actions">
          <Link to="/" className="hx9-cta">
            Pídelo hoy
          </Link>
          <span className="hx9-lugar">Frostbyte · Cumbal, Nariño</span>
        </div>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero9Page;
