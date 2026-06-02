import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pencil, Eraser, Lightbulb, Pause, Play } from 'lucide-react-native';
import { IconButton } from '../ui/IconButton';

interface GameControlsProps {
  elapsedMs: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  isNoteMode: boolean;
  isPaused: boolean;
  gameStatus: string;
  onToggleNotes: () => void;
  onErase: () => void;
  onHint: () => void;
  onPause: () => void;
  onResume: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function GameControls({
  elapsedMs,
  mistakes,
  maxMistakes,
  hintsUsed,
  isNoteMode,
  isPaused,
  gameStatus,
  onToggleNotes,
  onErase,
  onHint,
  onPause,
  onResume,
}: GameControlsProps) {
  const { t } = useTranslation();
  const isActive = gameStatus === 'playing' || gameStatus === 'paused';

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
          {formatTime(elapsedMs)}
        </Text>
        <View className="flex-row items-center gap-1">
          {Array.from({ length: maxMistakes }, (_, i) => (
            <View
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < mistakes ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </View>
      </View>

      <View className="flex-row justify-center gap-2 mb-4">
        <IconButton
          onPress={onToggleNotes}
          icon={Pencil}
          label={t('sudoku.notes')}
          active={isNoteMode}
        />
        <IconButton onPress={onErase} icon={Eraser} label={t('sudoku.erase')} />
        <IconButton onPress={onHint} icon={Lightbulb} label={`${t('sudoku.hint')} (${Math.max(0, 3 - hintsUsed)})`} />
        {isPaused ? (
          <IconButton onPress={onResume} icon={Play} label={t('sudoku.resume')} active />
        ) : (
          <IconButton onPress={onPause} icon={Pause} label={t('sudoku.pause')} disabled={!isActive} />
        )}
      </View>
    </View>
  );
}
