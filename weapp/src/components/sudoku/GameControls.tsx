import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';

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

function ControlBtn({ label, active, onTap, variant = 'default' }: {
  label: string;
  active?: boolean;
  onTap: () => void;
  variant?: 'default' | 'primary';
}) {
  return (
    <View
      onClick={onTap}
      style={{
        padding: '10px 18px',
        borderRadius: '14px',
        backgroundColor: active ? '#229CF8' : (variant === 'primary' ? '#22C55E' : '#F1F5F9'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{
        fontSize: 24, fontWeight: 500,
        color: active || variant === 'primary' ? '#FFFFFF' : '#475569',
      }}>
        {label}
      </Text>
    </View>
  );
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
      {/* Timer + Mistake dots */}
      <View style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
      }}>
        <Text style={{
          fontSize: 44, fontWeight: 700, color: '#1A1A2E',
          fontFamily: 'monospace', letterSpacing: '2px',
        }}>
          {formatTime(elapsedMs)}
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          {Array.from({ length: maxMistakes }, (_, i) => (
            <View
              key={i}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                backgroundColor: i < mistakes ? '#EF4444' : '#E2E8F0',
              }}
            />
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        <ControlBtn
          label={t('sudoku.notes', '笔记')}
          active={isNoteMode}
          onTap={onToggleNotes}
        />
        <ControlBtn label={t('sudoku.erase', '擦除')} onTap={onErase} />
        <ControlBtn
          label={`${t('sudoku.hint', '提示')} (${Math.max(0, 3 - hintsUsed)})`}
          onTap={onHint}
        />
        {isPaused ? (
          <ControlBtn label={t('sudoku.resume', '继续')} onTap={onResume} variant='primary' />
        ) : (
          <ControlBtn label={t('sudoku.pause', '暂停')} onTap={onPause} />
        )}
      </View>
    </View>
  );
}
