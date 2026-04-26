'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';
import { SunBadge } from '@/components/brand/SunBadge';

interface SunArcProps {
  size?: number;
  className?: string;
}

/**
 * Ambient sun ornament that traverses the viewport on scroll. Sticky in
 * the parent wrapper so the sun stays in view while the user reads, while
 * its horizontal/vertical position interpolates as the page scrolls.
 *
 * Reduced motion: stays at its starting position (top-right of viewport).
 *
 * Usage: drop inside a `relative` parent that is the full scrollable
 * height of the page (e.g. the page root <div>).
 */
export function SunArc({ size = 120, className }: SunArcProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['85%', '15%']);
  const y = useTransform(scrollYProgress, [0, 1], ['8vh', '70vh']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 35]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 ${className ?? ''}`}
    >
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          left: reduced ? '85%' : x,
          translateY: reduced ? '8vh' : y,
          rotate: reduced ? 0 : rotate,
          width: size,
          height: size,
        }}
      >
        <SunBadge size={size} />
      </motion.div>
    </div>
  );
}
