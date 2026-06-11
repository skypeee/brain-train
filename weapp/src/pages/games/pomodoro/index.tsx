import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { PomodoroPhase, getNextPhase, getPhaseDuration, SESSIONS_BEFORE_LONG_BREAK } from '../../../engine/pomodoro';

definePageConfig({ navigationBarTitleText: '番茄钟', navigationStyle: 'custom' });

export default function PomodoroPage() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [remainingMs, setRemainingMs] = useState(getPhaseDuration('work'));
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemainingMs((r) => {
        if (r <= 100) {
          Taro.vibrateShort({ type: 'heavy' });
          const next = getNextPhase(phase, sessionCount);
          setPhase(next);
          if (next === 'work') setSessionCount((s) => s + 1);
          return getPhaseDuration(next);
        }
        return r - 100;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase, sessionCount]);

  const toggleTimer = useCallback(() => { setIsRunning((r) => !r); Taro.vibrateShort({ type: 'light' }); }, []);

  const reset = useCallback(() => {
    setIsRunning(false); setPhase('work'); setSessionCount(1); setRemainingMs(getPhaseDuration('work'));
    Taro.vibrateShort({ type: 'light' });
  }, []);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const phaseLabel = phase === 'work' ? t('pomodoro.work', '专注') : phase === 'shortBreak' ? t('pomodoro.shortBreak', '短休') : t('pomodoro.longBreak', '长休');
  const phaseColor = phase === 'work' ? '#EF4444' : phase === 'shortBreak' ? '#10B981' : '#6366F1';

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px 20px', paddingTop: 50 }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: 8 }}><Icon name='chevron-right' size={24} color='#6B7280' /></View>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 30, fontWeight: 600, color: '#1A1A2E' }}>{t('pomodoro.title', '番茄钟')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <Text style={{ fontSize: 30, fontWeight: 600, marginBottom: 40, color: phaseColor }}>{phaseLabel}</Text>
        {/* Progress ring */}
        <View style={{ width: 260, height: 260, borderRadius: '50%', border: '6px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 80, fontWeight: 700, color: '#1A1A2E', fontFamily: 'monospace' }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 40 }}>
          <View onClick={toggleTimer} style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: phaseColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 32, color: '#FFFFFF' }}>{isRunning ? '⏸' : '▶'}</Text>
          </View>
          <View onClick={reset} style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, color: '#6B7280' }}>↺</Text>
          </View>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
            <View key={i} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: i < (sessionCount - 1) % SESSIONS_BEFORE_LONG_BREAK ? '#EF4444' : '#E2E8F0' }} />
          ))}
        </View>
      </View>
    </View>
  );
}
