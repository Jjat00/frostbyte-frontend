import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero12.css";

/* Opción 12 — "El plano"
   El local tiene dos pisos con cosas distintas (bebidas y juegos arriba,
   comida y Sala VIP en el tercero) y las mesas ya viven por piso en la app.
   El hero es ese plano: tocas una zona y te lleva a lo que hay ahí. En
   escritorio el plano ocupa la mitad derecha a tamaño grande; en móvil los
   pisos se apilan bajo el texto. Tipografía: Familjen Grotesk + Chivo Mono. */

const ZONAS = {
  carta: {
    nombre: "Carta",
    piso: "Piso 2",
    texto: "Granizados, frappés, cocteles y shots. Con fotos y precios.",
    to: "/",
  },
  juegos: {
    nombre: "Juegos",
    piso: "Piso 2",
    texto: "Duelo e Impostor: creas la sala y pasas el código a tu parche.",
    to: "/game",
  },
  musica: {
    nombre: "Pedir canción",
    piso: "Piso 2",
    texto: "Pides la canción y suena en el piso donde estás sentado.",
    to: "/#solicitar-cancion",
  },
  comida: {
    nombre: "Frostbyte Food",
    piso: "Piso 3",
    texto: "Salchipapas y comida para acompañar, con su propia carta.",
    to: "/",
  },
  vip: {
    nombre: "Sala VIP",
    piso: "Piso 3",
    texto: "El espacio privado del tercer piso. Se pide por reserva.",
    to: "/reservas",
  },
  reservas: {
    nombre: "Reservas",
    piso: "Piso 2 y 3",
    texto: "Mesa, grupo o Sala VIP: pides la hora y el equipo la confirma.",
    to: "/reservas",
  },
};

const DESDE_CASA = [
  {
    nombre: "Domicilios",
    texto: "Hasta tu puerta, 1,5 km a la redonda.",
    to: "/domicilios",
  },
  {
    nombre: "Mi cuenta",
    texto: "Tu pedido en vivo y tus reservas.",
    to: "/mi-cuenta",
  },
];

const Hero12Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600;700&family=Chivo+Mono:wght@400;600&display=swap",
  );
  const [activa, setActiva] = useState("carta");
  const zona = ZONAS[activa];

  return (
    <div className="hx12">
      <div className="hx12-wrap">
        <section className="hx12-texto">
          <p className="hx12-eyebrow">Frostbyte · Cumbal, Nariño</p>
          <h1 className="hx12-title">
            Dos pisos,
            <br />
            y todo se pide
            <br />
            desde el celular.
          </h1>

          <div className="hx12-detalle" aria-live="polite">
            <span className="hx12-detalle-piso">{zona.piso}</span>
            <strong className="hx12-detalle-nombre">{zona.nombre}</strong>
            <p className="hx12-detalle-texto">{zona.texto}</p>
            <Link to={zona.to} className="hx12-detalle-cta">
              Abrir {zona.nombre.toLowerCase()} →
            </Link>
          </div>

          <div className="hx12-casa">
            <p className="hx12-casa-label">¿No vienes? También desde casa</p>
            <div className="hx12-casa-tiles">
              {DESDE_CASA.map((d) => (
                <Link to={d.to} key={d.nombre} className="hx12-casa-tile">
                  <strong>{d.nombre}</strong>
                  <span>{d.texto}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hx12-plano" aria-label="Plano del local por pisos">
          <article className="hx12-piso">
            <header className="hx12-piso-head">
              <span className="hx12-piso-num">3</span>
              <span className="hx12-piso-nombre">Comida y Sala VIP</span>
            </header>
            <div className="hx12-piso-grid hx12-piso-grid-3">
              {["comida", "vip", "reservas"].map((k) => (
                <button
                  type="button"
                  key={k}
                  className={`hx12-zona hx12-zona-${k} ${
                    activa === k ? "is-activa" : ""
                  }`}
                  onMouseEnter={() => setActiva(k)}
                  onFocus={() => setActiva(k)}
                  onClick={() => setActiva(k)}
                  aria-pressed={activa === k}
                >
                  {ZONAS[k].nombre}
                </button>
              ))}
            </div>
          </article>

          <article className="hx12-piso">
            <header className="hx12-piso-head">
              <span className="hx12-piso-num">2</span>
              <span className="hx12-piso-nombre">Bebidas, mesas y juego</span>
            </header>
            <div className="hx12-piso-grid hx12-piso-grid-2">
              {["carta", "juegos", "musica"].map((k) => (
                <button
                  type="button"
                  key={k}
                  className={`hx12-zona hx12-zona-${k} ${
                    activa === k ? "is-activa" : ""
                  }`}
                  onMouseEnter={() => setActiva(k)}
                  onFocus={() => setActiva(k)}
                  onClick={() => setActiva(k)}
                  aria-pressed={activa === k}
                >
                  {ZONAS[k].nombre}
                </button>
              ))}
            </div>
            <p className="hx12-qr">
              El QR de tu mesa abre la carta con tu mesa ya puesta.
            </p>
          </article>
        </section>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero12Page;
