export type BreathingPattern = 'box' | 'resonance' | '478';
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfter';

export interface PatternConfig {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  cycles: number;
}

export const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  box: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, cycles: 5 },
  resonance: { name: 'Resonance Breathing', inhale: 5, hold: 0, exhale: 5, holdAfter: 0, cycles: 6 },
  '478': { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, holdAfter: 0, cycles: 4 },
};

export function getPhaseDuration(pattern: BreathingPattern, phase: BreathingPhase): number {
  const config = PATTERNS[pattern];
  switch (phase) {
    case 'inhale': return config.inhale * 1000;
    case 'hold': return config.hold * 1000;
    case 'exhale': return config.exhale * 1000;
    case 'holdAfter': return config.holdAfter * 1000;
  }
}

export function getTotalCycleMs(pattern: BreathingPattern): number {
  const config = PATTERNS[pattern];
  return (config.inhale + config.hold + config.exhale + config.holdAfter) * 1000;
}
