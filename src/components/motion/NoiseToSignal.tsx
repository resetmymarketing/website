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
  // Animation: noise starts fading EARLIER (10%) and fade is LONGER (10%-55%).
  // Signal starts fading in at 35% and lands at 80% — wider, more breathing room.
  const noiseOpacity = useTransform(scrollYProgress, [0, 0.1, 0.55], [1, 1, 0]);
  const noiseScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.65]);
  const signalOpacity = useTransform(scrollYProgress, [0.35, 0.8], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative z-10 isolate bg-pacific-50"
      style={reduced ? undefined : { minHeight: '200vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            style={reduced ? undefined : { opacity: noiseOpacity, scale: noiseScale }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {noise.map((chip, i) => (
              <span
                key={chip}
                className="inline-block rounded-full bg-white px-6 py-3 text-base font-medium text-lapis-700 shadow-md sm:text-lg"
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
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <h2
              className="text-4xl text-lapis-700 sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {signalHeadline}
            </h2>
            <p
              className="mt-6 text-xl text-lapis-800 sm:text-2xl"
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
