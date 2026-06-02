import { create } from 'zustand';
import { GameState, Difficulty } from '../engine/sudoku/types';
import {
  createNewGameState,
  inputNumber as engineInputNumber,
  deleteCell as engineDeleteCell,
  useHint as engineUseHint,
} from '../engine/sudoku/game';
import { toggleNote } from '../engine/sudoku/notes';

interface GameStore extends GameState {
  isNoteMode: boolean;
  startNewGame: (difficulty: Difficulty, daily?: boolean) => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (num: number) => void;
  deleteCell: () => void;
  toggleNoteMode: () => void;
  toggleCellNote: (row: number, col: number, num: number) => void;
  useHint: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateElapsed: (ms: number) => void;
  loadGameState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createNewGameState('easy'),
  isNoteMode: false,

  startNewGame: (difficulty, daily) => {
    set({ ...createNewGameState(difficulty, daily), isNoteMode: false });
  },

  selectCell: (row, col) => {
    const { initialBoard, selectedCell } = get();
    // Don't allow selecting given cells for input
    if (initialBoard[row][col] !== null) return;
    // Toggle off if same cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      set({ selectedCell: null });
      return;
    }
    set({ selectedCell: { row, col } });
  },

  inputNumber: (num) => {
    const state = get();
    if (state.isNoteMode && state.selectedCell) {
      const { row, col } = state.selectedCell;
      const newNotes = toggleNote(state.notes, row, col, num);
      set({ notes: newNotes });
      return;
    }
    const updated = engineInputNumber(state, num);
    set({ ...updated });
  },

  deleteCell: () => {
    const updated = engineDeleteCell(get());
    set({ ...updated });
  },

  toggleNoteMode: () => {
    set((s) => ({ isNoteMode: !s.isNoteMode }));
  },

  toggleCellNote: (row, col, num) => {
    const newNotes = toggleNote(get().notes, row, col, num);
    set({ notes: newNotes });
  },

  useHint: () => {
    const updated = engineUseHint(get());
    set({ ...updated });
  },

  pauseGame: () => {
    set({ status: 'paused' });
  },

  resumeGame: () => {
    set({ status: 'playing' });
  },

  updateElapsed: (ms) => {
    set({ elapsedMs: ms });
  },

  loadGameState: (state) => {
    set({ ...state, isNoteMode: false });
  },
}));
