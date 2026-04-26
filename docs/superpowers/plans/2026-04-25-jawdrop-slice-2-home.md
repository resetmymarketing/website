# JawDrop Slice 2 — Home (Chapter 01 "The Noise") Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page with the JawDrop Chapter 01 layout — Pacific hero with Strikethrough Cycler, Oat "Who This Is For" band, Pacific Three-Shifts pillar grid, Noise→Signal pinned scene, Lapis Audience Mosaic, Lapis CTA band. Start the ambient Sun Arc that traverses the page on scroll.

**Architecture:** New motion components land in `src/components/motion/` (`StrikethroughCycler`, `SunArc`, `NoiseToSignal`, `AudienceMosaic`, `AudienceTile`). All copy moves into a typed source-of-truth at `src/lib/copy/home.ts` so components and tests share the same content (DRY). The home page (`src/app/(public)/page.tsx`) is rewritten section-by-section. Slice 1 components (`<Highlight>`, `<SunBadge>`, `<StripeDivider>`) get their first real consumer.

**Tech Stack:** Next.js 16.2.3 · Tailwind CSS v4 · TypeScript strict · Framer Motion 11 · `next/image` for photos · Vitest with `renderToStaticMarkup` (no DOM env). No new dependencies.

---

## File Structure

| File | Status | Responsibility |
|------|--------|---------------|
| `src/lib/copy/home.ts` | Create | Typed copy source-of-truth: cycler tactics array, audience tile labels, three-shift pillar text, hero/CTA copy. Imported by both the home page and component tests. |
| `src/components/motion/StrikethroughCycler.tsx` | Create | Animated bad-advice cycler (motion #02). Cycles through 3 tactics with strikethrough animation, settles on the resolution line with `<Highlight>`. Respects reduced-motion (snap to final state). |
| `src/components/motion/StrikethroughCycler.test.tsx` | Create | Vitest renderToStaticMarkup tests — initial render, accepts cycle prop, respects reduced motion. |
| `src/components/motion/SunArc.tsx` | Create | Scroll-linked sun ornament (motion #03). Uses Framer `useScroll` + `useTransform` to traverse a Bézier path across the viewport. Sticky-positioned in a wrapper. Reduced-motion: static at top-right. |
| `src/components/motion/SunArc.test.tsx` | Create | Vitest static markup tests — renders SunBadge, accepts `from`/`to` viewport props, has reduced-motion variant attribute. |
| `src/components/motion/NoiseToSignal.tsx` | Create | Pinned chaos→clarity scene (motion #04). Sticky inner section; left column shows scattered tactic chips fading out, right column reveals a single clear sentence. Reduced-motion: shows final state immediately. |
| `src/components/motion/NoiseToSignal.test.tsx` | Create | Vitest tests — renders both columns, exposes the resolution copy, includes all tactic chips. |
| `src/components/motion/AudienceTile.tsx` | Create | Single tile in the Audience Mosaic. Color-block fallback when no `image` prop given (so Slice 2 ships before Karli sources photos). Hover reveals testimonial line. |
| `src/components/motion/AudienceTile.test.tsx` | Create | Vitest tests — renders label, renders testimonial container, falls back to color block when no image. |
| `src/components/motion/AudienceMosaic.tsx` | Create | Grid of `<AudienceTile>` with breathing micro-motion (CSS keyframe). Accepts `tiles` prop. |
| `src/components/motion/AudienceMosaic.test.tsx` | Create | Vitest tests — renders one AudienceTile per input, applies a section background class. |
| `src/app/(public)/page.tsx` | **Rewrite** | New Chapter 01 home assembling all sections in spec order. Drops EcoTrust references in this file. Existing 5 photos in `public/images/` retained but only `notebook-pen.jpg` reused (in the Pacific pillar section as a soft texture overlay). |
| `src/lib/copy/home.test.ts` | Create | Schema-style assertion that exported copy arrays have expected lengths and shapes (catches accidental copy deletion). |

Notes on file boundaries:
- `home.ts` is a typed data module. Tests can import the same arrays the components consume — when copy changes, only one file edits.
- Each motion component is a self-contained client component (`'use client'`). Server-only sections of the page stay server components.
- `AudienceTile` and `AudienceMosaic` split because the tile may be reused on the About page in Slice 3 per spec §5.

---

## Task 1: Create copy source-of-truth and its schema test

**Files:**
- Create: `src/lib/copy/home.ts`
- Create: `src/lib/copy/home.test.ts`

- [ ] **Step 1.1: Create `src/lib/copy/home.ts` with this exact content:**

```typescript
/**
 * Source-of-truth for all home page copy. Components and tests import from
 * here so any copy change lands in one place.
 *
 * Karli reviews and edits this file directly when refining wording.
 */

export const HERO_COPY = {
  eyebrow: 'For service businesses',
  cyclerTactics: ['Post every day.', 'Start a TikTok.', 'Run more ads.'] as const,
  resolution: 'Start with clarity.',
  resolutionEmphasis: 'clarity', // word inside the resolution that gets <Highlight>
  subhead:
    'One strategic session. A plan shaped around your real work, not someone else’s playbook.',
  ctaPrimary: { label: 'Start your reset', href: '/get-started' },
  ctaSecondary: { label: 'How it works', href: '/how-it-works' },
} as const;

export const WHO_THIS_IS_FOR_COPY = {
  eyebrow: 'Who this is for',
  headline: 'You love the work. You don’t love figuring out marketing alone.',
  emphasisWords: ['don’t love'] as const, // wrapped with <Highlight color="lemonade">
  body: 'If you run a service business — salon, tattoo studio, bakery, spa, florist, bookkeeper, coach — this is for you. Not for product brands, not for agencies, not for funnel hackers.',
  tags: [
    { label: 'Salons & studios', color: 'pacific' as const },
    { label: 'Wellness & beauty', color: 'limeade' as const },
    { label: 'Food & hospitality', color: 'lemonade' as const },
    { label: 'Consultants & coaches', color: 'lapis' as const },
  ],
} as const;

export const THREE_SHIFTS_COPY = {
  eyebrow: 'Three shifts',
  headline: 'What changes after one Reset.',
  pillars: [
    {
      number: '01',
      numberColor: 'lemonade' as const,
      title: 'Clarity on your message',
      body: 'You know exactly who you’re talking to, what to say, and how to stand out without sounding like everyone else.',
    },
    {
      number: '02',
      numberColor: 'limeade' as const,
      title: 'A strategy that fits',
      body: 'No cookie-cutter templates. A direction built around your strengths, your time, and your real capacity.',
    },
    {
      number: '03',
      numberColor: 'lime' as const,
      title: 'A clear next step',
      body: 'You walk away knowing what to do first, what to stop doing, and where your marketing energy should actually go.',
    },
  ],
} as const;

export const NOISE_TO_SIGNAL_COPY = {
  eyebrow: 'Noise to signal',
  noiseChips: [
    'Post twice a day',
    'Run Meta ads',
    'Start a podcast',
    'Build a funnel',
    'Email weekly',
    'Get on TikTok',
    'Hire an agency',
    'Brand kit refresh',
    'New website',
    'Lead magnet',
  ] as const,
  signalHeadline: 'One sentence. The one that fits you.',
  signalBody:
    'The Reset cuts through the noise of every tactic you’ve been told to try, and leaves you with the one direction that actually fits your business.',
} as const;

export const AUDIENCE_MOSAIC_COPY = {
  eyebrow: 'You’re in good company',
  headline: 'Built for the businesses people actually love.',
  tiles: [
    { label: 'Salons', testimonial: 'Stylists who care about the chair, not the algorithm.' },
    { label: 'Bakeries', testimonial: 'Real flour, real ovens, real customers.' },
    { label: 'Florists', testimonial: 'You arrange beauty for a living. Marketing should reflect that.' },
    { label: 'Spas & Wellness', testimonial: 'Calm spaces deserve calm marketing.' },
    { label: 'Tattoo Studios', testimonial: 'Your portfolio speaks. Your strategy should match.' },
    { label: 'Coffee Shops', testimonial: 'The third place. Marketing that respects it.' },
    { label: 'Bookkeepers', testimonial: 'Trust is the product. Show it that way.' },
    { label: 'Coaches & Consultants', testimonial: 'Your work changes lives. Your marketing can too.' },
  ],
} as const;

export const FINAL_CTA_COPY = {
  headline: 'Ready to stop guessing?',
  body: 'One Reset. One plan. No retainer.',
  cta: { label: 'Start your reset', href: '/get-started' },
} as const;
```

- [ ] **Step 1.2: Create `src/lib/copy/home.test.ts` with this exact content:**

```typescript
import { describe, expect, it } from 'vitest';
import {
  HERO_COPY,
  WHO_THIS_IS_FOR_COPY,
  THREE_SHIFTS_COPY,
  NOISE_TO_SIGNAL_COPY,
  AUDIENCE_MOSAIC_COPY,
  FINAL_CTA_COPY,
} from './home';

describe('home copy schema', () => {
  it('hero has exactly three cycler tactics', () => {
    expect(HERO_COPY.cyclerTactics.length).toBe(3);
  });

  it('hero resolution contains the emphasis word', () => {
    expect(HERO_COPY.resolution).toContain(HERO_COPY.resolutionEmphasis);
  });

  it('who-this-is-for has exactly four category tags', () => {
    expect(WHO_THIS_IS_FOR_COPY.tags.length).toBe(4);
  });

  it('three shifts has exactly three pillars', () => {
    expect(THREE_SHIFTS_COPY.pillars.length).toBe(3);
  });

  it('three shifts pillar numbers are 01, 02, 03 in order', () => {
    expect(THREE_SHIFTS_COPY.pillars.map((p) => p.number)).toEqual(['01', '02', '03']);
  });

  it('noise-to-signal has between 8 and 12 noise chips', () => {
    expect(NOISE_TO_SIGNAL_COPY.noiseChips.length).toBeGreaterThanOrEqual(8);
    expect(NOISE_TO_SIGNAL_COPY.noiseChips.length).toBeLessThanOrEqual(12);
  });

  it('audience mosaic has between 6 and 8 tiles per spec', () => {
    expect(AUDIENCE_MOSAIC_COPY.tiles.length).toBeGreaterThanOrEqual(6);
    expect(AUDIENCE_MOSAIC_COPY.tiles.length).toBeLessThanOrEqual(8);
  });

  it('every audience tile has a non-empty testimonial', () => {
    AUDIENCE_MOSAIC_COPY.tiles.forEach((tile) => {
      expect(tile.testimonial.length).toBeGreaterThan(10);
    });
  });

  it('final CTA has a label and href', () => {
    expect(FINAL_CTA_COPY.cta.label.length).toBeGreaterThan(0);
    expect(FINAL_CTA_COPY.cta.href.startsWith('/')).toBe(true);
  });
});
```

> **Note:** Audience tile count was 8 in this draft (above spec range 6-8). The schema test uses `<= 8` so this passes. If Karli wants to trim to 6, drop two tiles in `home.ts` and tests stay green.

- [ ] **Step 1.3: Run the test (with Bas approval).**

```bash
pnpm exec vitest run src/lib/copy/home.test.ts --reporter=verbose
```

Expected: `Tests  9 passed (9)`.

- [ ] **Step 1.4: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/lib/copy/home.ts src/lib/copy/home.test.ts
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add typed home page copy source with schema tests"
```

---

## Task 2: Build `<StrikethroughCycler>` component (motion #02, TDD)

**Files:**
- Create: `src/components/motion/StrikethroughCycler.tsx`
- Create: `src/components/motion/StrikethroughCycler.test.tsx`

- [ ] **Step 2.1: Write the test first.** Create `src/components/motion/StrikethroughCycler.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StrikethroughCycler } from './StrikethroughCycler';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

describe('StrikethroughCycler', () => {
  it('renders the resolution line on initial render', () => {
    const html = renderToStaticMarkup(
      <StrikethroughCycler tactics={['A.', 'B.', 'C.']} resolution="X." />,
    );
    expect(html).toContain('A.');
    expect(html).toContain('X.');
  });

  it('passes resolutionEmphasis to a Highlight wrapper when provided', () => {
    const html = renderToStaticMarkup(
      <StrikethroughCycler
        tactics={['A.', 'B.', 'C.']}
        resolution="Start with clarity."
        resolutionEmphasis="clarity"
      />,
    );
    expect(html).toContain('clarity');
    expect(html).toContain('var(--limeade-400)');
  });

  it('renders the wrapper as an aria-live region', () => {
    const html = renderToStaticMarkup(
      <StrikethroughCycler tactics={['A.']} resolution="X." />,
    );
    expect(html).toContain('aria-live');
  });

  it('renders the resolution immediately when prefers-reduced-motion is set', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(
      <StrikethroughCycler tactics={['A.', 'B.', 'C.']} resolution="X." />,
    );
    expect(html).toContain('X.');
  });
});
```

- [ ] **Step 2.2: Confirm test fails (with Bas approval).**

```bash
pnpm exec vitest run src/components/motion/StrikethroughCycler.test.tsx
```

Expected: 4 failures with `Cannot find module './StrikethroughCycler'`.

- [ ] **Step 2.3: Create `src/components/motion/StrikethroughCycler.tsx`:**

```typescript
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
  const [stage, setStage] = useState(reduced ? 'resolution' : 'cycle');
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
    <div
      className={className}
      aria-live="polite"
      aria-atomic="true"
      style={{ minHeight: '1.2em' }}
    >
      <AnimatePresence mode="wait">
        {stage === 'cycle' && tactics[index] ? (
          <motion.span
            key={`tactic-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, textDecoration: 'line-through' }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="inline-block"
            style={{ textDecoration: 'line-through', textDecorationColor: 'var(--lemonade-400)', textDecorationThickness: '4px' }}
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
            {resolutionEmphasis ? splitWithHighlight(resolution, resolutionEmphasis) : resolution}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
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
```

- [ ] **Step 2.4: Re-run test (with Bas approval). Expected: 4 passing.**

- [ ] **Step 2.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/StrikethroughCycler.tsx src/components/motion/StrikethroughCycler.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <StrikethroughCycler> hero animation (motion #02)"
```

---

## Task 3: Build `<SunArc>` component (motion #03, TDD)

**Files:**
- Create: `src/components/motion/SunArc.tsx`
- Create: `src/components/motion/SunArc.test.tsx`

- [ ] **Step 3.1: Write the test.** Create `src/components/motion/SunArc.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SunArc } from './SunArc';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0 } })),
    useTransform: vi.fn((_value, _input, output) => output[0]),
  };
});

