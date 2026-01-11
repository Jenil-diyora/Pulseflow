/**
 * Difficulty System Test Suite
 * 
 * Run this file with: node testDifficultySystem.js
 * 
 * This test validates that the difficulty progression:
 * 1. Never exceeds human reaction limits
 * 2. Follows logarithmic speed curve with proper cap
 * 3. Reduces tolerance appropriately
 * 4. Provides fair gameplay at all score levels
 */

// Import difficulty functions
const {
    getSpeedForScore,
    getToleranceForScore,
    getDifficultyPhase,
    getReactionWindowAnalysis,
    getDifficultyCurvePreview,
    DIFFICULTY_PARAMS,
    HUMAN_LIMITS,
} = require('./src/utils/difficultyConfig');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  PULSE TAP - DIFFICULTY PROGRESSION TEST SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ============================================================================
// TEST 1: Speed Cap Verification
// ============================================================================
console.log('TEST 1: Speed Never Exceeds Biological Cap');
console.log('─'.repeat(60));

let speedTestPassed = true;
const testScores = [0, 10, 20, 30, 40, 50, 75, 100, 150, 200, 500, 1000];

console.log(`Max allowed speed: ${DIFFICULTY_PARAMS.MAX_SPEED} px/frame\n`);

for (const score of testScores) {
    const speed = getSpeedForScore(score);
    const passed = speed <= DIFFICULTY_PARAMS.MAX_SPEED;
    const symbol = passed ? '✓' : '✗';
    const status = passed ? 'PASS' : 'FAIL';

    console.log(`  ${symbol} Score ${String(score).padEnd(4)}: ${speed.toFixed(2)} px/frame - ${status}`);

    if (!passed) speedTestPassed = false;
}

console.log(`\nResult: ${speedTestPassed ? '✓ PASSED' : '✗ FAILED'}\n\n`);

// ============================================================================
// TEST 2: Tolerance Floor Verification
// ============================================================================
console.log('TEST 2: Tolerance Never Below Minimum');
console.log('─'.repeat(60));

let toleranceTestPassed = true;

console.log(`Min allowed tolerance: ${DIFFICULTY_PARAMS.MIN_TOLERANCE} pixels\n`);

for (const score of testScores) {
    const tolerance = getToleranceForScore(score);
    const passed = tolerance >= DIFFICULTY_PARAMS.MIN_TOLERANCE;
    const symbol = passed ? '✓' : '✗';
    const status = passed ? 'PASS' : 'FAIL';

    console.log(`  ${symbol} Score ${String(score).padEnd(4)}: ${tolerance.toFixed(1)} pixels - ${status}`);

    if (!passed) toleranceTestPassed = false;
}

console.log(`\nResult: ${toleranceTestPassed ? '✓ PASSED' : '✗ FAILED'}\n\n`);

// ============================================================================
// TEST 3: Human Reaction Window Validation
// ============================================================================
console.log('TEST 3: Reaction Window Always Human-Playable');
console.log('─'.repeat(60));

let reactionTestPassed = true;

console.log(`Min human reaction time: ${HUMAN_LIMITS.MIN_REACTION_TIME_MS}ms`);
console.log(`Average reaction time: ${HUMAN_LIMITS.AVERAGE_REACTION_TIME_MS}ms\n`);

const criticalScores = [0, 35, 60, 90, 130, 180, 250, 500];

for (const score of criticalScores) {
    const analysis = getReactionWindowAnalysis(score);
    const passed = analysis.isHumanPlayable;
    const symbol = passed ? '✓' : '✗';
    const status = passed ? 'PASS' : 'FAIL';

    console.log(`  ${symbol} Score ${String(score).padEnd(4)}: ${String(analysis.totalReactionTime).padEnd(4)}ms total | ${analysis.difficulty.padEnd(18)} - ${status}`);

    if (!passed) reactionTestPassed = false;
}

console.log(`\nResult: ${reactionTestPassed ? '✓ PASSED' : '✗ FAILED'}\n\n`);

