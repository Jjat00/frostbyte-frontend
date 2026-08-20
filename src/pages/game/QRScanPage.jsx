import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Gamepad2, KeyRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gamesService } from '@/services';

const QRScanPage = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generar ID único del dispositivo (almacenar en localStorage)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('frostbyte_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('frostbyte_device_id', deviceId);
    }
    return deviceId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (mode === 'join' && !roomCode.trim()) {
      setError('Ingresa el código de la sala');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const deviceId = getDeviceId();
      let roomData;

      if (mode === 'join') {
        roomData = await gamesService.joinRoom({
          room_code: roomCode.trim().toUpperCase(),
          player_name: playerName.trim(),
          player_device_id: deviceId,
        });
      } else {
        roomData = await gamesService.createRoom({
          player_name: playerName.trim(),
          player_device_id: deviceId,
        });
      }

      // Navegar a la sala
      navigate(`/game/room/${roomData.id}`, { state: { room: roomData } });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        (mode === 'join' ? 'Error al unirse a la sala' : 'Error al crear la sala');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fb-screen flex min-h-screen items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray hover:text-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <img loading="lazy" decoding="async" src="/logo.png" alt="Frostbyte" className="w-16 h-16" />
          </motion.div>
          <h1 className="font-display text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-light">
            Duelo Frostbyte
          </h1>
          <p className="mt-3 text-[0.8rem] text-light/50">Crea una sala o únete con un código</p>
        </div>

        {/* Form Card */}
        <div className="fb-card p-6 sm:p-8">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-dark rounded-xl border border-gray/20">
            <button
              type="button"
              onClick={() => { setMode('create'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'create'
                  ? 'border border-primary/40 bg-primary/10 text-light'
                  : 'text-gray hover:text-light'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Crear sala
            </button>
            <button
              type="button"
              onClick={() => { setMode('join'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'join'
                  ? 'border border-primary/40 bg-primary/10 text-light'
                  : 'text-gray hover:text-light'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Unirme
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Player Name Input */}
            <div className="space-y-2">
              <label htmlFor="player_name" className="text-sm text-gray font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Tu nombre
              </label>
              <input
                id="player_name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej: Juan, María..."
                maxLength={50}
                className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light placeholder-gray/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray/70">
                El nombre con el que aparecerás en el juego
              </p>
            </div>

            {/* Room Code Input (solo al unirse) */}
            {mode === 'join' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label htmlFor="room_code" className="text-sm text-gray font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Código de la sala
                </label>
                <input
                  id="room_code"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Ej: A6GCJ22O"
                  maxLength={8}
                  autoCapitalize="characters"
                  className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light placeholder-gray/50 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray/70">
                  Pídele el código a quien creó la sala
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="fb-btn fb-btn--accent w-full bg-transparent text-light hover:bg-transparent"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === 'join' ? 'Uniéndose...' : 'Creando sala...'}
                </>
              ) : mode === 'join' ? (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Entrar a la sala
                </>
              ) : (
                <>
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Crear sala
                </>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-gray/80 text-center">
              💡 <strong>Tip:</strong> Al crear la sala obtienes un código y un link para que tus amigos se unan
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScanPage;
