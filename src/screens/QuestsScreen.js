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
import { QUESTS, getCategorizedQuests } from '../data/quests';
import * as GameIcons from '../components/GameIcons';

const QuestsScreen = () => {
  const [questProgress, setQuestProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const progress = await StorageService.getQuestProgress();
    const gameStats = await StorageService.getStats();
    setQuestProgress(progress);
    setStats(gameStats);
  };

  const categorizedQuests = getCategorizedQuests();
  const categories = ['All', ...Object.keys(categorizedQuests)];

  const getFilteredQuests = () => {
    if (selectedCategory === 'All') {
      return QUESTS;
    }
    return categorizedQuests[selectedCategory] || [];
  };

  const isQuestCompleted = (questId) => {
    return questProgress[questId]?.completed || false;
  };

  const getQuestProgress = (quest) => {
    if (!stats) return 0;

    switch (quest.type) {
      case 'score':
        return Math.min((stats.averageScore / quest.target) * 100, 100);
      case 'streak':
        return Math.min((stats.bestStreak / quest.target) * 100, 100);
      case 'games_played':
        return Math.min((stats.totalGames / quest.target) * 100, 100);
      default:
        return 0;
    }
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Text style={styles.title}>QUESTS & CHALLENGES</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quests List */}
        <ScrollView style={styles.questsScroll} showsVerticalScrollIndicator={false}>
          {getFilteredQuests().map((quest) => {
            const completed = isQuestCompleted(quest.id);
            const progress = getQuestProgress(quest);
            const IconComponent = GameIcons[quest.icon];

            return (
              <View key={quest.id} style={styles.questCard}>
                <LinearGradient
                  colors={
                    completed
                      ? ['rgba(74, 222, 128, 0.15)', 'rgba(74, 222, 128, 0.05)']
                      : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={styles.questGradient}
                >
                  <View style={styles.questHeader}>
                    <View style={styles.questIcon}>
                      {IconComponent && (
                        <IconComponent
                          size={28}
                          color={completed ? '#4ade80' : '#22d3ee'}
                        />
                      )}
                    </View>

                    <View style={styles.questInfo}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <Text style={styles.questDescription}>{quest.description}</Text>
                    </View>

                    {completed && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>✓</Text>
                      </View>
                    )}
                  </View>

                  {/* Progress Bar */}
                  {!completed && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: '#22d3ee',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    </View>
                  )}

                  {/* Reward */}
                  <View style={styles.rewardContainer}>
                    <Text style={styles.rewardLabel}>Reward:</Text>
                    <Text style={styles.rewardText}>{quest.reward}</Text>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#22d3ee',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryTextActive: {
    color: '#0f172a',
  },
  questsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  questGradient: {
    padding: 20,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    minWidth: 40,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 8,
    fontWeight: '600',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22d3ee',
  },
});

export default QuestsScreen;
