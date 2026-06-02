import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
  ListMusic,
  AlertTriangle,
  Wifi,
  WifiOff,
  SkipBack,
  SkipForward,
  Volume2,
  Search,
  Trash2,
  Mic2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { musicService } from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { useWebSocket } from '@/hooks';

const formatDuration = (ms) => {
  if (!ms) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  queued: {
    label: 'En cola',
    icon: ListMusic,
    bgClass: 'bg-cyan-500/10 border-cyan-500/30',
    badgeClass: 'bg-cyan-500/20 text-cyan-400',
  },
  playing: {
    label: 'Reproduciendo',
    icon: Play,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  completed: {
    label: 'Completada',
    icon: CheckCircle,
    bgClass: 'bg-green-500/10 border-green-500/30',
    badgeClass: 'bg-green-500/20 text-green-400',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    bgClass: 'bg-red-500/10 border-red-500/30',
    badgeClass: 'bg-red-500/20 text-red-400',
  },
  failed: {
    label: 'Fallida',
    icon: AlertTriangle,
    bgClass: 'bg-orange-500/10 border-orange-500/30',
    badgeClass: 'bg-orange-500/20 text-orange-400',
  },
};

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

// ── Now Playing + Controls ─────────────────────────────────────────
const NowPlayingPanel = ({ isConnected }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [volume, setVolume] = useState(50);
  const [localProgress, setLocalProgress] = useState(0);
  const lastSyncRef = React.useRef({ uri: null, progress: 0, timestamp: 0 });

  const { data: nowPlaying, isLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: () => musicService.getNowPlaying(),
    enabled: isConnected,
    refetchInterval: 3000,
  });

  // Sync local progress when server data arrives
  useEffect(() => {
    if (!nowPlaying) return;
    const sync = lastSyncRef.current;
    const isNewTrack = nowPlaying.uri !== sync.uri;
    const serverProgress = nowPlaying.progress_ms || 0;

    if (isNewTrack || Math.abs(serverProgress - sync.progress) > 2000) {
      lastSyncRef.current = { uri: nowPlaying.uri, progress: serverProgress, timestamp: Date.now() };
      setLocalProgress(serverProgress);
    }
  }, [nowPlaying]);

  // Interpolate progress every second when playing
  useEffect(() => {
    if (!nowPlaying?.is_playing) return;

    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        const next = prev + 1000;
        return next > (nowPlaying.duration_ms || 0) ? nowPlaying.duration_ms : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nowPlaying?.is_playing, nowPlaying?.uri, nowPlaying?.duration_ms]);

  const [showLyrics, setShowLyrics] = useState(false);
  const lyricsContainerRef = useRef(null);

  const { data: lyricsData } = useQuery({
    queryKey: ['lyrics', nowPlaying?.uri],
    queryFn: () => musicService.getLyrics({
      trackName: nowPlaying.name,
      artistName: nowPlaying.artists?.split(', ')[0],
      duration: Math.round(nowPlaying.duration_ms / 1000),
    }),
    enabled: !!nowPlaying?.name && !!nowPlaying?.artists,
    staleTime: Infinity,
  });

  const parsedLyrics = useMemo(
    () => parseSyncedLyrics(lyricsData?.synced_lyrics),
    [lyricsData?.synced_lyrics]
  );

  const hasSyncedLyrics = parsedLyrics.length > 0;

  const currentLineIndex = useMemo(() => {
    if (!hasSyncedLyrics) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= localProgress) idx = i;
      else break;
    }
    return idx;
  }, [localProgress, parsedLyrics, hasSyncedLyrics]);

  // Auto-scroll to current lyric line
  useEffect(() => {
    if (!showLyrics || currentLineIndex < 0 || !lyricsContainerRef.current) return;
    const container = lyricsContainerRef.current;
    const activeLine = container.querySelector('[data-active="true"]');
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLineIndex, showLyrics]);

  const controlMutation = useMutation({
    mutationFn: (action) => {
      switch (action) {
        case 'pause': return musicService.playerPause();
        case 'resume': return musicService.playerResume();
        case 'next': return musicService.playerNext();
        case 'previous': return musicService.playerPrevious();
        default: return Promise.resolve();
      }
    },
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['now-playing'] }), 500);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Error al controlar reproduccion",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const volumeMutation = useMutation({
    mutationFn: (vol) => musicService.playerVolume(vol),
  });

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    volumeMutation.mutate(vol);
  };

  if (!isConnected) {
    return (
      <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-red-500/30 rounded-xl p-6 mb-6 text-center">
        <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">Spotify no esta conectado</p>
        <a
          href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/api/v1/spotify/auth/`}
          className="inline-block mt-3 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
        >
          Conectar Spotify
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl p-6 mb-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const progress = nowPlaying?.duration_ms > 0
    ? (localProgress / nowPlaying.duration_ms) * 100
    : 0;

  return (
    <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-primary/30 rounded-xl p-5 mb-6">
      <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-4">
        {nowPlaying?.is_playing ? 'Sonando ahora' : 'Pausado'}
      </p>

      {nowPlaying ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            {nowPlaying.image && (
              <img loading="lazy" decoding="async" src={nowPlaying.image} alt={nowPlaying.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 shadow-lg" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-light font-bold text-lg truncate">{nowPlaying.name}</p>
              <p className="text-gray text-sm truncate">{nowPlaying.artists}</p>
              <p className="text-gray/50 text-xs truncate">{nowPlaying.album}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-white/[0.08] rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray">
              <span>{formatDuration(localProgress)}</span>
              <span>{formatDuration(nowPlaying.duration_ms)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => controlMutation.mutate('previous')}
              disabled={controlMutation.isPending}
              className="p-2.5 text-gray hover:text-light hover:bg-white/[0.06] rounded-full transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => controlMutation.mutate(nowPlaying.is_playing ? 'pause' : 'resume')}
              disabled={controlMutation.isPending}
              className="p-3 bg-primary text-dark rounded-full hover:bg-primary/80 transition-colors"
            >
              {controlMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : nowPlaying.is_playing ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={() => controlMutation.mutate('next')}
              disabled={controlMutation.isPending}
              className="p-2.5 text-gray hover:text-light hover:bg-white/[0.06] rounded-full transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-primary"
            />
            <span className="text-xs text-gray w-8 text-right">{volume}%</span>
          </div>

          {/* Lyrics toggle */}
          {hasSyncedLyrics && (
            <div className="mt-4">
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors font-medium"
              >
                <Mic2 className="w-3.5 h-3.5" />
                Letra
                {showLyrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showLyrics && (
                <div
                  ref={lyricsContainerRef}
                  className="mt-3 max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin"
                >
                  {parsedLyrics.map((line, idx) => (
                    <p
                      key={idx}
                      data-active={idx === currentLineIndex}
                      className={`text-sm transition-all duration-300 ${
                        idx === currentLineIndex
                          ? 'text-primary font-semibold scale-[1.02] origin-left'
                          : idx < currentLineIndex
                            ? 'text-gray/40'
                            : 'text-gray/70'
                      }`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <Music className="w-10 h-10 text-gray/30 mx-auto mb-2" />
          <p className="text-gray">No hay nada reproduciendose</p>
        </div>
      )}
    </div>
  );
};

// ── Spotify Queue ──────────────────────────────────────────────────
const SpotifyQueuePanel = ({ isConnected }) => {
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['spotify-queue'],
    queryFn: () => musicService.getQueueStatus(),
    enabled: isConnected,
    refetchInterval: 10000,
  });

  const queue = queueData?.queue || [];

  if (!isConnected || isLoading) return null;
  if (queue.length === 0) return null;

  return (
    <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
        <ListMusic className="w-4 h-4" />
        Cola de Spotify ({queue.length})
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {queue.slice(0, 20).map((track, idx) => (
          <div key={`${track.uri}-${idx}`} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] ${track.is_request ? 'border-l-2 border-primary/50' : ''}`}>
            <span className="text-xs text-gray/50 w-5 text-right flex-shrink-0">{idx + 1}</span>
            {track.image ? (
              <img loading="lazy" decoding="async" src={track.image} alt={track.name} className="w-9 h-9 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4 text-gray" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-light text-sm truncate">{track.name}</p>
              <p className="text-gray text-xs truncate">{track.artists}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {track.is_request && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">Solicitud</span>
              )}
              <span className="text-xs text-gray">{formatDuration(track.duration_ms)}</span>
            </div>
          </div>
        ))}
        {queue.length > 20 && (
          <p className="text-xs text-gray/50 text-center pt-1">y {queue.length - 20} mas...</p>
        )}
      </div>
    </div>
  );
};

