export const QUESTS = [
  // Precision Achievements
  {
    id: 'perfect_shot',
    title: 'Perfect Shot',
    description: 'Hit 5 perfect taps in a single game',
    type: 'streak',
    target: 5,
    difficulty: 'easy',
    reward: { xp: 50, type: 'XP' },
    icon: 'TargetIcon',
    category: 'Precision',
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Hit 10 perfect taps in a row',
    type: 'streak',
    target: 10,
    difficulty: 'medium',
    reward: { xp: 150, type: 'XP' },
    icon: 'SparklesIcon',
    category: 'Precision',
  },
  {
    id: 'sniper_elite',
    title: 'Sniper Elite',
    description: 'Hit 25 perfect taps in a row',
    type: 'streak',
    target: 25,
    difficulty: 'hard',
    reward: { label: 'Elite Sniper', type: 'Label' },
    icon: 'StarIcon',
    category: 'Precision',
  },
  {
    id: 'perfect_harmony',
    title: 'Perfect Harmony',
    description: 'Hit 50 perfect taps in a row',
    type: 'streak',
    target: 50,
    difficulty: 'hard',
    reward: { label: 'Zen Master', theme: 'neon', type: 'Label + Theme' },
    icon: 'CelebrationIcon',
    category: 'Precision',
  },

  // Score Milestones
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Score 10 points in a single game',
    type: 'score',
    target: 10,
    difficulty: 'easy',
    reward: { xp: 50, theme: 'sunset', type: 'XP + Theme' },
    icon: 'TargetIcon',
    category: 'Score',
  },
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Score 50 points in a single game',
    type: 'score',
    target: 50,
    difficulty: 'medium',
    reward: { xp: 200, theme: 'forest', type: 'XP + Theme' },
    icon: 'TrophyIcon',
    category: 'Score',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Score 100 points in a single game',
    type: 'score',
    target: 100,
    difficulty: 'medium',
    reward: { xp: 500, theme: 'galaxy', type: 'XP + Theme' },
    icon: 'FireIcon',
    category: 'Score',
  },
  {
    id: 'legendary_status',
    title: 'Legendary Status',
    description: 'Score 200 points in a single game',
    type: 'score',
    target: 200,
    difficulty: 'hard',
    reward: { label: 'Legend', theme: 'aurora', type: 'Label + Theme' },
    icon: 'DiamondIcon',
    category: 'Score',
  },
  {
    id: 'mythic_power',
    title: 'Mythic Power',
    description: 'Score 500 points in a single game',
    type: 'score',
    target: 500,
    difficulty: 'hard',
    reward: { label: 'Demigod', theme: 'mythic', type: 'Label + Theme' },
    icon: 'CrownIcon',
    category: 'Score',
  },

  // Mastery Achievements
  {
    id: 'dedicated',
    title: 'Dedicated Player',
    description: 'Play 10 games',
    type: 'games_played',
    target: 10,
    difficulty: 'easy',
    reward: { xp: 100, type: 'XP' },
    icon: 'GamepadIcon',
    category: 'Mastery',
  },
  {
    id: 'committed',
    title: 'Committed',
    description: 'Play 50 games',
    type: 'games_played',
    target: 50,
    difficulty: 'medium',
    reward: { xp: 300, type: 'XP' },
    icon: 'MedalIcon',
    category: 'Mastery',
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Play 100 games',
    type: 'games_played',
    target: 100,
    difficulty: 'hard',
    reward: { label: 'Veteran', xp: 1000, type: 'Label + XP' },
    icon: 'TrophyIcon',
    category: 'Mastery',
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Maintain 80%+ accuracy over 20 games',
    type: 'accuracy_sustained',
    target: 80,
    difficulty: 'hard',
    reward: { label: 'The Consistent', theme: 'galaxy', type: 'Label + Theme' },
    icon: 'DiamondIcon',
    category: 'Mastery',
  },

  // Speed Achievements
  {
    id: 'quick_reflexes',
    title: 'Quick Reflexes',
    description: 'Survive for 30 seconds',
    type: 'survival',
    target: 30,
    difficulty: 'easy',
    reward: { xp: 100, type: 'XP' },
    icon: 'TimerIcon',
    category: 'Speed',
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Survive for 60 seconds',
    type: 'survival',
    target: 60,
    difficulty: 'medium',
    reward: { xp: 250, type: 'XP' },
    icon: 'TimerIcon',
    category: 'Speed',
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Survive for 120 seconds',
    type: 'survival',
    target: 120,
    difficulty: 'hard',
    reward: { label: 'Time Lord', theme: 'fire', type: 'Label + Theme' },
    icon: 'TimerIcon',
    category: 'Speed',
  },

  // Special Achievements
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Beat your best score by 50+ points',
    type: 'special',
    target: 50,
    difficulty: 'medium',
    reward: { xp: 500, type: 'XP' },
    icon: 'StarIcon',
    category: 'Special',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Play 10 games between 10 PM and 6 AM',
    type: 'special',
    target: 10,
    difficulty: 'medium',
    reward: { xp: 200, type: 'XP' },
    icon: 'SnowflakeIcon',
    category: 'Special',
  },
];

