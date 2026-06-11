import { View, Text, ScrollView } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Icon } from '../../components/ui';
import { StatCard } from '../../components/ui/StatCard';
import { HomeSkeleton } from '../../components/ui/Skeleton';

definePageConfig({
  navigationBarTitleText: 'BrainTrain',
});

export default function HomePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalGames: 0, currentStreak: 0, totalScore: 0 });

  useEffect(() => {
    // Load stats from storage
    const saved = Taro.getStorageSync('gameRecords') || [];
    const completed = saved.filter((g: any) => g.completed);
    setStats({
      totalGames: saved.length,
      currentStreak: Taro.getStorageSync('currentStreak') || 0,
      totalScore: completed.reduce((sum: number, g: any) => sum + (g.score || 0), 0),
    });
    setLoading(false);
  }, []);

  if (loading) return <HomeSkeleton />;

  const handleDailyChallenge = () => {
    Taro.navigateTo({ url: '/pages/games/sudoku/index?difficulty=medium&daily=true' });
  };

  const handleQuickPlay = () => {
    Taro.navigateTo({ url: '/pages/games/sudoku/index' });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      scrollY
      enableFlex
    >
      <View style={{ padding: '40px 32px 120px' }}>
        {/* Welcome */}
        <Text style={{ fontSize: '44px', fontWeight: '700', color: '#1A1A2E', lineHeight: 1.3 }}>
          {t('home.title', '脑力训练')}
        </Text>
        <Text style={{ fontSize: '28px', color: '#64748B', marginTop: 8, marginBottom: 40 }}>
          今天也来挑战一下大脑吧
        </Text>

        {/* Daily Challenge Card */}
        <View
          style={{
            backgroundColor: '#229CF8',
            borderRadius: 20,
            padding: '36px 32px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={handleDailyChallenge}
        >
          <View style={{
            position: 'absolute',
            right: -30, top: -30,
            width: 160, height: 160,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
          }} />
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name='calendar' size={22} color='#FFFFFF' />
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 500, marginLeft: 8 }}>
              {t('home.dailyChallenge', '每日挑战')}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 700, marginBottom: 6 }}>
            {t('home.dailyDescription', '今日数独 · 中等难度')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 24 }}>
            完成可获得双倍积分
          </Text>
          {stats.currentStreak > 0 && (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <Icon name='zap' size={16} color='#FDE68A' />
              <Text style={{ color: '#FDE68A', fontSize: 24, fontWeight: 600, marginLeft: 6 }}>
                已连续 {stats.currentStreak} 天
              </Text>
            </View>
          )}
        </View>

        {/* Quick Play */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
          }}
          onClick={handleQuickPlay}
        >
          <View style={{
            width: 80, height: 80, borderRadius: 14,
            backgroundColor: '#E8F4FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 24,
          }}>
            <Icon name='play' size={32} color='#229CF8' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 30, fontWeight: 600, color: '#1A1A2E' }}>
              {t('home.quickPlay', '快速开始')}
            </Text>
            <Text style={{ fontSize: 24, color: '#64748B', marginTop: 4 }}>
              选择游戏，即刻训练
            </Text>
          </View>
          <Icon name='chevron-right' size={20} color='#94A3B8' />
        </View>

        {/* Stats Row */}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <StatCard value={stats.totalGames} label={t('home.games', '对局')} />
          <StatCard value={stats.currentStreak} label={t('home.streak', '连胜')} color='#F59E0B' />
          <StatCard value={stats.totalScore.toLocaleString()} label={t('home.totalScore', '总分')} />
        </View>
      </View>
    </ScrollView>
  );
}
