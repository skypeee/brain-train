import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Trophy, Clock, Target } from 'lucide-react-native';
import { calculateScore } from '../../engine/sudoku/scoring';
import { GameState, getTargetHoles } from '../../engine/sudoku/types';

interface GameCompleteModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

export function GameCompleteModal({ gameState, onPlayAgain }: GameCompleteModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isWon = gameState.status === 'won';
  const emptyCells = getTargetHoles(gameState.difficulty);
  const score = calculateScore(
    gameState.difficulty,
    emptyCells,
    gameState.elapsedMs,
    gameState.mistakes,
    gameState.hintsUsed,
    gameState.isDaily
  );

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50 px-6">
      <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm">
        <View className="items-center mb-6">
          <View className={`rounded-full p-5 mb-4 ${isWon ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <Trophy stroke={isWon ? '#229CF8' : '#EF4444'} size={40} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {isWon ? t('sudoku.complete') : t('sudoku.gameOver')}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {t(`sudoku.${gameState.difficulty}`)}
          </Text>
        </View>

        {isWon && (
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 items-center">
              <Clock stroke="#229CF8" size={18} />
              <Text className="text-xs text-gray-500 mt-1">{t('sudoku.time')}</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {formatTime(gameState.elapsedMs)}
              </Text>
            </View>
            <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 items-center">
              <Target stroke="#F59E0B" size={18} />
              <Text className="text-xs text-gray-500 mt-1">{t('sudoku.score')}</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {score.total}
              </Text>
            </View>
            <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 items-center">
              <Trophy stroke="#22C55E" size={18} />
              <Text className="text-xs text-gray-500 mt-1">{t('sudoku.mistakes')}</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {gameState.mistakes}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-brand-500 rounded-2xl p-4 mb-3"
          onPress={onPlayAgain}
          accessibilityLabel="Play again"
          accessibilityRole="button"
        >
          <Text className="text-white text-center font-semibold text-lg">{t('sudoku.playAgain')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4"
          onPress={() => router.back()}
          accessibilityLabel="Back to menu"
          accessibilityRole="button"
        >
          <Text className="text-gray-600 dark:text-gray-400 text-center font-semibold">
            {t('sudoku.backToMenu')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
