import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';

definePageConfig({
  navigationBarTitleText: '数独',
});

const SAVE_KEY = 'sudoku_save';

const DIFFICULTIES = [
  { id: 'easy',   name: '简单', desc: '约30个空格', color: '#22C55E' },
  { id: 'medium', name: '中等', desc: '约40个空格', color: '#F59E0B' },
  { id: 'hard',   name: '困难', desc: '约50个空格', color: '#EF4444' },
  { id: 'expert', name: '专家', desc: '约55个空格', color: '#8B5CF6' },
];

export default function SudokuMenuPage() {
  const { t } = useTranslation();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [savedDifficulty, setSavedDifficulty] = useState('');

  useEffect(() => {
    try {
      const raw = Taro.getStorageSync(SAVE_KEY);
      if (raw && typeof raw === 'string') {
        const state = JSON.parse(raw);
        if (state.board) {
          setHasSavedGame(true);
          const d = state.difficulty || '';
          setSavedDifficulty(d.charAt(0).toUpperCase() + d.slice(1));
        }
      }
    } catch (_) {}
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px' }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 8, wordBreak: 'break-all'}}>
          {t('sudoku.title', '数独')}
        </Text>
        <Text style={{ fontSize: 18, color: '#64748B', marginBottom: 40, wordBreak: 'break-all'}}>
          {t('sudoku.chooseDifficulty', '选择难度等级')}
        </Text>

        {/* Continue game */}
        {hasSavedGame && (
          <View
            style={{
              backgroundColor: '#E8F4FE',
              borderRadius: '16px',
              padding: '28px 24px',
              marginBottom: 32,
              border: '1px solid #BAE6FD',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/games/sudoku/play' })}
          >
            <View style={{
              width: 56, height: 56, borderRadius: '14px',
              backgroundColor: '#229CF8', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginRight: 20,
            }}>
              <Icon name='play' size={24} color='#FFFFFF' />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 600, color: '#1A7ACC', wordBreak: 'break-all'}}>
                {t('sudoku.continueGame', '继续游戏')}
              </Text>
              <Text style={{ fontSize: 16, color: '#229CF8', marginTop: 4, wordBreak: 'break-all'}}>
                {savedDifficulty} · {t('sudoku.continueDescription', '恢复上次保存的谜题')}
              </Text>
            </View>
            <Icon name='chevron-right' size={20} color='#229CF8' />
          </View>
        )}

        {/* Game intro */}
        <View style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px',
          padding: '24px 28px', marginBottom: 32,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <Text style={{ fontSize: 18, color: '#64748B', lineHeight: 1.6, wordBreak: 'break-all'}}>
            {t('sudoku.goal', '训练逻辑推理、模式识别和持续注意力。')}
          </Text>
          <View style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8EDF2' }}>
            <Text style={{ fontSize: 16, color: '#94A3B8', fontStyle: 'italic', wordBreak: 'break-all'}}>
              💡 {t('sudoku.tip', '先找唯一候选和明显宫格，不要急着猜数。')}
            </Text>
          </View>
        </View>

        {/* New game section */}
        <Text style={{
          fontSize: 16, fontWeight: 600, color: '#94A3B8',
          marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px', wordBreak: 'break-all'}}>
          {t('sudoku.newGame', '新游戏')}
        </Text>

        {DIFFICULTIES.map((d) => (
          <View
            key={d.id}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: '16px',
              padding: '28px 24px', marginBottom: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'row', alignItems: 'center',
            }}
            onClick={() => Taro.navigateTo({
              url: `/pages/games/sudoku/play?difficulty=${d.id}`,
            })}
          >
            <View style={{
              width: 56, height: 56, borderRadius: '14px',
              backgroundColor: `${d.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: 20,
            }}>
              <Icon name='play' size={24} color={d.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 600, color: '#1A1A2E', wordBreak: 'break-all'}}>
                {d.name}
              </Text>
              <Text style={{ fontSize: 16, color: '#64748B', marginTop: 4, wordBreak: 'break-all'}}>
                {d.desc}
              </Text>
            </View>
            <Icon name='chevron-right' size={20} color='#94A3B8' />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
