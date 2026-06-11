export const GRID_SIZE = 3;
export const TOTAL_POSITIONS = GRID_SIZE * GRID_SIZE;
export const TRIALS_PER_ROUND = 20;
export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

export interface NBackTrial {
  position: number;
  letter: string;
  positionMatch: boolean;
  soundMatch: boolean;
}

export interface NBackState {
  nLevel: number;
  trials: NBackTrial[];
  currentTrial: number;
  responses: { position: boolean; sound: boolean }[];
  showingStimulus: boolean;
}

export function generateTrials(n: number, count: number): NBackTrial[] {
  const trials: NBackTrial[] = [];
  const history: { pos: number; letter: string }[] = [];

  // Pre-fill history with random values for first N trials
  for (let i = 0; i < n; i++) {
    history.push({
      pos: Math.floor(Math.random() * TOTAL_POSITIONS),
      letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    });
  }

  for (let i = 0; i < count; i++) {
    const nBack = history[history.length - n];
    const posMatch = Math.random() < 0.25;
    const soundMatch = Math.random() < 0.25;

    const position = posMatch
      ? nBack.pos
      : (() => {
          let p: number;
          do { p = Math.floor(Math.random() * TOTAL_POSITIONS); } while (p === nBack.pos);
          return p;
        })();

    const letter = soundMatch
      ? nBack.letter
      : (() => {
          let l: string;
          do { l = LETTERS[Math.floor(Math.random() * LETTERS.length)]; } while (l === nBack.letter);
          return l;
        })();

    trials.push({ position, letter, positionMatch: posMatch, soundMatch });
    history.push({ pos: position, letter });
  }

  return trials;
}

export function getAccuracy(
  trials: NBackTrial[],
  responses: { position: boolean; sound: boolean }[]
): { positionAcc: number; soundAcc: number; overall: number } {
  let posCorrect = 0;
  let soundCorrect = 0;
  const total = Math.min(trials.length, responses.length);

  for (let i = 0; i < total; i++) {
    if (trials[i].positionMatch === responses[i].position) posCorrect++;
    if (trials[i].soundMatch === responses[i].sound) soundCorrect++;
  }

  return {
    positionAcc: total > 0 ? Math.round((posCorrect / total) * 100) : 0,
    soundAcc: total > 0 ? Math.round((soundCorrect / total) * 100) : 0,
    overall: total > 0 ? Math.round(((posCorrect + soundCorrect) / (total * 2)) * 100) : 0,
  };
}

export function getNBackLevel(nLevel: number, accuracy: number): number {
  if (accuracy >= 85) return Math.min(nLevel + 1, 5);
  if (accuracy < 60) return Math.max(nLevel - 1, 1);
  return nLevel;
}

// Letter frequencies for audio tones (Hz)
export const LETTER_FREQUENCIES: Record<string, number> = {
  C: 262, H: 294, K: 330, L: 349, Q: 392, R: 440, S: 494, T: 523,
};
