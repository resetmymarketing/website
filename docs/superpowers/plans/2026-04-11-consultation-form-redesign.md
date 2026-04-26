# Consultation Form Redesign - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the concierge + consultation form to match the v3.0 handoff doc (concierge) and Karli's Session 12/13 streamlining decisions (form), including 5 concierge questions, combined fields, confirmation card, compact link tables, conditional branching, and language swap from "intake" to "consultation."

**Architecture:** The concierge flow is a state machine in `concierge-client.tsx` driven by config in `concierge-content.ts` and `concierge-types.ts`. The intake form is a multi-step form in `intake-form-client.tsx` with validation in `validation.ts` and step config in `intake-steps.ts`. Data flows: concierge answers → URL params → form prefill → POST `/api/intake` → JSONB in `clients.intakeData`. All changes are additive to existing patterns.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui, Framer Motion, Zod v4, Drizzle ORM, Vitest, Playwright

**Source of truth:** `public/mockup.html` (v2 streamlined form) + `marketing-reset-handoff-for-claude-code.md` (v3.0 concierge + locked decisions)

---

## File Structure

### Files to Create
- `src/components/concierge/concierge-readiness.tsx` -- C5 readiness qualifier screen with popup + routing
- `src/components/concierge/concierge-checkbox-option.tsx` -- Multi-select checkbox option (for C4)
- `src/components/concierge/concierge-text-option.tsx` -- "Other" option with text input (for C1)
- `src/components/intake/intake-confirmation-card.tsx` -- Pre-filled confirmation card for Step 2
- `src/components/intake/intake-link-table.tsx` -- Compact link table component (for Step 1 online presence)

### Files to Modify
- `src/lib/concierge-types.ts` -- Add C5 types, update ConciergeAnswers for multi-select + "Other"
- `src/lib/concierge-content.ts` -- Update all 4 screen configs, add C5 screen, update summary builder
- `src/app/(public)/get-started/concierge-client.tsx` -- 7 screens (welcome + 4 questions + summary + C5), multi-select C4, "Other" C1
- `src/components/concierge/concierge-progress.tsx` -- Update TOTAL_SCREENS from 6 to 7
- `src/app/(public)/get-started/intake-steps.ts` -- Update step configs for new structure
- `src/app/(public)/get-started/intake-form-client.tsx` -- Complete form restructure (combined fields, confirmation card, link tables, removed sections, conditional AI question)
- `src/app/(public)/get-started/get-started-router.tsx` -- Update hero text ("consultation" not "intake"), handle C5 routing
- `src/lib/validation.ts` -- New schema matching restructured form fields
- `src/app/api/intake/route.ts` -- Handle new field names in JSONB storage
- `src/components/intake/intake-step-nav.tsx` -- Update last step index, button text
- `src/components/intake/intake-progress-bar.tsx` -- Update step labels
- `src/components/concierge/concierge-summary.tsx` -- Update CTA text to "consultation"

### Files to Modify (Language Swap)
- `src/app/(public)/get-started/get-started-router.tsx` -- "intake" → "consultation" in UI text
- `src/app/(public)/get-started/intake-form-client.tsx` -- All user-facing strings
- `src/components/intake/intake-step-nav.tsx` -- Submit button text
- `src/components/concierge/concierge-summary.tsx` -- CTA text
- `src/lib/concierge-content.ts` -- Summary screen text
- `src/app/(public)/page.tsx` -- Any CTA text referencing intake
- `src/app/(public)/how-it-works/page.tsx` -- Any references
- `src/app/(public)/about/page.tsx` -- Any references

### Test Files to Update
- `src/__tests__/lib/validation.test.ts` -- New schema tests
- `e2e/public-site.spec.ts` -- Updated form flow
- `e2e/accessibility.spec.ts` -- Updated page structure

---

## Task 1: Update Concierge Types

**Files:**
- Modify: `src/lib/concierge-types.ts`

- [ ] **Step 1: Update ConciergeAnswers interface**

```typescript
export interface ConciergeAnswers {
  businessStage: string | null;       // C1 - single select OR "other" with text
  businessStageOther: string | null;  // C1 - free text if "other" selected
  primaryGoal: string | null;         // C2 - single select, no "other"
  marketingApproach: string | null;   // C3 - single select, no "other"
  biggestConstraints: string[];       // C4 - MULTI-SELECT (was biggestConstraint singular)
  readiness: string | null;           // C5 - "yes" | "unsure" | "no"
}
```

- [ ] **Step 2: Update ConciergeState and action types**

```typescript
export interface ConciergeState {
  currentScreen: number;
  direction: 1 | -1;
  answers: ConciergeAnswers;
  showUnsurePopup: boolean;  // C5 popup state
}

export type ConciergeAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT'; field: keyof ConciergeAnswers; value: string }
  | { type: 'TOGGLE_CONSTRAINT'; value: string }  // C4 multi-select
  | { type: 'SET_OTHER_TEXT'; value: string }      // C1 "other" text
  | { type: 'SHOW_UNSURE_POPUP' }                  // C5
  | { type: 'HIDE_UNSURE_POPUP' }                  // C5
  | { type: 'COMPLETE' };
```

