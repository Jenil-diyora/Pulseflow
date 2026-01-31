import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, getDoc, where, getCountFromServer } from 'firebase/firestore';

// Rank thresholds and definitions (Same as before)
export const RANK_TIERS = [
    { name: 'Mythic', icon: 'CrownIcon', minScore: 501, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { name: 'Legend', icon: 'FireIcon', minScore: 351, color: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
    { name: 'Master', icon: 'DiamondIcon', minScore: 201, color: '#a855f7', gradient: ['#a855f7', '#9333ea'] },
    { name: 'Elite', icon: 'MedalIcon', minScore: 101, color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
    { name: 'Pro', icon: 'StarIcon', minScore: 51, color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'] },
    { name: 'Amateur', icon: 'TrophyIcon', minScore: 26, color: '#10b981', gradient: ['#10b981', '#059669'] },
    { name: 'Rookie', icon: 'GamepadIcon', minScore: 0, color: '#94a3b8', gradient: ['#94a3b8', '#64748b'] },
];

const LEADERBOARD_COLLECTION = 'leaderboard';

class LeaderboardService {

    /**
     * Get the rank tier for a given score
     */
    getRankForScore(score) {
        for (const tier of RANK_TIERS) {
            if (score >= tier.minScore) {
                return tier;
            }
        }
        return RANK_TIERS[RANK_TIERS.length - 1]; // Default to Rookie
    }

    /**
     * Fetch global leaderboard from Firestore
     */
    async getGlobalLeaderboard(limitCount = 100) {
        try {
            const q = query(
                collection(db, LEADERBOARD_COLLECTION),
                orderBy('score', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                leaderboard.push({
                    id: doc.id,
                    ...data,
                    rank: this.getRankForScore(data.score) // Compute local rank tier
                });
            });

            return leaderboard;
        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
            return [];
        }
    }

    /**
     * Get specific user's rank and data
     */
    async getUserRank(userId) {
        if (!userId) return null;
        try {
            const userRef = doc(db, LEADERBOARD_COLLECTION, userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) return null;

            const userData = userDoc.data();

            // Query for users with higher scores to determine rank
            const q = query(
                collection(db, LEADERBOARD_COLLECTION),
                where('score', '>', userData.score)
            );

            const snapshot = await getCountFromServer(q);
            const rank = snapshot.data().count + 1;

            return {
                ...userData,
                position: rank,
                rank: this.getRankForScore(userData.score)
            };
        } catch (error) {
            console.error('Error getting user rank:', error);
            return null;
        }
    }

    /**
     * Fetch full user profile from Firestore for restoration
     */
    async fetchUserProfile(userId) {
        if (!userId) return null;
        try {
            const userRef = doc(db, LEADERBOARD_COLLECTION, userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    /**
     * Check if a username is already taken
     */
    async isUsernameUnique(username) {
        try {
            const q = query(
                collection(db, LEADERBOARD_COLLECTION),
                where('username', '==', username)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error('Error checking username uniqueness:', error);
            return true; // Assume unique on error to not block user, but ideally handle better
        }
    }

    /**
     * Update username in the leaderboard collection
     */
    async updateUsername(userId, username) {
        if (!userId || !username) return false;
        try {
            const userRef = doc(db, LEADERBOARD_COLLECTION, userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                await setDoc(userRef, { username }, { merge: true });
            } else {
                // If doc doesn't exist, create it with 0 score
                await setDoc(userRef, {
                    userId,
                    username,
                    score: 0,
                    timestamp: new Date().toISOString(),
                    level: 1,
                    xp: 0,
                    labels: [],
                    unlockedThemes: ['ocean']
                });
            }
            return true;
        } catch (error) {
            console.error('Error updating username:', error);
            return false;
        }
    }

    /**
     * Save or update user profile to global leaderboard
     */
    async saveUserProfile(user, profileData) {
        if (!user || user.isGuest) return;

        try {
            const userRef = doc(db, LEADERBOARD_COLLECTION, user.uid);
            await setDoc(userRef, {
                userId: user.uid,
                username: profileData.username || user.displayName || 'Anonymous',
                score: profileData.score || 0,
                level: profileData.level || 1,
                xp: profileData.xp || 0,
                labels: profileData.labels || [],
                unlockedThemes: profileData.unlockedThemes || ['ocean'],
                photoURL: user.photoURL || null,
                timestamp: new Date().toISOString(),
            }, { merge: true });
            console.log('User profile synced to cloud');
            return true;
        } catch (error) {
            console.error('Error syncing profile to cloud:', error);
            return false;
        }
    }

    /**
     * Legacy saveScore kept for backward compatibility and quick updates
     */
    async saveScore(user, score, customUsername = null, level = 1, xp = 0, labels = [], unlockedThemes = ['ocean']) {
        if (!user || user.isGuest) return;

        try {
            const userRef = doc(db, LEADERBOARD_COLLECTION, user.uid);
            const userDoc = await getDoc(userRef);
            let existingData = userDoc.exists() ? userDoc.data() : {};

            const finalScore = Math.max(score, existingData.score || 0);

            await setDoc(userRef, {
                userId: user.uid,
                username: customUsername || existingData.username || user.displayName || 'Anonymous',
                score: finalScore,
                timestamp: new Date().toISOString(),
                photoURL: user.photoURL || null,
                level: level,
                xp: xp,
                labels: labels,
                unlockedThemes: unlockedThemes
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving score to leaderboard:', error);
            return false;
        }
    }

    /**
     * Calculate next rank progress
     */
    getNextRankProgress(score) {
        const currentRank = this.getRankForScore(score);
        const currentIndex = RANK_TIERS.findIndex(tier => tier.name === currentRank.name);

        if (currentIndex === 0) {
            // Already at highest rank
            return {
                currentRank,
                nextRank: null,
                progress: 100,
                pointsToNext: 0,
            };
        }

        const nextRank = RANK_TIERS[currentIndex - 1];
        const pointsToNext = nextRank.minScore - score;
        const rankRange = nextRank.minScore - currentRank.minScore;
        const progress = ((score - currentRank.minScore) / rankRange) * 100;

        return {
            currentRank,
            nextRank,
            progress: Math.min(progress, 100),
            pointsToNext: Math.max(pointsToNext, 0),
        };
    }
}

export default new LeaderboardService();

