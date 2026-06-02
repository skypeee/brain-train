import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { SudokuBoard } from '../../../../src/components/sudoku/SudokuBoard';
import { NumberPad } from '../../../../src/components/sudoku/NumberPad';
import { GameControls } from '../../../../src/components/sudoku/GameControls';
import { GameCompleteModal } from '../../../../src/components/sudoku/GameCompleteModal';
import { BoardSkeleton } from '../../../../src/components/ui/Skeleton';
import { useSudokuGame } from '../../../../src/hooks/useSudokuGame';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { useSettingsStore } from '../../../../src/stores/settingsStore';
import { calculateScore } from '../../../../src/engine/sudoku/scoring';
import { MAX_MISTAKES, getTargetHoles } from '../../../../src/engine/sudoku/types';

export default function SudokuPlayScreen() {
  const { t } = useTranslation();
  const { difficulty, daily } = useLocalSearchParams<{
    difficulty?: string;
    daily?: string;
  }>();

  const isDaily = daily === 'true';
  const { store, handleCellPress, reset, ready } = useSudokuGame(difficulty, isDaily);
  const feedback = useFeedback();
  const validationMode = useSettingsStore((s) => s.validationMode);
  const { saveGameResult, saveDailyChallenge } = useStats();
  const prevMistakes = useRef(store.mistakes);
  const prevStatus = useRef(store.status);
  const savedRef = useRef(false);

  useEffect(() => {
    if (store.mistakes > prevMistakes.current) {
      feedback.error();
    }
    prevMistakes.current = store.mistakes;
  }, [store.mistakes]);

  useEffect(() => {
    if (store.status === 'won' && prevStatus.current !== 'won') {
      feedback.win();
    }
    prevStatus.current = store.status;
  }, [store.status]);

  useEffect(() => {
    if ((store.status === 'won' || store.status === 'lost') && !savedRef.current) {
      savedRef.current = true;
      const now = Date.now();
      const score = calculateScore(
        store.difficulty,
        getTargetHoles(store.difficulty),
        store.elapsedMs,
        store.mistakes,
        store.hintsUsed,
        store.isDaily
      );
      const record = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        difficulty: store.difficulty,
        startedAt: store.startedAt || now,
        completedAt: now,
        durationMs: store.elapsedMs,
        mistakes: store.mistakes,
        hintsUsed: store.hintsUsed,
        score: score.total,
        completed: store.status === 'won',
        isDaily: store.isDaily,
      };
      saveGameResult(record);

      if (store.isDaily) {
        const today = new Date().toISOString().split('T')[0];
        saveDailyChallenge({
          id: `daily-${today}`,
          date: today,
          startedAt: store.startedAt || now,
          completedAt: now,
          durationMs: store.elapsedMs,
          mistakes: store.mistakes,
          hintsUsed: store.hintsUsed,
          score: score.total,
          completed: store.status === 'won',
        });
      }
    }
    if (store.status !== 'won' && store.status !== 'lost') {
      savedRef.current = false;
    }
  }, [store.status]);

  const isFinished = store.status === 'won' || store.status === 'lost';

  const handlePlayAgain = () => {
    savedRef.current = false;
    store.startNewGame(store.difficulty, store.isDaily);
    reset();
  };

  const onCellPress = (row: number, col: number) => {
    feedback.cellTap();
    handleCellPress(row, col);
  };

  const onNumberPress = (num: number) => {
    feedback.numberInput();
    store.inputNumber(num);
  };

  const onHint = () => {
    feedback.hint();
    store.useHint();
  };

  const difficultyLabel = isDaily
    ? t('sudoku.dailyChallenge')
    : store.difficulty
      ? t(`sudoku.${store.difficulty}`)
      : t('sudoku.title');

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2" accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {difficultyLabel}
        </Text>
        <View className="w-8" />
      </View>

      {!ready ? (
        <View className="items-center justify-center flex-1">
          <BoardSkeleton />
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-4 mb-4">
              <SudokuBoard
                board={store.board}
                initialBoard={store.initialBoard}
                solvedBoard={store.solvedBoard}
                selectedCell={store.selectedCell}
                notes={store.notes}
                onCellPress={onCellPress}
                validationMode={validationMode}
              />
            </View>

            <View className="px-4 w-full">
              <GameControls
                elapsedMs={store.elapsedMs}
                mistakes={store.mistakes}
                maxMistakes={MAX_MISTAKES}
                hintsUsed={store.hintsUsed}
                isNoteMode={store.isNoteMode}
                isPaused={store.status === 'paused'}
                gameStatus={store.status}
                onToggleNotes={() => store.toggleNoteMode()}
                onErase={() => store.deleteCell()}
                onHint={onHint}
                onPause={() => store.pauseGame()}
                onResume={() => store.resumeGame()}
              />
            </View>

            <View className="px-4 w-full mt-2">
              <NumberPad
                board={store.board}
                isNoteMode={store.isNoteMode}
                onNumberPress={onNumberPress}
                onDelete={() => store.deleteCell()}
              />
            </View>
          </ScrollView>

          {store.status === 'paused' && (
            <View className="absolute inset-0 bg-black/60 items-center justify-center z-40">
              <View className="bg-white dark:bg-gray-900 rounded-3xl p-8 items-center">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('sudoku.paused')}
                </Text>
                <TouchableOpacity
                  className="bg-brand-500 rounded-2xl px-10 py-4 mb-3"
                  onPress={() => store.resumeGame()}
                  accessibilityLabel="Resume game"
                  accessibilityRole="button"
                >
                  <Text className="text-white font-semibold text-lg">{t('sudoku.resume')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-10 py-4"
                  onPress={() => router.back()}
                  accessibilityLabel="Quit game"
                  accessibilityRole="button"
                >
                  <Text className="text-gray-600 dark:text-gray-400 font-semibold">{t('sudoku.quit')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isFinished && (
            <GameCompleteModal gameState={store} onPlayAgain={handlePlayAgain} />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
