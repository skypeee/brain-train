import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

export function useFeedback() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const cellTap = useCallback(() => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hapticsEnabled]);

  const numberInput = useCallback(() => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [hapticsEnabled]);

  const error = useCallback(() => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [hapticsEnabled]);

  const win = useCallback(() => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hapticsEnabled]);

  const hint = useCallback(() => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [hapticsEnabled]);

  return { cellTap, numberInput, error, win, hint, soundEnabled };
}
