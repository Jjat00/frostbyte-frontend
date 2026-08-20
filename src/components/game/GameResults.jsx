import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Home, Award, LogOut, Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gamesService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const GameResults = ({ room, roomId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [results, setResults] = useState([]);
  const [currentParticipantId, setCurrentParticipantId] = useState(null);

  // Obtener participante actual
  useEffect(() => {
    const deviceId = localStorage.getItem('frostbyte_device_id');
    const participant = room.participants?.find(p => p.player_device_id === deviceId);
    if (participant) {
      setCurrentParticipantId(participant.id);
    }
  }, [room]);

  // Calcular resultados agregados
  useEffect(() => {
    if (room.rounds && room.participants) {
      const participantScores = {};

      // Inicializar scores
      room.participants.forEach(participant => {
        participantScores[participant.id] = {
          participant,
          totalTime: 0,
          rounds: 0,
          disqualifications: 0,
          noTaps: 0,
        };
      });

      // Calcular tiempos totales
      room.rounds.forEach(round => {
        if (round.results) {
          round.results.forEach(result => {
            const score = participantScores[result.participant];
            if (score) {
              if (result.is_disqualified) {
                score.disqualifications += 1;
              } else if (result.did_not_tap) {
                score.noTaps += 1;
              } else if (result.reaction_time_ms) {
                score.totalTime += result.reaction_time_ms;
                score.rounds += 1;
              }
            }
          });
        }
      });

      // Convertir a array y ordenar (menor tiempo = mejor)
      const resultsArray = Object.values(participantScores)
        .map(score => ({
          ...score,
          averageTime: score.rounds > 0 ? Math.round(score.totalTime / score.rounds) : null,
        }))
        .sort((a, b) => {
          // Primero por número de rondas completadas (mayor = mejor)
          if (a.rounds !== b.rounds) {
            return b.rounds - a.rounds;
          }
          // Luego por tiempo promedio (menor = mejor)
          if (a.averageTime && b.averageTime) {
            return a.averageTime - b.averageTime;
          }
          if (a.averageTime) return -1;
          if (b.averageTime) return 1;
          return 0;
        });

      setResults(resultsArray);
    }
  }, [room]);

  // Mutation para nuevo juego (rematch)
  const rematchMutation = useMutation({
    mutationFn: () => gamesService.rematch(roomId),
    onSuccess: (data) => {
      // Actualizar cache de React Query
      queryClient.setQueryData(['gameRoom', roomId], data);
      queryClient.invalidateQueries(['gameRoom', roomId]);
      // El WebSocket actualizará el estado y GameRoomPage mostrará el lobby automáticamente
    },
  });

  const handleNewGame = () => {
    rematchMutation.mutate();
  };

  const handleExitRoom = async () => {
    const deviceId = localStorage.getItem('frostbyte_device_id');
    if (deviceId) {
      try {
        await gamesService.leaveRoom(roomId, deviceId);
      } catch (error) {
        console.error('Error al salir de la sala:', error);
      }
    }
    navigate('/game/duelo-frostbyte/play');
  };

  // Mutation para terminar juego
  const terminateMutation = useMutation({
    mutationFn: () => gamesService.terminateRoom(roomId),
    onSuccess: () => {
      navigate('/game/duelo-frostbyte/play');
    },
  });

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}°`;
    }
  };

  const getParticipantColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-300';
      case 2: return 'text-orange-400';
      default: return 'text-gray';
    }
  };

  return (
    <div className="fb-screen min-h-screen p-4">

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <Trophy className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h1 className="font-display text-[1.35rem] font-semibold uppercase tracking-[0.14em] text-light">
            ¡Juego Terminado!
          </h1>
          <p className="mt-3 text-[0.8rem] text-light/50">Resultados finales</p>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fb-card mb-6 p-6"
        >
          <div className="space-y-4">
            {results.map((result, index) => {
              const isCurrentPlayer = result.participant.id === currentParticipantId;
              return (
                <motion.div
                  key={result.participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrentPlayer
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-dark border-gray/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`text-3xl ${getParticipantColor(index)}`}>
                        {getRankEmoji(index)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            isCurrentPlayer ? 'text-primary' : 'text-light'
                          }`}>
                            {result.participant.player_name}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-xs text-primary">(Tú)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray/70 mt-1">
                          {result.rounds} {result.rounds === 1 ? 'ronda' : 'rondas'} completadas
                          {result.disqualifications > 0 && (
                            <span className="ml-2 text-red-400">
                              • {result.disqualifications} anticipaciones
                            </span>
                          )}
                          {result.noTaps > 0 && (
                            <span className="ml-2 text-gray/50">
                              • {result.noTaps} sin respuesta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {result.averageTime !== null ? (
                        <>
                          <div className="text-2xl font-bold text-light">
                            {result.averageTime}ms
                          </div>
                          <div className="text-xs text-gray/70">
                            promedio
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray/50">
                          Sin tiempo
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleNewGame}
              disabled={rematchMutation.isPending || !room.order_is_active}
              size="lg"
              className="fb-btn fb-btn--accent bg-transparent text-light hover:bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" />
              Nuevo juego
            </Button>
            <Button
              onClick={handleExitRoom}
              variant="outline"
              size="lg"
              className="border-red-400/50 text-red-400 hover:bg-red-400/20 hover:border-red-400"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Salir del juego
            </Button>
          </div>
          
          {/* Terminate Game Button */}
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
        </motion.div>

        {/* Message if order is not active */}
        {!room.order_is_active && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray/70 mt-4 text-sm"
          >
            El pedido ya no está activo. No se puede iniciar un nuevo juego.
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default GameResults;

