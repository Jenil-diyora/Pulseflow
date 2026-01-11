import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeBackground from '../components/ThemeBackground';
import StorageService from '../services/StorageService';

const LeaderboardScreen = () => {
  const [highScores, setHighScores] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const scores = await StorageService.getHighScores();
    const gameStats = await StorageService.getStats();
    setHighScores(scores);
    setStats(gameStats);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Text style={styles.title}>LEADERBOARD</Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Statistics Cards */}
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(34, 211, 238, 0.2)', 'rgba(34, 211, 238, 0.05)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>{stats.totalGames}</Text>
                  <Text style={styles.statLabel}>Total Games</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(251, 146, 60, 0.2)', 'rgba(251, 146, 60, 0.05)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>{stats.averageScore}</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(74, 222, 128, 0.2)', 'rgba(74, 222, 128, 0.05)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>{stats.bestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(192, 132, 252, 0.2)', 'rgba(192, 132, 252, 0.05)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>{stats.accuracy}%</Text>
                  <Text style={styles.statLabel}>Perfect Accuracy</Text>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Top Scores */}
          <View style={styles.scoresSection}>
            <Text style={styles.sectionTitle}>🏆 Top Scores</Text>

            {highScores.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No scores yet!</Text>
                <Text style={styles.emptySubtext}>Play a game to see your scores here</Text>
              </View>
            ) : (
              highScores.map((item, index) => (
                <View key={item.timestamp} style={styles.scoreItem}>
                  <View style={styles.rankContainer}>
                    <Text style={[
                      styles.rank,
                      index === 0 && styles.rank1,
                      index === 1 && styles.rank2,
                      index === 2 && styles.rank3,
                    ]}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </Text>
                  </View>

                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreValue}>{item.score}</Text>
                    <Text style={styles.scoreDate}>{formatDate(item.date)}</Text>
                  </View>

                  {index < 3 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {index === 0 ? 'Best' : index === 1 ? 'Great' : 'Good'}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  scoresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94a3b8',
  },
  rank1: {
    fontSize: 32,
  },
  rank2: {
    fontSize: 32,
  },
  rank3: {
    fontSize: 32,
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22d3ee',
    marginBottom: 2,
  },
  scoreDate: {
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22d3ee',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default LeaderboardScreen;
