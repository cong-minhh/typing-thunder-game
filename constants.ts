// Fix: Import Difficulty from the now-correct types.ts file.
import { Difficulty, GameSettings } from './types';

export const LEVEL_UP_SCORE = 100;

export const WORD_FALL_SPEED_INCREASE = 0.1;
export const WORD_SPAWN_RATE_DECREASE = 100; // in ms

export const DIFFICULTY_PRESETS: Record<Difficulty, GameSettings> = {
    Easy: {
        startingLives: 5,
        fallSpeedStart: 0.4,
        spawnRateStart: 2000,
    },
    Medium: {
        startingLives: 3,
        fallSpeedStart: 0.6,
        spawnRateStart: 1600,
    },
    Hard: {
        startingLives: 2,
        fallSpeedStart: 0.8,
        spawnRateStart: 1200,
    }
};

export const CUSTOM_SETTINGS_RANGES = {
    lives: { min: 1, max: 10, step: 1 },
    fallSpeed: { min: 0.2, max: 2.0, step: 0.1 },
    spawnRate: { min: 500, max: 3000, step: 100 },
};

export const POWERUP_THRESHOLDS = {
    // Fix: Adjusted power-up thresholds to be more challenging and balanced.
    slowTime: 5,
    clearWords: 8,
    shield: 7,
    scoreMultiplier: 10,
};

export const POWERUP_DURATIONS = {
    // Fix: Increased duration of slow time for a more impactful power-up.
    slowTime: 5000, // 5 seconds
    scoreMultiplier: 8000, // 8 seconds
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

// Wave and Boss constants
export const WORDS_PER_LEVEL_UNTIL_WAVE = 15;
export const WAVE_WARNING_DURATION_MS = 2000;

export const WAVE_ACCELERATE_DURATION_MS = 5000; // 5 seconds of acceleration
export const WAVE_ACCELERATE_SPAWN_RATE_MS = 1000; // Slower spawn rate
export const WAVE_ACCELERATE_START_SPEED_MULTIPLIER = 1.2;
export const WAVE_ACCELERATE_END_SPEED_MULTIPLIER = 2.5;

export const WAVE_DELUGE_SPAWN_RATE_MS = 250; // Very fast spawning
export const WAVE_DELUGE_SPEED_MULTIPLIER = 0.6; // Slower words
export const WAVE_DELUGE_WORD_COUNT = 15; // Number of words in the deluge

export const BOSS_HEALTH_BASE = 5;
export const BOSS_HEALTH_PER_LEVEL = 2;
export const BOSS_TIMER_DURATION_MS = 20000;
export const BOSS_WORDS_BASE = 5;
export const BOSS_WORDS_PER_LEVEL = 1;
export const BOSS_SLOW_SPAWN_RATE_MS = 3000;

// Leaderboard and Grading
export const LEADERBOARD_MAX_SIZE = 10;
export const GRADE_THRESHOLDS = {
    S: 400, // A high bar for exceptional play
    A: 300,
    B: 200,
    C: 120,
    D: 50,
    F: 0,
};
