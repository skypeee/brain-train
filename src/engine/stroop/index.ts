export const COLORS = [
  { name: 'red', label: '红色', labelEn: 'Red', hex: '#EF4444' },
  { name: 'blue', label: '蓝色', labelEn: 'Blue', hex: '#3B82F6' },
  { name: 'green', label: '绿色', labelEn: 'Green', hex: '#10B981' },
  { name: 'yellow', label: '黄色', labelEn: 'Yellow', hex: '#F59E0B' },
] as const;

export const TOTAL_TRIALS = 20;

export interface StroopTrial {
  wordName: string;
  wordLabel: string;
  inkColor: (typeof COLORS)[number];
  isCongruent: boolean;
}

export function generateTrials(count: number): StroopTrial[] {
  const trials: StroopTrial[] = [];
  for (let i = 0; i < count; i++) {
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    let inkIdx = Math.floor(Math.random() * COLORS.length);
    // 60% incongruent for training effect
    if (Math.random() < 0.6) {
      while (inkIdx === wordIdx) inkIdx = Math.floor(Math.random() * COLORS.length);
    }
    trials.push({
      wordName: COLORS[wordIdx].name,
      wordLabel: COLORS[wordIdx].label,
      inkColor: COLORS[inkIdx],
      isCongruent: wordIdx === inkIdx,
    });
  }
  return trials;
}

export function getStroopStats(
  trials: StroopTrial[],
  responses: { correct: boolean; reactionMs: number }[]
) {
  const correct = responses.filter((r) => r.correct);
  const accuracy = responses.length > 0 ? Math.round((correct.length / responses.length) * 100) : 0;
  const avgReaction = correct.length > 0
    ? Math.round(correct.reduce((s, r) => s + r.reactionMs, 0) / correct.length)
    : 0;
  const incongruent = responses.filter(
    (_, i) => !trials[i]?.isCongruent
  );
  const incongruentCorrect = incongruent.filter((r) => r.correct);
  const incongruentAvg = incongruentCorrect.length > 0
    ? Math.round(incongruentCorrect.reduce((s, r) => s + r.reactionMs, 0) / incongruentCorrect.length)
    : 0;
  return { accuracy, avgReaction, incongruentAvg };
}
