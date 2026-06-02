import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grid3X3, ChevronRight, Zap, Gauge, Clock, Sparkles, Palette, Brain, Timer, Wind, Sprout, Headphones } from 'lucide-react-native';

export default function GamesScreen() {
  const { t } = useTranslation();

  const GAMES = [
    {
      id: 'sudoku',
      name: t('games.sudokuName'),
      description: t('games.sudokuDesc'),
      icon: Grid3X3,
      available: true,
    },
    {
      id: 'cps',
      name: t('games.cpsName'),
      description: t('games.cpsDesc'),
      icon: Zap,
      available: true,
    },
    {
      id: 'reaction',
      name: t('games.reactionName'),
      description: t('games.reactionDesc'),
      icon: Gauge,
      available: true,
    },
    {
      id: 'tensecond',
      name: t('games.tensecName'),
      description: t('games.tensecDesc'),
      icon: Clock,
      available: true,
    },
    {
      id: 'sbti',
      name: t('games.sbtiName'),
      description: t('games.sbtiDesc'),
      icon: Sparkles,
      available: true,
    },
    {
      id: 'schulte',
      name: t('games.schulteName'),
      description: t('games.schulteDesc'),
      icon: Grid3X3,
      available: true,
    },
    {
      id: 'stroop',
      name: t('games.stroopName'),
      description: t('games.stroopDesc'),
      icon: Palette,
      available: true,
    },
    {
      id: 'memory',
      name: t('games.memoryName'),
      description: t('games.memoryDesc'),
      icon: Brain,
      available: true,
    },
    {
      id: 'pomodoro',
      name: t('games.pomodoroName'),
      description: t('games.pomodoroDesc'),
      icon: Timer,
      available: true,
    },
    {
      id: 'breathing',
      name: t('games.breathingName'),
      description: t('games.breathingDesc'),
      icon: Wind,
      available: true,
    },
    {
      id: 'frog',
      name: t('games.frogName'),
      description: t('games.frogDesc'),
      icon: Sprout,
      available: true,
    },
    {
      id: 'nback',
      name: t('games.nbackName'),
      description: t('games.nbackDesc'),
      icon: Headphones,
      available: true,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 }}>
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('games.title')}
      </Text>

      {GAMES.map((game) => (
        <Link key={game.id} href={`/(tabs)/games/${game.id}` as any} asChild>
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4 flex-row items-center"
            disabled={!game.available}
          >
            <View className="bg-brand-100 dark:bg-brand-900 rounded-xl p-3 mr-4">
              <game.icon stroke="#229CF8" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {game.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {game.description}
              </Text>
            </View>
            <ChevronRight stroke="#9CA3AF" size={20} />
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}
