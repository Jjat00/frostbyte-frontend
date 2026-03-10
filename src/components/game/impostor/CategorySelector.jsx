import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Music, UtensilsCrossed, Film, Globe,
  Bug, Briefcase, PartyPopper, Tag, Gamepad2, Shuffle,
} from 'lucide-react';
import { CATEGORIES } from '@/data/impostorWords';

const ICON_MAP = {
  Trophy, Music, UtensilsCrossed, Film, Globe,
  Bug, Briefcase, PartyPopper, Tag, Gamepad2,
};

const CategorySelector = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-light">Categoría</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Opción aleatoria */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect('random')}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
            selected === 'random'
              ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
              : 'border-gray/20 bg-dark/40 hover:border-gray/40'
          }`}
        >
          <Shuffle className="w-6 h-6 text-primary" />
          <span className="text-xs font-medium text-light">Aleatorio</span>
        </motion.button>

        {/* Categorías */}
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Tag;
          const isSelected = selected === cat.slug;

          return (
            <motion.button
              key={cat.slug}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.slug)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-secondary bg-secondary/20 shadow-lg shadow-secondary/20'
                  : 'border-gray/20 bg-dark/40 hover:border-gray/40'
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? 'text-secondary' : 'text-gray/60'}`} />
              <span className="text-xs font-medium text-light">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
