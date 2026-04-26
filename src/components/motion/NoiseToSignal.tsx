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
 * Deterministic chip positions arranged around the centered signal headline.
 * Each entry: [topPercent, leftPercent, rotateDeg].
 * Order matters — chips strike sequentially in this order.
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
 * Sequential strikethrough timeline. Each chip's strike takes 10% of scroll;
 * the next chip starts when the previous is 25% drawn (stagger of 2.5%).
 * Chip 0:  strike 5-15%,    fade 15-20%
 * Chip 1:  strike 7.5-17.5%, fade 17.5-22.5%
 * ...
 * Chip 11: strike 32.5-42.5%, fade 42.5-47.5%
 *
 * After ~50% of chips have struck out (~27.5% scroll), headline words start
 * fading in word-by-word from 30% to 71%. Body fades 70-82%. Last 18% holds.
 */
const STRIKE_WINDOW = 0.1;
const STRIKE_STAGGER = 0.025;
const STRIKE_BASE = 0.05;
const FADE_AFTER_STRIKE = 0.05;

const HEADLINE_BASE = 0.3;
const HEADLINE_WORD_WINDOW = 0.05;
const HEADLINE_WORD_STAGGER = 0.06;

const BODY_FADE_IN: [number, number] = [0.7, 0.82];

function splitFirstSentence(text: string): { emphasis: string; rest: string } {
  const idx = text.indexOf('.');
  if (idx === -1) return { emphasis: text, rest: '' };
  return {
    emphasis: text.slice(0, idx + 1),
    rest: text.slice(idx + 1).trim(),
  };
}

interface HeadlineWord {
  text: string;
  italic: boolean;
}

function buildHeadlineWords(headline: string): HeadlineWord[] {
  const { emphasis, rest } = splitFirstSentence(headline);
  const eWords = emphasis.split(/\s+/).filter(Boolean).map((text) => ({ text, italic: true }));
  const rWords = rest.split(/\s+/).filter(Boolean).map((text) => ({ text, italic: false }));
  return [...eWords, ...rWords];
}

interface NoiseChipProps {
  text: string;
  scrollYProgress: MotionValue<number>;
  position: readonly [number, number, number];
  index: number;
  reduced: boolean | null;
}

function NoiseChip({
  text,
  scrollYProgress,
  position,
  index,
  reduced,
}: NoiseChipProps) {
  const [top, left, rotate] = position;
  const strikeStart = STRIKE_BASE + STRIKE_STAGGER * index;
  const strikeEnd = strikeStart + STRIKE_WINDOW;
  const fadeEnd = strikeEnd + FADE_AFTER_STRIKE;

  const strike = useTransform(scrollYProgress, [strikeStart, strikeEnd], [0, 1], {
    clamp: true,
  });
  const opacity = useTransform(
    scrollYProgress,
    [0, strikeEnd, fadeEnd],
    [0.85, 0.85, 0],
    { clamp: true },
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
      }}
    >
      <span className="relative inline-block">
        {text}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full bg-limeade-500"
          style={{ scaleX: reduced ? 1 : strike }}
        />
      </span>
    </motion.span>
  );
}

interface SignalWordProps {
  word: HeadlineWord;
  scrollYProgress: MotionValue<number>;
  index: number;
  reduced: boolean | null;
}

function SignalWord({ word, scrollYProgress, index, reduced }: SignalWordProps) {
  const start = HEADLINE_BASE + HEADLINE_WORD_STAGGER * index;
  const end = start + HEADLINE_WORD_WINDOW;
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1], { clamp: true });

  return (
    <motion.span
      className={`inline-block ${word.italic ? 'italic' : ''}`}
      style={{ opacity: reduced ? 1 : opacity }}
    >
      {word.text}
      {' '}
    </motion.span>
  );
}

/**
 * "Sequential strike + word-by-word reveal" — the Slice 2 redesigned
 * Noise-to-Signal moment.
 *
 * Phase 1 (0-50% of scroll, roughly): chips visible in their final-state
 * positions, then strike out sequentially with a Limeade marker bar growing
 * from left-to-right across each chip. Each chip's strike starts when the
 * previous is 25% drawn, then the chip fades to 0 after its strike completes.
 *
 * Phase 2 (~30-71% of scroll): once half the chips have struck, the signal
 * headline assembles word by word. Each word fades in over a 5% scroll
 * window with 6% stagger. The body copy fades in toward the end.
 *
 * Phase 3 (last 18% of scroll): hold. Signal pristine, all noise gone.
 *
 * Reduced motion: chips invisible from frame 1, all words and body visible
 * from frame 1, no animation.
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

  const headlineWords = buildHeadlineWords(signalHeadline);
  const chipsToRender = noise.slice(0, CHIP_POSITIONS.length);
  const bodyOpacity = useTransform(
    scrollYProgress,
    BODY_FADE_IN,
    reduced ? [1, 1] : [0, 1],
    { clamp: true },
  );

  return (
    <section
      ref={ref}
      className="relative z-10 isolate bg-pacific-50"
      style={reduced ? undefined : { minHeight: '280vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto h-[80vh] w-full max-w-5xl">
          {/* Always-laid-out signal stage. Words fade in word-by-word. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <h2
              className="text-4xl leading-tight text-lapis-700 sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {headlineWords.map((word, i) => (
                <SignalWord
                  key={`${word.text}-${i}`}
                  word={word}
                  scrollYProgress={scrollYProgress}
                  index={i}
                  reduced={reduced}
                />
              ))}
            </h2>
            <motion.p
              className="mt-6 max-w-2xl text-lg text-lapis-800 sm:text-xl"
              style={{
                fontFamily: 'var(--font-inter)',
                opacity: bodyOpacity,
              }}
            >
              {signalBody}
            </motion.p>
          </div>

          {/* Noise chips — sequentially struck and faded */}
          {chipsToRender.map((chip, i) => (
            <NoiseChip
              key={chip}
              text={chip}
              scrollYProgress={scrollYProgress}
              position={CHIP_POSITIONS[i]}
              index={i}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
