export interface ConciergeOptionConfig {
  id: string;
  label: string;
  description: string;
}

export interface ConciergeScreenConfig {
  id: string;
  eyebrow: string;
  heading: string;
  subtext: string;
  options: ConciergeOptionConfig[];
  formField: string | null;
}

export interface ConciergeAnswers {
  businessStage: string | null;
  primaryGoal: string | null;
  marketingApproach: string | null;
  biggestConstraint: string | null;
}

export type ConciergeAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT'; field: keyof ConciergeAnswers; value: string }
  | { type: 'COMPLETE' };

export interface ConciergeState {
  currentScreen: number;
  direction: 1 | -1;
  answers: ConciergeAnswers;
}

export const TOTAL_SCREENS = 6;

export const ANSWER_FIELD_MAP: Record<number, keyof ConciergeAnswers> = {
  1: 'businessStage',
  2: 'primaryGoal',
  3: 'marketingApproach',
  4: 'biggestConstraint',
};

export const FORM_FIELD_MAP: Record<keyof ConciergeAnswers, string> = {
  businessStage: 'q11',
  primaryGoal: 'q12',
  marketingApproach: 'q21',
  biggestConstraint: 'q39',
};
