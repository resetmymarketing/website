'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';

interface NoiseToSignalProps {
  noise: readonly string[];
  signalHeadline: string;
  signalBody: string;
}

/**
 * Deterministic chip positions arranged around the centered signal.
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

// Animation timeline (seconds) — auto-plays once the section enters view.
const STRIKE_DURATION_S = 1.0;
const STRIKE_STAGGER_S = 0.25;
const FADE_AFTER_STRIKE_DURATION_S = 0.5;

const HEADLINE_BASE_S = 1.5;
const HEADLINE_WORD_DURATION_S = 0.45;
const HEADLINE_WORD_STAGGER_S = 0.45;

const BODY_DELAY_S = 4.6;
const BODY_DURATION_S = 0.7;

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
  const eWords = emphasis
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, italic: true }));
  const rWords = rest
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, italic: false }));
  return [...eWords, ...rWords];
}

interface NoiseChipProps {
  text: string;
  position: readonly [number, number, number];
  index: number;
  play: boolean;
}

function NoiseChip({ text, position, index, play }: NoiseChipProps) {
  const [top, left, rotate] = position;
  const strikeDelay = STRIKE_STAGGER_S * index;
  const fadeDelay = strikeDelay + STRIKE_DURATION_S;

  return (
    <motion.span
      className="absolute whitespace-nowrap rounded-full bg-white px-5 py-2 text-base font-medium text-lapis-700 shadow-md"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        rotate: `${rotate}deg`,
        fontFamily: 'var(--font-inter)',
      }}
      initial={{ opacity: 0.85 }}
      animate={play ? { opacity: 0 } : { opacity: 0.85 }}
      transition={{
        delay: fadeDelay,
        duration: FADE_AFTER_STRIKE_DURATION_S,
        ease: 'easeOut',
      }}
    >
      <span className="relative inline-block">
        {text}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full bg-limeade-500"
          initial={{ scaleX: 0 }}
          animate={play ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            delay: strikeDelay,
            duration: STRIKE_DURATION_S,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      </span>
    </motion.span>
  );
}

interface SignalWordProps {
  word: HeadlineWord;
  index: number;
  play: boolean;
}

function SignalWord({ word, index, play }: SignalWordProps) {
  const delay = HEADLINE_BASE_S + HEADLINE_WORD_STAGGER_S * index;

  return (
    <motion.span
      className={`inline-block ${word.italic ? 'italic' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{
        delay,
        duration: HEADLINE_WORD_DURATION_S,
        ease: 'easeOut',
      }}
    >
      {word.text}
      {' '}
    </motion.span>
  );
}

/**
 * Auto-playing Noise-to-Signal moment. Animation runs on a fixed timeline
 * once the section enters the viewport (40% threshold, fires once):
 *
 * - 0.0-3.75s: chip strikes cascade (each starts when previous is 25% drawn)
 *   Each strike grows left-to-right via a Limeade scaleX bar.
 * - 0.5-4.25s: each chip fades to 0 after its own strike completes.
 * - 1.5-4.2s: signal headline assembles word-by-word (7 words, 0.45s stagger).
 * - 4.6-5.3s: body copy fades in.
 *
 * Total runtime ~5.3s. After that, the scene holds with the pristine signal
 * + body on Pacific-50 — no further animation, no re-trigger on repeat
 * scroll-into-view.
 *
 * Reduced motion: chips not rendered, headline + body at full opacity from
 * frame 1, no animation cost.
 */
export function NoiseToSignal({
  noise,
  signalHeadline,
  signalBody,
}: NoiseToSignalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const play = !reduced && inView;

  const headlineWords = buildHeadlineWords(signalHeadline);
  const chipsToRender = noise.slice(0, CHIP_POSITIONS.length);

  return (
    <section
      ref={ref}
      className="relative z-10 isolate flex min-h-screen items-center overflow-hidden bg-pacific-50 py-24"
    >
      <div className="relative mx-auto h-[80vh] w-full max-w-5xl">
        {/* Always-laid-out signal stage. Words fade in word-by-word once
            the section enters view (or instantly under reduced motion). */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <h2
            className="text-4xl leading-tight text-lapis-700 sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {reduced
              ? headlineWords.map((word, i) => (
                  <span
                    key={`${word.text}-${i}`}
                    className={`inline-block ${word.italic ? 'italic' : ''}`}
                  >
                    {word.text}{' '}
                  </span>
                ))
              : headlineWords.map((word, i) => (
                  <SignalWord
                    key={`${word.text}-${i}`}
                    word={word}
                    index={i}
                    play={play}
                  />
                ))}
          </h2>
          <motion.p
            className="mt-6 max-w-2xl text-lg text-lapis-800 sm:text-xl"
            style={{ fontFamily: 'var(--font-inter)' }}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={play || reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              delay: reduced ? 0 : BODY_DELAY_S,
              duration: BODY_DURATION_S,
              ease: 'easeOut',
            }}
          >
            {signalBody}
          </motion.p>
        </div>

        {/* Noise chips — sequentially struck and faded. Skipped under reduced
            motion since the final state has no chips. */}
        {!reduced &&
          chipsToRender.map((chip, i) => (
            <NoiseChip
              key={chip}
              text={chip}
              position={CHIP_POSITIONS[i]}
              index={i}
              play={play}
            />
          ))}
      </div>
    </section>
  );
}
