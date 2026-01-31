import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeBackground from '../components/ThemeBackground';
import RankBadge from '../components/RankBadge';
import StorageService from '../services/StorageService';
import LeaderboardService from '../services/LeaderboardService';
import { getThemeById, getThemeByScore } from '../data/themes';
import { TrophyIcon, TargetIcon, GamepadIcon, PlayIcon, FireIcon, ExitIcon, SparklesIcon, TimerIcon, ShieldCheckIcon } from '../components/GameIcons';

import { useAuth } from '../services/AuthService';
import QuestService from '../services/QuestService';
import { useAppTheme } from '../utils/themeHook';

const { width, height } = Dimensions.get('window');

// Premium Stat Item
const StatItem = ({ label, value, color, icon, subTextColor }) => (
  <View style={styles.statBox}>
    <View style={[styles.statIconWrapper, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <View style={styles.statTextWrapper}>
      <Text style={[styles.statLabelText, { color: subTextColor }]}>{label}</Text>
      <Text style={[styles.statValueText, { color }]}>{value}</Text>
    </View>
  </View>
);

// High-End Nav Button
const NavButton = ({ label, colors, icon, onPress, subtitle, textColor, subTextColor }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.navButton}
    onPress={onPress}
  >
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.navButtonInner}
    >
      <View style={styles.navIconBox}>{icon}</View>
      <Text style={[styles.navMainLabel, { color: textColor }]}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [needSync, setNeedSync] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [customUsername, setCustomUsername] = useState('');
  const [labels, setLabels] = useState([]);
  const [hasClaimableQuests, setHasClaimableQuests] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const { theme, isAutoTheme } = useAppTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    loadData();

    // Sequence entry
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();

    // Subtle breath for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Ambient floating
    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 5000 + i * 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 5000 + i * 1500, useNativeDriver: true }),
        ])
      ).start();
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const [best, gameStats, userLevel, userXP, userName, userLabels, premium] = await Promise.all([
      StorageService.getBestScore(),
      StorageService.getStats(),
      StorageService.getUserLevel(),
      StorageService.getUserXP(),
      StorageService.getUserName(),
      StorageService.getUserLabels(),
      StorageService.isPremium()
    ]);

    setBestScore(best);
    setStats(gameStats);
    setLevel(userLevel);
    setXP(userXP);
    setCustomUsername(userName || user?.displayName || 'Cadet');
    setLabels(userLabels);

    // Check for claimable missions
    const [daily, weekly] = await Promise.all([
      QuestService.getDailyQuests(),
      QuestService.getWeeklyQuests()
    ]);
    const canClaim = [...daily, ...weekly].some(q => q.completed && !q.claimed);
    const syncNeeded = await StorageService.getNeedSync();
    setNeedSync(syncNeeded);

    if (best > 0) {
      setUserRank(LeaderboardService.getRankForScore(best));
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://pulsetap-game.web.app/privacy'); // Change to your actual policy URL
  };

  const getLevelThreshold = (lvl) => (lvl * (lvl + 1) / 2) * 500;
  const currentMinXP = getLevelThreshold(level - 1);
  const nextTargetXP = getLevelThreshold(level);
  const relativeXP = xp - currentMinXP;
  const totalInLevel = nextTargetXP - currentMinXP;
  const progress = (relativeXP / totalInLevel) * 100;

  const renderOrnament = (index, style, scale = 1) => {
    const translateY = floatAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -40 * scale],
    });
    return (
      <Animated.View style={[styles.ornament, style, { transform: [{ translateY }, { scale }] }]} />
    );
  };

  return (
    <ThemeBackground theme={theme}>
      <StatusBar barStyle="light-content" />

      {/* Atmospheric Ornaments */}
      {renderOrnament(0, { top: '15%', right: '-10%', width: 200, height: 200, borderRadius: 100, backgroundColor: theme.primary, opacity: 0.08 })}
      {renderOrnament(1, { bottom: '20%', left: '-15%', width: 250, height: 250, borderRadius: 125, backgroundColor: theme.ringColor, opacity: 0.06 }, 1.2)}
      {renderOrnament(2, { top: '35%', left: '50%', width: 100, height: 100, borderRadius: 50, backgroundColor: theme.pulseColor, opacity: 0.04 }, 0.8)}
      {renderOrnament(0, { top: '55%', right: '5%', width: 150, height: 150, borderRadius: 75, backgroundColor: theme.primary, opacity: 0.03 }, 0.6)}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Integrated Profile & Stats Header */}
          <View style={styles.topHeader}>
            <View style={styles.profileSection}>
              <LinearGradient
                colors={userRank ? userRank.gradient : theme.background}
                style={styles.avatarMini}
              >
                <Text style={[styles.avatarInitialSmall, { color: theme.text }]}>{customUsername.charAt(0)}</Text>
              </LinearGradient>
              <View style={styles.profileInfoMini}>
                <Text numberOfLines={1} style={[styles.profileNameMini, { color: theme.text }]}>{customUsername}</Text>
                <View style={styles.xpMiniTrack}>
                  <View style={[styles.xpMiniFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: theme.primary }]} />
                </View>
              </View>
            </View>

            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <TrophyIcon size={12} color={theme.primary} />
                <Text style={[styles.headerStatValue, { color: theme.text }]}>{bestScore}</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <FireIcon size={12} color="#ef4444" />
                <Text style={[styles.headerStatValue, { color: theme.text }]}>{stats?.bestStreak || 0}</Text>
              </View>
            </View>
          </View>

          {/* Core Hero Section - More Focused */}
          <View style={styles.heroNew}>
            <View style={styles.heroVisual}>
              {userRank ? (
                <RankBadge rank={userRank} size="large" glowEffect showLabel={false} />
              ) : (
                <View style={styles.lockedRankVisual}>
                  <GamepadIcon size={40} color={`${theme.text}10`} />
                </View>
              )}
            </View>

            <View style={styles.heroTitleGroup}>
              <Text style={[styles.heroSubtitle, { color: theme.primary }]}>PROTOCOL</Text>
              <Text style={[styles.heroMainTitle, { color: theme.text }]}>PULSEFLOW</Text>
              <View style={[styles.heroPill, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }]}>
                <View style={[styles.pulseDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.heroPillText, { color: theme.primary }]}>v1.2 ACTIVE</Text>
              </View>
            </View>
          </View>

          {/* Primary Operations */}
          <View style={styles.operationsCenter}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
              <Pressable
                onPress={() => navigation.navigate('Game')}
                style={({ pressed }) => [
                  styles.playActionBtn,
                  pressed && { transform: [{ scale: 0.97 }] }
                ]}
              >
                <LinearGradient
                  colors={[theme.pulseColor, theme.ringColor, theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.playGradient}
                >
                  <View style={styles.playIconContainer}>
                    <PlayIcon size={28} color="#fff" />
                  </View>
                  <Text style={styles.playBtnText}>ENGAGE PULSE</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <View style={styles.subQuickNav}>
              <NavButton
                label="GLOBAL"
                subtitle="Rankings"
                colors={[`${theme.primary}15`, `${theme.primary}05`]}
                icon={<TrophyIcon size={22} color={theme.primary} />}
                onPress={() => navigation.navigate('Leaderboard')}
                textColor={theme.text}
                subTextColor={theme.subText}
              />
              <NavButton
                label="MUSEUM"
                subtitle="Themes"
                colors={[`${theme.primary}10`, `${theme.primary}05`]}
                icon={<SparklesIcon size={22} color={theme.primary} />}
                onPress={() => navigation.navigate('Themes')}
                textColor={theme.text}
                subTextColor={theme.subText}
              />
              <NavButton
                label="QUESTS"
                subtitle="Missions"
                colors={[`${theme.primary}15`, `${theme.primary}05`]}
                icon={<TargetIcon size={22} color={theme.primary} />}
                onPress={() => navigation.navigate('Quests')}
                textColor={theme.text}
                subTextColor={theme.subText}
              />
              {hasClaimableQuests && (
                <View style={styles.questBadgeDot} />
              )}
            </View>

            {!isPremium && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Store')}
                style={styles.premiumBanner}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.premiumBannerInner}
                >
                  <ShieldCheckIcon size={18} color="#fff" />
                  <Text style={styles.premiumBannerText}>GO AD-FREE FOR ₹60</Text>
                  <SparklesIcon size={16} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Goal Preview - To keep it from looking empty */}
          <View style={styles.goalPreviewBox}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
              style={styles.goalInner}
            >
              <View style={styles.goalHeader}>
                <TimerIcon size={14} color={theme.subText} />
                <Text style={[styles.goalTitle, { color: theme.subText }]}>NEXT UNLOCK PROGRESS</Text>
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalHeroText, { color: theme.text }]}>REACH 100 PTS</Text>
                <Text style={[styles.goalSubText, { color: theme.subText }]}>TO UNLOCK NEON CITY</Text>
              </View>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${Math.min((bestScore / 100) * 100, 100)}%`, backgroundColor: theme.primary }]} />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.finalFooter}>
            {needSync && (
              <View style={styles.syncPendingBox}>
                <Text style={styles.syncPendingText}>OFFLINE RECOGNITION PENDING</Text>
              </View>
            )}
            <Text style={[styles.copyText, { color: theme.subText, opacity: 0.5 }]}>PULSEFLOW PROTOCOL v1.2</Text>
            <View style={styles.footerLinks}>
              <Text style={[styles.earlyAccessTag, { color: theme.subText, backgroundColor: `${theme.subText}15` }]}>EARLY ACCESS PHASE</Text>
              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={[styles.privacyLink, { color: theme.primary }]}>PRIVACY</Text>
              </TouchableOpacity>
              <View style={styles.footerDot} />
              <TouchableOpacity onPress={() => logout()}>
                <Text style={[styles.logoutLink, { color: '#ef4444' }]}>SIGNOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    paddingTop: height * 0.08,
  },
  mainWrapper: {
    paddingHorizontal: 28,
    flex: 1,
  },
  ornament: {
    position: 'absolute',
    zIndex: -1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarInitialSmall: {
    fontSize: 16,
    fontWeight: '900',
  },
  profileInfoMini: {
    justifyContent: 'center',
  },
  profileNameMini: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpMiniTrack: {
    height: 3,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  xpMiniFill: {
    height: '100%',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerStatValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  headerStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroNew: {
    alignItems: 'center',
    marginVertical: 40,
  },
  heroVisual: {
    height: 140,
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockedRankVisual: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  heroTitleGroup: {
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
    opacity: 0.6,
  },
  heroMainTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTextWrapper: {
    alignItems: 'center',
  },
  statLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
  },
  vertDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  operationsCenter: {
    gap: 16,
    marginBottom: 35,
  },
  playActionBtn: {
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  playGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  playIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subQuickNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  navButtonInner: {
    paddingVertical: 14,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navIconBox: {
    marginBottom: 6,
  },
  navMainLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  goalPreviewBox: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 40,
  },
  goalInner: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1.5,
  },
  goalContent: {
    marginBottom: 15,
  },
  goalHeroText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  goalSubText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  goalTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 3,
  },
  finalFooter: {
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '800',
    letterSpacing: 2,
  },
  earlyAccessTag: {
    fontSize: 8,
    color: '#94a3b8',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '900',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  privacyLink: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '800',
    letterSpacing: 2,
  },
  logoutLink: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  syncPendingBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  syncPendingText: {
    fontSize: 8,
    color: '#eab308',
    fontWeight: '900',
    letterSpacing: 1,
  },
  questBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
    borderWidth: 2,
    borderColor: '#0f172a',
    zIndex: 10,
  },
  premiumBanner: {
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
    elevation: 4,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  premiumBannerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  premiumBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  }
});

export default HomeScreen;
