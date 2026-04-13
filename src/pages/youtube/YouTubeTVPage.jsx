import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { youtubeService } from "@/services/youtube.service";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Pagina TV - Se abre en la pantalla del local.
 * - Modo "queue": reproduce videos solicitados, uno por uno.
 * - Modo "mix": cuando la cola esta vacia, reproduce el Mix de YouTube
 *   (radio auto-generada) basado en el ultimo video solicitado. Asi siempre
 *   hay algo sonando.
 */
const YouTubeTVPage = () => {
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);
  const [current, setCurrent] = useState(null);
  // current: { video_id, title, mode: 'queue' | 'mix' }
  const sendMessageRef = useRef(null);
  const modeRef = useRef("idle");

  // Cargar IFrame API
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

  // WebSocket
  const handleWsMessage = useCallback(
    (data) => {
      if (data.type === "play_video" && data.video_id) {
        setCurrent({
          video_id: data.video_id,
          title: data.title || "",
          mode: "queue",
        });
      } else if (data.type === "player_control") {
        if (!playerRef.current) return;
        if (data.action === "pause") playerRef.current.pauseVideo?.();
        else if (data.action === "resume") playerRef.current.playVideo?.();
      } else if (data.type === "youtube_changed") {
        queryClient.invalidateQueries({ queryKey: ["youtube-now-playing"] });
      }
    },
    [queryClient]
  );

  const { sendMessage } = useWebSocket("/ws/youtube/", {
    onMessage: handleWsMessage,
    enabled: true,
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    modeRef.current = current?.mode || "idle";
  }, [current?.mode]);

  // Sincronizar con now-playing; si no hay, iniciar Mix con el ultimo reproducido
  useEffect(() => {
    // Hay un video solicitado actualmente
    if (nowPlaying?.video_id) {
      if (current?.video_id !== nowPlaying.video_id || current?.mode !== "queue") {
        setCurrent({
          video_id: nowPlaying.video_id,
          title: nowPlaying.title,
          mode: "queue",
        });
      }
      return;
    }

    // No hay nada en cola y ya estamos en mix - no hacer nada
    if (current?.mode === "mix") return;

    // Buscar el ultimo reproducido para iniciar el Mix
    let cancelled = false;
    (async () => {
      try {
        const last = await youtubeService.getLastPlayed();
        if (cancelled) return;
        if (last?.video_id) {
          setCurrent({
            video_id: last.video_id,
            title: last.title,
            mode: "mix",
          });
        }
      } catch {
        // no hay ningun video previo, el TV queda en idle
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nowPlaying?.video_id, current?.mode, current?.video_id]);

  // Crear / actualizar el reproductor
  useEffect(() => {
    if (!apiReady || !current?.video_id || !playerContainerRef.current) return;

    const isMix = current.mode === "mix";
    const mixListId = `RD${current.video_id}`;

    // Si ya hay player, actualizar sin destruir
    if (playerRef.current) {
      try {
        if (isMix) {
          playerRef.current.loadPlaylist?.({
            list: mixListId,
            listType: "playlist",
            index: 0,
          });
        } else {
          playerRef.current.loadVideoById?.(current.video_id);
        }
      } catch {
        // fallback: recrear
      }
      return;
    }

    const playerVars = {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    };

    if (isMix) {
      playerVars.listType = "playlist";
      playerVars.list = mixListId;
    }

    const playerConfig = {
      playerVars,
      events: {
        onReady: (event) => {
          event.target.playVideo();
        },
        onStateChange: (event) => {
          if (event.data !== window.YT.PlayerState.ENDED) return;

          if (modeRef.current === "queue") {
            // Notificar fin + pedir siguiente
            sendMessageRef.current?.({
              type: "video_ended",
              video_id: current.video_id,
            });
            youtubeService.playerNext().catch(() => {});
          }
          // Si es mix, la playlist avanza sola
        },
        onError: () => {
          if (modeRef.current === "queue") {
            youtubeService.playerNext().catch(() => {});
          } else if (modeRef.current === "mix" && playerRef.current) {
            // En mix, saltar al siguiente video del playlist
            try {
              playerRef.current.nextVideo?.();
            } catch {
              // ignore
            }
          }
        },
      },
    };

    // Solo incluir videoId en modo queue; en mix la playlist se carga via playerVars.list
    if (!isMix) {
      playerConfig.videoId = current.video_id;
    }

    playerRef.current = new window.YT.Player(playerContainerRef.current, playerConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, current?.video_id, current?.mode]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // noop
        }
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {current?.video_id ? (
        <>
          <div className="absolute inset-0">
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>
          {current.mode === "mix" && (
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-bold flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              MIX AUTOMATICO
            </div>
          )}
        </>
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
