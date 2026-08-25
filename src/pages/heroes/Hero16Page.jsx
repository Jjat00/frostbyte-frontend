import React from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero16.css";

/* Opción 16 — "La bifurcación"
   Cuando alguien abre la app solo hay dos situaciones: está viniendo al
   local o quiere que le llevemos. El hero pregunta eso y detrás de cada
   respuesta pone lo que la app hace en ese caso. En escritorio son dos
   mitades a pantalla completa que crecen al acercarte; en móvil, dos
   bloques apilados. Tipografía: Unbounded + Hanken Grotesk. */

const LADOS = [
  {
    id: "local",
    pregunta: "Voy al local",
    tono: "mag",
    items: [
      {
        nombre: "La carta, con tu mesa puesta",
        texto: "El QR de la mesa abre la carta y ya sabemos dónde estás.",
      },
      {
        nombre: "Reservas",
        texto: "Mesa, grupo o Sala VIP: pides la hora y te la confirmamos.",
      },
      {
        nombre: "Juegos",
        texto: "Duelo e Impostor: creas la sala y pasas el código.",
      },
      {
        nombre: "Pedir canción",
        texto: "Eliges lo que suena en tu piso.",
      },
    ],
    cta: { label: "Ver la carta", to: "/" },
    segundo: { label: "Reservar mesa", to: "/reservas" },
  },
  {
    id: "casa",
    pregunta: "Pido a casa",
    tono: "cyan",
    items: [
      {
        nombre: "Domicilios",
        texto: "Hasta tu puerta, 1,5 km a la redonda del local.",
      },
      {
        nombre: "Tu pedido en vivo",
        texto: "Ves cada paso, desde que entra hasta que sale.",
      },
      {
        nombre: "Mi cuenta",
        texto: "Entras con Google y quedan guardados pedidos y reservas.",
      },
      {
        nombre: "Pagas al recibir",
        texto: "Efectivo o Nequi, sin datos de tarjeta.",
      },
    ],
    cta: { label: "Pedir a domicilio", to: "/domicilios" },
    segundo: { label: "Entrar a mi cuenta", to: "/mi-cuenta" },
  },
];

const Hero16Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  );

  return (
    <div className="hx16">
      <header className="hx16-head">
        <span className="hx16-marca">Frostbyte</span>
        <h1 className="hx16-pregunta">¿Vienes o pedimos?</h1>
      </header>

      <div className="hx16-split">
        {LADOS.map((lado) => (
          <section key={lado.id} className={`hx16-lado hx16-${lado.tono}`}>
            <h2 className="hx16-lado-titulo">{lado.pregunta}</h2>
            <ul className="hx16-items">
              {lado.items.map((it) => (
                <li key={it.nombre}>
                  <strong>{it.nombre}</strong>
                  <span>{it.texto}</span>
                </li>
              ))}
            </ul>
            <div className="hx16-acciones">
              <Link to={lado.cta.to} className="hx16-cta">
                {lado.cta.label}
              </Link>
              <Link to={lado.segundo.to} className="hx16-cta-soft">
                {lado.segundo.label}
              </Link>
            </div>
          </section>
        ))}
      </div>

      <HeroSwitch />
    </div>
  );
};

export default Hero16Page;
