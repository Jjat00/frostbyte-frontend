import React from "react";

/**
 * El premio del concurso, o el aviso de que viene en camino.
 *
 * Mientras `contest.prize` esté vacío se anuncia que los premios se revelan
 * pronto: genera expectativa en vez de callar. Al escribir el premio desde
 * el panel de barra, el aviso se cambia solo por el premio.
 */
const PrizeNotice = ({ contest, className = "" }) => {
  if (contest.prize) {
    return (
      <p className={`cz-prize ${className}`}>
        Premio: <span className="cz-prize__value">{contest.prize}</span>
      </p>
    );
  }
  return (
    <p className={`cz-teaser ${className}`}>
      <span className="cz-teaser__mark" aria-hidden="true">?</span>
      <span>
        Premios para los ganadores:{" "}
        <span className="cz-teaser__soon">muy pronto los revelamos</span>
      </span>
    </p>
  );
};

export default PrizeNotice;
