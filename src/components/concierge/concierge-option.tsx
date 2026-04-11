'use client';

import { motion } from 'framer-motion';
import { useReducedMotion, staggerItem, reducedStaggerItem, springs } from '@/lib/motion';
import type { ConciergeOptionConfig } from '@/lib/concierge-types';

interface ConciergeOptionProps {
  option: ConciergeOptionConfig;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ConciergeOption({ option, selected, onSelect }: ConciergeOptionProps) {
  const reducedMotion = useReducedMotion();
  const variants = reducedMotion ? reducedStaggerItem : staggerItem;

  return (
    <motion.button
      type="button"
      variants={variants}
      transition={springs.snappy}
      onClick={() => onSelect(option.id)}
      role="radio"
      aria-checked={selected}
      className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 ${
        selected
          ? 'border-sage-500 bg-sage-50'
          : 'border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50:border-brand-600:bg-brand-800'
      }`}
    >
      <span
        className={`block text-base font-semibold ${
          selected
            ? 'text-sage-700'
            : 'text-brand-800'
        }`}
      >
        {option.label}
      </span>
      <span className="mt-1 block text-sm text-warm-600">
        {option.description}
      </span>
    </motion.button>
  );
}
