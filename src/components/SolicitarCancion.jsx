import React, { useState, useEffect, useRef, useMemo } from 'react';
import MusicVisualizer from '@/components/MusicVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Loader2, Play, Clock, X, ListMusic, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { musicService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks';

const parseSyncedLyrics = (syncedLyrics) => {
  if (!syncedLyrics) return [];
  return syncedLyrics
    .split('\n')
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s?(.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      return { time: minutes * 60000 + seconds * 1000 + ms, text: match[4] };
    })
    .filter((l) => l && l.text.trim());
};

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SpotifyTrackCard = ({ track, onSelect, isLoading }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    onClick={() => onSelect(track)}
    disabled={isLoading}
    className="w-full flex items-center gap-3 p-3 bg-dark-secondary/80 border border-gray/20 rounded-xl hover:border-primary/50 hover:bg-dark-secondary transition-all duration-200 text-left disabled:opacity-50"
  >
    {track.image ? (
      <img
        src={track.image}
        alt={track.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-gray/20 flex items-center justify-center flex-shrink-0">
        <Music className="w-5 h-5 text-gray" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-light font-medium text-sm truncate">{track.name}</p>
      <p className="text-gray text-xs truncate">{track.artists}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-gray text-xs">{formatDuration(track.duration_ms)}</span>
      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
        <Plus className="w-4 h-4" />
      </div>
    </div>
  </motion.button>
);

const NowPlayingBar = ({ data }) => {
  const [localProgress, setLocalProgress] = useState(0);
  const lastSyncRef = useRef({ uri: null, progress: 0 });

  useEffect(() => {
    if (!data) return;
    const sync = lastSyncRef.current;
    const serverProgress = data.progress_ms || 0;
    if (data.uri !== sync.uri || Math.abs(serverProgress - sync.progress) > 2000) {
      lastSyncRef.current = { uri: data.uri, progress: serverProgress };
      setLocalProgress(serverProgress);
    }
  }, [data]);

  useEffect(() => {
    if (!data?.is_playing) return;
    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        const next = prev + 1000;
        return next > (data.duration_ms || 0) ? data.duration_ms : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.is_playing, data?.uri, data?.duration_ms]);

  const { data: lyricsData } = useQuery({
    queryKey: ['lyrics', data?.uri],
    queryFn: () => musicService.getLyrics({
      trackName: data.name,
      artistName: data.artists?.split(', ')[0],
      duration: Math.round(data.duration_ms / 1000),
    }),
    enabled: !!data?.name && !!data?.artists,
    staleTime: Infinity,
  });

  const parsedLyrics = useMemo(
    () => parseSyncedLyrics(lyricsData?.synced_lyrics),
    [lyricsData?.synced_lyrics]
  );

  const lyricsLines = useMemo(() => {
    if (parsedLyrics.length === 0) return null;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= localProgress) idx = i;
      else break;
    }
    if (idx < 0) return null;
    const current = parsedLyrics[idx]?.text;
    const next = parsedLyrics[idx + 1]?.text;
    return { current, next };
  }, [localProgress, parsedLyrics]);

  if (!data) return null;

  const progress = data.duration_ms > 0 ? (localProgress / data.duration_ms) * 100 : 0;

  return (
    <div className="bg-dark border border-primary/30 rounded-xl p-4 mb-6">
      <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">Sonando ahora</p>
      <div className="flex items-center gap-3">
        {data.image && (
          <img src={data.image} alt={data.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-light font-bold text-sm truncate">{data.name}</p>
          <p className="text-gray text-xs truncate">{data.artists}</p>
          <div className="mt-2 w-full bg-gray/20 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      {lyricsLines && (
        <div className="mt-3 text-center space-y-1">
          <p className="text-sm text-secondary italic transition-all duration-300">
            {lyricsLines.current}
          </p>
          {lyricsLines.next && (
            <p className="text-xs text-gray/50 italic transition-all duration-300">
              {lyricsLines.next}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const SolicitarCancion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // WebSocket para actualizaciones en tiempo real
  useWebSocket('/ws/music/', {
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      queryClient.invalidateQueries({ queryKey: ['now-playing'] });
    },
  });

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click fuera cierra resultados
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estado de conexión Spotify
  const { data: spotifyStatus } = useQuery({
    queryKey: ['spotify-status'],
    queryFn: () => musicService.getSpotifyStatus(),
    refetchInterval: 30000,
  });

  const isSpotifyConnected = spotifyStatus?.connected === true;

  // Búsqueda en Spotify
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['spotify-search', debouncedQuery],
    queryFn: () => musicService.searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && isSpotifyConnected,
    staleTime: 60000,
  });

  // Now playing
  const { data: nowPlaying } = useQuery({
    queryKey: ['now-playing'],
    queryFn: () => musicService.getNowPlaying(),
    enabled: isSpotifyConnected,
    refetchInterval: 10000,
  });

  // Solicitudes en cola
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['song-requests'],
    queryFn: () => musicService.getAll(),
    refetchInterval: 5000,
  });

  const requests = (requestsData?.results || []).filter(
    (request) => request.status === 'pending' || request.status === 'queued' || request.status === 'playing'
  );

  // Crear solicitud
  const createMutation = useMutation({
    mutationFn: (data) => musicService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      toast({
        title: "Cancion agregada a la cola",
        description: `"${variables.song_name}" de ${variables.artist_name} se reproducira pronto.`,
        duration: 5000,
      });
      setSearchQuery('');
      setDebouncedQuery('');
      setShowResults(false);
    },
    onError: (error) => {
      const msg = error.response?.data?.error || "Error al enviar tu solicitud. Intenta de nuevo.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSelectTrack = (track) => {
    createMutation.mutate({
      song_name: track.name,
      artist_name: track.artists,
      spotify_track_uri: track.uri,
      spotify_track_image: track.image,
      spotify_track_duration_ms: track.duration_ms,
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'playing') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
          <Play className="w-3 h-3" />
          Reproduciendo
        </span>
      );
    }
    if (status === 'queued') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 flex items-center gap-1">
          <ListMusic className="w-3 h-3" />
          En cola
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Pendiente
      </span>
    );
  };

  return (
    <section id="solicitar-cancion" className="py-20 bg-dark-secondary relative overflow-hidden">
      <MusicVisualizer isPlaying={!!nowPlaying?.is_playing} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PIDE TU CANCION
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Busca tu cancion favorita y se agregara automaticamente a la cola
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-dark border border-gray/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full filter blur-[80px]"></div>
            </div>

            <div className="relative z-10">
              {/* Now Playing */}
              {isSpotifyConnected && nowPlaying && <NowPlayingBar data={nowPlaying} />}

              {/* Icono */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Music className="text-dark" size={40} />
                </div>
              </div>

              {!isSpotifyConnected ? (
                <div className="text-center py-8">
                  <p className="text-gray text-lg mb-2">El sistema de musica no esta disponible en este momento</p>
                  <p className="text-gray/60 text-sm">Pregunta al personal para solicitar una cancion</p>
                </div>
              ) : (
                <>
                  {/* Buscador */}
                  <div ref={searchRef} className="relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        className="w-full bg-dark-secondary border border-gray/30 rounded-xl pl-12 pr-10 py-4 text-light text-lg focus:outline-none focus:border-primary transition-colors duration-300 placeholder:text-gray/50"
                        placeholder="Busca una cancion o artista..."
                        disabled={createMutation.isPending}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setDebouncedQuery('');
                            setShowResults(false);
                            inputRef.current?.focus();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray hover:text-light rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Resultados de búsqueda */}
                    <AnimatePresence>
                      {showResults && debouncedQuery.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-3 max-h-80 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray/30 scrollbar-track-transparent"
                        >
                          {isSearching ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              <span className="ml-2 text-gray">Buscando...</span>
                            </div>
                          ) : searchResults?.length > 0 ? (
                            searchResults.map((track) => (
                              <SpotifyTrackCard
                                key={track.uri}
                                track={track}
                                onSelect={handleSelectTrack}
                                isLoading={createMutation.isPending}
                              />
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray">
                              <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
                              <p>No se encontraron resultados</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {createMutation.isPending && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-primary">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Agregando a la cola...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cola de solicitudes */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="bg-dark border border-gray/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-light mb-6 text-center">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Solicitudes en Cola
                </span>
              </h3>

              {requestsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {requests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-dark-secondary border border-gray/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          {request.spotify_track_image ? (
                            <img
                              src={request.spotify_track_image}
                              alt={request.song_name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray/20 flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5 text-gray" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-light font-semibold text-sm truncate">
                              {request.song_name}
                            </h4>
                            <p className="text-gray text-xs truncate">
                              {request.artist_name}
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
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SolicitarCancion;
