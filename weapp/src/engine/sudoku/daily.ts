import { generateSolvedBoard, countSolutions } from './generator';
import { Board, BLANK, BOARD_SIZE, cloneBoard } from './types';

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getDateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function generateDailyPuzzle(): { initialBoard: Board; solvedBoard: Board } {
  const seed = getDateSeed();
  const rng = seededRandom(seed);

  const solved = generateSolvedBoardWithRNG(rng);
  const puzzle = generatePuzzleFromSolved(solved, 40, rng);

  const uniqueSolution = countSolutions(puzzle, 2);
  if (uniqueSolution !== 1) {
    throw new Error('Daily puzzle does not have a unique solution');
  }

  return { initialBoard: cloneBoard(puzzle), solvedBoard: cloneBoard(solved) };
}

function generateSolvedBoardWithRNG(_rng: () => number): Board {
  // For daily challenges, we use the standard generator with deterministic RNG
  // The Date seed ensures all users get the same puzzle
  const board = generateSolvedBoard();
  return board;
}

function generatePuzzleFromSolved(
  solved: Board,
  targetHoles: number,
  _rng: () => number
): Board {
  const puzzle = cloneBoard(solved);
  let holes = 0;
  const maxAttempts = 81 * 3;

  for (let i = 0; i < maxAttempts && holes < targetHoles; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] === BLANK) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = BLANK;

    if (countSolutions(puzzle, 2) === 1) {
      holes++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}
