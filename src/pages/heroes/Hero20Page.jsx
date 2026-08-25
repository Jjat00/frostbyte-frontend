import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero20.css";

/* Opción 20 — "La cartelera"
   Frostbyte no vende solo bebida: vende una noche. Así que el hero es la
   marquesina de un teatro y los servicios de la app son la cartelera de lo
   que hay hoy. En escritorio la marquesina ocupa el ancho y la cartelera se
   abre en cuatro columnas; en móvil, dos. Tipografía: Bungee + Cabin. */

const CARTELERA = [
  {
    nombre: "La carta",
    dato: "Siempre en cartel",
    texto: "Granizados, frappés, cocteles, shots y micheladas.",
    to: "/",
    tono: "mag",
  },
  {
    nombre: "Domicilios",
    dato: "Función a domicilio",
    texto: "Hasta tu puerta, 1,5 km a la redonda. Pagas al recibir.",
    to: "/domicilios",
    tono: "cyan",
  },
  {
    nombre: "Mi cuenta",
    dato: "Tu butaca",
    texto: "Tu pedido en vivo y tus reservas, guardados con Google.",
    to: "/mi-cuenta",
    tono: "cyan",
  },
  {
    nombre: "Reservas",
    dato: "Con localidad",
    texto: "Mesa, grupo o Sala VIP. Pides la hora, el equipo confirma.",
    to: "/reservas",
    tono: "mag",
  },
  {
    nombre: "Juegos",
    dato: "Con tu parche",
    texto: "Duelo e Impostor: creas la sala y pasas el código.",
    to: "/game",
    tono: "mag",
  },
  {
    nombre: "Pedir canción",
    dato: "Tú pones la banda sonora",
    texto: "Pides la canción y suena en el piso donde estás.",
    to: "/#solicitar-cancion",
    tono: "cyan",
  },
  {
    nombre: "¿Qué te provoca?",
    dato: "Si no sabes qué pedir",
    texto: "Respondes tres cosas y te recomendamos la bebida.",
    to: "/#que-te-provoca",
    tono: "cyan",
  },
  {
    nombre: "Descuentos",
    dato: "Entradas más baratas",
    texto: "Por seguirnos en redes y por tu cumpleaños.",
    to: "/#descuento-redes",
    tono: "mag",
  },
];

const Hero20Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Bungee&family=Cabin:wght@400;500;600;700&display=swap",
  );

  return (
    <div className="hx20">
      <div className="hx20-wrap">
        <header className="hx20-marquesina">
          <span className="hx20-bombillas" aria-hidden="true" />
          <p className="hx20-encima">Cra. 8 #18-13 · Cumbal, Nariño</p>
          <h1 className="hx20-nombre">Frostbyte</h1>
          <p className="hx20-debajo">Abierto hasta tarde · Piso 2 y 3</p>
        </header>

        <section className="hx20-cartelera">
          <h2 className="hx20-cartelera-titulo">Hoy en cartelera</h2>
          <div className="hx20-grid">
            {CARTELERA.map((c) => (
              <Link to={c.to} key={c.nombre} className={`hx20-func hx20-${c.tono}`}>
                <span className="hx20-func-dato">{c.dato}</span>
                <strong className="hx20-func-nombre">{c.nombre}</strong>
                <span className="hx20-func-texto">{c.texto}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero20Page;
