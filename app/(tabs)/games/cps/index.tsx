import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Zap, Timer, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { INTERVALS, getIntervalCPS, getTotalCPS } from '../../../../src/engine/cps';
import { GameIntro } from '../../../../src/components/games/GameIntro';

type ScreenState = 'menu' | 'countdown' | 'playing' | 'results';
type GamePhase = { label: string; cps: number };

export default function CPSTestScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

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
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(0);

  const currentInterval = INTERVALS[intervalIndex];

  // Countdown
  useEffect(() => {
    if (screen !== 'countdown') return;
    if (countdownNum <= 0) {
      setScreen('playing');
      return;
    }
    const t = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, countdownNum]);

  // Playing - track elapsed time
  useEffect(() => {
    if (screen !== 'playing') return;
    intervalStartRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - intervalStartRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= currentInterval.ms) {
        // End this interval
        feedback.win();
        const intervalClicks = clicksRef.current;
        const newClicks = [...clicks, intervalClicks];
        setClicks(newClicks);
        setResults((r) => [
          ...r,
          { label: currentInterval.label, cps: getIntervalCPS(intervalClicks, currentInterval.ms) },
        ]);

        if (intervalIndex + 1 >= INTERVALS.length) {
          // All intervals done
          setScreen('results');
        } else {
          // Next interval - brief transition
          setScreen('countdown');
          setCountdownNum(1);
          setIntervalIndex((i) => i + 1);
          clicksRef.current = 0;
          setCurrentClicks(0);
          setElapsedMs(0);
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [screen, intervalIndex]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const totalClicks = clicks.reduce((a, b) => a + b, 0);
    const totalMs = INTERVALS.reduce((s, i) => s + i.ms, 0);
    saveGameResult({
      id: `cps_${Date.now()}`,
      gameType: 'cps',
      difficulty: 'normal',
      startedAt: startedRef.current,
      completedAt: Date.now(),
      durationMs: totalMs,
      mistakes: 0,
      hintsUsed: 0,
      score: Math.round(getTotalCPS(clicks) * 100),
      completed: true,
      isDaily: false,
      details: JSON.stringify({ clicks, intervals: results }),
    });
  }, [screen, isSaved]);

  const startGame = useCallback(() => {
    setScreen('countdown');
    setCountdownNum(3);
    setIntervalIndex(0);
    setClicks([]);
    setCurrentClicks(0);
    setElapsedMs(0);
    setResults([]);
    setIsSaved(false);
    clicksRef.current = 0;
    startedRef.current = Date.now();
    feedback.numberInput();
  }, [feedback]);

  const handleTap = useCallback(() => {
    if (screen !== 'playing') return;
    clicksRef.current += 1;
    setCurrentClicks(clicksRef.current);
    feedback.cellTap();
  }, [screen, feedback]);

  const currentCPS = elapsedMs > 0 ? (currentClicks / (elapsedMs / 1000)) : 0;

  // === MENU SCREEN ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('cps.title')}
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <View className="items-center mb-10">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <Zap stroke="#229CF8" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('cps.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('cps.description')}
            </Text>
          </View>

          <GameIntro i18nKey="cps" color="#229CF8" />

          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-6">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {t('cps.intervals')}
            </Text>
            <View className="flex-row justify-between">
              {INTERVALS.map((iv) => (
                <View key={iv.label} className="bg-white dark:bg-gray-700 rounded-xl px-4 py-2">
                  <Text className="text-gray-900 dark:text-white font-semibold text-center">
                    {iv.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={startGame}
            className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('cps.start')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // === COUNTDOWN SCREEN ===
  if (screen === 'countdown') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <Text className="text-8xl font-bold text-blue-500">
          {countdownNum}
        </Text>
      </View>
    );
  }

  // === PLAYING SCREEN ===
  if (screen === 'playing') {
    const progress = Math.min(elapsedMs / currentInterval.ms, 1);
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-3">
          <View className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-1">
            <Text className="text-blue-600 dark:text-blue-400 font-semibold">
              {currentInterval.label}
            </Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 font-mono text-lg">
            {Math.ceil((currentInterval.ms - elapsedMs) / 1000)}s
          </Text>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
            <Text className="text-gray-600 dark:text-gray-300 font-mono">
              {currentCPS.toFixed(1)} CPS
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-1 bg-gray-200 dark:bg-gray-700 mx-6 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {/* Tap area */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          className="flex-1 mx-6 my-4 bg-blue-50 dark:bg-blue-900/10 rounded-3xl items-center justify-center border-2 border-blue-200 dark:border-blue-800"
        >
          <Text className="text-7xl font-bold text-blue-500 font-mono">
            {currentClicks}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 mt-4 text-lg">
            {t('cps.tapHere')}
          </Text>
        </TouchableOpacity>

        {/* Interval dots */}
        <View className="flex-row justify-center gap-2 pb-6">
          {INTERVALS.map((iv, i) => (
            <View
              key={iv.label}
              className={`w-2.5 h-2.5 rounded-full ${
                i < intervalIndex
                  ? 'bg-blue-500'
                  : i === intervalIndex
                  ? 'bg-blue-300'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </View>
      </View>
    );
  }

  // === RESULTS SCREEN ===
  const avgCPS = getTotalCPS(clicks);
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('cps.results')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Average */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-5xl font-bold text-blue-500 font-mono">
            {avgCPS.toFixed(1)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {t('cps.averageCPS')}
          </Text>
        </View>

        {/* Per-interval breakdown */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            {t('cps.breakdown')}
          </Text>
          {results.map((phase, i) => (
            <View
              key={phase.label}
              className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-5 py-4 mb-2"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-blue-100 dark:bg-blue-900/30 rounded-lg w-12 h-8 items-center justify-center">
                  <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {phase.label}
                  </Text>
                </View>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('cps.clicksCount', { count: clicks[i] })}
                </Text>
              </View>
              <Text className="text-gray-900 dark:text-white font-bold font-mono text-lg">
                {phase.cps.toFixed(1)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={startGame}
          className="bg-blue-500 rounded-2xl py-4 items-center mb-10 flex-row justify-center gap-2"
        >
          <RefreshCw stroke="white" size={20} />
          <Text className="text-white text-lg font-semibold">{t('cps.tryAgain')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
