import { generatePuzzle } from './generator';
import { Board, cloneBoard, GameState, MAX_MISTAKES, BLANK, BOARD_SIZE } from './types';
import { isValid } from './validator';
import { createEmptyNotes, clearAutoNotes } from './notes';

export function createNewGameState(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  daily?: boolean
): GameState {
  const { initialBoard, solvedBoard } = generatePuzzle(difficulty);

  return {
    board: cloneBoard(initialBoard),
    initialBoard: cloneBoard(initialBoard),
    solvedBoard: cloneBoard(solvedBoard),
    notes: {},
    selectedCell: null,
    difficulty,
    mistakes: 0,
    hintsUsed: 0,
    startedAt: null,
    elapsedMs: 0,
    status: 'idle',
    isDaily: daily ?? false,
  };
}

export function inputNumber(state: GameState, num: number): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  if (!state.selectedCell) return state;

  const { row, col } = state.selectedCell;
  if (state.initialBoard[row][col] !== BLANK) return state;

  const updated: GameState = { ...state, status: state.status === 'idle' ? 'playing' : state.status };
  if (updated.startedAt === null) {
    updated.startedAt = Date.now();
  }

  updated.board = updated.board.map((r) => [...r]);
  updated.board[row][col] = num;

  // Auto-clear notes for this number in the same row/col/box
  updated.notes = clearAutoNotes(updated.notes, state.board, row, col, num);

  // Check if number matches solution
  if (updated.solvedBoard[row][col] !== num) {
    updated.mistakes++;
    if (updated.mistakes >= MAX_MISTAKES) {
      updated.status = 'lost';
    }
  }

  // Check win condition
  if (isBoardFilledCorrectly(updated.board, updated.solvedBoard)) {
    updated.status = 'won';
  }

  return updated;
}

export function deleteCell(state: GameState): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  if (!state.selectedCell) return state;

  const { row, col } = state.selectedCell;
  if (state.initialBoard[row][col] !== BLANK) return state;

  const updated = { ...state };
  updated.board = updated.board.map((r) => [...r]);
  updated.board[row][col] = BLANK;
  return updated;
}

export function toggleNoteMode(state: GameState, row: number, col: number, num: number): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  if (state.initialBoard[row][col] !== BLANK) return state;

  const key = `${row},${col}`;
  const updated: GameState = { ...state, notes: { ...state.notes } };
  const cellNotes = [...(updated.notes[key] || [])];

  const idx = cellNotes.indexOf(num);
  if (idx === -1) {
    cellNotes.push(num);
    cellNotes.sort();
  } else {
    cellNotes.splice(idx, 1);
  }

  if (cellNotes.length === 0) {
    delete updated.notes[key];
  } else {
    updated.notes[key] = cellNotes;
  }

  return updated;
}

export function useHint(state: GameState): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  if (!state.selectedCell) return state;

  const { row, col } = state.selectedCell;
  if (state.initialBoard[row][col] !== BLANK) return state;

  const correctNum = state.solvedBoard[row][col]!;

  const updated: GameState = { ...state, hintsUsed: state.hintsUsed + 1 };
  updated.board = updated.board.map((r) => [...r]);
  updated.board[row][col] = correctNum;

  delete updated.notes[`${row},${col}`];

  if (isBoardFilledCorrectly(updated.board, updated.solvedBoard)) {
    updated.status = 'won';
  }

  return updated;
}

function isBoardFilledCorrectly(board: Board, solvedBoard: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== solvedBoard[r][c]) return false;
    }
  }
  return true;
}
