import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import ThemeBackground from '../components/ThemeBackground';
import PulseCircle from '../components/PulseCircle';
import ParticleSystem, { createParticleBurst } from '../components/ParticleSystem';
import ScoreDisplay from '../components/ScoreDisplay';
import { ChevronLeftIcon, GamepadIcon, SparklesIcon, TimerIcon, FireIcon, TrophyIcon } from '../components/GameIcons';
import { GAME_CONSTANTS, GAME_STATES, getReflexRating, getShapeForScore } from '../utils/constants';
import { getThemeByScore, getThemeById } from '../data/themes';
import AudioService from '../services/AudioService';
import StorageService from '../services/StorageService';
import { QUESTS, checkQuestCompletion } from '../data/quests';
import DifficultyManager from '../services/DifficultyManager';
import { useAuth } from '../services/AuthService';
import AdManager from '../utils/AdManager';
import QuestService from '../services/QuestService';
import LeaderboardService from '../services/LeaderboardService';
import { useAppTheme } from '../utils/themeHook';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;



const GameScreen = ({ navigation }) => {
  const { user } = useAuth();
  // UI State
  const [gameState, setGameState] = useState(GAME_STATES.START);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showPerformanceMessage, setShowPerformanceMessage] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const isPerfectZoneRef = useRef(false);
  const [currentTolerance, setCurrentTolerance] = useState(GAME_CONSTANTS.INITIAL_TOLERANCE);
  const [difficultyPhase, setDifficultyPhase] = useState(null);

  const { isAutoTheme, selectedThemeId, refreshTheme } = useAppTheme();

  // Animations
  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const auraAnim = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const pulseRadiusAnim = useRef(new Animated.Value(0)).current;
  const perfectZoneAnim = useRef(new Animated.Value(0)).current;
  const gameOverAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const gameStateRef = useRef(GAME_STATES.START);
  const scoreRef = useRef(0);
  const pulseRadiusRef = useRef(0);
  const pulseSpeedRef = useRef(GAME_CONSTANTS.INITIAL_SPEED);

  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]);

  const perfectStreakRef = useRef(0);
  const totalHitsRef = useRef(0);
  const perfectHitsRef = useRef(0);
  const gameStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const currentToleranceRef = useRef(GAME_CONSTANTS.INITIAL_TOLERANCE);
  const frameCounterRef = useRef(0);

  useEffect(() => {
    loadBestScore();
    AudioService.initialize();

    Animated.timing(contentFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse aura for start screen
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, { toValue: 1.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(auraAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      // Cleanup: KILL all loops and references
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      particlesRef.current = []; // Free memory
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
    scoreRef.current = score;
  }, [gameState, score]);

  const loadBestScore = async () => {
    const best = await StorageService.getBestScore();
    setBestScore(best);
  };

  const gameLoop = () => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 16.67;
    lastUpdateRef.current = now;

    pulseRadiusRef.current += pulseSpeedRef.current * deltaTime;
    pulseRadiusAnim.setValue(pulseRadiusRef.current);


    // Only trigger a re-render when the "perfect zone" status actually changes
    const isPerfect = Math.abs(pulseRadiusRef.current - GAME_CONSTANTS.TARGET_RADIUS) < currentToleranceRef.current;
    if (isPerfect !== isPerfectZoneRef.current) {
      isPerfectZoneRef.current = isPerfect;
      perfectZoneAnim.setValue(isPerfect ? 1 : 0);
    }

    if (pulseRadiusRef.current > GAME_CONSTANTS.TARGET_RADIUS + currentToleranceRef.current + 20) {
      handleGameOver();
      return;
    }

    // Optimization: Only update particles in state every 2 frames to reduce React reconciliation load
    // BUT if we just added new particles (via handleTap), we might want to show them sooner.
    if (particlesRef.current.length > 0) {
      particlesRef.current = particlesRef.current.filter(p => {
        p.update();
        return p.life > 0;
      });

      // Use a frame counter to throttle state updates for particles
      frameCounterRef.current++;

      // Update if frame%2==0 OR if we have very refined particle count (just started)
      if (frameCounterRef.current % 2 === 0 || particlesRef.current.length < 5) {
        // Create a new array reference to trigger re-render
        setParticles([...particlesRef.current]);
      }
    } else if (particles.length > 0) {
      // Clear final particles
      setParticles([]);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = useCallback(() => {
    // SECURITY: Ensure any previous loop is dead before starting a new one
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setGameState(GAME_STATES.PLAYING);
    gameStateRef.current = GAME_STATES.PLAYING;
    setScore(0);
    scoreRef.current = 0;
    pulseRadiusRef.current = 0;
    pulseRadiusAnim.setValue(0);
    gameOverAnim.setValue(0);
    perfectZoneAnim.setValue(0);

    DifficultyManager.reset();
    pulseSpeedRef.current = DifficultyManager.getCurrentSpeed();
    currentToleranceRef.current = DifficultyManager.getCurrentTolerance();
    setCurrentTolerance(currentToleranceRef.current);
    setDifficultyPhase(DifficultyManager.getCurrentPhase());

    // Explicitly clear particles to free memory
    particlesRef.current = [];
    setParticles([]);
    perfectStreakRef.current = 0;
    totalHitsRef.current = 0;
    perfectHitsRef.current = 0;
    gameStartTimeRef.current = Date.now();
    setShowPerformanceMessage(false);
    setGameOverReason(null);

    // Reset loop time
    lastUpdateRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const handleTap = useCallback(async () => {
    if (gameStateRef.current !== GAME_STATES.PLAYING) return;

    const distance = Math.abs(pulseRadiusRef.current - GAME_CONSTANTS.TARGET_RADIUS);
    totalHitsRef.current++;

    if (distance < currentToleranceRef.current) {
      const newScore = scoreRef.current + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      perfectHitsRef.current++;
      perfectStreakRef.current++;

      DifficultyManager.updateScore(newScore);
      pulseSpeedRef.current = DifficultyManager.getCurrentSpeed();
      currentToleranceRef.current = DifficultyManager.getCurrentTolerance();
      setCurrentTolerance(currentToleranceRef.current);
      setDifficultyPhase(DifficultyManager.getCurrentPhase());

      triggerFlash();
      triggerDistraction(newScore); // Trigger distractions if score > 60
      createRingParticles(); // Queues particles to ref, loop handles state update

      AudioService.playHit(newScore);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      pulseRadiusRef.current = 0;
      pulseRadiusAnim.setValue(0);
    } else {
      setGameOverReason('MISS_CLICK');
      handleGameOver();
    }
  }, [handleGameOver, createRingParticles, triggerFlash, triggerDistraction]);

  const handleGameOver = useCallback(async () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const finalScore = scoreRef.current;

    setGameState(GAME_STATES.GAMEOVER);
    gameOverAnim.setValue(1);
    triggerShake();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);

    AudioService.playFail();

    const accuracy = totalHitsRef.current > 0 ? Math.round((perfectHitsRef.current / totalHitsRef.current) * 100) : 0;
    const survivalTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const gameStats = { score: finalScore, perfectHits: perfectHitsRef.current, totalHits: totalHitsRef.current, streak: perfectStreakRef.current, survivalTime };
    const reflexRating = getReflexRating(finalScore, accuracy);

    const isNewBest = await StorageService.saveBestScore(finalScore);
    if (isNewBest) setBestScore(finalScore);
    await StorageService.saveHighScore(gameStats.score);
    await StorageService.updateStats(gameStats);
    await QuestService.updateQuestProgress(gameStats);
    await checkQuests(gameStats);

    // Refresh global theme in case of high score or mission unlock
    refreshTheme();

    setPerformanceData({ ...reflexRating, score: finalScore, accuracy, isNewBest });
    setShowPerformanceMessage(true);

    // Save to Global Leaderboard in background
    if (user && !user.isGuest) {
      StorageService.syncWithCloud(user)
        .catch(async e => {
          console.log('Leaderboard sync failed:', e);
          await StorageService.setNeedSync(true);
        });
    }

    AdManager.showAd();
  }, []);

  const triggerFlash = useCallback(() => {
    flashAnim.setValue(GAME_CONSTANTS.FLASH_OPACITY);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [flashAnim]);

  const createRingParticles = useCallback(() => {
    const MAX_PARTICLES = 20;
    const count = 5;
    const theme = getThemeByScore(scoreRef.current);
    const color = theme.particleColor;
    let newParticles = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = CENTER_X + Math.cos(angle) * GAME_CONSTANTS.TARGET_RADIUS;
      const y = CENTER_Y + Math.sin(angle) * GAME_CONSTANTS.TARGET_RADIUS;
      const burst = createParticleBurst(x, y, color, 2);
      for (let j = 0; j < burst.length; j++) {
        newParticles.push(burst[j]);
      }
    }

    // Critical Optimization: Do NOT set state here.
    // Just push to ref. The game loop will pick it up on next frame.
    const combined = [...particlesRef.current, ...newParticles];
    particlesRef.current = combined.length > MAX_PARTICLES ? combined.slice(-MAX_PARTICLES) : combined;
    // setParticles(particlesRef.current); // REMOVED to prevent lag spike on tap
  }, []);

  // Distraction Animation Refs
  const distractionRotate = useRef(new Animated.Value(0)).current;
  const distractionScale = useRef(new Animated.Value(1)).current;
  const distractionOpacity = useRef(new Animated.Value(1)).current;

  // Apply Distractions
  const triggerDistraction = useCallback((currentScore) => {
    if (currentScore <= 60) return;

    // Random choice of distraction
    const seed = Math.random();

    // 1. Screen Tilt (Rotation)
    if (seed > 0.6) {
      const angle = Math.random() > 0.5 ? 5 : -5;
      Animated.sequence([
        Animated.timing(distractionRotate, { toValue: angle, duration: 200, useNativeDriver: true }),
        Animated.timing(distractionRotate, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    // 2. Pulse Zoom (Scale)
    if (seed < 0.3) {
      Animated.sequence([
        Animated.timing(distractionScale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(distractionScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }

    // 3. Flicker (Opacity)
    if (seed > 0.3 && seed < 0.5) {
      Animated.sequence([
        Animated.timing(distractionOpacity, { toValue: 0.6, duration: 50, useNativeDriver: true }),
        Animated.timing(distractionOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    }

  }, [distractionRotate, distractionScale, distractionOpacity]);


  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const checkQuests = async (stats) => {
    const currentStats = await StorageService.getStats();
    let totalXPGained = 0;
    let labelsGained = [];
    let themesGained = [];

    for (const quest of QUESTS) {
      if (checkQuestCompletion(quest, { ...currentStats, currentScore: stats.score, currentStreak: stats.streak, survivalTime: stats.survivalTime })) {
        const progress = await StorageService.getQuestProgress();
        if (!progress[quest.id]?.completed) {
          await StorageService.saveQuestProgress(quest.id, true);

          if (quest.reward.xp) totalXPGained += quest.reward.xp;
          if (quest.reward.label) labelsGained.push(quest.reward.label);
          if (quest.reward.theme) {
            themesGained.push(quest.reward.theme);
            await StorageService.unlockTheme(quest.reward.theme);
          }
        }
      }
    }

    if (totalXPGained > 0 || labelsGained.length > 0) {
      // Apply XP
      if (totalXPGained > 0) {
        await StorageService.addXP(totalXPGained);
      }

      // Apply Labels
      for (const label of labelsGained) {
        await StorageService.addLabel(label);
      }

      // Update global leaderboard with final stats
      if (user && !user.isGuest) {
        const [level, xp, labels, customUsername] = await Promise.all([
          StorageService.getUserLevel(),
          StorageService.getUserXP(),
          StorageService.getUserLabels(),
          StorageService.getUserName()
        ]);

        await LeaderboardService.saveScore(user, stats.score, customUsername, level, xp, labels);
      }
    } else if (user && !user.isGuest) {
      // Just save score if no new rewards but high score achieved (saveScore handles internal check)
      const [level, xp, labels, customUsername] = await Promise.all([
        StorageService.getUserLevel(),
        StorageService.getUserXP(),
        StorageService.getUserLabels(),
        StorageService.getUserName()
      ]);
      await LeaderboardService.saveScore(user, stats.score, customUsername, level, xp, labels);
    }
  };

  // Calculate theme and shape based on current score
  const gameTheme = useMemo(() => {
    try {
      const currentMilestoneTheme = getThemeByScore(score);
      const selectedTheme = getThemeById(selectedThemeId);

      // In auto-mode, always follow the current score-based theme
      if (isAutoTheme) {
        return currentMilestoneTheme;
      }

      // In manual mode, use whichever is 'higher' or simply prioritize milestone progress if it exceeds selected
      if (currentMilestoneTheme.unlockScore > selectedTheme.unlockScore) {
        return currentMilestoneTheme;
      }
      return selectedTheme;
    } catch (e) {
      return { ringColor: '#22d3ee', particleColor: '#67e8f9', background: ['#020617', '#172554', '#1e1b4b'] }; // Fallback
    }
  }, [score, selectedThemeId, isAutoTheme]);
  const gameShape = useMemo(() => getShapeForScore(score), [score]);

  // Memoize UI elements to prevent unnecessary re-renders
  const BackButton = useMemo(() => (
    gameState !== GAME_STATES.PLAYING && (
      <TouchableOpacity
        style={styles.gameBackButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <ChevronLeftIcon size={28} color="#fff" />
      </TouchableOpacity>
    )
  ), [gameState, navigation]);

  const ScoreHUD = useMemo(() => (
    <View style={styles.topBar}>
      <ScoreDisplay score={score} bestScore={bestScore} currentTheme={gameTheme} />
    </View>
  ), [score, bestScore, gameTheme]);

  // Optimize re-renders: Separate the game visual logic from the rest of the screen
  const GameVisuals = useMemo(() => {
    return (
      <View style={styles.gameArea}>
        <Svg width={width} height={height}>
          {/* Static Target Circle */}
          <PulseCircle
            centerX={CENTER_X}
            centerY={CENTER_Y}
            radius={GAME_CONSTANTS.TARGET_RADIUS}
            color={gameTheme.ringColor}
            strokeWidth={2}
            shape={gameShape}
          />

          {/* Animated Pulsing Ring */}
          {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.GAMEOVER) && (
            <PulseCircle
              centerX={CENTER_X}
              centerY={CENTER_Y}
              radius={pulseRadiusAnim}
              color={gameTheme.ringColor}
              perfectZoneAnim={perfectZoneAnim}
              gameOverAnim={gameOverAnim}
              shape={gameShape}
            />
          )}

          {/* Dynamic Partical Effects */}
          <ParticleSystem particles={particles} />
        </Svg>
      </View>
    );
  }, [gameTheme, gameShape, gameState, particles]);

  return (
    <ThemeBackground theme={gameTheme}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { translateX: shakeAnim },
                { rotate: distractionRotate.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] }) },
                { scale: distractionScale }
              ],
              opacity: Animated.multiply(contentFade, distractionOpacity)
            }
          ]}
        >
          <Animated.View style={[styles.flashLayer, { opacity: flashAnim }]} />

          {BackButton}
          {ScoreHUD}

          {GameVisuals}

          {/* Cinematic Start Screen */}
          {gameState === GAME_STATES.START && !showPerformanceMessage && (
            <View style={styles.overlay}>
              <Animated.View style={[styles.logoStage, { transform: [{ scale: auraAnim }] }]}>
                <View style={[styles.startLogoInner, { borderColor: gameTheme.ringColor, shadowColor: gameTheme.ringColor }]}>
                  <GamepadIcon size={56} color={gameTheme.ringColor} />
                </View>
                <View style={[styles.logoAura, { borderColor: gameTheme.ringColor }]} />
              </Animated.View>

              <View style={styles.titleBox}>
                <Text style={[styles.titleShadow, { color: gameTheme.primary }]}>PULSE</Text>
                <Text style={[styles.titleText, { color: gameTheme.text }]}>PULSE FLOW</Text>
                <Text style={[styles.subtitleTag, { color: gameTheme.subText }]}>RHYTHM & REFLEX</Text>
              </View>

              <View style={styles.glassContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']}
                  style={styles.glassInner}
                >
                  <Text style={[styles.subtitle, { color: gameTheme.text, opacity: 0.8 }]}>Tap when the rings align.{"\n"}Survive the chaos.</Text>

                  <TouchableOpacity onPress={startGame} activeOpacity={0.8} style={styles.startButtonWrapper}>
                    <LinearGradient
                      colors={[gameTheme.pulseColor, gameTheme.ringColor]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.premiumStartBtn}
                    >
                      <Text style={[styles.premiumStartBtnText, { color: gameTheme.text }]}>START ENGINE</Text>
                      <SparklesIcon size={20} color={`${gameTheme.text}80`} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.bestScorePill}>
                    <TrophyIcon size={16} color={gameTheme.primary} />
                    <Text style={[styles.bestScoreLabel, { color: gameTheme.subText }]}>BEST RECORD</Text>
                    <Text style={[styles.bestScoreValue, { color: gameTheme.primary }]}>{bestScore}</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Premium Game Over Screen - Enhanced */}
          {showPerformanceMessage && performanceData && (
            <TouchableWithoutFeedback onPress={() => {
              setShowPerformanceMessage(false);
              setGameState(GAME_STATES.START);
            }}>
              <View style={styles.overlay}>
                <View style={styles.glassContainer}>
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.95)']}
                    style={styles.performanceGlass}
                  >
                    <View style={styles.resultEmoteContainer}>
                      <Text style={styles.performanceEmoji}>{performanceData.emoji}</Text>
                    </View>

                    <Text style={[styles.performanceTitle, { color: performanceData.color }]}>{performanceData.title}</Text>
                    <Text style={styles.performanceMessage}>{performanceData.message}</Text>

                    <View style={styles.metricsGrid}>
                      <View style={styles.metricCard}>
                        <Text style={[styles.metricValue, { color: gameTheme.ringColor }]}>{performanceData.score}</Text>
                        <Text style={styles.metricLabel}>SCORE</Text>
                      </View>
                      <View style={styles.metricSide}>
                        <View style={styles.metricRow}>
                          <Text style={styles.metricLabelSmall}>ACCURACY</Text>
                          <Text style={styles.metricValueSmall}>{performanceData.accuracy}%</Text>
                        </View>
                        <View style={styles.metricRow}>
                          <Text style={styles.metricLabelSmall}>STREAK</Text>
                          <Text style={styles.metricValueSmall}>{gameTheme?.streak || 0}</Text>
                        </View>
                      </View>
                    </View>

                    {performanceData.isNewBest && (
                      <View style={styles.newBestStage}>
                        <SparklesIcon size={16} color="#fbbf24" />
                        <Text style={styles.newBestText}>NEW HIGH SCORE</Text>
                        <SparklesIcon size={16} color="#fbbf24" />
                      </View>
                    )}

                    {/* Guest Login Prompt */}
                    {user?.isGuest && (
                      <View style={styles.guestLoginPrompt}>
                        <LinearGradient
                          colors={[`${gameTheme.primary}15`, `${gameTheme.primary}05`]}
                          style={styles.guestLoginInner}
                        >
                          <Text style={[styles.guestLoginTitle, { color: gameTheme.text }]}>WANT TO SAVE THIS GLOBALLY?</Text>
                          <Text style={[styles.guestLoginSub, { color: gameTheme.subText }]}>Log in to compete in the global leaderboard and save your progress forever.</Text>
                          <TouchableOpacity
                            style={[styles.guestLoginBtn, { backgroundColor: gameTheme.primary }]}
                            onPress={() => {
                              setShowPerformanceMessage(false);
                              setGameState(GAME_STATES.START);
                              navigation.navigate('Login');
                            }}
                          >
                            <Text style={[styles.guestLoginBtnText, { color: gameTheme.background[0] }]}>LOG IN / SIGN UP</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    )}

                    <View style={styles.footerPrompt}>
                      <Text style={styles.tapToContinue}>TAP TO RETRY</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {gameState === GAME_STATES.PLAYING && (
            <TouchableWithoutFeedback onPress={handleTap}>
              <View style={styles.clickOverlay} />
            </TouchableWithoutFeedback>
          )}

          {/* Polished HUD */}
          {gameState === GAME_STATES.PLAYING && (
            <View style={styles.hudContainer}>
              {difficultyPhase && score >= 5 && (
                <View style={[styles.indicatorPill, { borderColor: difficultyPhase.color, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <Text style={[styles.indicatorText, { color: difficultyPhase.color }]}>
                    {difficultyPhase.icon} {difficultyPhase.name}
                  </Text>
                </View>
              )}
              {score > 60 && (
                <View style={[styles.dangerPill, { opacity: (Math.sin(Date.now() / 200) + 1) / 2 }]}>
                  <Text style={styles.dangerText}>⚠️ UNSTABLE ⚠️</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </ThemeBackground>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameBackButton: {
    position: 'absolute',
    top: height * 0.06,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24, // Fully rounded
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topBar: {
    position: 'absolute',
    top: height * 0.06,
    alignSelf: 'center', // Center it
    zIndex: 25,
    pointerEvents: 'none',
  },
  flashLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 10,
    pointerEvents: 'none',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: 24,
  },
  clickOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
    backgroundColor: 'transparent',
  },
  logoStage: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  startLogoInner: {
    width: 80,
    height: 80,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 50,
    borderWidth: 1,
    opacity: 0.2,
  },
  titleBox: {
    alignItems: 'center',
    marginBottom: 50,
  },
  titleText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginTop: -48, // Overlay with shadow
  },
  titleShadow: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.3,
    transform: [{ translateY: 4 }, { translateX: 2 }],
  },
  subtitleTag: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 16,
  },
  glassContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassInner: {
    padding: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.8,
  },
  startButtonWrapper: {
    width: '100%',
    marginBottom: 24,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 20,
  },
  premiumStartBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  bestScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bestScoreLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 1,
  },
  bestScoreValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  performanceGlass: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  resultEmoteContainer: {
    marginBottom: 10,
  },
  performanceEmoji: {
    fontSize: 80,
  },
  performanceTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  performanceMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  metricCard: {
    flex: 1.5,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricSide: {
    flex: 1,
    gap: 8,
  },
  metricRow: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricValue: {
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 0,
    lineHeight: 48,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  metricValueSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  metricLabelSmall: {
    fontSize: 8,
    letterSpacing: 1,
    color: '#647 48b',
    marginBottom: 2,
    fontWeight: '700',
  },
  newBestStage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  newBestText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  footerPrompt: {
    marginTop: 10,
  },
  tapToContinue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 3,
    opacity: 0.7,
  },
  guestLoginPrompt: {
    width: '100%',
    marginVertical: 15,
  },
  guestLoginInner: {
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  guestLoginTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#22d3ee',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestLoginSub: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 14,
    fontWeight: '600',
  },
  guestLoginBtn: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  guestLoginBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
  },
  hudContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
    pointerEvents: 'none',
  },
  activeIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 8, 15, 0.6)',
    borderWidth: 1,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dangerPill: {
    marginTop: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  dangerText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bottomHint: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 4,
    fontWeight: '800',
  },
});

export default GameScreen;

