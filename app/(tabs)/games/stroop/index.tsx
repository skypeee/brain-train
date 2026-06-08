import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Palette, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { COLORS, TOTAL_TRIALS, generateTrials, getStroopStats, StroopTrial } from '../../../../src/engine/stroop';
import { GameIntro } from '../../../../src/components/games/GameIntro';

export default function StroopScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; reactionMs: number }[]>([]);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const shownRef = useRef(0);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (screen !== 'playing' || trialIndex >= trials.length) return;
    shownRef.current = Date.now();
  }, [screen, trialIndex, trials]);

  const startGame = useCallback(() => {
    const newTrials = generateTrials(TOTAL_TRIALS);
    setTrials(newTrials);
    setTrialIndex(0);
    setResponses([]);
    setLastResult(null);
    setScreen('playing');
    setIsSaved(false);
    startedAtRef.current = Date.now();
    shownRef.current = Date.now();
    feedback.numberInput();
  }, [feedback]);

  const handleColorPick = useCallback((colorName: string) => {
    if (trialIndex >= trials.length) return;
    const trial = trials[trialIndex];
    const reactionMs = Date.now() - shownRef.current;
    const correct = colorName === trial.inkColor.name;

    setResponses((r) => [...r, { correct, reactionMs }]);
    setLastResult(correct ? 'correct' : 'wrong');

    if (correct) feedback.win();
    else feedback.error();

    setTimeout(() => {
      setLastResult(null);
      if (trialIndex + 1 >= trials.length) {
        feedback.win();
        setScreen('results');
      } else {
        setTrialIndex((i) => i + 1);
      }
    }, correct ? 400 : 600);
  }, [trialIndex, trials, feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const stats = getStroopStats(trials, responses);
    saveGameResult({
      id: `stroop_${Date.now()}`,
      gameType: 'stroop',
      difficulty: 'normal',
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      durationMs: Date.now() - startedAtRef.current,
      mistakes: responses.filter((r) => !r.correct).length,
      hintsUsed: 0,
      score: stats.accuracy * 100 + stats.avgReaction,
      completed: true,
      isDaily: false,
      details: JSON.stringify(stats),
    });
  }, [screen, isSaved]);

  const trial = trials[trialIndex];

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('stroop.title')}
          </Text>
        </View>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-6 mb-4">
              <Palette stroke="#F97316" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('stroop.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('stroop.description')}
            </Text>
          </View>
          <GameIntro i18nKey="stroop" color="#F97316" />
          <TouchableOpacity
            onPress={startGame}
            className="bg-orange-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('stroop.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  if (screen === 'playing' && trial) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => setScreen('menu')} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-sm text-gray-400">
            {trialIndex + 1} / {trials.length}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          {/* Color word display */}
          <View className="mb-16">
            <Text
              className="text-5xl font-bold"
              style={{ color: trial.inkColor.hex }}
            >
              {trial.wordLabel}
            </Text>
          </View>

          {/* Feedback overlay */}
          {lastResult && (
            <View className="absolute top-1/3 left-0 right-0 items-center">
              <Text
                className={`text-3xl font-bold ${
                  lastResult === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {lastResult === 'correct' ? '✓' : '✗'}
              </Text>
            </View>
          )}

          {/* Color buttons */}
          <View className="flex-row flex-wrap justify-center gap-3">
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.name}
                onPress={() => handleColorPick(color.name)}
                className="w-[42%] py-4 rounded-xl items-center active:opacity-70"
                style={{ backgroundColor: color.hex }}
              >
                <Text className="text-white font-bold text-lg">
                  {color.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // === RESULTS ===
  const stats = responses.length > 0 ? getStroopStats(trials, responses) : { accuracy: 0, avgReaction: 0, incongruentAvg: 0 };
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('stroop.results')}
        </Text>
      </View>
      <View className="flex-1 px-6 justify-center items-center">
        <View className="flex-row gap-6 mb-10">
          <View className="items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 flex-1">
            <Text className="text-3xl font-bold text-orange-500">{stats.accuracy}%</Text>
            <Text className="text-gray-400 text-sm mt-1">{t('stroop.accuracy')}</Text>
          </View>
          <View className="items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 flex-1">
            <Text className="text-3xl font-bold text-blue-500 font-mono">{stats.avgReaction}</Text>
            <Text className="text-gray-400 text-sm mt-1">{t('stroop.avgReaction')}ms</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={startGame}
          className="bg-orange-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
        >
          <RefreshCw stroke="white" size={20} />
          <Text className="text-white text-lg font-semibold">{t('stroop.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
