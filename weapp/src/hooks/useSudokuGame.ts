import { useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useTimer } from './useTimer';
import { usePersistence } from './usePersistence';
import { Difficulty } from '../engine/sudoku/types';

export function useSudokuGame(difficulty?: string, isDaily?: boolean) {
  const store = useGameStore();
  const { saveGame, loadGame, clearSave } = usePersistence();
  const isRunning = store.status === 'playing';
  const { elapsed, reset, setElapsed } = useTimer(isRunning);
  const [ready, setReady] = useState(false);

  // Sync timer to store
  useEffect(() => {
    store.updateElapsed(elapsed);
  }, [elapsed]);

  // Start new game on mount if difficulty specified
  useEffect(() => {
    if (difficulty && ['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
      store.startNewGame(difficulty as Difficulty, isDaily);
      reset();
      clearSave();
      setReady(true);
    }
  }, []);

  // Auto-save (debounced)
  useEffect(() => {
    if (store.status !== 'playing' && store.status !== 'paused') return;
    const timer = setTimeout(() => saveGame(store), 2000);
    return () => clearTimeout(timer);
  }, [store.board, store.status, store.elapsedMs, store.mistakes]);

  // Load saved game if no difficulty specified
  useEffect(() => {
    if (difficulty) return;
    loadGame().then((saved) => {
      if (saved && saved.board) {
        store.loadGameState(saved);
        setElapsed(saved.elapsedMs || 0);
      }
      setReady(true);
    });
  }, []);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      store.selectCell(row, col);
    },
    []
  );

  return {
    store,
    handleCellPress,
    reset,
    ready,
  };
}
