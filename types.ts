

// Fix: Removed self-import of GameStatus which was causing a declaration conflict.
export enum GameStatus {
    Start,
    Settings,
    Help,
    Playing,
    Paused,
    GameOver,
    Leaderboard,
}

export enum LevelPhase {
    Normal,
    WaveWarning,
    WaveAccelerate,
    WaveDeluge,
    Boss,
    LevelTransition,
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type PowerUpType = 'slow-time' | 'clear-words' | 'shield' | 'score-multiplier' | 'unify' | 'frenzy';

export interface GameSettings {
    startingLives: number;
    fallSpeedStart: number;
    spawnRateStart: number;
    hardcoreMode: boolean;
}

export interface Word {
    id: number;
    text: string;
    x: number;
    y: number;
    status: 'falling' | 'destroyed';
    powerUp?: PowerUpType;
    isWaveWord?: boolean;
    isTransformed?: boolean;
    vx?: number;
    vy?: number;
    bounces?: number;
}

export interface FloatingScore {
    id: number;
    base: number;
    bonus: number;
    timingBonus?: number;
    timingLabel?: { text: string; colorClass: string };
    timingMultiplier?: number;
    scoreMultiplier?: number;
    x: number;
    y: number;
}

export interface ActivePowerUp {
    type: PowerUpType;
    expiration: number;
}

export interface BossState {
    words: string[];
    currentWordIndex: number;
    health: number;
    maxHealth: number;
    timer: number;
    maxTimer: number;
}

export interface GameStats {
    startTime: number;
    totalMistypes: number;
    totalCharsCompleted: number;
    totalWordsCleared: number;
    longestCombo: number;
    // For post-game calculation
    wpm: number;
    accuracy: number;
    grade: string;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    grade: string;
    level: number;
    wpm: number;
    accuracy: number;
    longestCombo: number;
    difficulty: Difficulty;
    timestamp: number;
}

export interface LightningStrikeInfo {
    id: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
}