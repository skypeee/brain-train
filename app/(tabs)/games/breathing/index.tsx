import { View, Text, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Wind, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import {
  BreathingPattern, BreathingPhase, PATTERNS, getPhaseDuration,
} from '../../../../src/engine/breathing';

const PHASE_ORDER_FULL: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'holdAfter'];
const PHASE_ORDER_HOLD: BreathingPhase[] = ['inhale', 'hold', 'exhale'];
const PHASE_ORDER_BASIC: BreathingPhase[] = ['inhale', 'exhale'];

function getPhaseOrder(pattern: BreathingPattern): BreathingPhase[] {
  const c = PATTERNS[pattern];
  if (c.hold > 0 && c.holdAfter > 0) return PHASE_ORDER_FULL;
  if (c.hold > 0) return PHASE_ORDER_HOLD;
  return PHASE_ORDER_BASIC;
}

export default function BreathingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();

  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [pattern, setPattern] = useState<BreathingPattern>('box');
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [phaseMs, setPhaseMs] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const animValue = useRef(new Animated.Value(0)).current;
  const rafRef = useRef<number>(0);
  // Track real-time offsets so we stay accurate
  const phaseStartRef = useRef(0);
  const cycleRef = useRef(1);
  const phaseRef = useRef<BreathingPhase>('inhale');
  const patternRef = useRef<BreathingPattern>('box');

  // Keep refs in sync with state for the rAF loop
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;

  const startBreathing = useCallback((p: BreathingPattern) => {
    patternRef.current = p;
    setPattern(p);
    phaseRef.current = 'inhale';
    setPhase('inhale');
    setPhaseMs(0);
    cycleRef.current = 1;
    setCycle(1);
    setIsRunning(true);
    isRunningRef.current = true;
    setScreen('playing');
    animValue.setValue(0);
    phaseStartRef.current = Date.now();
    feedback.numberInput();
  }, [feedback, animValue]);

  // Main rAF loop — uses real time, never drifts
  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const config = PATTERNS[patternRef.current];
    const phases = getPhaseOrder(patternRef.current);

    const tick = () => {
      if (!isRunningRef.current) return;

      const now = Date.now();
      const elapsed = now - phaseStartRef.current;
      const phaseDuration = getPhaseDuration(patternRef.current, phaseRef.current);

      if (elapsed >= phaseDuration) {
        // Advance to next phase
        const idx = phases.indexOf(phaseRef.current);
        const nextIdx = idx + 1;

        if (nextIdx >= phases.length) {
          // Cycle complete
          const nextCycle = cycleRef.current + 1;
          if (nextCycle > config.cycles) {
            setIsRunning(false);
            isRunningRef.current = false;
            feedback.win();
            animValue.setValue(0);
            return;
          }
          cycleRef.current = nextCycle;
          setCycle(nextCycle);
          phaseRef.current = 'inhale';
          setPhase('inhale');
          phaseStartRef.current = now;
          setPhaseMs(0);
          animValue.setValue(0);

          // Start inhale animation
          const inhaleDuration = getPhaseDuration(patternRef.current, 'inhale');
          Animated.timing(animValue, {
            toValue: 1,
            duration: inhaleDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        } else {
          const nextPhase = phases[nextIdx];
          phaseRef.current = nextPhase;
          setPhase(nextPhase);
          phaseStartRef.current = now;
          setPhaseMs(0);

          // Animate for the new phase
          const nextDuration = getPhaseDuration(patternRef.current, nextPhase);
          animValue.setValue(nextPhase === 'inhale' ? 0 : 1);
          Animated.timing(animValue, {
            toValue: nextPhase === 'inhale' ? 1 : nextPhase === 'exhale' ? 0.5 : 0.5,
            duration: nextDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      } else {
        // Update progress bar smoothly
        setPhaseMs(elapsed);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Start appropriate animation
    const initDuration = getPhaseDuration(patternRef.current, phaseRef.current);
    animValue.stopAnimation();
    Animated.timing(animValue, {
      toValue: phaseRef.current === 'inhale' ? 1 : 0.5,
      duration: initDuration - (Date.now() - phaseStartRef.current),
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      animValue.stopAnimation();
    };
  }, [isRunning, feedback, animValue]);

  const toggleRunning = useCallback(() => {
    const next = !isRunning;
    if (next) {
      // Resume from where we left off
      phaseStartRef.current = Date.now() - phaseMs;
    }
    setIsRunning(next);
    isRunningRef.current = next;
    feedback.cellTap();
  }, [isRunning, phaseMs, feedback]);

  const config = PATTERNS[pattern];
  const phaseLabel =
    phase === 'inhale' ? t('breathing.inhale') :
    phase === 'exhale' ? t('breathing.exhale') :
    t('breathing.hold');
  const phaseColor = phase === 'inhale' ? '#3B82F6' : phase === 'exhale' ? '#10B981' : '#F59E0B';
  const phaseDuration = getPhaseDuration(pattern, phase);
  const progress = phaseDuration > 0 ? Math.min(phaseMs / phaseDuration, 1) : 1;

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('breathing.title')}
          </Text>
        </View>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center mb-8">
            <View className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-6 mb-4">
              <Wind stroke="#14B8A6" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('breathing.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('breathing.description')}
            </Text>
          </View>

          {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => startBreathing(p)}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 mb-3 active:opacity-70"
            >
              <Text className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                {t(`breathing.${p}Name`)}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {PATTERNS[p].inhale}-{PATTERNS[p].hold}-{PATTERNS[p].exhale}
                {PATTERNS[p].holdAfter > 0 ? `-${PATTERNS[p].holdAfter}` : ''} • {PATTERNS[p].cycles} {t('breathing.cycles')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // === PLAYING ===
  const scale = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] });
  const remaining = phaseDuration - phaseMs;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => { setIsRunning(false); setScreen('menu'); }} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm text-gray-400">
          {t(`breathing.${pattern}Name`)} • {cycle}/{config.cycles}
        </Text>
        <TouchableOpacity onPress={toggleRunning} className="p-2">
          {isRunning ? <Pause stroke="#6B7280" size={20} /> : <Play stroke="#6B7280" size={20} />}
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Animated circle */}
        <Animated.View
          className="w-56 h-56 rounded-full items-center justify-center mb-12"
          style={{
            backgroundColor: `${phaseColor}20`,
            borderColor: phaseColor,
            borderWidth: 3,
            transform: [{ scale }],
          }}
        >
          <Text className="text-3xl font-bold" style={{ color: phaseColor }}>
            {phaseLabel}
          </Text>
          <Text className="text-xl font-mono mt-1" style={{ color: phaseColor }}>
            {Math.ceil(remaining / 1000)}s
          </Text>
        </Animated.View>

        {/* Phase bar */}
        <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: phaseColor,
            }}
          />
        </View>

        <Text className="text-gray-400 text-sm">
          {t('breathing.pattern', { pattern: pattern.toUpperCase() })}: {config.inhale}-{config.hold || 0}-{config.exhale}{config.holdAfter > 0 ? `-${config.holdAfter}` : ''}
        </Text>
      </View>
    </View>
  );
}
