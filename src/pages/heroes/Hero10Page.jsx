import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero10.css";

/* Opción 10 — "Superapp"
   Referente: el home multiservicio de Rappi. Frostbyte ya es más que una
   carta (domicilios, reservas, juegos, música): el hero lo muestra como
   un bento de servicios con un tile vivo (reloj del local).
   Tipografía: Bricolage Grotesque + Manrope. */

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const SERVICIOS = [
  {
    to: "/domicilios",
    titulo: "Domicilios",
    nota: "Hasta tu puerta, 1,5 km",
    clase: "hx10-cyan",
  },
  {
    to: "/reservas",
    titulo: "Reservas",
    nota: "Mesa, grupo o Sala VIP",
    clase: "hx10-mag",
  },
  {
    to: "/game",
    titulo: "Juegos",
    nota: "Duelo e Impostor en tu mesa",
    clase: "hx10-cyan",
  },
  {
    to: "/",
    titulo: "Música",
    nota: "Pide la canción que suena",
    clase: "hx10-mag",
  },
];

const Hero10Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Manrope:wght@400;600;800&display=swap",
  );
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const reloj = ahora.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="hx10">
      <main className="hx10-main">
        <header className="hx10-head">
          <h1 className="hx10-logo">
            Frostbyte<span className="hx10-punto">.</span>
          </h1>
          <p className="hx10-lema">Todo lo frío de Cumbal, en un solo lugar.</p>
        </header>

        <div className="hx10-grid">
          <Link to="/" className="hx10-tile hx10-tile-carta">
            <span className="hx10-tile-kicker">La carta</span>
            <strong>
              Granizados, frappés,
              <br />
              cocteles y shots
            </strong>
            <span className="hx10-tile-cta">Abrir la carta →</span>
          </Link>

          {SERVICIOS.map((s) => (
            <Link to={s.to} key={s.titulo} className={`hx10-tile ${s.clase}`}>
              <strong>{s.titulo}</strong>
              <span className="hx10-tile-nota">{s.nota}</span>
            </Link>
          ))}

          <div className="hx10-tile hx10-tile-vivo" aria-live="off">
            <span className="hx10-reloj">{reloj}</span>
            <span className="hx10-fecha">
              {DAY_NAMES[ahora.getDay()]} · Cra. 8 #18-13 · Piso 2 y 3
            </span>
          </div>
        </div>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero10Page;
