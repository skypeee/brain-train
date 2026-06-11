import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { GRID_SIZE, TOTAL_CELLS, generateGrid, getScore } from '../../../engine/schulte';

definePageConfig({ navigationBarTitleText: '舒尔特方格', navigationStyle: 'custom' });

export default function SchultePage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [grid, setGrid] = useState(() => generateGrid());
  const [nextTarget, setNextTarget] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const startRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (screen !== 'playing') return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => setElapsedMs(Date.now() - startRef.current), 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [screen]);

  const startGame = useCallback(() => {
    setGrid(generateGrid()); setNextTarget(1); setMistakes(0); setElapsedMs(0);
    setScreen('playing'); setIsSaved(false); startedAtRef.current = Date.now();
    Taro.vibrateShort({ type: 'light' });
  }, []);

  const handleCellTap = useCallback((row: number, col: number) => {
    const cell = grid[row][col]; if (cell.tapped) return;
    if (cell.value === nextTarget) {
      Taro.vibrateShort({ type: 'light' });
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].tapped = true; setGrid(newGrid);
      if (nextTarget >= TOTAL_CELLS) { Taro.vibrateShort({ type: 'heavy' }); setScreen('results'); }
      else setNextTarget((n) => n + 1);
    } else { Taro.vibrateShort({ type: 'heavy' }); setMistakes((m) => m + 1); }
  }, [grid, nextTarget]);

  useEffect(() => { if (screen !== 'results' || isSaved) return; setIsSaved(true);
    const score = getScore(elapsedMs, mistakes);
    const record = { id: `schulte_${Date.now()}`, gameType: 'schulte', difficulty: '5x5', startedAt: startedAtRef.current, completedAt: Date.now(), durationMs: elapsedMs, mistakes, hintsUsed: 0, score, completed: true, isDaily: false, details: JSON.stringify({ time: elapsedMs, mistakes }) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  const displayTime = (elapsedMs / 1000).toFixed(1);

  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='grid' size={36} color='#10B981' /></View>
        <Text style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('schulte.title', '舒尔特方格')}</Text>
        <Text style={{ fontSize: 26, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>{t('schulte.description', '按顺序依次点击1-25')}</Text>
        <View onClick={startGame} style={{ backgroundColor: '#10B981', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}><Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('schulte.start', '开始')}</Text></View>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', paddingTop: 50 }}>
        <View onClick={() => setScreen('menu')} style={{ padding: 8 }}><Text style={{ fontSize: 28, color: '#6B7280' }}>&lt; 返回</Text></View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.time', '时间')}</Text><Text style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: '#1A1A2E' }}>{displayTime}s</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.target', '目标')}</Text><Text style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: '#10B981' }}>{nextTarget <= TOTAL_CELLS ? nextTarget : '✓'}</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.mistakes', '失误')}</Text><Text style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: '#EF4444' }}>{mistakes}</Text></View>
        </View>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <View style={{ width: '100%', aspectRatio: 1, maxWidth: 340 }}>
          {grid.map((row, ri) => (
            <View key={ri} style={{ display: 'flex', flexDirection: 'row', height: `${100 / GRID_SIZE}%` }}>
              {row.map((cell, ci) => (
                <View key={`${ri}-${ci}`} onClick={() => handleCellTap(ri, ci)} style={{
                  flex: 1, margin: 2, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: cell.tapped ? '#D1FAE5' : cell.value === nextTarget ? '#EFF6FF' : '#F1F5F9',
                  border: cell.value === nextTarget && !cell.tapped ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                }}>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: cell.tapped ? '#10B981' : cell.value === nextTarget ? '#3B82F6' : '#475569' }}>
                    {cell.tapped ? '✓' : cell.value}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
      {screen === 'results' && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: '40px 32px', alignItems: 'center', width: '80%' }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2E', marginBottom: 24 }}>{t('schulte.complete', '完成!')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 32 }}>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 36, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>{displayTime}s</Text><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.time', '时间')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 36, fontWeight: 700, color: '#EF4444', fontFamily: 'monospace' }}>{mistakes}</Text><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.mistakes', '失误')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 36, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}>{getScore(elapsedMs, mistakes)}</Text><Text style={{ fontSize: 20, color: '#94A3B8' }}>{t('schulte.score', '得分')}</Text></View>
            </View>
            <View onClick={startGame} style={{ backgroundColor: '#10B981', borderRadius: 16, padding: '20px 40px', width: '100%', alignItems: 'center' }}><Text style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF' }}>{t('schulte.playAgain', '再来一局')}</Text></View>
          </View>
        </View>
      )}
    </View>
  );
}
