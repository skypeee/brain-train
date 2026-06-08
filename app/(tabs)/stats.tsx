import { Pressable, View, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Trophy, Clock, Target, TrendingUp, Zap, Globe } from 'lucide-react-native';
import { useStats } from '../../src/hooks/useStats';
import { StatsSkeleton } from '../../src/components/ui/Skeleton';
import { formatDuration } from '../../src/hooks/statsUtils';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { stats, leaderboard, loading, loadStats, loadLeaderboard } = useStats();
  const [tab, setTab] = useState<'stats' | 'leaderboard'>('stats');
  const [selectedGameType, setSelectedGameType] = useState('sudoku');
  const gameTypes = Object.keys(stats.gamesByType || {});
  const visibleGameTypes = gameTypes.length > 0 ? gameTypes : ['sudoku'];
  const selectedTypeStats = stats.byGameType[selectedGameType];

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadLeaderboard(selectedGameType);
  }, [selectedGameType, loadLeaderboard]);

  useEffect(() => {
    if (gameTypes.length > 0 && !gameTypes.includes(selectedGameType)) {
      setSelectedGameType(gameTypes[0]);
    }
  }, [gameTypes, selectedGameType]);

  if (loading) return <StatsSkeleton />;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t('stats.title')}
      </Text>

      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        <Pressable
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: tab === 'stats' ? '#FFFFFF' : 'transparent',
          }}
          onPress={() => setTab('stats')}
        >
          <Text className={`font-medium ${tab === 'stats' ? 'text-brand-500' : 'text-gray-500'}`}>
            {t('stats.stats')}
          </Text>
        </Pressable>
        <Pressable
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: tab === 'leaderboard' ? '#FFFFFF' : 'transparent',
          }}
          onPress={() => setTab('leaderboard')}
        >
          <Text className={`font-medium ${tab === 'leaderboard' ? 'text-brand-500' : 'text-gray-500'}`}>
            {t('stats.leaderboard')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ gap: 8 }}
      >
        {visibleGameTypes.map((type) => (
          <Pressable
            key={type}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: selectedGameType === type ? '#229CF8' : '#F3F4F6',
            }}
            onPress={() => setSelectedGameType(type)}
          >
            <Text
              className="font-medium"
              style={{ color: selectedGameType === type ? '#FFFFFF' : '#4B5563' }}
            >
              {t(`games.${type}Name`, { defaultValue: type })}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'stats' ? (
        stats.totalGames === 0 ? (
          <View key="stats-empty" className="items-center justify-center py-16">
            <BarChart3 stroke="#9CA3AF" size={64} />
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              {t('stats.noStats')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center px-8">
              {t('stats.noStatsDesc')}
            </Text>
          </View>
        ) : (
          <View key="stats-content">
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <Trophy stroke="#229CF8" size={24} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalGames}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('stats.games')}</Text>
              </View>
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <Target stroke="#22C55E" size={24} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.winRate}%
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('stats.winRate')}</Text>
              </View>
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <TrendingUp stroke="#F59E0B" size={24} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.currentStreak}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('stats.streak')}</Text>
              </View>
            </View>

            <View className="bg-brand-500 rounded-2xl p-5 mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white/70 text-sm mb-1">
                    {t('stats.selectedBestTime', {
                      game: t(`games.${selectedGameType}Name`, { defaultValue: selectedGameType }),
                    })}
                  </Text>
                  <Text className="text-white text-3xl font-bold font-mono">
                    {formatDuration(selectedTypeStats?.bestDurationMs)}
                  </Text>
                </View>
                <Clock stroke="white" size={32} strokeOpacity={0.5} />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('stats.selectedGames')}</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTypeStats?.completed || 0}
                </Text>
              </View>
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('stats.averageTime')}</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  {formatDuration(selectedTypeStats?.avgDurationMs)}
                </Text>
              </View>
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('stats.bestScore')}</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(selectedTypeStats?.bestScore || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-sm tracking-wider">
              {t('stats.gamesByType')}
            </Text>
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4">
              {Object.entries(stats.gamesByType || {}).map(([type, count]) => (
                <View key={type} className="flex-row items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <Text className="text-gray-900 dark:text-white font-medium capitalize">
                    {t(`games.${type}Name`, { defaultValue: type })}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 font-mono">
                    {count as number} {t('stats.games')}
                  </Text>
                </View>
              ))}
            </View>

            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4">
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Zap stroke="#F59E0B" size={20} />
                  <Text className="text-gray-900 dark:text-white font-medium">{t('stats.current')}</Text>
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">{stats.currentStreak} {t('stats.days')}</Text>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-row items-center gap-2">
                  <Trophy stroke="#F59E0B" size={20} />
                  <Text className="text-gray-900 dark:text-white font-medium">{t('stats.longest')}</Text>
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">{stats.longestStreak} {t('stats.days')}</Text>
              </View>
            </View>

            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-8 items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">{t('stats.totalScore')}</Text>
              <Text className="text-3xl font-bold text-brand-500">
                {stats.totalScore.toLocaleString()}
              </Text>
            </View>
          </View>
        )
      ) : (
        <View key="leaderboard-content">
          <View className="flex-row items-center gap-2 mb-4">
            <Globe stroke="#229CF8" size={18} />
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {t('stats.topScoresByType', {
                game: t(`games.${selectedGameType}Name`, { defaultValue: selectedGameType }),
              })}
            </Text>
          </View>

          {leaderboard.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Trophy stroke="#9CA3AF" size={48} />
              <Text className="text-gray-500 dark:text-gray-400 mt-4">
                {t('stats.emptyLeaderboard')}
              </Text>
            </View>
          ) : (
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-8">
              <View className="flex-row bg-gray-200 dark:bg-gray-700 px-4 py-2.5">
                <Text className="w-8 font-semibold text-gray-500 dark:text-gray-400 text-sm">#</Text>
                <Text className="flex-1 font-semibold text-gray-500 dark:text-gray-400 text-sm">{t('stats.game')}</Text>
                <Text className="flex-1 font-semibold text-gray-500 dark:text-gray-400 text-sm">{t('stats.score')}</Text>
                <Text className="flex-1 font-semibold text-gray-500 dark:text-gray-400 text-sm">{t('stats.time')}</Text>
              </View>
              {leaderboard.map((entry, idx) => {
                const dur = entry.durationMs || 0;
                const min = Math.floor(dur / 60000);
                const sec = String(Math.floor(((dur % 60000) / 1000))).padStart(2, '0');
                const score = entry.score ?? 0;
                return (
                  <View
                    key={entry.id || idx}
                    className={`flex-row px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${idx < 3 ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}
                  >
                    <Text className={`w-8 font-bold ${idx < 3 ? 'text-brand-500' : 'text-gray-500'}`}>
                      {idx + 1}
                    </Text>
                    <Text className="flex-1 text-gray-500 capitalize">
                      {t(`games.${entry.gameType || 'sudoku'}Name`, { defaultValue: entry.gameType || 'sudoku' })}
                    </Text>
                    <Text className="flex-1 font-semibold text-gray-900 dark:text-white">
                      {score.toLocaleString()}
                    </Text>
                    <Text className="flex-1 text-gray-500 font-mono">{min}:{sec}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
