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
  allowOther?: boolean;
  multiSelect?: boolean;
}

export interface ConciergeAnswers {
  businessStage: string | null;       // C1 - single select OR "other" with text
  businessStageOther: string | null;  // C1 - free text if "other" selected
  primaryGoal: string | null;         // C2 - single select, no "other"
  marketingApproach: string | null;   // C3 - single select, no "other"
  biggestConstraints: string[];       // C4 - MULTI-SELECT (was biggestConstraint singular)
  readiness: string | null;           // C5 - "yes" | "unsure" | "no"
}

export type ConciergeAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT'; field: keyof ConciergeAnswers; value: string }
  | { type: 'TOGGLE_CONSTRAINT'; value: string }
  | { type: 'SET_OTHER_TEXT'; value: string }
  | { type: 'SHOW_UNSURE_POPUP' }
  | { type: 'HIDE_UNSURE_POPUP' }
  | { type: 'COMPLETE' };

export interface ConciergeState {
  currentScreen: number;
  direction: 1 | -1;
  answers: ConciergeAnswers;
  showUnsurePopup: boolean;
}

export const TOTAL_SCREENS = 7;

export const ANSWER_FIELD_MAP: Record<number, keyof ConciergeAnswers> = {
  1: 'businessStage',
  2: 'primaryGoal',
  3: 'marketingApproach',
  4: 'biggestConstraints',
};

export const FORM_FIELD_MAP: Record<string, string> = {
  businessStage: 'q11',
  primaryGoal: 'q12',
  marketingApproach: 'q21',
  biggestConstraints: 'q39',
};
