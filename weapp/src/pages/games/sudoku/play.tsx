import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeArea } from '../../../hooks/useSafeArea';
import { SudokuBoard } from '../../../components/sudoku/SudokuBoard';
import { NumberPad } from '../../../components/sudoku/NumberPad';
import { GameControls } from '../../../components/sudoku/GameControls';
import { GameCompleteModal } from '../../../components/sudoku/GameCompleteModal';
import { useSudokuGame } from '../../../hooks/useSudokuGame';
import { useFeedback } from '../../../hooks/useFeedback';
import { useSettingsStore } from '../../../stores/settingsStore';
import { calculateScore } from '../../../engine/sudoku/scoring';
import { MAX_MISTAKES, getTargetHoles } from '../../../engine/sudoku/types';
import { Icon } from '../../../components/ui';

definePageConfig({
  navigationBarTitleText: '数独',
  navigationStyle: 'custom',
  disableScroll: true,
});

export default function SudokuPlayPage() {
  const { t } = useTranslation();
  const { navHeight, statusBarHeight } = useSafeArea();
  const feedback = useFeedback();
  const validationMode = useSettingsStore((s) => s.validationMode);

  // Parse query params from router
  const params = (() => {
    try {
      const pages = Taro.getCurrentPages();
      const current = pages[pages.length - 1] as any;
      return current?.options || {};
    } catch {
      return {};
    }
  })();

  const diffParam = (params as any)?.difficulty;
  const isDaily = (params as any)?.daily === 'true';

  const { store, handleCellPress, reset, ready } = useSudokuGame(diffParam, isDaily);
  const prevMistakes = useRef(store.mistakes);
  const prevStatus = useRef(store.status);
  const savedRef = useRef(false);

  // Haptics on mistakes
  useEffect(() => {
    if (store.mistakes > prevMistakes.current) feedback.error();
    prevMistakes.current = store.mistakes;
  }, [store.mistakes]);

  // Haptics on win
  useEffect(() => {
    if (store.status === 'won' && prevStatus.current !== 'won') feedback.win();
    prevStatus.current = store.status;
  }, [store.status]);

  // Save game result on finish
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
      gameType: 'sudoku',
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
    try {
      const { saveGameRecord, updateStreak } = require('../../../../utils/storage');
      saveGameRecord(record);
      if (record.completed) updateStreak(true);
    } catch (_) {}
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
    ? t('sudoku.dailyChallenge', '每日挑战')
    : store.difficulty
      ? t(`sudoku.${store.difficulty}`, store.difficulty)
      : t('sudoku.title', '数独');

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Custom nav bar */}
      <View style={{
        height: navHeight, paddingTop: statusBarHeight,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 20,
        backgroundColor: '#1A1A2E',
      }}>
        <View onClick={() => setTimeout(() => Taro.navigateBack(), 50)} style={{ padding: 8 }}>
          <Icon name='chevron-right' size={24} color='#FFFFFF' />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>
          {difficultyLabel}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Board - centered */}
      <ScrollView
        style={{ flex: 1 }}
        scrollY
        enableFlex
      >
        <View style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 0 40px',
        }}>
          <View style={{ marginBottom: 20 }}>
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

          <View style={{ width: '100%', paddingHorizontal: 32 }}>
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

          <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 8 }}>
            <NumberPad
              board={store.board}
              isNoteMode={store.isNoteMode}
              onNumberPress={onNumberPress}
              onDelete={() => store.deleteCell()}
            />
          </View>
        </View>
      </ScrollView>

      {/* Pause overlay */}
      {store.status === 'paused' && (
        <View style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '48px 40px',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 32 }}>
              {t('sudoku.paused', '游戏暂停')}
            </Text>
            <View
              onClick={() => store.resumeGame()}
              style={{
                backgroundColor: '#229CF8', borderRadius: '16px', padding: '20px 60px', marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>
                {t('sudoku.resume', '继续游戏')}
              </Text>
            </View>
            <View
              onClick={() => setTimeout(() => Taro.navigateBack(), 50)}
              style={{
                backgroundColor: '#F1F5F9', borderRadius: '16px', padding: '20px 60px',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 600, color: '#475569' }}>
                {t('sudoku.quit', '退出')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Win/Loss overlay */}
      {isFinished && (
        <GameCompleteModal gameState={store} onPlayAgain={handlePlayAgain} />
      )}
    </View>
  );
}