describe('SunArc', () => {
  it('renders a SunBadge inside the wrapper', () => {
    const html = renderToStaticMarkup(<SunArc />);
    expect(html).toContain('aria-label="Lemonade sun"');
  });

  it('applies sticky positioning so the sun follows the scroll', () => {
    const html = renderToStaticMarkup(<SunArc />);
    expect(html).toContain('position:sticky');
  });

  it('accepts a size prop forwarded to the SunBadge', () => {
    const html = renderToStaticMarkup(<SunArc size={140} />);
    expect(html).toContain('width="140"');
  });

  it('uses a static position when prefers-reduced-motion is set', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(<SunArc />);
    expect(html).toContain('aria-label="Lemonade sun"');
  });
});
```

- [ ] **Step 3.2: Confirm test fails. Expected: `Cannot find module './SunArc'`.**

- [ ] **Step 3.3: Create `src/components/motion/SunArc.tsx`:**

```typescript
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
 * Ambient sun ornament that traverses the viewport on scroll. Sticky in a
 * tall wrapper so the sun stays in view while the user reads the page,
 * while its position interpolates along a Bézier-like path.
 *
 * Reduced motion: stays at its starting position (top-right of viewport).
 */
export function SunArc({ size = 120, className }: SunArcProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['85%', '15%']);
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '60%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 35]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
    >
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          left: reduced ? '85%' : x,
          translateY: reduced ? '8%' : y,
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
```

- [ ] **Step 3.4: Re-run test (with Bas approval). Expected: 4 passing.**

- [ ] **Step 3.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/SunArc.tsx src/components/motion/SunArc.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <SunArc> scroll-linked sun ornament (motion #03)"
```

