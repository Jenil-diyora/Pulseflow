import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { DAILY_QUESTS, WEEKLY_QUESTS, checkQuestCompletion } from '../data/quests';
import StorageService from './StorageService';

class QuestService {
    async getDailyQuests() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_QUESTS_DATA);
            const parsed = data ? JSON.parse(data) : null;

            const today = new Date().toDateString();
            if (!parsed || parsed.date !== today) {
                return await this.refreshDailyQuests();
            }
            return parsed.quests;
        } catch (error) {
            console.error('Error getting daily quests:', error);
            return [];
        }
    }

    async refreshDailyQuests() {
        const today = new Date().toDateString();
        // Select 3 random quests from DAILY_QUESTS
        const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(q => ({
            ...q,
            progress: 0,
            completed: false,
            claimed: false,
        }));

        const data = {
            date: today,
            quests: selected
        };

        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_QUESTS_DATA, JSON.stringify(data));
        return selected;
    }

    async getWeeklyQuests() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_QUESTS_DATA);
            const parsed = data ? JSON.parse(data) : null;

            const now = new Date();
            const weekNumber = this.getWeekNumber(now);
            const year = now.getFullYear();
            const weekId = `${year}-${weekNumber}`;

            if (!parsed || parsed.weekId !== weekId) {
                return await this.refreshWeeklyQuests();
            }
            return parsed.quests;
        } catch (error) {
            console.error('Error getting weekly quests:', error);
            return [];
        }
    }

    async refreshWeeklyQuests() {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        const weekId = `${year}-${weekNumber}`;

        // Select 2 random quests from WEEKLY_QUESTS
        const shuffled = [...WEEKLY_QUESTS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2).map(q => ({
            ...q,
            progress: 0,
            completed: false,
            claimed: false,
        }));

        const data = {
            weekId,
            quests: selected
        };

        await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_QUESTS_DATA, JSON.stringify(data));
        return selected;
    }

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    async updateQuestProgress(gameStats) {
        // gameStats: { score, streak, survivalTime, perfectHits, totalHits }
        const daily = await this.getDailyQuests();
        const weekly = await this.getWeeklyQuests();

        let updatedDaily = false;
        let updatedWeekly = false;

        const newDaily = daily.map(quest => {
            if (quest.completed) return quest;

            let newProgress = quest.progress;
            if (quest.type === 'games_played') {
                newProgress += 1;
            } else if (quest.type === 'total_score') {
                newProgress += gameStats.score;
            } else {
                // For score, streak, survival - we check if current game surpassed target
                const isCompleted = checkQuestCompletion(quest, {
                    currentScore: gameStats.score,
                    currentStreak: gameStats.streak,
                    survivalTime: gameStats.survivalTime,
                });
                if (isCompleted) {
                    newProgress = quest.target;
                }
            }

            if (newProgress !== quest.progress) {
                updatedDaily = true;
                const completed = newProgress >= quest.target;
                return { ...quest, progress: Math.min(newProgress, quest.target), completed };
            }
            return quest;
        });

        const newWeekly = weekly.map(quest => {
            if (quest.completed) return quest;

            let newProgress = quest.progress;
            if (quest.type === 'games_played') {
                newProgress += 1;
            } else if (quest.type === 'total_score') {
                newProgress += gameStats.score;
            } else {
                const isCompleted = checkQuestCompletion(quest, {
                    currentScore: gameStats.score,
                    currentStreak: gameStats.streak,
                    survivalTime: gameStats.survivalTime,
                });
                if (isCompleted) {
                    newProgress = quest.target;
                }
            }

            if (newProgress !== quest.progress) {
                updatedWeekly = true;
                const completed = newProgress >= quest.target;
                return { ...quest, progress: Math.min(newProgress, quest.target), completed };
            }
            return quest;
        });

        if (updatedDaily) {
            const today = new Date().toDateString();
            await AsyncStorage.setItem(STORAGE_KEYS.DAILY_QUESTS_DATA, JSON.stringify({ date: today, quests: newDaily }));
        }

        if (updatedWeekly) {
            const now = new Date();
            const weekId = `${now.getFullYear()}-${this.getWeekNumber(now)}`;
            await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_QUESTS_DATA, JSON.stringify({ weekId, quests: newWeekly }));
        }

        return { daily: newDaily, weekly: newWeekly };
    }

    async claimReward(questId, isWeekly = false) {
        const key = isWeekly ? STORAGE_KEYS.WEEKLY_QUESTS_DATA : STORAGE_KEYS.DAILY_QUESTS_DATA;
        const data = await AsyncStorage.getItem(key);
        if (!data) return null;

        const parsed = JSON.parse(data);
        const questIndex = parsed.quests.findIndex(q => q.id === questId);

        if (questIndex === -1 || !parsed.quests[questIndex].completed || parsed.quests[questIndex].claimed) {
            return null;
        }

        const quest = parsed.quests[questIndex];
        quest.claimed = true;

        await AsyncStorage.setItem(key, JSON.stringify(parsed));

        // Grant rewards
        if (quest.reward.xp) {
            await StorageService.addXP(quest.reward.xp);
        }
        if (quest.reward.theme) {
            await StorageService.unlockTheme(quest.reward.theme);
        }

        return quest.reward;
    }
}

export default new QuestService();
