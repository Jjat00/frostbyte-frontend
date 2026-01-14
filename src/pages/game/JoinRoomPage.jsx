import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Users, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gamesService } from '@/services';

const JoinRoomPage = () => {
  const { roomLink } = useParams();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generar ID único del dispositivo
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

    setIsLoading(true);
    setError('');

    try {
      const deviceId = getDeviceId();
      const roomData = await gamesService.joinRoom({
        room_link: roomLink,
        player_name: playerName.trim(),
        player_device_id: deviceId,
      });

      // Navegar a la sala
      navigate(`/game/room/${roomData.id}`, { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al unirse a la sala';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

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
            <img src="/logo.png" alt="Frostbyte" className="w-16 h-16" />
          </motion.div>
          <h1 className="text-3xl font-bold text-light tracking-wider mb-2">
            Unirse a Duelo Frostbyte
          </h1>
          <p className="text-gray">Ingresa tu nombre para entrar</p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-gray/20 rounded-2xl p-8 shadow-2xl shadow-primary/10">
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uniéndose...
                </>
              ) : (
                'Entrar a la sala'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoomPage;

