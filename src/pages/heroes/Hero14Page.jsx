import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero14.css";

/* Opción 14 — "Wallet"
   Referente: la cartera del teléfono, donde las tarjetas viven apiladas y
   se abren al tocarlas. Cada servicio de la app es una tarjeta: en móvil se
   apilan y la elegida se despliega; en escritorio la pila se abre en abanico
   y ocupa el ancho. Tipografía: Anybody + Figtree. */

const TARJETAS = [
  {
    id: "carta",
    nombre: "Carta",
    dato: "Piso 2 y 3",
    texto: "Granizados, frappés, cocteles y shots, con fotos y precios.",
    accion: "Ver la carta",
    to: "/",
    tono: "mag",
  },
  {
    id: "domicilios",
    nombre: "Domicilios",
    dato: "1,5 km",
    texto: "Armas el pedido y llega a tu puerta. Pagas al recibir.",
    accion: "Pedir a domicilio",
    to: "/domicilios",
    tono: "cyan",
  },
  {
    id: "cuenta",
    nombre: "Mi cuenta",
    dato: "En vivo",
    texto: "Sigues tu pedido paso a paso y guardas tus reservas.",
    accion: "Entrar con Google",
    to: "/mi-cuenta",
    tono: "mag",
  },
  {
    id: "reservas",
    nombre: "Reservas",
    dato: "Mesa · VIP",
    texto: "Pides la hora que quieres y el equipo te la confirma.",
    accion: "Pedir una mesa",
    to: "/reservas",
    tono: "cyan",
  },
  {
    id: "juegos",
    nombre: "Juegos",
    dato: "Con código",
    texto: "Duelo e Impostor: creas la sala y tu parche entra desde el celular.",
    accion: "Crear una sala",
    to: "/game",
    tono: "mag",
  },
  {
    id: "musica",
    nombre: "Pedir canción",
    dato: "Tu piso",
    texto: "Pides la canción y suena donde estás sentado.",
    accion: "Pedir una canción",
    to: "/#solicitar-cancion",
    tono: "cyan",
  },
];

const Hero14Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@100,700;100,800&family=Figtree:wght@400;500;600;700&display=swap",
  );
  const [abierta, setAbierta] = useState("carta");

  return (
    <div className="hx14">
      <div className="hx14-wrap">
        <header className="hx14-head">
          <p className="hx14-eyebrow">Frostbyte · Cumbal, Nariño</p>
          <h1 className="hx14-title">Tu Frostbyte, en tarjetas</h1>
          <p className="hx14-sub">
            Seis cosas que puedes hacer ahora mismo desde el celular. Toca la
            que necesites.
          </p>
        </header>

        <ul className="hx14-pila">
          {TARJETAS.map((t, i) => (
            <li
              key={t.id}
              className={`hx14-item ${abierta === t.id ? "is-abierta" : ""}`}
              style={{ "--i": i }}
            >
              <div
                className={`hx14-tarjeta hx14-${t.tono}`}
                onMouseEnter={() => setAbierta(t.id)}
              >
                <button
                  type="button"
                  className="hx14-cabecera"
                  onClick={() => setAbierta(t.id)}
                  aria-expanded={abierta === t.id}
                >
                  <span className="hx14-chip" aria-hidden="true" />
                  <span className="hx14-nombre">{t.nombre}</span>
                  <span className="hx14-dato">{t.dato}</span>
                </button>
                <div className="hx14-detalle">
                  <p>{t.texto}</p>
                  <Link to={t.to} className="hx14-accion">
                    {t.accion} →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero14Page;