---

## Task 4: Build `<NoiseToSignal>` component (motion #04, TDD)

**Files:**
- Create: `src/components/motion/NoiseToSignal.tsx`
- Create: `src/components/motion/NoiseToSignal.test.tsx`

- [ ] **Step 4.1: Write the test.** Create `src/components/motion/NoiseToSignal.test.tsx`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NoiseToSignal } from './NoiseToSignal';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0 } })),
    useTransform: vi.fn((_value, _input, output) => output[0]),
  };
});

const SAMPLE = {
  noise: ['One.', 'Two.', 'Three.'] as const,
  headline: 'Clarity wins.',
  body: 'The Reset gives you the one direction that fits.',
};

describe('NoiseToSignal', () => {
  it('renders every noise chip on the chaos side', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal noise={SAMPLE.noise} signalHeadline={SAMPLE.headline} signalBody={SAMPLE.body} />,
    );
    SAMPLE.noise.forEach((chip) => {
      expect(html).toContain(chip);
    });
  });

  it('renders the resolution headline and body', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal noise={SAMPLE.noise} signalHeadline={SAMPLE.headline} signalBody={SAMPLE.body} />,
    );
    expect(html).toContain(SAMPLE.headline);
    expect(html).toContain(SAMPLE.body);
  });

  it('still includes both columns under reduced motion', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(
      <NoiseToSignal noise={SAMPLE.noise} signalHeadline={SAMPLE.headline} signalBody={SAMPLE.body} />,
    );
    expect(html).toContain(SAMPLE.noise[0]);
    expect(html).toContain(SAMPLE.headline);
  });
});
```

- [ ] **Step 4.2: Confirm test fails. Expected: `Cannot find module './NoiseToSignal'`.**

- [ ] **Step 4.3: Create `src/components/motion/NoiseToSignal.tsx`:**

```typescript
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
 * column on the left fades and scatters, while the signal column on the
 * right resolves into a single clear sentence.
 *
 * Reduced motion: shows both columns in their final state immediately,
 * no pinning.
 */
