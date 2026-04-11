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
import { ConciergeCheckboxOption } from '@/components/concierge/concierge-checkbox-option';
import { ConciergeTextOption } from '@/components/concierge/concierge-text-option';
import { ConciergeReadiness } from '@/components/concierge/concierge-readiness';
import { ConciergeSummary } from '@/components/concierge/concierge-summary';
import { welcomeScreen, screens } from '@/lib/concierge-content';
import { staggerContainer } from '@/lib/motion';
import type {
  ConciergeState,
  ConciergeAction,
  ConciergeAnswers,
} from '@/lib/concierge-types';
import { TOTAL_SCREENS, ANSWER_FIELD_MAP as answerFieldMap } from '@/lib/concierge-types';

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
    case 'TOGGLE_CONSTRAINT': {
      const current = state.answers.biggestConstraints;
      const exists = current.includes(action.value);
      return {
        ...state,
        answers: {
          ...state.answers,
          biggestConstraints: exists
            ? current.filter((v) => v !== action.value)
            : [...current, action.value],
        },
      };
    }
    case 'SET_OTHER_TEXT':
      return {
        ...state,
        answers: { ...state.answers, businessStageOther: action.value },
      };
    case 'SHOW_UNSURE_POPUP':
      return { ...state, showUnsurePopup: true };
    case 'HIDE_UNSURE_POPUP':
      return { ...state, showUnsurePopup: false };
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
    businessStageOther: null,
    primaryGoal: null,
    marketingApproach: null,
    biggestConstraints: [],
    readiness: null,
  },
  showUnsurePopup: false,
};

