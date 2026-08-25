import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero13.css";

/* Opción 13 — "Escritorio"
   El "byte" del nombre sin volver al cyberpunk: cada servicio de la app es
   una ventana abierta sobre un escritorio, y la que tocas pasa al frente.
   En escritorio las ventanas se solapan como en un monitor de verdad y hay
   barra de tareas; en móvil se apilan a ancho completo, una debajo de otra.
   Tipografía: Rubik + Fragment Mono. */

const VENTANAS = [
  {
    id: "carta",
    titulo: "carta.app",
    nombre: "La carta",
    texto: "Granizados, frappés, cocteles y shots, con fotos y precios.",
    accion: "Abrir la carta",
    to: "/",
    tono: "mag",
  },
  {
    id: "domicilios",
    titulo: "domicilios.app",
    nombre: "Domicilios",
    texto: "Armas el pedido y llega a tu puerta, 1,5 km a la redonda.",
    accion: "Pedir a domicilio",
    to: "/domicilios",
    tono: "cyan",
  },
  {
    id: "cuenta",
    titulo: "mi-cuenta.app",
    nombre: "Mi cuenta",
    texto: "Tu pedido en vivo, tus reservas y tus datos. Entras con Google.",
    accion: "Entrar a mi cuenta",
    to: "/mi-cuenta",
    tono: "cyan",
  },
  {
    id: "reservas",
    titulo: "reservas.app",
    nombre: "Reservas",
    texto: "Mesa, grupo o Sala VIP. Pides la hora y el equipo la confirma.",
    accion: "Reservar",
    to: "/reservas",
    tono: "mag",
  },
];

const BARRA = [
  { nombre: "Juegos", to: "/game" },
  { nombre: "Pedir canción", to: "/#solicitar-cancion" },
  { nombre: "¿Qué te provoca?", to: "/#que-te-provoca" },
  { nombre: "Descuentos", to: "/#descuento-redes" },
];

const Hero13Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&family=Fragment+Mono&display=swap",
  );
  const [frente, setFrente] = useState("carta");

  return (
    <div className="hx13">
      <div className="hx13-wrap">
        <header className="hx13-head">
          <h1 className="hx13-title">Frostbyte, abierto en tu celular</h1>
          <p className="hx13-sub">
            Carta, domicilios, cuenta y reservas: todo vive en la misma app.
          </p>
        </header>

        <div className="hx13-escritorio">
          {VENTANAS.map((v) => (
            <article
              key={v.id}
              className={`hx13-ventana hx13-v-${v.id} hx13-${v.tono} ${
                frente === v.id ? "is-frente" : ""
              }`}
              onMouseEnter={() => setFrente(v.id)}
              onFocus={() => setFrente(v.id)}
            >
              <header className="hx13-barra">
                <span className="hx13-puntos" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="hx13-titulo">{v.titulo}</span>
              </header>
              <div className="hx13-cuerpo">
                <h2 className="hx13-nombre">{v.nombre}</h2>
                <p className="hx13-texto">{v.texto}</p>
                <Link to={v.to} className="hx13-accion">
                  {v.accion} →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <nav className="hx13-taskbar" aria-label="Más de la app">
          <span className="hx13-taskbar-label">También abierto</span>
          <ul>
            {BARRA.map((b) => (
              <li key={b.nombre}>
                <Link to={b.to}>{b.nombre}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero13Page;
