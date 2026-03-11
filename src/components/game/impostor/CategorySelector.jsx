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
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Opción aleatoria */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect('random')}
          className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border-2 transition-all overflow-hidden ${
            selected === 'random'
              ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
              : 'border-gray/20 bg-dark/40 hover:border-gray/40'
          }`}
        >
          <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-medium text-light text-center leading-tight">Aleatorio</span>
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
              className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border-2 transition-all overflow-hidden ${
                isSelected
                  ? 'border-secondary bg-secondary/20 shadow-lg shadow-secondary/20'
                  : 'border-gray/20 bg-dark/40 hover:border-gray/40'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${isSelected ? 'text-secondary' : 'text-gray/60'}`} />
              <span className="text-[10px] sm:text-xs font-medium text-light text-center leading-tight">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
