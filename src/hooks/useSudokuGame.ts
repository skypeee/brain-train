import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
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

  // Start new game on mount
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

  // Keyboard handler for web
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.status === 'won' || store.status === 'lost') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        store.inputNumber(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        store.deleteCell();
      } else if (e.key === 'ArrowUp' && store.selectedCell) {
        store.selectCell(Math.max(0, store.selectedCell.row - 1), store.selectedCell.col);
      } else if (e.key === 'ArrowDown' && store.selectedCell) {
        store.selectCell(Math.min(8, store.selectedCell.row + 1), store.selectedCell.col);
      } else if (e.key === 'ArrowLeft' && store.selectedCell) {
        store.selectCell(store.selectedCell.row, Math.max(0, store.selectedCell.col - 1));
      } else if (e.key === 'ArrowRight' && store.selectedCell) {
        store.selectCell(store.selectedCell.row, Math.min(8, store.selectedCell.col + 1));
      } else if (e.key === 'n') {
        store.toggleNoteMode();
      }
    };
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [store.selectedCell, store.status]);

  // Load saved game
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
