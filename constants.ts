// Fix: Import Difficulty from the now-correct types.ts file.
import { Difficulty } from './types';

export const INITIAL_LIVES = 3;
export const LEVEL_UP_SCORE = 100;

export const WORD_FALL_SPEED_INCREASE = 0.1;
export const WORD_SPAWN_RATE_DECREASE = 100; // in ms

export const DIFFICULTY_SETTINGS: Record<Difficulty, {
    WORD_FALL_SPEED_START: number;
    WORD_SPAWN_RATE_START: number;
    COMPLEXITY_START_LEVEL: number;
}> = {
    Easy: {
        WORD_FALL_SPEED_START: 0.4,
        WORD_SPAWN_RATE_START: 2000,
        COMPLEXITY_START_LEVEL: 1,
    },
    Medium: {
        WORD_FALL_SPEED_START: 0.6,
        WORD_SPAWN_RATE_START: 1600,
        COMPLEXITY_START_LEVEL: 3,
    },
    Hard: {
        WORD_FALL_SPEED_START: 0.8,
        WORD_SPAWN_RATE_START: 1200,
        COMPLEXITY_START_LEVEL: 5,
    }
};

export const POWERUP_THRESHOLDS = {
    // Fix: Adjusted power-up thresholds to be more challenging and balanced.
    slowTime: 5,
    clearWords: 8,
};

export const POWERUP_DURATIONS = {
    // Fix: Increased duration of slow time for a more impactful power-up.
    slowTime: 5000, // 5 seconds
};

// Fix: Replaced outdated timing constants with the ones used by the application logic (e.g., TIMING_WINDOW_MS).
export const TIMING_WINDOW_MS = 3000;
export const MAX_TIMING_BONUS_MULTIPLIER = 2.0; // The total score can be multiplied by up to this amount

export const TIMING_TIERS = [
    { threshold: 750, label: 'UNREAL', colorClass: 'text-fuchsia-400' },
    { threshold: 1500, label: 'PERFECT', colorClass: 'text-violet-400' },
    { threshold: 2250, label: 'GREAT', colorClass: 'text-amber-400' },
    { threshold: 3000, label: 'GOOD', colorClass: 'text-cyan-400' },
];
