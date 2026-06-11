import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { INTERVALS, getIntervalCPS, getTotalCPS } from '../../../engine/cps';

definePageConfig({
  navigationBarTitleText: 'CPS点击测试',
});

type ScreenState = 'menu' | 'countdown' | 'playing' | 'results';
type GamePhase = { label: string; cps: number };

export default function CPSTestPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [countdownNum, setCountdownNum] = useState(3);
  const [intervalIndex, setIntervalIndex] = useState(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [results, setResults] = useState<GamePhase[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const clicksRef = useRef(0);
  const intervalStartRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(0);
  const currentInterval = INTERVALS[intervalIndex];

  // Countdown
  useEffect(() => {
    if (screen !== 'countdown') return;
    if (countdownNum <= 0) { setScreen('playing'); return; }
    const t = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, countdownNum]);

  // Playing timer
  useEffect(() => {
    if (screen !== 'playing') return;
    intervalStartRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - intervalStartRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= currentInterval.ms) {
        // End this interval
        const intervalClicks = clicksRef.current;
        const newClicks = [...clicks, intervalClicks];
        setClicks(newClicks);
        setResults((r) => [...r, { label: currentInterval.label, cps: getIntervalCPS(intervalClicks, currentInterval.ms) }]);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (intervalIndex + 1 >= INTERVALS.length) {
          setScreen('results');
        } else {
          setScreen('countdown'); setCountdownNum(1);
          setIntervalIndex((i) => i + 1);
          clicksRef.current = 0; setCurrentClicks(0); setElapsedMs(0);
        }
      }
    }, 16);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [screen, intervalIndex]);

  // Save
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const totalMs = INTERVALS.reduce((s, iv) => s + iv.ms, 0);
    const record = {
      id: `cps_${Date.now()}`, gameType: 'cps', difficulty: 'normal',
      startedAt: startedRef.current, completedAt: Date.now(), durationMs: totalMs,
      mistakes: 0, hintsUsed: 0,
      score: Math.round(getTotalCPS(clicks) * 100),
      completed: true, isDaily: false,
      details: JSON.stringify({ clicks, intervals: results }),
    };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  const startGame = useCallback(() => {
    setScreen('countdown'); setCountdownNum(3); setIntervalIndex(0);
    setClicks([]); setCurrentClicks(0); setElapsedMs(0); setResults([]); setIsSaved(false);
    clicksRef.current = 0; startedRef.current = Date.now();
    Taro.vibrateShort({ type: 'light' });
  }, []);

  const handleTap = useCallback(() => {
    if (screen !== 'playing') return;
    clicksRef.current += 1; setCurrentClicks(clicksRef.current);
    Taro.vibrateShort({ type: 'light' });
  }, [screen]);

  const currentCPS = elapsedMs > 0 ? (currentClicks / (elapsedMs / 1000)) : 0;

  // === MENU ===
  if (screen === 'menu') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
        <View style={{ padding: '40px 32px 120px' }}>
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#E8F4FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon name='zap' size={36} color='#229CF8' />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('cps.title', 'CPS点击测试')}</Text>
            <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', lineHeight: 1.6 }}>{t('cps.description', '在限定时间内尽可能多地点击')}</Text>
          </View>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: '24px 28px', marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 16, color: '#64748B', marginBottom: 16 }}>{t('cps.intervals', '测试阶段')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              {INTERVALS.map((iv) => (
                <View key={iv.label} style={{ backgroundColor: '#F1F5F9', borderRadius: 12, padding: '12px 18px' }}>
                  <Text style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2E' }}>{iv.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View onClick={startGame} style={{ backgroundColor: '#229CF8', borderRadius: 16, padding: '24px 0', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>{t('cps.start', '开始测试')}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // === COUNTDOWN ===
  if (screen === 'countdown') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 160, fontWeight: 700, color: '#229CF8' }}>{countdownNum}</Text>
      </View>
    );
  }

  // === PLAYING ===
  if (screen === 'playing') {
    const progress = Math.min(elapsedMs / currentInterval.ms, 1);
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
          <View style={{ backgroundColor: '#E8F4FE', borderRadius: 10, padding: '8px 14px' }}>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#229CF8' }}>{currentInterval.label}</Text>
          </View>
          <Text style={{ fontSize: 18, fontFamily: 'monospace', color: '#64748B' }}>
            {Math.ceil((currentInterval.ms - elapsedMs) / 1000)}s
          </Text>
          <View style={{ backgroundColor: '#F1F5F9', borderRadius: 10, padding: '8px 14px' }}>
            <Text style={{ fontSize: 16, fontFamily: 'monospace', color: '#475569' }}>{currentCPS.toFixed(1)} CPS</Text>
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: '#E2E8F0', marginHorizontal: 24, borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ height: '100%', backgroundColor: '#229CF8', borderRadius: 2, width: `${progress * 100}%` }} />
        </View>
        <View
          onClick={handleTap}
          style={{
            flex: 1, margin: '24px 24px 16px', backgroundColor: '#F0F9FF',
            borderRadius: 24, border: '2px solid #BAE6FD',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 56, fontWeight: 700, color: '#229CF8', fontFamily: 'monospace' }}>{currentClicks}</Text>
          <Text style={{ fontSize: 18, color: '#94A3B8', marginTop: 12 }}>{t('cps.tapHere', '点击这里')}</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 10, paddingBottom: 24 }}>
          {INTERVALS.map((iv, i) => (
            <View key={iv.label} style={{
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: i < intervalIndex ? '#229CF8' : i === intervalIndex ? '#93C5FD' : '#E2E8F0',
            }} />
          ))}
        </View>
      </View>
    );
  }

  // === RESULTS ===
  const avgCPS = getTotalCPS(clicks);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px' }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 80, fontWeight: 700, color: '#229CF8', fontFamily: 'monospace' }}>{avgCPS.toFixed(1)}</Text>
          <Text style={{ fontSize: 18, color: '#64748B', marginTop: 8 }}>{t('cps.averageCPS', '平均CPS')}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8', marginBottom: 16 }}>{t('cps.breakdown', '分段统计')}</Text>
        {results.map((phase, i) => (
          <View key={phase.label} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: '20px 24px', marginBottom: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ backgroundColor: '#E8F4FE', borderRadius: 10, padding: '8px 14px' }}>
                <Text style={{ fontSize: 16, fontWeight: 600, color: '#229CF8' }}>{phase.label}</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#64748B' }}>{clicks[i]} 次</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', fontFamily: 'monospace' }}>{phase.cps.toFixed(1)}</Text>
          </View>
        ))}
        <View onClick={startGame} style={{ backgroundColor: '#229CF8', borderRadius: 16, padding: '24px 0', alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>{t('cps.tryAgain', '再来一次')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
