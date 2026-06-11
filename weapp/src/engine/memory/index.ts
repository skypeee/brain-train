export type MemoryTheme = 'shapes' | 'letters' | 'numbers';

export interface MemoryCard {
  id: number;
  pairId: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const SHAPE_PAIRS = ['●', '■', '▲', '◆', '★', '⬟', '⬢', '♥'];
const LETTER_PAIRS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const NUMBER_PAIRS = ['1', '2', '3', '4', '5', '6', '7', '8'];

function getPairs(theme: MemoryTheme): string[] {
  switch (theme) {
    case 'shapes': return SHAPE_PAIRS;
    case 'letters': return LETTER_PAIRS;
    case 'numbers': return NUMBER_PAIRS;
  }
}

export function generateCards(theme: MemoryTheme, pairCount: number = 8): MemoryCard[] {
  const pairs = getPairs(theme).slice(0, pairCount);
  const cards: MemoryCard[] = [];
  pairs.forEach((symbol, pairId) => {
    cards.push({ id: pairId * 2, pairId, symbol, flipped: false, matched: false });
    cards.push({ id: pairId * 2 + 1, pairId, symbol, flipped: false, matched: false });
  });
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function getScore(moves: number, timeMs: number, pairCount: number): number {
  const par = pairCount * 2;
  const efficiency = moves > 0 ? par / moves : 0;
  return Math.max(0, Math.round(efficiency * 10000 - timeMs / 100));
}
