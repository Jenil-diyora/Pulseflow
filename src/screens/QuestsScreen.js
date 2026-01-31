import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ThemeBackground from '../components/ThemeBackground';
import QuestService from '../services/QuestService';
import StorageService from '../services/StorageService';
import { useAuth } from '../services/AuthService';
import { QUESTS } from '../data/quests';
import { getThemeById } from '../data/themes';
import { useAppTheme } from '../utils/themeHook';
import * as GameIcons from '../components/GameIcons';

const { width, height } = Dimensions.get('window');

const QuestCard = React.memo(({ quest, onClaim, isWeekly = false, theme }) => {
  const IconComponent = GameIcons[quest.icon] || GameIcons.TargetIcon;
  const progress = (quest.progress / quest.target) * 100;
  const isCompleted = quest.completed;
  const isClaimed = quest.claimed;

  const accentColor = isWeekly ? '#a855f7' : theme.primary;

  return (
    <View style={[styles.questCard, isCompleted && !isClaimed && { borderColor: `${accentColor}40` }]}>
      <LinearGradient
        colors={
          isClaimed
            ? ['rgba(74, 222, 128, 0.05)', 'rgba(74, 222, 128, 0.01)']
            : isCompleted
              ? [`${accentColor}15`, `${accentColor}05`]
              : [`${theme.text}08`, `${theme.text}02`]
        }
        style={styles.questInner}
      >
        <View style={styles.questTop}>
          <View style={[styles.iconBox, isCompleted && { backgroundColor: `${accentColor}15` }]}>
            <IconComponent
              size={24}
              color={isClaimed ? '#4ade80' : isCompleted ? accentColor : theme.subText}
            />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.typeRow}>
              <Text style={[styles.qType, { color: isWeekly ? '#a855f7' : theme.primary }]}>
                {isWeekly ? 'WEEKLY' : 'DAILY'}
              </Text>
              {isClaimed && (
                <View style={styles.claimedBadge}>
                  <Text style={styles.claimedText}>CLAIMED</Text>
                </View>
              )}
            </View>
            <Text style={[styles.qTitle, { color: theme.text }, isClaimed && styles.textMuted]}>{quest.title}</Text>
            <Text style={[styles.qDesc, { color: theme.subText }]}>{quest.description}</Text>
          </View>
        </View>

        {!isClaimed && (
          <View style={styles.progStage}>
            <View style={styles.progBarOuter}>
              <View
                style={[
                  styles.progBarInner,
                  { width: `${Math.min(progress, 100)}%` },
                  isCompleted ? { backgroundColor: accentColor } : { backgroundColor: theme.subText }
                ]}
              />
            </View>
            <Text style={[styles.progVal, { color: isCompleted ? accentColor : theme.subText }]}>
              {quest.progress} / {quest.target}
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.rewardBox}>
            <Text style={[styles.rewLabel, { color: theme.subText }]}>REWARD</Text>
            <View style={styles.rewPill}>
              {quest.reward.xp && <Text style={[styles.rewVal, { color: theme.text }]}>{quest.reward.xp} XP</Text>}
              {quest.reward.theme && (
                <Text style={[styles.rewVal, { color: '#a855f7' }]}>
                  {quest.reward.xp ? ' + ' : ''}NEW THEME
                </Text>
              )}
            </View>
          </View>

          {isCompleted && !isClaimed ? (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => onClaim(quest.id, isWeekly)}
            >
              <LinearGradient
                colors={[accentColor, `${accentColor}cc`]}
                style={styles.claimBtnInner}
              >
                <Text style={[styles.claimBtnText, { color: theme.background[0] }]}>CLAIM</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : isClaimed ? (
            <GameIcons.SparklesIcon size={20} color="#4ade80" />
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
});

const QuestsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [activeTab, setActiveTab] = useState('Daily');
  const { theme: currentTheme } = useAppTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadQuests();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 35, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadQuests = async () => {
    const [daily, weekly] = await Promise.all([
      QuestService.getDailyQuests(),
      QuestService.getWeeklyQuests()
    ]);
    setDailyQuests(daily);
    setWeeklyQuests(weekly);
  };

  const handleClaim = async (questId, isWeekly) => {
    const reward = await QuestService.claimReward(questId, isWeekly);
    if (reward) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Update local UI
      await loadQuests();

      // Sync to cloud immediately so rewards are saved globally
      if (user && !user.isGuest) {
        StorageService.syncWithCloud(user).catch(e => console.log('Reward sync failed:', e));
      }
    }
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: `${currentTheme.text}10`, borderColor: `${currentTheme.text}20` }]}
        onPress={() => navigation.goBack()}
      >
        <GameIcons.ChevronLeftIcon size={24} color={currentTheme.text} />
      </TouchableOpacity>
      <View style={styles.headerTitleBox}>
        <Text style={[styles.headerSubtitle, { color: currentTheme.primary }]}>AVAILABLE</Text>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>MISSIONS</Text>
      </View>
      <View style={{ width: 44 }} />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['Daily', 'Weekly'].map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[
            styles.tab,
            { backgroundColor: `${currentTheme.text}05`, borderColor: `${currentTheme.text}10` },
            activeTab === tab && { backgroundColor: `${currentTheme.primary}20`, borderColor: `${currentTheme.primary}40` }
          ]}
        >
          <Text style={[
            styles.tabText,
            { color: currentTheme.subText },
            activeTab === tab && { color: currentTheme.primary }
          ]}>
            {tab.toUpperCase()}
          </Text>
          {activeTab === tab && <View style={[styles.tabDot, { backgroundColor: currentTheme.primary }]} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ThemeBackground theme={currentTheme}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {renderHeader()}
        {renderTabs()}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {activeTab === 'Daily' ? 'DAILY OBJECTIVES' : 'WEEKLY CHALLENGES'}
            </Text>
            <View style={styles.timerBox}>
              <GameIcons.TimerIcon size={12} color={currentTheme.subText} />
              <Text style={[styles.timerText, { color: currentTheme.subText }]}>
                {activeTab === 'Daily' ? 'Resets in 12h' : 'Resets in 4d'}
              </Text>
            </View>
          </View>

          {(activeTab === 'Daily' ? dailyQuests : weeklyQuests).map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isWeekly={activeTab === 'Weekly'}
              onClaim={handleClaim}
              theme={currentTheme}
            />
          ))}

          {activeTab === 'Weekly' && (
            <View style={styles.weeklyExtra}>
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.1)', 'rgba(124, 58, 237, 0.05)']}
                style={styles.extraBox}
              >
                <GameIcons.SparklesIcon size={32} color="#a855f7" />
                <Text style={styles.extraTitle}>WEEKLY JACKPOT</Text>
                <Text style={styles.extraDesc}>Complete all weekly missions to unlock the exclusive "COSMIC MIST" theme!</Text>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
  },
  activeTabText: {
  },
  tabDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  questCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  questCardReady: {
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  questInner: {
    padding: 20,
  },
  questTop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  qType: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  typeDaily: { color: '#64748b' },
  typeWeekly: { color: '#a855f7' },
  qTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  qDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  progStage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progBarInner: {
    height: '100%',
    backgroundColor: '#334155',
  },
  progVal: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    minWidth: 40,
    textAlign: 'right',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  rewardBox: {
    gap: 2,
  },
  rewLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
  },
  rewPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  claimBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimBtnInner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
  },
  claimedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  claimedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#4ade80',
  },
  textMuted: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  weeklyExtra: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  extraBox: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#a855f7',
    letterSpacing: 2,
  },
  extraDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  }
});

export default QuestsScreen;
