import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { TOTAL_TRIALS, MIN_WAIT_MS, MAX_WAIT_MS, RTState, TrialResult } from '../../../engine/reaction';

definePageConfig({
  navigationBarTitleText: '反应速度',
  navigationStyle: 'custom',
  disableScroll: true,
});

export default function ReactionTestPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [rtState, setRTState] = useState<RTState>('waiting');
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [lastReaction, setLastReaction] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const goTimeRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(0);

  const scheduleTimeout = useCallback((cb: () => void, delay: number) => {
    const timeout = setTimeout(() => { timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeout); cb(); }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  const clearScheduled = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startTrial = useCallback(() => {
    clearScheduled();
    setRTState('waiting');
    const delay = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    scheduleTimeout(() => { goTimeRef.current = Date.now(); setRTState('go'); }, delay);
  }, [clearScheduled, scheduleTimeout]);

  const handleTap = useCallback(() => {
    if (rtState === 'go') {
      const reaction = Date.now() - goTimeRef.current;
      Taro.vibrateShort({ type: 'heavy' });
      setLastReaction(reaction);
      setTrials((prev) => [...prev, { reactionMs: reaction }]);
      setRTState('done');
      if (trialIndex + 1 >= TOTAL_TRIALS) {
        scheduleTimeout(() => { clearScheduled(); setScreen('results'); }, 600);
      } else {
        scheduleTimeout(() => { setTrialIndex((i) => i + 1); setLastReaction(null); scheduleTimeout(() => startTrial(), 500); }, 800);
      }
    } else if (rtState === 'waiting') {
      Taro.vibrateShort({ type: 'heavy' });
      setRTState('tooSoon');
      clearScheduled();
      scheduleTimeout(() => { setRTState('waiting'); startTrial(); }, 1500);
    }
  }, [rtState, trialIndex, startTrial, scheduleTimeout, clearScheduled]);

  const startGame = useCallback(() => {
    clearScheduled();
    setScreen('playing'); setTrialIndex(0); setTrials([]); setLastReaction(null); setIsSaved(false);
    startedRef.current = Date.now();
    scheduleTimeout(() => startTrial(), 800);
    Taro.vibrateShort({ type: 'light' });
  }, [startTrial, scheduleTimeout, clearScheduled]);

  useEffect(() => () => clearScheduled(), []);

  // Save
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const avgReaction = trials.length > 0 ? trials.reduce((a, b) => a + b.reactionMs, 0) / trials.length : 0;
    const score = Math.max(0, Math.round(10000 - avgReaction * 10));
    const record = {
      id: `reaction_${Date.now()}`, gameType: 'reaction', difficulty: 'normal',
      startedAt: startedRef.current, completedAt: Date.now(),
      durationMs: trials.reduce((a, b) => a + b.reactionMs, 0),
      mistakes: 0, hintsUsed: 0, score, completed: true, isDaily: false,
      details: JSON.stringify({ trials, avgReaction }),
    };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  // === MENU ===
  if (screen === 'menu') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
        <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Icon name='zap' size={36} color='#7C3AED' />
          </View>
          <Text style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('reaction.title', '反应速度')}</Text>
          <Text style={{ fontSize: 26, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>
            {t('reaction.description', '看到绿色时立即点击，测试你的反应速度')}
          </Text>
          <View onClick={startGame} style={{ backgroundColor: '#7C3AED', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('reaction.start', '开始测试')}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // === PLAYING ===
  if (screen === 'playing') {
    const bgColor = rtState === 'waiting' ? '#EF4444' : rtState === 'go' ? '#22C55E' : rtState === 'tooSoon' ? '#F97316' : '#16A34A';
    return (
      <View onClick={handleTap} style={{ flex: 1, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 24px', paddingTop: 50 }}>
          <View onClick={() => { clearScheduled(); setTimeout(() => Taro.navigateBack(), 50); }} style={{ padding: 8 }}>
            <Icon name='chevron-right' size={24} color='#FFFFFF' />
          </View>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{trialIndex + 1} / {TOTAL_TRIALS}</Text>
        </View>
        {rtState === 'waiting' && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 44, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>{t('reaction.waitForGreen', '等待绿色')}</Text>
            <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>{t('reaction.dontTapRed', '红色时不要点击')}</Text>
          </View>
        )}
        {rtState === 'go' && (
          <Text style={{ fontSize: 56, fontWeight: 700, color: '#FFFFFF' }}>{t('reaction.tapNow', '立即点击!')}</Text>
        )}
        {rtState === 'done' && lastReaction !== null && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 56, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>{lastReaction}ms</Text>
            <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>{t('reaction.yourTime', '你的反应时间')}</Text>
          </View>
        )}
        {rtState === 'tooSoon' && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>{t('reaction.tooSoon', '太快了!')}</Text>
            <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>{t('reaction.waitForIt', '请等待绿色出现')}</Text>
          </View>
        )}
        <View style={{ position: 'absolute', bottom: 60, display: 'flex', flexDirection: 'row', gap: 12 }}>
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <View key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', backgroundColor: i < trialIndex || (i === trialIndex && rtState === 'done') ? '#FFFFFF' : 'transparent' }} />
          ))}
        </View>
      </View>
    );
  }

  // === RESULTS ===
  const avgReaction = trials.length > 0 ? trials.reduce((a, b) => a + b.reactionMs, 0) / trials.length : 0;
  const fastest = trials.length > 0 ? Math.min(...trials.map((t) => t.reactionMs)) : 0;
  const slowest = trials.length > 0 ? Math.max(...trials.map((t) => t.reactionMs)) : 0;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <Text style={{ fontSize: 80, fontWeight: 700, color: '#7C3AED', fontFamily: 'monospace', marginBottom: 8 }}>{Math.round(avgReaction)}</Text>
        <Text style={{ fontSize: 26, color: '#64748B', marginBottom: 48 }}>{t('reaction.averageReaction', '平均反应时间')} (ms)</Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 40, width: '100%' }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '20px 16px', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 40, fontWeight: 700, color: '#22C55E', fontFamily: 'monospace' }}>{fastest}</Text>
            <Text style={{ fontSize: 22, color: '#64748B', marginTop: 4 }}>{t('reaction.fastest', '最快')}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: '20px 16px', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 40, fontWeight: 700, color: '#F97316', fontFamily: 'monospace' }}>{slowest}</Text>
            <Text style={{ fontSize: 22, color: '#64748B', marginTop: 4 }}>{t('reaction.slowest', '最慢')}</Text>
          </View>
        </View>
        <View style={{ width: '100%', marginBottom: 32 }}>
          {trials.map((trial, i) => (
            <View key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: '18px 24px', marginBottom: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Text style={{ fontSize: 26, color: '#64748B' }}>第 {i + 1} 次</Text>
              <Text style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', fontFamily: 'monospace' }}>{trial.reactionMs} ms</Text>
            </View>
          ))}
        </View>
        <View onClick={startGame} style={{ backgroundColor: '#7C3AED', borderRadius: 16, padding: '24px 0', alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('reaction.tryAgain', '再来一次')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
