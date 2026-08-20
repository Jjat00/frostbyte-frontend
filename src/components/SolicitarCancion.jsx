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
    className="fb-card fb-card--link flex w-full items-center gap-3 p-3 text-left disabled:opacity-50"
  >
    {track.image ? (
      <img loading="lazy" decoding="async" src={track.image} alt={track.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
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
    <div className="mb-8">
      {/* Album art + info */}
      <div className="flex items-center gap-4 mb-4">
        {data.image && (
          <img loading="lazy" decoding="async"
            src={data.image}
            alt={data.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-lg shadow-primary/20 border border-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">Sonando ahora</p>
          <p className="truncate text-[0.95rem] font-medium text-light md:text-base">{data.name}</p>
          <p className="text-white/50 text-sm truncate">{data.artists}</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1 mb-1">
        <div className="bg-gradient-to-r from-primary to-secondary h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
      {/* Lyrics - floating text, no background */}
      {lyricsLines && (
        <div className="mt-6 text-center">
          <p className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_0_20px_color-mix(in_srgb,var(--color-secondary)_40%,transparent)] transition-all duration-300">
            {lyricsLines.current}
          </p>
          {lyricsLines.next && (
            <p className="text-sm md:text-base text-white/30 mt-2 transition-all duration-300">
              {lyricsLines.next}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const FLOOR_STORAGE_KEY = 'frostbyte_music_floor';
const FLOORS = [2, 3];

// floorProp: piso conocido con certeza (URL de mesa). Si viene, no se muestran
// tabs y todo apunta a ese piso. Si no (carta publica), el cliente elige piso
// con tabs y la eleccion se recuerda en localStorage.
const SolicitarCancion = ({ floor: floorProp }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const isFloorLocked = FLOORS.includes(floorProp);
  const [selectedFloor, setSelectedFloor] = useState(() => {
    const stored = parseInt(localStorage.getItem(FLOOR_STORAGE_KEY), 10);
    return FLOORS.includes(stored) ? stored : 2;
  });
  const floor = isFloorLocked ? floorProp : selectedFloor;

  const handleFloorChange = (f) => {
    setSelectedFloor(f);
    localStorage.setItem(FLOOR_STORAGE_KEY, String(f));
    setSearchQuery('');
    setDebouncedQuery('');
    setShowResults(false);
  };

  useWebSocket('/ws/music/', {
    onMessage: (data) => {
      // Eventos de otro piso no invalidan nada; floor null = cambio global
      if (data?.floor && data.floor !== floor) return;
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      queryClient.invalidateQueries({ queryKey: ['now-playing'] });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: spotifyStatus } = useQuery({
    queryKey: ['spotify-status', floor],
    queryFn: () => musicService.getSpotifyStatus(floor),
    refetchInterval: 30000,
  });
  const isSpotifyConnected = spotifyStatus?.connected === true;

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['spotify-search', floor, debouncedQuery],
    queryFn: () => musicService.searchSpotify(debouncedQuery, floor),
    enabled: debouncedQuery.length >= 2 && isSpotifyConnected,
    staleTime: 60000,
  });

  const { data: nowPlaying } = useQuery({
    queryKey: ['now-playing', floor],
    queryFn: () => musicService.getNowPlaying(floor),
    enabled: isSpotifyConnected,
    refetchInterval: 10000,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['song-requests', floor],
    queryFn: () => musicService.getAll({ floor }),
    refetchInterval: 5000,
  });

  const requests = (requestsData?.results || []).filter(
    (r) => r.status === 'pending' || r.status === 'queued' || r.status === 'playing'
  );

  const createMutation = useMutation({
    mutationFn: (data) => musicService.create(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      setSearchQuery('');
      setDebouncedQuery('');
      setShowResults(false);

      const trackLabel = `"${variables.song_name}" de ${variables.artist_name}`;
      if (response?.status === 'failed') {
        toast({
          title: "No se pudo agregar a la cola",
          description: `${trackLabel} no pudo encolarse en Spotify. Avisa al personal.`,
          variant: "destructive",
          duration: 5000,
        });
      } else if (response?.status === 'pending') {
        toast({
          title: "Solicitud recibida",
          description: `${trackLabel} quedo pendiente. Se encolara cuando Spotify vuelva a conectarse.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Cancion agregada a la cola",
          description: `${trackLabel} se reproducira pronto.`,
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.error;

      if (status === 409) {
        toast({
          title: "Esta cancion ya esta en la cola",
          description: serverMsg || "Elige otra o espera a que termine la actual.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }

      toast({
        title: "Error al agregar la cancion",
        description: serverMsg || "No pudimos enviar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSelectTrack = (track) => {
    createMutation.mutate({
      floor,
      song_name: track.name,
      artist_name: track.artists,
      spotify_track_uri: track.uri,
      spotify_track_image: track.image,
      spotify_track_duration_ms: track.duration_ms,
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'playing') return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
        <Play className="w-3 h-3" /> Reproduciendo
      </span>
    );
    if (status === 'queued') return (
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
      className="fb-section flex min-h-[80vh] flex-col justify-center"
    >
      {/* Canvas animation - PROTAGONIST */}
      <MusicVisualizer isPlaying={!!nowPlaying?.is_playing} />

      {/* Content floats on top */}
      <div className="container mx-auto px-4 relative z-10 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="fb-eyebrow block">Suena en el local</span>
          <h2 className="font-display m-0 mt-3 text-[clamp(1.35rem,6vw,1.75rem)] font-semibold uppercase leading-none tracking-[0.16em] text-light md:text-[2.1rem] md:tracking-[0.09em]">
            Pide tu canción
          </h2>
          <span aria-hidden className="fb-rule mx-auto mt-4 block" />
          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-light/50 md:text-[0.84rem]">
            Busca tu canción favorita y se agrega sola a la cola.
          </p>

          {isFloorLocked ? (
            /* Piso conocido por la URL de mesa: solo se informa, sin tabs */
            <p className="fb-eyebrow mt-4">Sonará en el piso {floor}</p>
          ) : (
            /* Carta publica: el cliente elige en que piso esta */
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.03] p-1">
                {FLOORS.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFloorChange(f)}
                    className={`rounded-full px-5 py-2 text-[0.75rem] font-medium transition-colors ${
                      floor === f
                        ? 'border border-primary/40 bg-primary/12 text-light'
                        : 'border border-transparent text-light/50 hover:text-light'
                    }`}
                  >
                    Piso {f}
                  </button>
                ))}
              </div>
              <p className="text-[0.68rem] text-light/30">
                Tu canción sonará en el piso {floor}
              </p>
            </div>
          )}
        </motion.div>

        {/* Now Playing - transparent, floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          {isSpotifyConnected && nowPlaying && <NowPlayingBar data={nowPlaying} />}
        </motion.div>

        {/* Search + Results - glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {!isSpotifyConnected ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03]">
                <Music className="text-white/30" size={28} />
              </div>
              <p className="mb-2 text-[0.85rem] text-light/50">El sistema de música no está disponible</p>
              <p className="text-[0.72rem] text-light/30">Pregunta al personal para solicitar una canción</p>
            </div>
          ) : (
            <div className="fb-card p-5 md:p-6">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-3.5 pl-12 pr-10 text-[0.9rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                    placeholder="Busca una cancion o artista..."
                    disabled={createMutation.isPending}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setDebouncedQuery(''); setShowResults(false); inputRef.current?.focus(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-light rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showResults && debouncedQuery.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 max-h-80 overflow-y-auto space-y-2"
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-white/40">Buscando...</span>
                        </div>
                      ) : searchResults?.length > 0 ? (
                        searchResults.map((track) => (
                          <SpotifyTrackCard key={track.uri} track={track} onSelect={handleSelectTrack} isLoading={createMutation.isPending} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/30">
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
            </div>
          )}
        </motion.div>

        {/* Queue - transparent items */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mt-10"
          >
            <h3 className="fb-eyebrow mb-4 block text-center">
              Solicitudes en Cola
            </h3>
            {requestsLoading ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
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
                        {request.spotify_track_image ? (
                          <img loading="lazy" decoding="async" src={request.spotify_track_image} alt={request.song_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Music className="w-4 h-4 text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white/90 font-semibold text-sm truncate">{request.song_name}</h4>
                          <p className="text-white/30 text-xs truncate">{request.artist_name}</p>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(request.status)}</div>
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

export default SolicitarCancion;
