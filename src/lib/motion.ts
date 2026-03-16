'use client';

import { useReducedMotion } from 'framer-motion';
import type { Transition, Variants } from 'framer-motion';

export { useReducedMotion };

export const springs = {
  snappy: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  smooth: { type: 'spring', stiffness: 200, damping: 26 } as Transition,
  gentle: { type: 'spring', stiffness: 80, damping: 15 } as Transition,
};

export const fade = { duration: 0.2 } satisfies Transition;

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export const reducedSlideVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const reducedStaggerItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};
