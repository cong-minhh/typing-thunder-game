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
    slowTime: 25,
    clearWords: 35,
    bomb: 50,
};

export const POWERUP_DURATIONS = {
    slowTime: 3000, // 3 seconds
};