import { Image } from '@tarojs/components';
import tabHome from '../../assets/tab-icons/home.png';
import tabGamepad from '../../assets/tab-icons/gamepad.png';
import tabChart from '../../assets/tab-icons/chart.png';
import tabSettings from '../../assets/tab-icons/settings.png';
import iconGrid from '../../assets/icons/grid.png';
import iconZap from '../../assets/icons/zap.png';
import iconGauge from '../../assets/icons/gauge.png';
import iconClock from '../../assets/icons/clock.png';
import iconPalette from '../../assets/icons/palette.png';
import iconBrain from '../../assets/icons/brain.png';
import iconTimer from '../../assets/icons/timer.png';
import iconWind from '../../assets/icons/wind.png';
import iconSprout from '../../assets/icons/sprout.png';
import iconHeadphones from '../../assets/icons/headphones.png';
import iconChevronRight from '../../assets/icons/chevron-right.png';
import iconPlay from '../../assets/icons/play.png';

const iconFiles: Record<string, string> = {
  'home': tabHome,
  'gamepad': tabGamepad,
  'chart': tabChart,
  'settings': tabSettings,
  'grid': iconGrid,
  'zap': iconZap,
  'gauge': iconGauge,
  'clock': iconClock,
  'palette': iconPalette,
  'brain': iconBrain,
  'timer': iconTimer,
  'wind': iconWind,
  'sprout': iconSprout,
  'headphones': iconHeadphones,
  'chevron-right': iconChevronRight,
  'play': iconPlay,
};

interface IconProps {
  name: keyof typeof iconFiles;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color, className = '' }: IconProps) {
  const src = iconFiles[name];
  if (!src) return null;
  return (
    <Image
      className={className}
      src={src}
      style={{ width: size, height: size }}
      mode='aspectFit'
    />
  );
}
