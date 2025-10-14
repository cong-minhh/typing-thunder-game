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