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
            ? 'border-sage-500 bg-sage-50'
            : 'border-brand-200 bg-white hover:border-brand-300 hover:bg-brand-50:border-dark-500'
        }`}
      >
        <span className="text-base font-semibold text-brand-800">Other</span>
        <p className="mt-0.5 text-sm text-warm-600">Describe your situation in your own words</p>
      </button>
      {selected && (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-lg border border-brand-200 bg-white px-4 py-3 text-sm text-brand-800 placeholder:text-warm-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
          autoFocus
        />
      )}
    </motion.div>
  );
}
