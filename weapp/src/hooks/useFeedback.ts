import Taro from '@tarojs/taro';

// Haptic feedback hook for Taro / WeChat Mini Program
export function useFeedback() {
  const cellTap = () => Taro.vibrateShort({ type: 'light' });
  const numberInput = () => Taro.vibrateShort({ type: 'light' });
  const hint = () => Taro.vibrateShort({ type: 'medium' });
  const error = () => Taro.vibrateShort({ type: 'heavy' });
  const win = () => {
    Taro.vibrateShort({ type: 'heavy' });
    // In WeChat, we can't chain vibrate easily, so one strong buzz is enough
  };

  return { cellTap, numberInput, hint, error, win };
}
