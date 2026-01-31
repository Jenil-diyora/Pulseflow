import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeBackground from '../components/ThemeBackground';
import RankBadge from '../components/RankBadge';
import { TrophyIcon, MedalIcon, ChevronLeftIcon, SparklesIcon } from '../components/GameIcons';
import StorageService from '../services/StorageService';

import LeaderboardService from '../services/LeaderboardService';
import { useAuth } from '../services/AuthService';
import { getThemeById } from '../data/themes';
import { useAppTheme } from '../utils/themeHook';
import { LAYOUT } from '../utils/constants';

const { width, height } = Dimensions.get('window');

// Memoized Leaderboard Item
const LeaderboardItem = ({ item, index, isUser, user, onFormatDate, theme }) => {
  const rank = item.rank || LeaderboardService.getRankForScore(item.score);
  const isPodium = index < 3;
  const level = item.level || 1;
  const firstLabel = item.labels && item.labels.length > 0 ? item.labels[0] : null;

  return (
    <View
      style={[
        styles.boardItem,
        isUser && { borderColor: `${theme.primary}40`, borderWidth: 1.5 },
        isPodium && styles.boardItemPodium,
      ]}
    >
      <LinearGradient
        colors={
          isPodium
            ? ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.03)']
            : isUser
              ? [`${theme.primary}20`, `${theme.primary}05`]
              : [`${theme.text}05`, `${theme.text}01`]
        }
        style={styles.boardItemInner}
      >
        <View style={styles.boardItemRank}>
          {index === 0 ? (
            <TrophyIcon size={34} color="#fbbf24" />
          ) : index === 1 ? (
            <MedalIcon size={30} color="#94a3b8" />
          ) : index === 2 ? (
            <MedalIcon size={26} color="#b45309" />
          ) : (
            <Text style={[styles.boardRankNum, { color: theme.subText }]}>#{index + 1}</Text>
          )}
        </View>

        <View style={styles.boardUserInfo}>
          <View style={styles.boardUserRow}>
            <Text numberOfLines={1} style={[styles.boardName, { color: theme.text }, (isPodium || isUser) && { fontWeight: '900' }]}>
              {item.username || 'REDACTED'}
            </Text>
            {isUser && (
              <View style={[styles.userTag, { backgroundColor: `${theme.primary}20`, borderColor: `${theme.primary}40` }]}>
                <Text style={[styles.userTagText, { color: theme.primary }]}>YOU</Text>
              </View>
            )}
            {firstLabel && (
              <View style={[styles.userTag, { backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}25` }]}>
                <Text style={[styles.userTagText, { color: theme.primary }]}>{firstLabel.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.boardDate, { color: theme.subText }]}>LEVEL {level} • {onFormatDate(item.date || item.timestamp)}</Text>
        </View>

        <View style={styles.boardScoreBox}>
          <Text style={[styles.boardScoreVal, { color: theme.text }, (isPodium || isUser) && { color: theme.primary }]}>{item.score}</Text>
          <View style={styles.boardBadgeMini}>
            <RankBadge rank={rank} size="small" showLabel={false} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const LeaderboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [highScores, setHighScores] = useState([]);
  const [globalScores, setGlobalScores] = useState([]);
  const [currentUserGlobalRank, setCurrentUserGlobalRank] = useState(null);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('global');
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRankInfo, setUserRankInfo] = useState(null);
  const { theme } = useAppTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatingAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    loadData();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();

    floatingAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 5000 + index * 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 5000 + index * 1500, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  useEffect(() => {
    if (viewMode === 'global') {
      loadGlobalScores();
    }
  }, [viewMode, user]);

  const loadData = async () => {
    const scores = await StorageService.getHighScores();
    const gameStats = await StorageService.getStats();
    const bestScore = await StorageService.getBestScore();

    setHighScores(scores);
    setStats(gameStats);

    if (bestScore > 0) {
      const rankInfo = LeaderboardService.getNextRankProgress(bestScore);
      setUserRankInfo(rankInfo);
    }
  };

  const loadGlobalScores = async () => {
    setIsLoadingGlobal(true);
    try {
      // Fetch top 100
      const scores = await LeaderboardService.getGlobalLeaderboard(100);
      setGlobalScores(scores);

      // Check if user is in top 100
      const userInTop100 = user && scores.find(s => s.userId === user.uid);

      if (!userInTop100 && user && !user.isGuest) {
        // Fetch user's specific rank if not in top 100
        const userRank = await LeaderboardService.getUserRank(user.uid);
        setCurrentUserGlobalRank(userRank);
      } else {
        setCurrentUserGlobalRank(null);
      }
    } catch (error) {
      console.error('Error loading global scores:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (viewMode === 'global') {
      await loadGlobalScores();
    }
    setRefreshing(false);
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'RECENT';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const isCurrentUser = useCallback((item) => {
    return user && (item.userId === user.uid || (item.id === user.uid));
  }, [user]);

  const renderFloatingDecoration = (index, style) => {
    const translateY = floatingAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -40],
    });
    return (
      <Animated.View key={`float-${index}`} style={[styles.decoration, style, { transform: [{ translateY }] }]} />
    );
  };

  const ListHeader = useMemo(() => (
    <View>
      {/* Elite User Rank Card */}
      {userRankInfo && (
        <View style={[styles.proRankCard, { borderColor: `${theme.text}20` }]}>
          <LinearGradient
            colors={[`${theme.text}10`, `${theme.text}02`]}
            style={styles.proRankInner}
          >
            <View style={styles.rankAvatarBox}>
              <RankBadge rank={userRankInfo.currentRank} size="large" showLabel={false} glowEffect />
              <View style={styles.rankTextBox}>
                <Text style={[styles.rankStatusLabel, { color: theme.subText }]}>YOUR CURRENT STATUS</Text>
                <Text style={[styles.rankLevelName, { color: userRankInfo.currentRank.color }]}>
                  {userRankInfo.currentRank.name}
                </Text>
              </View>
            </View>

            {userRankInfo.nextRank && (
              <View style={styles.proProgressBox}>
                <View style={styles.progressDataRow}>
                  <Text style={[styles.nextTargetText, { color: theme.text }]}>
                    NEXT: {userRankInfo.nextRank.name}
                  </Text>
                  <Text style={[styles.pointsRemaining, { color: theme.subText }]}>
                    {userRankInfo.pointsToNext} PTS NEEDED
                  </Text>
                </View>
                <View style={[styles.proBarOuter, { backgroundColor: `${theme.text}05`, borderColor: `${theme.text}05` }]}>
                  <LinearGradient
                    colors={userRankInfo.nextRank.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.proBarInner, { width: `${userRankInfo.progress}%` }]}
                  />
                </View>
              </View>
            )}
          </LinearGradient>
          <View style={[styles.cardCornerDecoration, { backgroundColor: `${theme.text}03` }]} />
        </View>
      )}

      {/* Quick Stats Grid */}
      {stats && (
        <View style={[styles.eliteStatsGrid, { backgroundColor: `${theme.text}04`, borderColor: `${theme.text}05` }]}>
          <View style={styles.miniStatCard}>
            <Text style={[styles.miniStatLabel, { color: theme.subText }]}>PULSES</Text>
            <Text style={[styles.miniStatValue, { color: theme.text }]}>{stats.totalGames}</Text>
          </View>
          <View style={[styles.miniStatDivider, { backgroundColor: `${theme.text}10` }]} />
          <View style={styles.miniStatCard}>
            <Text style={[styles.miniStatLabel, { color: theme.subText }]}>AVG PULSE</Text>
            <Text style={[styles.miniStatValue, { color: theme.text }]}>{stats.averageScore}</Text>
          </View>
          <View style={[styles.miniStatDivider, { backgroundColor: `${theme.text}10` }]} />
          <View style={styles.miniStatCard}>
            <Text style={[styles.miniStatLabel, { color: theme.subText }]}>MAX STREAK</Text>
            <Text style={[styles.miniStatValue, { color: theme.text }]}>{stats.bestStreak}</Text>
          </View>
        </View>
      )}

      {/* Leaderboard Controls */}
      <View style={styles.boardController}>
        <View style={styles.tabHeaderRow}>
          <Text style={[styles.tabTitleText, { color: theme.text }]}>
            {viewMode === 'local' ? '🏆 PERSONAL BEST' : '🌎 GLOBAL TOP 100'}
          </Text>
          <View style={[styles.modeToggleStage, { backgroundColor: `${theme.text}06`, borderColor: `${theme.text}05` }]}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'local' && { backgroundColor: theme.primary }]}
              onPress={() => setViewMode('local')}
            >
              <Text style={[styles.modeBtnText, { color: theme.subText }, viewMode === 'local' && { color: theme.background[0] }]}>LOCAL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'global' && { backgroundColor: theme.primary }]}
              onPress={() => setViewMode('global')}
            >
              <Text style={[styles.modeBtnText, { color: theme.subText }, viewMode === 'global' && { color: theme.background[0] }]}>GLOBAL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoadingGlobal && viewMode === 'global' && (
          <View style={styles.proLoadingBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.proLoadingText, { color: theme.primary }]}>SYNCING GLOBAL DATA...</Text>
          </View>
        )}
      </View>
    </View>
  ), [userRankInfo, stats, viewMode, isLoadingGlobal]);

  const ListEmpty = useMemo(() => (
    !isLoadingGlobal && (
      <View style={styles.proEmptyBox}>
        <SparklesIcon size={40} color="rgba(255,255,255,0.1)" />
        <Text style={styles.proEmptyText}>NO RECORDS YET</Text>
        <Text style={styles.proEmptySub}>Complete a pulse to rank</Text>
      </View>
    )
  ), [isLoadingGlobal]);

  const renderItem = ({ item, index }) => (
    <LeaderboardItem
      item={item}
      index={index}
      isUser={isCurrentUser(item)}
      user={user}
      onFormatDate={formatDate}
      theme={theme}
    />
  );

  const ListFooter = () => {
    if (viewMode === 'global' && currentUserGlobalRank && !isLoadingGlobal) {
      return (
        <View style={styles.playerRankFooter}>
          <View style={styles.footerDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>YOUR POSITION</Text>
            <View style={styles.dividerLine} />
          </View>
          <LeaderboardItem
            item={{
              ...currentUserGlobalRank,
              username: user?.displayName || 'You',
              score: currentUserGlobalRank.score,
            }}
            index={currentUserGlobalRank.position - 1}
            isUser={true}
            user={user}
            onFormatDate={formatDate}
            theme={theme}
          />
          <Text style={[styles.positionNote, { color: theme.primary }]}>
            You are currently ranked #{currentUserGlobalRank.position} in the world!
          </Text>
        </View>
      );
    }
    return <View style={{ height: 40 }} />;
  };

  return (
    <ThemeBackground theme={theme}>
      <StatusBar barStyle="light-content" />

      {/* Cinematic Ambience */}
      {renderFloatingDecoration(0, { top: height * 0.1, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: theme.primary, opacity: 0.05 })}
      {renderFloatingDecoration(1, { bottom: height * 0.1, right: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.pulseColor, opacity: 0.05 })}

      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerStage}>
          <TouchableOpacity
            style={[styles.eliteBackBtn, { backgroundColor: `${theme.text}05`, borderColor: `${theme.text}10` }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={[styles.headerSubtitleText, { color: theme.primary }]}>WORLDWIDE</Text>
            <Text style={[styles.headerTitleText, { color: theme.text }]}>RANKINGS</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <Animated.FlatList
          data={viewMode === 'local' ? highScores : globalScores}
          keyExtractor={(item, index) => `${item.userId || item.id || index}-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      </Animated.View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.07,
  },
  decoration: {
    position: 'absolute',
    zIndex: -1,
  },
  headerStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  eliteBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleWrapper: {
    alignItems: 'center',
  },
  headerSubtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22d3ee',
    letterSpacing: 4,
    marginBottom: 4,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  mainFeed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  proRankCard: {
    marginBottom: 30,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  proRankInner: {
    padding: 24,
  },
  rankAvatarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  rankTextBox: {
    flex: 1,
  },
  rankStatusLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  rankLevelName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proProgressBox: {
    gap: 12,
  },
  progressDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextTargetText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsRemaining: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '900',
    letterSpacing: 1,
  },
  proBarOuter: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  proBarInner: {
    height: '100%',
    borderRadius: 6,
  },
  cardCornerDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  eliteStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  miniStatLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  modeToggleStage: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: '#22d3ee',
  },
  modeBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeBtnTextActive: {
    color: '#0f172a',
  },
  boardItem: {
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  boardItemPodium: {
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 1.5,
  },
  boardItemUser: {
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderWidth: 1.5,
  },
  boardItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  boardItemRank: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardRankNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
  },
  boardUserInfo: {
    flex: 1,
  },
  boardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  boardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  userTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  userTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#22d3ee',
    letterSpacing: 1,
  },
  boardDate: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  boardScoreBox: {
    alignItems: 'flex-end',
    gap: 6,
  },
  boardScoreVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  boardBadgeMini: {
    opacity: 0.8,
  },
  proLoadingBox: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 20,
  },
  proLoadingText: {
    fontSize: 11,
    color: '#22d3ee',
    fontWeight: '900',
    letterSpacing: 2,
  },
  proEmptyBox: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  proEmptyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 2,
  },
  proEmptySub: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  playerRankFooter: {
    marginTop: 20,
    marginBottom: 40,
  },
  footerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  positionNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});


export default LeaderboardScreen;

