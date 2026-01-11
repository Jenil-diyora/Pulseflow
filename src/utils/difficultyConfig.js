/**
 * Difficulty Configuration System
 * 
 * This module defines the human-centered difficulty progression for the Pulse Tap game.
 * It respects biological reaction time limits while providing infinite, engaging difficulty scaling.
 * 
 * Core Philosophy:
 * - Speed creates stress (capped at human limits)
 * - Precision creates mastery (tolerance reduction)
 * - Patterns create depth (cognitive challenges)
 */

// ============================================================================
// BIOLOGICAL CONSTANTS
// ============================================================================

export const HUMAN_LIMITS = {
    // Average visual reaction time: 200-250ms
    // Skilled rhythm players: 120-150ms
    // Below 100ms: becomes guess-based (unfair)
    MIN_REACTION_TIME_MS: 120,
    AVERAGE_REACTION_TIME_MS: 200,

    // Processing delays
    VISUAL_PROCESSING_MS: 80,
    COGNITIVE_DECISION_MS: 50,
    MOTOR_RESPONSE_MS: 60,
};

// ============================================================================
// DIFFICULTY PARAMETERS
// ============================================================================

export const DIFFICULTY_PARAMS = {
    // Speed parameters
    INITIAL_SPEED: 1.5,           // Starting speed (pixels/frame)
    MAX_SPEED: 4.5,               // Biological cap (allows 150-180ms reaction window)
    SPEED_CURVE_STEEPNESS: 0.08,  // Logarithmic growth factor (higher = faster approach to cap)

    // Tolerance parameters
    INITIAL_TOLERANCE: 20,        // Starting timing window (pixels)
    MIN_TOLERANCE: 10,            // Minimum playable tolerance (pixels)
    TOLERANCE_REDUCTION_START: 36, // Score at which tolerance reduction begins
    TOLERANCE_REDUCTION_END: 180,  // Score at which tolerance reaches minimum

    // Pattern complexity
    DOUBLE_PULSE_START_SCORE: 91,
    DOUBLE_PULSE_CHANCE: 0.15,
    FAST_START_PULSE_CHANCE: 0.2,
    FAST_START_RADIUS: 40,

    // Cognitive load
    GHOST_PULSE_START_SCORE: 131,
    GHOST_PULSE_CHANCE: 0.1,
    DISTRACTION_FLASH_STREAK: 10,

    // Visual effects
    COLOR_VARIATION_START_SCORE: 131,
    FAKE_PULSE_CHANCE: 0.08,
};

// ============================================================================
// DIFFICULTY PHASES
// ============================================================================

export const DIFFICULTY_PHASES = [
    {
        id: 'LEARNING',
        name: 'Learning',
        minScore: 0,
        maxScore: 15,
        description: 'Understanding timing mechanics',
        icon: '🎯',
        color: '#60a5fa',
        features: ['Pure timing practice', 'Full tolerance', 'Speed ramping up'],
    },
    {
        id: 'ACCELERATION',
        name: 'Acceleration',
        minScore: 16,
        maxScore: 35,
        description: 'Speed challenge',
        icon: '⚡',
        color: '#34d399',
        features: ['Speed reaches maximum', 'Full tolerance', 'No gimmicks'],
    },
    {
        id: 'PRECISION',
        name: 'Precision Era',
        minScore: 36,
        maxScore: 60,
        description: 'Accuracy over speed',
        icon: '🎪',
        color: '#fbbf24',
        features: ['Speed locked', 'Tolerance reducing', 'Precision required'],
    },
    {
        id: 'TIGHT_WINDOW',
        name: 'Tight Window',
        minScore: 61,
        maxScore: 90,
        description: 'Mastery-level accuracy',
        icon: '💎',
        color: '#a855f7',
        features: ['Speed locked', 'Minimal tolerance', 'Consistent excellence'],
    },
    {
        id: 'PATTERNS',
        name: 'Pattern Complexity',
        minScore: 91,
        maxScore: 130,
        description: 'Rhythm variation',
        icon: '🌀',
        color: '#ec4899',
        features: ['Double pulses', 'Speed variation', 'Mental challenge'],
    },
    {
        id: 'COGNITIVE',
        name: 'Cognitive Load',
        minScore: 131,
        maxScore: 180,
        description: 'Focus and perception',
        icon: '🧠',
        color: '#f97316',
        features: ['Ghost pulses', 'Visual distractions', 'Focus test'],
    },
    {
        id: 'MASTERY',
        name: 'Mastery Chaos',
        minScore: 181,
        maxScore: 9999,
        description: 'Endurance and expertise',
        icon: '👑',
        color: '#fbbf24',
        features: ['All mechanics', 'Maximum difficulty', 'True mastery'],
    },
];

