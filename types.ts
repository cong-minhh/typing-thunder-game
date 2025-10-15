export interface Word {
  id: number;
  text: string;
  x: number;
  y: number;
  status: 'falling' | 'destroyed';
}

export enum GameStatus {
  Start,
  Playing,
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

export interface TrailParticle {
  id: number;
  x: number;
  y: number;
  expiration: number;
}
