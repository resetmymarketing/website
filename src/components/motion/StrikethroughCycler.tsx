'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';
import { Highlight } from './Highlight';

interface StrikethroughCyclerProps {
  tactics: readonly string[];
  resolution: string;
  resolutionEmphasis?: string;
  cycleMs?: number;
  className?: string;
}

/**
 * Cycles through bad-marketing-advice tactics, each striking through, then
 * settles on the resolution line. The resolution can wrap an emphasis word
 * with the <Highlight> component.
 *
 * Reduced motion: the resolution line shows immediately, no cycling.
 * Decorated as aria-live="polite" so screen readers hear only the final state.
 */
export function StrikethroughCycler({
  tactics,
  resolution,
  resolutionEmphasis,
  cycleMs = 1400,
  className,
}: StrikethroughCyclerProps) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<'cycle' | 'resolution'>(reduced ? 'resolution' : 'cycle');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    if (index >= tactics.length) {
      setStage('resolution');
      return;
    }
    const id = window.setTimeout(() => setIndex((i) => i + 1), cycleMs);
    return () => window.clearTimeout(id);
  }, [index, tactics.length, cycleMs, reduced]);

  return (
    <span
      className={className}
      aria-live="polite"
      aria-atomic="true"
      style={{ display: 'inline-block', minHeight: '1.2em' }}
    >
      <AnimatePresence mode="wait">
        {stage === 'cycle' && tactics[index] ? (
          <motion.span
            key={`tactic-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="inline-block"
            style={{
              textDecoration: 'line-through',
              textDecorationColor: 'var(--lemonade-400)',
              textDecorationThickness: '4px',
            }}
          >
            {tactics[index]}
          </motion.span>
        ) : (
          <motion.span
            key="resolution"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="inline-block italic"
          >
            {resolutionEmphasis
              ? splitWithHighlight(resolution, resolutionEmphasis)
              : resolution}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function splitWithHighlight(text: string, emphasis: string): React.ReactNode {
  const idx = text.indexOf(emphasis);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + emphasis.length);
  return (
    <>
      {before}
      <Highlight color="limeade">{emphasis}</Highlight>
      {after}
    </>
  );
}
