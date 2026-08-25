import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSwitch from "./HeroSwitch";
import { useGoogleFonts } from "./useGoogleFonts";
import "./hero6.css";

/* Opción 6 — "Chat"
   Referente: pedir por WhatsApp, que en Frostbyte ya es real (agente de
   pedidos). El hero es una conversación que se escribe sola y termina en
   el CTA de WhatsApp. Tipografía: DM Sans. */

const RESPUESTAS = {
  "Un granizado": "Buena. Maracuyá, mora o mango: en la carta están todos.",
  "Algo con alcohol": "Cocteles, shots o una michelada bien fría. Tú mandas.",
  Sorpréndeme: "El Desguayabator no falla. Confía.",
};

const OPCIONES = Object.keys(RESPUESTAS);

const hora = () =>
  new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const Hero6Page = () => {
  useGoogleFonts(
    "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap",
  );
  const [stage, setStage] = useState(0);
  const [eleccion, setEleccion] = useState(null);
  const [ts] = useState(hora);

  // Guion: 0 escribe → 1 saludo → 2 pregunta + opciones → 3 elección del
  // cliente → 4 respuesta → 5 cierre con CTA. La elección la hace el
  // visitante; si no toca nada, el demo elige solo a los 6 s.
  useEffect(() => {
    const avances = { 0: 900, 1: 1100, 3: 1300, 4: 1100 };
    if (stage in avances) {
      const id = setTimeout(() => setStage((s) => s + 1), avances[stage]);
      return () => clearTimeout(id);
    }
    if (stage === 2) {
      const id = setTimeout(() => elegir(OPCIONES[0]), 6000);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const elegir = (opcion) => {
    setEleccion((prev) => prev ?? opcion);
    setStage((s) => (s === 2 ? 3 : s));
  };

  const escribiendo = stage === 0 || stage === 3;

  return (
    <div className="hx6">
      <header className="hx6-head">
        <span className="hx6-avatar" aria-hidden="true">
          F
        </span>
        <div>
          <strong>Frostbyte</strong>
          <span className="hx6-estado">
            <i aria-hidden="true" /> en línea
          </span>
        </div>
      </header>

      <main className="hx6-chat" aria-live="polite">
        {stage >= 1 && (
          <div className="hx6-msg hx6-in">
            ¡Hola! Soy Byte, el de los granizados 👋
            <span className="hx6-ts">{ts}</span>
          </div>
        )}
        {stage >= 2 && (
          <div className="hx6-msg hx6-in">
            ¿Qué se te antoja hoy?
            <span className="hx6-ts">{ts}</span>
          </div>
        )}
        {stage === 2 && (
          <div className="hx6-replies">
            {OPCIONES.map((op) => (
              <button
                key={op}
                type="button"
                className="hx6-reply"
                onClick={() => elegir(op)}
              >
                {op}
              </button>
            ))}
          </div>
        )}
        {stage >= 3 && eleccion && (
          <div className="hx6-msg hx6-out">
            {eleccion}
            <span className="hx6-ts">{ts}</span>
          </div>
        )}
        {stage >= 4 && eleccion && (
          <div className="hx6-msg hx6-in">
            {RESPUESTAS[eleccion]}
            <span className="hx6-ts">{ts}</span>
          </div>
        )}
        {stage >= 5 && (
          <>
            <div className="hx6-msg hx6-in">
              ¿Te lo llevamos? Llegamos hasta 1,5 km a la redonda en Cumbal.
              <span className="hx6-ts">{ts}</span>
            </div>
            <div className="hx6-ctas">
              <a
                href="https://wa.me/573164277879"
                target="_blank"
                rel="noopener noreferrer"
                className="hx6-cta"
              >
                Pedir por WhatsApp
              </a>
              <Link to="/" className="hx6-cta-ghost">
                Ver la carta
              </Link>
            </div>
          </>
        )}
        {escribiendo && (
          <div className="hx6-msg hx6-in hx6-typing" aria-label="Escribiendo">
            <i />
            <i />
            <i />
          </div>
        )}
      </main>

      <HeroSwitch />
    </div>
  );
};

export default Hero6Page;
