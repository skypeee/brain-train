import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { GRID_SIZE, TOTAL_PADS, STARTING_LENGTH, generateSequence, getScore } from '../../../engine/frog';

definePageConfig({ navigationBarTitleText: '青蛙跳跃' });

type ScreenState = 'menu' | 'showing' | 'input' | 'results';

export default function FrogPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [highlightPad, setHighlightPad] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const startedRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };

  const startGame = useCallback(() => {
    clearTimeouts();
    setLevel(1); setMistakes(0); setIsSaved(false);
    startedRef.current = Date.now();
    const seq = generateSequence(STARTING_LENGTH);
    setSequence(seq); setUserInput([]); setHighlightPad(null);
    showSequence(seq);
    Taro.vibrateShort({ type: 'light' });
  }, []);

  const showSequence = useCallback((seq: number[]) => {
    clearTimeouts();
    setScreen('showing'); setUserInput([]);
    let i = 0;
    const show = () => {
      if (i >= seq.length) { setHighlightPad(null); const t = setTimeout(() => setScreen('input'), 400); timeoutsRef.current.push(t); return; }
      setHighlightPad(seq[i]);
      let t = setTimeout(() => { setHighlightPad(null); i++; t = setTimeout(show, 300); timeoutsRef.current.push(t); }, 600);
      timeoutsRef.current.push(t);
    };
    const t = setTimeout(show, 500); timeoutsRef.current.push(t);
  }, []);

  const handlePadTap = useCallback((padIndex: number) => {
    if (screen !== 'input') return;
    Taro.vibrateShort({ type: 'light' });
    const newInput = [...userInput, padIndex];
    const step = newInput.length - 1;
    if (padIndex !== sequence[step]) {
      Taro.vibrateShort({ type: 'heavy' });
      setMistakes((m) => m + 1); setUserInput([]);
      const t = setTimeout(() => showSequence(sequence), 800); timeoutsRef.current.push(t);
      return;
    }
    setUserInput(newInput);
    if (newInput.length >= sequence.length) {
      Taro.vibrateShort({ type: 'heavy' });
      const nextLevel = level + 1;
      const nextSeq = generateSequence(STARTING_LENGTH + nextLevel - 1);
      setLevel(nextLevel); setSequence(nextSeq);
      const t = setTimeout(() => showSequence(nextSeq), 600); timeoutsRef.current.push(t);
    }
  }, [screen, userInput, sequence, level, showSequence]);

  useEffect(() => { if (screen !== 'results' || isSaved) return; setIsSaved(true);
    const score = getScore(level, mistakes);
    const record = { id: `frog_${Date.now()}`, gameType: 'frog', difficulty: 'normal', startedAt: startedRef.current, completedAt: Date.now(), durationMs: Date.now() - startedRef.current, mistakes, hintsUsed: 0, score, completed: true, isDaily: false, details: JSON.stringify({ level, mistakes }) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  useEffect(() => () => clearTimeouts(), []);

  // === MENU ===
  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name='sprout' size={36} color='#059669' />
        </View>
        <Text style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('frog.title', '青蛙跳跃')}</Text>
        <Text style={{ fontSize: 26, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>{t('frog.description', '记住青蛙跳跃的顺序并复现')}</Text>
        <View onClick={startGame} style={{ backgroundColor: '#059669', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('frog.start', '开始游戏')}</Text>
        </View>
      </View>
    </ScrollView>
  );

  // === PLAYING ===
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', paddingTop: 50 }}>
        <View onClick={() => { clearTimeouts(); setScreen('results'); }} style={{ padding: 8 }}>
          <Text style={{ fontSize: 28, color: '#6B7280' }}>&lt; 结束</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 600, color: '#059669' }}>{t('frog.level', '关卡')} {level}</Text>
          <Text style={{ fontSize: 24, color: '#94A3B8' }}>{t('frog.length', '长度')}: {sequence.length}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        {screen === 'showing' && <Text style={{ fontSize: 26, color: '#94A3B8', marginBottom: 24 }}>{t('frog.watch', '观察跳跃顺序')}</Text>}
        {screen === 'input' && <Text style={{ fontSize: 26, fontWeight: 600, color: '#059669', marginBottom: 24 }}>{t('frog.yourTurn', '轮到你了')} ({userInput.length}/{sequence.length})</Text>}
        <View style={{ width: '100%', aspectRatio: 1, maxWidth: 280, marginBottom: 32 }}>
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <View key={row} style={{ display: 'flex', flexDirection: 'row', height: `${100 / GRID_SIZE}%` }}>
              {Array.from({ length: GRID_SIZE }).map((_, col) => {
                const idx = row * GRID_SIZE + col;
                const isHighlighted = highlightPad === idx;
                const isTapped = userInput.indexOf(idx) >= 0;
                return (
                  <View key={col} onClick={() => handlePadTap(idx)} style={{
                    flex: 1, margin: 4, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isHighlighted ? '#34D399' : isTapped ? '#A7F3D0' : '#E5E7EB',
                    border: `2px solid ${isHighlighted ? '#059669' : '#D1D5DB'}`,
                  }}>
                    {isHighlighted && <Text style={{ fontSize: 32 }}>🐸</Text>}
                    {isTapped && !isHighlighted && <Text style={{ fontSize: 24, color: '#059669', fontWeight: 700 }}>✓</Text>}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
      {screen === 'results' && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: '40px 32px', alignItems: 'center', width: '80%' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🐸</Text>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('frog.gameOver', '游戏结束')}</Text>
            <Text style={{ fontSize: 24, color: '#64748B', marginBottom: 24 }}>{t('frog.reachedLevel', `到达第 ${level} 关`, { level })}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 32 }}>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 40, fontWeight: 700, color: '#059669' }}>{level}</Text><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('frog.level', '关卡')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 40, fontWeight: 700, color: '#F59E0B' }}>{getScore(level, mistakes)}</Text><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('frog.score', '得分')}</Text></View>
            </View>
            <View onClick={startGame} style={{ backgroundColor: '#059669', borderRadius: 16, padding: '20px 40px', width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF' }}>{t('frog.playAgain', '再来一局')}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
