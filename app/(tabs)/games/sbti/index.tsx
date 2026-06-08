import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { QUESTIONS, calculateResult, SBTIResult } from '../../../../src/engine/sbti';
import { GameIntro } from '../../../../src/components/games/GameIntro';

const AGREE_OPTIONS = [
  { key: 'stronglyAgree', value: 5 },
  { key: 'agree', value: 4 },
  { key: 'neutral', value: 3 },
  { key: 'disagree', value: 2 },
  { key: 'stronglyDisagree', value: 1 },
] as const;

export default function SBTIScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<'menu' | 'quiz' | 'results'>('menu');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<{ type: SBTIResult; scores: any } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const startedRef = useRef(0);

  const startQuiz = useCallback(() => {
    setScreen('quiz');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setIsSaved(false);
    startedRef.current = Date.now();
    feedback.numberInput();
  }, [feedback]);

  const handleAnswer = useCallback((value: number) => {
    const q = QUESTIONS[currentQ];
    // 4 or 5 = agree (true), 1 or 2 = disagree (false)
    const isAgree = value >= 4;
    const newAnswers = { ...answers, [q.id]: isAgree };
    setAnswers(newAnswers);
    feedback.cellTap();

    if (currentQ + 1 >= QUESTIONS.length) {
      const res = calculateResult(newAnswers);
      setResult(res);
      setScreen('results');
      feedback.win();
    } else {
      setCurrentQ((i) => i + 1);
    }
  }, [currentQ, answers, feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved || !result) return;
    setIsSaved(true);
    saveGameResult({
      id: `sbti_${Date.now()}`,
      gameType: 'sbti',
      difficulty: 'normal',
      startedAt: startedRef.current,
      completedAt: Date.now(),
      durationMs: Date.now() - startedRef.current,
      mistakes: 0,
      hintsUsed: 0,
      score: Object.values(result.scores).reduce(
        (s: number, d: any) => s + d.percentage, 0
      ),
      completed: true,
      isDaily: false,
      details: JSON.stringify({ type: result.type, scores: result.scores }),
    });
  }, [screen, isSaved, result]);

  const question = QUESTIONS[currentQ];
  const progress = QUESTIONS.length > 0 ? (currentQ / QUESTIONS.length) * 100 : 0;

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('sbti.title')}
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full p-6 mb-4">
              <Sparkles stroke="#EC4899" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('sbti.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('sbti.description')}
            </Text>
          </View>

          <GameIntro i18nKey="sbti" color="#EC4899" />

          <TouchableOpacity
            onPress={startQuiz}
            className="bg-pink-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('sbti.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === QUIZ ===
  if (screen === 'quiz' && question) {
    const dimLabels: Record<string, string> = {
      EI: 'E/I',
      SN: 'S/N',
      TF: 'T/F',
      JP: 'J/P',
    };
    const questionText = t(question.text);

    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => setScreen('menu')} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              {dimLabels[question.dimension]}
            </Text>
          </View>
          <Text className="text-sm text-gray-400 dark:text-gray-500 px-2">
            {currentQ + 1}/{QUESTIONS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="h-1 bg-gray-200 dark:bg-gray-700 mx-6 rounded-full overflow-hidden">
          <View
            className="h-full bg-pink-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        <ScrollView className="flex-1 px-6" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-10 leading-7">
            {questionText}
          </Text>

          <View className="gap-3">
            {AGREE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleAnswer(option.value)}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl py-4 px-5 active:opacity-70 active:bg-pink-100 dark:active:bg-pink-900/20"
              >
                <Text className="text-gray-800 dark:text-gray-200 text-center font-medium">
                  {t(`sbti.${option.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // === RESULTS ===
  if (!result) return null;
  const dims = [
    { key: 'EI', left: 'E', right: 'I' },
    { key: 'SN', left: 'S', right: 'N' },
    { key: 'TF', left: 'T', right: 'F' },
    { key: 'JP', left: 'J', right: 'P' },
  ] as const;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
          {t('sbti.results')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Type badge */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-5xl font-bold text-pink-500 tracking-widest mb-3">
            {result.type}
          </Text>
          <Text className="text-gray-900 dark:text-white text-xl font-semibold mb-2">
            {t(`sbti.types.${result.type.toLowerCase()}.title`)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
            {t(`sbti.types.${result.type.toLowerCase()}.desc`)}
          </Text>
        </View>

        {/* Dimension bars */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            {t('sbti.dimensionBreakdown')}
          </Text>
          {dims.map((dim) => {
            const score = result.scores[dim.key];
            const pct = score.percentage;
            return (
              <View key={dim.key} className="mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">{dim.left}</Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">{dim.right}</Text>
                </View>
                <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 50 ? '#229CF8' : '#EC4899',
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-400">{pct}%</Text>
                  <Text className="text-xs text-gray-400">{100 - pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Restart */}
        <TouchableOpacity
          onPress={startQuiz}
          className="bg-pink-500 rounded-2xl py-4 items-center flex-row justify-center gap-2 mb-10"
        >
          <RefreshCw stroke="white" size={20} />
          <Text className="text-white text-lg font-semibold">{t('sbti.retake')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
