import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./heroSwitch.css";

// Selector flotante para comparar las 20 opciones de hero del rebranding.
// Es una herramienta de revisión interna: se retira junto con las páginas
// /heroN cuando se elija una dirección.
//
// 1–10: primera tanda (mobile-first, cada una con un referente distinto).
// 11–20: segunda tanda (layout propio de escritorio + los servicios de la
// app visibles en el propio hero).
const TOTAL = 20;

const HeroSwitch = () => {
  const { pathname } = useLocation();

  return (
    <nav className="hxsw" aria-label="Opciones de hero">
      <Link to="/" className="hxsw-home">
        Carta actual
      </Link>
      <div className="hxsw-nums">
        {Array.from({ length: TOTAL }, (_, i) => {
          const path = `/hero${i + 1}`;
          return (
            <Link
              key={path}
              to={path}
              className={`hxsw-num ${pathname === path ? "is-active" : ""} ${
                i === 10 ? "hxsw-num-corte" : ""
              }`}
              aria-current={pathname === path ? "page" : undefined}
            >
              {i + 1}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default HeroSwitch;
