import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { GameState } from '../engine/sudoku/types';

const SAVE_KEY = 'sudoku_save';

export function usePersistence() {
  const saveGame = useCallback(async (state: GameState) => {
    try {
      const json = JSON.stringify(state);
      await AsyncStorage.setItem(SAVE_KEY, json);
    } catch (e) {
      // Silently fail - persistence is best-effort
    }
  }, []);

  const loadGame = useCallback(async (): Promise<GameState | null> => {
    try {
      const json = await AsyncStorage.getItem(SAVE_KEY);
      if (!json) return null;
      return JSON.parse(json) as GameState;
    } catch {
      return null;
    }
  }, []);

  const clearSave = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SAVE_KEY);
    } catch {
      // Silently fail
    }
  }, []);

  return { saveGame, loadGame, clearSave };
}
