import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero3.css";

/* Opción 3 — "Carta editorial"
   Referente: cartas impresas de restaurante y el lado editorial de
   Deliveroo: papel hielo, tinta oscura, magenta como tinta de acento.
   El hero ES el índice de la carta. Tipografía: Libre Caslon Text + Karla. */

const SECCIONES = [
  { num: "I", nombre: "Granizados", nota: "hielo y fruta intensa" },
  { num: "II", nombre: "Frappés", nota: "café, crema y frío" },
  { num: "III", nombre: "Cocteles", nota: "mojitos, margaritas y cuates" },
  { num: "IV", nombre: "Shots", nota: "seis destilados" },
  { num: "V", nombre: "Micheladas", nota: "la mezcla de la casa" },
  { num: "VI", nombre: "Sodas italianas", nota: "fresa y maracuyá" },
  { num: "VII", nombre: "Desguayabator", nota: "el remedio" },
];

const SELLO_TEXTO = "SERVIDO BIEN FRÍO · CUMBAL · A 3.050 M S. N. M. · ";

const Hero3Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Karla:wght@400;500;700&display=swap",
  );

  return (
    <div className="hx3">
      <main className="hx3-sheet">
        <header className="hx3-head">
          <p className="hx3-eyebrow">Casa de bebidas heladas · Cumbal, Nariño</p>
          <h1 className="hx3-masthead">Frostbyte</h1>
          <p className="hx3-lede">
            Una carta corta y <mark className="hx3-mark">bien fría</mark>: lo
            que hay, está rico.
          </p>
        </header>

        <div className="hx3-rule" role="presentation">
          <span>La carta</span>
        </div>

        <ol className="hx3-index">
          {SECCIONES.map((s) => (
            <li key={s.num} className="hx3-row">
              <span className="hx3-num">{s.num}</span>
              <span className="hx3-nombre">{s.nombre}</span>
              <span className="hx3-dots" aria-hidden="true" />
              <span className="hx3-nota">{s.nota}</span>
            </li>
          ))}
        </ol>

        <div className="hx3-actions">
          <Link to="/" className="hx3-cta">
            Abrir la carta completa
          </Link>
          <Link to="/domicilios" className="hx3-cta-soft">
            Pedir a domicilio
          </Link>
        </div>

        <svg
          className="hx3-sello"
          viewBox="0 0 120 120"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            <path
              id="hx3-circ"
              d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
            />
          </defs>
          <circle cx="60" cy="60" r="56" className="hx3-sello-borde" />
          <circle cx="60" cy="60" r="30" className="hx3-sello-borde" />
          <text className="hx3-sello-texto">
            <textPath href="#hx3-circ">{SELLO_TEXTO}</textPath>
          </text>
          <text x="60" y="66" textAnchor="middle" className="hx3-sello-f">
            F
          </text>
        </svg>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero3Page;