// ============================================================================
// CORE DIFFICULTY FUNCTIONS
// ============================================================================

/**
 * Calculate speed for a given score using logarithmic approach to MAX_SPEED
 * This ensures speed never exceeds human reaction capabilities
 * 
 * Formula: speed = INITIAL + (MAX - INITIAL) * (1 - e^(-score * k))
 * 
 * @param {number} score - Current game score
 * @returns {number} Speed in pixels per frame
 */
export function getSpeedForScore(score) {
    const { INITIAL_SPEED, MAX_SPEED, SPEED_CURVE_STEEPNESS } = DIFFICULTY_PARAMS;

    // Logarithmic approach to max speed
    const speed = INITIAL_SPEED +
        (MAX_SPEED - INITIAL_SPEED) *
        (1 - Math.exp(-score * SPEED_CURVE_STEEPNESS));

    // Enforce hard cap (safety)
    return Math.min(speed, MAX_SPEED);
}

/**
 * Calculate tolerance (timing window) for a given score
 * Tolerance remains full during speed phase, then gradually reduces
 * 
 * @param {number} score - Current game score
 * @returns {number} Tolerance in pixels
 */
export function getToleranceForScore(score) {
    const {
        INITIAL_TOLERANCE,
        MIN_TOLERANCE,
        TOLERANCE_REDUCTION_START,
        TOLERANCE_REDUCTION_END
    } = DIFFICULTY_PARAMS;

    // Full tolerance until precision phase starts
    if (score < TOLERANCE_REDUCTION_START) {
        return INITIAL_TOLERANCE;
    }

    // Minimum tolerance at mastery phase
    if (score >= TOLERANCE_REDUCTION_END) {
        return MIN_TOLERANCE;
    }

    // Linear reduction between start and end scores
    const reductionProgress = (score - TOLERANCE_REDUCTION_START) /
        (TOLERANCE_REDUCTION_END - TOLERANCE_REDUCTION_START);

    const tolerance = INITIAL_TOLERANCE -
        (INITIAL_TOLERANCE - MIN_TOLERANCE) * reductionProgress;

    return Math.max(tolerance, MIN_TOLERANCE);
}

/**
 * Get current difficulty phase for a given score
 * 
 * @param {number} score - Current game score
 * @returns {Object} Difficulty phase object
 */
export function getDifficultyPhase(score) {
    return DIFFICULTY_PHASES.find(
        phase => score >= phase.minScore && score <= phase.maxScore
    ) || DIFFICULTY_PHASES[DIFFICULTY_PHASES.length - 1];
}

/**
 * Check if a specific mechanic should be active at current score
 * 
 * @param {string} mechanic - Mechanic name
 * @param {number} score - Current game score
 * @returns {boolean} Whether mechanic is active
 */
