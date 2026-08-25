import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero2.css";

/* Opción 2 — "Kiosko"
   Referente: pantallas de autoservicio (kioskos de comida rápida) y cartel
   suizo: color plano, cero neón, tipografía enorme y botones que no se
   pueden fallar con el pulgar. Tipografía: Archivo Black. */

const DAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const Hero2Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@500;600;700&display=swap",
  );
  const hoy = DAY_NAMES[new Date().getDay()];

  return (
    <div className="hx2">
      <header className="hx2-strip">
        <span>Frostbyte</span>
        <span>Cumbal, Nariño</span>
        <span>Hoy es {hoy}</span>
      </header>

      <main className="hx2-main">
        <h1 className="hx2-stack">
          <span className="hx2-word hx2-word-mag">Frío.</span>
          <span className="hx2-word hx2-word-cyan">Rico.</span>
          <span className="hx2-word hx2-word-line">Ya.</span>
        </h1>

        <p className="hx2-sub">
          Granizados · frappés · cocteles · shots · micheladas
        </p>

        <nav className="hx2-tiles" aria-label="Acciones principales">
          <Link to="/" className="hx2-tile hx2-tile-mag">
            Ver la carta
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/domicilios" className="hx2-tile hx2-tile-cyan">
            Pedir domicilio
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/reservas" className="hx2-tile hx2-tile-ghost">
            Reservar mesa
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </main>

      <footer className="hx2-foot">
        <span>Cra. 8 #18-13 · Piso 2 y 3</span>
        <span>Servido bien frío</span>
      </footer>

      <HeroSwitch />
    </div>
  );
};

export default Hero2Page;
