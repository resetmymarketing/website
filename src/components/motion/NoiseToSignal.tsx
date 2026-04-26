'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';

interface NoiseToSignalProps {
  noise: readonly string[];
  signalHeadline: string;
  signalBody: string;
}

/**
 * Pinned scene: as the visitor scrolls through this section, the noise
 * column on the left fades and shrinks while the signal column on the
 * right resolves into a single clear sentence.
 *
 * Reduced motion: shows both columns in their final state immediately,
 * no pinning, no scaling.
 */
export function NoiseToSignal({ noise, signalHeadline, signalBody }: NoiseToSignalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Tightened timing: chips stay readable until 40%, snap out by 55%.
  // Signal fades in 45%-65%, with brief overlap so the cross-fade reads
  // as one motion rather than two disconnected ones.
  const noiseOpacity = useTransform(scrollYProgress, [0, 0.4, 0.55], [1, 1, 0]);
  const noiseScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.7]);
  const signalOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative z-10 isolate bg-pacific-50"
      style={reduced ? undefined : { minHeight: '130vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            style={reduced ? undefined : { opacity: noiseOpacity, scale: noiseScale }}
            className="flex flex-wrap content-start gap-2"
          >
            {noise.map((chip, i) => (
              <span
                key={chip}
                className="inline-block rounded-full bg-white px-4 py-2 text-sm text-lapis-700 shadow-sm"
                style={{
                  fontFamily: 'var(--font-inter)',
                  transform: `rotate(${(i % 5) - 2}deg)`,
                }}
              >
                {chip}
              </span>
            ))}
          </motion.div>
          <motion.div
            style={reduced ? undefined : { opacity: signalOpacity }}
            className="flex flex-col justify-center"
          >
            <h2
              className="text-3xl text-lapis-700 sm:text-4xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {signalHeadline}
            </h2>
            <p
              className="mt-4 text-lg text-lapis-800"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {signalBody}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
