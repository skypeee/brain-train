import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeArea } from '../../../hooks/useSafeArea';
import { Icon } from '../../../components/ui';
import { COLORS, TOTAL_TRIALS, generateTrials, getStroopStats, StroopTrial } from '../../../engine/stroop';

definePageConfig({ navigationBarTitleText: '斯特鲁普测试', navigationStyle: 'custom' });

export default function StroopPage() {
  const { t } = useTranslation();
  const { navHeight } = useSafeArea();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; reactionMs: number }[]>([]);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const shownRef = useRef(0);
  const startedAtRef = useRef(0);

  useEffect(() => { if (screen === 'playing' && trialIndex < trials.length) shownRef.current = Date.now(); }, [screen, trialIndex, trials]);

  const startGame = useCallback(() => {
    const newTrials = generateTrials(TOTAL_TRIALS);
    setTrials(newTrials); setTrialIndex(0); setResponses([]); setLastResult(null);
    setScreen('playing'); setIsSaved(false); startedAtRef.current = Date.now();
    shownRef.current = Date.now(); Taro.vibrateShort({ type: 'light' });
  }, []);

  const handleColorPick = useCallback((colorName: string) => {
    if (trialIndex >= trials.length) return;
    const trial = trials[trialIndex];
    const reactionMs = Date.now() - shownRef.current;
    const correct = colorName === trial.inkColor.name;
    setResponses((r) => [...r, { correct, reactionMs }]); setLastResult(correct ? 'correct' : 'wrong');
    Taro.vibrateShort({ type: correct ? 'medium' : 'heavy' });
    const t = setTimeout(() => {
      setLastResult(null);
      if (trialIndex + 1 >= trials.length) { setScreen('results'); }
      else setTrialIndex((i) => i + 1);
    }, correct ? 400 : 600);
  }, [trialIndex, trials]);

  useEffect(() => { if (screen !== 'results' || isSaved) return; setIsSaved(true);
    const stats = getStroopStats(trials, responses);
    const record = { id: `stroop_${Date.now()}`, gameType: 'stroop', difficulty: 'normal', startedAt: startedAtRef.current, completedAt: Date.now(), durationMs: Date.now() - startedAtRef.current, mistakes: responses.filter((r) => !r.correct).length, hintsUsed: 0, score: stats.accuracy * 100 + stats.avgReaction, completed: true, isDaily: false, details: JSON.stringify(stats) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  const trial = trials[trialIndex];

  if (screen === 'menu') return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='palette' size={36} color='#F97316' /></View>
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('stroop.title', '斯特鲁普测试')}</Text>
        <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>{t('stroop.description', '忽略词义，选择文字的颜色')}</Text>
        <View onClick={startGame} style={{ backgroundColor: '#F97316', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}><Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>{t('stroop.start', '开始测试')}</Text></View>
      </View>
    </View>
  );

  if (screen === 'playing' && trial) return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', paddingTop: navHeight }}>
        <View onClick={() => setScreen('menu')} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: '#6B7280' }}>&lt; 返回</Text></View>
        <Text style={{ fontSize: 16, color: '#94A3B8' }}>{trialIndex + 1} / {trials.length}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <Text style={{ fontSize: 64, fontWeight: 700, color: trial.inkColor.hex, marginBottom: 80 }}>{trial.wordLabel}</Text>
        {lastResult && (
          <View style={{ position: 'absolute', top: '30%', left: 0, right: 0, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 700, color: lastResult === 'correct' ? '#10B981' : '#EF4444' }}>{lastResult === 'correct' ? '✓' : '✗'}</Text>
          </View>
        )}
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {COLORS.map((color) => (
            <View key={color.name} onClick={() => handleColorPick(color.name)} style={{
              width: '42%', padding: '20px 0', borderRadius: 14,
              backgroundColor: color.hex, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>{color.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const stats = responses.length > 0 ? getStroopStats(trials, responses) : { accuracy: 0, avgReaction: 0, incongruentAvg: 0 };
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px 20px', paddingTop: navHeight }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: 8 }}><Icon name='chevron-right' size={24} color='#6B7280' /></View>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#1A1A2E' }}>{t('stroop.results', '结果')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 48, width: '100%' }}>
          <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: '24px 16px', alignItems: 'center' }}><Text style={{ fontSize: 26, fontWeight: 700, color: '#F97316' }}>{stats.accuracy}%</Text><Text style={{ fontSize: 16, color: '#64748B', marginTop: 4 }}>{t('stroop.accuracy', '正确率')}</Text></View>
          <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: '24px 16px', alignItems: 'center' }}><Text style={{ fontSize: 26, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}>{stats.avgReaction}</Text><Text style={{ fontSize: 16, color: '#64748B', marginTop: 4 }}>{t('stroop.avgReaction', '平均反应')}ms</Text></View>
        </View>
        <View onClick={startGame} style={{ backgroundColor: '#F97316', borderRadius: 16, padding: '24px 0', alignItems: 'center', width: '100%' }}><Text style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>{t('stroop.tryAgain', '再来一次')}</Text></View>
      </View>
    </View>
  );
}
