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
      className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-colors ${
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
          <span className="text-sm font-semibold text-brand-800 dark:text-brand-100">{option.label}</span>
          <p className="mt-0.5 text-xs leading-relaxed text-warm-600 dark:text-warm-400">{option.description}</p>
        </div>
      </div>
    </motion.button>
  );
}