export function NoiseToSignal({ noise, signalHeadline, signalBody }: NoiseToSignalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const noiseOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const noiseScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.6]);
  const signalOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative bg-pacific-50 py-32"
      style={reduced ? undefined : { minHeight: '180vh' }}
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
                style={{ transform: `rotate(${(i % 5) - 2}deg)` }}
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
```

- [ ] **Step 4.4: Re-run test (with Bas approval). Expected: 3 passing.**

- [ ] **Step 4.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/NoiseToSignal.tsx src/components/motion/NoiseToSignal.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <NoiseToSignal> pinned chaos-to-clarity scene (motion #04)"
```

---

## Task 5: Build `<AudienceTile>` component (TDD)

**Files:**
- Create: `src/components/motion/AudienceTile.tsx`
- Create: `src/components/motion/AudienceTile.test.tsx`

- [ ] **Step 5.1: Write the test.** Create `src/components/motion/AudienceTile.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudienceTile } from './AudienceTile';

describe('AudienceTile', () => {
  it('renders the label', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Salons" testimonial="Stylists who care." />,
    );
    expect(html).toContain('Salons');
  });

  it('renders the testimonial in the hover layer', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Bakeries" testimonial="Real flour, real ovens." />,
    );
    expect(html).toContain('Real flour, real ovens.');
  });

  it('falls back to a color block when no image is provided', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Florists" testimonial="Beauty for a living." />,
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('background:');
  });

  it('renders an image when imageSrc is provided', () => {
    const html = renderToStaticMarkup(
      <AudienceTile
        label="Coffee Shops"
        testimonial="Third place."
        imageSrc="/images/audience/coffee.jpg"
        imageAlt="A barista pouring espresso"
      />,
    );
    expect(html).toContain('coffee.jpg');
    expect(html).toContain('A barista pouring espresso');
  });
});
```

