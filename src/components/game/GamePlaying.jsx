import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesService } from '@/services';
import { useGameRoomWebSocket } from '@/hooks/useGameRoomWebSocket';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GamePlaying = ({ room, roomId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentRound, setCurrentRound] = useState(room.current_round || 1);
  const [gameState, setGameState] = useState('waiting'); // waiting, countdown, ready, finished
  const [countdown, setCountdown] = useState(3);
  const [roundData, setRoundData] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [tapped, setTapped] = useState(false);
  const roundStartTimeRef = useRef(null);
  const signalTimeRef = useRef(null);

  // Obtener participante actual
  const getCurrentParticipant = () => {
    const deviceId = localStorage.getItem('frostbyte_device_id');
    return room.participants?.find(p => p.player_device_id === deviceId);
  };

  const currentParticipant = getCurrentParticipant();

  // Obtener datos de la ronda actual
  const { data: roundInfo, refetch: refetchRound } = useQuery({
    queryKey: ['gameRound', roomId, currentRound],
    queryFn: async () => {
      const data = await gamesService.signalRound(roomId, currentRound);
      setRoundData(data);
      return data;
    },
    enabled: gameState === 'waiting' && room.status === 'playing',
  });

  // Mutation para enviar resultado
  const submitResultMutation = useMutation({
    mutationFn: (reactionTimeMs) => 
      gamesService.submitResult(roomId, currentRound, {
        participant_id: currentParticipant?.id,
        reaction_time_ms: reactionTimeMs,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['gameRoom', roomId]);
    },
  });

  // Mutation para descalificar (anticipación)
  const disqualifyMutation = useMutation({
    mutationFn: () =>
      gamesService.disqualifyParticipant(roomId, currentRound, currentParticipant?.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['gameRoom', roomId]);
    },
  });

  // Mutation para terminar juego
  const terminateMutation = useMutation({
    mutationFn: () => gamesService.terminateRoom(roomId),
    onSuccess: () => {
      navigate('/game/duelo-frostbyte/play');
    },
  });

  // Iniciar ronda
  useEffect(() => {
    if (room.status === 'playing' && currentRound <= room.total_rounds && gameState === 'waiting') {
      // Obtener datos de la ronda
      refetchRound().then(() => {
        setGameState('countdown');
        setCountdown(3);
        setTapped(false);
        setReactionTime(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, currentRound, gameState]);

  // Countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      // Iniciar el juego después del countdown
      setGameState('ready');
      roundStartTimeRef.current = Date.now();
      
      // Esperar el delay aleatorio antes de mostrar la señal
      if (roundData?.signal_delay_ms) {
        setTimeout(() => {
          signalTimeRef.current = Date.now();
          setGameState('playing');
        }, roundData.signal_delay_ms);
      }
    }
  }, [gameState, countdown, roundData]);

  // Manejar toque de pantalla
  const handleTap = () => {
    if (gameState === 'ready') {
      // Tocó antes de la señal (anticipación) - descalificar
      disqualifyMutation.mutate();
      setTapped(true);
      setGameState('finished');
    } else if (gameState === 'playing' && !tapped) {
      // Tocó después de la señal - registrar tiempo
      const tapTime = Date.now();
      const reactionTimeMs = tapTime - signalTimeRef.current;
      setReactionTime(reactionTimeMs);
      setTapped(true);
      submitResultMutation.mutate(reactionTimeMs);
      setGameState('finished');
    }
  };

  // WebSocket para actualizaciones en tiempo real de la sala
  useGameRoomWebSocket(
    roomId,
    (updatedRoomData) => {
      // Si el juego terminó, invalidar queries para que GameRoomPage detecte el cambio
      if (updatedRoomData.status === 'finished') {
        queryClient.invalidateQueries(['gameRoom', roomId]);
        // También actualizar el cache para respuesta inmediata
        queryClient.setQueryData(['gameRoom', roomId], updatedRoomData);
      } else if (updatedRoomData.current_round > currentRound) {
        // Nueva ronda
        setCurrentRound(updatedRoomData.current_round);
        setGameState('waiting');
        // Actualizar el cache también
        queryClient.setQueryData(['gameRoom', roomId], updatedRoomData);
      }
    },
    true // enabled
  );

  return (
    <div className="fb-screen flex min-h-screen items-center justify-center p-4">

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Round Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-2xl text-gray/70 mb-2">
            Ronda {currentRound} de {room.total_rounds}
          </h2>
        </motion.div>

        {/* Game Area */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="fb-card flex min-h-[400px] items-center justify-center p-10"
        >
          <AnimatePresence mode="wait">
            {/* Countdown */}
            {gameState === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-bold text-primary"
              >
                {countdown}
              </motion.div>
            )}

            {/* Ready State */}
            {gameState === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-4xl text-gray font-medium">
                  Prepara tu dedo...
                </div>
                <div className="text-2xl text-gray/70">
                  Toca cuando veas la señal
                </div>
              </motion.div>
            )}

            {/* Playing State - Signal */}
            {gameState === 'playing' && !tapped && (
              <motion.div
                key="playing"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="space-y-8 cursor-pointer"
                onClick={handleTap}
                onTouchStart={handleTap}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                  className="w-48 h-48 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
                >
                  <span className="text-6xl">⚡</span>
                </motion.div>
                <div className="text-3xl text-light font-bold">
                  ¡TOCA AHORA!
                </div>
              </motion.div>
            )}

            {/* Finished State */}
            {gameState === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {reactionTime !== null ? (
                  <>
                    <div className="text-5xl font-bold text-primary mb-4">
                      {reactionTime}ms
                    </div>
                    <div className="text-2xl text-light">
                      ¡Buen tiempo!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-5xl font-bold text-red-400 mb-4">
                      Anticipación
                    </div>
                    <div className="text-2xl text-gray">
                      Tocaste demasiado pronto
                    </div>
                  </>
                )}
                <div className="text-gray/70 mt-8">
                  Esperando a que todos terminen...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Instructions */}
        {gameState === 'playing' && !tapped && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray/70 mt-8"
          >
            Toca la pantalla lo más rápido que puedas cuando veas la señal
          </motion.p>
        )}

        {/* Terminate Game Button */}
        <div className="mt-8">
          <Button
            onClick={() => terminateMutation.mutate()}
            disabled={terminateMutation.isPending}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
            size="lg"
          >
            {terminateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Terminando...
              </>
            ) : (
              <>
                <X className="w-5 h-5 mr-2" />
                Terminar juego
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamePlaying;

