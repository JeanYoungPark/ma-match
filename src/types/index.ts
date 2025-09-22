export type TileType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | null;

export interface Tile {
  id: string;
  row: number;
  col: number;
  type: TileType;
  isMatched: boolean;
  isSelected: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type GameState = 'IDLE' | 'SWAPPING' | 'MATCHING' | 'FALLING' | 'GAME_OVER';

export interface GameStats {
  score: number;
  moves: number;
  combo: number;
}