export const DAILY_QUESTS = [
  {
    id: 'daily_play_3',
    title: 'Daily Exercises',
    description: 'Play 3 games today',
    type: 'games_played',
    target: 3,
    reward: { xp: 100, type: 'XP' },
    icon: 'GamepadIcon',
    difficulty: 'easy',
  },
  {
    id: 'daily_score_50',
    title: 'Precision Goal',
    description: 'Reach a score of 50 in a single game today',
    type: 'score',
    target: 50,
    reward: { xp: 150, type: 'XP' },
    icon: 'TargetIcon',
    difficulty: 'easy',
  },
  {
    id: 'daily_perfect_10',
    title: 'Perfect Focus',
    description: 'Hit 10 perfect taps in a single game today',
    type: 'streak',
    target: 10,
    reward: { xp: 120, type: 'XP' },
    icon: 'SparklesIcon',
    difficulty: 'easy',
  },
  {
    id: 'daily_total_100',
    title: 'Steady Progress',
    description: 'Score 100 points in total today',
    type: 'total_score',
    target: 100,
    reward: { xp: 200, type: 'XP' },
    icon: 'FireIcon',
    difficulty: 'easy',
  },
  {
    id: 'daily_survive_30',
    title: 'Time Trial',
    description: 'Survive for 30 seconds in any game today',
    type: 'survival',
    target: 30,
    reward: { xp: 100, type: 'XP' },
    icon: 'TimerIcon',
    difficulty: 'easy',
  },
  {
    id: 'daily_games_5',
    title: 'Active Session',
    description: 'Complete 5 games today',
    type: 'games_played',
    target: 5,
    reward: { xp: 180, type: 'XP' },
    icon: 'GamepadIcon',
    difficulty: 'easy',
  },
];

export const WEEKLY_QUESTS = [
  {
    id: 'weekly_mastery',
    title: 'Weekly Mastery',
    description: 'Play 20 games this week',
    type: 'games_played',
    target: 20,
    reward: { xp: 1000, theme: 'cosmic', type: 'XP + Theme' },
    icon: 'TrophyIcon',
    difficulty: 'hard',
  },
  {
    id: 'weekly_elite_score',
    title: 'Elite Performance',
    description: 'Reach a score of 200 in a single game this week',
    type: 'score',
    target: 200,
    reward: { xp: 1500, theme: 'cosmic', type: 'XP + Theme' },
    icon: 'StarIcon',
    difficulty: 'hard',
  },
  {
    id: 'weekly_marathon',
    title: 'Score Marathon',
    description: 'Score 1000 points in total this week',
    type: 'total_score',
    target: 1000,
    reward: { xp: 2000, theme: 'cosmic', type: 'XP + Theme' },
    icon: 'DiamondIcon',
    difficulty: 'hard',
  },
  {
    id: 'weekly_perfectionist',
    title: 'The Perfectionist',
    description: 'Hit 50 perfect taps in a single game this week',
    type: 'streak',
    target: 50,
    reward: { xp: 1800, theme: 'cosmic', type: 'XP + Theme' },
    icon: 'SparklesIcon',
    difficulty: 'hard',
  },
  {
    id: 'weekly_survivor',
    title: 'Ultimate Survivor',
    description: 'Survive for 120 seconds in any game this week',
    type: 'survival',
    target: 120,
    reward: { xp: 1200, theme: 'cosmic', type: 'XP + Theme' },
    icon: 'TimerIcon',
    difficulty: 'hard',
  },
];

export const checkQuestCompletion = (quest, stats) => {
  if (!stats) return false;

  switch (quest.type) {
    case 'score':
      return (stats.currentScore || 0) >= quest.target;
    case 'streak':
      return (stats.currentStreak || 0) >= quest.target;
    case 'survival':
      return (stats.survivalTime || 0) >= quest.target;
    case 'games_played':
      return (stats.totalGames || 0) >= quest.target;
    case 'total_score':
      return (stats.totalScore || 0) >= quest.target;
    case 'accuracy_sustained':
      return (stats.accuracy || 0) >= quest.target;
    default:
      return false;
  }
};

export const getCategorizedQuests = () => {
  const categories = {};
  QUESTS.forEach(quest => {
    if (!categories[quest.category]) {
      categories[quest.category] = [];
    }
    categories[quest.category].push(quest);
  });
  return categories;
};
