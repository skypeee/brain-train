import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeArea } from '../../../hooks/useSafeArea';
import { Icon } from '../../../components/ui';
import { GRID_SIZE, TRIALS_PER_ROUND, generateTrials, getAccuracy, getNBackLevel, NBackTrial, LETTERS } from '../../../engine/nback';

definePageConfig({ navigationBarTitleText: 'N-Back测试', navigationStyle: 'custom' });

const STIMULUS_MS = 2000;
const PAUSE_MS = 500;

export default function NBackPage() {
  const { t } = useTranslation();
  const { navHeight } = useSafeArea();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [nLevel, setNLevel] = useState(2);
  const [trials, setTrials] = useState<NBackTrial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [responses, setResponses] = useState<{ position: boolean; sound: boolean }[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [posPressed, setPosPressed] = useState(false);
  const [soundPressed, setSoundPressed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const posPressedRef = useRef(false);
  const soundPressedRef = useRef(false);
  const startedRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); }, []);

  const startGame = useCallback((startN?: number) => {
    timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = [];
    const n = startN || nLevel; setNLevel(n);
    const newTrials = generateTrials(n, TRIALS_PER_ROUND + n);
    setTrials(newTrials); setTrialIndex(0); setResponses([]);
    setShowStimulus(false); setPosPressed(false); setSoundPressed(false);
    setScreen('playing'); setIsSaved(false); startedRef.current = Date.now();
    Taro.vibrateShort({ type: 'light' });
  }, [nLevel]);

  useEffect(() => {
    if (screen !== 'playing' || trialIndex >= trials.length) return;
    posPressedRef.current = false; soundPressedRef.current = false;
    setPosPressed(false); setSoundPressed(false); setShowStimulus(true);
    const t1 = setTimeout(() => {
      setShowStimulus(false);
      const t2 = setTimeout(() => {
        const resp = { position: posPressedRef.current, sound: soundPressedRef.current };
        setResponses((prev) => { const updated = [...prev, resp]; if (trialIndex + 1 >= trials.length) { setScreen('results'); Taro.vibrateShort({ type: 'heavy' }); } else setTrialIndex((i) => i + 1); return updated; });
      }, PAUSE_MS); timeoutsRef.current.push(t2);
    }, STIMULUS_MS); timeoutsRef.current.push(t1);
  }, [screen, trialIndex, trials.length]);

  const handlePositionPress = useCallback(() => { if (!showStimulus) return; posPressedRef.current = true; setPosPressed(true); Taro.vibrateShort({ type: 'light' }); }, [showStimulus]);
  const handleSoundPress = useCallback(() => { if (!showStimulus) return; soundPressedRef.current = true; setSoundPressed(true); Taro.vibrateShort({ type: 'medium' }); }, [showStimulus]);

  useEffect(() => { if (screen !== 'results' || isSaved) return; setIsSaved(true);
    const acc = getAccuracy(trials, responses);
    const record = { id: `nback_${Date.now()}`, gameType: 'nback', difficulty: `${nLevel}-back`, startedAt: startedRef.current, completedAt: Date.now(), durationMs: Date.now() - startedRef.current, mistakes: responses.filter((r) => !r.position || !r.sound).length, hintsUsed: 0, score: acc.overall * 10, completed: true, isDaily: false, details: JSON.stringify({ nLevel, ...acc }) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  const trial = trialIndex < trials.length ? trials[trialIndex] : null;

  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='headphones' size={36} color='#7C3AED' /></View>
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('nback.title', 'N-Back测试')}</Text>
        <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>{t('nback.description', '记住N步前的位置和字母')}</Text>
        <Text style={{ fontSize: 16, color: '#94A3B8', marginBottom: 16 }}>{t('nback.chooseLevel', '选择难度')}</Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 32, width: '100%' }}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} onClick={() => startGame(n)} style={{ flex: 1, padding: '20px 0', borderRadius: 14, backgroundColor: nLevel === n ? '#7C3AED' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 600, color: nLevel === n ? '#FFFFFF' : '#475569' }}>{n}-Back</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (screen === 'playing' && trial) return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', paddingTop: navHeight }}>
        <View onClick={() => { timeoutsRef.current.forEach(clearTimeout); setScreen('menu'); }} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: '#6B7280' }}>&lt; 返回</Text></View>
        <Text style={{ fontSize: 16, color: '#94A3B8' }}>{t('nback.trial', '试次 {{current}}/{{total}}', { current: trialIndex + 1, total: trials.length })} · {nLevel}-Back</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <View style={{ width: '100%', maxWidth: 280, aspectRatio: 1, marginBottom: 40 }}>
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <View key={row} style={{ display: 'flex', flexDirection: 'row', height: `${100 / GRID_SIZE}%` }}>
              {Array.from({ length: GRID_SIZE }).map((_, col) => {
                const idx = row * GRID_SIZE + col;
                const isActive = showStimulus && trial.position === idx;
                return (
                  <View key={col} style={{ flex: 1, margin: 3, borderRadius: 12, backgroundColor: isActive ? '#7C3AED' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isActive && <Text style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>{trial.letter}</Text>}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        {showStimulus && <Text style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32 }}>{t('nback.hearLetter', '字母: {{letter}}', { letter: trial.letter })}</Text>}
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16, width: '100%' }}>
          <View onClick={handlePositionPress} style={{ flex: 1, padding: '24px 0', borderRadius: 16, backgroundColor: posPressed ? '#22C55E' : '#EDE9FE', border: posPressed ? 'none' : '2px solid #A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: posPressed ? '#FFFFFF' : '#7C3AED' }}>{t('nback.position', '位置')}</Text>
          </View>
          <View onClick={handleSoundPress} style={{ flex: 1, padding: '24px 0', borderRadius: 16, backgroundColor: soundPressed ? '#22C55E' : '#E0E7FF', border: soundPressed ? 'none' : '2px solid #818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: soundPressed ? '#FFFFFF' : '#4F46E5' }}>{t('nback.sound', '声音')}</Text>
          </View>
        </View>
      </View>
      {screen === 'results' && (() => { const acc = getAccuracy(trials, responses); return (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: '40px 32px', alignItems: 'center', width: '80%' }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 24 }}>{t('nback.roundComplete', '回合完成')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 24, width: '100%' }}>
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: '20px 12px', alignItems: 'center' }}><Text style={{ fontSize: 22, fontWeight: 700, color: '#7C3AED' }}>{acc.positionAcc}%</Text><Text style={{ fontSize: 14, color: '#94A3B8' }}>{t('nback.positionAcc', '位置')}</Text></View>
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: '20px 12px', alignItems: 'center' }}><Text style={{ fontSize: 22, fontWeight: 700, color: '#4F46E5' }}>{acc.soundAcc}%</Text><Text style={{ fontSize: 14, color: '#94A3B8' }}>{t('nback.soundAcc', '声音')}</Text></View>
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: '20px 12px', alignItems: 'center' }}><Text style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>{acc.overall}%</Text><Text style={{ fontSize: 14, color: '#94A3B8' }}>{t('nback.overall', '综合')}</Text></View>
            </View>
            <Text style={{ fontSize: 16, color: '#64748B', marginBottom: 24 }}>{t('nback.nextLevel', '建议难度: {{next}}', { next: getNBackLevel(nLevel, acc.overall) })}</Text>
            <View onClick={() => startGame()} style={{ backgroundColor: '#7C3AED', borderRadius: 16, padding: '20px 40px', width: '100%', alignItems: 'center' }}><Text style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{t('nback.playAgain', '再来一次')}</Text></View>
          </View>
        </View>
      ); })()}
    </View>
  );

  // If results screen directly (race condition fallback)
  return null;
}