export function ConciergeClient() {
  const router = useRouter();
  const [state, dispatch] = useReducer(conciergeReducer, initialState);
  const { currentScreen, direction, answers } = state;

  // Determine if user can advance from current screen
  const canAdvance = (() => {
    if (currentScreen === 0) return true; // Welcome screen
    if (currentScreen === 5) return true; // Summary screen
    if (currentScreen === 6) return false; // Readiness handles its own nav
    if (currentScreen === 1) {
      if (answers.businessStage === 'other') {
        return (answers.businessStageOther?.trim().length ?? 0) > 0;
      }
      return answers.businessStage !== null;
    }
    if (currentScreen === 4) {
      return answers.biggestConstraints.length > 0;
    }
    const field = answerFieldMap[currentScreen];
    if (!field) return false;
    const value = answers[field];
    return value !== null && value !== undefined && (typeof value !== 'string' || value.length > 0);
  })();

  const handleNext = useCallback(() => {
    if (canAdvance) dispatch({ type: 'NEXT' });
  }, [canAdvance]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const handleSelect = useCallback(
    (field: keyof ConciergeAnswers, value: string) => {
      if (field === 'businessStage' && value === 'other') {
        // Select "other" but do NOT auto-advance -- user needs to type
        dispatch({ type: 'SELECT', field, value });
        return;
      }
      if (field === 'businessStage') {
        // Clear any previously typed "other" text when choosing a standard option
        dispatch({ type: 'SET_OTHER_TEXT', value: '' });
      }
      dispatch({ type: 'SELECT', field, value });
      // Auto-advance after short delay on selection
      setTimeout(() => dispatch({ type: 'NEXT' }), 350);
    },
    [],
  );

  const handleToggleConstraint = useCallback((value: string) => {
    dispatch({ type: 'TOGGLE_CONSTRAINT', value });
  }, []);

  const handleOtherTextChange = useCallback((value: string) => {
    dispatch({ type: 'SET_OTHER_TEXT', value });
  }, []);

  const handleContinue = useCallback(() => {
    const params = new URLSearchParams({ mode: 'intake' });

    if (answers.businessStage === 'other' && answers.businessStageOther) {
      params.set('q11', 'other');
      params.set('q11_other', answers.businessStageOther);
    } else if (answers.businessStage) {
      params.set('q11', answers.businessStage);
    }

    if (answers.primaryGoal) params.set('q12', answers.primaryGoal);
    if (answers.marketingApproach) params.set('q21', answers.marketingApproach);
    if (answers.biggestConstraints.length > 0) {
      params.set('q39', answers.biggestConstraints.join(','));
    }

    router.push(`/get-started?${params.toString()}`);
  }, [answers, router]);

  const handleReady = useCallback(() => {
    handleContinue();
  }, [handleContinue]);

  const handleNotReady = useCallback(() => {
    router.push('/not-ready');
  }, [router]);

  // Determine which screen content to render
  const screenIndex = currentScreen - 1; // screens array is 0-indexed, screen 0 is welcome
  const screenConfig = screenIndex >= 0 && screenIndex < screens.length ? screens[screenIndex] : null;

  return (
    <ConciergeShell
      currentScreen={currentScreen}
      canAdvance={canAdvance}
      showNextButton={
        currentScreen === 4 ||
        (currentScreen === 1 && answers.businessStage === 'other')
      }
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
              <p className="text-sm font-medium uppercase tracking-widest text-sage-600">
                {welcomeScreen.eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-bold text-brand-800 sm:text-4xl lg:text-5xl">
                {welcomeScreen.heading}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-warm-700">
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

        {/* Screen 1: C1 business stage (with "Other" text option) */}
        {screenConfig && currentScreen === 1 && (
          <ConciergeScreen
            direction={direction}
            screenKey={screenConfig.id}
          >
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-sage-600">
                  {screenConfig.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-brand-800 sm:text-3xl">
                  {screenConfig.heading}
                </h2>
                <p className="mt-2 text-sm text-warm-500">
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
                {screenConfig.options
                  .filter((option) => option.id !== 'other')
                  .map((option) => (
                    <ConciergeOption
                      key={option.id}
                      option={option}
                      selected={answers.businessStage === option.id}
                      onSelect={(id) => handleSelect('businessStage', id)}
                    />
                  ))}
                <ConciergeTextOption
                  selected={answers.businessStage === 'other'}
                  text={answers.businessStageOther ?? ''}
                  onSelect={() => handleSelect('businessStage', 'other')}
                  onTextChange={handleOtherTextChange}
                  placeholder="Tell us about your current business situation..."
                />
              </motion.div>
            </div>
          </ConciergeScreen>
        )}

        {/* Screens 2-3: C2 primary goal, C3 marketing reality (single select, no other) */}
        {screenConfig && currentScreen >= 2 && currentScreen <= 3 && (
          <ConciergeScreen
            direction={direction}
            screenKey={screenConfig.id}
          >
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-sage-600">
                  {screenConfig.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-brand-800 sm:text-3xl">
                  {screenConfig.heading}
                </h2>
                <p className="mt-2 text-sm text-warm-500">
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

        {/* Screen 4: C4 biggest constraints (multi-select, 2-column grid) */}
        {screenConfig && currentScreen === 4 && (
          <ConciergeScreen
            direction={direction}
            screenKey={screenConfig.id}
          >
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-4 text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-sage-600">
                  {screenConfig.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-bold text-brand-800 sm:text-2xl">
                  {screenConfig.heading}
                </h2>
                <p className="mt-1 text-sm text-warm-500">
                  {screenConfig.subtext}
                </p>
              </div>

              <motion.div
                role="group"
                aria-label={screenConfig.heading}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {screenConfig.options.map((option) => (
                  <ConciergeCheckboxOption
                    key={option.id}
                    option={option}
                    checked={answers.biggestConstraints.includes(option.id)}
                    onToggle={handleToggleConstraint}
                  />
                ))}
              </motion.div>
            </div>
          </ConciergeScreen>
        )}

        {/* Screen 5: Summary */}
        {currentScreen === 5 && (
          <ConciergeScreen
            direction={direction}
            screenKey="summary"
          >
            <ConciergeSummary
              answers={answers}
              onContinue={handleNext}
            />
          </ConciergeScreen>
        )}

        {/* Screen 6: C5 readiness */}
        {currentScreen === 6 && (
          <ConciergeScreen
            direction={direction}
            screenKey="readiness"
          >
            <ConciergeReadiness
              onReady={handleReady}
              onNotReady={handleNotReady}
            />
          </ConciergeScreen>
        )}
      </AnimatePresence>
    </ConciergeShell>
  );
}
