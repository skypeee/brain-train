import { Board, CellNotes, BLANK, BOARD_SIZE, BOX_SIZE } from './types';

export function createEmptyNotes(): CellNotes {
  return {};
}

export function clearAutoNotes(
  notes: CellNotes,
  board: Board,
  targetRow: number,
  targetCol: number,
  num: number
): CellNotes {
  const newNotes = { ...notes };
  const boxRow = Math.floor(targetRow / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(targetCol / BOX_SIZE) * BOX_SIZE;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (!newNotes[key]) continue;

      const sameRow = r === targetRow;
      const sameCol = c === targetCol;
      const sameBox =
        r >= boxRow &&
        r < boxRow + BOX_SIZE &&
        c >= boxCol &&
        c < boxCol + BOX_SIZE;

      if (sameRow || sameCol || sameBox) {
        newNotes[key] = newNotes[key].filter((n) => n !== num);
        if (newNotes[key].length === 0) {
          delete newNotes[key];
        }
      }
    }
  }

  return newNotes;
}

export function toggleNote(notes: CellNotes, row: number, col: number, num: number): CellNotes {
  const key = `${row},${col}`;
  const newNotes = { ...notes };
  const cellNotes = [...(newNotes[key] || [])];

  const idx = cellNotes.indexOf(num);
  if (idx === -1) {
    cellNotes.push(num);
    cellNotes.sort();
  } else {
    cellNotes.splice(idx, 1);
  }

  if (cellNotes.length === 0) {
    delete newNotes[key];
  } else {
    newNotes[key] = cellNotes;
  }

  return newNotes;
}
