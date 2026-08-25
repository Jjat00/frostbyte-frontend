import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Bike, CalendarCheck } from "lucide-react";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero1.css";

/* Opción 1 — "App de antojos"
   Referente: home de apps de delivery (Rappi / Uber Eats). Modo claro,
   búsqueda primero: el cliente llega con un antojo y la página se lo
   pregunta directamente. Tipografía: Gabarito. */

const ANTOJOS = [
  "un granizado de maracuyá",
  "una michelada bien fría",
  "un frappé de café",
  "shots con los panas",
  "una soda italiana",
];

const CATEGORIAS = [
  "Granizados",
  "Frappés",
  "Cocteles",
  "Shots",
  "Micheladas",
  "Sodas italianas",
  "Cervezas",
];

const Hero1Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Gabarito:wght@400;500;600;700;800&display=swap",
  );
  const [antojo, setAntojo] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAntojo((a) => (a + 1) % ANTOJOS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hx1">
      <header className="hx1-top">
        <div>
          <span className="hx1-top-label">Entregando en</span>
          <span className="hx1-top-place">
            <MapPin size={14} strokeWidth={2.5} aria-hidden="true" />
            Cumbal, Nariño
          </span>
        </div>
        <span className="hx1-avatar" aria-hidden="true">
          F
        </span>
      </header>

      <main className="hx1-main">
        <h1 className="hx1-title">
          ¿Qué se te
          <br />
          antoja hoy?
        </h1>

        <Link to="/" className="hx1-search" aria-label="Buscar en la carta">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="hx1-search-text" key={antojo}>
            {ANTOJOS[antojo]}
          </span>
        </Link>

        <div className="hx1-chips" role="list">
          {CATEGORIAS.map((cat) => (
            <Link to="/" className="hx1-chip" key={cat} role="listitem">
              {cat}
            </Link>
          ))}
        </div>

        <article className="hx1-featured">
          <span className="hx1-featured-badge">El favorito de Cumbal</span>
          <h2 className="hx1-featured-title">Desguayabator</h2>
          <p className="hx1-featured-desc">
            El remedio oficial del día siguiente: Electrolit, Bonfiest y fruta
            bien fría.
          </p>
          <Link to="/" className="hx1-cta">
            Verlo en la carta
          </Link>
          <div className="hx1-featured-glow" aria-hidden="true" />
        </article>

        <div className="hx1-tiles">
          <Link to="/domicilios" className="hx1-tile">
            <Bike size={20} strokeWidth={2.2} aria-hidden="true" />
            <strong>Domicilios</strong>
            <span>Hasta tu puerta, 1,5 km a la redonda</span>
          </Link>
          <Link to="/reservas" className="hx1-tile hx1-tile-alt">
            <CalendarCheck size={20} strokeWidth={2.2} aria-hidden="true" />
            <strong>Reservas</strong>
            <span>Mesa, grupo o Sala VIP</span>
          </Link>
        </div>
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero1Page;
