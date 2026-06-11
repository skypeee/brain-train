import Taro from '@tarojs/taro';
import { useState } from 'react';

interface SafeAreaInfo {
  statusBarHeight: number;
  navHeight: number;
  bottomHeight: number;
}

export function useSafeArea(): SafeAreaInfo {
  const [info] = useState<SafeAreaInfo>(() => {
    try {
      const sys = Taro.getSystemInfoSync();
      const statusBar = sys.statusBarHeight || 20;
      const bottom = (sys.safeArea && sys.screenHeight)
        ? sys.screenHeight - sys.safeArea.bottom
        : 0;
      return {
        statusBarHeight: statusBar,
        navHeight: statusBar + 44,
        bottomHeight: bottom,
      };
    } catch {
      return { statusBarHeight: 20, navHeight: 64, bottomHeight: 0 };
    }
  });
  return info;
}
