export type SpecialType = 'row' | 'column' | 'bomb' | 'jelly' | 'rainbow';

export interface Candy {
  id: number;
  color: string;
  special?: SpecialType;
}

export type Board = (Candy | null)[][];

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export interface GameState {
  board: Board;
  score: number;
  level: number;
  movesLeft: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  gameState: GameState | null;
}
