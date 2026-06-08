import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Clock, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { TARGET_MS, getDifferenceMs, getResult } from '../../../../src/engine/tensecond';
import { GameIntro } from '../../../../src/components/games/GameIntro';

export default function TenSecondChallengeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<'menu' | 'playing' | 'stopped' | 'results'>('menu');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [diffMs, setDiffMs] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startedAtRef = useRef(0);

  // Tick timer during playing
  useEffect(() => {
    if (screen !== 'playing') return;
    startRef.current = Date.now();
    const tick = () => {
      setElapsedMs(Date.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [screen]);

  const startGame = useCallback(() => {
    setScreen('playing');
    setElapsedMs(0);
    setDiffMs(null);
    setIsSaved(false);
    startedAtRef.current = Date.now();
    feedback.numberInput();
  }, [feedback]);

  const handleStop = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    setElapsedMs(elapsed);
    const diff = getDifferenceMs(elapsed);
    setDiffMs(diff);
    setScreen('stopped');
    if (diff <= 100) {
      feedback.win();
    } else {
      feedback.error();
    }
  }, [feedback]);

  const showResults = useCallback(() => {
    setScreen('results');
  }, []);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved || diffMs === null) return;
    setIsSaved(true);
    const score = Math.max(0, Math.round(10000 - diffMs * 10));
    saveGameResult({
      id: `tensec_${Date.now()}`,
      gameType: 'tensecond',
      difficulty: 'normal',
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      durationMs: elapsedMs,
      mistakes: 0,
      hintsUsed: 0,
      score,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ elapsedMs, diffMs, targetMs: TARGET_MS }),
    });
  }, [screen, isSaved, diffMs]);

  const displaySeconds = (elapsedMs / 1000).toFixed(3);
  const accuracy = diffMs !== null ? (100 - (diffMs / TARGET_MS) * 100).toFixed(1) : '0';

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('tensec.title')}
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-6 mb-4">
              <Clock stroke="#D97706" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('tensec.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('tensec.description')}
            </Text>
          </View>

          <GameIntro i18nKey="tensec" color="#D97706" />

          <TouchableOpacity
            onPress={startGame}
            className="bg-amber-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('tensec.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  if (screen === 'playing') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => { setScreen('menu'); }} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 dark:text-gray-500 text-lg mb-8">
            {t('tensec.tapAtTen')}
          </Text>

          <Text className="text-8xl font-bold text-gray-900 dark:text-white font-mono mb-16 tracking-tighter">
            {displaySeconds}
          </Text>

          <TouchableOpacity
            onPress={handleStop}
            className="bg-red-500 rounded-full w-32 h-32 items-center justify-center active:opacity-80 shadow-lg shadow-red-500/30"
          >
            <Text className="text-white text-xl font-bold">{t('tensec.stop')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === STOPPED (mini result) ===
  if (screen === 'stopped' && diffMs !== null) {
    const result = getResult(diffMs);
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => { setScreen('menu'); }} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-7xl font-bold font-mono mb-2" style={{ color: result.color }}>
            {displaySeconds}
          </Text>
          <Text className="text-2xl font-bold mb-4" style={{ color: result.color }}>
            {t(`tensec.${result.rating}`)}
          </Text>

          <Text className="text-gray-500 dark:text-gray-400 text-lg mb-12">
            {t('tensec.diff', { diff: (diffMs / 1000).toFixed(3) })}
          </Text>

          <View className="flex-row gap-4 w-full">
            <TouchableOpacity
              onPress={startGame}
              className="flex-1 bg-amber-500 rounded-2xl py-4 items-center flex-row justify-center gap-2"
            >
              <RefreshCw stroke="white" size={18} />
              <Text className="text-white font-semibold">{t('tensec.tryAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showResults}
              className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-gray-700 dark:text-gray-200 font-semibold">
                {t('tensec.details')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // === RESULTS ===
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('tensec.results')}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-7xl font-bold font-mono mb-2 text-amber-500">
          {displaySeconds}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-lg mb-12">
          {t('tensec.diff', { diff: diffMs !== null ? (diffMs / 1000).toFixed(3) : '0.000' })}
        </Text>

        <View className="w-full flex-row gap-4 mb-10">
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('tensec.yourTime')}
            </Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
              {displaySeconds}s
            </Text>
          </View>
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('tensec.accuracy')}
            </Text>
            <Text className="text-2xl font-bold text-amber-500">
              {accuracy}%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={startGame}
          className="bg-amber-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
        >
          <RefreshCw stroke="white" size={20} />
          <Text className="text-white text-lg font-semibold">{t('tensec.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
