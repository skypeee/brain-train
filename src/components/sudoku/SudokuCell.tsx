import { TouchableOpacity, View, Text } from 'react-native';
import { useMemo, memo } from 'react';

interface SudokuCellProps {
  row: number;
  col: number;
  value: number | null;
  isGiven: boolean;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  isError: boolean;
  notes: number[];
  onPress: (row: number, col: number) => void;
  cellSize: number;
}

export const SudokuCell = memo(function SudokuCell({
  row,
  col,
  value,
  isGiven,
  isSelected,
  isRelated,
  isSameNumber,
  isError,
  notes,
  onPress,
  cellSize,
}: SudokuCellProps) {
  const bgColor = useMemo(() => {
    if (isSelected) return 'bg-brand-300/30';
    if (isError) return 'bg-red-100 dark:bg-red-900/30';
    if (isSameNumber && value !== null) return 'bg-brand-100 dark:bg-brand-900/20';
    if (isRelated) return 'bg-gray-50 dark:bg-gray-800/50';
    return 'bg-white dark:bg-gray-900';
  }, [isSelected, isError, isSameNumber, isRelated, value]);

  const textColor = useMemo(() => {
    if (isError) return 'text-red-500';
    if (isGiven) return 'text-gray-900 dark:text-white font-bold';
    return 'text-brand-500 dark:text-brand-400 font-semibold';
  }, [isError, isGiven]);

  const borderRight = col % 3 === 2 && col !== 8 ? 'border-r-2 border-r-sudoku-border-strong' : 'border-r border-r-sudoku-border';
  const borderBottom = row % 3 === 2 && row !== 8 ? 'border-b-2 border-b-sudoku-border-strong' : 'border-b border-b-sudoku-border';
  const borderLeft = col === 0 ? 'border-l-2 border-l-gray-800 dark:border-l-gray-300' : '';
  const borderTop = row === 0 ? 'border-t-2 border-t-gray-800 dark:border-t-gray-300' : '';

  return (
    <TouchableOpacity
      onPress={() => onPress(row, col)}
      activeOpacity={0.6}
      className={`${bgColor} ${borderRight} ${borderBottom} ${borderLeft} ${borderTop} items-center justify-center`}
      style={{ width: cellSize, height: cellSize }}
      accessibilityLabel={`Row ${row + 1} column ${col + 1}${value ? `, value ${value}` : isGiven ? ', given' : ', empty'}${isSelected ? ', selected' : ''}`}
      accessibilityRole="button"
    >
      {value !== null ? (
        <Text
          className={`${textColor}`}
          style={{ fontSize: cellSize * 0.42 }}
          allowFontScaling={false}
        >
          {value}
        </Text>
      ) : notes.length > 0 ? (
        <View className="w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const show = notes.includes(n);
            const nr = Math.floor((n - 1) / 3);
            const nc = (n - 1) % 3;
            return (
              <Text
                key={n}
                className="absolute text-gray-400 dark:text-gray-500"
                style={{
                  fontSize: cellSize * 0.22,
                  left: nc * (cellSize / 3) + cellSize * 0.04,
                  top: nr * (cellSize / 3) + cellSize * 0.01,
                  opacity: show ? 1 : 0,
                }}
              >
                {n}
              </Text>
            );
          })}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}, (prev, next) => {
  return (
    prev.row === next.row &&
    prev.col === next.col &&
    prev.value === next.value &&
    prev.isGiven === next.isGiven &&
    prev.isSelected === next.isSelected &&
    prev.isRelated === next.isRelated &&
    prev.isSameNumber === next.isSameNumber &&
    prev.isError === next.isError &&
    prev.notes.length === next.notes.length &&
    prev.notes.every((n, i) => n === next.notes[i]) &&
    prev.cellSize === next.cellSize
  );
});
