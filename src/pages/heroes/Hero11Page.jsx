import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero11.css";

/* Opción 11 — "Tablero de salidas"
   Referente: el tablero split-flap de un aeropuerto. Cada servicio de la app
   es una salida con su estado, así que el valor completo se lee en una sola
   pantalla. En escritorio ocupa el ancho como una tabla de verdad; en móvil
   cada salida se pliega en dos líneas. Tipografía: Oswald + Azeret Mono. */

const SALIDAS = [
  {
    cod: "CAR",
    servicio: "Carta",
    dato: "Piso 2 y 3",
    estado: "ABIERTA",
    to: "/",
    tono: "cyan",
  },
  {
    cod: "DOM",
    servicio: "Domicilios",
    dato: "1,5 km a la redonda",
    estado: "PIDIENDO",
    to: "/domicilios",
    tono: "mag",
  },
  {
    cod: "CTA",
    servicio: "Mi cuenta",
    dato: "Pedidos y reservas",
    estado: "EN VIVO",
    to: "/mi-cuenta",
    tono: "cyan",
  },
  {
    cod: "RES",
    servicio: "Reservas",
    dato: "Mesa, grupo o Sala VIP",
    estado: "POR CONFIRMAR",
    to: "/reservas",
    tono: "mag",
  },
  {
    cod: "JUE",
    servicio: "Juegos",
    dato: "Duelo e Impostor",
    estado: "SALA LIBRE",
    to: "/game",
    tono: "cyan",
  },
  {
    cod: "MUS",
    servicio: "Pedir canción",
    dato: "Suena en tu piso",
    estado: "SONANDO",
    to: "/#solicitar-cancion",
    tono: "mag",
  },
];

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

/* El texto aterriza como en un split-flap: unos cuantos giros y se detiene.
   Cada fila arranca un poco más tarde, así el tablero "cae" en cascada. */
const useSplitFlap = (textos, pasoMs = 55, giros = 7) => {
  const [visibles, setVisibles] = useState(() => textos.map(() => ""));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibles(textos);
      return;
    }
    let tick = 0;
    const total = giros + textos.length;
    const id = setInterval(() => {
      tick += 1;
      setVisibles(
        textos.map((texto, fila) => {
          const avance = tick - fila;
          if (avance >= giros) return texto;
          if (avance <= 0) return "";
          return texto
            .split("")
            .map((ch) =>
              ch === " "
                ? " "
                : ALFABETO[Math.floor(Math.random() * ALFABETO.length)],
            )
            .join("");
        }),
      );
      if (tick > total) clearInterval(id);
    }, pasoMs);
    return () => clearInterval(id);
  }, [textos, pasoMs, giros]);

  return visibles;
};

const ESTADOS = SALIDAS.map((s) => s.estado);

const Hero11Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Azeret+Mono:wght@400;500;700&display=swap",
  );
  const estados = useSplitFlap(ESTADOS);

  return (
    <div className="hx11">
      <div className="hx11-wrap">
        <header className="hx11-head">
          <div>
            <h1 className="hx11-marca">Frostbyte</h1>
            <p className="hx11-lugar">Cra. 8 #18-13 · Cumbal, Nariño</p>
          </div>
          <p className="hx11-lema">
            Todo lo que puedes hacer desde el celular, en una pantalla.
          </p>
        </header>

        <div className="hx11-tablero">
          <div className="hx11-thead" aria-hidden="true">
            <span>Cód.</span>
            <span>Servicio</span>
            <span>Detalle</span>
            <span>Estado</span>
            <span />
          </div>

          <ul className="hx11-filas">
            {SALIDAS.map((s, i) => (
              <li key={s.cod}>
                <Link to={s.to} className={`hx11-fila hx11-${s.tono}`}>
                  <span className="hx11-cod">{s.cod}</span>
                  <span className="hx11-servicio">{s.servicio}</span>
                  <span className="hx11-dato">{s.dato}</span>
                  <span className="hx11-estado">
                    <span className="hx11-flap">{estados[i]}</span>
                  </span>
                  <span className="hx11-ir" aria-hidden="true">
                    Entrar →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <footer className="hx11-foot">
          <span>Efectivo y Nequi</span>
          <span>Piso 2 · bebidas · Piso 3 · comida y Sala VIP</span>
          <span>Abierto hasta tarde</span>
        </footer>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero11Page;