export function isMechanicActive(mechanic, score) {
    const mechanics = {
        'DOUBLE_PULSE': score >= DIFFICULTY_PARAMS.DOUBLE_PULSE_START_SCORE,
        'FAST_START': score >= DIFFICULTY_PARAMS.DOUBLE_PULSE_START_SCORE,
        'GHOST_PULSE': score >= DIFFICULTY_PARAMS.GHOST_PULSE_START_SCORE,
        'DISTRACTION': score >= DIFFICULTY_PARAMS.GHOST_PULSE_START_SCORE,
        'COLOR_VARIATION': score >= DIFFICULTY_PARAMS.COLOR_VARIATION_START_SCORE,
    };

    return mechanics[mechanic] || false;
}

/**
 * Determine if a double pulse should spawn
 * 
 * @param {number} score - Current game score
 * @returns {boolean} Whether to spawn double pulse
 */
export function shouldSpawnDoublePulse(score) {
    if (!isMechanicActive('DOUBLE_PULSE', score)) return false;
    return Math.random() < DIFFICULTY_PARAMS.DOUBLE_PULSE_CHANCE;
}

/**
 * Determine if pulse should start from a fast-start position
 * 
 * @param {number} score - Current game score
 * @returns {number} Starting radius for pulse
 */
export function getPulseStartRadius(score) {
    if (!isMechanicActive('FAST_START', score)) return 0;

    if (Math.random() < DIFFICULTY_PARAMS.FAST_START_PULSE_CHANCE) {
        return DIFFICULTY_PARAMS.FAST_START_RADIUS;
    }

    return 0;
}

/**
 * Determine if a ghost pulse should spawn
 * Ghost pulses are visual distractions that don't require taps
 * 
 * @param {number} score - Current game score
 * @returns {boolean} Whether to spawn ghost pulse
 */
export function shouldSpawnGhostPulse(score) {
    if (!isMechanicActive('GHOST_PULSE', score)) return false;
    return Math.random() < DIFFICULTY_PARAMS.GHOST_PULSE_CHANCE;
}

/**
 * Calculate reaction window in milliseconds for current difficulty
 * Useful for analytics and debugging
 * 
 * @param {number} score - Current game score
 * @returns {Object} Reaction window analysis
 */
export function getReactionWindowAnalysis(score) {
    const speed = getSpeedForScore(score);
    const tolerance = getToleranceForScore(score);

    // Visible window in pixels
    const windowPixels = tolerance * 2;

    // Frames available at 60 FPS
    const framesAvailable = windowPixels / speed;

    // Milliseconds available (assuming 60 FPS = 16.67ms per frame)
    const msAvailable = framesAvailable * 16.67;

    // Add human processing delay
    const totalReactionTime = msAvailable +
        HUMAN_LIMITS.VISUAL_PROCESSING_MS +
        HUMAN_LIMITS.COGNITIVE_DECISION_MS;

    return {
        windowPixels,
        framesAvailable: Math.round(framesAvailable * 10) / 10,
        msAvailable: Math.round(msAvailable),
        totalReactionTime: Math.round(totalReactionTime),
        isHumanPlayable: totalReactionTime >= HUMAN_LIMITS.MIN_REACTION_TIME_MS,
        difficulty: getDifficultyPhase(score).name,
    };
}

// ============================================================================
// DIFFICULTY CURVE PREVIEW (for debugging)
// ============================================================================

/**
 * Generate a preview of the difficulty curve
 * Useful for testing and visualization
 * 
 * @param {number} maxScore - Maximum score to preview
 * @param {number} step - Score increment for preview
 * @returns {Array} Array of difficulty data points
 */
export function getDifficultyCurvePreview(maxScore = 200, step = 10) {
    const preview = [];

    for (let score = 0; score <= maxScore; score += step) {
        const speed = getSpeedForScore(score);
        const tolerance = getToleranceForScore(score);
        const phase = getDifficultyPhase(score);
        const analysis = getReactionWindowAnalysis(score);

        preview.push({
            score,
            speed: Math.round(speed * 100) / 100,
            tolerance: Math.round(tolerance * 10) / 10,
            phase: phase.name,
            reactionTimeMs: analysis.totalReactionTime,
            humanPlayable: analysis.isHumanPlayable,
        });
    }

    return preview;
}
