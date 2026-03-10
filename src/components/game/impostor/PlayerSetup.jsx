import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAYER_COLORS } from '@/data/impostorAvatars';
import PlayerAvatar from './PlayerAvatar';

const PlayerSetup = ({ players, onAddPlayer, onRemovePlayer }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);

  const usedColors = players.map((p) => p.color);
  const availableColors = PLAYER_COLORS.filter((c) => !usedColors.includes(c.hex));

  const handleAdd = () => {
    if (!name.trim() || !selectedColor) return;
    onAddPlayer(name.trim(), selectedColor);
    setName('');
    setSelectedColor(availableColors.length > 1 ? null : null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-bold text-light">
          Jugadores ({players.length}/10)
        </h3>
      </div>

      {/* Lista de jugadores */}
      <div className="space-y-2">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 bg-dark/60 border border-gray/20 rounded-xl px-4 py-3"
            >
              <PlayerAvatar name={player.name} color={player.color} size="sm" />
              <span className="flex-1 text-light font-medium">{player.name}</span>
              <button
                onClick={() => onRemovePlayer(player.id)}
                className="text-gray/60 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Agregar jugador */}
      {players.length < 10 && (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del jugador"
            maxLength={20}
            className="w-full bg-dark/60 border border-gray/30 rounded-xl px-4 py-3 text-light placeholder:text-gray/40 focus:border-secondary/50 focus:outline-none transition-colors"
          />

          {/* Selector de color */}
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.hex)}
                className={`w-9 h-9 rounded-full transition-all ${
                  selectedColor === color.hex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-dark scale-110'
                    : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow:
                    selectedColor === color.hex ? `0 0 16px ${color.hex}` : 'none',
                }}
                title={color.name}
              />
            ))}
          </div>

          <Button
            onClick={handleAdd}
            disabled={!name.trim() || !selectedColor}
            className="w-full bg-secondary/20 border border-secondary/30 text-secondary hover:bg-secondary/30 disabled:opacity-40"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar jugador
          </Button>
        </div>
      )}

      {players.length < 3 && (
        <p className="text-sm text-gray/50 text-center">
          Se necesitan al menos 3 jugadores para empezar
        </p>
      )}
    </div>
  );
};

export default PlayerSetup;
