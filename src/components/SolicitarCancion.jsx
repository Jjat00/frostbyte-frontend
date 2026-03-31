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
    className="w-full flex items-center gap-3 p-3 backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-primary/40 hover:bg-white/[0.09] transition-all duration-200 text-left disabled:opacity-50"
  >
    {track.image ? (
      <img src={track.image} alt={track.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
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
    <div className="mb-8 space-y-4">
      {/* Now Playing - glass card */}
      <div className="backdrop-blur-xl bg-white/[0.06] border border-white/[0.12] rounded-2xl p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-4 mb-3">
          {data.image && (
            <img
              src={data.image}
              alt={data.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-lg shadow-primary/30 border border-white/15 ring-2 ring-primary/20"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">Sonando ahora</p>
            <p className="text-white font-black text-lg md:text-xl truncate drop-shadow-[0_2px_10px_rgba(255,0,212,0.3)]">{data.name}</p>
            <p className="text-white/50 text-sm truncate">{data.artists}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-white/[0.08] rounded-full h-1.5 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,0,212,0.4)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {/* Lyrics - glass card */}
      {lyricsLines && (
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-lg md:text-2xl font-bold text-white text-center drop-shadow-[0_0_20px_rgba(0,224,255,0.4)] transition-all duration-300">
            {lyricsLines.current}
          </p>
          {lyricsLines.next && (
            <p className="text-sm md:text-base text-white/25 mt-2 text-center transition-all duration-300">
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

  useWebSocket('/ws/music/', {
    onMessage: () => {
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
    queryKey: ['spotify-status'],
    queryFn: () => musicService.getSpotifyStatus(),
    refetchInterval: 30000,
  });
  const isSpotifyConnected = spotifyStatus?.connected === true;

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['spotify-search', debouncedQuery],
    queryFn: () => musicService.searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && isSpotifyConnected,
    staleTime: 60000,
  });

  const { data: nowPlaying } = useQuery({
    queryKey: ['now-playing'],
    queryFn: () => musicService.getNowPlaying(),
    enabled: isSpotifyConnected,
    refetchInterval: 10000,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['song-requests'],
    queryFn: () => musicService.getAll(),
    refetchInterval: 5000,
  });

  const requests = (requestsData?.results || []).filter(
    (r) => r.status === 'pending' || r.status === 'queued' || r.status === 'playing'
  );

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
      toast({ title: "Error", description: msg, variant: "destructive", duration: 4000 });
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
    if (status === 'playing') return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm bg-primary/15 text-primary border border-primary/25 shadow-[inset_0_1px_0_rgba(255,0,212,0.1)] flex items-center gap-1">
        <Play className="w-3 h-3" /> Reproduciendo
      </span>
    );
    if (status === 'queued') return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm bg-secondary/15 text-secondary border border-secondary/25 shadow-[inset_0_1px_0_rgba(0,224,255,0.1)] flex items-center gap-1">
        <ListMusic className="w-3 h-3" /> En cola
      </span>
    );
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 shadow-[inset_0_1px_0_rgba(234,179,8,0.1)] flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    );
  };

  return (
    <section id="solicitar-cancion" className="relative overflow-hidden min-h-[80vh] flex flex-col justify-center" style={{ background: 'linear-gradient(to bottom, #0a0a14, #0d0d1a, #0a0a14)' }}>
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
          <h2 className="text-4xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,0,212,0.3)]">
              PIDE TU CANCION
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-2xl mx-auto">
            Busca tu cancion favorita y se agregara automaticamente a la cola
          </p>
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
            <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.2)] text-center">
              <div className="w-16 h-16 backdrop-blur-sm bg-white/[0.06] border border-white/[0.12] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Music className="text-white/30" size={28} />
              </div>
              <p className="text-white/40 text-lg mb-2">El sistema de musica no esta disponible</p>
              <p className="text-white/20 text-sm">Pregunta al personal para solicitar una cancion</p>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/[0.06] border border-white/[0.12] rounded-2xl p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.25)]">
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
                    className="w-full backdrop-blur-sm bg-white/[0.06] border border-white/[0.12] rounded-xl pl-12 pr-10 py-4 text-light text-lg focus:outline-none focus:border-primary/50 focus:bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 placeholder:text-white/25"
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
            <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 mb-4 mx-auto w-fit shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h3 className="text-sm font-bold text-white/50 text-center uppercase tracking-widest">
                Solicitudes en Cola
              </h3>
            </div>
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
                      className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {request.spotify_track_image ? (
                          <img src={request.spotify_track_image} alt={request.song_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
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
