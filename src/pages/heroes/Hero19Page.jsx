import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero19.css";

/* Opción 19 — "La cuenta"
   El objeto más honesto de un local es el recibo, así que el hero es uno:
   cada línea es algo que la app hace y a la derecha va el dato que lo
   sostiene. En escritorio el papel se queda a la izquierda y el mensaje
   ocupa el resto; en móvil el recibo va debajo del titular.
   Tipografía: Courier Prime + Lexend. */

const LINEAS = [
  { nombre: "Carta", dato: "Piso 2 y 3", to: "/" },
  { nombre: "Domicilios", dato: "1,5 km", to: "/domicilios" },
  { nombre: "Mi cuenta", dato: "En vivo", to: "/mi-cuenta" },
  { nombre: "Reservas", dato: "Confirmadas", to: "/reservas" },
  { nombre: "Juegos", dato: "Con código", to: "/game" },
  { nombre: "Pedir canción", dato: "Tu piso", to: "/#solicitar-cancion" },
];

const Hero19Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Lexend:wght@400;500;600;700&display=swap",
  );

  return (
    <div className="hx19">
      <div className="hx19-wrap">
        <section className="hx19-mensaje">
          <p className="hx19-eyebrow">Frostbyte · Cumbal, Nariño</p>
          <h1 className="hx19-title">
            Lo que te
            <br />
            llevas sin
            <br />
            pagar nada
          </h1>
          <p className="hx19-sub">
            La app es gratis y hace el trabajo aburrido: te muestra la carta,
            recibe tu domicilio, aparta tu mesa y te avisa cómo va todo.
          </p>
          <div className="hx19-acciones">
            <Link to="/" className="hx19-cta">
              Ver la carta
            </Link>
            <Link to="/domicilios" className="hx19-cta-soft">
              o pedir a domicilio
            </Link>
          </div>
        </section>

        <section className="hx19-recibo" aria-label="Lo que hace la app">
          <header className="hx19-recibo-head">
            <p className="hx19-recibo-marca">FROSTBYTE</p>
            <p className="hx19-recibo-dir">CRA. 8 #18-13 · CUMBAL, NARIÑO</p>
          </header>

          <p className="hx19-sep" aria-hidden="true" />
          <p className="hx19-recibo-titulo">LO QUE PUEDES HACER HOY</p>
          <p className="hx19-sep" aria-hidden="true" />

          <ul className="hx19-lineas">
            {LINEAS.map((l) => (
              <li key={l.nombre}>
                <Link to={l.to} className="hx19-linea">
                  <span className="hx19-linea-nombre">{l.nombre}</span>
                  <span className="hx19-puntos" aria-hidden="true" />
                  <span className="hx19-linea-dato">{l.dato}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="hx19-sep" aria-hidden="true" />
          <p className="hx19-total">
            <span>TOTAL</span>
            <span>TODO EN UNA APP</span>
          </p>
          <p className="hx19-sep" aria-hidden="true" />

          <footer className="hx19-recibo-pie">
            <p>PAGAS EN EFECTIVO O NEQUI</p>
            <p>GRACIAS POR VENIR</p>
            <span className="hx19-codigo" aria-hidden="true" />
          </footer>
        </section>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero19Page;
