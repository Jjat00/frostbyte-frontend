import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero15.css";

/* Opción 15 — "El número"
   La app contada como una revista: portada a la izquierda y sumario a la
   derecha. En escritorio es un pliego de dos páginas con su medianil; en
   móvil, una sola columna. En vez de números de página, cada entrada lleva
   el dato que de verdad importa. Tipografía: Newsreader + Epilogue. */

const SUMARIO = [
  {
    nombre: "La carta",
    texto: "Granizados, frappés, cocteles, shots y micheladas.",
    dato: "Piso 2 y 3",
    to: "/",
  },
  {
    nombre: "Domicilios",
    texto: "Armas el pedido y llega frío a tu puerta.",
    dato: "1,5 km",
    to: "/domicilios",
  },
  {
    nombre: "Mi cuenta",
    texto: "Tu pedido paso a paso y tus reservas guardadas.",
    dato: "En vivo",
    to: "/mi-cuenta",
  },
  {
    nombre: "Reservas",
    texto: "Mesa, grupo o Sala VIP. Tú pides la hora.",
    dato: "Te confirmamos",
    to: "/reservas",
  },
  {
    nombre: "Juegos",
    texto: "Duelo e Impostor con el parche, desde el celular.",
    dato: "Sala con código",
    to: "/game",
  },
  {
    nombre: "Pedir canción",
    texto: "Lo que suena en tu piso también lo eliges tú.",
    dato: "Tu piso",
    to: "/#solicitar-cancion",
  },
];

const Hero15Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Epilogue:wght@400;500;600;700&display=swap",
  );

  return (
    <div className="hx15">
      <div className="hx15-pliego">
        <section className="hx15-portada">
          <p className="hx15-cabecera">
            <span>Frostbyte</span>
            <span>Cumbal, Nariño</span>
          </p>

          <h1 className="hx15-masthead">
            Todo el local,
            <br />
            <em>en tu bolsillo</em>
          </h1>

          <p className="hx15-lede">
            <span className="hx15-capitular">L</span>a app de Frostbyte no es
            solo la carta. Es pedir a domicilio sin llamar, seguir tu pedido
            mientras llega, apartar la mesa antes de salir de casa y decidir
            qué canción suena mientras esperas.
          </p>

          <div className="hx15-acciones">
            <Link to="/" className="hx15-cta">
              Empezar por la carta
            </Link>
            <Link to="/domicilios" className="hx15-cta-soft">
              o pedir a domicilio
            </Link>
          </div>
        </section>

        <section className="hx15-sumario">
          <h2 className="hx15-sumario-titulo">En este número</h2>
          <ul className="hx15-lista">
            {SUMARIO.map((s) => (
              <li key={s.nombre}>
                <Link to={s.to} className="hx15-entrada">
                  <span className="hx15-entrada-nombre">{s.nombre}</span>
                  <span className="hx15-entrada-texto">{s.texto}</span>
                  <span className="hx15-entrada-dato">{s.dato}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hx15-folio">
            Cra. 8 #18-13 · Efectivo y Nequi · Abierto hasta tarde
          </p>
        </section>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero15Page;
