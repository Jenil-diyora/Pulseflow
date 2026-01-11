import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import ThemeBackground from '../components/ThemeBackground';
import StorageService from '../services/StorageService';
import { getThemeByScore } from '../data/themes';
import { TrophyIcon, TargetIcon } from '../components/GameIcons';

const HomeScreen = ({ navigation }) => {
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState(null);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    loadData();

    // Pulsing animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    const best = await StorageService.getBestScore();
    const gameStats = await StorageService.getStats();
    setBestScore(best);
    setStats(gameStats);
  };

  return (
    <ThemeBackground theme={getThemeByScore(bestScore)}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>PULSE TAP</Text>
          <Text style={styles.subtitle}>Master the Perfect Timing</Text>
        </View>

        {/* Stats Preview */}
        {stats && stats.totalGames > 0 && (
          <View style={styles.statsPreview}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalGames}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
          </View>
        )}

        {/* Play Button */}
        <Animated.View style={[styles.playButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => navigation.navigate('Game')}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>▶ PLAY NOW</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Menu Buttons */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={styles.iconWrapper}>
              <TrophyIcon size={40} color="#fbbf24" />
            </View>
            <Text style={styles.menuLabel}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Quests')}
          >
            <View style={styles.iconWrapper}>
              <TargetIcon size={40} color="#22d3ee" />
            </View>
            <Text style={styles.menuLabel}>Quests</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statsPreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#22d3ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  playButtonContainer: {
    marginBottom: 40,
  },
  playButton: {
    paddingHorizontal: 60,
    paddingVertical: 20,
    backgroundColor: '#06b6d4',
    borderRadius: 40,
    elevation: 12,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  menuButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconWrapper: {
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
});

export default HomeScreen;
