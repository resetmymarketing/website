'use client';

import { useReducer, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ConciergeShell } from '@/components/concierge/concierge-shell';
import { ConciergeScreen } from '@/components/concierge/concierge-screen';
import { ConciergeOption } from '@/components/concierge/concierge-option';
import { ConciergeSummary } from '@/components/concierge/concierge-summary';
import { welcomeScreen, screens } from '@/lib/concierge-content';
import { staggerContainer } from '@/lib/motion';
import type {
  ConciergeState,
  ConciergeAction,
  ConciergeAnswers,
} from '@/lib/concierge-types';
import { TOTAL_SCREENS, FORM_FIELD_MAP, ANSWER_FIELD_MAP as answerFieldMap } from '@/lib/concierge-types';

function conciergeReducer(
  state: ConciergeState,
  action: ConciergeAction,
): ConciergeState {
  switch (action.type) {
    case 'NEXT':
      if (state.currentScreen >= TOTAL_SCREENS - 1) return state;
      return {
        ...state,
        currentScreen: state.currentScreen + 1,
        direction: 1,
      };
    case 'BACK':
      if (state.currentScreen <= 0) return state;
      return {
        ...state,
        currentScreen: state.currentScreen - 1,
        direction: -1,
      };
    case 'SELECT':
      return {
        ...state,
        answers: { ...state.answers, [action.field]: action.value },
      };
    case 'COMPLETE':
      return state;
    default:
      return state;
  }
}

const initialState: ConciergeState = {
  currentScreen: 0,
  direction: 1,
  answers: {
    businessStage: null,
    primaryGoal: null,
    marketingApproach: null,
    biggestConstraint: null,
  },
};

export function ConciergeClient() {
  const router = useRouter();
  const [state, dispatch] = useReducer(conciergeReducer, initialState);
  const { currentScreen, direction, answers } = state;

  // Determine if user can advance from current screen
  const canAdvance = (() => {
    if (currentScreen === 0) return true; // Welcome screen
    if (currentScreen === TOTAL_SCREENS - 1) return true; // Summary screen
    const field = answerFieldMap[currentScreen];
    return field ? answers[field] !== null : false;
  })();

  const handleNext = useCallback(() => {
    if (canAdvance) dispatch({ type: 'NEXT' });
  }, [canAdvance]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const handleSelect = useCallback(
    (field: keyof ConciergeAnswers, value: string) => {
      dispatch({ type: 'SELECT', field, value });
      // Auto-advance after short delay on selection
      setTimeout(() => dispatch({ type: 'NEXT' }), 350);
    },
    [],
  );

  const handleContinue = useCallback(() => {
    const params = new URLSearchParams({ mode: 'intake' });
    for (const [key, formField] of Object.entries(FORM_FIELD_MAP)) {
      const value = answers[key as keyof ConciergeAnswers];
      if (value) {
        params.set(formField, value);
      }
    }
    router.push(`/get-started?${params.toString()}`);
  }, [answers, router]);

  // Determine which screen content to render
  const screenIndex = currentScreen - 1; // screens array is 0-indexed, screen 0 is welcome
  const screenConfig = screenIndex >= 0 && screenIndex < screens.length ? screens[screenIndex] : null;

  return (
    <ConciergeShell
      currentScreen={currentScreen}
      canAdvance={canAdvance}
      onNext={handleNext}
      onBack={handleBack}
    >
      <AnimatePresence mode="wait" custom={direction}>
        {currentScreen === 0 && (
          <ConciergeScreen
            direction={direction}
            screenKey="welcome"
          >
            <div className="mx-auto w-full max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-sage-600 dark:text-sage-400">
                {welcomeScreen.eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-bold text-brand-800 dark:text-brand-100 sm:text-4xl lg:text-5xl">
                {welcomeScreen.heading}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-warm-700 dark:text-warm-300">
                {welcomeScreen.body}
              </p>
              <Button
                onClick={handleNext}
                className="mt-8 gap-2"
                size="lg"
              >
                {welcomeScreen.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ConciergeScreen>
        )}

        {screenConfig && currentScreen >= 1 && currentScreen <= 4 && (
          <ConciergeScreen
            direction={direction}
            screenKey={screenConfig.id}
          >
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-sage-600 dark:text-sage-400">
                  {screenConfig.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-brand-800 dark:text-brand-100 sm:text-3xl">
                  {screenConfig.heading}
                </h2>
                <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
                  {screenConfig.subtext}
                </p>
              </div>

              <motion.div
                role="radiogroup"
                aria-label={screenConfig.heading}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {screenConfig.options.map((option) => {
                  const field = answerFieldMap[currentScreen];
                  const selected = field ? answers[field] === option.id : false;
                  return (
                    <ConciergeOption
                      key={option.id}
                      option={option}
                      selected={selected}
                      onSelect={(id) => {
                        if (field) handleSelect(field, id);
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>
          </ConciergeScreen>
        )}

        {currentScreen === TOTAL_SCREENS - 1 && (
          <ConciergeScreen
            direction={direction}
            screenKey="summary"
          >
            <ConciergeSummary
              answers={answers}
              onContinue={handleContinue}
            />
          </ConciergeScreen>
        )}
      </AnimatePresence>
    </ConciergeShell>
  );
}