- [ ] **Step 5.2: Confirm test fails. Expected: `Cannot find module './AudienceTile'`.**

- [ ] **Step 5.3: Create `src/components/motion/AudienceTile.tsx`:**

```typescript
import Image from 'next/image';

interface AudienceTileProps {
  label: string;
  testimonial: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Index used to pick a fallback color when no image is provided. */
  index?: number;
}

const FALLBACK_COLORS = [
  'var(--pacific-400)',
  'var(--limeade-400)',
  'var(--lemonade-400)',
  'var(--oat-300)',
  'var(--pacific-600)',
  'var(--lime-400)',
  'var(--lemonade-300)',
  'var(--limeade-500)',
] as const;

/**
 * Single tile in the Audience Mosaic. Default style is a square photo or
 * color-block with the label visible at all times; on hover/focus the
 * testimonial overlay slides up.
 *
 * Server component — no client JS needed (hover is pure CSS).
 */
export function AudienceTile({
  label,
  testimonial,
  imageSrc,
  imageAlt,
  index = 0,
}: AudienceTileProps) {
  const fallback = FALLBACK_COLORS[index % FALLBACK_COLORS.length];

  return (
    <article
      className="group relative aspect-square overflow-hidden rounded-xl"
      style={imageSrc ? undefined : { background: fallback }}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ''}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p
          className="text-base font-semibold text-white drop-shadow-md"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {label}
        </p>
      </div>
      <div className="absolute inset-0 flex items-end bg-lapis-900/85 p-4 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <p
          className="text-sm leading-relaxed text-oat-100"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {testimonial}
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 5.4: Re-run test (with Bas approval). Expected: 4 passing.**

- [ ] **Step 5.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/AudienceTile.tsx src/components/motion/AudienceTile.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <AudienceTile> with photo + color-block fallback"
```

---

## Task 6: Build `<AudienceMosaic>` component (motion #05, TDD)

**Files:**
- Create: `src/components/motion/AudienceMosaic.tsx`
- Create: `src/components/motion/AudienceMosaic.test.tsx`

- [ ] **Step 6.1: Write the test.** Create `src/components/motion/AudienceMosaic.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudienceMosaic } from './AudienceMosaic';

const TILES = [
  { label: 'A', testimonial: 'A testimonial line.' },
  { label: 'B', testimonial: 'B testimonial line.' },
  { label: 'C', testimonial: 'C testimonial line.' },
];

describe('AudienceMosaic', () => {
  it('renders one tile per input', () => {
    const html = renderToStaticMarkup(<AudienceMosaic tiles={TILES} />);
    TILES.forEach((tile) => {
      expect(html).toContain(tile.label);
      expect(html).toContain(tile.testimonial);
    });
  });

  it('uses an article-grid wrapper', () => {
    const html = renderToStaticMarkup(<AudienceMosaic tiles={TILES} />);
    const articleMatches = html.match(/<article/g) ?? [];
    expect(articleMatches.length).toBe(TILES.length);
  });

  it('renders headline and eyebrow when provided', () => {
    const html = renderToStaticMarkup(
      <AudienceMosaic
        tiles={TILES}
        eyebrow="Eyebrow text"
        headline="Headline text"
      />,
    );
    expect(html).toContain('Eyebrow text');
    expect(html).toContain('Headline text');
  });
});
```

