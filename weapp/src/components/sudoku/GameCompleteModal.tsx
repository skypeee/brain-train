import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { calculateScore } from '../../engine/sudoku/scoring';
import { GameState, getTargetHoles } from '../../engine/sudoku/types';

interface GameCompleteModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
}

export function GameCompleteModal({ gameState, onPlayAgain }: GameCompleteModalProps) {
  const { t } = useTranslation();
  const isWon = gameState.status === 'won';
  const emptyCells = getTargetHoles(gameState.difficulty);
  const score = calculateScore(
    gameState.difficulty,
    emptyCells,
    gameState.elapsedMs,
    gameState.mistakes,
    gameState.hintsUsed,
    gameState.isDaily
  );

  return (
    <View style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 40px',
    }}>
      <View style={{
        backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '40px 32px',
        width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: isWon ? '#E8F4FE' : '#FEE2E2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 26 }}>{isWon ? '🏆' : '😞'}</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E' }}>
            {isWon ? t('sudoku.complete', '恭喜完成!') : t('sudoku.gameOver', '游戏结束')}
          </Text>
          <Text style={{ fontSize: 18, color: '#64748B', marginTop: 8 }}>
            {t(`sudoku.${gameState.difficulty}`, gameState.difficulty)}
          </Text>
        </View>

        {/* Stats (only for wins) */}
        {isWon && (
          <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <View style={{
              flex: 1, backgroundColor: '#F8FAFC', borderRadius: '14px',
              padding: '20px 12px', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, color: '#229CF8' }}>⏱</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{t('sudoku.time', '用时')}</Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>
                {formatTime(gameState.elapsedMs)}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: '#F8FAFC', borderRadius: '14px',
              padding: '20px 12px', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, color: '#F59E0B' }}>🎯</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{t('sudoku.score', '得分')}</Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>
                {score.total}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: '#F8FAFC', borderRadius: '14px',
              padding: '20px 12px', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, color: '#22C55E' }}>✅</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                {t('sudoku.mistakes', '失误')}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>
                {gameState.mistakes}
              </Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View
          onClick={onPlayAgain}
          style={{
            backgroundColor: '#229CF8', borderRadius: '16px',
            padding: '20px 0', alignItems: 'center', marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>
            {t('sudoku.playAgain', '再来一局')}
          </Text>
        </View>
        <View
          onClick={() => Taro.navigateBack()}
          style={{
            backgroundColor: '#F1F5F9', borderRadius: '16px',
            padding: '20px 0', alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 600, color: '#475569' }}>
            {t('sudoku.backToMenu', '返回菜单')}
          </Text>
        </View>
      </View>
    </View>
  );
}
