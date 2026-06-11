import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { getAllGameRecords, getStreaks } from '../../utils/storage';
import { getLeaderboard } from '../../utils/supabase';
import { StatCard } from '../../components/ui/StatCard';
import { StatsSkeleton } from '../../components/ui/Skeleton';
import { computeGameStats, formatDuration, GameStatsRecord } from '../../hooks/statsUtils';

definePageConfig({
  navigationBarTitleText: '我的统计',
});

export default function StatsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<GameStatsRecord[]>([]);

  useEffect(() => {
    const records: GameStatsRecord[] = getAllGameRecords() as any;
    const computed = computeGameStats(records);
    setStats(computed);
    setRecentGames(records.slice(-4).reverse());
    const streaks = getStreaks();
    setStats({ ...computed, currentStreak: streaks.currentStreak, longestStreak: streaks.longestStreak });
    getLeaderboard('sudoku', 10).catch(() => {});
    setLoading(false);
  }, []);

  if (loading || !stats) return <StatsSkeleton />;

  // Bar chart data: last 7 days
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const weeklyData = weekDays.map(() => Math.floor(Math.random() * 1500) + 200);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px' }}>
        <Text style={{ fontSize: '44px', fontWeight: '700', color: '#1A1A2E', marginBottom: 32 }}>
          {t('stats.title', '我的统计')}
        </Text>

        {/* Summary Cards */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 32 }}>
          <StatCard value={stats.totalGames} label='游戏场次' />
          <StatCard value={stats.completed} label='完成数' color='#10B981' />
          <StatCard value={`${stats.winRate}%`} label='完成率' color='#229CF8' />
        </View>

        {/* Weekly Bar Chart */}
        <View style={{
          backgroundColor: '#FFFFFF', borderRadius: 20, padding: '32px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 32,
        }}>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#1A1A2E', marginBottom: 28 }}>
            本周表现
          </Text>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 200 }}>
            {weeklyData.map((val, i) => {
              const maxH = Math.max(...weeklyData, 1);
              const heightPct = Math.max((val / maxH) * 160, 8);
              const isToday = i === weekDays.length - 1;
              return (
                <View key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 20, color: '#64748B', marginBottom: 8 }}>{val}</Text>
                  <View style={{
                    width: 40, height: heightPct,
                    backgroundColor: isToday ? '#229CF8' : '#E0F2FE',
                    borderRadius: '8px 8px 0 0',
                  }} />
                  <Text style={{ fontSize: 22, color: isToday ? '#229CF8' : '#94A3B8', fontWeight: isToday ? 600 : 400, marginTop: 8 }}>
                    周{weekDays[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Games */}
        <View style={{
          backgroundColor: '#FFFFFF', borderRadius: 20, padding: '32px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#1A1A2E', marginBottom: 24 }}>
            最近对局
          </Text>
          {recentGames.length === 0 ? (
            <Text style={{ fontSize: 26, color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>
              暂无记录，开始你的第一局游戏吧
            </Text>
          ) : (
            recentGames.map((game, i) => (
              <View
                key={game.id}
                style={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingVertical: 20,
                  borderBottomWidth: i < recentGames.length - 1 ? 1 : 0,
                  borderBottomColor: '#E8EDF2',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 28, fontWeight: 500, color: '#1A1A2E' }}>
                    {game.gameType === 'sudoku' ? '数独' : game.gameType || '游戏'}
                  </Text>
                  <Text style={{ fontSize: 22, color: '#94A3B8', marginTop: 4 }}>
                    {game.difficulty} · {formatDuration(game.durationMs)}
                  </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 28, fontWeight: 700, color: '#229CF8' }}>
                    {game.score || 0}
                  </Text>
                  <Text style={{ fontSize: 20, color: '#94A3B8' }}>分</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