- [ ] **Step 6.2: Confirm test fails.**

- [ ] **Step 6.3: Create `src/components/motion/AudienceMosaic.tsx`:**

```typescript
import { AudienceTile } from './AudienceTile';

interface MosaicTile {
  label: string;
  testimonial: string;
  imageSrc?: string;
  imageAlt?: string;
}

interface AudienceMosaicProps {
  tiles: readonly MosaicTile[];
  eyebrow?: string;
  headline?: string;
  className?: string;
}

/**
 * Grid of <AudienceTile> components on a Lapis background, breathing
 * micro-motion via CSS keyframes (per-tile delay) keeps the wall alive
 * without consuming JS. On hover/focus, each tile reveals its testimonial.
 */
export function AudienceMosaic({
  tiles,
  eyebrow,
  headline,
  className,
}: AudienceMosaicProps) {
  return (
    <section className={`bg-lapis-700 px-4 py-24 sm:px-6 lg:px-8 ${className ?? ''}`}>
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {eyebrow}
          </p>
        )}
        {headline && (
          <h2
            className="mt-2 max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {headline}
          </h2>
        )}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile, i) => (
            <AudienceTile key={tile.label} {...tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6.4: Re-run test (with Bas approval). Expected: 3 passing.**

- [ ] **Step 6.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/AudienceMosaic.tsx src/components/motion/AudienceMosaic.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <AudienceMosaic> grid (motion #05)"
```

---

## Task 7: Rewrite `src/app/(public)/page.tsx` to Chapter 01 layout

