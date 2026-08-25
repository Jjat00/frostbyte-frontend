import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero17.css";

/* Opción 17 — "El mural"
   Un tablero grande donde cada servicio ocupa el espacio que merece: la
   carta manda, domicilios y cuenta la siguen, y lo demás rellena los huecos.
   En escritorio es una retícula de 12 columnas con celdas de tamaños
   distintos; en móvil se ordena en dos columnas.
   Tipografía: Anton + Schibsted Grotesk. */

const CELDAS = [
  {
    id: "carta",
    nombre: "La carta",
    texto: "Granizados, frappés, cocteles, shots y micheladas. Con fotos y precios.",
    dato: "Piso 2 y 3",
    to: "/",
  },
  {
    id: "domicilios",
    nombre: "Domicilios",
    texto: "Llega frío a tu puerta. Pagas al recibir.",
    dato: "1,5 km",
    to: "/domicilios",
  },
  {
    id: "cuenta",
    nombre: "Mi cuenta",
    texto: "Tu pedido paso a paso y tus reservas.",
    dato: "En vivo",
    to: "/mi-cuenta",
  },
  {
    id: "reservas",
    nombre: "Reservas",
    texto: "Mesa, grupo o Sala VIP.",
    dato: "Te confirmamos",
    to: "/reservas",
  },
  {
    id: "juegos",
    nombre: "Juegos",
    texto: "Duelo e Impostor con tu parche, desde el celular.",
    dato: "Sala con código",
    to: "/game",
  },
  {
    id: "musica",
    nombre: "Pedir canción",
    texto: "Suena en tu piso.",
    dato: "Tuya",
    to: "/#solicitar-cancion",
  },
  {
    id: "provoca",
    nombre: "¿Qué te provoca?",
    texto: "Te decimos qué pedir.",
    dato: "3 preguntas",
    to: "/#que-te-provoca",
  },
  {
    id: "descuentos",
    nombre: "Descuentos",
    texto: "Por seguirnos y por tu cumpleaños.",
    dato: "Dos formas",
    to: "/#descuento-redes",
  },
];

const Hero17Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Anton&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap",
  );

  return (
    <div className="hx17">
      <div className="hx17-mural">
        <section className="hx17-celda hx17-titular">
          <p className="hx17-eyebrow">Frostbyte · Cumbal, Nariño</p>
          <h1 className="hx17-title">
            Todo el local
            <br />
            cabe en una app
          </h1>
          <p className="hx17-sub">
            Pide, reserva, juega y sigue tu domicilio sin llamar a nadie.
          </p>
        </section>

        {CELDAS.map((c) => (
          <Link
            to={c.to}
            key={c.id}
            className={`hx17-celda hx17-c-${c.id}`}
          >
            <span className="hx17-dato">{c.dato}</span>
            <h2 className="hx17-nombre">{c.nombre}</h2>
            <p className="hx17-texto">{c.texto}</p>
            <span className="hx17-flecha" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero17Page;
