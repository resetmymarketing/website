'use client';

import { intakeSteps } from '@/app/(public)/get-started/intake-steps';

interface IntakeProgressBarProps {
  currentStep: number;
}

export function IntakeProgressBar({ currentStep }: IntakeProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Mobile: simple text */}
      <p className="text-sm font-medium text-brand-600 sm:hidden">
        Step {currentStep + 1} of {intakeSteps.length}: {intakeSteps[currentStep].label}
      </p>

      {/* Desktop: segmented bar */}
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={intakeSteps.length}
        aria-label={`Step ${currentStep + 1} of ${intakeSteps.length}: ${intakeSteps[currentStep].label}`}
        className="hidden sm:block"
      >
        <div className="flex gap-1">
          {intakeSteps.map((step, i) => (
            <div key={step.id} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  i <= currentStep
                    ? i === currentStep
                      ? 'bg-sage-500'
                      : 'bg-brand-400'
                    : 'bg-brand-100'
                }`}
              />
              <p
                className={`mt-1.5 text-xs transition-colors ${
                  i === currentStep
                    ? 'font-medium text-sage-600'
                    : i < currentStep
                      ? 'text-brand-500'
                      : 'text-warm-400'
                }`}
              >
                {step.shortLabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