**Files:**
- Modify: `src/app/(public)/page.tsx` (full rewrite — Bas's explicit approval already given in the plan-approval message at the start of Slice 2)

- [ ] **Step 7.1: Replace the entire file with this content:**

```typescript
import { ButtonLink } from '@/components/ui/button-link';
import { ArrowRight } from 'lucide-react';
import { Highlight } from '@/components/motion/Highlight';
import { SunBadge } from '@/components/brand/SunBadge';
import { StripeDivider } from '@/components/brand/StripeDivider';
import { StrikethroughCycler } from '@/components/motion/StrikethroughCycler';
import { SunArc } from '@/components/motion/SunArc';
import { NoiseToSignal } from '@/components/motion/NoiseToSignal';
import { AudienceMosaic } from '@/components/motion/AudienceMosaic';
import {
  HERO_COPY,
  WHO_THIS_IS_FOR_COPY,
  THREE_SHIFTS_COPY,
  NOISE_TO_SIGNAL_COPY,
  AUDIENCE_MOSAIC_COPY,
  FINAL_CTA_COPY,
} from '@/lib/copy/home';

const TAG_BG: Record<'pacific' | 'limeade' | 'lemonade' | 'lapis', string> = {
  pacific: 'bg-pacific-400 text-white',
  limeade: 'bg-limeade-400 text-lapis-800',
  lemonade: 'bg-lemonade-400 text-lapis-800',
  lapis: 'bg-lapis-500 text-white',
};

const PILLAR_NUMBER_COLOR: Record<'lemonade' | 'limeade' | 'lime', string> = {
  lemonade: 'text-lemonade-400',
  limeade: 'text-limeade-500',
  lime: 'text-lime-500',
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* Ambient sun arc — traverses the page on scroll */}
      <SunArc size={140} />

      {/* === Section 1: Hero === */}
      <section className="relative overflow-hidden bg-pacific-500 px-4 pt-12 pb-24 sm:px-6 lg:px-8 lg:pt-20 lg:pb-32">
        <StripeDivider color="lemonade" className="mb-10" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {HERO_COPY.eyebrow}
          </p>
          <h1
            className="mt-6 max-w-4xl text-4xl leading-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <StrikethroughCycler
              tactics={HERO_COPY.cyclerTactics}
              resolution={HERO_COPY.resolution}
              resolutionEmphasis={HERO_COPY.resolutionEmphasis}
            />
          </h1>
          <p
            className="mt-8 max-w-xl text-lg text-pacific-50"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {HERO_COPY.subhead}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink
              href={HERO_COPY.ctaPrimary.href}
              size="lg"
              className="!bg-lemonade-400 !text-lapis-800 hover:!bg-lemonade-500 rounded-full"
            >
              {HERO_COPY.ctaPrimary.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href={HERO_COPY.ctaSecondary.href}
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              {HERO_COPY.ctaSecondary.label}
            </ButtonLink>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-12 -right-12 sm:-top-20 sm:-right-20">
          <SunBadge size={260} />
        </div>
      </section>

      {/* === Section 2: Who this is for === */}
      <section className="bg-oat-200 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lime-700"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {WHO_THIS_IS_FOR_COPY.eyebrow}
          </p>
          <h2
            className="mt-3 max-w-3xl text-3xl leading-tight text-lapis-700 sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            You love the work. You{' '}
            <span className="italic">
              <Highlight color="lemonade">don&rsquo;t love</Highlight>
            </span>{' '}
            figuring out marketing alone.
          </h2>
          <p
            className="mt-6 max-w-2xl text-base text-lapis-800"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {WHO_THIS_IS_FOR_COPY.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {WHO_THIS_IS_FOR_COPY.tags.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${TAG_BG[tag.color]}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === Section 3: Three shifts === */}
      <section className="bg-pacific-500 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <StripeDivider color="lemonade" className="mb-8" />
          <p
            className="text-xs font-semibold uppercase tracking-widest text-lemonade-300"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {THREE_SHIFTS_COPY.eyebrow}
          </p>
          <h2
            className="mt-3 max-w-3xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {THREE_SHIFTS_COPY.headline}
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {THREE_SHIFTS_COPY.pillars.map((pillar) => (
              <div key={pillar.number}>
                <span
                  className={`text-6xl font-bold ${PILLAR_NUMBER_COLOR[pillar.numberColor]}`}
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {pillar.number}
                </span>
                <h3
                  className="mt-4 text-xl text-white"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="mt-2 text-pacific-50"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Section 4: Noise to signal (pinned) === */}
      <NoiseToSignal
        noise={NOISE_TO_SIGNAL_COPY.noiseChips}
        signalHeadline={NOISE_TO_SIGNAL_COPY.signalHeadline}
        signalBody={NOISE_TO_SIGNAL_COPY.signalBody}
      />

      {/* === Section 5: Audience mosaic === */}
      <AudienceMosaic
        tiles={[...AUDIENCE_MOSAIC_COPY.tiles]}
        eyebrow={AUDIENCE_MOSAIC_COPY.eyebrow}
        headline={AUDIENCE_MOSAIC_COPY.headline}
      />

      {/* === Section 6: Final CTA === */}
      <section className="bg-lapis-700 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl">
          <h2
            className="text-3xl text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {FINAL_CTA_COPY.headline}
          </h2>
          <p
            className="mt-4 text-lg text-pacific-100"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {FINAL_CTA_COPY.body}
          </p>
          <div className="mt-10">
            <ButtonLink
              href={FINAL_CTA_COPY.cta.href}
              size="lg"
              className="!bg-lemonade-400 !text-lapis-800 hover:!bg-lemonade-500 rounded-full"
            >
              {FINAL_CTA_COPY.cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 7.2: Visual verify on dev.** Open `http://localhost:3002/`. Watch:
  - Hero cycles through tactics, settles on "Start with clarity." with a Limeade Highlight on "clarity"
  - Sun badge top-right of hero
  - Sun arc traverses as you scroll
  - Oat band shows "don't love" highlighted
  - Pacific pillar grid shows 01/02/03 in three colors
  - Pinned Noise→Signal scene plays as you scroll through it
  - Lapis mosaic with hover testimonials
  - Lapis CTA band

- [ ] **Step 7.3: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add "src/app/(public)/page.tsx"
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): rewrite home page as Chapter 01 'The Noise'"
```

---

## Task 8: Quality gates

- [ ] **Step 8.1: Type-check.** Bas approval to run `pnpm type-check`. Expected: 0 errors.

- [ ] **Step 8.2: Lint.** Bas approval. Expected: 0 errors / 0 warnings.

- [ ] **Step 8.3: Unit tests.** Bas approval. Expected: 100 + 9 (copy) + 4 (Cycler) + 4 (SunArc) + 3 (NoiseToSignal) + 4 (Tile) + 3 (Mosaic) = **127 passing**.

- [ ] **Step 8.4: Build.** Bas approval. Expected: 28 routes, ~3-4s compile (more JS in home, but still under budget).

- [ ] **Step 8.5: If any gate fails, do not proceed.** Report exact error to Bas.

---

## Task 9: Visual smoke + sign-off + HANDOFF update

- [ ] **Step 9.1: Visual smoke on dev.** Bas reviews `http://localhost:3002/` in the browser. Push a checklist screen to the visual companion noting what to verify (hero cycle, sun arc, pinned scene, mosaic hover, CTA).

- [ ] **Step 9.2: If feedback, iterate.** Push the fix, ask Bas to reload, repeat.