// ============================================================================
// TEST 4: Difficulty Phase Transitions
// ============================================================================
console.log('TEST 4: Difficulty Phase Transitions');
console.log('─'.repeat(60));

const phaseTransitionScores = [0, 15, 16, 35, 36, 60, 61, 90, 91, 130, 131, 180, 181];

for (const score of phaseTransitionScores) {
    const phase = getDifficultyPhase(score);
    const speed = getSpeedForScore(score);
    const tolerance = getToleranceForScore(score);

    console.log(`  Score ${String(score).padEnd(4)}: ${phase.icon} ${phase.name.padEnd(18)} | Speed: ${speed.toFixed(2)} | Tolerance: ${tolerance.toFixed(1)}px`);
}

console.log('\n\n');

// ============================================================================
// TEST 5: Logarithmic Speed Curve Visualization
// ============================================================================
console.log('TEST 5: Speed Curve Progression (Logarithmic Approach)');
console.log('─'.repeat(60));

console.log('\nScore | Speed   | % of Max | Visual Curve');
console.log('─'.repeat(60));

for (let score = 0; score <= 100; score += 10) {
    const speed = getSpeedForScore(score);
    const percentOfMax = (speed / DIFFICULTY_PARAMS.MAX_SPEED) * 100;
    const barLength = Math.round(percentOfMax / 2);
    const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);

    console.log(`${String(score).padStart(5)} | ${speed.toFixed(2)} | ${String(percentOfMax.toFixed(0) + '%').padStart(6)} | ${bar}`);
}

console.log('\n\n');

// ============================================================================
// TEST 6: Tolerance Reduction Curve
// ============================================================================
console.log('TEST 6: Tolerance Reduction Curve');
console.log('─'.repeat(60));

console.log('\nScore | Tolerance | Visual');
console.log('─'.repeat(60));

for (let score = 0; score <= 200; score += 20) {
    const tolerance = getToleranceForScore(score);
    const percentOfInitial = (tolerance / DIFFICULTY_PARAMS.INITIAL_TOLERANCE) * 100;
    const barLength = Math.round(percentOfInitial / 2);
    const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);

    console.log(`${String(score).padStart(5)} | ${String(tolerance.toFixed(1) + 'px').padStart(9)} | ${bar}`);
}

console.log('\n\n');

// ============================================================================
// TEST 7: Complete Difficulty Curve Preview
// ============================================================================
console.log('TEST 7: Complete Difficulty Curve (0-200 scores)');
console.log('─'.repeat(100));

const preview = getDifficultyCurvePreview(200, 20);

console.log('\nScore | Speed    | Tolerance | Phase              | Reaction | Human-Playable');
console.log('─'.repeat(100));

preview.forEach(point => {
    const playable = point.humanPlayable ? '✓ Yes' : '✗ NO';
    console.log(
        `${String(point.score).padStart(5)} | ` +
        `${String(point.speed).padEnd(8)} | ` +
        `${String(point.tolerance + 'px').padEnd(9)} | ` +
        `${point.phase.padEnd(18)} | ` +
        `${String(point.reactionTimeMs + 'ms').padEnd(8)} | ` +
        `${playable}`
    );
});

console.log('\n\n');

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  FINAL TEST SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const allTestsPassed = speedTestPassed && toleranceTestPassed && reactionTestPassed;

console.log(`  Speed Cap Test:        ${speedTestPassed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`  Tolerance Floor Test:  ${toleranceTestPassed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`  Reaction Window Test:  ${reactionTestPassed ? '✓ PASSED' : '✗ FAILED'}`);
console.log(`\n  Overall: ${allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}\n`);

if (allTestsPassed) {
    console.log('  🎉 The difficulty system respects human biological limits!');
    console.log('  🎯 The game will remain challenging but fair at all levels.');
    console.log('  ⚡ Players can now master the game through skill, not just speed.\n');
} else {
    console.log('  ⚠️  WARNING: Difficulty system has issues that need attention.\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Exit with appropriate code
process.exit(allTestsPassed ? 0 : 1);
