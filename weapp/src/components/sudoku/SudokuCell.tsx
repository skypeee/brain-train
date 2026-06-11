import { View, Text } from '@tarojs/components';
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
  // Background color
  const bgColor = useMemo(() => {
    if (isSelected) return 'rgba(34,156,248,0.12)';
    if (isError) return 'rgba(239,68,68,0.08)';
    if (isSameNumber && value !== null) return 'rgba(34,156,248,0.06)';
    if (isRelated) return '#F8FAFC';
    return '#FFFFFF';
  }, [isSelected, isError, isSameNumber, isRelated, value]);

  const textColor = useMemo(() => {
    if (isError) return '#EF4444';
    if (isGiven) return '#1A1A2E';
    return '#229CF8';
  }, [isError, isGiven]);

  const fontWeight = isGiven ? '700' : '600';

  // 3x3 box borders
  const borderRight = col % 3 === 2 && col !== 8 ? '2px solid #334155' : '1px solid #E2E8F0';
  const borderBottom = row % 3 === 2 && row !== 8 ? '2px solid #334155' : '1px solid #E2E8F0';

  return (
    <View
      onClick={() => onPress(row, col)}
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: bgColor,
        borderRight,
        borderBottom,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {value !== null ? (
        <Text
          style={{
            fontSize: cellSize * 0.42,
            fontWeight,
            color: textColor,
            lineHeight: 1,
          }}
        >
          {value}
        </Text>
      ) : notes.length > 0 ? (
        <View style={{ width: '100%', height: '100%', position: 'relative', padding: '1px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const show = notes.includes(n);
            const nr = Math.floor((n - 1) / 3);
            const nc = (n - 1) % 3;
            return (
              <Text
                key={n}
                style={{
                  fontSize: cellSize * 0.24,
                  color: '#94A3B8',
                  position: 'absolute',
                  left: nc * (cellSize / 3) + cellSize * 0.04,
                  top: nr * (cellSize / 3) + cellSize * 0.01,
                  opacity: show ? 1 : 0,
                  lineHeight: 1,
                }}
              >
                {n}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}, (prev, next) => {
  return (
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
