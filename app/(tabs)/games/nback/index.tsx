import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, RefreshCw, Headphones } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../../../../src/hooks/useFeedback';
import { useStats } from '../../../../src/hooks/useStats';
import {
  GRID_SIZE, TRIALS_PER_ROUND, generateTrials, getAccuracy, getNBackLevel, LETTER_FREQUENCIES, NBackTrial,
} from '../../../../src/engine/nback';

const STIMULUS_MS = 2000;
const PAUSE_MS = 500;

export default function DualNBackScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const { saveGameResult } = useStats();

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

  const startGame = useCallback((startN?: number) => {
    const n = startN || nLevel;
    setNLevel(n);
    const newTrials = generateTrials(n, TRIALS_PER_ROUND + n);
    setTrials(newTrials);
    setTrialIndex(0);
    setResponses([]);
    setShowStimulus(false);
    setPosPressed(false);
    setSoundPressed(false);
    setScreen('playing');
    setIsSaved(false);
    startedRef.current = Date.now();
    feedback.numberInput();
  }, [nLevel, feedback]);

  // Trial loop
  useEffect(() => {
    if (screen !== 'playing' || trialIndex >= trials.length) return;

    const runTrial = () => {
      posPressedRef.current = false;
      soundPressedRef.current = false;
      setPosPressed(false);
      setSoundPressed(false);
      setShowStimulus(true);

      // Hide stimulus after STIMULUS_MS
      setTimeout(() => {
        setShowStimulus(false);

        setTimeout(() => {
          // Record response (or lack thereof) using refs
          const resp = { position: posPressedRef.current, sound: soundPressedRef.current };
          setResponses((prev) => {
            const updated = [...prev, resp];
            if (trialIndex + 1 >= trials.length) {
              setScreen('results');
              feedback.win();
            } else {
              setTrialIndex((i) => i + 1);
            }
            return updated;
          });
          posPressedRef.current = false;
          soundPressedRef.current = false;
          setPosPressed(false);
          setSoundPressed(false);
        }, PAUSE_MS);
      }, STIMULUS_MS);
    };

    runTrial();
  }, [screen, trialIndex, trials.length, feedback]);

  const handlePositionPress = useCallback(() => {
    if (!showStimulus) return;
    posPressedRef.current = true;
    setPosPressed(true);
    feedback.cellTap();
  }, [showStimulus, feedback]);

  const handleSoundPress = useCallback(() => {
    if (!showStimulus) return;
    soundPressedRef.current = true;
    setSoundPressed(true);
    feedback.hint();
  }, [showStimulus, feedback]);

  // Save results
  useEffect(() => {
    if (screen !== 'results' || isSaved) return;
    setIsSaved(true);
    const acc = getAccuracy(trials, responses);
    saveGameResult({
      id: `nback_${Date.now()}`,
      gameType: 'nback',
      difficulty: `${nLevel}-back`,
      startedAt: startedRef.current,
      completedAt: Date.now(),
      durationMs: Date.now() - startedRef.current,
      mistakes: responses.length > 0
        ? responses.filter((r) => !r.position || !r.sound).length
        : 0,
      hintsUsed: 0,
      score: acc.overall * 10,
      completed: true,
      isDaily: false,
      details: JSON.stringify({ nLevel, ...acc }),
    });
  }, [screen, isSaved]);

  const trial = trialIndex < trials.length ? trials[trialIndex] : null;

  // === MENU ===
  if (screen === 'menu') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft stroke="#6B7280" size={24} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white mr-8">
            {t('nback.title')}
          </Text>
        </View>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-6 mb-4">
              <Headphones stroke="#7C3AED" size={48} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('nback.title')}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center leading-5">
              {t('nback.description')}
            </Text>
          </View>

          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">
            {t('nback.chooseLevel')}
          </Text>
          <View className="flex-row gap-3 mb-8">
            {[1, 2, 3, 4].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => { setNLevel(n); startGame(n); }}
                className={`flex-1 py-4 rounded-xl items-center ${
                  nLevel === n ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`font-semibold ${nLevel === n ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {n}-Back
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // === PLAYING ===
  if (!trial) return null;

  const trialLetter = trial.letter;
  const positionLabel = t('nback.position');
  const soundLabel = t('nback.sound');

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => setScreen('menu')} className="p-2 -ml-2">
          <ChevronLeft stroke="#6B7280" size={24} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm text-gray-400">
          {t('nback.trial', { current: trialIndex + 1, total: trials.length })} • {nLevel}-Back
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <View className="flex-1 px-6 justify-center">
        {/* 3x3 Grid */}
        <View className="w-full max-w-xs aspect-square self-center mb-8">
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <View key={row} className="flex-row" style={{ height: `${100 / GRID_SIZE}%` }}>
              {Array.from({ length: GRID_SIZE }).map((_, col) => {
                const idx = row * GRID_SIZE + col;
                const isActive = showStimulus && trial.position === idx;
                return (
                  <View
                    key={col}
                    className="flex-1 m-1 rounded-lg items-center justify-center"
                    style={{
                      backgroundColor: isActive ? '#7C3AED' : '#F3F4F6',
                    }}
                  >
                    {isActive && (
                      <Text className="text-white text-2xl font-bold">{trialLetter}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Letter indicator (visual backup) */}
        {showStimulus && (
          <Text className="text-center text-gray-400 mb-6 text-lg">
            {t('nback.hearLetter', { letter: trialLetter })}
          </Text>
        )}

        {/* Response buttons */}
        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity
            onPress={handlePositionPress}
            activeOpacity={0.7}
            className={`flex-1 py-5 rounded-2xl items-center ${
              posPressed ? 'bg-green-500' : 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-400'
            }`}
          >
            <Text className={`font-bold text-lg ${posPressed ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`}>
              {positionLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSoundPress}
            activeOpacity={0.7}
            className={`flex-1 py-5 rounded-2xl items-center ${
              soundPressed ? 'bg-green-500' : 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400'
            }`}
          >
            <Text className={`font-bold text-lg ${soundPressed ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {soundLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results modal */}
      {screen === 'results' && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-10">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('nback.roundComplete')}
            </Text>
            {(() => {
              const acc = getAccuracy(trials, responses);
              return (
                <>
                  <View className="flex-row gap-4 mb-6 w-full">
                    <View className="flex-1 items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                      <Text className="text-2xl font-bold text-violet-500">{acc.positionAcc}%</Text>
                      <Text className="text-xs text-gray-400 mt-1">{t('nback.positionAcc')}</Text>
                    </View>
                    <View className="flex-1 items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                      <Text className="text-2xl font-bold text-indigo-500">{acc.soundAcc}%</Text>
                      <Text className="text-xs text-gray-400 mt-1">{t('nback.soundAcc')}</Text>
                    </View>
                    <View className="flex-1 items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                      <Text className="text-2xl font-bold text-green-500">{acc.overall}%</Text>
                      <Text className="text-xs text-gray-400 mt-1">{t('nback.overall')}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 mb-6">
                    {t('nback.nextLevel', { next: getNBackLevel(nLevel, acc.overall) })}
                  </Text>
                </>
              );
            })()}
            <TouchableOpacity
              onPress={() => startGame()}
              className="bg-violet-500 rounded-2xl py-4 w-full items-center flex-row justify-center gap-2"
            >
              <RefreshCw stroke="white" size={20} />
              <Text className="text-white text-lg font-semibold">{t('nback.playAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
