import React from "react";
import { cn } from "@/lib/utils";

/**
 * Bandera de un pais renderizada como imagen (flagcdn.com).
 *
 * Usamos imagenes en vez de emojis porque los emojis de bandera NO se
 * renderizan en Windows (muestran el codigo de 2 letras). flagcdn usa
 * codigos ISO-3166-1 alpha-2 en minuscula (y subdivisiones como gb-eng).
 *
 * Props:
 *  - iso2: codigo ISO-2 en minuscula (ej. "co", "mx", "gb-eng").
 *  - name: nombre del pais (alt + title).
 *  - size: ancho en px (alto se calcula a 3:4). Default 32.
 *  - className / rounded: estilos extra.
 */
const widthBucket = (size) => {
  if (size <= 20) return 40;
  if (size <= 40) return 80;
  if (size <= 80) return 160;
  return 320;
};

const Flag = ({ iso2, name, size = 32, className, rounded = "rounded-[3px]" }) => {
  const height = Math.round((size * 3) / 4);

  if (!iso2) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center bg-white/10 text-[9px] font-bold text-gray",
          rounded,
          className
        )}
        style={{ width: size, height }}
        title={name}
      >
        {(name || "?").slice(0, 2).toUpperCase()}
      </span>
    );
  }

  const w = widthBucket(size);
  return (
    <img
      src={`https://flagcdn.com/w${w}/${iso2}.png`}
      srcSet={`https://flagcdn.com/w${w * 2}/${iso2}.png 2x`}
      alt={name || iso2}
      title={name}
      loading="lazy"
      width={size}
      height={height}
      className={cn(
        "object-cover shadow-sm ring-1 ring-white/10",
        rounded,
        className
      )}
      style={{ width: size, height }}
    />
  );
};

export default Flag;
