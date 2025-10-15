export type PowerUpType = 'slow-time' | 'bomb' | 'clear-words';

export interface Word {
  id: number;
  text: string;
  x: number;
  y: number;
  status: 'falling' | 'destroyed';
  powerUp?: PowerUpType;
}

export enum GameStatus {
  Start,
  Playing,
  Paused,
  GameOver,
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface FloatingScore {
  id: number;
  base: number;
  bonus: number;
  x: number;

  y: number;
}

export interface ActivePowerUp {
    type: PowerUpType;
    expiration: number;
}