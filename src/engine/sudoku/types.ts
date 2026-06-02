export type CellValue = number | null;
export type Board = CellValue[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Position {
  row: number;
  col: number;
}

export interface CellNotes {
  [key: string]: number[];
}

export interface GameState {
  board: Board;
  initialBoard: Board;
  solvedBoard: Board;
  notes: CellNotes;
  selectedCell: Position | null;
  difficulty: Difficulty;
  mistakes: number;
  hintsUsed: number;
  startedAt: number | null;
  elapsedMs: number;
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  isDaily: boolean;
}

export interface GeneratedPuzzle {
  initialBoard: Board;
  solvedBoard: Board;
}

export interface GameRecord {
  id: string;
  difficulty: Difficulty;
  startedAt: number;
  completedAt: number | null;
  durationMs: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  completed: boolean;
}

export const BLANK = null;
export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;
export const MAX_MISTAKES = 3;

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getTargetHoles(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 30;
    case 'medium':
      return 40;
    case 'hard':
      return 50;
    case 'expert':
      return 55;
  }
}