- [ ] **Step 3: Update constants**

```typescript
export const TOTAL_SCREENS = 7; // was 6: welcome + 4 questions + summary + C5 readiness

export const ANSWER_FIELD_MAP: Record<number, keyof ConciergeAnswers> = {
  1: 'businessStage',
  2: 'primaryGoal',
  3: 'marketingApproach',
  4: 'biggestConstraints',
  // Screen 5 = summary (no field)
  // Screen 6 = readiness (handled separately)
};

export const FORM_FIELD_MAP: Record<string, string> = {
  businessStage: 'q11',
  primaryGoal: 'q12',
  marketingApproach: 'q21',
  biggestConstraints: 'q39',  // plural now
};
```

- [ ] **Step 4: Run type-check to see what breaks**

Run: `npm run type-check`
Expected: Multiple errors in files that reference old types. This is expected -- we'll fix them in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add src/lib/concierge-types.ts
git commit -m "refactor: update concierge types for 5-question flow with multi-select and readiness qualifier"
```

---

## Task 2: Update Concierge Content

**Files:**
- Modify: `src/lib/concierge-content.ts`

- [ ] **Step 1: Update C1 business-stage screen (add "Other" option)**

Update the first screen in the `screens` array:

```typescript
{
  id: 'business-stage',
  eyebrow: 'Question 1 of 4',
  heading: 'Where are you in your business right now?',
  subtext: 'There is no wrong answer. This helps me calibrate the strategy to your actual situation.',
  options: [
    { id: 'just_starting', label: 'Just starting out', description: 'Building from scratch and figuring things out as you go' },
    { id: 'inconsistent', label: 'Established but inconsistent', description: 'Some weeks are great, others are quiet, and you are not sure why' },
    { id: 'fully_booked', label: 'Fully booked', description: 'You have the clients, but you want better-fit people or higher pricing' },
    { id: 'overwhelmed', label: 'Overwhelmed', description: 'You are doing too much and something has to give' },
    { id: 'stagnant', label: 'Stagnant or plateaued', description: 'Things are fine but you feel stuck and unsure what is next' },
    { id: 'other', label: 'Other', description: 'Describe your situation in your own words' },
  ],
  formField: 'q11',
  allowOther: true,  // new flag
}
```

- [ ] **Step 2: Update C2 primary-goal screen (reword last option, no "Other")**

```typescript
{
  id: 'primary-goal',
  eyebrow: 'Question 2 of 4',
  heading: 'What matters most to you right now?',
  subtext: 'Pick the one thing that, if it changed, would make the biggest difference.',
  options: [
    { id: 'more_clients', label: 'More clients', description: 'My schedule has too many open spots right now' },
    { id: 'consistent_bookings', label: 'More consistent bookings', description: 'I want steady work, not feast-or-famine' },
    { id: 'better_fit', label: 'Better-fit clients', description: 'I want to work with people who value what I do' },
    { id: 'increase_pricing', label: 'Increase my pricing', description: 'I know I am undercharging but I am not sure how to shift' },
    { id: 'free_up_schedule', label: 'Free up my schedule', description: 'I do not have enough time to add marketing on top of everything else I am already doing' },
  ],
  formField: 'q12',
  allowOther: false,
}
```

- [ ] **Step 3: Update C3 marketing-reality screen (add 7th option, no "Other")**

```typescript
{
  id: 'marketing-reality',
  eyebrow: 'Question 3 of 4',
  heading: 'How would you describe your marketing right now?',
  subtext: 'Most service providers were never taught this. No judgment here.',
  options: [
    { id: 'no_marketing', label: 'Word of mouth only', description: 'Clients find me through referrals and I do not really market' },
    { id: 'occasional', label: 'Occasional posting', description: 'I show up on social media when I feel inspired or remember' },
    { id: 'regular_no_results', label: 'Regular but not working', description: 'I am posting consistently but it does not seem to bring clients' },
    { id: 'referrals_only', label: 'Referrals and repeats', description: 'Almost all my business comes from people I already know' },
    { id: 'tried_unclear', label: 'Tried everything', description: 'I have done courses, ads, content plans, and none of it stuck' },
    { id: 'overwhelmed_start', label: 'Do not know where to start', description: 'I feel overwhelmed and I just need someone to tell me what to focus on' },
    { id: 'wrong_clients', label: 'My marketing is working -- but it is bringing in the wrong clients', description: 'I am consistently booking but the clients do not align with who I want to work with' },
  ],
  formField: 'q21',
  allowOther: false,
}
```

- [ ] **Step 4: Update C4 biggest-constraint screen (multi-select, combined Time+Burnout)**

```typescript
{
  id: 'biggest-constraint',
  eyebrow: 'Question 4 of 4',
  heading: 'What is the biggest thing standing in your way?',
  subtext: 'Knowing your real constraints helps me build a strategy that actually fits your life. Select all that apply.',
  options: [
    { id: 'money', label: 'Money', description: 'I cannot invest much right now' },
    { id: 'confidence', label: 'Confidence', description: 'I do not trust my own marketing instincts' },
    { id: 'consistency', label: 'Consistency', description: 'I start things but never stick with them' },
    { id: 'clarity', label: 'Clarity', description: 'I do not even know what my brand should be' },
    { id: 'direction', label: 'Direction', description: 'I genuinely do not know what works and what does not' },
    { id: 'time_energy', label: 'Time and energy', description: 'I went to school to master my craft, not to be a photographer, video editor, meeting manager, and marketing agent. It is all consuming.' },
    { id: 'alignment', label: 'Uncertainty about alignment', description: 'I am marketing well but not sure I am attracting the right people' },
  ],
  formField: 'q39',
  multiSelect: true,  // new flag
  allowOther: false,
}
```

- [ ] **Step 5: Update sentence mappings for summary builder**

Update `stageSentences` to include `other` key:
```typescript
const stageSentences: Record<string, string> = {
  just_starting: 'You are just getting started and building from scratch.',
  inconsistent: 'Your business is established but the consistency is not there yet.',
  fully_booked: 'You are fully booked but want better-fit clients or higher pricing.',
  overwhelmed: 'You are doing too much and something has to give.',
  stagnant: 'Things are fine but you feel stuck and ready for a shift.',
  other: '', // handled separately with free text
};
```

Update `goalSentences` -- rename `reduce_workload` to `free_up_schedule`:
```typescript
const goalSentences: Record<string, string> = {
  more_clients: 'Your top priority is getting more clients in the door.',
  consistent_bookings: 'What you want most is steady, consistent bookings.',
  better_fit: 'You are looking for better-fit clients who value what you do.',
  increase_pricing: 'You know you are undercharging and want to shift your pricing.',
  free_up_schedule: 'You need to free up your schedule so marketing does not consume everything.',
};
```

Update `marketingSentences` -- add `wrong_clients`:
```typescript
const marketingSentences: Record<string, string> = {
  no_marketing: 'Right now, you rely entirely on word of mouth.',
  occasional: 'You post when you feel inspired, but it is not consistent.',
  regular_no_results: 'You are posting regularly but not seeing the results you want.',
  referrals_only: 'Almost all your business comes from referrals and repeat clients.',
  tried_unclear: 'You have tried different approaches but nothing has clicked.',
  overwhelmed_start: 'You feel overwhelmed and just need someone to tell you what to focus on.',
  wrong_clients: 'Your marketing is working, but it is attracting the wrong people.',
};
```

Update `constraintSentences` -- now handles array:
```typescript
const constraintSentences: Record<string, string> = {
  money: 'budget is tight',
  confidence: 'you do not fully trust your marketing instincts',
  consistency: 'sticking with things has been hard',
  clarity: 'you are not sure what your brand should be',
  direction: 'you are not sure what actually works',
  time_energy: 'time and energy are your biggest bottleneck',
  alignment: 'you are not sure your marketing is attracting the right people',
};
```

- [ ] **Step 6: Update buildSummary function to handle multi-select C4 and "Other" C1**

```typescript
export function buildSummary(answers: ConciergeAnswers): string {
  const parts: string[] = [];

  if (answers.businessStage === 'other' && answers.businessStageOther) {
    parts.push(`You described your situation: "${answers.businessStageOther}"`);
  } else if (answers.businessStage && stageSentences[answers.businessStage]) {
    parts.push(stageSentences[answers.businessStage]);
  }

  if (answers.primaryGoal && goalSentences[answers.primaryGoal]) {
    parts.push(goalSentences[answers.primaryGoal]);
  }

  if (answers.marketingApproach && marketingSentences[answers.marketingApproach]) {
    parts.push(marketingSentences[answers.marketingApproach]);
  }

  if (answers.biggestConstraints.length > 0) {
    const constraintParts = answers.biggestConstraints
      .map((c) => constraintSentences[c])
      .filter(Boolean);
    if (constraintParts.length === 1) {
      parts.push(`The biggest thing standing in your way: ${constraintParts[0]}.`);
    } else if (constraintParts.length > 1) {
      const last = constraintParts.pop();
      parts.push(`The things standing in your way: ${constraintParts.join(', ')}, and ${last}.`);
    }
  }

  return parts.join(' ');
}
```

- [ ] **Step 7: Update summaryScreen CTA text**

```typescript
export const summaryScreen = {
  heading: 'Here is what I heard.',
  subtext: 'The full consultation takes about 15 to 20 minutes. Answer honestly -- the more real you are, the more useful your reset will be. Your answers are confidential and only seen by Karli.',
  cta: 'Continue to Your Consultation',
};
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/concierge-content.ts
git commit -m "feat: update concierge content for v3.0 locked decisions (C1 Other, C2 reword, C3 7th option, C4 multi-select, summary builder)"
```

---

## Task 3: Build New Concierge Components

**Files:**
- Create: `src/components/concierge/concierge-checkbox-option.tsx`
- Create: `src/components/concierge/concierge-text-option.tsx`
- Create: `src/components/concierge/concierge-readiness.tsx`

- [ ] **Step 1: Create checkbox option component for C4 multi-select**

```typescript
// src/components/concierge/concierge-checkbox-option.tsx
'use client';

