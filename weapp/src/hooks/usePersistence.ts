import Taro from '@tarojs/taro';
import { GameState } from '../engine/sudoku/types';

const SAVE_KEY = 'sudoku_save';

export function usePersistence() {
  const saveGame = (state: GameState) => {
    try {
      Taro.setStorageSync(SAVE_KEY, JSON.stringify(state));
    } catch (_) {}
  };

  const loadGame = async (): Promise<GameState | null> => {
    try {
      const raw = Taro.getStorageSync(SAVE_KEY);
      if (raw && typeof raw === 'string') {
        return JSON.parse(raw) as GameState;
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  const clearSave = () => {
    try {
      Taro.removeStorageSync(SAVE_KEY);
    } catch (_) {}
  };

  return { saveGame, loadGame, clearSave };
}
