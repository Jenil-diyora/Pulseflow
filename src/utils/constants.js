export const GAME_CONSTANTS = {
  TARGET_RADIUS: 145,

  // NEW: Human-centered difficulty parameters
  // These replace the old linear speed scaling
  INITIAL_SPEED: 1.5,        // Starting speed (px/frame)
  MAX_SPEED: 4.5,            // Biological cap (allows 150-180ms reaction)
  SPEED_INCREMENT: 0.1,      // DEPRECATED: kept for compatibility

  INITIAL_TOLERANCE: 20,     // Starting timing window
  MIN_TOLERANCE: 10,         // Minimum playable tolerance

  // Visual feedback
  PARTICLE_COUNT: 20,
  FLASH_OPACITY: 0.15,
  RING_SCALE_POP: 1.1,

  // Legacy compatibility (kept for old saves)
  TOLERANCE: 20,             // DEPRECATED: use dynamic tolerance
};

export const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
};

export const STORAGE_KEYS = {
  HIGH_SCORES: '@pulse_tap_high_scores',
  BEST_SCORE: '@pulse_tap_best_score',
  TOTAL_GAMES: '@pulse_tap_total_games',
  QUEST_PROGRESS: '@pulse_tap_quest_progress',
  UNLOCKED_THEMES: '@pulse_tap_unlocked_themes',
  SETTINGS: '@pulse_tap_settings',
  STATS: '@pulse_tap_stats',
  USER_NAME: '@pulse_tap_user_name',
  USER_LEVEL: '@pulse_tap_user_level',
  USER_XP: '@pulse_tap_user_xp',
  USER_LABELS: '@pulse_tap_user_labels',
  SELECTED_THEME: '@pulse_tap_selected_theme',
  AUTO_THEME: '@pulse_tap_auto_theme',
  DAILY_QUESTS_DATA: '@pulse_tap_daily_quests_data',
  WEEKLY_QUESTS_DATA: '@pulse_tap_weekly_quests_data',
  PREMIUM_STATUS: '@pulse_tap_premium_status',
  AD_FREE_EXPIRY: '@pulse_tap_ad_free_expiry',
};

// Shape types
export const SHAPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  TRIANGLE: 'triangle',
  HEXAGON: 'hexagon',
  PENTAGON: 'pentagon',
  STAR: 'star',
};

// Shape progression based on score milestones (matching HTML logic)
export const SHAPE_MILESTONES = [
  { minScore: 0, maxScore: 9, shape: SHAPES.CIRCLE },
  { minScore: 10, maxScore: 24, shape: SHAPES.SQUARE },
  { minScore: 25, maxScore: 49, shape: SHAPES.TRIANGLE },
  { minScore: 50, maxScore: 74, shape: SHAPES.HEXAGON },
  { minScore: 75, maxScore: 99, shape: SHAPES.PENTAGON },
  { minScore: 100, maxScore: 9999, shape: SHAPES.STAR },
];

export const getShapeForScore = (score) => {
  const milestone = SHAPE_MILESTONES.find(
    m => score >= m.minScore && score <= m.maxScore
  );
  return milestone ? milestone.shape : SHAPES.CIRCLE;
};

// Color interpolation matching HTML formula
export const getBackgroundColorForScore = (score) => {
  const colorShift = Math.min(score * 5, 100);
  return {
    r: 15 + (colorShift / 2),
    g: 23,
    b: 42 + colorShift,
  };
};

// Reflex performance ratings
export const REFLEX_RATINGS = [
  { minScore: 0, maxScore: 5, title: 'Beginner', message: 'Keep practicing! 🎯', emoji: '🐢', color: '#94a3b8' },
  { minScore: 6, maxScore: 15, title: 'Casual Player', message: 'You\'re getting the hang of it! 👍', emoji: '🚶', color: '#60a5fa' },
  { minScore: 16, maxScore: 30, title: 'Quick Tapper', message: 'Nice reflexes! 🎮', emoji: '🏃', color: '#34d399' },
  { minScore: 31, maxScore: 50, title: 'Speed Demon', message: 'Those are some fast fingers! ⚡', emoji: '🏎️', color: '#fbbf24' },
  { minScore: 51, maxScore: 75, title: 'F1 Racer', message: 'Lightning fast reactions! 🏁', emoji: '🏎️', color: '#f97316' },
  { minScore: 76, maxScore: 100, title: 'Pro Gamer', message: 'Incredible precision! 🎯', emoji: '🎮', color: '#a855f7' },
  { minScore: 101, maxScore: 150, title: 'Superhuman', message: 'Are you even human? 🚀', emoji: '🦸', color: '#ec4899' },
  { minScore: 151, maxScore: 999, title: 'LEGEND', message: 'You are a LEGEND! 👑', emoji: '👑', color: '#fbbf24' },
];

export const getReflexRating = (score, accuracy = 0) => {
  const scoreRating = REFLEX_RATINGS.find(
    r => score >= r.minScore && score <= r.maxScore
  ) || REFLEX_RATINGS[REFLEX_RATINGS.length - 1];

  let bonusMessage = '';
  if (accuracy >= 90) {
    bonusMessage = ' Perfect accuracy! 💯';
  } else if (accuracy >= 75) {
    bonusMessage = ' Great precision! ✨';
  }

  return {
    ...scoreRating,
    message: scoreRating.message + bonusMessage,
  };
};

export const LAYOUT = {
  PADDING: 24,
  RADIUS: 24,
  GAP: 16,
  GUTTER: 12,
  INNER_RADIUS: 18,
};

