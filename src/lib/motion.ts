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

/**
 * Highlight stroke variants — used by <Highlight> component to animate an SVG
 * path's strokeDashoffset from full (hidden) to 0 (revealed).
 *
 * The path is expected to be set up with stroke-dasharray equal to its total
 * length, and initial strokeDashoffset equal to that length. Animating to 0
 * draws the stroke on screen left-to-right.
 */
export const highlightStrokeVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
  },
};

export const reducedHighlightStrokeVariants: Variants = {
  hidden: { pathLength: 1, opacity: 1 },
  show: { pathLength: 1, opacity: 1 },
};
