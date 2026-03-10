export const PLAYER_COLORS = [
  { id: 'magenta', hex: '#ff00d4', name: 'Magenta' },
  { id: 'cyan', hex: '#00e0ff', name: 'Cian' },
  { id: 'lime', hex: '#39ff14', name: 'Lima' },
  { id: 'orange', hex: '#ff6b00', name: 'Naranja' },
  { id: 'purple', hex: '#a855f7', name: 'Púrpura' },
  { id: 'red', hex: '#ef4444', name: 'Rojo' },
  { id: 'blue', hex: '#3b82f6', name: 'Azul' },
  { id: 'yellow', hex: '#facc15', name: 'Amarillo' },
  { id: 'pink', hex: '#f472b6', name: 'Rosa' },
  { id: 'teal', hex: '#14b8a6', name: 'Verde azulado' },
];

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
