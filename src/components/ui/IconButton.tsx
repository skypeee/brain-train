import { TouchableOpacity, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  onPress: () => void;
  icon: LucideIcon;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  size?: number;
  className?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  onPress,
  icon: Icon,
  label,
  active,
  disabled,
  size = 22,
  className = '',
  accessibilityLabel,
}: IconButtonProps) {
  const activeClass = active
    ? 'bg-brand-100 dark:bg-brand-900/50 border border-brand-300 dark:border-brand-700'
    : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      className={`items-center justify-center rounded-xl p-3 ${activeClass} ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      <Icon
        stroke={active ? '#229CF8' : '#6B7280'}
        size={size}
      />
      {label && (
        <Text
          className={`text-xs mt-1 ${active ? 'text-brand-500 font-medium' : 'text-gray-500'}`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
