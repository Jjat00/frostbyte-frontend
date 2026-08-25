import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Store, Home } from "lucide-react";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero4.css";

/* Opción 4 — "Tracker"
   Referente: el pizza tracker de Domino's y el mapa de reparto de Glovo.
   El hero es un pedido en vivo (demo en loop): vende el domicilio
   mostrando la experiencia, no describiéndola.
   Tipografía: IBM Plex Mono (datos del pedido) + IBM Plex Sans. */

const PASOS = ["Recibido", "En preparación", "En camino", "En tu puerta"];
const PASO_MS = 2200;

const Hero4Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
  );
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPaso((p) => (p + 1) % (PASOS.length + 1));
    }, PASO_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hx4">
      <main className="hx4-main">
        <p className="hx4-eyebrow">Domicilios Frostbyte · Cumbal</p>
        <h1 className="hx4-title">
          Tu pedido,
          <br />
          en vivo.
        </h1>

        <article className="hx4-card" aria-label="Ejemplo de pedido en curso">
          <header className="hx4-card-head">
            <div>
              <span className="hx4-card-num">Pedido #0042</span>
              <span className="hx4-card-items">
                1× Granizado de maracuyá · 1× Michelada
              </span>
            </div>
            <span
              className={`hx4-badge ${paso >= PASOS.length ? "is-done" : ""}`}
            >
              {paso >= PASOS.length ? "Entregado" : PASOS[paso]}
            </span>
          </header>

          <ol className="hx4-steps">
            {PASOS.map((nombre, i) => {
              const estado =
                paso > i ? "is-done" : paso === i ? "is-active" : "";
              return (
                <li key={nombre} className={`hx4-step ${estado}`}>
                  <span className="hx4-step-dot">
                    {paso > i && (
                      <Check size={11} strokeWidth={3.5} aria-hidden="true" />
                    )}
                  </span>
                  <span className="hx4-step-name">{nombre}</span>
                </li>
              );
            })}
          </ol>

          <div className="hx4-ruta" aria-hidden="true">
            <Store size={18} strokeWidth={2.2} />
            <div className="hx4-ruta-linea">
              <span className="hx4-ruta-moto" />
            </div>
            <Home size={18} strokeWidth={2.2} />
          </div>
        </article>

        <p className="hx4-pitch">
          Así se ve pedir en Frostbyte: sale frío y llega frío, hasta 1,5 km a
          la redonda.
        </p>

        <div className="hx4-actions">
          <Link to="/domicilios" className="hx4-cta">
            Pedir a domicilio
          </Link>
          <Link to="/" className="hx4-cta-ghost">
            Ver la carta
          </Link>
        </div>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero4Page;
