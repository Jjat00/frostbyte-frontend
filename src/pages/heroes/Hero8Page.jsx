import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero8.css";

/* Opción 8 — "Turbo"
   Referente: Rappi Turbo / Getir: la promesa es la velocidad. Itálicas
   pesadas, marquesina y un radar con el dato real del negocio: cubrimos
   1,5 km a la redonda. Tipografía: Archivo (itálica black) + Barlow. */

const MARQUEE = [
  "Granizados",
  "Frappés",
  "Cocteles",
  "Shots",
  "Micheladas",
  "Sodas italianas",
];

const Hero8Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,600;0,700;1,800;1,900&family=Barlow:wght@400;500;600&display=swap",
  );

  return (
    <div className="hx8">
      <main className="hx8-main">
        <span className="hx8-badge">Domicilio express · Cumbal</span>

        <h1 className="hx8-title">
          Del congelador
          <br />
          <span className="hx8-title-mag">a tu puerta</span>
        </h1>

        <p className="hx8-tagline">Sale frío. Llega frío.</p>

        <div className="hx8-radar" role="img" aria-label="Zona de cobertura: 1,5 kilómetros a la redonda del local">
          <span className="hx8-anillo hx8-anillo-1" />
          <span className="hx8-anillo hx8-anillo-2" />
          <span className="hx8-anillo hx8-anillo-3" />
          <span className="hx8-ping" />
          <span className="hx8-centro" />
          <span className="hx8-radar-label">1,5 km a la redonda</span>
        </div>

        <div className="hx8-actions">
          <Link to="/domicilios" className="hx8-cta">
            Pedir ya
          </Link>
          <a
            href="https://wa.me/573164277879"
            target="_blank"
            rel="noopener noreferrer"
            className="hx8-cta-ghost"
          >
            o por WhatsApp
          </a>
        </div>
      </main>

      <div className="hx8-marquee" aria-hidden="true">
        <div className="hx8-marquee-track">
          {[0, 1, 2].map((rep) => (
            <span key={rep}>
              {MARQUEE.map((item) => (
                <em key={item}>{item} · </em>
              ))}
            </span>
          ))}
        </div>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero8Page;
