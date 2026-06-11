import { View, Text } from '@tarojs/components';
import { useMemo, memo } from 'react';
import { Board, BOARD_SIZE, BLANK } from '../../engine/sudoku/types';
import { Icon } from '../ui';

interface NumberPadProps {
  board: Board;
  isNoteMode: boolean;
  onNumberPress: (num: number) => void;
  onDelete: () => void;
}

export const NumberPad = memo(function NumberPad({ board, isNoteMode, onNumberPress, onDelete }: NumberPadProps) {
  const remaining = useMemo(() => {
    const counts = new Map<number, number>();
    for (let n = 1; n <= 9; n++) counts.set(n, 9);
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const v = board[r][c];
        if (v !== BLANK) {
          counts.set(v, (counts.get(v) || 9) - 1);
        }
      }
    }
    return counts;
  }, [board]);

  const numBtnStyle = (left: number, num: number) => ({
    flex: 1,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '16px 8px',
    borderRadius: '14px',
    backgroundColor: left === 0 ? '#F8FAFC' : (isNoteMode ? '#E8F4FE' : '#F1F5F9'),
    border: isNoteMode && left > 0 ? '1px solid #229CF8' : 'none',
  });

  return (
    <View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((num) => {
          const left = remaining.get(num) || 0;
          return (
            <View key={num} style={numBtnStyle(left, num)} onClick={() => onNumberPress(num)}>
              <Text style={{
                fontSize: 36, fontWeight: '600',
                color: left === 0 ? '#CBD5E1' : '#1A1A2E',
              }}>
                {num}
              </Text>
              <Text style={{ fontSize: 18, color: '#94A3B8', marginTop: 2 }}>{left}</Text>
            </View>
          );
        })}
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        {[6, 7, 8, 9].map((num) => {
          const left = remaining.get(num) || 0;
          return (
            <View key={num} style={numBtnStyle(left, num)} onClick={() => onNumberPress(num)}>
              <Text style={{
                fontSize: 36, fontWeight: '600',
                color: left === 0 ? '#CBD5E1' : '#1A1A2E',
              }}>
                {num}
              </Text>
              <Text style={{ fontSize: 18, color: '#94A3B8', marginTop: 2 }}>{left}</Text>
            </View>
          );
        })}
        <View
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 8px',
            borderRadius: '14px',
            backgroundColor: '#F1F5F9',
          }}
          onClick={onDelete}
        >
          <Text style={{ fontSize: 28, color: '#94A3B8' }}>⌫</Text>
        </View>
      </View>
    </View>
  );
});
