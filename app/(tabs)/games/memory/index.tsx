import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Brain, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import { MemoryCard, MemoryTheme, generateCards, getScore } from '../../../../src/engine/memory';
import { GameIntro } from '../../../../src/components/games/GameIntro';

const PAIR_COUNT = 8;
const THEMES: MemoryTheme[] = ['shapes', 'letters', 'numbers'];

export default function MemoryMatchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

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
  const rafRef = useRef<number>(0);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (screen !== 'playing') return;
    startRef.current = Date.now();
    const tick = () => {
      setElapsedMs(Date.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [screen]);

  const startGame = useCallback((selectedTheme?: MemoryTheme) => {
    const t = selectedTheme || theme;
    setCards(generateCards(t, PAIR_COUNT));
    setFlipped([]);
    setMoves(0);
    setMatchedPairs(0);
    setElapsedMs(0);
    setIsLocked(false);
    setScreen('playing');
    setIsSaved(false);
    startedAtRef.current = Date.now();
    feedback.numberInput();
  }, [theme, feedback]);

  const handleCardTap = useCallback((cardId: number) => {
    if (isLocked) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flipped.includes(cardId)) return;

    feedback.cellTap();
    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);
      const [firstId, secondId] = newFlipped;
      const first = newCards.find((c) => c.id === firstId)!;
      const second = newCards.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId) {
        // Match!
        const matched = newCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        );
        setCards(matched);
        setFlipped([]);
        setMatchedPairs((p) => {
          const next = p + 1;
          if (next >= PAIR_COUNT) {
            feedback.win();
            setTimeout(() => setScreen('results'), 600);
          }
          return next;
        });
        setIsLocked(false);
        feedback.win();
      } else {
        // No match - flip back after delay
        feedback.error();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      }
    }
  }, [cards, flipped, isLocked, feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const score = getScore(moves, elapsedMs, PAIR_COUNT);
    saveGameResult({
      id: `memory_${Date.now()}`,
      gameType: 'memory',
      difficulty: theme,
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      durationMs: elapsedMs,
      mistakes: moves - PAIR_COUNT > 0 ? moves - PAIR_COUNT : 0,
      hintsUsed: 0,
      score,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ moves, pairs: PAIR_COUNT, theme, time: elapsedMs }),
    });
  }, [screen, isSaved]);

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('memory.title')}
          </Text>
        </View>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center mb-8">
            <View className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-6 mb-4">
              <Brain stroke="#8B5CF6" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('memory.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('memory.description')}
            </Text>
          </View>

          <GameIntro i18nKey="memory" color="#8B5CF6" />

          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">
            {t('memory.chooseTheme')}
          </Text>
          <View className="flex-row gap-3 mb-8">
            {THEMES.map((th) => (
              <TouchableOpacity
                key={th}
                onPress={() => { setTheme(th); startGame(th); }}
                className={`flex-1 py-4 rounded-xl items-center ${
                  theme === th ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`font-semibold ${theme === th ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t(`memory.${th}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // === PLAYING ===
  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => setScreen('menu')} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <View className="flex-row gap-6">
          <Text className="text-gray-500 dark:text-gray-400 font-mono">
            {Math.floor(elapsedMs / 60000)}:{(Math.floor((elapsedMs % 60000) / 1000)).toString().padStart(2, '0')}
          </Text>
          <Text className="text-purple-500 font-semibold">
            {moves} {t('memory.moves')}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Card Grid */}
      <View className="flex-1 items-center justify-center px-4">
        <View className="flex-row flex-wrap w-full max-w-sm justify-center">
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardTap(card.id)}
              activeOpacity={0.7}
              className="w-[22%] aspect-square m-[1.5%] rounded-xl items-center justify-center"
              style={{
                backgroundColor: card.matched
                  ? '#D1FAE5'
                  : card.flipped
                  ? '#EDE9FE'
                  : '#F3F4F6',
              }}
            >
              {(card.flipped || card.matched) ? (
                <Text className="text-3xl font-bold" style={{
                  color: card.matched ? '#059669' : '#7C3AED'
                }}>
                  {card.symbol}
                </Text>
              ) : (
                <Text className="text-gray-300 dark:text-gray-600 text-xl font-bold">?</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results modal */}
      {screen === 'results' && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-10">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('memory.complete')}
            </Text>
            <View className="flex-row gap-6 mb-8">
              <View className="items-center">
                <Text className="text-3xl font-bold text-purple-500 font-mono">{moves}</Text>
                <Text className="text-xs text-gray-400 mt-1">{t('memory.moves')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-500 font-mono">
                  {Math.floor(elapsedMs / 1000)}s
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{t('memory.time')}</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-green-500 font-mono">
                  {getScore(moves, elapsedMs, PAIR_COUNT)}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{t('memory.score')}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => startGame()}
              className="bg-purple-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
            >
              <RefreshCw stroke="white" size={20} />
              <Text className="text-white text-lg font-semibold">{t('memory.playAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
