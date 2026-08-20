import React, { useState, useEffect, useRef } from "react";
import MusicVisualizer from "@/components/MusicVisualizer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Search,
  Loader2,
  Play,
  Clock,
  X,
  ListMusic,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { youtubeService } from "@/services/youtube.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks";

const formatDuration = (iso) => {
  if (!iso) return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, h, m, s] = match;
  const hh = h ? parseInt(h) : 0;
  const mm = m ? parseInt(m) : 0;
  const ss = s ? parseInt(s) : 0;
  if (hh > 0)
    return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
};

const YouTubeVideoCard = ({ video, onSelect, isLoading }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    onClick={() => onSelect(video)}
    disabled={isLoading}
    className="fb-card fb-card--link flex w-full items-center gap-3 p-3 text-left disabled:opacity-50"
  >
    {video.thumbnail ? (
      <img loading="lazy" decoding="async"
        src={video.thumbnail}
        alt={video.title}
        className="w-20 h-12 rounded-lg object-cover flex-shrink-0"
      />
    ) : (
      <div className="w-20 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <Youtube className="w-5 h-5 text-gray" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-light font-medium text-sm line-clamp-2">{video.title}</p>
      <p className="text-gray text-xs truncate">{video.channel_name}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-gray text-xs">{formatDuration(video.duration)}</span>
      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
        <Plus className="w-4 h-4" />
      </div>
    </div>
  </motion.button>
);

const NowPlayingCard = ({ video }) => {
  if (!video?.video_id) return null;

  return (
    <div className="mb-8 max-w-lg mx-auto">
      <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mb-3 text-center">
        Reproduciendo ahora
      </p>
      <div className="fb-card flex items-center gap-4 p-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          {video.thumbnail ? (
            <img loading="lazy" decoding="async"
              src={video.thumbnail}
              alt={video.title}
              className="w-24 h-16 md:w-32 md:h-20 rounded-xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-24 h-16 md:w-32 md:h-20 rounded-xl bg-white/10 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white/30" />
            </div>
          )}
          {/* Pulse indicator */}
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm md:text-base line-clamp-2">
            {video.title}
          </p>
          <p className="text-white/50 text-xs md:text-sm truncate mt-1">
            {video.channel_name}
          </p>
          <p className="text-[10px] text-red-400/70 uppercase tracking-wider font-bold mt-2">
            {video.is_mix ? "Mix automatico" : "En vivo en la pantalla"}
          </p>
        </div>
      </div>
    </div>
  );
};

const SolicitarVideo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useWebSocket("/ws/youtube/", {
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ["video-requests"] });
      queryClient.invalidateQueries({ queryKey: ["video-now-playing"] });
    },
  });

  useEffect(() => {
    // 1s debounce para reducir consumo de cuota de YouTube API
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["youtube-search-public", debouncedQuery],
    queryFn: () => youtubeService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 4,
    staleTime: 60000,
  });

  const { data: nowPlaying } = useQuery({
    queryKey: ["video-now-playing"],
    queryFn: async () => {
      try {
        return await youtubeService.getNowPlaying();
      } catch {
        return null;
      }
    },
    refetchInterval: 10000,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["video-requests"],
    queryFn: () => youtubeService.getAll(),
    refetchInterval: 5000,
  });

  const requests = (requestsData?.results || []).filter(
    (r) => r.status === "pending" || r.status === "queued" || r.status === "playing"
  );

  const createMutation = useMutation({
    mutationFn: (data) => youtubeService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["video-requests"] });
      toast({
        title: "Video agregado a la cola",
        description: `"${variables.title}" se reproducira pronto.`,
        duration: 5000,
      });
      setSearchQuery("");
      setDebouncedQuery("");
      setShowResults(false);
    },
    onError: (error) => {
      const msg =
        error.response?.data?.error ||
        "Error al enviar tu solicitud. Intenta de nuevo.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSelectVideo = (video) => {
    createMutation.mutate({
      title: video.title,
      channel_name: video.channel_name,
      video_id: video.video_id,
      thumbnail: video.thumbnail,
      duration: video.duration,
    });
  };

  const getStatusBadge = (status) => {
    if (status === "playing")
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
          <Play className="w-3 h-3" /> Reproduciendo
        </span>
      );
    if (status === "queued")
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30 flex items-center gap-1">
          <ListMusic className="w-3 h-3" /> En cola
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    );
  };

  return (
    <section
      id="solicitar-cancion"
      className="relative overflow-hidden min-h-[80vh] flex flex-col justify-center"
      style={{
        background: "linear-gradient(to bottom, #0a0a14, #0d0d1a, #0a0a14)",
      }}
    >
      {/* Canvas animation - esfera 3D de particulas */}
      <MusicVisualizer isPlaying={!!nowPlaying?.video_id} />


      <div className="container mx-auto px-4 relative z-10 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="fb-eyebrow inline-flex items-center gap-2">
            <Youtube className="h-3.5 w-3.5 text-red-500" />
            En la pantalla del local
          </span>
          <h2 className="font-display m-0 mt-3 text-[clamp(1.35rem,6vw,1.75rem)] font-semibold uppercase leading-none tracking-[0.16em] text-light md:text-[2.1rem] md:tracking-[0.09em]">
            Pide tu video
          </h2>
          <span aria-hidden className="fb-rule mx-auto mt-4 block" />
          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-light/50 md:text-[0.84rem]">
            Busca un video y se reproduce en la pantalla del local.
          </p>
        </motion.div>

        {/* Now Playing - embedded mini player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {nowPlaying?.video_id && <NowPlayingCard video={nowPlaying} />}
        </motion.div>

        {/* Search + Results */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="fb-card p-5 md:p-6">
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-3.5 pl-12 pr-10 text-[0.9rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                  placeholder="Busca un video..."
                  disabled={createMutation.isPending}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      setShowResults(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-light rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showResults && debouncedQuery.length >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 max-h-80 overflow-y-auto space-y-2"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                        <span className="ml-2 text-white/40">Buscando...</span>
                      </div>
                    ) : searchResults?.length > 0 ? (
                      searchResults.map((video) => (
                        <YouTubeVideoCard
                          key={video.video_id}
                          video={video}
                          onSelect={handleSelectVideo}
                          isLoading={createMutation.isPending}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-white/30">
                        <Youtube className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron resultados</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {createMutation.isPending && (
              <div className="flex items-center justify-center gap-2 mt-4 text-red-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Agregando a la cola...</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Queue */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mt-10"
          >
            <h3 className="fb-eyebrow mb-4 block text-center">
              Videos en Cola
            </h3>
            {requestsLoading ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-red-400 mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="fb-inset p-3 transition-colors hover:border-white/15"
                    >
                      <div className="flex items-center gap-3">
                        {request.thumbnail ? (
                          <img loading="lazy" decoding="async"
                            src={request.thumbnail}
                            alt={request.title}
                            className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Youtube className="w-4 h-4 text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white/90 font-semibold text-sm line-clamp-2">
                            {request.title}
                          </h4>
                          <p className="text-white/30 text-xs truncate">
                            {request.channel_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SolicitarVideo;
