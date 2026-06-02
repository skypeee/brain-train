import { View, useWindowDimensions } from 'react-native';
import { useMemo, useCallback, memo } from 'react';
import { SudokuCell } from './SudokuCell';
import { Board, BLANK, BOARD_SIZE } from '../../engine/sudoku/types';
import { getAllConflicts, getRelatedCells } from '../../engine/sudoku/validator';

interface SudokuBoardProps {
  board: Board;
  initialBoard: Board;
  solvedBoard: Board;
  selectedCell: { row: number; col: number } | null;
  notes: Record<string, number[]>;
  onCellPress: (row: number, col: number) => void;
  validationMode?: 'none' | 'conflicts' | 'auto-check';
}

export const SudokuBoard = memo(function SudokuBoard({
  board,
  initialBoard,
  solvedBoard,
  selectedCell,
  notes,
  onCellPress,
  validationMode = 'auto-check',
}: SudokuBoardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const boardPadding = 16;
  const maxBoardSize = 400;
  const boardSize = Math.min(screenWidth - boardPadding * 2, maxBoardSize);
  const cellSize = boardSize / BOARD_SIZE;

  const errorCells = useMemo(() => {
    const errors = new Set<string>();
    if (validationMode === 'none') return errors;

    if (validationMode === 'auto-check') {
      // Compare each player-entered cell against the solution
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (initialBoard[r][c] !== BLANK) continue; // Skip given cells
          if (board[r][c] !== BLANK && board[r][c] !== solvedBoard[r][c]) {
            errors.add(`${r},${c}`);
          }
        }
      }
    }

    if (validationMode === 'conflicts') {
      getAllConflicts(board).forEach((k) => errors.add(k));
    }

    return errors;
  }, [board, initialBoard, solvedBoard, validationMode]);

  const selectedRelated = useMemo(() => {
    if (!selectedCell) return new Set<string>();
    return new Set(
      getRelatedCells(selectedCell.row, selectedCell.col).map((p) => `${p.row},${p.col}`)
    );
  }, [selectedCell]);

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : null;

  const isSameNumber = useCallback(
    (row: number, col: number) => {
      if (!selectedCell || selectedValue === BLANK) return false;
      return board[row][col] === selectedValue;
    },
    [board, selectedCell, selectedValue]
  );

  return (
    <View
      className="border-2 border-gray-800 dark:border-gray-300 bg-white dark:bg-gray-900"
      style={{ width: boardSize + 4, height: boardSize + 4 }}
    >
      {Array.from({ length: BOARD_SIZE }, (_, row) => (
        <View key={row} className="flex-row">
          {Array.from({ length: BOARD_SIZE }, (_, col) => (
            <SudokuCell
              key={`${row}-${col}`}
              row={row}
              col={col}
              value={board[row][col]}
              isGiven={initialBoard[row][col] !== BLANK}
              isSelected={selectedCell?.row === row && selectedCell?.col === col}
              isRelated={selectedRelated.has(`${row},${col}`)}
              isSameNumber={isSameNumber(row, col)}
              isError={errorCells.has(`${row},${col}`)}
              notes={notes[`${row},${col}`] || []}
              onPress={onCellPress}
              cellSize={cellSize}
            />
          ))}
        </View>
      ))}
    </View>
  );
});
