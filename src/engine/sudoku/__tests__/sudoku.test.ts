import { describe, it, expect } from '@jest/globals';
import {
  generateSolvedBoard,
  generatePuzzle,
  solveSudoku,
  countSolutions,
} from '../generator';
import {
  isValid,
  getCandidates,
  getConflicts,
  getAllConflicts,
  isBoardComplete,
  isBoardSolved,
} from '../validator';
import { Board, BLANK, BOARD_SIZE, cloneBoard } from '../types';
import { createNewGameState, inputNumber, deleteCell, toggleNoteMode } from '../game';
import { calculateScore } from '../scoring';

describe('Sudoku Engine', () => {
  describe('generateSolvedBoard', () => {
    it('generates a fully filled 9x9 board', () => {
      const board = generateSolvedBoard();
      expect(board.length).toBe(BOARD_SIZE);
      for (const row of board) {
        expect(row.length).toBe(BOARD_SIZE);
        for (const cell of row) {
          expect(cell).not.toBeNull();
          expect(cell).toBeGreaterThanOrEqual(1);
          expect(cell).toBeLessThanOrEqual(9);
        }
      }
    });

    it('generates a valid solved board', () => {
      const board = generateSolvedBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const num = board[r][c]!;
          const backup = board[r][c];
          board[r][c] = BLANK;
          expect(isValid(board, r, c, num)).toBe(true);
          board[r][c] = backup;
        }
      }
    });
  });

  describe('generatePuzzle', () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert'] as const;

    difficulties.forEach((difficulty) => {
      it(`generates a puzzle with unique solution for ${difficulty}`, () => {
        const { initialBoard, solvedBoard } = generatePuzzle(difficulty);
        expect(initialBoard.length).toBe(BOARD_SIZE);
        expect(solvedBoard.length).toBe(BOARD_SIZE);

        // Check unique solution
        const count = countSolutions(initialBoard, 2);
        expect(count).toBe(1);

        // Verify solved board matches
        const clone = cloneBoard(initialBoard);
        const solved = solveSudoku(clone);
        expect(solved).toBe(true);
        expect(clone).toEqual(solvedBoard);
      });
    });

    it('returns appropriate number of holes per difficulty', () => {
      const expectedHoles = { easy: 30, medium: 40, hard: 50, expert: 55 };
      for (const [difficulty, expected] of Object.entries(expectedHoles) as [string, number][]) {
        const { initialBoard } = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert');
        let holes = 0;
        for (const row of initialBoard) {
          for (const cell of row) {
            if (cell === BLANK) holes++;
          }
        }
        // Allow some variance (±5)
        expect(holes).toBeGreaterThanOrEqual(expected - 5);
        expect(holes).toBeLessThanOrEqual(expected + 5);
      }
    });
  });

  describe('solveSudoku', () => {
    it('solves a generated puzzle', () => {
      const { initialBoard } = generatePuzzle('medium');
      const clone = cloneBoard(initialBoard);
      const result = solveSudoku(clone);
      expect(result).toBe(true);
      expect(isBoardComplete(clone)).toBe(true);
      expect(isBoardSolved(clone)).toBe(true);
      expect(getAllConflicts(clone).size).toBe(0);
    });

    it('returns false for unsolvable board', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      // Fill top-left 3x3 box with 1-8, leaving (0,0) empty and needing 9
      board[0][1] = 1;
      board[0][2] = 2;
      board[1][0] = 3;
      board[1][1] = 4;
      board[1][2] = 5;
      board[2][0] = 6;
      board[2][1] = 7;
      board[2][2] = 8;
      // Place 9 in same row as (0,0), making (0,0) impossible to fill
      board[0][3] = 9;
      const result = solveSudoku(board);
      expect(result).toBe(false);
    });
  });

  describe('countSolutions', () => {
    it('returns 1 for a unique puzzle', () => {
      const { initialBoard } = generatePuzzle('easy');
      expect(countSolutions(initialBoard, 2)).toBe(1);
    });

    it('returns 2 (or more) for an empty board', () => {
      const emptyBoard: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      const count = countSolutions(emptyBoard, 3);
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('isValid', () => {
    it('returns true for valid placement', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      expect(isValid(board, 0, 0, 5)).toBe(true);
    });

    it('returns false for duplicate in row', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      board[0][1] = 5;
      expect(isValid(board, 0, 0, 5)).toBe(false);
    });

    it('returns false for duplicate in column', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      board[1][0] = 5;
      expect(isValid(board, 0, 0, 5)).toBe(false);
    });

    it('returns false for duplicate in box', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      board[1][1] = 5;
      expect(isValid(board, 0, 0, 5)).toBe(false);
    });
  });

  describe('getCandidates', () => {
    it('returns all 1-9 for empty board cell', () => {
      const board: Board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(BLANK)
      );
      const candidates = getCandidates(board, 0, 0);
      expect(candidates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('getAllConflicts', () => {
    it('returns empty set for valid board', () => {
      const board = generateSolvedBoard();
      expect(getAllConflicts(board).size).toBe(0);
    });

    it('detects row conflicts', () => {
      const board = cloneBoard(generateSolvedBoard());
      board[0][0] = board[0][1];
      const conflicts = getAllConflicts(board);
      expect(conflicts.size).toBeGreaterThan(0);
    });
  });

  describe('Game State', () => {
    it('creates new game state', () => {
      const state = createNewGameState('easy');
      expect(state.difficulty).toBe('easy');
      expect(state.status).toBe('idle');
      expect(state.mistakes).toBe(0);
      expect(state.hintsUsed).toBe(0);
      expect(state.selectedCell).toBeNull();
    });

    it('inputs number on selected cell', () => {
      const state = createNewGameState('easy');
      // Find an empty cell
      let emptyRow = -1;
      let emptyCol = -1;
      for (let r = 0; r < BOARD_SIZE && emptyRow === -1; r++) {
        for (let c = 0; c < BOARD_SIZE && emptyCol === -1; c++) {
          if (state.initialBoard[r][c] === BLANK) {
            emptyRow = r;
            emptyCol = c;
          }
        }
      }

      const correctNum = state.solvedBoard[emptyRow][emptyCol]!;
      const withSelection = { ...state, selectedCell: { row: emptyRow, col: emptyCol } };
      const afterInput = inputNumber(withSelection, correctNum);
      expect(afterInput.board[emptyRow][emptyCol]).toBe(state.solvedBoard[emptyRow][emptyCol]);
      expect(afterInput.status).toBe('playing');
    });

    it('counts mistakes for wrong input', () => {
      const state = createNewGameState('easy');
      let emptyRow = -1;
      let emptyCol = -1;
      for (let r = 0; r < BOARD_SIZE && emptyRow === -1; r++) {
        for (let c = 0; c < BOARD_SIZE && emptyCol === -1; c++) {
          if (state.initialBoard[r][c] === BLANK) {
            emptyRow = r;
            emptyCol = c;
          }
        }
      }

      const correctNum = state.solvedBoard[emptyRow][emptyCol]!;
      const wrongNum = correctNum === 1 ? 2 : 1;

      const withSelection = { ...state, selectedCell: { row: emptyRow, col: emptyCol } };
      const afterInput = inputNumber(withSelection, wrongNum);
      expect(afterInput.mistakes).toBe(1);
    });

    it('deletes cell', () => {
      const state = createNewGameState('easy');
      let emptyRow = -1;
      let emptyCol = -1;
      for (let r = 0; r < BOARD_SIZE && emptyRow === -1; r++) {
        for (let c = 0; c < BOARD_SIZE && emptyCol === -1; c++) {
          if (state.initialBoard[r][c] === BLANK) {
            emptyRow = r;
            emptyCol = c;
          }
        }
      }

      const correctNum2 = state.solvedBoard[emptyRow][emptyCol]!;
      const withSelection2 = { ...state, selectedCell: { row: emptyRow, col: emptyCol } };
      const withInput = inputNumber(withSelection2, correctNum2);
      const withDelete = deleteCell({ ...withInput, selectedCell: { row: emptyRow, col: emptyCol } });
      expect(withDelete.board[emptyRow][emptyCol]).toBe(BLANK);
    });
  });

  describe('Scoring', () => {
    it('calculates higher score for faster solves', () => {
      const fast = calculateScore('medium', 40, 60000, 0, 0, false);
      const slow = calculateScore('medium', 40, 120000, 0, 0, false);
      expect(fast.total).toBeGreaterThan(slow.total);
    });

    it('penalizes mistakes', () => {
      const clean = calculateScore('medium', 40, 60000, 0, 0, false);
      const withMistakes = calculateScore('medium', 40, 60000, 3, 0, false);
      expect(clean.total).toBeGreaterThan(withMistakes.total);
    });

    it('adds daily bonus', () => {
      const normal = calculateScore('medium', 40, 60000, 0, 0, false);
      const daily = calculateScore('medium', 40, 60000, 0, 0, true);
      expect(daily.total).toBeGreaterThan(normal.total);
    });
  });
});
