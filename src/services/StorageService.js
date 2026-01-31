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

  // User Profile (Username, XP, Level, Labels)
  async getUserName() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  }

  async saveUserName(name) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      return true;
    } catch (error) {
      console.error('Error saving username:', error);
      return false;
    }
  }

  async getUserLevel() {
    try {
      const level = await AsyncStorage.getItem(STORAGE_KEYS.USER_LEVEL);
      return level ? parseInt(level, 10) : 1;
    } catch (error) {
      console.error('Error getting level:', error);
      return 1;
    }
  }

  async getUserXP() {
    try {
      const xp = await AsyncStorage.getItem(STORAGE_KEYS.USER_XP);
      return xp ? parseInt(xp, 10) : 0;
    } catch (error) {
      console.error('Error getting XP:', error);
      return 0;
    }
  }

  async addXP(amount) {
    try {
      const currentXP = await this.getUserXP();
      const currentLevel = await this.getUserLevel();
      const newXP = currentXP + amount;

      // Level progression: level * 500 XP to next level
      let newLevel = currentLevel;
      let xpThreshold = currentLevel * 500;

      let tempXP = newXP;
      while (tempXP >= (newLevel * 500)) {
        tempXP -= (newLevel * 500);
        newLevel++;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_XP, newXP.toString());
      if (newLevel > currentLevel) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_LEVEL, newLevel.toString());
      }

      return { newXP, newLevel, leveledUp: newLevel > currentLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  }

  async getUserLabels() {
    try {
      const labels = await AsyncStorage.getItem(STORAGE_KEYS.USER_LABELS);
      return labels ? JSON.parse(labels) : [];
    } catch (error) {
      console.error('Error getting labels:', error);
      return [];
    }
  }

  async addLabel(label) {
    try {
      const labels = await this.getUserLabels();
      if (!labels.includes(label)) {
        labels.push(label);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_LABELS, JSON.stringify(labels));
      }
      return labels;
    } catch (error) {
      console.error('Error adding label:', error);
      return [];
    }
  }

  async getSelectedTheme() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_THEME);
    } catch (error) {
      console.error('Error getting selected theme:', error);
      return null;
    }
  }

  async saveSelectedTheme(themeId) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_THEME, themeId);
      return true;
    } catch (error) {
      console.error('Error saving selected theme:', error);
      return false;
    }
  }

  async getAutoTheme() {
    try {
      const auto = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_THEME);
      // Default to true for new players
      return auto !== null ? auto === 'true' : true;
    } catch (error) {
      console.error('Error getting auto theme:', error);
      return true;
    }
  }

  async saveAutoTheme(enabled) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_THEME, enabled ? 'true' : 'false');
      return true;
    } catch (error) {
      console.error('Error saving auto theme:', error);
      return false;
    }
  }

  // Premium / Ad-Free Status
  async isPremium() {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      if (status !== 'true') return false;

      // Check expiry
      const expiry = await AsyncStorage.getItem(STORAGE_KEYS.AD_FREE_EXPIRY);
      if (expiry) {
        const expiryDate = new Date(expiry);
        if (new Date() > expiryDate) {
          // Expired
          await this.setPremium(false);
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async setPremium(enabled, months = 0) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, enabled ? 'true' : 'false');
      if (enabled && months > 0) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);
        await AsyncStorage.setItem(STORAGE_KEYS.AD_FREE_EXPIRY, expiryDate.toISOString());
      } else if (!enabled) {
        await AsyncStorage.removeItem(STORAGE_KEYS.AD_FREE_EXPIRY);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPremiumExpiry() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AD_FREE_EXPIRY);
    } catch (error) {
      return null;
    }
  }

  // Cloud Sync System
  async getNeedSync() {
    try {
      const needed = await AsyncStorage.getItem('@need_sync');
      return needed === 'true';
    } catch (e) {
      return false;
    }
  }

  async setNeedSync(needed) {
    try {
      await AsyncStorage.setItem('@need_sync', needed ? 'true' : 'false');
    } catch (e) { }
  }

  async syncWithCloud(user) {
    if (!user || user.isGuest) return false;

    try {
      const [score, level, xp, labels, themes, username] = await Promise.all([
        this.getBestScore(),
        this.getUserLevel(),
        this.getUserXP(),
        this.getUserLabels(),
        this.getUnlockedThemes(),
        this.getUserName(),
      ]);

      const profileData = {
        score,
        level,
        xp,
        labels,
        unlockedThemes: themes,
        username
      };

      const { default: LeaderboardService } = require('./LeaderboardService');
      const success = await LeaderboardService.saveUserProfile(user, profileData);
      if (success) {
        await this.setNeedSync(false);
      }
      return success;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      await this.setNeedSync(true); // Mark for later if failed
      return false;
    }
  }

  async syncPendingData(user) {
    if (!user || user.isGuest) return;
    const needed = await this.getNeedSync();
    if (needed) {
      console.log('Attempting to sync pending data...');
      await this.syncWithCloud(user);
    }
  }

  async restoreFromCloud(user) {
    if (!user || user.isGuest) return false;

    try {
      const { default: LeaderboardService } = require('./LeaderboardService');
      const cloudData = await LeaderboardService.fetchUserProfile(user.uid);

      if (!cloudData) return false;

      // Restore all pieces of data to local storage
      const operations = [];
      if (cloudData.score !== undefined) operations.push(AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORE, cloudData.score.toString()));
      if (cloudData.level !== undefined) operations.push(AsyncStorage.setItem(STORAGE_KEYS.USER_LEVEL, cloudData.level.toString()));
      if (cloudData.xp !== undefined) operations.push(AsyncStorage.setItem(STORAGE_KEYS.USER_XP, cloudData.xp.toString()));
      if (cloudData.labels) operations.push(AsyncStorage.setItem(STORAGE_KEYS.USER_LABELS, JSON.stringify(cloudData.labels)));
      if (cloudData.unlockedThemes) operations.push(AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_THEMES, JSON.stringify(cloudData.unlockedThemes)));
      if (cloudData.username) operations.push(AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, cloudData.username));

      await Promise.all(operations);
      console.log('User profile restored from cloud');
      return true;
    } catch (error) {
      console.error('Cloud restoration failed:', error);
      return false;
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
