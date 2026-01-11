/**
 * Difficulty Manager Service
 * 
 * Centralized service for managing game difficulty progression.
 * Provides real-time difficulty calculations and state management.
 */

import {
    getSpeedForScore,
    getToleranceForScore,
    getDifficultyPhase,
    isMechanicActive,
    shouldSpawnDoublePulse,
    getPulseStartRadius,
    shouldSpawnGhostPulse,
    getReactionWindowAnalysis,
    DIFFICULTY_PARAMS,
    DIFFICULTY_PHASES,
} from '../utils/difficultyConfig';

class DifficultyManager {
    constructor() {
        this.currentScore = 0;
        this.currentPhase = null;
        this.phaseChangeCallbacks = [];
    }

    /**
     * Update current score and check for phase changes
     */
    updateScore(score) {
        const previousPhase = this.currentPhase;
        this.currentScore = score;
        this.currentPhase = getDifficultyPhase(score);

        // Notify listeners if phase changed
        if (previousPhase && previousPhase.id !== this.currentPhase.id) {
            this.notifyPhaseChange(previousPhase, this.currentPhase);
        }
    }

    /**
     * Register callback for phase changes
     */
    onPhaseChange(callback) {
        this.phaseChangeCallbacks.push(callback);
    }

    /**
     * Notify all listeners of phase change
     */
    notifyPhaseChange(oldPhase, newPhase) {
        this.phaseChangeCallbacks.forEach(callback => {
            try {
                callback(oldPhase, newPhase);
            } catch (error) {
                console.error('Error in phase change callback:', error);
            }
        });
    }

    /**
     * Get current pulse speed
     */
    getCurrentSpeed() {
        return getSpeedForScore(this.currentScore);
    }

    /**
     * Get current tolerance (timing window)
     */
    getCurrentTolerance() {
        return getToleranceForScore(this.currentScore);
    }

    /**
     * Get current difficulty phase
     */
    getCurrentPhase() {
        return this.currentPhase || getDifficultyPhase(0);
    }

    /**
     * Check if specific mechanic is active
     */
    isActive(mechanic) {
        return isMechanicActive(mechanic, this.currentScore);
    }

    /**
     * Determine pulse configuration for next pulse
     */
    getNextPulseConfig() {
        return {
            speed: this.getCurrentSpeed(),
            tolerance: this.getCurrentTolerance(),
            startRadius: getPulseStartRadius(this.currentScore),
            isDouble: shouldSpawnDoublePulse(this.currentScore),
            isGhost: shouldSpawnGhostPulse(this.currentScore),
        };
    }

    /**
     * Get reaction window analysis for current difficulty
     */
    getReactionAnalysis() {
        return getReactionWindowAnalysis(this.currentScore);
    }

    /**
     * Get difficulty statistics for display
     */
    getDifficultyStats() {
        const phase = this.getCurrentPhase();
        const analysis = this.getReactionAnalysis();

        return {
            score: this.currentScore,
            phase: phase.name,
            phaseIcon: phase.icon,
            phaseColor: phase.color,
            speed: this.getCurrentSpeed(),
            tolerance: this.getCurrentTolerance(),
            reactionTimeMs: analysis.totalReactionTime,
            isHumanPlayable: analysis.isHumanPlayable,
            activeFeatures: phase.features,
        };
    }

    /**
     * Reset difficulty manager state
     */
    reset() {
        this.currentScore = 0;
        this.currentPhase = getDifficultyPhase(0);
    }

    /**
     * Static helper: Get speed for specific score (stateless)
     */
    static getSpeedForScore(score) {
        return getSpeedForScore(score);
    }

    /**
     * Static helper: Get tolerance for specific score (stateless)
     */
    static getToleranceForScore(score) {
        return getToleranceForScore(score);
    }

    /**
     * Static helper: Get phase for specific score (stateless)
     */
    static getPhaseForScore(score) {
        return getDifficultyPhase(score);
    }

    /**
     * Static helper: Get all difficulty phases
     */
    static getAllPhases() {
        return DIFFICULTY_PHASES;
    }

    /**
     * Static helper: Get difficulty parameters
     */
    static getParameters() {
        return DIFFICULTY_PARAMS;
    }
}

// Export singleton instance
const difficultyManager = new DifficultyManager();
export default difficultyManager;

// Also export class for testing or multiple instances
export { DifficultyManager };
