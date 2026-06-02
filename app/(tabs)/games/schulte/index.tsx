import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Grid3X3, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { GRID_SIZE, TOTAL_CELLS, generateGrid, getScore } from '../../../../src/engine/schulte';

export default function SchulteScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [grid, setGrid] = useState(() => generateGrid());
  const [nextTarget, setNextTarget] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef<number>(0);
  const startedAtRef = useRef(0);

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
    setGrid(generateGrid());
    setNextTarget(1);
    setMistakes(0);
    setElapsedMs(0);
    setScreen('playing');
    setIsSaved(false);
    startedAtRef.current = Date.now();
    feedback.numberInput();
  }, [feedback]);

  const handleCellTap = useCallback((row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.tapped) return;

    if (cell.value === nextTarget) {
      feedback.cellTap();
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].tapped = true;
      setGrid(newGrid);

      if (nextTarget >= TOTAL_CELLS) {
        feedback.win();
        setScreen('results');
      } else {
        setNextTarget((n) => n + 1);
      }
    } else {
      feedback.error();
      setMistakes((m) => m + 1);
    }
  }, [grid, nextTarget, feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const score = getScore(elapsedMs, mistakes);
    saveGameResult({
      id: `schulte_${Date.now()}`,
      gameType: 'schulte',
      difficulty: '5x5',
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      durationMs: elapsedMs,
      mistakes,
      hintsUsed: 0,
      score,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ time: elapsedMs, mistakes, penaltyPerMistake: 2000 }),
    });
  }, [screen, isSaved]);

  const displayTime = (elapsedMs / 1000).toFixed(1);

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('schulte.title')}
          </Text>
        </View>

        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 mb-4">
              <Grid3X3 stroke="#10B981" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('schulte.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('schulte.description')}
            </Text>
          </View>

          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('schulte.instructions')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={startGame}
            className="bg-green-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">{t('schulte.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => setScreen('menu')} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <View className="flex-1 flex-row justify-center gap-6">
          <View className="items-center">
            <Text className="text-xs text-gray-400 dark:text-gray-500">{t('schulte.time')}</Text>
            <Text className="text-gray-900 dark:text-white font-mono font-bold text-lg">
              {displayTime}s
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400 dark:text-gray-500">{t('schulte.target')}</Text>
            <Text className="text-green-500 font-mono font-bold text-lg">
              {nextTarget <= TOTAL_CELLS ? nextTarget : '✓'}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400 dark:text-gray-500">{t('schulte.mistakes')}</Text>
            <Text className="text-red-500 font-mono font-bold text-lg">
              {mistakes}
            </Text>
          </View>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Grid */}
      <View className="flex-1 items-center justify-center px-4">
        <View className="aspect-square w-full max-w-sm">
          {grid.map((row, ri) => (
            <View key={ri} className="flex-row" style={{ height: `${100 / GRID_SIZE}%` }}>
              {row.map((cell, ci) => (
                <TouchableOpacity
                  key={`${ri}-${ci}`}
                  onPress={() => handleCellTap(ri, ci)}
                  activeOpacity={0.7}
                  className={`flex-1 items-center justify-center m-0.5 rounded-lg ${
                    cell.tapped
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : cell.value === nextTarget
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`text-lg font-bold ${
                      cell.tapped
                        ? 'text-green-500'
                        : cell.value === nextTarget
                        ? 'text-blue-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {cell.tapped ? '✓' : cell.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Results modal */}
      {screen === 'results' && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-10">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('schulte.complete')}
            </Text>
            <View className="flex-row gap-6 mb-8">
              <View className="items-center">
                <Text className="text-3xl font-bold text-green-500 font-mono">
                  {displayTime}s
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{t('schulte.time')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-500 font-mono">
                  {mistakes}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{t('schulte.mistakes')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-500 font-mono">
                  {getScore(elapsedMs, mistakes)}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{t('schulte.score')}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={startGame}
              className="bg-green-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
            >
              <RefreshCw stroke="white" size={20} />
              <Text className="text-white text-lg font-semibold">{t('schulte.playAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
