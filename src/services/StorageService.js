import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  // High Scores
  async getHighScores() {
    try {
      const scores = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error getting high scores:', error);
      return [];
    }
  }

  async saveHighScore(score) {
    try {
      const scores = await this.getHighScores();
      const newScores = [...scores, {
        score,
        date: new Date().toISOString(),
        timestamp: Date.now(),
      }].sort((a, b) => b.score - a.score).slice(0, 10); // Keep top 10
      
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(newScores));
      return newScores;
    } catch (error) {
      console.error('Error saving high score:', error);
      return [];
    }
  }

  async getBestScore() {
    try {
      const best = await AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      return best ? parseInt(best, 10) : 0;
    } catch (error) {
      console.error('Error getting best score:', error);
      return 0;
    }
  }

  async saveBestScore(score) {
    try {
      const currentBest = await this.getBestScore();
      if (score > currentBest) {
        await AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving best score:', error);
      return false;
    }
  }

  // Game Statistics
  async getStats() {
    try {
      const stats = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      return stats ? JSON.parse(stats) : {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestStreak: 0,
        perfectHits: 0,
        totalHits: 0,
        accuracy: 0,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestStreak: 0,
        perfectHits: 0,
        totalHits: 0,
        accuracy: 0,
      };
    }
  }

  async updateStats(gameStats) {
    try {
      const currentStats = await this.getStats();
      const totalGames = currentStats.totalGames + 1;
      const totalScore = currentStats.totalScore + gameStats.score;
      const perfectHits = currentStats.perfectHits + gameStats.perfectHits;
      const totalHits = currentStats.totalHits + gameStats.totalHits;
      
      const newStats = {
        totalGames,
        totalScore,
        averageScore: Math.round(totalScore / totalGames),
        bestStreak: Math.max(currentStats.bestStreak, gameStats.streak || 0),
        perfectHits,
        totalHits,
        accuracy: totalHits > 0 ? Math.round((perfectHits / totalHits) * 100) : 0,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
      return newStats;
    } catch (error) {
      console.error('Error updating stats:', error);
      return null;
    }
  }

  // Quest Progress
  async getQuestProgress() {
    try {
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.QUEST_PROGRESS);
      return progress ? JSON.parse(progress) : {};
    } catch (error) {
      console.error('Error getting quest progress:', error);
      return {};
    }
  }

  async saveQuestProgress(questId, completed = true) {
    try {
      const progress = await this.getQuestProgress();
      progress[questId] = {
        completed,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.QUEST_PROGRESS, JSON.stringify(progress));
      return progress;
    } catch (error) {
      console.error('Error saving quest progress:', error);
      return {};
    }
  }

  // Unlocked Themes
  async getUnlockedThemes() {
    try {
      const themes = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_THEMES);
      return themes ? JSON.parse(themes) : ['ocean']; // Ocean is always unlocked
    } catch (error) {
      console.error('Error getting unlocked themes:', error);
      return ['ocean'];
    }
  }

  async unlockTheme(themeId) {
    try {
      const themes = await this.getUnlockedThemes();
      if (!themes.includes(themeId)) {
        themes.push(themeId);
        await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
      }
      return themes;
    } catch (error) {
      console.error('Error unlocking theme:', error);
      return [];
    }
  }

  // Settings
  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        soundEnabled: true,
        hapticsEnabled: true,
        musicEnabled: false,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        soundEnabled: true,
        hapticsEnabled: true,
        musicEnabled: false,
      };
    }
  }

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Error saving settings:', error);
      return null;
    }
  }

  // Clear all data (for debugging)
  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

export default new StorageService();
