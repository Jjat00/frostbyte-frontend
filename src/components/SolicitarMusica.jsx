import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { musicService } from "@/services";

// Cada variante va en su propio chunk: fuera del JS inicial de la carta.
const SolicitarCancion = React.lazy(() => import("./SolicitarCancion"));
const SolicitarVideo = React.lazy(() => import("./SolicitarVideo"));

// Última fuente conocida (spotify | youtube): con ella la sección se pinta
// de una vez en la siguiente visita, sin esperar a /music-settings/.
const SOURCE_KEY = "frostbyte_music_source";
const readSource = () => {
  try {
    const v = localStorage.getItem(SOURCE_KEY);
    return v === "spotify" || v === "youtube" ? v : null;
  } catch {
    return null;
  }
};

/**
 * Wrapper que muestra SolicitarCancion (Spotify) o SolicitarVideo (YouTube)
 * segun la configuracion activa del modulo de musica.
 *
 * floor: piso conocido con certeza (viene de la URL de mesa /mesa/:floor/:mesa).
 * Sin floor (carta publica), SolicitarCancion muestra tabs para elegir piso.
 *
 * Pensado para celulares de gama baja: la sección está al final de la carta,
 * así que no se monta (ni consulta, ni abre WebSocket, ni baja el fondo) hasta
 * que el cliente se acerca; y con la sección lejos de la pantalla se apagan
 * los sondeos y el WebSocket.
 */
const SolicitarMusica = ({ floor }) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    // Margen amplio: al llegar, los datos ya están o casi.
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "1000px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { data: settings } = useQuery({
    queryKey: ["music-settings"],
    queryFn: () => musicService.getSettings(),
    enabled: mounted,
    staleTime: 30000,
    refetchInterval: active ? 60000 : false,
  });

  useEffect(() => {
    if (!settings?.source) return;
    try {
      localStorage.setItem(SOURCE_KEY, settings.source);
    } catch {
      // Sin almacenamiento solo se pierde el atajo de la próxima visita.
    }
  }, [settings?.source]);

  // Antes se asumía YouTube mientras cargaba: con Spotify activo la sección
  // se montaba dos veces (y abría dos WebSocket). Ahora, sin fuente conocida,
  // se reserva el espacio y se espera.
  const source = settings?.source || readSource();

  // Mismo id y alto que la sección real: los enlaces #solicitar-cancion
  // aterrizan en su sitio y la página no salta al montarla.
  const placeholder = <section id="solicitar-cancion" className="fb-section min-h-[80vh]" aria-busy="true" />;

  let content = placeholder;
  if (mounted && source === "spotify") content = <SolicitarCancion floor={floor} active={active} />;
  else if (mounted && source === "youtube") content = <SolicitarVideo active={active} />;

  return (
    <div ref={ref}>
      <React.Suspense fallback={placeholder}>{content}</React.Suspense>
    </div>
  );
};

export default SolicitarMusica;
