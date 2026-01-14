import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Copy,
  Check,
  Play,
  Loader2,
  AlertCircle,
  Share2,
  Settings,
  RefreshCw,
  Wifi,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { gamesService } from "@/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameRoomWebSocket } from "@/hooks/useGameRoomWebSocket";
import GamePlaying from "@/components/game/GamePlaying";
import GameResults from "@/components/game/GameResults";

const GameRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState(null); // Inicializar en null en lugar de 3
  const [tempSelectedRounds, setTempSelectedRounds] = useState(null); // Selección temporal de otros jugadores
  const [playerName, setPlayerName] = useState("");
  const mountedRef = useRef(true);

  // Obtener datos iniciales de la sala
  const {
    data: initialRoom,
    isLoading: isLoadingInitial,
    error: initialError,
  } = useQuery({
    queryKey: ["gameRoom", roomId],
    queryFn: () => gamesService.getRoomStatus(roomId),
    enabled: !!roomId,
  });

  // Estado local para la sala (actualizado por WebSocket)
  // Inicializar con null en lugar de undefined para evitar problemas con React
  const [room, setRoomState] = useState(initialRoom || null);
  const isLoading = isLoadingInitial && !room;
  const error = initialError;

  // Función wrapper para setRoom que verifica si el componente está montado
  // Esto previene errores de DOM cuando el componente se desmonta mientras hay actualizaciones pendientes
  const setRoom = useCallback((newRoom) => {
    if (mountedRef.current) {
      setRoomState(newRoom);
    }
  }, []);

  // Efecto para limpiar cuando el componente se desmonta
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // WebSocket para actualizaciones en tiempo real
  const { isConnected: wsConnected, sendMessage } = useGameRoomWebSocket(
    roomId,
    (updatedRoomData) => {
      // Solo actualizar estado si el componente está montado
      if (!mountedRef.current) {
        return;
      }

      // Si el status es 'playing' o 'finished', actualizar tanto el cache como el estado local
      if (
        updatedRoomData.status === "playing" ||
        updatedRoomData.status === "finished"
      ) {
        // Actualizar React Query cache
        queryClient.setQueryData(["gameRoom", roomId], updatedRoomData);
        // También actualizar el estado local si el componente está montado
        // Esto permite que GameRoomPage detecte el cambio y renderice GamePlaying o GameResults
        if (mountedRef.current) {
          setRoom(updatedRoomData);
        }
        return;
      }

      // Actualizar estado cuando llega actualización por WebSocket
      // Verificar una vez más que el componente sigue montado (doble verificación)
      if (!mountedRef.current) {
        return;
      }

      setRoom(updatedRoomData);
      // También actualizar React Query cache (esto es seguro siempre)
      queryClient.setQueryData(["gameRoom", roomId], updatedRoomData);
      // Sincronizar selectedRounds solo si las rondas están confirmadas (status === 'configuring')
      if (
        updatedRoomData.total_rounds &&
        updatedRoomData.status === "configuring" &&
        mountedRef.current
      ) {
        setSelectedRounds(updatedRoomData.total_rounds);
      }
    },
    !!roomId && !error && room?.status !== "playing", // Deshabilitar WebSocket cuando el juego está jugando
    (rounds) => {
      // Solo actualizar si el componente está montado
      if (!mountedRef.current) return;
      // Cuando otro jugador selecciona rondas temporalmente
      setTempSelectedRounds(rounds);
      // Limpiar después de un tiempo
      setTimeout(() => {
        if (mountedRef.current) {
          setTempSelectedRounds(null);
        }
      }, 5000);
    }
  );

  // Sincronizar con datos iniciales cuando cargan
  useEffect(() => {
    // Sincronizar siempre con initialRoom si está disponible y el componente está montado
    if (initialRoom && mountedRef.current) {
      setRoom(initialRoom);
      // Solo sincronizar selectedRounds si las rondas están confirmadas
      if (initialRoom.total_rounds && initialRoom.status === "configuring") {
        setSelectedRounds(initialRoom.total_rounds);
      } else if (initialRoom.status !== "configuring") {
        setSelectedRounds(null);
      }
    }
  }, [initialRoom, setRoom]);

  // Sincronizar selectedRounds cuando room cambia (desde WebSocket u otras fuentes)
  // Solo sincronizar si las rondas están confirmadas (status === 'configuring')
  useEffect(() => {
    // Solo sincronizar si el componente está montado y no está en estado 'playing'
    if (!mountedRef.current || room?.status === "playing") {
      return;
    }

    if (room?.total_rounds && room?.status === "configuring") {
      setSelectedRounds(room.total_rounds);
    } else if (room?.status === "waiting") {
      // Si estamos en waiting, no sincronizar desde el servidor
      // Mantener la selección local del usuario
    }
  }, [room?.total_rounds, room?.status]);

  // Redirigir si el juego fue terminado (todos los participantes fueron eliminados)
  useEffect(() => {
    if (room?.status === "finished" && room?.participant_count === 0) {
      // El juego fue terminado por "Terminar juego", redirigir a todos los jugadores
      navigate("/game/duelo-frostbyte/play");
    }
  }, [room?.status, room?.participant_count, navigate]);

  // NO marcar como desmontado cuando el status es 'playing'
  // Necesitamos seguir recibiendo actualizaciones para detectar cuando cambia a 'finished'
  // El componente sigue montado, solo renderiza GamePlaying en lugar del lobby
  useEffect(() => {
    // Asegurarse de que mountedRef esté en true cuando el componente está activo
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
  }, []);

  // Mutation para configurar rondas
  const configureMutation = useMutation({
    mutationFn: (rounds) => gamesService.configureRoom(roomId, rounds),
    onSuccess: (data) => {
      // Solo actualizar si el componente está montado
      if (!mountedRef.current) {
        return;
      }

      // Verificar que el status no sea 'playing' antes de actualizar
      if (data.status === "playing") {
        return;
      }

      // Actualizar estado local inmediatamente para respuesta rápida
      setRoom(data);
      setSelectedRounds(data.total_rounds);
      queryClient.setQueryData(["gameRoom", roomId], data);
      // El WebSocket también actualizará, pero esto es para respuesta inmediata
    },
  });

  // Mutation para iniciar juego
  const startMutation = useMutation({
    mutationFn: () => gamesService.startGame(roomId),
    onSuccess: (data) => {
      // Actualizar React Query cache para que GamePlaying tenga los datos actualizados
      queryClient.setQueryData(["gameRoom", roomId], data);
      // También actualizar el estado local para respuesta inmediata
      if (mountedRef.current) {
        setRoom(data);
      }
    },
  });

  const terminateMutation = useMutation({
    mutationFn: () => gamesService.terminateRoom(roomId),
    onSuccess: (data) => {
      // Solo actualizar si el componente está montado
      if (!mountedRef.current) {
        // Redirigir de todas formas
        navigate("/game/duelo-frostbyte/play");
        return;
      }

      setRoom(data);
      queryClient.setQueryData(["gameRoom", roomId], data);
      // Redirigir a la página de escaneo QR después de terminar
      navigate("/game/duelo-frostbyte/play");
    },
  });

  // Copiar link de la sala
  const copyRoomLink = () => {
    if (room?.room_link && mountedRef.current) {
      const fullUrl = `${window.location.origin}/game/join/${room.room_link}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => {
        if (mountedRef.current) {
          setCopiedLink(false);
        }
      }, 2000);
    }
  };

  // Compartir link
  const shareRoomLink = async () => {
    if (room?.room_link) {
      const fullUrl = `${window.location.origin}/game/join/${room.room_link}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "¡Únete a mi Duelo Frostbyte!",
            text: "Vamos a jugar Duelo Frostbyte. Únete a mi sala!",
            url: fullUrl,
          });
        } catch (err) {
          // Usuario canceló el share
        }
      } else {
        copyRoomLink();
      }
    }
  };

  // Obtener nombre del jugador actual
  useEffect(() => {
    // Solo actualizar si el componente está montado
    if (!mountedRef.current || room?.status === "playing") {
      return;
    }

    const deviceId = localStorage.getItem("frostbyte_device_id");
    if (room?.participants && deviceId) {
      const currentPlayer = room.participants.find(
        (p) => p.player_device_id === deviceId
      );
      if (currentPlayer && mountedRef.current) {
        setPlayerName(currentPlayer.player_name);
      }
    }
  }, [room]);

  // Handler para seleccionar rondas (temporal, sin confirmar)
  const handleSelectRounds = (rounds) => {
    setSelectedRounds(rounds);
    // Enviar selección temporal a otros jugadores vía WebSocket
    if (sendMessage && wsConnected) {
      sendMessage({ type: "temp_round_selection", rounds });
    }
  };

  // Handler para configurar rondas
  const handleConfigureRounds = () => {
    if (selectedRounds) {
      configureMutation.mutate(selectedRounds);
    }
  };

  // Handler para iniciar juego
  const handleStartGame = () => {
    if (room?.participant_count < 2) {
      return;
    }
    startMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-light mb-2">Error</h2>
          <p className="text-gray mb-4">
            {error?.message || "No se pudo cargar la sala"}
          </p>
          <Button onClick={() => navigate("/game")}>
            Ver juegos
          </Button>
        </div>
      </div>
    );
  }

  // Early return si el status es 'playing' - después de verificar que room existe
  if (room.status === "playing") {
    return <GamePlaying room={room} roomId={roomId} />;
  }

  // Si el juego está finalizado, mostrar resultados (solo si no fue terminado con "Terminar juego")
  // Si participant_count === 0, significa que fue terminado con "Terminar juego" y el useEffect redirigirá
  if (room.status === "finished" && room.participant_count > 0) {
    return <GameResults room={room} roomId={roomId} />;
  }

  // Si el juego fue terminado (sin participantes), el useEffect redirigirá
  if (room.status === "finished" && room.participant_count === 0) {
    return null; // El useEffect redirigirá
  }

  // Estado: waiting o configuring (lobby)
  return (
    <div className="min-h-screen bg-dark p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-light tracking-wider">
              Duelo Frostbyte
            </h1>
            {wsConnected && (
              <Wifi
                className="w-5 h-5 text-green-400"
                title="Conectado en tiempo real"
              />
            )}
          </div>
          <p className="text-gray">Sala: {room.room_code}</p>
          <p className="text-sm text-gray/70">Mesa {room.table_number}</p>
        </div>

        {/* Room Info Card */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-gray/20 rounded-2xl p-6 mb-6 shadow-2xl shadow-primary/10">
          {/* Share Link Section */}
          <div className="mb-6">
            <label className="text-sm text-gray font-medium mb-2 block">
              Comparte este link con tus amigos
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/game/join/${room.room_link}`}
                readOnly
                className="flex-1 px-4 py-2 bg-dark border border-gray/20 rounded-lg text-light text-sm"
              />
              <Button
                onClick={copyRoomLink}
                variant="outline"
                size="icon"
                className="border-gray/20"
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={shareRoomLink}
                variant="outline"
                size="icon"
                className="border-gray/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Participants Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-light font-medium">
                  Jugadores ({room.participant_count})
                </span>
              </div>
              {room.participant_count < 2 && (
                <span className="text-sm text-yellow-400">
                  Mínimo 2 jugadores
                </span>
              )}
            </div>
            <div className="space-y-2">
              {room.participants?.map((participant) => {
                const deviceId = localStorage.getItem("frostbyte_device_id");
                const isCurrentPlayer =
                  participant.player_device_id === deviceId;

                return (
                  <div
                    key={participant.id}
                    className="p-3 bg-dark rounded-lg border border-gray/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-light">
                          {participant.player_name}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-xs text-primary">(Tú)</span>
                        )}
                      </div>
                      {isCurrentPlayer && (
                        <Button
                          onClick={async () => {
                            if (deviceId && roomId) {
                              try {
                                await gamesService.leaveRoom(roomId, deviceId);
                              } catch (error) {
                                console.error(
                                  "Error al salir de la sala:",
                                  error
                                );
                              }
                            }
                            navigate("/game/duelo-frostbyte/play");
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          title="Salir del juego"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configure Rounds Section */}
          {(room.status === "waiting" || room.status === "configuring") && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <span className="text-light font-medium">
                  Configurar rondas
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 3, 5].map((rounds) => {
                  // Prioridad: confirmado del servidor > selección local > selección temporal de otro
                  const isConfirmed =
                    room.total_rounds === rounds &&
                    room.status === "configuring";
                  const isSelected = !isConfirmed && selectedRounds === rounds;
                  const isTempSelected =
                    !isConfirmed &&
                    !isSelected &&
                    tempSelectedRounds === rounds;

                  return (
                    <button
                      key={rounds}
                      onClick={() => handleSelectRounds(rounds)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        isConfirmed || isSelected
                          ? "bg-primary text-dark border-primary font-bold"
                          : isTempSelected
                          ? "bg-primary/50 text-light border-primary/50"
                          : "bg-dark text-gray border-gray/20 hover:border-primary/50"
                      }`}
                    >
                      {rounds} {rounds === 1 ? "ronda" : "rondas"}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={handleConfigureRounds}
                disabled={configureMutation.isPending || !selectedRounds}
                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-dark font-bold"
              >
                {configureMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : room.status === "configuring" &&
                  room.total_rounds === selectedRounds ? (
                  "Rondas confirmadas"
                ) : (
                  "Confirmar rondas"
                )}
              </Button>
            </div>
          )}

          {/* Terminate Game Button - Available in all states */}
          <Button
            onClick={() => terminateMutation.mutate()}
            disabled={terminateMutation.isPending}
            variant="outline"
            className="w-full mb-3 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
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

          {/* Start Game Button */}
          {room.status === "configuring" && room.participant_count >= 2 && (
            <Button
              onClick={handleStartGame}
              disabled={startMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold text-lg py-6"
              size="lg"
            >
              {startMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  ¡Comenzar juego!
                </>
              )}
            </Button>
          )}

          {/* Waiting Message */}
          {room.status === "waiting" &&
            room.participant_count >= 2 &&
            room.total_rounds > 0 && (
              <div className="text-center text-gray/70 text-sm">
                Esperando configuración de rondas...
              </div>
            )}

          {/* Botón para salir cuando solo hay un jugador */}
          {room.participant_count < 2 && (
            <Button
              onClick={async () => {
                const deviceId = localStorage.getItem("frostbyte_device_id");
                if (deviceId && roomId) {
                  try {
                    await gamesService.leaveRoom(roomId, deviceId);
                  } catch (error) {
                    console.error("Error al salir de la sala:", error);
                  }
                }
                navigate("/game/duelo-frostbyte/play");
              }}
              variant="outline"
              className="w-full mt-4 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
              size="lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Salir de la sala
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
