import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, RefreshCw, Sprout } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { GRID_SIZE, TOTAL_PADS, STARTING_LENGTH, generateSequence, getScore } from '../../../../src/engine/frog';

type ScreenState = 'menu' | 'showing' | 'input' | 'results';

export default function FrogMemoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<ScreenState>('menu');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [highlightPad, setHighlightPad] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const startedRef = useRef(0);

  const startGame = useCallback(() => {
    setLevel(1);
    setMistakes(0);
    setIsSaved(false);
    startedRef.current = Date.now();
    const seq = generateSequence(STARTING_LENGTH);
    setSequence(seq);
    setUserInput([]);
    setHighlightPad(null);
    showSequence(seq);
    feedback.numberInput();
  }, [feedback]);

  const showSequence = useCallback((seq: number[]) => {
    setScreen('showing');
    setUserInput([]);
    let i = 0;
    const show = () => {
      if (i >= seq.length) {
        setHighlightPad(null);
        setTimeout(() => setScreen('input'), 400);
        return;
      }
      setHighlightPad(seq[i]);
      setTimeout(() => {
        setHighlightPad(null);
        i++;
        setTimeout(show, 300);
      }, 600);
    };
    setTimeout(show, 500);
  }, []);

  const handlePadTap = useCallback((padIndex: number) => {
    if (screen !== 'input') return;
    feedback.cellTap();
    const newInput = [...userInput, padIndex];
    const step = newInput.length - 1;

    if (padIndex !== sequence[step]) {
      feedback.error();
      setMistakes((m) => m + 1);
      setUserInput([]);
      // Re-show sequence
      setTimeout(() => showSequence(sequence), 800);
      return;
    }

    setUserInput(newInput);

    if (newInput.length >= sequence.length) {
      // Correct! Advance
      feedback.win();
      const nextLevel = level + 1;
      const nextSeq = generateSequence(STARTING_LENGTH + nextLevel - 1);
      setLevel(nextLevel);
      setSequence(nextSeq);
      setTimeout(() => showSequence(nextSeq), 600);
    }
  }, [screen, userInput, sequence, level, feedback, showSequence]);

  const endGame = useCallback(() => {
    setScreen('results');
    feedback.error();
  }, [feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const score = getScore(level, mistakes);
    saveGameResult({
      id: `frog_${Date.now()}`,
      gameType: 'frog',
      difficulty: 'normal',
      startedAt: startedRef.current,
      completedAt: Date.now(),
      durationMs: Date.now() - startedRef.current,
      mistakes,
      hintsUsed: 0,
      score,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ level, mistakes }),
    });
  }, [screen, isSaved]);

  const padRowCol = (idx: number) => ({ row: Math.floor(idx / GRID_SIZE), col: idx % GRID_SIZE });

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('frog.title')}
          </Text>
        </View>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-6 mb-4">
              <Sprout stroke="#059669" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('frog.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('frog.description')}
            </Text>
          </View>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('frog.instructions')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={startGame}
            className="bg-emerald-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('frog.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={endGame} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <View className="flex-row gap-6">
          <Text className="text-emerald-500 font-semibold">
            {t('frog.level')} {level}
          </Text>
          <Text className="text-gray-400">
            {t('frog.length')}: {sequence.length}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {screen === 'showing' && (
          <Text className="text-gray-400 dark:text-gray-500 mb-6 text-lg">
            {t('frog.watch')}
          </Text>
        )}
        {screen === 'input' && (
          <Text className="text-emerald-500 mb-6 text-lg font-medium">
            {t('frog.yourTurn')} ({userInput.length}/{sequence.length})
          </Text>
        )}

        {/* Lily pad grid */}
        <View className="w-full max-w-xs aspect-square mb-8">
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <View key={row} className="flex-row" style={{ height: `${100 / GRID_SIZE}%` }}>
              {Array.from({ length: GRID_SIZE }).map((_, col) => {
                const idx = row * GRID_SIZE + col;
                const isHighlighted = highlightPad === idx;
                const isTapped = userInput.indexOf(idx) >= 0;
                return (
                  <TouchableOpacity
                    key={col}
                    onPress={() => handlePadTap(idx)}
                    activeOpacity={0.7}
                    disabled={screen !== 'input'}
                    className="flex-1 m-1.5 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isHighlighted
                        ? '#34D399'
                        : isTapped
                        ? '#A7F3D0'
                        : '#E5E7EB',
                      borderWidth: 2,
                      borderColor: isHighlighted ? '#059669' : '#D1D5DB',
                    }}
                  >
                    {isHighlighted && (
                      <Text className="text-2xl">🐸</Text>
                    )}
                    {(isTapped && !isHighlighted) && (
                      <Text className="text-sm text-emerald-700 font-bold">✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Results modal */}
      {screen === 'results' && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-10">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full items-center">
            <Text className="text-4xl mb-4">🐸</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('frog.gameOver')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-6">
              {t('frog.reachedLevel', { level })}
            </Text>
            <View className="flex-row gap-6 mb-8">
              <View className="items-center">
                <Text className="text-3xl font-bold text-emerald-500">{level}</Text>
                <Text className="text-xs text-gray-400 mt-1">{t('frog.level')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-amber-500">{getScore(level, mistakes)}</Text>
                <Text className="text-xs text-gray-400 mt-1">{t('frog.score')}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={startGame}
              className="bg-emerald-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
            >
              <RefreshCw stroke="white" size={20} />
              <Text className="text-white text-lg font-semibold">{t('frog.playAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
