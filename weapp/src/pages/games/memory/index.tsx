import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeArea } from '../../../hooks/useSafeArea';
import { Icon } from '../../../components/ui';
import { MemoryCard, MemoryTheme, generateCards, getScore } from '../../../engine/memory';

definePageConfig({ navigationBarTitleText: '记忆翻牌', navigationStyle: 'custom' });

const PAIR_COUNT = 8;
const THEMES: MemoryTheme[] = ['shapes', 'letters', 'numbers'];

export default function MemoryPage() {
  const { t } = useTranslation();
  const { navHeight } = useSafeArea();
  const [screen, setScreen] = useState<'menu' | 'playing' | 'results'>('menu');
  const [theme, setTheme] = useState<MemoryTheme>('shapes');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const startRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (screen !== 'playing') return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => setElapsedMs(Date.now() - startRef.current), 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [screen]);

  const startGame = useCallback((selectedTheme?: MemoryTheme) => {
    const th = selectedTheme || theme;
    if (selectedTheme) setTheme(th);
    setCards(generateCards(th, PAIR_COUNT)); setFlipped([]); setMoves(0);
    setMatchedPairs(0); setElapsedMs(0); setIsLocked(false);
    setScreen('playing'); setIsSaved(false); startedAtRef.current = Date.now();
    Taro.vibrateShort({ type: 'light' });
  }, [theme]);

  const handleCardTap = useCallback((cardId: number) => {
    if (isLocked) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flipped.includes(cardId)) return;
    Taro.vibrateShort({ type: 'light' });
    const newCards = cards.map((c) => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1); setIsLocked(true);
      const [firstId, secondId] = newFlipped;
      const first = newCards.find((c) => c.id === firstId)!;
      const second = newCards.find((c) => c.id === secondId)!;
      if (first.pairId === second.pairId) {
        const matched = newCards.map((c) => c.id === firstId || c.id === secondId ? { ...c, matched: true } : c);
        setCards(matched); setFlipped([]);
        setMatchedPairs((p) => { const next = p + 1; if (next >= PAIR_COUNT) { Taro.vibrateShort({ type: 'heavy' }); setTimeout(() => setScreen('results'), 600); } return next; });
        setIsLocked(false);
      } else {
        Taro.vibrateShort({ type: 'heavy' });
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c));
          setFlipped([]); setIsLocked(false);
        }, 800);
      }
    }
  }, [cards, flipped, isLocked]);

  useEffect(() => { if (screen !== 'results' || isSaved) return; setIsSaved(true);
    const score = getScore(moves, elapsedMs, PAIR_COUNT);
    const record = { id: `memory_${Date.now()}`, gameType: 'memory', difficulty: theme, startedAt: startedAtRef.current, completedAt: Date.now(), durationMs: elapsedMs, mistakes: Math.max(0, moves - PAIR_COUNT), hintsUsed: 0, score, completed: true, isDaily: false, details: JSON.stringify({ moves, pairs: PAIR_COUNT, theme, time: elapsedMs }) };
    try { const records = Taro.getStorageSync('gameRecords') || []; records.push(record); Taro.setStorageSync('gameRecords', records); } catch (_) {}
  }, [screen, isSaved]);

  if (screen === 'menu') return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon name='brain' size={36} color='#8B5CF6' /></View>
        <Text style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8, wordBreak: 'break-all'}}>{t('memory.title', '记忆翻牌')}</Text>
        <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 40, wordBreak: 'break-all'}}>{t('memory.description', '翻开两张卡片匹配相同图案')}</Text>
        <Text style={{ fontSize: 16, color: '#94A3B8', marginBottom: 16, wordBreak: 'break-all'}}>{t('memory.chooseTheme', '选择主题')}</Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 32, width: '100%' }}>
          {THEMES.map((th) => (
            <View key={th} onClick={() => startGame(th)} style={{ flex: 1, padding: '20px 0', borderRadius: 14, backgroundColor: theme === th ? '#8B5CF6' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 600, color: theme === th ? '#FFFFFF' : '#475569', wordBreak: 'break-all'}}>{t(`memory.${th}`, th)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', paddingTop: navHeight }}>
        <View onClick={() => setScreen('menu')} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: '#6B7280' }}>&lt; 返回</Text></View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <Text style={{ fontSize: 16, fontFamily: 'monospace', color: '#64748B', wordBreak: 'break-all'}}>{Math.floor(elapsedMs / 60000)}:{String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}</Text>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#8B5CF6', wordBreak: 'break-all'}}>{moves} {t('memory.moves', '步')}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>
      <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%', maxWidth: 340, justifyContent: 'center' }}>
          {cards.map((card) => (
            <View key={card.id} onClick={() => handleCardTap(card.id)} style={{
              width: '22%', aspectRatio: 1, margin: '1.5%', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: card.matched ? '#D1FAE5' : card.flipped ? '#EDE9FE' : '#F3F4F6',
            }}>
              {(card.flipped || card.matched) ? (
                <Text style={{ fontSize: 26, fontWeight: 700, color: card.matched ? '#059669' : '#7C3AED', wordBreak: 'break-all'}}>{card.symbol}</Text>
              ) : (
                <Text style={{ fontSize: 22, fontWeight: 700, color: '#CBD5E1' }}>?</Text>
              )}
            </View>
          ))}
        </View>
      </View>
      {screen === 'results' && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: '40px 32px', alignItems: 'center', width: '80%' }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 24, wordBreak: 'break-all'}}>{t('memory.complete', '完成!')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 24, marginBottom: 32 }}>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6', fontFamily: 'monospace', wordBreak: 'break-all'}}>{moves}</Text><Text style={{ fontSize: 14, color: '#94A3B8', wordBreak: 'break-all'}}>{t('memory.moves', '步数')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 24, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace', wordBreak: 'break-all'}}>{Math.floor(elapsedMs / 1000)}s</Text><Text style={{ fontSize: 14, color: '#94A3B8', wordBreak: 'break-all'}}>{t('memory.time', '用时')}</Text></View>
              <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 24, fontWeight: 700, color: '#10B981', fontFamily: 'monospace', wordBreak: 'break-all'}}>{getScore(moves, elapsedMs, PAIR_COUNT)}</Text><Text style={{ fontSize: 14, color: '#94A3B8', wordBreak: 'break-all'}}>{t('memory.score', '得分')}</Text></View>
            </View>
            <View onClick={() => startGame()} style={{ backgroundColor: '#8B5CF6', borderRadius: 16, padding: '20px 40px', width: '100%', alignItems: 'center' }}><Text style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-all'}}>{t('memory.playAgain', '再来一局')}</Text></View>
          </View>
        </View>
      )}
    </View>
  );
}
