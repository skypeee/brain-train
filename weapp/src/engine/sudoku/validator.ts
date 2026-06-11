import { Board, BLANK, BOARD_SIZE, BOX_SIZE, Position } from './types';

export function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

export function getCandidates(board: Board, row: number, col: number): number[] {
  const candidates: number[] = [];
  for (let num = 1; num <= BOARD_SIZE; num++) {
    if (isValid(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

export function getConflicts(board: Board, row: number, col: number): Position[] {
  const num = board[row][col];
  if (num === BLANK) return [];

  const conflicts: Position[] = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i !== col && board[row][i] === num) {
      conflicts.push({ row, col: i });
    }
    if (i !== row && board[i][col] === num) {
      conflicts.push({ row: i, col });
    }
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (r !== row && c !== col && board[r][c] === num) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return conflicts;
}

export function getAllConflicts(board: Board): Set<string> {
  const conflicts = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== BLANK) {
        const cellConflicts = getConflicts(board, r, c);
        if (cellConflicts.length > 0) {
          conflicts.add(`${r},${c}`);
          cellConflicts.forEach((p) => conflicts.add(`${p.row},${p.col}`));
        }
      }
    }
  }
  return conflicts;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === BLANK) return false;
    }
  }
  return true;
}

export function isBoardSolved(board: Board): boolean {
  if (!isBoardComplete(board)) return false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const num = board[r][c];
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i !== c && board[r][i] === num) return false;
        if (i !== r && board[i][c] === num) return false;
      }
    }
  }
  return true;
}

export function getRelatedCells(row: number, col: number): Position[] {
  const cells: Position[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i !== col) cells.push({ row, col: i });
    if (i !== row) cells.push({ row: i, col });
  }
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (r !== row && c !== col) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}
