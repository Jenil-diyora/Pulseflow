import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import Svg from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import ThemeBackground from '../components/ThemeBackground';
import PulseCircle from '../components/PulseCircle';
import ParticleSystem, { createParticleBurst } from '../components/ParticleSystem';
import ScoreDisplay from '../components/ScoreDisplay';
import { GAME_CONSTANTS, GAME_STATES, getReflexRating, getShapeForScore } from '../utils/constants';
import { getThemeByScore } from '../data/themes';
import AudioService from '../services/AudioService';
import StorageService from '../services/StorageService';
import { QUESTS, checkQuestCompletion } from '../data/quests';
import DifficultyManager from '../services/DifficultyManager';

const { width, height } = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2; // TRUE CENTER


const GameScreen = ({ navigation }) => {
  // UI State
  const [gameState, setGameState] = useState(GAME_STATES.START);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [showPerformanceMessage, setShowPerformanceMessage] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [currentTolerance, setCurrentTolerance] = useState(GAME_CONSTANTS.INITIAL_TOLERANCE);
  const [difficultyPhase, setDifficultyPhase] = useState(null);

  // Refs for performance optimization - avoid re-creating functions
  const gameStateRef = useRef(GAME_STATES.START);
  const scoreRef = useRef(0);

  // Animation & Feedback
  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Game Logic Refs
  const pulseRadiusRef = useRef(0);
  const pulseSpeedRef = useRef(GAME_CONSTANTS.INITIAL_SPEED);
  const [displayRadius, setDisplayRadius] = useState(0);
  const [particles, setParticles] = useState([]);

  const totalHitsRef = useRef(0);
  const perfectHitsRef = useRef(0);
  const gameStartTimeRef = useRef(null);

  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const particlesRef = useRef([]);

  useEffect(() => {
    loadBestScore();
    AudioService.initialize();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Sync refs with state
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
    setDisplayRadius(pulseRadiusRef.current);

    // Use dynamic tolerance from difficulty manager
    if (pulseRadiusRef.current > GAME_CONSTANTS.TARGET_RADIUS + currentTolerance + 20) {
      handleGameOver();
      return;
    }

    // Optimize: Update particles imperatively and filter
    particlesRef.current = particlesRef.current.filter(p => {
      p.update();
      return p.life > 0;
    });
    setParticles([...particlesRef.current]);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    setGameState(GAME_STATES.PLAYING);
    gameStateRef.current = GAME_STATES.PLAYING;
    setScore(0);
    scoreRef.current = 0;
    pulseRadiusRef.current = 0;
    setDisplayRadius(0); // Ensure visual starts at center immediately

    // Initialize difficulty system
    DifficultyManager.reset();
    pulseSpeedRef.current = DifficultyManager.getCurrentSpeed();
    setCurrentTolerance(DifficultyManager.getCurrentTolerance());
    setDifficultyPhase(DifficultyManager.getCurrentPhase());

    particlesRef.current = [];
    setParticles([]);
    setPerfectStreak(0);
    totalHitsRef.current = 0;
    perfectHitsRef.current = 0;
    gameStartTimeRef.current = Date.now();
    setShowPerformanceMessage(false);
    setGameOverReason(null);

    lastUpdateRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handleTap = async () => {
    if (gameStateRef.current !== GAME_STATES.PLAYING) return;

    const distance = Math.abs(pulseRadiusRef.current - GAME_CONSTANTS.TARGET_RADIUS);
    totalHitsRef.current++;

    // Use dynamic tolerance from difficulty manager
    if (distance < currentTolerance) {
      // SUCCESS
      const newScore = scoreRef.current + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      perfectHitsRef.current++;
      setPerfectStreak(prev => prev + 1);

      // Update difficulty system with new score
      DifficultyManager.updateScore(newScore);

      // Get new difficulty parameters (human-centered progression)
      const newSpeed = DifficultyManager.getCurrentSpeed();
      const newTolerance = DifficultyManager.getCurrentTolerance();
      const newPhase = DifficultyManager.getCurrentPhase();

      pulseSpeedRef.current = newSpeed;
      setCurrentTolerance(newTolerance);
      setDifficultyPhase(newPhase);

      // Effects matching HTML
      triggerFlash();
      createRingParticles();

      await AudioService.playHit(newScore);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Reset pulse for next round
      pulseRadiusRef.current = 0;
    } else {
      setGameOverReason('MISS_CLICK');
      handleGameOver();
    }
  };

  const handleGameOver = async () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setGameState(GAME_STATES.GAMEOVER);

    // Trigger screen shake animation
    triggerShake();

    await AudioService.playFail();

    const accuracy = totalHitsRef.current > 0 ? Math.round((perfectHitsRef.current / totalHitsRef.current) * 100) : 0;
    const reflexRating = getReflexRating(score, accuracy);

    const isNewBest = await StorageService.saveBestScore(score);
    if (isNewBest) setBestScore(score);
    await StorageService.saveHighScore(score);

    const survivalTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const gameStats = { score, perfectHits: perfectHitsRef.current, totalHits: totalHitsRef.current, streak: perfectStreak, survivalTime };
    await StorageService.updateStats(gameStats);
    await checkQuests(gameStats);

    setPerformanceData({ ...reflexRating, score, accuracy, isNewBest });
    setShowPerformanceMessage(true);
    // No auto-dismiss - user must tap to continue
  };

  const triggerFlash = () => {
    flashAnim.setValue(GAME_CONSTANTS.FLASH_OPACITY); // 0.15 matching HTML
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };


  const createRingParticles = () => {
    // PERFORMANCE: Cap particles at 150 to prevent accumulation lag on mobile
    const MAX_PARTICLES = 150;

    // Create 12 particle bursts around the entire ring (matching HTML exactly)
    let newParticles = [];
    for (let i = 0; i < GAME_CONSTANTS.PARTICLE_COUNT; i++) {
      const angle = (i / GAME_CONSTANTS.PARTICLE_COUNT) * Math.PI * 2;
      const x = CENTER_X + Math.cos(angle) * GAME_CONSTANTS.TARGET_RADIUS;
      const y = CENTER_Y + Math.sin(angle) * GAME_CONSTANTS.TARGET_RADIUS;
      newParticles = [...newParticles, ...createParticleBurst(x, y, currentTheme.particleColor, 2)];
    }

    // Add new particles but maintain cap
    particlesRef.current = [...particlesRef.current, ...newParticles].slice(-MAX_PARTICLES);
    setParticles([...particlesRef.current]);
  };

  const triggerShake = () => {
    // Shake animation matching HTML (10%, 20%, 30%... keyframes)
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const checkQuests = async (stats) => {
    const currentStats = await StorageService.getStats();
    for (const quest of QUESTS) {
      if (checkQuestCompletion(quest, { ...currentStats, currentScore: stats.score, currentStreak: stats.streak, survivalTime: stats.survivalTime })) {
        const progress = await StorageService.getQuestProgress();
        if (!progress[quest.id]?.completed) {
          await StorageService.saveQuestProgress(quest.id, true);
          if (quest.reward.includes('Theme')) await StorageService.unlockTheme(quest.reward.toLowerCase().split(' ')[0]);
        }
      }
    }
  };

  const isInPerfectZone = Math.abs(displayRadius - GAME_CONSTANTS.TARGET_RADIUS) < currentTolerance;
  const currentTheme = getThemeByScore(score);
  const currentShape = getShapeForScore(score);

  return (
    <ThemeBackground theme={currentTheme}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
          {/* Success Flash Layer */}
          <Animated.View style={[styles.flashLayer, { opacity: flashAnim }]} />

          {/* Score Display - Absolutely positioned */}
          <View style={styles.scoreContainer}>
            <ScoreDisplay score={score} bestScore={bestScore} currentTheme={currentTheme} />
          </View>

          <View style={styles.gameArea}>
            <Svg width={width} height={height}>
              {/* Target Shape - Fixed at center, constant size */}
              <PulseCircle
                centerX={CENTER_X}
                centerY={CENTER_Y}
                radius={GAME_CONSTANTS.TARGET_RADIUS}
                color={currentTheme.ringColor}
                strokeWidth={4}
                shape={currentShape}
              />

              {/* Expanding Pulse Shape */}
              {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.GAMEOVER) && (
                <PulseCircle
                  centerX={CENTER_X}
                  centerY={CENTER_Y}
                  radius={displayRadius}
                  color={gameState === GAME_STATES.GAMEOVER && gameOverReason === 'MISS_CLICK' ? '#ef4444' : (isInPerfectZone ? currentTheme.ringColor : 'rgba(255, 255, 255, 0.5)')}
                  strokeWidth={isInPerfectZone ? 6 : 2}
                  inPerfectZone={isInPerfectZone}
                  shape={currentShape}
                />
              )}

              <ParticleSystem particles={particles} />
            </Svg>
          </View>

          {gameState === GAME_STATES.START && !showPerformanceMessage && (
            <View style={styles.overlay}>
              <View style={styles.startContainer}>
                <Text style={[styles.title, { color: currentTheme.ringColor }]}>PULSE TAP</Text>
                <Text style={styles.subtitle}>Tap when the expanding pulse hits the outer ring</Text>
                <TouchableWithoutFeedback onPress={startGame}>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>TAP TO START</Text>
                  </View>
                </TouchableWithoutFeedback>
                <Text style={styles.bestText}>Best: {bestScore}</Text>
              </View>
            </View>
          )}

          {showPerformanceMessage && performanceData && (
            <TouchableWithoutFeedback onPress={() => {
              setShowPerformanceMessage(false);
              setGameState(GAME_STATES.START);
            }}>
              <View style={styles.overlay}>
                <View style={styles.performanceContainer}>
                  <Text style={styles.performanceEmoji}>{performanceData.emoji}</Text>
                  <Text style={[styles.performanceTitle, { color: performanceData.color }]}>{performanceData.title}</Text>
                  <Text style={styles.performanceMessage}>{performanceData.message}</Text>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceStatValue, { color: currentTheme.ringColor }]}>{performanceData.score}</Text>
                      <Text style={styles.performanceStatLabel}>Score</Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceStatValue, { color: currentTheme.ringColor }]}>{performanceData.accuracy}%</Text>
                      <Text style={styles.performanceStatLabel}>Accuracy</Text>
                    </View>
                  </View>
                  {performanceData.isNewBest && <Text style={styles.newBestText}>🎉 NEW BEST SCORE! 🎉</Text>}
                  <Text style={styles.tapToContinue}>Tap to continue</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* Perfect Click Overlay - Ensures no missed clicks during gameplay */}
          {gameState === GAME_STATES.PLAYING && (
            <TouchableWithoutFeedback onPress={handleTap}>
              <View style={styles.clickOverlay} />
            </TouchableWithoutFeedback>
          )}

          {gameState === GAME_STATES.PLAYING && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>TAP ANYWHERE</Text>
              {difficultyPhase && score >= 10 && (
                <Text style={[styles.phaseText, { color: difficultyPhase.color }]}>
                  {difficultyPhase.icon} {difficultyPhase.name}
                </Text>
              )}
              {perfectStreak > 2 && <Text style={[styles.streakText, { color: currentTheme.ringColor }]}>🔥 {perfectStreak} STREAK!</Text>}
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
    userSelect: 'none', // Prevent text selection on rapid clicks (web)
  },
  scoreContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 25, pointerEvents: 'none' },
  flashLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white', zIndex: 10, pointerEvents: 'none' },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  clickOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 15, backgroundColor: 'transparent' },
  startContainer: { alignItems: 'center', padding: 20 },
  title: { fontSize: 56, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginBottom: 40, paddingHorizontal: 40 },
  startButton: { paddingHorizontal: 40, paddingVertical: 16, backgroundColor: '#06b6d4', borderRadius: 30 },
  startButtonText: { fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: 1 },
  bestText: { fontSize: 14, color: '#94a3b8', marginTop: 24 },
  hintContainer: { position: 'absolute', bottom: 60, alignSelf: 'center', alignItems: 'center' },
  hintText: { fontSize: 11, color: '#64748b', letterSpacing: 3, fontWeight: '700' },
  phaseText: { fontSize: 14, fontWeight: '700', marginTop: 6, letterSpacing: 1 },
  streakText: { fontSize: 20, fontWeight: '900', marginTop: 8 },
  performanceContainer: { alignItems: 'center', padding: 40, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 24, marginHorizontal: 20 },
  performanceEmoji: { fontSize: 80, marginBottom: 16 },
  performanceTitle: { fontSize: 36, fontWeight: '900', marginBottom: 12 },
  performanceMessage: { fontSize: 18, color: '#cbd5e1', textAlign: 'center', marginBottom: 24 },
  performanceStats: { flexDirection: 'row', gap: 40, marginBottom: 16 },
  performanceStat: { alignItems: 'center' },
  performanceStatValue: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  performanceStatLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' },
  newBestText: { fontSize: 16, fontWeight: '700', color: '#fbbf24', marginTop: 16 },
  tapToContinue: { fontSize: 14, color: '#64748b', marginTop: 20, fontWeight: '600' },
});

export default GameScreen;
