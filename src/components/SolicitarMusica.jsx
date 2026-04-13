import React from "react";
import { useQuery } from "@tanstack/react-query";
import { musicService } from "@/services";
import SolicitarCancion from "./SolicitarCancion";
import SolicitarVideo from "./SolicitarVideo";

/**
 * Wrapper que muestra SolicitarCancion (Spotify) o SolicitarVideo (YouTube)
 * segun la configuracion activa del modulo de musica.
 * Default: YouTube
 */
const SolicitarMusica = () => {
  const { data: settings } = useQuery({
    queryKey: ["music-settings"],
    queryFn: () => musicService.getSettings(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Default a YouTube mientras carga
  const source = settings?.source || "youtube";

  if (source === "spotify") {
    return <SolicitarCancion />;
  }

  return <SolicitarVideo />;
};

export default SolicitarMusica;
