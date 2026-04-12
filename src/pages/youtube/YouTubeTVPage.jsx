import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { youtubeService } from "@/services/youtube.service";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Pagina TV - Se abre en la pantalla del local.
 * Reproduce videos de YouTube en secuencia usando la IFrame API.
 * Escucha via WebSocket comandos de reproduccion y notifica cuando un video termina.
 */
const YouTubeTVPage = () => {
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const sendMessageRef = useRef(null);

  // Cargar la IFrame API de YouTube una vez
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, []);

  // Consultar el video actual
  const { data: nowPlaying } = useQuery({
    queryKey: ["youtube-now-playing"],
    queryFn: async () => {
      try {
        return await youtubeService.getNowPlaying();
      } catch {
        return null;
      }
    },
    refetchInterval: 5000,
  });

  // WebSocket para recibir comandos del admin
  const handleWsMessage = useCallback((data) => {
    if (data.type === "play_video" && data.video_id) {
      setCurrentVideo({ video_id: data.video_id, title: data.title || "" });
    } else if (data.type === "player_control") {
      if (!playerRef.current) return;
      if (data.action === "pause") playerRef.current.pauseVideo?.();
      else if (data.action === "resume") playerRef.current.playVideo?.();
    } else if (data.type === "youtube_changed") {
      queryClient.invalidateQueries({ queryKey: ["youtube-now-playing"] });
      queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
    }
  }, [queryClient]);

  const { sendMessage } = useWebSocket("/ws/youtube/", {
    onMessage: handleWsMessage,
    enabled: true,
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Sincronizar con el now-playing de la API si no hay video local
  useEffect(() => {
    if (nowPlaying && nowPlaying.video_id && !currentVideo) {
      setCurrentVideo({
        video_id: nowPlaying.video_id,
        title: nowPlaying.title,
      });
    }
  }, [nowPlaying, currentVideo]);

  // Crear / actualizar el reproductor cuando cambia el video
  useEffect(() => {
    if (!apiReady || !currentVideo?.video_id || !playerContainerRef.current) return;

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentVideo.video_id);
      return;
    }

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId: currentVideo.video_id,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
        },
        onStateChange: (event) => {
          // 0 = ended
          if (event.data === window.YT.PlayerState.ENDED) {
            sendMessageRef.current?.({
              type: "video_ended",
              video_id: currentVideo.video_id,
            });
            // Pedir el siguiente
            youtubeService.playerNext().catch(() => {});
          }
        },
        onError: () => {
          // Si falla un video, saltamos al siguiente
          youtubeService.playerNext().catch(() => {});
        },
      },
    });

    return () => {
      // Nota: destruir el player al desmontar el componente completo
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // noop
        }
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, currentVideo?.video_id]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {currentVideo?.video_id ? (
        <div className="absolute inset-0">
          <div ref={playerContainerRef} className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-8" />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              FROSTBYTE TV
            </span>
          </h1>
          <p className="text-white/60 text-lg md:text-2xl max-w-2xl">
            Esperando solicitudes de video...
          </p>
          <p className="text-white/30 text-sm md:text-base mt-8">
            Los videos aparecen aqui automaticamente cuando son solicitados
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeTVPage;
