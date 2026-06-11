import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/ui';
import { QUESTIONS, calculateResult, SBTIResult } from '../../../engine/sbti';

definePageConfig({ navigationBarTitleText: 'SBTI人格测试' });

const AGREE_OPTIONS = [
  { key: 'stronglyAgree', label: '非常同意', value: 5 },
  { key: 'agree', label: '同意', value: 4 },
  { key: 'neutral', label: '中立', value: 3 },
  { key: 'disagree', label: '不同意', value: 2 },
  { key: 'stronglyDisagree', label: '非常不同意', value: 1 },
];

const DIM_LABELS: Record<string, string> = { EI: 'E/I', SN: 'S/N', TF: 'T/F', JP: 'J/P' };

export default function SBTIPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<'menu' | 'quiz' | 'results'>('menu');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<{ type: SBTIResult; scores: any } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const startedRef = useRef(0);

  const startQuiz = useCallback(() => {
    setScreen('quiz'); setCurrentQ(0); setAnswers({}); setResult(null); setIsSaved(false);
    startedRef.current = Date.now(); Taro.vibrateShort({ type: 'light' });
  }, []);

  const handleAnswer = useCallback((value: number) => {
    const q = QUESTIONS[currentQ];
    const isAgree = value >= 4;
    const newAnswers = { ...answers, [q.id]: isAgree };
    setAnswers(newAnswers); Taro.vibrateShort({ type: 'light' });
    if (currentQ + 1 >= QUESTIONS.length) {
      const res = calculateResult(newAnswers); setResult(res); setScreen('results');
      Taro.vibrateShort({ type: 'heavy' });
    } else setCurrentQ((i) => i + 1);
  }, [currentQ, answers]);

  useEffect(() => { if (screen !== 'results' || isSaved || !result) return; setIsSaved(true);
    const totalScore = Object.values(result.scores).reduce((s: number, d: any) => s + d.percentage, 0);
    const record = { id: `sbti_${Date.now()}`, gameType: 'sbti', difficulty: 'normal', startedAt: startedRef.current, completedAt: Date.now(), durationMs: Date.now() - startedRef.current, mistakes: 0, hintsUsed: 0, score: totalScore, completed: true, isDaily: false, details: JSON.stringify({ type: result.type, scores: result.scores }) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved, result]);

  const question = QUESTIONS[currentQ];
  const progress = QUESTIONS.length > 0 ? (currentQ / QUESTIONS.length) * 100 : 0;

  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='zap' size={36} color='#EC4899' /></View>
        <Text style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t('sbti.title', 'SBTI人格测试')}</Text>
        <Text style={{ fontSize: 26, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 16 }}>{t('sbti.description', '20题快速了解你的认知风格')}</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: '24px 28px', marginBottom: 32, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Text style={{ fontSize: 24, color: '#64748B', lineHeight: 1.6 }}>基于认知功能理论设计，20道选择题探索你在四个维度上的偏好：能量来源、信息获取、决策方式、生活态度。</Text>
        </View>
        <View onClick={startQuiz} style={{ backgroundColor: '#EC4899', borderRadius: 16, padding: '24px 60px', alignItems: 'center', width: '100%' }}><Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('sbti.start', '开始测试')}</Text></View>
      </View>
    </ScrollView>
  );

  if (screen === 'quiz' && question) return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', paddingTop: 50 }}>
        <View onClick={() => setScreen('menu')} style={{ padding: 8 }}><Text style={{ fontSize: 28, color: '#6B7280' }}>&lt; 返回</Text></View>
        <Text style={{ fontSize: 24, color: '#94A3B8' }}>{DIM_LABELS[question.dimension]}</Text>
        <Text style={{ fontSize: 24, color: '#94A3B8' }}>{currentQ + 1}/{QUESTIONS.length}</Text>
      </View>
      <View style={{ height: 3, backgroundColor: '#E2E8F0', marginHorizontal: 24, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: '#EC4899', borderRadius: 2, width: `${progress}%` }} />
      </View>
      <ScrollView style={{ flex: 1 }} scrollY enableFlex contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: '0 32px' }}>
        <Text style={{ fontSize: 32, fontWeight: 600, color: '#1A1A2E', textAlign: 'center', marginBottom: 48, lineHeight: 1.5 }}>{t(question.text, question.text)}</Text>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AGREE_OPTIONS.map((opt) => (
            <View key={opt.key} onClick={() => handleAnswer(opt.value)} style={{ backgroundColor: '#F8FAFC', borderRadius: 14, padding: '22px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 28, color: '#475569', fontWeight: 500 }}>{t(`sbti.${opt.key}`, opt.label)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (!result) return null;
  const dims = [{ key: 'EI', left: 'E', right: 'I' }, { key: 'SN', left: 'S', right: 'N' }, { key: 'TF', left: 'T', right: 'F' }, { key: 'JP', left: 'J', right: 'P' }] as const;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <Text style={{ fontSize: 64, fontWeight: 700, color: '#EC4899', letterSpacing: 4, marginBottom: 12 }}>{result.type}</Text>
        <Text style={{ fontSize: 30, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>{t(`sbti.types.${result.type.toLowerCase()}.title`, '')}</Text>
        <Text style={{ fontSize: 24, color: '#64748B', textAlign: 'center', lineHeight: 1.5, marginBottom: 40 }}>{t(`sbti.types.${result.type.toLowerCase()}.desc`, '')}</Text>
        <Text style={{ fontSize: 24, fontWeight: 600, color: '#94A3B8', marginBottom: 20, alignSelf: 'flex-start' }}>{t('sbti.dimensionBreakdown', '维度分析')}</Text>
        {dims.map((dim) => {
          const score = result.scores[dim.key]; const pct = score.percentage;
          return (
            <View key={dim.key} style={{ width: '100%', marginBottom: 20 }}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 24, color: '#475569' }}>{dim.left}</Text>
                <Text style={{ fontSize: 24, color: '#475569' }}>{dim.right}</Text>
              </View>
              <View style={{ height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 5, backgroundColor: pct >= 50 ? '#229CF8' : '#EC4899', width: `${pct}%` }} />
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 20, color: '#94A3B8' }}>{pct}%</Text>
                <Text style={{ fontSize: 20, color: '#94A3B8' }}>{100 - pct}%</Text>
              </View>
            </View>
          );
        })}
        <View onClick={startQuiz} style={{ backgroundColor: '#EC4899', borderRadius: 16, padding: '24px 0', alignItems: 'center', width: '100%', marginTop: 16 }}><Text style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>{t('sbti.retake', '重新测试')}</Text></View>
      </View>
    </ScrollView>
  );
}
