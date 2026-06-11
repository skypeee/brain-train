import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeArea } from '../../../hooks/useSafeArea';
import { Icon } from '../../../components/ui';
import { BreathingPattern, BreathingPhase, PATTERNS, getPhaseDuration, getTotalCycleMs } from '../../../engine/breathing';

definePageConfig({ navigationBarTitleText: '呼吸练习', navigationStyle: 'custom' });

const PHASE_ORDER: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'holdAfter'];

export default function BreathingPage() {
  const { t } = useTranslation();
  const { navHeight } = useSafeArea();
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [pattern, setPattern] = useState<BreathingPattern>('resonance');
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [phaseMs, setPhaseMs] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [scale, setScale] = useState(0.6);
  const phaseStartRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleRef = useRef(1);
  const phaseRef = useRef<BreathingPhase>('inhale');
  const configRef = useRef(PATTERNS.resonance);

  const startBreathing = useCallback((p: BreathingPattern) => {
    const cfg = PATTERNS[p];
    configRef.current = cfg; setPattern(p); setScreen('playing');
    phaseRef.current = 'inhale'; setPhase('inhale'); setPhaseMs(0); setScale(0.6);
    cycleRef.current = 1; setCycle(1); setIsRunning(true);
    phaseStartRef.current = Date.now(); Taro.vibrateShort({ type: 'light' });
  }, []);

  useEffect(() => {
    if (!isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; return; }
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - phaseStartRef.current;
      const dur = getPhaseDuration(pattern as BreathingPattern, phaseRef.current);
      if (elapsed >= dur) {
        // Advance phase
        const idx = PHASE_ORDER.indexOf(phaseRef.current);
        const nextIdx = idx + 1;
        if (nextIdx >= PHASE_ORDER.length) {
          // Cycle done
          const nextCycle = cycleRef.current + 1;
          if (nextCycle > configRef.current.cycles) { setIsRunning(false); Taro.vibrateShort({ type: 'heavy' }); if (intervalRef.current) clearInterval(intervalRef.current); return; }
          cycleRef.current = nextCycle; setCycle(nextCycle);
          phaseRef.current = 'inhale'; setPhase('inhale'); setPhaseMs(0); setScale(0.6);
          phaseStartRef.current = now;
        } else {
          // Skip hold phases with 0 duration
          let next = PHASE_ORDER[nextIdx];
          const nextDur = getPhaseDuration(pattern, next);
          if (nextDur === 0) {
            const skipIdx = nextIdx + 1;
            if (skipIdx >= PHASE_ORDER.length) {
              const nextCycle2 = cycleRef.current + 1;
              if (nextCycle2 > configRef.current.cycles) { setIsRunning(false); Taro.vibrateShort({ type: 'heavy' }); if (intervalRef.current) clearInterval(intervalRef.current); return; }
              cycleRef.current = nextCycle2; setCycle(nextCycle2);
              phaseRef.current = 'inhale'; setPhase('inhale'); setPhaseMs(0); setScale(0.6);
              phaseStartRef.current = now;
            } else {
              next = PHASE_ORDER[skipIdx];
              phaseRef.current = next; setPhase(next); setPhaseMs(0); phaseStartRef.current = now;
              if (next === 'inhale') setScale(0.6); else if (next === 'exhale') setScale(1.2);
            }
          } else {
            phaseRef.current = next; setPhase(next); setPhaseMs(0); phaseStartRef.current = now;
            if (next === 'exhale') setScale(1.2);
          }
        }
      } else {
        setPhaseMs(elapsed);
        // Smooth scale interpolation
        const progress = dur > 0 ? elapsed / dur : 0;
        if (phaseRef.current === 'inhale') setScale(0.6 + progress * 0.6);
        else if (phaseRef.current === 'exhale') setScale(1.2 - progress * 0.6);
        else if (phaseRef.current === 'hold') setScale(1.2);
        else setScale(0.6);
      }
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, pattern]);

  const toggleRunning = useCallback(() => {
    const next = !isRunning;
    if (next) phaseStartRef.current = Date.now() - phaseMs;
    setIsRunning(next); Taro.vibrateShort({ type: 'light' });
  }, [isRunning, phaseMs]);

  const config = PATTERNS[pattern];
  const phaseLabel = phase === 'inhale' ? t('breathing.inhale', '吸气') : phase === 'exhale' ? t('breathing.exhale', '呼气') : t('breathing.hold', '屏息');
  const phaseColor = phase === 'inhale' ? '#3B82F6' : phase === 'exhale' ? '#10B981' : '#F59E0B';
  const phaseDuration = getPhaseDuration(pattern, phase);
  const progress = phaseDuration > 0 ? Math.min(phaseMs / phaseDuration, 1) : 1;

  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='wind' size={36} color='#14B8A6' /></View>
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8, wordBreak: 'break-all'}}>{t('breathing.title', '呼吸练习')}</Text>
        <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40, wordBreak: 'break-all'}}>{t('breathing.description', '选择一种呼吸模式开始练习')}</Text>
        {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
          <View key={p} onClick={() => startBreathing(p)} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: '24px 28px', marginBottom: 16, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2E', wordBreak: 'break-all'}}>{t(`breathing.${p}Name`, p)}</Text>
              <View style={{ backgroundColor: '#F1F5F9', borderRadius: 10, padding: '6px 12px' }}>
                <Text style={{ fontSize: 16, fontFamily: 'monospace', color: '#14B8A6', wordBreak: 'break-all'}}>{PATTERNS[p].inhale}-{PATTERNS[p].hold}-{PATTERNS[p].exhale}{PATTERNS[p].holdAfter > 0 ? `-${PATTERNS[p].holdAfter}` : ''}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, color: '#64748B', lineHeight: 1.5, wordBreak: 'break-all'}}>{t(`breathing.${p}Use`, '')}</Text>
            <Text style={{ fontSize: 16, color: '#94A3B8', marginTop: 6, wordBreak: 'break-all'}}>{PATTERNS[p].cycles} {t('breathing.cycles', '轮')}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', paddingTop: navHeight }}>
        <View onClick={() => { setIsRunning(false); setScreen('menu'); }} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: '#6B7280' }}>&lt; 返回</Text></View>
        <Text style={{ fontSize: 16, color: '#94A3B8', wordBreak: 'break-all'}}>{t(`breathing.${pattern}Name`, pattern)} · {cycle}/{config.cycles}</Text>
        <View onClick={toggleRunning} style={{ padding: 8 }}><Text style={{ fontSize: 18, wordBreak: 'break-all'}}>{isRunning ? '⏸' : '▶'}</Text></View>
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        {/* Animated breathing circle */}
        <View style={{
          width: 220, height: 220, borderRadius: '50%',
          backgroundColor: `${phaseColor}20`, border: `3px solid ${phaseColor}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          marginBottom: 60,
          transform: `scale(${scale})`,
        }}>
          <Text style={{ fontSize: 24, fontWeight: 700, color: phaseColor, wordBreak: 'break-all'}}>{phaseLabel}</Text>
          <Text style={{ fontSize: 18, fontFamily: 'monospace', color: phaseColor, marginTop: 4, wordBreak: 'break-all'}}>
            {Math.ceil((phaseDuration - phaseMs) / 1000)}s
          </Text>
        </View>
        {/* Progress bar */}
        <View style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ height: '100%', borderRadius: 2, backgroundColor: phaseColor, width: `${progress * 100}%` }} />
        </View>
        <Text style={{ fontSize: 16, color: '#94A3B8', wordBreak: 'break-all'}}>
          {config.inhale}-{config.hold || 0}-{config.exhale}{config.holdAfter > 0 ? `-${config.holdAfter}` : ''}
        </Text>
      </View>
    </View>
  );
}
