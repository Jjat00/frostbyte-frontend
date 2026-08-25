import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero18.css";

/* Opción 18 — "El puesto de mando"
   La app enseñada como lo que es: una herramienta con su navegación a un
   lado y tu estado al otro. En escritorio son tres columnas —rail, centro y
   panel de estado— que llenan la pantalla; en móvil el rail se convierte en
   una fila de accesos y el estado baja al final.
   Tipografía: Instrument Sans + Martian Mono.

   El panel de estado muestra los vacíos de verdad (aún no has pedido, aún
   no tienes reserva): es lo que verá quien entre por primera vez, y cada
   vacío dice qué hacer. */

const RAIL = [
  { nombre: "Carta", to: "/", activo: true },
  { nombre: "Domicilios", to: "/domicilios" },
  { nombre: "Mi cuenta", to: "/mi-cuenta" },
  { nombre: "Reservas", to: "/reservas" },
  { nombre: "Juegos", to: "/game" },
  { nombre: "Pedir canción", to: "/#solicitar-cancion" },
];

const ACCESOS = [
  {
    nombre: "Pedir a domicilio",
    texto: "Hasta tu puerta, 1,5 km a la redonda. Pagas al recibir.",
    to: "/domicilios",
    tono: "mag",
  },
  {
    nombre: "Reservar mesa",
    texto: "Mesa, grupo o Sala VIP. Pides la hora y te la confirmamos.",
    to: "/reservas",
    tono: "cyan",
  },
  {
    nombre: "Abrir un juego",
    texto: "Duelo e Impostor: creas la sala y pasas el código al parche.",
    to: "/game",
    tono: "cyan",
  },
];

const ESTADO = [
  {
    titulo: "Pedidos",
    vacio: "Todavía no has pedido nada.",
    accion: "Ver domicilios",
    to: "/domicilios",
  },
  {
    titulo: "Reservas",
    vacio: "No tienes ninguna mesa apartada.",
    accion: "Pedir una hora",
    to: "/reservas",
  },
  {
    titulo: "Tu mesa",
    vacio: "Escanea el QR de la mesa y la carta se abre con ella puesta.",
    accion: "Ver la carta",
    to: "/",
  },
];

const Hero18Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Martian+Mono:wght@400;600&display=swap",
  );

  return (
    <div className="hx18">
      <div className="hx18-app">
        <nav className="hx18-rail" aria-label="Secciones de la app">
          <span className="hx18-logo">Frostbyte</span>
          <ul>
            {RAIL.map((r) => (
              <li key={r.nombre}>
                <Link
                  to={r.to}
                  className={r.activo ? "is-activo" : undefined}
                  aria-current={r.activo ? "page" : undefined}
                >
                  {r.nombre}
                </Link>
              </li>
            ))}
          </ul>
          <p className="hx18-rail-pie">Cra. 8 #18-13 · Cumbal</p>
        </nav>

        <main className="hx18-centro">
          <p className="hx18-eyebrow">Bienvenido</p>
          <h1 className="hx18-title">
            El local abierto,
            <br />
            en tu pantalla
          </h1>
          <p className="hx18-sub">
            La carta completa, domicilios en 1,5 km a la redonda, reservas que
            confirma el equipo y juegos para la mesa. Todo desde aquí.
          </p>

          <div className="hx18-accesos">
            {ACCESOS.map((a) => (
              <Link
                to={a.to}
                key={a.nombre}
                className={`hx18-acceso hx18-${a.tono}`}
              >
                <strong>{a.nombre}</strong>
                <span>{a.texto}</span>
              </Link>
            ))}
          </div>

          <Link to="/" className="hx18-cta">
            Empezar por la carta
          </Link>
        </main>

        <aside className="hx18-estado" aria-label="Tu estado">
          <h2 className="hx18-estado-titulo">Tu estado</h2>
          {ESTADO.map((e) => (
            <article className="hx18-estado-item" key={e.titulo}>
              <h3>{e.titulo}</h3>
              <p>{e.vacio}</p>
              <Link to={e.to}>{e.accion} →</Link>
            </article>
          ))}
          <p className="hx18-estado-pie">
            Entra con Google y esto se llena solo.
          </p>
        </aside>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero18Page;
