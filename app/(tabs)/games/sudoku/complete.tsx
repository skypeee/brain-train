import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Trophy, Clock, Target, Share2 } from 'lucide-react-native';

export default function SudokuCompleteScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ time?: string; score?: string; mistakes?: string; difficulty?: string }>();

  const diffLabel = params.difficulty && (params.difficulty === 'easy' || params.difficulty === 'medium' || params.difficulty === 'hard' || params.difficulty === 'expert')
    ? t(`sudoku.${params.difficulty}`)
    : '';

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16 items-center">
      <View className="bg-brand-100 dark:bg-brand-900/30 rounded-full p-6 mb-6">
        <Trophy stroke="#229CF8" size={48} />
      </View>

      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t('sudoku.complete')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        {diffLabel}
      </Text>

      <View className="flex-row gap-4 mb-8">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 items-center flex-1">
          <Clock stroke="#229CF8" size={20} className="mb-2" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('sudoku.time')}</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{params.time || '00:00'}</Text>
        </View>
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 items-center flex-1">
          <Target stroke="#F59E0B" size={20} className="mb-2" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('sudoku.score')}</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{params.score || '0'}</Text>
        </View>
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 items-center flex-1">
          <Trophy stroke="#22C55E" size={20} className="mb-2" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('sudoku.mistakes')}</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{params.mistakes || '0'}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-brand-500 rounded-2xl p-4 w-full mb-3"
        onPress={() => router.back()}
      >
        <Text className="text-white text-center font-semibold text-lg">{t('sudoku.playAgain')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 w-full flex-row items-center justify-center gap-2"
        onPress={() => {}}
      >
        <Share2 stroke="#6B7280" size={18} />
        <Text className="text-gray-600 dark:text-gray-400 text-center font-semibold">{t('stats.score')}</Text>
      </TouchableOpacity>
    </View>
  );
}
