'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { ConciergeProgress } from './concierge-progress';

interface ConciergeShellProps {
  currentScreen: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode;
}

export function ConciergeShell({
  currentScreen,
  canAdvance,
  onNext,
  onBack,
  children,
}: ConciergeShellProps) {
  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canAdvance) {
        e.preventDefault();
        onNext();
      }
      if (e.key === 'Escape' && currentScreen > 0) {
        e.preventDefault();
        onBack();
      }
    },
    [canAdvance, currentScreen, onNext, onBack],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-brand-950">
      {/* Progress dots */}
      <div className="flex-none px-4 pt-6 pb-2">
        <ConciergeProgress currentScreen={currentScreen} />
      </div>

      {/* Screen content */}
      <div className="relative flex-1 overflow-hidden">{children}</div>

      {/* Back button (only after welcome) */}
      {currentScreen > 0 && (
        <div className="flex-none px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-warm-500 underline-offset-2 hover:text-warm-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 dark:text-warm-400 dark:hover:text-warm-200"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
