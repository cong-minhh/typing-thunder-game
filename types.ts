export enum GameStatus {
    Start,
    Settings,
    Help,
    Playing,
    Paused,
    GameOver,
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

export type PowerUpType = 'slow-time' | 'clear-words' | 'shield' | 'score-multiplier';

export interface GameSettings {
    startingLives: number;
    fallSpeedStart: number;
    spawnRateStart: number;
}

export interface Word {
    id: number;
    text: string;
    x: number;
    y: number;
    status: 'falling' | 'destroyed';
    powerUp?: PowerUpType;
    isWaveWord?: boolean;
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