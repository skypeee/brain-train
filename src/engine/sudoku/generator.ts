import { Board, BLANK, BOARD_SIZE, BOX_SIZE } from './types';
import { isValid } from './validator';

export function shuffleNumbers(numbers: number[]): number[] {
  const arr = [...numbers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function findBestEmptyCell(
  board: Board,
  randomizeCandidates?: boolean
): { row: number; col: number; candidates: number[] } | null {
  let best: { row: number; col: number; candidates: number[] } | null = null;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== BLANK) continue;

      const candidates: number[] = [];
      for (let num = 1; num <= BOARD_SIZE; num++) {
        if (isValid(board, r, c, num)) {
          candidates.push(num);
        }
      }

      if (candidates.length === 0) {
        return { row: r, col: c, candidates: [] };
      }
      if (candidates.length === 1) {
        return { row: r, col: c, candidates };
      }

      if (!best || candidates.length < best.candidates.length) {
        best = { row: r, col: c, candidates };
      }
    }
  }

  if (best && randomizeCandidates) {
    best.candidates = shuffleNumbers(best.candidates);
  }
  return best;
}

export function solveSudoku(board: Board, randomizeCandidates?: boolean): boolean {
  const cell = findBestEmptyCell(board, randomizeCandidates);
  if (!cell) return true;
  if (cell.candidates.length === 0) return false;

  for (const num of cell.candidates) {
    board[cell.row][cell.col] = num;
    if (solveSudoku(board, randomizeCandidates)) return true;
    board[cell.row][cell.col] = BLANK;
  }

  return false;
}

export function countSolutions(board: Board, limit = 2): number {
  let count = 0;

  function solve(b: Board): boolean {
    if (count >= limit) return true;

    const cell = findBestEmptyCell(b, false);
    if (!cell) {
      count++;
      return count >= limit;
    }
    if (cell.candidates.length === 0) return false;

    for (const num of cell.candidates) {
      b[cell.row][cell.col] = num;
      if (solve(b)) {
        b[cell.row][cell.col] = BLANK;
        return true;
      }
      b[cell.row][cell.col] = BLANK;
    }

    return false;
  }

  const boardCopy = board.map((row) => [...row]);
  solve(boardCopy);
  return count;
}

function fillBox(board: Board, startRow: number, startCol: number): void {
  const nums = shuffleNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      board[r][c] = nums[idx++];
    }
  }
}

export function generateSolvedBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(BLANK)
  );

  fillBox(board, 0, 0);
  fillBox(board, 3, 3);
  fillBox(board, 6, 6);

  const boardCopy = board.map((row) => [...row]);
  solveSudoku(boardCopy, true);

  return boardCopy;
}

export function generatePuzzle(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): {
  initialBoard: Board;
  solvedBoard: Board;
} {
  const holesMap = { easy: 30, medium: 40, hard: 50, expert: 55 };
  const targetHoles = holesMap[difficulty];
  const maxAttempts = 6;

  let bestPuzzle: Board | null = null;
  let bestSolutions: Board | null = null;
  let bestHoles = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solved = generateSolvedBoard();
    const puzzle = solved.map((row) => [...row]);

    const indices: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        indices.push({ row: r, col: c });
      }
    }

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let holes = 0;

    for (const { row, col } of indices) {
      const backup = puzzle[row][col];
      puzzle[row][col] = BLANK;

      if (countSolutions(puzzle, 2) === 1) {
        holes++;
        if (holes >= targetHoles) {
          return { initialBoard: puzzle, solvedBoard: solved };
        }
      } else {
        puzzle[row][col] = backup;
      }
    }

    if (holes > bestHoles) {
      bestHoles = holes;
      bestPuzzle = puzzle.map((row) => [...row]);
      bestSolutions = solved.map((row) => [...row]);
    }
  }

  if (bestPuzzle && bestSolutions) {
    return { initialBoard: bestPuzzle, solvedBoard: bestSolutions };
  }

  throw new Error('Failed to generate a unique Sudoku puzzle.');
}
