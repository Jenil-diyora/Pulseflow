export const QUESTS = [
  // Score-based Quests
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Score 10 points in a single game',
    type: 'score',
    target: 10,
    reward: 'Sunset Theme',
    icon: 'TargetIcon',
    category: 'Score',
  },
  {
    id: 'intermediate',
    title: 'Getting Better',
    description: 'Score 25 points in a single game',
    type: 'score',
    target: 25,
    reward: 'Forest Theme',
    icon: 'TrophyIcon',
    category: 'Score',
  },
  {
    id: 'advanced',
    title: 'Pro Player',
    description: 'Score 50 points in a single game',
    type: 'score',
    target: 50,
    reward: 'Galaxy Theme',
    icon: 'StarIcon',
    category: 'Score',
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Score 75 points in a single game',
    type: 'score',
    target: 75,
    reward: 'Neon Theme',
    icon: 'DiamondIcon',
    category: 'Score',
  },
  {
    id: 'master',
    title: 'Master',
    description: 'Score 100 points in a single game',
    type: 'score',
    target: 100,
    reward: 'Fire Theme',
    icon: 'FireIcon',
    category: 'Score',
  },
  {
    id: 'legendary',
    title: 'Legendary',
    description: 'Score 150 points in a single game',
    type: 'score',
    target: 150,
    reward: 'Ice Theme',
    icon: 'SnowflakeIcon',
    category: 'Score',
  },
  {
    id: 'ultimate',
    title: 'Ultimate',
    description: 'Score 200 points in a single game',
    type: 'score',
    target: 200,
    reward: 'Aurora Theme',
    icon: 'CrownIcon',
    category: 'Score',
  },

  // Accuracy Quests
  {
    id: 'perfect_5',
    title: 'Perfect Streak',
    description: 'Hit 5 perfect taps in a row',
    type: 'streak',
    target: 5,
    reward: '100 XP',
    icon: 'SparklesIcon',
    category: 'Accuracy',
  },
  {
    id: 'perfect_10',
    title: 'Flawless',
    description: 'Hit 10 perfect taps in a row',
    type: 'streak',
    target: 10,
    reward: '250 XP',
    icon: 'StarIcon',
    category: 'Accuracy',
  },
  {
    id: 'perfect_20',
    title: 'Unstoppable',
    description: 'Hit 20 perfect taps in a row',
    type: 'streak',
    target: 20,
    reward: '500 XP',
    icon: 'CelebrationIcon',
    category: 'Accuracy',
  },

  // Survival Quests
  {
    id: 'survive_30',
    title: 'Survivor',
    description: 'Survive for 30 seconds',
    type: 'survival',
    target: 30,
    reward: '150 XP',
    icon: 'TimerIcon',
    category: 'Survival',
  },
  {
    id: 'survive_60',
    title: 'Endurance',
    description: 'Survive for 60 seconds',
    type: 'survival',
    target: 60,
    reward: '300 XP',
    icon: 'TimerIcon',
    category: 'Survival',
  },

  // Gameplay Quests
  {
    id: 'play_10',
    title: 'Dedicated',
    description: 'Play 10 games',
    type: 'games_played',
    target: 10,
    reward: '200 XP',
    icon: 'GamepadIcon',
    category: 'Dedication',
  },
  {
    id: 'play_50',
    title: 'Committed',
    description: 'Play 50 games',
    type: 'games_played',
    target: 50,
    reward: '500 XP',
    icon: 'MedalIcon',
    category: 'Dedication',
  },
  {
    id: 'play_100',
    title: 'Veteran',
    description: 'Play 100 games',
    type: 'games_played',
    target: 100,
    reward: '1000 XP',
    icon: 'TrophyIcon',
    category: 'Dedication',
  },
];

export const checkQuestCompletion = (quest, stats) => {
  switch (quest.type) {
    case 'score':
      return stats.currentScore >= quest.target;
    case 'streak':
      return stats.currentStreak >= quest.target;
    case 'survival':
      return stats.survivalTime >= quest.target;
    case 'games_played':
      return stats.totalGames >= quest.target;
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