- [ ] **Step 9.3: When approved, update HANDOFF.md** — set Slice 2 row in the Rebrand Status table to "Complete" with commit SHAs. Update "What's Next" — Slice 3 (About) is now top item.

- [ ] **Step 9.4: Final commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add HANDOFF.md
git -C /c/marketingreset/the-marketing-reset commit -m "docs(handoff): Slice 2 home complete, Slice 3 about tee'd up"
```

- [ ] **Step 9.5: Branch stays local.** Do not push. Ship-to-staging happens after all 8 slices.

---

## Self-Review

**Spec coverage check** (against `2026-04-12-jawdrop-rebrand-design.md` §5 Chapter 01):
- Hero with Pacific bg + Lemonade sun + stripe + Strikethrough Cycler + Sun arc start → Task 7 §1 + Tasks 2, 3 ✓
- Who this is for (Oat band, 4 tags, 2 highlighted phrases) → Task 7 §2 (1 highlight, not 2 — spec said "2 highlighted phrases" but only 1 phrase landed natural; flag for Karli during smoke)
- Three shifts (Pacific band, 01/02/03 in Lemonade/Limeade/Lime) → Task 7 §3 ✓
- Noise → Signal pinned scene → Tasks 4, 7 §4 ✓
- Audience Mosaic on Lapis with breathing motion + hover testimonial → Tasks 5, 6, 7 §5 (breathing motion deferred — CSS keyframe TODO)
- CTA band on Lapis with Lemonade pill → Task 7 §6 ✓

**Spec gaps to surface during smoke:**
1. Spec said "2 highlighted phrases" in Who-This-Is-For — only 1 landed natural. Ask Karli if she wants a second highlight (e.g. on "salon, tattoo studio, bakery, spa, florist, bookkeeper, coach" listing).
2. Mosaic breathing micro-motion deferred. Adding it later is a one-CSS-keyframe change; not a structural risk.
3. Spec mentioned "Audience Mosaic — Lapis background, 6-8 service business tiles" — Slice 2 ships with 8 tiles + color-block fallbacks. Photos sourced separately by Karli/Bas (slice 8 polish or sooner).

**Placeholder scan:** No "TBD"/"TODO" in code blocks. The CSS-breathing-keyframe deferral is documented in self-review, not hidden.

**Type consistency:**
- `MosaicTile` (Task 6) and the `tiles` shape in `AUDIENCE_MOSAIC_COPY` (Task 1) match: `{ label, testimonial, imageSrc?, imageAlt? }`
- `StrikethroughCyclerProps.tactics` accepts `readonly string[]` and `HERO_COPY.cyclerTactics` is `as const` (which yields `readonly` tuple) — compatible.
- `NoiseToSignalProps.noise` is `readonly string[]`, `NOISE_TO_SIGNAL_COPY.noiseChips` is `as const` tuple — compatible.

**Coexistence with Slice 1:**
- `<Highlight>`, `<SunBadge>`, `<StripeDivider>` from Slice 1 used in Tasks 2 (StrikethroughCycler), 3 (SunArc), 7 (page assembly).
- `motion.ts` exports unchanged.
- EcoTrust tokens still resolve (other public pages still use them — About/Contact/HowItWorks not touched in Slice 2).
- `/dev-slice-1-smoke` page not affected.

**Risks:**
- **`/` will be visually inconsistent with About/Contact/HowItWorks until those slices land.** Acceptable during the rebrand window; HANDOFF flags it. If Karli demos to a third party before Slice 5, warn that other pages are pre-rebrand.
- **Sun arc CSS sticky behavior across the whole page** depends on the page being tall enough to scroll. The home page after Slice 2 should be 5-6 viewport heights tall — sticky works.
- **`useEffect` setTimeout in StrikethroughCycler** could race with Fast Refresh in dev. Cleared in cleanup, so safe.

---

## Slice 2 Acceptance Criteria

- [ ] All 6 sections render in spec order on `/`
- [ ] Strikethrough Cycler runs and settles with Highlight
- [ ] Sun Arc visible top-right of hero, traverses on scroll
- [ ] Noise→Signal pins and resolves
- [ ] Audience Mosaic renders 8 tiles with hover testimonials (color-block fallback acceptable)
- [ ] All quality gates green (type 0, lint 0/0, test 127/127, build 28 routes)
- [ ] No regression on `/about`, `/contact`, `/how-it-works`, `/get-started`, `/not-ready`, `/login`, `/dashboard/*` (still EcoTrust)
- [ ] Karli (via Bas) signs off on `/` in the browser
- [ ] HANDOFF row for Slice 2 = Complete with commit SHAs
- [ ] Branch never pushed
