export interface SBTIQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  // true = agree (favors E/S/T/J), false = disagree (favors I/N/F/P)
}

export type SBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';
export type SBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type SBTIResult = `${'E' | 'I'}${'S' | 'N'}${'T' | 'F'}${'J' | 'P'}`;

export const QUESTIONS: SBTIQuestion[] = [
  // EI - Extraversion vs Introversion (5 questions)
  { id: 1, text: 'sbti.q1', dimension: 'EI' },
  { id: 2, text: 'sbti.q2', dimension: 'EI' },
  { id: 3, text: 'sbti.q3', dimension: 'EI' },
  { id: 4, text: 'sbti.q4', dimension: 'EI' },
  { id: 5, text: 'sbti.q5', dimension: 'EI' },
  // SN - Sensing vs Intuition (5 questions)
  { id: 6, text: 'sbti.q6', dimension: 'SN' },
  { id: 7, text: 'sbti.q7', dimension: 'SN' },
  { id: 8, text: 'sbti.q8', dimension: 'SN' },
  { id: 9, text: 'sbti.q9', dimension: 'SN' },
  { id: 10, text: 'sbti.q10', dimension: 'SN' },
  // TF - Thinking vs Feeling (5 questions)
  { id: 11, text: 'sbti.q11', dimension: 'TF' },
  { id: 12, text: 'sbti.q12', dimension: 'TF' },
  { id: 13, text: 'sbti.q13', dimension: 'TF' },
  { id: 14, text: 'sbti.q14', dimension: 'TF' },
  { id: 15, text: 'sbti.q15', dimension: 'TF' },
  // JP - Judging vs Perceiving (5 questions)
  { id: 16, text: 'sbti.q16', dimension: 'JP' },
  { id: 17, text: 'sbti.q17', dimension: 'JP' },
  { id: 18, text: 'sbti.q18', dimension: 'JP' },
  { id: 19, text: 'sbti.q19', dimension: 'JP' },
  { id: 20, text: 'sbti.q20', dimension: 'JP' },
];

export function calculateResult(answers: Record<number, boolean>): {
  type: SBTIResult;
  scores: Record<SBTIDimension, { left: number; right: number; percentage: number }>;
} {
  const dimensions: SBTIDimension[] = ['EI', 'SN', 'TF', 'JP'];
  const leftLetter: Record<SBTIDimension, string> = { EI: 'E', SN: 'S', TF: 'T', JP: 'J' };
  const rightLetter: Record<SBTIDimension, string> = { EI: 'I', SN: 'N', TF: 'F', JP: 'P' };

  const scores: Record<SBTIDimension, { left: number; right: number; percentage: number }> = {
    EI: { left: 0, right: 0, percentage: 0 },
    SN: { left: 0, right: 0, percentage: 0 },
    TF: { left: 0, right: 0, percentage: 0 },
    JP: { left: 0, right: 0, percentage: 0 },
  };

  for (const q of QUESTIONS) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    if (answer) {
      scores[q.dimension].left++;
    } else {
      scores[q.dimension].right++;
    }
  }

  let type = '';
  for (const dim of dimensions) {
    const total = scores[dim].left + scores[dim].right || 1;
    scores[dim].percentage = Math.round((scores[dim].left / total) * 100);
    type += scores[dim].left >= scores[dim].right ? leftLetter[dim] : rightLetter[dim];
  }

  return { type: type as SBTIResult, scores };
}

export const TYPE_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  ISTJ: { title: 'sbti.types.istj.title', desc: 'sbti.types.istj.desc' },
  ISFJ: { title: 'sbti.types.isfj.title', desc: 'sbti.types.isfj.desc' },
  INFJ: { title: 'sbti.types.infj.title', desc: 'sbti.types.infj.desc' },
  INTJ: { title: 'sbti.types.intj.title', desc: 'sbti.types.intj.desc' },
  ISTP: { title: 'sbti.types.istp.title', desc: 'sbti.types.istp.desc' },
  ISFP: { title: 'sbti.types.isfp.title', desc: 'sbti.types.isfp.desc' },
  INFP: { title: 'sbti.types.infp.title', desc: 'sbti.types.infp.desc' },
  INTP: { title: 'sbti.types.intp.title', desc: 'sbti.types.intp.desc' },
  ESTP: { title: 'sbti.types.estp.title', desc: 'sbti.types.estp.desc' },
  ESFP: { title: 'sbti.types.esfp.title', desc: 'sbti.types.esfp.desc' },
  ENFP: { title: 'sbti.types.enfp.title', desc: 'sbti.types.enfp.desc' },
  ENTP: { title: 'sbti.types.entp.title', desc: 'sbti.types.entp.desc' },
  ESTJ: { title: 'sbti.types.estj.title', desc: 'sbti.types.estj.desc' },
  ESFJ: { title: 'sbti.types.esfj.title', desc: 'sbti.types.esfj.desc' },
  ENFJ: { title: 'sbti.types.enfj.title', desc: 'sbti.types.enfj.desc' },
  ENTJ: { title: 'sbti.types.entj.title', desc: 'sbti.types.entj.desc' },
};

export const DIMENSION_LABELS: Record<SBTIDimension, { left: string; right: string }> = {
  EI: { left: 'E - 外向', right: 'I - 内向' },
  SN: { left: 'S - 实感', right: 'N - 直觉' },
  TF: { left: 'T - 思考', right: 'F - 情感' },
  JP: { left: 'J - 判断', right: 'P - 感知' },
};
