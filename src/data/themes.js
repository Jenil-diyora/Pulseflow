export const THEMES = [
  {
    id: 'ocean',
    name: 'Ocean',
    background: ['#0f172a', '#1e3a5f', '#2563eb'],
    ringColor: '#22d3ee',
    pulseColor: '#06b6d4',
    particleColor: '#67e8f9',
    unlockScore: 0,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    background: ['#1e1b4b', '#7c2d12', '#dc2626'],
    ringColor: '#fb923c',
    pulseColor: '#f97316',
    particleColor: '#fdba74',
    unlockScore: 10,
  },
  {
    id: 'forest',
    name: 'Forest',
    background: ['#14532d', '#064e3b', '#065f46'],
    ringColor: '#4ade80',
    pulseColor: '#22c55e',
    particleColor: '#86efac',
    unlockScore: 25,
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    background: ['#1e1b4b', '#4c1d95', '#7c3aed'],
    ringColor: '#c084fc',
    pulseColor: '#a855f7',
    particleColor: '#d8b4fe',
    unlockScore: 50,
  },
  {
    id: 'neon',
    name: 'Neon',
    background: ['#18181b', '#3f3f46', '#71717a'],
    ringColor: '#a3e635',
    pulseColor: '#84cc16',
    particleColor: '#bef264',
    unlockScore: 75,
  },
  {
    id: 'fire',
    name: 'Fire',
    background: ['#450a0a', '#7f1d1d', '#b91c1c'],
    ringColor: '#fbbf24',
    pulseColor: '#f59e0b',
    particleColor: '#fcd34d',
    unlockScore: 100,
  },
  {
    id: 'ice',
    name: 'Ice',
    background: ['#0c4a6e', '#075985', '#0369a1'],
    ringColor: '#7dd3fc',
    pulseColor: '#38bdf8',
    particleColor: '#a5f3fc',
    unlockScore: 150,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    background: ['#1e293b', '#374151', '#4b5563'],
    ringColor: '#34d399',
    pulseColor: '#10b981',
    particleColor: '#6ee7b7',
    unlockScore: 200,
  },
];

export const getThemeByScore = (score) => {
  const availableThemes = THEMES.filter(theme => score >= theme.unlockScore);
  return availableThemes[availableThemes.length - 1] || THEMES[0];
};

export const getUnlockedThemes = (highestScore) => {
  return THEMES.filter(theme => highestScore >= theme.unlockScore);
};
