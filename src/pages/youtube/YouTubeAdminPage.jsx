import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Play,
  Plus,
  SkipForward,
  Pause,
  PlayCircle,
  Trash2,
  Tv,
  Youtube,
  Loader2,
  Sparkles,
  Gauge,
} from "lucide-react";
import { youtubeService } from "@/services/youtube.service";
import { useWebSocket } from "@/hooks/useWebSocket";

/**
 * Convierte ISO 8601 (ej: PT4M30S) a formato legible (4:30)
 */
const formatDuration = (iso) => {
  if (!iso) return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, h, m, s] = match;
  const hh = h ? parseInt(h) : 0;
  const mm = m ? parseInt(m) : 0;
  const ss = s ? parseInt(s) : 0;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
};

// Proxima renovacion de cuota: medianoche hora Pacifico (UTC-8) = 03:00 UTC-5
const resetTimeColombia = () => {
  const now = new Date();
  // Medianoche Pacifico = 8am UTC. En UTC-5 son las 3am.
  const nextResetUTC = new Date(now);
  nextResetUTC.setUTCHours(8, 0, 0, 0);
  if (nextResetUTC <= now) {
    nextResetUTC.setUTCDate(nextResetUTC.getUTCDate() + 1);
  }
  // Formato hora Colombia (UTC-5)
  return nextResetUTC.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const QuotaBar = ({ quota }) => {
  const pct = quota.percentage || 0;
  const isExhausted = quota.remaining <= 0;
  const color =
    isExhausted || pct >= 90
      ? "bg-red-500"
      : pct >= 70
      ? "bg-yellow-500"
      : "bg-green-500";
  const textColor =
    isExhausted || pct >= 90
      ? "text-red-400"
      : pct >= 70
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="mb-6 rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Gauge className={`w-4 h-4 ${textColor}`} />
          <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">
            Cuota YouTube hoy
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-bold ${textColor}`}>
            {quota.used.toLocaleString("es-CO")}
          </span>
          <span className="text-white/40">/</span>
          <span className="text-white/70">
            {quota.limit.toLocaleString("es-CO")}
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/60">
            {quota.remaining.toLocaleString("es-CO")} restantes
          </span>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {isExhausted ? (
        <p className="mt-2 text-xs text-red-400">
          Cuota agotada. Se renueva hoy a las {resetTimeColombia()} (hora Colombia).
        </p>
      ) : pct >= 90 ? (
        <p className="mt-2 text-xs text-yellow-400">
          Queda poca cuota. Se renueva a las {resetTimeColombia()} (hora Colombia).
        </p>
      ) : null}
    </div>
  );
};

const VideoResultCard = ({ video, onPlay, onAdd }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition">
    <img
      src={video.thumbnail}
      alt={video.title}
      className="w-24 h-14 md:w-32 md:h-20 rounded object-cover shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm md:text-base line-clamp-2">
        {video.title}
      </p>
      <p className="text-white/50 text-xs md:text-sm truncate">
        {video.channel_name} · {formatDuration(video.duration)}
      </p>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => onPlay(video)}
        className="p-2 rounded-lg bg-primary/20 hover:bg-primary/40 transition"
        title="Reproducir ahora"
      >
        <Play className="w-4 h-4" />
      </button>
      <button
        onClick={() => onAdd(video)}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
        title="Agregar a cola"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const YouTubeAdminPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce busqueda (1s + min 3 caracteres para reducir consumo de cuota)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 1000);
    return () => clearTimeout(timer);
  }, [query]);

  // Busqueda YouTube
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["youtube-search", debouncedQuery],
    queryFn: () => youtubeService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    staleTime: 60000,
  });

  // Estado de cuota
  const { data: quotaStatus } = useQuery({
    queryKey: ["youtube-quota-status"],
    queryFn: () => youtubeService.getQuotaStatus(),
    refetchInterval: 30000,
  });

  // Recomendaciones (se muestran cuando no hay busqueda)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ["youtube-recommendations"],
    queryFn: () => youtubeService.getRecommendations(),
    enabled: debouncedQuery.length < 3,
    staleTime: 30 * 1000, // 30s - se invalida cuando cambia el video sonando
  });

  // Now playing
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

  // Cola
  const { data: queueData } = useQuery({
    queryKey: ["youtube-queue"],
    queryFn: () => youtubeService.getQueue(),
    refetchInterval: 5000,
  });

  const queue = queueData?.queue || [];

  // WebSocket para sincronizacion en tiempo real
  const handleWsMessage = useCallback(
    (data) => {
      if (data.type === "youtube_changed") {
        queryClient.invalidateQueries({ queryKey: ["youtube-now-playing"] });
        queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
        queryClient.invalidateQueries({ queryKey: ["youtube-recommendations"] });
      }
    },
    [queryClient]
  );

  useWebSocket("/ws/youtube/", {
    onMessage: handleWsMessage,
    enabled: true,
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: (video) => youtubeService.create(video),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
    },
  });

  const playMutation = useMutation({
    mutationFn: (id) => youtubeService.playerPlay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-now-playing"] });
      queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
    },
  });

  const nextMutation = useMutation({
    mutationFn: () => youtubeService.playerNext(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-now-playing"] });
      queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => youtubeService.playerPause(),
  });

  const resumeMutation = useMutation({
    mutationFn: () => youtubeService.playerResume(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => youtubeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-queue"] });
    },
  });

  const handleAddToQueue = (video) => {
    createMutation.mutate({
      title: video.title,
      channel_name: video.channel_name,
      video_id: video.video_id,
      thumbnail: video.thumbnail,
      duration: video.duration,
    });
  };

  const handlePlayNow = async (video) => {
    try {
      // Crear primero si no existe, luego reproducir
      const created = await youtubeService.create({
        title: video.title,
        channel_name: video.channel_name,
        video_id: video.video_id,
        thumbnail: video.thumbnail,
        duration: video.duration,
      });
      await playMutation.mutateAsync(created.id);
    } catch (err) {
      // Si ya existe en cola, buscarlo y reproducirlo
      if (err?.response?.status === 409) {
        const existing = queue.find((v) => v.video_id === video.video_id);
        if (existing) {
          playMutation.mutate(existing.id);
        }
      }
    }
  };

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl md:text-4xl font-black">
              <span className="bg-linear-to-r from-red-500 via-primary to-secondary bg-clip-text text-transparent">
                YOUTUBE
              </span>
            </h1>
          </div>
          <a
            href="/youtube-tv"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <Tv className="w-4 h-4" />
            <span className="text-sm font-semibold">Abrir TV</span>
          </a>
        </div>

        {/* Quota status */}
        {quotaStatus && <QuotaBar quota={quotaStatus} />}

        {/* Now Playing */}
        <div className="mb-8 liquid-glass backdrop-blur-xl bg-white/[0.06] border border-white/[0.1] rounded-2xl p-4 md:p-6">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">
            Reproduciendo ahora
          </h2>
          {nowPlaying?.video_id ? (
            <div className="flex items-center gap-4">
              <img
                src={nowPlaying.thumbnail}
                alt={nowPlaying.title}
                className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base md:text-lg truncate">{nowPlaying.title}</p>
                <p className="text-white/60 text-sm truncate">{nowPlaying.channel_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pauseMutation.mutate()}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                  title="Pausar"
                >
                  <Pause className="w-5 h-5" />
                </button>
                <button
                  onClick={() => resumeMutation.mutate()}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                  title="Reanudar"
                >
                  <PlayCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => nextMutation.mutate()}
                  className="p-3 rounded-full bg-primary/20 hover:bg-primary/40 transition"
                  title="Siguiente"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm">No hay video reproduciendose</p>
          )}
        </div>

        {/* Busqueda */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar video en YouTube..."
              className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-white placeholder:text-white/30"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin" />
            )}
          </div>

          {/* Resultados de busqueda */}
          {debouncedQuery.length >= 3 && searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((video) => (
                <VideoResultCard
                  key={video.video_id}
                  video={video}
                  onPlay={handlePlayNow}
                  onAdd={handleAddToQueue}
                />
              ))}
            </div>
          )}

          {/* Recomendaciones (cuando no hay busqueda) */}
          {debouncedQuery.length < 3 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-red-400" />
                <h2 className="text-xs uppercase tracking-widest text-white/60 font-semibold">
                  Recomendaciones
                </h2>
              </div>
              {isLoadingRecommendations ? (
                <div className="flex items-center gap-2 text-white/40 text-sm py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando recomendaciones...
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((video) => (
                    <VideoResultCard
                      key={video.video_id}
                      video={video}
                      onPlay={handlePlayNow}
                      onAdd={handleAddToQueue}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm">
                  No hay recomendaciones disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cola */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">
            En cola ({queue.length})
          </h2>
          {queue.length === 0 ? (
            <p className="text-white/30 text-sm">La cola esta vacia</p>
          ) : (
            <div className="space-y-2">
              {queue.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 md:w-28 md:h-16 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-white/50 text-xs truncate">{video.channel_name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => playMutation.mutate(video.id)}
                      className="p-2 rounded-lg bg-primary/20 hover:bg-primary/40 transition"
                      title="Reproducir ahora"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(video.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeAdminPage;