import { motion } from 'framer-motion';
import { staggerItem, reducedStaggerItem, useReducedMotion } from '@/lib/motion';
import type { ConciergeOptionConfig } from '@/lib/concierge-types';

interface ConciergeCheckboxOptionProps {
  option: ConciergeOptionConfig;
  checked: boolean;
  onToggle: (id: string) => void;
}

export function ConciergeCheckboxOption({ option, checked, onToggle }: ConciergeCheckboxOptionProps) {
  const shouldReduceMotion = useReducedMotion();
  const itemVariant = shouldReduceMotion ? reducedStaggerItem : staggerItem;

  return (
    <motion.button
      variants={itemVariant}
      type="button"
      onClick={() => onToggle(option.id)}
      className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-colors ${
        checked
          ? 'border-sage-500 bg-sage-50 dark:border-sage-400 dark:bg-sage-900/30'
          : 'border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:border-dark-500'
      }`}
      aria-pressed={checked}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked
            ? 'border-sage-500 bg-sage-500 text-white'
            : 'border-brand-300 dark:border-dark-500'
        }`}>
          {checked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-base font-semibold text-brand-800 dark:text-brand-100">{option.label}</span>
          <p className="mt-0.5 text-sm text-warm-600 dark:text-warm-400">{option.description}</p>
        </div>
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 2: Create "Other" text option component for C1**

```typescript
// src/components/concierge/concierge-text-option.tsx
'use client';

import { motion } from 'framer-motion';
import { staggerItem, reducedStaggerItem, useReducedMotion } from '@/lib/motion';

interface ConciergeTextOptionProps {
  selected: boolean;
  text: string;
  onSelect: () => void;
  onTextChange: (value: string) => void;
  placeholder: string;
}

export function ConciergeTextOption({ selected, text, onSelect, onTextChange, placeholder }: ConciergeTextOptionProps) {
  const shouldReduceMotion = useReducedMotion();
  const itemVariant = shouldReduceMotion ? reducedStaggerItem : staggerItem;

  return (
    <motion.div variants={itemVariant}>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-colors ${
          selected
            ? 'border-sage-500 bg-sage-50 dark:border-sage-400 dark:bg-sage-900/30'
            : 'border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:border-dark-500'
        }`}
      >
        <span className="text-base font-semibold text-brand-800 dark:text-brand-100">Other</span>
        <p className="mt-0.5 text-sm text-warm-600 dark:text-warm-400">Describe your situation in your own words</p>
      </button>
      {selected && (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-lg border border-brand-200 bg-white px-4 py-3 text-sm text-brand-800 placeholder:text-warm-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 dark:border-dark-600 dark:bg-dark-800 dark:text-brand-100"
          autoFocus
        />
      )}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create C5 readiness qualifier component**

```typescript
// src/components/concierge/concierge-readiness.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { springs } from '@/lib/motion';

interface ConciergeReadinessProps {
  onReady: () => void;
  onNotReady: () => void;
}

export function ConciergeReadiness({ onReady, onNotReady }: ConciergeReadinessProps) {
  const [showUnsurePopup, setShowUnsurePopup] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 text-center">
      <h2 className="text-2xl font-bold text-brand-800 dark:text-brand-100 sm:text-3xl">
        Are you ready to commit to this reset?
      </h2>

      <div className="mx-auto mt-6 max-w-xl rounded-xl bg-brand-50 px-6 py-5 text-left text-sm leading-relaxed text-warm-800 dark:bg-dark-800 dark:text-warm-300">
        &ldquo;This reset requires you to be present, willing, and ready to make real changes. Nothing happens on its own -- everything I am going to give you requires you to implement it. I can show you the path, but you have to walk it. Your commitment to implementation matters more than my strategy. Whether you have zero marketing experience or years of experience, the action required is the same: you have to be ready to actually do the work.&rdquo;
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onReady} className="w-full sm:w-auto">
          Yes, I am ready
        </Button>
        <Button variant="outline" onClick={() => setShowUnsurePopup(true)} className="w-full sm:w-auto">
          I am unsure
        </Button>
        <Button variant="ghost" onClick={onNotReady} className="w-full text-warm-600 sm:w-auto">
          No, not yet
        </Button>
      </div>

      <AnimatePresence>
        {showUnsurePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 p-4"
            onClick={() => setShowUnsurePopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springs.snappy}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-800 sm:p-8"
            >
              <h3 className="text-lg font-bold text-brand-800 dark:text-brand-100">
                What does &ldquo;ready to commit&rdquo; actually mean?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                Being ready means you are willing to actually use what we create together. It means setting aside time to implement the strategies, post the content, and track the results. It means showing up for your business even when it is hard.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                Ask yourself: Do I have the bandwidth right now? Am I willing to make this a priority for the next 90 days?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                If the answer is yes, you are ready. If it is still no or maybe, that is okay -- come back when you are certain. There is no shame in waiting until you are truly ready.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => { setShowUnsurePopup(false); onReady(); }} className="w-full sm:w-auto">
                  Yes, I am ready
                </Button>
                <Button variant="outline" onClick={() => { setShowUnsurePopup(false); onNotReady(); }} className="w-full sm:w-auto">
                  I will come back later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/concierge/concierge-checkbox-option.tsx src/components/concierge/concierge-text-option.tsx src/components/concierge/concierge-readiness.tsx
git commit -m "feat: add new concierge components (checkbox multi-select, other text input, C5 readiness qualifier)"
```

---

## Task 4: Update Concierge Client State Machine

**Files:**
- Modify: `src/app/(public)/get-started/concierge-client.tsx`
- Modify: `src/components/concierge/concierge-progress.tsx`

- [ ] **Step 1: Update concierge-progress.tsx TOTAL_SCREENS**

Change the imported `TOTAL_SCREENS` usage. The constant is now 7 (from concierge-types.ts). The progress dots should show 7 positions: welcome, 4 questions, summary, readiness.

- [ ] **Step 2: Rewrite conciergeReducer in concierge-client.tsx**

The reducer needs to handle:
- `TOGGLE_CONSTRAINT` action for C4 multi-select (toggle item in/out of `biggestConstraints` array)
- `SET_OTHER_TEXT` action for C1 "Other" free text
- `SHOW_UNSURE_POPUP` / `HIDE_UNSURE_POPUP` for C5
- Updated initial state with `biggestConstraints: []`, `businessStageOther: null`, `readiness: null`, `showUnsurePopup: false`

- [ ] **Step 3: Update screen rendering logic**

Screen flow becomes:
- Screen 0: Welcome (unchanged)
- Screen 1: C1 business stage (render ConciergeTextOption for "other", ConciergeOption for the rest)
- Screen 2: C2 primary goal (unchanged pattern but updated options from content)
- Screen 3: C3 marketing reality (unchanged pattern but 7 options)
- Screen 4: C4 biggest constraints (render ConciergeCheckboxOption instead of ConciergeOption, no auto-advance on selection)
- Screen 5: Summary (unchanged, but buildSummary handles new data shapes)
- Screen 6: C5 readiness (render ConciergeReadiness component)

Key behavioral changes:
- Screen 1: If "other" selected, don't auto-advance. Wait for text input + manual "Next".
- Screen 4: Multi-select, no auto-advance. User clicks "Next" when done.
- Screen 6: Three routing paths handled by ConciergeReadiness callbacks.

- [ ] **Step 4: Update canAdvance logic**

```typescript
const canAdvance = (() => {
  if (state.currentScreen === 0) return true;  // welcome
  if (state.currentScreen === 5) return true;  // summary
  if (state.currentScreen === 6) return false; // readiness (buttons handle navigation)
  if (state.currentScreen === 1) {
    // C1: must have selection, and if "other", must have text
    if (state.answers.businessStage === 'other') {
      return (state.answers.businessStageOther?.trim().length ?? 0) > 0;
    }
    return state.answers.businessStage !== null;
  }
  if (state.currentScreen === 4) {
    // C4: must have at least one constraint selected
    return state.answers.biggestConstraints.length > 0;
  }
  // C2, C3: standard single-select
  const field = ANSWER_FIELD_MAP[state.currentScreen];
  return field ? state.answers[field] !== null : false;
})();
```

- [ ] **Step 5: Update handleContinue (concierge complete → intake form)**

Update the URL construction to handle multi-select C4 and "Other" C1:

```typescript
function handleContinue() {
  const params = new URLSearchParams({ mode: 'intake' });

  // C1 → q11
  if (answers.businessStage === 'other' && answers.businessStageOther) {
    params.set('q11', 'other');
    params.set('q11_other', answers.businessStageOther);
  } else if (answers.businessStage) {
    params.set('q11', answers.businessStage);
  }

  // C2 → q12
  if (answers.primaryGoal) params.set('q12', answers.primaryGoal);

  // C3 → q21
  if (answers.marketingApproach) params.set('q21', answers.marketingApproach);

  // C4 → q39 (multi-select, comma-separated)
  if (answers.biggestConstraints.length > 0) {
    params.set('q39', answers.biggestConstraints.join(','));
  }

  router.push(`/get-started?${params.toString()}`);
}
```

- [ ] **Step 6: Add C5 routing handlers**

```typescript
function handleReady() {
  // Proceed to intake form with concierge answers
  handleContinue();
}

function handleNotReady() {
  // Navigate to roadmap letter page (TODO: build this page)
  router.push('/not-ready');
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/(public)/get-started/concierge-client.tsx src/components/concierge/concierge-progress.tsx
git commit -m "feat: update concierge state machine for 7-screen flow with multi-select C4, Other C1, and C5 readiness routing"
```

---

## Task 5: Build Intake Form Components

**Files:**
- Create: `src/components/intake/intake-confirmation-card.tsx`
- Create: `src/components/intake/intake-link-table.tsx`

- [ ] **Step 1: Create confirmation card component**

```typescript
// src/components/intake/intake-confirmation-card.tsx
'use client';

import { useState } from 'react';

interface ConfirmationItem {
  label: string;
  value: string;
  formField: string;
}

interface IntakeConfirmationCardProps {
  items: ConfirmationItem[];
  onChangeItem: (formField: string) => void;
}

export function IntakeConfirmationCard({ items, onChangeItem }: IntakeConfirmationCardProps) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-dark-600 dark:bg-dark-800/50">
      <p className="mb-4 text-sm font-semibold text-brand-800 dark:text-brand-100">
        Here is what you told me earlier -- does this still feel right?
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.formField} className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-medium uppercase tracking-wider text-warm-500">{item.label}</span>
              <p className="text-sm text-brand-800 dark:text-brand-100">{item.value || 'Not answered'}</p>
            </div>
            <button
              type="button"
              onClick={() => onChangeItem(item.formField)}
              className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              [change]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create link table component**

```typescript
// src/components/intake/intake-link-table.tsx
'use client';

interface LinkTableRow {
  label: string;
  fieldKey: string;
  placeholder: string;
}

interface IntakeLinkTableProps {
  title: string;
  rows: LinkTableRow[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function IntakeLinkTable({ title, rows, values, onChange }: IntakeLinkTableProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-800 dark:text-brand-100">
        {title}
      </label>
      <div className="overflow-hidden rounded-lg border border-brand-200 dark:border-dark-600">
        {rows.map((row, i) => (
          <div
            key={row.fieldKey}
            className={`flex items-center ${i > 0 ? 'border-t border-brand-200 dark:border-dark-600' : ''}`}
          >
            <span className="w-36 shrink-0 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 dark:bg-dark-800 dark:text-brand-100 sm:w-44">
              {row.label}
            </span>
            <input
              type="text"
              value={values[row.fieldKey] || ''}
              onChange={(e) => onChange(row.fieldKey, e.target.value)}
              placeholder={row.placeholder}
              maxLength={500}
              className="min-w-0 flex-1 border-l border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sage-500/20 dark:border-dark-600 dark:bg-dark-900 dark:text-brand-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/intake/intake-confirmation-card.tsx src/components/intake/intake-link-table.tsx
git commit -m "feat: add confirmation card and compact link table components for streamlined consultation form"
```

---

## Task 6: Update Validation Schema

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/__tests__/lib/validation.test.ts`

- [ ] **Step 1: Write failing tests for new schema**

Add tests for:
- Combined field `q07_q08_services` (replaces q07 + q08)
- New field `q08c_passion_purpose`
- New field `q10_capacity_to_add` (replaces q10 + q18)
- Combined field `q22_q23_marketing_feelings` (replaces q22 + q23, array)
- Combined field `q30_q31_service_focus` (replaces q30 + q31)
- Combined field `q32_q33_pricing` (replaces q32 + q33)
- Combined field `q35_q36_tech_comfort` (replaces q35 + q36)
- Conditional field `q36b_ai_frequency` (optional)
- New fields: `q40b` through `q40g` (voice/rhythm section)
- Multi-select `q39_biggest_constraints` (array, replaces q39 string)
- Link table fields: `links_website`, `links_gmb`, `links_booking`, `links_yelp`, `links_other`, `socials_instagram`, `socials_facebook`, `socials_tiktok`, `socials_other1`, `socials_other2`
- Removed fields should NOT be in schema: q07, q08, q10, q18, q20b, q20c, q20d, q22, q23, q26, q30, q31, q32, q33, q35, q36, q41, q42, q43, q44, q45, q46

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/__tests__/lib/validation.test.ts`
Expected: FAIL

- [ ] **Step 3: Update publicIntakeSchema**

Rewrite the schema to match the streamlined form. Keep all existing fields that didn't change, remove cut fields, add new/combined fields. The full schema is too large to include inline -- follow the field list in the mockup exactly.

Key changes:
- `q39_biggest_constraints: z.array(z.string().max(200)).optional()` (was single string)
- All new `q40b` through `q40g` fields as optional strings/arrays
- Link table fields as optional strings with max 500
- Combined fields replace their originals

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --run src/__tests__/lib/validation.test.ts`
Expected: PASS

- [ ] **Step 5: Run full type-check**

Run: `npm run type-check`
Expected: May have errors in intake-form-client.tsx (expected, fixed in Task 7)

- [ ] **Step 6: Commit**

```bash
git add src/lib/validation.ts src/__tests__/lib/validation.test.ts
git commit -m "feat: update validation schema for streamlined consultation form (combined fields, new questions, removed cuts)"
```

---

## Task 7: Rewrite Intake Form Client

**Files:**
- Modify: `src/app/(public)/get-started/intake-form-client.tsx`
- Modify: `src/app/(public)/get-started/intake-steps.ts`

This is the largest task. The form goes from 6 steps / 54 questions to 6 steps / ~39 fields.

- [ ] **Step 1: Update intake-steps.ts**

```typescript
export const intakeSteps: IntakeStepConfig[] = [
  { id: 'business-snapshot', label: 'Business Snapshot', shortLabel: 'Business' },
  { id: 'capacity-stage', label: 'Where You Are Now', shortLabel: 'Stage' },
  { id: 'clients-flow', label: 'Your Clients', shortLabel: 'Clients' },
  { id: 'marketing-reality', label: 'Marketing Reality', shortLabel: 'Marketing' },
  { id: 'offers-goals-voice', label: 'Goals and Voice', shortLabel: 'Goals' },
  { id: 'consent', label: 'You Made It', shortLabel: 'Done' },
];

export const TOTAL_INTAKE_STEPS = intakeSteps.length;
```

- [ ] **Step 2: Update defaultCheckboxFields**

```typescript
const defaultCheckboxFields = {
  q17_client_sources: [],
  q22_q23_marketing_feelings: [],  // combined
  q25_platforms_used: [],
  q28_stopped_reason: [],
  q37_help_wanted: [],
  q39_biggest_constraints: [],     // now multi-select
  q40c_content_enjoyment: [],      // new
};
```

- [ ] **Step 3: Update URL prefill logic for multi-select Q39**

```typescript
// In the useEffect that reads URL params:
const q39Param = searchParams.get('q39');
if (q39Param) {
  const constraints = q39Param.split(',');
  setCheckboxFields((prev) => ({ ...prev, q39_biggest_constraints: constraints }));
}
```

- [ ] **Step 4: Rewrite Step 0 (Business Snapshot + Online Presence)**

Fields: q01, q02*, q03*, q04, q05, q06, q07_q08 (combined), q08b, q08c (new), links table, socials table

Use `IntakeLinkTable` component for the two compact tables.

- [ ] **Step 5: Rewrite Step 1 (Capacity + Confirmation Card)**

Fields: Confirmation card (pre-filled from concierge), q09*, q10_capacity_to_add (new), q13* (conversational radio)

Use `IntakeConfirmationCard` component. The confirmation card shows C1-C4 answers with [change] links.

- [ ] **Step 6: Rewrite Step 2 (Ideal Clients + Client Flow)**

Fields: q14, q15, q16, q17*, q19, q19b, q19c*, q20

Removed: q18 (replaced by q10_capacity_to_add in Step 1), q20b, q20c

- [ ] **Step 7: Rewrite Step 3 (Marketing Reality + Social Media)**

Fields: q22_q23* (combined checkboxes), q24*, q25 (conditional), q27 (conditional), q28 (conditional), q29 (conditional)

Removed: q20d, q21 (in confirmation card), q26

- [ ] **Step 8: Rewrite Step 4 (Offers, Goals, Voice)**

Fields: q30_q31 (combined), q32_q33 (combined), q34*, q35_q36* (combined), q36b (conditional on tech comfort), q37*, q38*, q40, q40b* (new), q40c (new checkboxes), q40d* (new), q40e (new), q40f (new), q40g* (new), q47

Removed: q39 (in confirmation card)

- [ ] **Step 9: Rewrite Step 5 (Consent)**

Single consent checkbox with warm close text. This is now a minimal step -- just q48.

- [ ] **Step 10: Update form submission to build new field structure**

The handleSubmit function needs to:
- Collect all new/combined field names
- Include checkbox arrays from updated defaultCheckboxFields
- Skip removed fields
- POST to `/api/intake` as before

- [ ] **Step 11: Update submit button text in intake-step-nav.tsx**

Change "Submit Intake Form" to "Submit Your Consultation"

- [ ] **Step 12: Run type-check**

Run: `npm run type-check`
Expected: 0 errors

- [ ] **Step 13: Commit**

```bash
git add src/app/(public)/get-started/intake-form-client.tsx src/app/(public)/get-started/intake-steps.ts src/components/intake/intake-step-nav.tsx
git commit -m "feat: rewrite consultation form with streamlined questions, confirmation card, compact link tables, combined fields"
```

---

## Task 8: Update API Route

**Files:**
- Modify: `src/app/api/intake/route.ts`

- [ ] **Step 1: Update the POST handler to use new publicIntakeSchema**

The API route already uses `publicIntakeSchema.safeParse(body)` and stores everything as JSONB. Since we updated the schema in Task 6, the route should work with the new field names automatically. Verify:

- New combined fields (q07_q08, q22_q23, etc.) are sanitized as strings
- New array fields (q39_biggest_constraints, q40c_content_enjoyment, q22_q23_marketing_feelings) are stored as string arrays
- Link table fields (links_website, socials_instagram, etc.) are sanitized as strings
- Removed fields are no longer accepted by the schema

- [ ] **Step 2: Run type-check**

Run: `npm run type-check`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/intake/route.ts
git commit -m "fix: update intake API route for new consultation form field structure"
```

---

## Task 9: Language Swap ("intake" → "consultation")

**Files:**
- Modify: Multiple files (see list below)

- [ ] **Step 1: Search for all user-facing "intake" references**

Run: `grep -rn "intake\|Intake\|INTAKE" src/ --include="*.tsx" --include="*.ts" -l`

This will find all files. Only change USER-FACING strings (UI text, aria labels, meta descriptions). Do NOT rename:
- File names (intake-form-client.tsx stays)
- Variable names (intakeSteps stays)
- CSS class names
- Database field names (intakeData stays)
- API route paths (/api/intake stays)

- [ ] **Step 2: Update each file's user-facing strings**

Key replacements:
- "Intake Form" → "Your Consultation" (badge/eyebrow text)
- "intake form" → "consultation" or "consultation form" (body copy)
- "Continue to Intake Form" → "Continue to Your Consultation" (CTA)
- "Submit Intake Form" → "Submit Your Consultation" (submit button)
- "This intake form takes about 30 to 45 minutes" → "This consultation takes about 15 to 20 minutes"

- [ ] **Step 3: Update page metadata in get-started/page.tsx**

```typescript
export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Begin your Marketing Reset with a guided consultation. Answer a few questions to help Karli understand your business and prepare your personalized strategy session.',
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: language swap 'intake' to 'consultation' in all user-facing strings"
```

---

## Task 10: Update Tests

**Files:**
- Modify: `src/__tests__/lib/validation.test.ts` (already updated in Task 6)
- Modify: `e2e/public-site.spec.ts`
- Modify: `e2e/accessibility.spec.ts`

- [ ] **Step 1: Update E2E tests for new form structure**

The public-site spec likely tests for form elements that changed. Update selectors and assertions to match:
- New step labels
- Combined fields
- Confirmation card
- Link tables
- "consultation" text instead of "intake"

- [ ] **Step 2: Update accessibility tests**

Ensure:
- All new form fields have labels
- Confirmation card is keyboard accessible
- Link table inputs have accessible names
- C5 readiness popup has proper focus trapping and ARIA

- [ ] **Step 3: Run all tests**

Run: `npm run test`
Expected: All passing

Run: `npx playwright test`
Expected: All passing (may need dev server running)

- [ ] **Step 4: Run full quality gates**

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

Expected: All 4 passing with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: update unit and E2E tests for consultation form redesign"
```

---

## Task 11: Create "Not Ready" Placeholder Page

**Files:**
- Create: `src/app/(public)/not-ready/page.tsx`

- [ ] **Step 1: Create placeholder page for C5 "No, not yet" routing**

The roadmap letter copy is not yet written (flagged in v3.0 doc). Create a warm placeholder page that:
- Thanks them for their honesty
- Explains the reset works best when they're ready
- Tells them to come back when they're certain
- Mentions the $20 discount code (placeholder -- actual code TBD)
- Has a "Back to Home" link

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/not-ready/page.tsx
git commit -m "feat: add placeholder 'not ready' page for C5 routing (copy TBD)"
```

---

## Summary

| Task | Description | Estimated Complexity |
|------|-------------|---------------------|
| 1 | Update concierge types | Small |
| 2 | Update concierge content | Medium |
| 3 | Build new concierge components | Medium |
| 4 | Update concierge state machine | Large |
| 5 | Build intake form components | Small |
| 6 | Update validation schema | Medium |
| 7 | Rewrite intake form client | Large (biggest task) |
| 8 | Update API route | Small |
| 9 | Language swap | Small |
| 10 | Update tests | Medium |
| 11 | Not Ready placeholder page | Small |

**Total: 11 tasks, ~45-55 steps**

**Dependencies:** Tasks 1-3 can run in parallel. Task 4 depends on 1-3. Task 5 is independent. Task 6 is independent. Task 7 depends on 5 and 6. Task 8 depends on 6. Task 9 depends on 7. Task 10 depends on all. Task 11 is independent.