// ── Admin Search ───────────────────────────────────────────────────
const AdminSearch = ({ isConnected }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading: isSearching } = useQuery({
    queryKey: ['admin-spotify-search', debouncedQuery],
    queryFn: () => musicService.searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && isConnected,
    staleTime: 60000,
  });

  const playTrackMutation = useMutation({
    mutationFn: (uri) => musicService.playerPlayTrack(uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['now-playing'] });
      toast({ title: "Reproduciendo", duration: 2000 });
    },
    onError: () => {
      toast({ title: "Error al reproducir", variant: "destructive", duration: 3000 });
    },
  });

  const queueMutation = useMutation({
    mutationFn: (track) => musicService.create({
      song_name: track.name,
      artist_name: track.artists,
      spotify_track_uri: track.uri,
      spotify_track_image: track.image,
      spotify_track_duration_ms: track.duration_ms,
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      queryClient.invalidateQueries({ queryKey: ['spotify-queue'] });
      setQuery('');
      setDebouncedQuery('');

      if (response?.status === 'failed') {
        toast({
          title: "No se pudo encolar en Spotify",
          description: "La solicitud quedo como fallida.",
          variant: "destructive",
          duration: 3000,
        });
      } else if (response?.status === 'pending') {
        toast({
          title: "Solicitud pendiente",
          description: "Spotify no esta conectado, se encolara cuando vuelva.",
          duration: 3000,
        });
      } else {
        toast({ title: "Agregada a la cola", duration: 2000 });
      }
    },
    onError: (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.error || "Error al agregar";
      toast({
        title: status === 409 ? "Ya esta en la cola" : msg,
        description: status === 409 ? msg : undefined,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  if (!isConnected) return null;

  return (
    <div className="liquid-glass backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Buscar y agregar canciones
      </h3>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg pl-10 pr-4 py-2.5 text-light text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray/50"
          placeholder="Buscar cancion o artista..."
        />
      </div>
      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      {results?.length > 0 && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {results.map((track) => (
            <div key={track.uri} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] group">
              {track.image ? (
                <img loading="lazy" decoding="async" src={track.image} alt={track.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-gray" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-light text-sm truncate">{track.name}</p>
                <p className="text-gray text-xs truncate">{track.artists}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => playTrackMutation.mutate(track.uri)}
                  disabled={playTrackMutation.isPending}
                  className="p-1.5 text-primary hover:bg-primary/20 rounded-full transition-colors"
                  title="Reproducir ahora"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => queueMutation.mutate(track)}
                  disabled={queueMutation.isPending}
                  className="p-1.5 text-secondary hover:bg-secondary/20 rounded-full transition-colors"
                  title="Agregar a la cola"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {debouncedQuery.length >= 2 && !isSearching && results?.length === 0 && (
        <p className="text-gray text-sm text-center py-3">Sin resultados</p>
      )}
    </div>
  );
};

// ── Song Request Card ──────────────────────────────────────────────
const SongRequestCard = ({ request, onUpdateStatus, onPlayNow, onDelete }) => {
  const status = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const { toast } = useToast();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus(request.id, newStatus);
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive", duration: 3000 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border-2 ${status.bgClass} rounded-xl p-4 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start gap-3 mb-3">
        {request.spotify_track_image ? (
          <img loading="lazy" decoding="async" src={request.spotify_track_image} alt={request.song_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className={`w-12 h-12 flex-shrink-0 rounded-lg ${status.badgeClass} flex items-center justify-center`}>
            <Music className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-light truncate">{request.song_name}</h3>
          <p className="text-gray text-xs truncate">{request.artist_name}</p>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.badgeClass} flex items-center gap-1 flex-shrink-0`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray mb-3">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(request.created_at)}</span>
        {request.played_at && (
          <>
            <Play className="w-3 h-3 ml-2" />
            <span>{formatDate(request.played_at)}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5">
        {request.spotify_track_uri && (request.status === 'pending' || request.status === 'queued' || request.status === 'failed') && (
          <button
            onClick={() => onPlayNow(request.spotify_track_uri)}
            className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Reproducir ahora
          </button>
        )}

        {(request.status === 'pending' || request.status === 'queued' || request.status === 'failed') && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancelar
          </button>
        )}

        {request.status === 'playing' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Completada
          </button>
        )}

        {request.status === 'cancelled' && (
          <button
            onClick={() => handleStatusChange('pending')}
            className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Reactivar
          </button>
        )}

        <button
          onClick={() => onDelete(request.id)}
          className="px-3 py-1.5 bg-white/[0.09] text-gray border border-white/[0.1] rounded-lg hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors text-xs font-medium flex items-center gap-1.5 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const SongRequestsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);

  useWebSocket('/ws/music/', {
    onMessage: () => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      queryClient.invalidateQueries({ queryKey: ['now-playing'] });
      queryClient.invalidateQueries({ queryKey: ['spotify-queue'] });
    },
  });

  const { data: spotifyStatus } = useQuery({
    queryKey: ['spotify-status'],
    queryFn: () => musicService.getSpotifyStatus(),
    refetchInterval: 30000,
  });

  const isConnected = spotifyStatus?.connected === true;

  const { data: requestsData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['song-requests', 'admin', statusFilter],
    queryFn: () => musicService.getAll(statusFilter ? { status: statusFilter } : {}),
    refetchInterval: 30000,
  });

  const requests = requestsData?.results || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => musicService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['song-requests'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => musicService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      toast({ title: "Solicitud eliminada", duration: 2000 });
    },
  });

  const playTrackMutation = useMutation({
    mutationFn: (uri) => musicService.playerPlayTrack(uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['now-playing'] });
      toast({ title: "Reproduciendo", duration: 2000 });
    },
    onError: () => {
      toast({ title: "Error al reproducir", variant: "destructive", duration: 3000 });
    },
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    queued: requests.filter(r => r.status === 'queued').length,
    playing: requests.filter(r => r.status === 'playing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
    failed: requests.filter(r => r.status === 'failed').length,
  };

  const filteredRequests = statusFilter
    ? requests.filter(r => r.status === statusFilter)
    : requests.filter(r => r.status !== 'completed');

  const filterButtons = [
    { key: null, label: 'Activas', count: statusCounts.all, activeClass: 'bg-primary/20 text-primary border-primary/30' },
    { key: 'pending', label: 'Pendientes', count: statusCounts.pending, activeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { key: 'queued', label: 'En cola', count: statusCounts.queued, activeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { key: 'playing', label: 'Reproduciendo', count: statusCounts.playing, activeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { key: 'completed', label: 'Completadas', count: statusCounts.completed, activeClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { key: 'cancelled', label: 'Canceladas', count: statusCounts.cancelled, activeClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-light mb-2 flex items-center gap-2 sm:gap-3">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <span className="truncate">Solicitudes de Canciones</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              Spotify
            </div>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout: Player | Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player + Queue + Search */}
        <div className="lg:col-span-1 space-y-0">
          <NowPlayingPanel isConnected={isConnected} />
          <SpotifyQueuePanel isConnected={isConnected} />
          <AdminSearch isConnected={isConnected} />
        </div>

        {/* Right: Song Requests */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterButtons.map((btn) => (
              <button
                key={btn.key ?? 'all'}
                onClick={() => setStatusFilter(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  statusFilter === btn.key
                    ? btn.activeClass
                    : 'backdrop-blur-sm bg-white/[0.09] text-gray border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-gray/50 mx-auto mb-4" />
              <p className="text-gray text-lg">
                {statusFilter
                  ? `No hay solicitudes "${statusConfig[statusFilter]?.label}"`
                  : 'No hay solicitudes pendientes'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {filteredRequests.map((request) => (
                  <SongRequestCard
                    key={request.id}
                    request={request}
                    onUpdateStatus={(id, s) => updateStatusMutation.mutateAsync({ id, status: s })}
                    onPlayNow={(uri) => playTrackMutation.mutate(uri)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongRequestsPage;
