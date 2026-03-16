'use client';

import { motion } from 'framer-motion';
import {
  useReducedMotion,
  slideVariants,
  reducedSlideVariants,
  springs,
  fade,
} from '@/lib/motion';
import type { ReactNode } from 'react';

interface ConciergeScreenProps {
  direction: number;
  screenKey: string;
  children: ReactNode;
}

export function ConciergeScreen({
  direction,
  screenKey,
  children,
}: ConciergeScreenProps) {
  const reducedMotion = useReducedMotion();
  const variants = reducedMotion ? reducedSlideVariants : slideVariants;
  const transition = reducedMotion ? fade : springs.snappy;

  return (
    <motion.div
      key={screenKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="absolute inset-0 flex flex-col items-center justify-center px-4"
    >
      {children}
    </motion.div>
  );
}
