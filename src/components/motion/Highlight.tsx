'use client';

import { motion } from 'framer-motion';
import {
  useReducedMotion,
  highlightStrokeVariants,
  reducedHighlightStrokeVariants,
} from '@/lib/motion';

type HighlightColor = 'limeade' | 'lemonade' | 'lime' | 'pacific';

const STROKE_VAR: Record<HighlightColor, string> = {
  limeade: 'var(--limeade-400)',
  lemonade: 'var(--lemonade-400)',
  lime: 'var(--lime-400)',
  pacific: 'var(--pacific-400)',
};

interface HighlightProps {
  children: React.ReactNode;
  color?: HighlightColor;
  className?: string;
}

/**
 * Wraps inline content with an animated highlighter stroke beneath it.
 * Stroke draws on enter via Framer; under prefers-reduced-motion, it appears
 * fully drawn with no animation.
 */
export function Highlight({ children, color = 'limeade', className }: HighlightProps) {
  const reduced = useReducedMotion();
  const variants = reduced ? reducedHighlightStrokeVariants : highlightStrokeVariants;

  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-1 z-0 h-3 w-full"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M2 6 Q 50 2, 98 6"
          fill="none"
          stroke={STROKE_VAR[color]}
          strokeWidth={8}
          strokeLinecap="round"
          variants={variants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
        />
      </svg>
    </span>
  );
}
