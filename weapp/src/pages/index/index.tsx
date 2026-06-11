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
    <ScrollView style={{ flex: 1, backgroundColor: '#F2F4F7' }} scrollY enableFlex>
      <View style={{ padding: '48px 28px 120px' }}>

        {/* Hero */}
        <View style={{ marginBottom: 36 }}>
          <Text style={{ fontSize: 48, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {t('home.title', '脑力训练')}
          </Text>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={{ height: 4, width: 36, backgroundColor: '#229CF8', borderRadius: 2, marginRight: 12 }} />
            <Text style={{ fontSize: 26, color: '#64748B', fontWeight: 400 }}>
              今天也来挑战一下大脑吧
            </Text>
          </View>
        </View>

        {/* Daily Challenge */}
        <View
          onClick={handleDailyChallenge}
          style={{
            background: 'linear-gradient(135deg, #229CF8 0%, #1A7ACC 100%)',
            borderRadius: 22,
            padding: '32px 28px',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(34,156,248,0.25)',
          }}
        >
          <View style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <View style={{ position: 'absolute', right: 60, bottom: -30, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 12px' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 600, letterSpacing: '0.5px' }}>
                {t('home.dailyChallenge', '每日挑战')}
              </Text>
            </View>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
            {t('home.dailyDescription', '今日数独 · 中等难度')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 24, fontWeight: 400 }}>
            完成可获得双倍积分
          </Text>
          {stats.currentStreak > 0 && (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 14px', alignSelf: 'flex-start' }}>
              <Icon name='zap' size={16} color='#FDE68A' />
              <Text style={{ color: '#FDE68A', fontSize: 22, fontWeight: 600, marginLeft: 6 }}>
                已连续 {stats.currentStreak} 天
              </Text>
            </View>
          )}
        </View>

        {/* Quick Play */}
        <View
          onClick={handleQuickPlay}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: 18, padding: '24px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'row', alignItems: 'center',
            marginBottom: 24, border: '1px solid #F1F5F9',
          }}
        >
          <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
            <View style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name='play' size={28} color='#229CF8' />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              {t('home.quickPlay', '快速开始')}
            </Text>
            <Text style={{ fontSize: 24, color: '#64748B' }}>选择游戏，即刻训练</Text>
          </View>
          <View style={{ backgroundColor: '#F1F5F9', borderRadius: 20, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='chevron-right' size={18} color='#94A3B8' />
          </View>
        </View>

        {/* Stats Row */}
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8', marginBottom: 14, letterSpacing: '0.5px' }}>
          训练概览
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '22px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', alignItems: 'center', border: '1px solid #F1F5F9' }}>
            <Text style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>{stats.totalGames}</Text>
            <Text style={{ fontSize: 20, color: '#94A3B8', marginTop: 4 }}>{t('home.games', '对局')}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '22px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', alignItems: 'center', border: '1px solid #F1F5F9' }}>
            <Text style={{ fontSize: 36, fontWeight: 800, color: '#F59E0B', fontFamily: 'monospace' }}>{stats.currentStreak}</Text>
            <Text style={{ fontSize: 20, color: '#94A3B8', marginTop: 4 }}>{t('home.streak', '连胜')}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '22px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', alignItems: 'center', border: '1px solid #F1F5F9' }}>
            <Text style={{ fontSize: 30, fontWeight: 800, color: '#229CF8', fontFamily: 'monospace' }}>{stats.totalScore.toLocaleString()}</Text>
            <Text style={{ fontSize: 20, color: '#94A3B8', marginTop: 4 }}>{t('home.totalScore', '总分')}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
