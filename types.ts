// Fix: Define and export all necessary types for the application. This file previously contained constants and a circular dependency, causing widespread errors.
export enum GameStatus {
    Start,
    Playing,
    Paused,
    GameOver,
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type PowerUpType = 'slow-time' | 'clear-words';

export interface Word {
    id: number;
    text: string;
    x: number;
    y: number;
    status: 'falling' | 'destroyed';
    powerUp?: PowerUpType;
}

export interface FloatingScore {
    id: number;
    base: number;
    bonus: number;
    timingBonus?: number;
    timingLabel?: { text: string; colorClass: string };
    timingMultiplier?: number;
    x: number;
    y: number;
}

export interface ActivePowerUp {
    type: PowerUpType;
    expiration: number;
}
