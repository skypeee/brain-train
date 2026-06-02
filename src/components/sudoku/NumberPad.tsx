import { View, Text, TouchableOpacity } from 'react-native';
import { useMemo, memo } from 'react';
import { Delete } from 'lucide-react-native';
import { Board, BOARD_SIZE, BLANK } from '../../engine/sudoku/types';

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

  return (
    <View>
      <View className="flex-row justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((num) => {
          const left = remaining.get(num) || 0;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onNumberPress(num)}
              activeOpacity={0.5}
              accessibilityLabel={`Number ${num}, ${left} remaining`}
              accessibilityRole="button"
              className={`flex-1 items-center justify-center rounded-xl py-3 ${
                left === 0
                  ? 'bg-gray-50 dark:bg-gray-800/30'
                  : isNoteMode
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-xl font-semibold ${
                  left === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                }`}
              >
                {num}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">{left}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="flex-row justify-center gap-1.5">
        {[6, 7, 8, 9].map((num) => {
          const left = remaining.get(num) || 0;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onNumberPress(num)}
              activeOpacity={0.5}
              accessibilityLabel={`Number ${num}, ${left} remaining`}
              accessibilityRole="button"
              className={`flex-1 items-center justify-center rounded-xl py-3 ${
                left === 0
                  ? 'bg-gray-50 dark:bg-gray-800/30'
                  : isNoteMode
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-xl font-semibold ${
                  left === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                }`}
              >
                {num}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">{left}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.5}
          accessibilityLabel="Delete cell"
          accessibilityRole="button"
          className="flex-1 items-center justify-center rounded-xl py-3 bg-gray-100 dark:bg-gray-800"
        >
          <Delete stroke="#9CA3AF" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
});
