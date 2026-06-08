import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Zap, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { TOTAL_TRIALS, MIN_WAIT_MS, MAX_WAIT_MS, RTState, TrialResult } from '../../../../src/engine/reaction';
import { GameIntro } from '../../../../src/components/games/GameIntro';

export default function ReactionTestScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [rtState, setRTState] = useState<RTState>('waiting');
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [lastReaction, setLastReaction] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const goTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(0);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeout);
      callback();
    }, delay);
    timeoutsRef.current.push(timeout);
    timeoutRef.current = timeout;
    return timeout;
  }, []);

  const clearScheduledTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    timeoutRef.current = undefined;
  }, []);

  const startTrial = useCallback(() => {
    clearScheduledTimeouts();
    setRTState('waiting');
    const delay = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    scheduleTimeout(() => {
      goTimeRef.current = Date.now();
      setRTState('go');
    }, delay);
  }, [clearScheduledTimeouts, scheduleTimeout]);

  const handleTap = useCallback(() => {
    if (rtState === 'go') {
      const reaction = Date.now() - goTimeRef.current;
      feedback.win();
      setLastReaction(reaction);
      setTrials((prev) => [...prev, { reactionMs: reaction }]);
      setRTState('done');

      if (trialIndex + 1 >= TOTAL_TRIALS) {
        scheduleTimeout(() => {
          clearScheduledTimeouts();
          setScreen('results');
        }, 600);
      } else {
        scheduleTimeout(() => {
          setTrialIndex((i) => i + 1);
          setLastReaction(null);
          scheduleTimeout(() => startTrial(), 500);
        }, 800);
      }
    } else if (rtState === 'waiting') {
      // Tapped too soon
      feedback.error();
      setRTState('tooSoon');
      clearScheduledTimeouts();
      scheduleTimeout(() => {
        setRTState('waiting');
        startTrial();
      }, 1500);
    }
  }, [rtState, trialIndex, feedback, startTrial, scheduleTimeout, clearScheduledTimeouts]);

  const startGame = useCallback(() => {
    clearScheduledTimeouts();
    setScreen('playing');
    setTrialIndex(0);
    setTrials([]);
    setLastReaction(null);
    setIsSaved(false);
    startedRef.current = Date.now();
    scheduleTimeout(() => startTrial(), 800);
    feedback.numberInput();
  }, [feedback, startTrial, scheduleTimeout, clearScheduledTimeouts]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearScheduledTimeouts();
    };
  }, [clearScheduledTimeouts]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const avgReaction = trials.length > 0
      ? trials.reduce((a, b) => a + b.reactionMs, 0) / trials.length
      : 0;
    // Score: faster reaction = higher score (capped at 10000)
    const score = Math.max(0, Math.round(10000 - avgReaction * 10));
    saveGameResult({
      id: `reaction_${Date.now()}`,
      gameType: 'reaction',
      difficulty: 'normal',
      startedAt: startedRef.current,
      completedAt: Date.now(),
      durationMs: trials.reduce((a, b) => a + b.reactionMs, 0),
      mistakes: 0,
      hintsUsed: 0,
      score,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ trials, avgReaction }),
    });
  }, [screen, isSaved]);

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('reaction.title')}
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-6 mb-4">
              <Zap stroke="#7C3AED" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('reaction.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('reaction.description')}
            </Text>
          </View>

          <GameIntro i18nKey="reaction" color="#7C3AED" />

          <TouchableOpacity
            onPress={startGame}
            className="bg-purple-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('reaction.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  if (screen === 'playing') {
    const bgColor =
      rtState === 'waiting' ? 'bg-red-500' :
      rtState === 'go' ? 'bg-green-500' :
      rtState === 'tooSoon' ? 'bg-orange-500' :
      rtState === 'done' ? 'bg-green-600' : 'bg-red-500';

    const textColor = 'text-white';

    return (
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={1}
        className={`flex-1 ${bgColor} items-center justify-center`}
      >
        <View className="absolute top-0 left-0 right-0 flex-row justify-between px-6" style={{ paddingTop: insets.top + 8 }}>
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ChevronLeft stroke="white" size={24} />
          </TouchableOpacity>
          <Text className={`${textColor} font-semibold text-lg py-2`}>
            {trialIndex + 1} / {TOTAL_TRIALS}
          </Text>
        </View>

        {rtState === 'waiting' && (
          <View className="items-center">
            <Text className={`${textColor} text-4xl font-bold mb-4`}>
              {t('reaction.waitForGreen')}
            </Text>
            <Text className={`${textColor}/70 text-lg`}>
              {t('reaction.dontTapRed')}
            </Text>
          </View>
        )}

        {rtState === 'go' && (
          <Text className={`${textColor} text-5xl font-bold`}>
            {t('reaction.tapNow')}
          </Text>
        )}

        {rtState === 'done' && lastReaction !== null && (
          <View className="items-center">
            <Text className={`${textColor} text-4xl font-bold font-mono`}>
              {lastReaction}ms
            </Text>
            <Text className={`${textColor}/70 text-lg mt-2`}>
              {t('reaction.yourTime')}
            </Text>
          </View>
        )}

        {rtState === 'tooSoon' && (
          <View className="items-center">
            <Text className={`${textColor} text-3xl font-bold mb-2`}>
              {t('reaction.tooSoon')}
            </Text>
            <Text className={`${textColor}/70 text-lg`}>
              {t('reaction.waitForIt')}
            </Text>
          </View>
        )}

        {/* Progress dots */}
        <View className="absolute bottom-12 flex-row gap-3">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <View
              key={i}
              className={`w-3 h-3 rounded-full border-2 border-white/50 ${
                i < trialIndex || (i === trialIndex && rtState === 'done')
                  ? 'bg-white'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  // === RESULTS ===
  const avgReaction = trials.length > 0
    ? trials.reduce((a, b) => a + b.reactionMs, 0) / trials.length
    : 0;
  const fastest = trials.length > 0
    ? Math.min(...trials.map((t) => t.reactionMs))
    : 0;
  const slowest = trials.length > 0
    ? Math.max(...trials.map((t) => t.reactionMs))
    : 0;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('reaction.results')}
        </Text>
      </View>

      <View className="flex-1 px-6 justify-center items-center">
        <Text className="text-6xl font-bold text-purple-500 font-mono mb-2">
          {Math.round(avgReaction)}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-lg mb-12">
          {t('reaction.averageReaction')} (ms)
        </Text>

        <View className="flex-row gap-4 mb-10 w-full">
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 items-center">
            <Text className="text-2xl font-bold text-green-500 font-mono">
              {fastest}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t('reaction.fastest')}
            </Text>
          </View>
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 items-center">
            <Text className="text-2xl font-bold text-orange-500 font-mono">
              {slowest}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t('reaction.slowest')}
            </Text>
          </View>
        </View>

        <View className="w-full mb-6">
          {trials.map((trial, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-5 py-3 mb-2"
            >
              <Text className="text-gray-500 dark:text-gray-400">
                {t('reaction.trial', { num: i + 1 })}
              </Text>
              <Text className="text-gray-900 dark:text-white font-bold font-mono">
                {trial.reactionMs} ms
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={startGame}
          className="bg-purple-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
        >
          <RefreshCw stroke="white" size={20} />
          <Text className="text-white text-lg font-semibold">{t('reaction.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
