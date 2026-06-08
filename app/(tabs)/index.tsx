import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Play, Calendar, Zap } from 'lucide-react-native';
import { useStats } from '../../src/hooks/useStats';
import { HomeSkeleton } from '../../src/components/ui/Skeleton';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { stats, loadStats } = useStats();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadStats().finally(() => setInitialLoading(false));
  }, []);

  if (initialLoading) return <HomeSkeleton />;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t('home.title')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        {t('home.subtitle')}
      </Text>

      {/* Daily Challenge */}
      <Link href="/(tabs)/games/sudoku/play?difficulty=medium&daily=true" asChild>
        <TouchableOpacity className="bg-brand-500 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-3">
            <Calendar stroke="white" size={24} />
            <Text className="text-white text-lg font-semibold">{t('home.dailyChallenge')}</Text>
          </View>
          <Text className="text-white/80">
            {t('home.dailyDescription')}
          </Text>
          {stats.currentStreak > 0 && (
            <View className="flex-row items-center gap-1 mt-3">
              <Zap stroke="#FCD34D" size={14} />
              <Text className="text-yellow-200 font-medium text-sm">
                {stats.currentStreak}{t('home.streakSuffix')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>

      {/* Quick Play */}
      <TouchableOpacity
        className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mb-6"
        onPress={() => router.push('/(tabs)/games/sudoku')}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <Play stroke="#229CF8" size={24} />
          <Text className="text-gray-900 dark:text-white text-lg font-semibold">
            {t('home.quickPlay')}
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400">
          {t('home.quickPlayDescription')}
        </Text>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-3">
          <Trophy stroke="#229CF8" size={24} />
          <Text className="text-gray-900 dark:text-white text-lg font-semibold">
            {t('home.yourProgress')}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalGames}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('home.games')}</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.currentStreak}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('home.streak')}</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
              {stats.totalScore.toLocaleString()}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('home.totalScore')}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
