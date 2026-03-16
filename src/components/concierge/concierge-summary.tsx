'use client';

import { buildSummary, summaryScreen } from '@/lib/concierge-content';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { ConciergeAnswers } from '@/lib/concierge-types';

interface ConciergeSummaryProps {
  answers: ConciergeAnswers;
  onContinue: () => void;
}

export function ConciergeSummary({ answers, onContinue }: ConciergeSummaryProps) {
  const summary = buildSummary(answers);

  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <h2 className="text-3xl font-bold text-brand-800 dark:text-brand-100 sm:text-4xl">
        {summaryScreen.heading}
      </h2>

      <p
        aria-live="polite"
        className="mt-6 text-lg leading-relaxed text-warm-700 dark:text-warm-300"
      >
        {summary}
      </p>

      <p className="mt-6 text-sm text-warm-500 dark:text-warm-400">
        {summaryScreen.subtext}
      </p>

      <Button
        onClick={onContinue}
        className="mt-8 gap-2"
        size="lg"
      >
        {summaryScreen.cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
