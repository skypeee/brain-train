import { View, Text, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Zap, Brain, Flame, Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = 'sudoku_save';

export default function SudokuMenuScreen() {
  const { t } = useTranslation();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedDifficulty, setSavedDifficulty] = useState('');

  const DIFFICULTIES = [
    { id: 'easy', name: t('sudoku.easy'), icon: Zap, description: t('sudoku.easyDesc'), color: '#22C55E' },
    { id: 'medium', name: t('sudoku.medium'), icon: Brain, description: t('sudoku.mediumDesc'), color: '#F59E0B' },
    { id: 'hard', name: t('sudoku.hard'), icon: Flame, description: t('sudoku.hardDesc'), color: '#EF4444' },
    { id: 'expert', name: t('sudoku.expert'), icon: Timer, description: t('sudoku.expertDesc'), color: '#8B5CF6' },
  ] as const;

  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY).then((json) => {
      if (json) {
        try {
          const state = JSON.parse(json);
          setHasSavedGame(true);
          const d = state.difficulty || '';
          setSavedDifficulty(d.charAt(0).toUpperCase() + d.slice(1));
        } catch {}
      }
    });
  }, []);

  const handleContinue = () => {
    router.push('/(tabs)/games/sudoku/play');
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t('sudoku.title')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        {t('sudoku.chooseDifficulty')}
      </Text>

      {hasSavedGame && (
        <TouchableOpacity
          className="bg-brand-50 dark:bg-brand-900/30 rounded-2xl p-5 mb-8 border border-brand-200 dark:border-brand-800 flex-row items-center"
          onPress={handleContinue}
        >
          <View className="bg-brand-100 dark:bg-brand-800 rounded-xl p-2.5 mr-4">
            <Play stroke="#229CF8" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-brand-600 dark:text-brand-400 font-semibold text-lg mb-1">
              {t('sudoku.continueGame')}
            </Text>
            <Text className="text-brand-500 dark:text-brand-500 text-sm">
              {savedDifficulty} • {t('sudoku.continueDescription')}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <Text className="text-gray-500 dark:text-gray-400 font-medium mb-4 uppercase text-sm tracking-wider">
        {t('sudoku.newGame')}
      </Text>

      {DIFFICULTIES.map((d) => (
        <Link key={d.id} href={`/(tabs)/games/sudoku/play?difficulty=${d.id}`} asChild>
          <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-3 flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${d.color}15` }}
            >
              <d.icon stroke={d.color} size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {d.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {d.description}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  );
}
