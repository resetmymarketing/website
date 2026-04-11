'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TOTAL_INTAKE_STEPS } from '@/app/(public)/get-started/intake-steps';

interface IntakeStepNavProps {
  currentStep: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function IntakeStepNav({
  currentStep,
  isSubmitting,
  onBack,
  onNext,
}: IntakeStepNavProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_INTAKE_STEPS - 1;

  return (
    <div className="mt-8 flex items-center justify-between">
      {!isFirst ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {isLast ? (
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? 'Submitting...' : 'Submit Your Consultation'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
