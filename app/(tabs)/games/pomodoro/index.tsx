import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Timer, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { PomodoroPhase, getNextPhase, getPhaseDuration, SESSIONS_BEFORE_LONG_BREAK } from '../../../../src/engine/pomodoro';

export default function PomodoroScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();

  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [remainingMs, setRemainingMs] = useState(getPhaseDuration('work'));
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingMs((r) => {
        if (r <= 100) {
          feedback.win();
          const next = getNextPhase(phase, sessionCount);
          const newCount = phase === 'work' ? sessionCount : (next === 'work' ? sessionCount + 1 : sessionCount);
          if (phase === 'work') setSessionCount((s) => (next === 'longBreak' ? s : s));
          setPhase(next);
          if (next === 'work') setSessionCount((s) => s + 1);
          if (phase !== 'work') setSessionCount((s) => s); // don't increment on break->work
          return getPhaseDuration(next);
        }
        return r - 100;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase, sessionCount, feedback]);

  const toggleTimer = useCallback(() => {
    setIsRunning((r) => !r);
    feedback.cellTap();
  }, [feedback]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('work');
    setSessionCount(1);
    setRemainingMs(getPhaseDuration('work'));
    feedback.numberInput();
  }, [feedback]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const totalSec = getPhaseDuration(phase) / 1000;
  const remainingSec = remainingMs / 1000;
  const progress = 1 - remainingSec / totalSec;

  const phaseLabel = phase === 'work' ? t('pomodoro.work') : phase === 'shortBreak' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak');
  const phaseColor = phase === 'work' ? '#EF4444' : phase === 'shortBreak' ? '#10B981' : '#6366F1';

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('pomodoro.title')}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Phase indicator */}
        <Text className="text-lg font-medium mb-8" style={{ color: phaseColor }}>
          {phaseLabel}
        </Text>

        {/* Progress ring */}
        <View className="w-64 h-64 rounded-full border-8 border-gray-200 dark:border-gray-700 items-center justify-center mb-8">
          <View
            className="absolute inset-0 rounded-full"
            style={{
              borderWidth: 8,
              borderColor: phaseColor,
              opacity: progress,
              margin: -8,
            }}
          />
          <Text className="text-6xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>

        {/* Controls */}
        <View className="flex-row gap-6 mb-10">
          <TouchableOpacity
            onPress={toggleTimer}
            className="rounded-full p-4"
            style={{ backgroundColor: phaseColor }}
          >
            {isRunning ? <Pause stroke="white" size={28} /> : <Play stroke="white" size={28} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} className="bg-gray-200 dark:bg-gray-700 rounded-full p-4">
            <RotateCcw stroke="#6B7280" size={28} />
          </TouchableOpacity>
        </View>

        {/* Session dots */}
        <View className="flex-row gap-2">
          {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
            <View
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < (sessionCount - 1) % SESSIONS_BEFORE_LONG_BREAK ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
