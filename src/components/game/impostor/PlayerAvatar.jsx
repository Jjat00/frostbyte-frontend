import React from 'react';
import { getInitials } from '@/data/impostorAvatars';

const PlayerAvatar = ({ name, color, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${sizes[size]} ${className}`}
      style={{
        backgroundColor: `${color}30`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 12px ${color}40`,
      }}
    >
      {getInitials(name)}
    </div>
  );
};

export default PlayerAvatar;
