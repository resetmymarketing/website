'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';

interface NoiseToSignalProps {
  noise: readonly string[];
  signalHeadline: string;
  signalBody: string;
}

/**
 * Deterministic chip positions arranged around (above + below) the centered
 * signal headline. Each entry: [topPercent, leftPercent, rotateDeg].
 * Order matters — chips fade in left-to-right as the marker passes them.
 */
const CHIP_POSITIONS: readonly (readonly [number, number, number])[] = [
  [10, 6, -8],
  [16, 28, 4],
  [8, 56, -3],
  [18, 80, 6],
  [40, 4, -5],
  [44, 84, 3],
  [62, 8, 7],
  [58, 78, -7],
  [78, 22, -2],
  [86, 48, 5],
  [82, 70, -6],
  [90, 90, 8],
] as const;

/**
 * Splits a headline like "One sentence. The one that fits you." into
 * { emphasis: "One sentence.", rest: "The one that fits you." } so the first
 * sentence can be italicized without hardcoding the wording in the component.
 */
function splitFirstSentence(text: string): { emphasis: string; rest: string } {
  const idx = text.indexOf('.');
  if (idx === -1) return { emphasis: text, rest: '' };
  return {
    emphasis: text.slice(0, idx + 1),
    rest: text.slice(idx + 1).trim(),
  };
}

interface NoiseChipProps {
  text: string;
  scrollYProgress: MotionValue<number>;
  position: readonly [number, number, number];
  reduced: boolean | null;
}

function NoiseChip({ text, scrollYProgress, position, reduced }: NoiseChipProps) {
  const [top, left, rotate] = position;
  // Chip's onset fraction along the marker sweep range (0.05 → 0.7).
  const onset = 0.05 + (left / 100) * 0.65;
  const fadeStart = Math.max(0, onset - 0.02);
  const fadeEnd = Math.min(1, onset + 0.05);

  const opacity = useTransform(
    scrollYProgress,
    [0, fadeStart, fadeEnd],
    [0.75, 0.75, 0],
  );

  return (
    <motion.span
      className="absolute whitespace-nowrap rounded-full bg-white px-5 py-2 text-base font-medium text-lapis-700 shadow-md"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        rotate: `${rotate}deg`,
        fontFamily: 'var(--font-inter)',
        opacity: reduced ? 0 : opacity,
        textDecoration: 'line-through',
        textDecorationColor: 'var(--limeade-500)',
        textDecorationThickness: '3px',
      }}
    >
      {text}
    </motion.span>
  );
}

/**
 * "Highlighter Sweep with Persistent Signal" — Slice 2 redesign of the
 * Noise-to-Signal moment.
 *
 * The signal headline + body are visible at full opacity from frame 1
 * (the answer was always there). Around them, marketing-tactic chips sit
 * scattered at ~75% opacity, partially overlapping the perimeter. As the
 * visitor scrolls through the section, a Limeade marker sweeps left-to-right
 * across the viewport; each chip fades to 0 as the marker passes its left
 * position. By the end, all chips are gone and the signal is alone on
 * Pacific-50.
 *
 * Reduced motion: chips invisible from frame 1, marker hidden, signal at
 * full opacity. Same final state, no animation cost.
 */
export function NoiseToSignal({
  noise,
  signalHeadline,
  signalBody,
}: NoiseToSignalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const markerX = useTransform(scrollYProgress, [0.05, 0.7], ['-20%', '120%']);
  const markerOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.12, 0.62, 0.7],
    [0, 1, 1, 0],
  );

  const { emphasis, rest } = splitFirstSentence(signalHeadline);
  const chipsToRender = noise.slice(0, CHIP_POSITIONS.length);

  return (
    <section
      ref={ref}
      className="relative z-10 isolate bg-pacific-50"
      style={reduced ? undefined : { minHeight: '180vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto h-[80vh] w-full max-w-5xl">
          {/* Always-present signal — full opacity from frame 1 */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <h2
              className="text-4xl leading-tight text-lapis-700 sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              <span className="italic">{emphasis}</span>
              {rest && (
                <>
                  {' '}
                  <span className="block sm:inline">{rest}</span>
                </>
              )}
            </h2>
            <p
              className="mt-6 max-w-2xl text-lg text-lapis-800 sm:text-xl"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {signalBody}
            </p>
          </div>

          {/* Noise chips scattered around the signal */}
          {chipsToRender.map((chip, i) => (
            <NoiseChip
              key={chip}
              text={chip}
              scrollYProgress={scrollYProgress}
              position={CHIP_POSITIONS[i]}
              reduced={reduced}
            />
          ))}

          {/* Limeade marker sweep */}
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 z-20 h-2 w-[40%] rounded-full"
              style={{
                left: markerX,
                opacity: markerOpacity,
                translateY: '-50%',
                background:
                  'linear-gradient(90deg, transparent, var(--limeade-400) 30%, var(--limeade-400) 70%, transparent)',
                filter: 'blur(1px)',
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
