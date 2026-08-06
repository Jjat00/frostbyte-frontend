import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ruta de "la carta" para el cliente que está navegando ahora.
 *
 * Quien entra por el QR de una mesa cae en `/mesa/:piso/:numero`, y ese piso y
 * ese número **solo existen en la URL**: no hay sesión ni cuenta de donde
 * sacarlos. Si al volver de Domicilios o de Mi cuenta lo mandáramos a `/`, el
 * cliente perdería el seguimiento de su pedido de mesa y pediría canción a la
 * cuenta de Spotify del piso equivocado.
 *
 * Por eso la mesa se recuerda mientras dure la visita:
 * - `sessionStorage`, no `localStorage`: la mesa muere con la pestaña. Nadie
 *   debe volver a "su mesa" tres días después desde su casa.
 * - Además caduca a las 6 horas, por si el navegador móvil conserva la pestaña
 *   abierta días: ninguna visita al local dura tanto.
 */

const KEY = "frostbyte_last_table_route";
const TTL_MS = 6 * 60 * 60 * 1000;

export const isTablePath = (pathname) => pathname.startsWith("/mesa/");

const readRemembered = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { path, ts } = JSON.parse(raw);
    if (!path || !ts || Date.now() - ts > TTL_MS) return null;
    return path;
  } catch {
    // Modo incógnito o storage bloqueado: se sigue sin memoria, no se rompe
    return null;
  }
};

const remember = (path) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now() }));
  } catch {
    /* sin storage no hay nada que hacer */
  }
};

export function useCartaPath() {
  const { pathname } = useLocation();
  const isTableRoute = isTablePath(pathname);
  const [remembered, setRemembered] = useState(readRemembered);

  useEffect(() => {
    if (!isTableRoute) return;
    remember(pathname);
    setRemembered(pathname);
  }, [isTableRoute, pathname]);

  return {
    /** A dónde lleva "Carta": la mesa de esta visita, o la carta pública */
    cartaPath: isTableRoute ? pathname : remembered || "/",
    /** El cliente está viendo la carta de una mesa ahora mismo */
    isTableRoute,
  };
}

export default useCartaPath;
