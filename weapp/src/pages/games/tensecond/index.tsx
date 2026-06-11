import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { TARGET_MS, getDifferenceMs, getResult } from '../../../engine/tensecond';

definePageConfig({
  navigationBarTitleText: '十秒挑战',
  navigationStyle: 'custom',
  disableScroll: true,
});

export default function TenSecondPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'stopped' | 'results'>('menu');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [diffMs, setDiffMs] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const startRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (screen !== 'playing') return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 16);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [screen]);

  const startGame = useCallback(() => {
    setScreen('playing'); setElapsedMs(0); setDiffMs(null); setIsSaved(false);
    startedAtRef.current = Date.now();
    Taro.vibrateShort({ type: 'light' });
  }, []);

  const handleStop = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedMs(elapsed);
    const diff = getDifferenceMs(elapsed);
    setDiffMs(diff);
    setScreen('stopped');
    Taro.vibrateShort({ type: diff <= 100 ? 'heavy' : 'heavy' });
  }, []);

  // Save
  useEffect(() => {
    if (screen !== 'results' || isSaved || diffMs === null) return;
    setIsSaved(true);
    const score = Math.max(0, Math.round(10000 - diffMs * 10));
    const record = {
      id: `tensec_${Date.now()}`, gameType: 'tensecond', difficulty: 'normal',
      startedAt: startedAtRef.current, completedAt: Date.now(), durationMs: elapsedMs,
      mistakes: 0, hintsUsed: 0, score, completed: true, isDaily: false,
      details: JSON.stringify({ elapsedMs, diffMs, targetMs: TARGET_MS }),
    };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved, diffMs]);

  const displaySeconds = (elapsedMs / 1000).toFixed(3);
  const accuracy = diffMs !== null ? (100 - (diffMs / TARGET_MS) * 100).toFixed(1) : '0';

  // === MENU ===
  if (screen === 'menu') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
        <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Icon name='clock' size={36} color='#D97706' />
          </View>
          <Text style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('tensec.title', '十秒挑战')}</Text>
          <Text style={{ fontSize: 26, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>
            {t('tensec.description', '凭直觉估算10秒，停止计时器，越接近越好')}
          </Text>
          <View onClick={startGame} style={{ backgroundColor: '#D97706', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('tensec.start', '开始挑战')}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // === PLAYING ===
  if (screen === 'playing') {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, color: '#94A3B8', marginBottom: 32 }}>{t('tensec.tapAtTen', '感觉到了10秒就点停止')}</Text>
        <Text style={{ fontSize: 120, fontWeight: 700, color: '#1A1A2E', fontFamily: 'monospace', marginBottom: 64, letterSpacing: 0 }}>
          {displaySeconds}
        </Text>
        <View onClick={handleStop} style={{
          width: 160, height: 160, borderRadius: '50%',
          backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(239,68,68,0.3)',
        }}>
          <Text style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF' }}>{t('tensec.stop', '停止')}</Text>
        </View>
      </View>
    );
  }

  // === STOPPED ===
  if (screen === 'stopped' && diffMs !== null) {
    const result = getResult(diffMs);
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 100, fontWeight: 700, fontFamily: 'monospace', marginBottom: 8, color: result.color }}>{displaySeconds}</Text>
        <Text style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: result.color }}>
          {t(`tensec.${result.rating}`, result.rating === 'perfect' ? '完美!' : result.rating === 'excellent' ? '优秀!' : result.rating === 'great' ? '不错!' : result.rating === 'good' ? '还行' : '继续加油')}
        </Text>
        <Text style={{ fontSize: 26, color: '#64748B', marginBottom: 48 }}>
          {t('tensec.diff', `偏差 ${(diffMs / 1000).toFixed(3)} 秒`, { diff: (diffMs / 1000).toFixed(3) })}
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16, paddingHorizontal: 32 }}>
          <View onClick={startGame} style={{ flex: 1, backgroundColor: '#D97706', borderRadius: 16, padding: '20px 0', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF' }}>{t('tensec.tryAgain', '再来一次')}</Text>
          </View>
          <View onClick={() => setScreen('results')} style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 16, padding: '20px 0', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 600, color: '#475569' }}>{t('tensec.details', '详情')}</Text>
          </View>
        </View>
      </View>
    );
  }

  // === RESULTS ===
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <Text style={{ fontSize: 100, fontWeight: 700, fontFamily: 'monospace', color: '#D97706', marginBottom: 8 }}>{displaySeconds}</Text>
        <Text style={{ fontSize: 26, color: '#64748B', marginBottom: 48 }}>
          {diffMs !== null ? `偏差 ${(diffMs / 1000).toFixed(3)} 秒` : ''}
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 40, width: '100%' }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '20px 16px', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 22, color: '#64748B', marginBottom: 4 }}>{t('tensec.yourTime', '你的时间')}</Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2E', fontFamily: 'monospace' }}>{displaySeconds}s</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '20px 16px', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 22, color: '#64748B', marginBottom: 4 }}>{t('tensec.accuracy', '准确度')}</Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#D97706' }}>{accuracy}%</Text>
          </View>
        </View>
        <View onClick={startGame} style={{ backgroundColor: '#D97706', borderRadius: 16, padding: '24px 0', alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('tensec.tryAgain', '再来一次')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
