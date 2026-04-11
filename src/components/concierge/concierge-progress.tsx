'use client';

import { TOTAL_SCREENS } from '@/lib/concierge-types';

interface ConciergeProgressProps {
  currentScreen: number;
}

export function ConciergeProgress({ currentScreen }: ConciergeProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentScreen}
      aria-valuemin={0}
      aria-valuemax={TOTAL_SCREENS - 1}
      aria-label={`Step ${currentScreen + 1} of ${TOTAL_SCREENS}`}
      className="flex items-center justify-center gap-2"
    >
      {Array.from({ length: TOTAL_SCREENS }, (_, i) => (
        <span
          key={i}
          aria-current={i === currentScreen ? 'step' : undefined}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === currentScreen
              ? 'w-6 bg-sage-500'
              : i < currentScreen
                ? 'w-2 bg-sage-400'
                : 'w-2 bg-brand-200'
          }`}
        />
      ))}
    </div>
  );
}
