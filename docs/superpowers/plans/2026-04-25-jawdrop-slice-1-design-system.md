# JawDrop Slice 1 — Design System Foundation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the Lemonade palette tokens, Fraunces + Inter typography, and three foundational brand/motion components (`Highlight`, `SunBadge`, `StripeDivider`) so chapters 1-5 can be built on top without further design-system work.

**Architecture:** Additive only. New Lemonade CSS variables and Tailwind utilities are added **alongside** the existing EcoTrust tokens in `globals.css` so the 32 files that currently reference `bg-brand-*` / `text-sage-*` / `text-warm-*` continue to render unchanged. Per-chapter slices later migrate those references one chapter at a time. New fonts wire in via `next/font/google` as additional CSS variables, leaving the existing Geist variables in place. The three new components are pure additions in `src/components/brand/` and `src/components/motion/`.

**Tech Stack:** Next.js 16.2.3 · Tailwind CSS v4 (CSS-first config) · TypeScript strict · Framer Motion 11 (already installed) · Vitest 1.x · `next/font/google` (no new deps).

---

## File Structure

| File | Status | Responsibility |
|------|--------|---------------|
| `src/app/globals.css` | Modify | Add Lemonade palette CSS variables and `@theme` mappings alongside existing EcoTrust tokens. Also expose `--font-fraunces` and `--font-inter` to Tailwind. |
| `src/lib/fonts.ts` | Create | Centralize `next/font/google` setup for Fraunces + Inter. Single source of truth so layout.tsx and any per-page overrides import from one place. |
| `src/app/layout.tsx` | Modify | Inject Fraunces and Inter CSS variables into `<body>` className alongside the existing Geist variables. Geist stays for now (dashboard still uses it). |
| `src/lib/motion.ts` | Modify | Extend existing helpers with `highlightStroke` variants and a `useArcProgress` re-export hook for SunArc (used in later slices). No removal of existing exports. |
| `src/components/motion/Highlight.tsx` | Create | `<Highlight>` wraps any inline content and animates an SVG path stroke under it. Respects `prefers-reduced-motion` (snaps to filled state). |
| `src/components/brand/SunBadge.tsx` | Create | Reusable Lemonade-yellow disc SVG. Accepts `size`, `className`, `variant` ("solid" | "ringed"). Pure server component, no JS. |
| `src/components/brand/StripeDivider.tsx` | Create | Hand-drawn jittering stripe SVG used to mark chapter starts. Accepts `color` prop with token-name union. CSS-only animation. |
| `src/components/motion/Highlight.test.tsx` | Create | Vitest unit test — renders content, animates by default, snaps under reduced motion. |
| `src/components/brand/SunBadge.test.tsx` | Create | Vitest unit test — renders SVG with given size, applies variant class. |
| `src/components/brand/StripeDivider.test.tsx` | Create | Vitest unit test — renders SVG, accepts color prop, applies token-bound stroke. |

Each file has one clear responsibility. The two new component directories (`brand/` and `motion/`) match the spec's planned structure for later slices.

---

## Task 1: Add Lemonade palette CSS variables to globals.css

**Files:**
- Modify: `src/app/globals.css:6-101` (extend `:root` block, no removal)
- Modify: `src/app/globals.css:104-183` (extend `@theme inline` block, no removal)

- [ ] **Step 1.1: Open `src/app/globals.css` and find the `:root { ... }` block (lines 6-101).** Locate the closing `}` on line 101.

- [ ] **Step 1.2: Insert the Lemonade palette block immediately before the closing `}` on line 101.** Add this content (do not remove or modify any existing tokens):

```css
  /* === LEMONADE PALETTE (JawDrop rebrand 2026-04-25) === */
  /* Added alongside EcoTrust tokens. Migration to Lemonade-only happens
     per-chapter; both palettes coexist during the rebrand. */

  /* Lapis — text anchor, CTA bands, primary navy */
  --lapis-50:  #eaeef6;
  --lapis-100: #cdd6e7;
  --lapis-200: #9aaccf;
  --lapis-300: #6783b6;
  --lapis-400: #45669c;
  --lapis-500: #2D4670;
  --lapis-600: #25395a;
  --lapis-700: #1c2c44;
  --lapis-800: #131e2f;
  --lapis-900: #0a1119;

  /* Pacific — hero backgrounds, secondary sections, links */
  --pacific-50:  #eef4fb;
  --pacific-100: #d3e2f1;
  --pacific-200: #a7c5e3;
  --pacific-300: #7ba8d4;
  --pacific-400: #5B94C4;
  --pacific-500: #4180b3;
  --pacific-600: #346891;
  --pacific-700: #28506f;
  --pacific-800: #1c384e;
  --pacific-900: #10202c;

  /* Oat — primary warm background, alternating sections */
  --oat-50:  #fbf8f1;
  --oat-100: #f4ecd8;
  --oat-200: #ebdcb4;
  --oat-300: #DFCEB0;
  --oat-400: #ccb98e;
  --oat-500: #b8a06d;
  --oat-600: #8f7a4f;
  --oat-700: #6b5b3a;
  --oat-800: #483d27;
  --oat-900: #251f14;

  /* Lemonade — CTAs, highlights, sun motif */
  --lemonade-50:  #fffbe6;
  --lemonade-100: #fdf3b8;
  --lemonade-200: #fbe888;
  --lemonade-300: #f9dc62;
  --lemonade-400: #F5D547;
  --lemonade-500: #e6c224;
  --lemonade-600: #b89717;
  --lemonade-700: #8a6f10;
  --lemonade-800: #5c4a09;
  --lemonade-900: #2e2504;

  /* Limeade — block highlights on key words, accent tags */
  --limeade-50:  #f5fae3;
  --limeade-100: #e6f3b9;
  --limeade-200: #cde683;
  --limeade-300: #b8d959;
  --limeade-400: #A8CC3E;
  --limeade-500: #92b32f;
  --limeade-600: #748f25;
  --limeade-700: #576b1c;
  --limeade-800: #3a4712;
  --limeade-900: #1d2309;

  /* Lime — dividers, quote marks, supporting typography accents */
  --lime-50:  #f1f3e3;
  --lime-100: #dde2bb;
  --lime-200: #bbc783;
  --lime-300: #98ac4e;
  --lime-400: #7d942e;
  --lime-500: #757F39;
  --lime-600: #5d662d;
  --lime-700: #464d22;
  --lime-800: #2e3316;
  --lime-900: #17190b;
```

- [ ] **Step 1.3: Open the `@theme inline { ... }` block (lines 104-183) and insert the Lemonade Tailwind color mappings.** Add this content immediately after the existing `--color-accent-orange-light: var(--accent-orange-light);` line (around line 147), before `--font-sans:` (line 149):

```css
  /* === LEMONADE PALETTE TAILWIND BINDINGS === */
  --color-lapis-50:  var(--lapis-50);
  --color-lapis-100: var(--lapis-100);
  --color-lapis-200: var(--lapis-200);
  --color-lapis-300: var(--lapis-300);
  --color-lapis-400: var(--lapis-400);
  --color-lapis-500: var(--lapis-500);
  --color-lapis-600: var(--lapis-600);
  --color-lapis-700: var(--lapis-700);
  --color-lapis-800: var(--lapis-800);
  --color-lapis-900: var(--lapis-900);

  --color-pacific-50:  var(--pacific-50);
  --color-pacific-100: var(--pacific-100);
  --color-pacific-200: var(--pacific-200);
  --color-pacific-300: var(--pacific-300);
  --color-pacific-400: var(--pacific-400);
  --color-pacific-500: var(--pacific-500);
  --color-pacific-600: var(--pacific-600);
  --color-pacific-700: var(--pacific-700);
  --color-pacific-800: var(--pacific-800);
  --color-pacific-900: var(--pacific-900);

  --color-oat-50:  var(--oat-50);
  --color-oat-100: var(--oat-100);
  --color-oat-200: var(--oat-200);
  --color-oat-300: var(--oat-300);
  --color-oat-400: var(--oat-400);
  --color-oat-500: var(--oat-500);
  --color-oat-600: var(--oat-600);
  --color-oat-700: var(--oat-700);
  --color-oat-800: var(--oat-800);
  --color-oat-900: var(--oat-900);

  --color-lemonade-50:  var(--lemonade-50);
  --color-lemonade-100: var(--lemonade-100);
  --color-lemonade-200: var(--lemonade-200);
  --color-lemonade-300: var(--lemonade-300);
  --color-lemonade-400: var(--lemonade-400);
  --color-lemonade-500: var(--lemonade-500);
  --color-lemonade-600: var(--lemonade-600);
  --color-lemonade-700: var(--lemonade-700);
  --color-lemonade-800: var(--lemonade-800);
  --color-lemonade-900: var(--lemonade-900);

  --color-limeade-50:  var(--limeade-50);
  --color-limeade-100: var(--limeade-100);
  --color-limeade-200: var(--limeade-200);
  --color-limeade-300: var(--limeade-300);
  --color-limeade-400: var(--limeade-400);
  --color-limeade-500: var(--limeade-500);
  --color-limeade-600: var(--limeade-600);
  --color-limeade-700: var(--limeade-700);
  --color-limeade-800: var(--limeade-800);
  --color-limeade-900: var(--limeade-900);

  --color-lime-50:  var(--lime-50);
  --color-lime-100: var(--lime-100);
  --color-lime-200: var(--lime-200);
  --color-lime-300: var(--lime-300);
  --color-lime-400: var(--lime-400);
  --color-lime-500: var(--lime-500);
  --color-lime-600: var(--lime-600);
  --color-lime-700: var(--lime-700);
  --color-lime-800: var(--lime-800);
  --color-lime-900: var(--lime-900);
```

- [ ] **Step 1.4: Visual verify in browser.** With dev server already running on `http://localhost:3002`, hard-reload the home page. Existing pages should look identical (still EcoTrust). Open DevTools → Elements → `<html>` → Computed styles, type `--lapis-500` in the filter — value `#2D4670` should be present. If absent, the `:root` insert was malformed — re-check Step 1.2.

- [ ] **Step 1.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/app/globals.css
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add Lemonade palette CSS variables and Tailwind bindings"
```

---

## Task 2: Set up Fraunces + Inter via next/font

**Files:**
- Create: `src/lib/fonts.ts`

- [ ] **Step 2.1: Create `src/lib/fonts.ts` with this exact content:**

```typescript
import { Fraunces, Inter } from 'next/font/google';

/**
 * Fraunces — display face for editorial moments (H1-H3, italic emphasis).
 * Bound to CSS variable --font-fraunces, exposed as Tailwind `font-display`.
 */
export const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

/**
 * Inter — body and UI text.
 * Bound to CSS variable --font-inter, exposed as Tailwind `font-body`.
 */
export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
```

- [ ] **Step 2.2: Wire fonts into `src/app/layout.tsx`.** Open the file and replace lines 1-13 with:

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { fraunces, inter } from '@/lib/fonts';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
```

- [ ] **Step 2.3: Add Fraunces + Inter variables to the `<body>` className.** In `src/app/layout.tsx` line 32, replace:

```typescript
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

with:

```typescript
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${inter.variable} antialiased`}
      >
```

- [ ] **Step 2.4: Expose the new font CSS variables to Tailwind.** Open `src/app/globals.css`. In the `@theme inline { ... }` block, find the existing line `--font-sans: var(--font-sans);` (around line 149) and add these two lines immediately after it:

```css
  --font-display: var(--font-fraunces);
  --font-body: var(--font-inter);
```

- [ ] **Step 2.5: Visual verify on dev.** Hard-reload `http://localhost:3002`. DevTools → Elements → `<body>` → confirm `className` includes `__variable_fraunces_*` and `__variable_inter_*`. Computed styles for `<body>`: search `--font-fraunces` — should resolve to a generated `font-family` string starting with `__Fraunces`. If missing, network tab should show requests to `fonts.gstatic.com` for both families.

- [ ] **Step 2.6: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/lib/fonts.ts src/app/layout.tsx src/app/globals.css
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): wire Fraunces + Inter via next/font, expose font-display/body utilities"
```

---

## Task 3: Extend motion.ts with highlight stroke variants

**Files:**
- Modify: `src/lib/motion.ts` (append; do not modify existing exports)

- [ ] **Step 3.1: Open `src/lib/motion.ts` and append at the end of the file (after the `reducedStaggerItem` export on line 54):**

```typescript

/**
 * Highlight stroke variants — used by <Highlight> component to animate an SVG
 * path's strokeDashoffset from full (hidden) to 0 (revealed).
 *
 * The path is expected to be set up with stroke-dasharray equal to its total
 * length, and initial strokeDashoffset equal to that length. Animating to 0
 * draws the stroke on screen left-to-right.
 */
export const highlightStrokeVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
  },
};

export const reducedHighlightStrokeVariants: Variants = {
  hidden: { pathLength: 1, opacity: 1 },
  show: { pathLength: 1, opacity: 1 },
};
```

- [ ] **Step 3.2: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/lib/motion.ts
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add highlightStrokeVariants for <Highlight> component"
```

---

## Task 4: Create the Highlight motion component (TDD)

**Files:**
- Create: `src/components/motion/Highlight.tsx`
- Create: `src/components/motion/Highlight.test.tsx`

- [ ] **Step 4.1: Write the failing test first.** Create `src/components/motion/Highlight.test.tsx` with:

```typescript
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Highlight } from './Highlight';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

describe('Highlight', () => {
  it('renders the wrapped text content', () => {
    render(<Highlight>understand</Highlight>);
    expect(screen.getByText('understand')).toBeInTheDocument();
  });

  it('renders an SVG stroke beneath the text', () => {
    const { container } = render(<Highlight>love</Highlight>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('accepts a color prop and binds it to the stroke', () => {
    const { container } = render(<Highlight color="lemonade">clarity</Highlight>);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke')).toBe('var(--lemonade-400)');
  });

  it('defaults to limeade when color prop is omitted', () => {
    const { container } = render(<Highlight>noise</Highlight>);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke')).toBe('var(--limeade-400)');
  });
});
```

- [ ] **Step 4.2: Confirm the test fails.** STOP — do not run `pnpm test` directly. The non-negotiable safety rule is to verify test isolation first. Ask Bas: *"OK to run `pnpm exec vitest run src/components/motion/Highlight.test.tsx --reporter=verbose` ? This is unit-test only, no DB connection."* Wait for explicit yes. Expected output once run: 4 failures with `Cannot find module './Highlight'`.

- [ ] **Step 4.3: Create `src/components/motion/Highlight.tsx`:**

```typescript
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
```

- [ ] **Step 4.4: Re-run the test (with Bas approval).** Ask Bas again before running. Expected: all 4 tests pass.

- [ ] **Step 4.5: Add a reduced-motion test.** Append to `Highlight.test.tsx`:

```typescript
  it('uses reduced variants when prefers-reduced-motion is set', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const { container } = render(<Highlight>plan</Highlight>);
    expect(container.querySelector('svg path')).not.toBeNull();
  });
```

- [ ] **Step 4.6: Run test and confirm 5/5 pass (with Bas approval).**

- [ ] **Step 4.7: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/motion/Highlight.tsx src/components/motion/Highlight.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <Highlight> motion component with reduced-motion fallback"
```

---

## Task 5: Create the SunBadge brand component (TDD)

**Files:**
- Create: `src/components/brand/SunBadge.tsx`
- Create: `src/components/brand/SunBadge.test.tsx`

- [ ] **Step 5.1: Write the failing test.** Create `src/components/brand/SunBadge.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SunBadge } from './SunBadge';

describe('SunBadge', () => {
  it('renders an SVG circle in Lemonade color by default', () => {
    const { container } = render(<SunBadge />);
    const circle = container.querySelector('svg circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('fill')).toBe('var(--lemonade-400)');
  });

  it('accepts a size prop and applies it to the SVG', () => {
    const { container } = render(<SunBadge size={120} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('120');
    expect(svg?.getAttribute('height')).toBe('120');
  });

  it('renders a stroke ring when variant="ringed"', () => {
    const { container } = render(<SunBadge variant="ringed" />);
    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBe(2);
  });

  it('forwards className to the SVG element', () => {
    const { container } = render(<SunBadge className="absolute top-0 right-0" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('absolute');
  });
});
```

- [ ] **Step 5.2: Confirm the test fails (with Bas approval to run `pnpm exec vitest run src/components/brand/SunBadge.test.tsx`).** Expected: 4 failures with `Cannot find module './SunBadge'`.

- [ ] **Step 5.3: Create `src/components/brand/SunBadge.tsx`:**

```typescript
type SunVariant = 'solid' | 'ringed';

interface SunBadgeProps {
  size?: number;
  variant?: SunVariant;
  className?: string;
}

/**
 * The Lemonade sun motif. Reused as hero ornament, section marker, and
 * loading indicator. Pure SVG — no JS, no client boundary required.
 */
export function SunBadge({ size = 80, variant = 'solid', className }: SunBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Lemonade sun"
      className={className}
    >
      {variant === 'ringed' && (
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--lapis-500)"
          strokeWidth="2"
          strokeDasharray="3 4"
        />
      )}
      <circle cx="50" cy="50" r="40" fill="var(--lemonade-400)" />
    </svg>
  );
}
```

- [ ] **Step 5.4: Re-run test and confirm 4/4 pass (with Bas approval).**

- [ ] **Step 5.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/brand/SunBadge.tsx src/components/brand/SunBadge.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <SunBadge> reusable Lemonade sun motif"
```

---

## Task 6: Create the StripeDivider brand component (TDD)

**Files:**
- Create: `src/components/brand/StripeDivider.tsx`
- Create: `src/components/brand/StripeDivider.test.tsx`

- [ ] **Step 6.1: Write the failing test.** Create `src/components/brand/StripeDivider.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { StripeDivider } from './StripeDivider';

describe('StripeDivider', () => {
  it('renders an SVG element with stripe paths', () => {
    const { container } = render(<StripeDivider />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const paths = svg?.querySelectorAll('path') ?? [];
    expect(paths.length).toBeGreaterThanOrEqual(3);
  });

  it('binds the color prop to the stroke CSS variable', () => {
    const { container } = render(<StripeDivider color="pacific" />);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke')).toBe('var(--pacific-500)');
  });

  it('defaults to lime color when prop omitted', () => {
    const { container } = render(<StripeDivider />);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke')).toBe('var(--lime-500)');
  });

  it('forwards className to the wrapping element', () => {
    const { container } = render(<StripeDivider className="my-8" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('class')).toContain('my-8');
  });
});
```

- [ ] **Step 6.2: Confirm the test fails (with Bas approval).** Expected: 4 failures with `Cannot find module './StripeDivider'`.

- [ ] **Step 6.3: Create `src/components/brand/StripeDivider.tsx`:**

```typescript
type StripeColor = 'lime' | 'lapis' | 'pacific' | 'limeade';

const STROKE_VAR: Record<StripeColor, string> = {
  lime: 'var(--lime-500)',
  lapis: 'var(--lapis-500)',
  pacific: 'var(--pacific-500)',
  limeade: 'var(--limeade-500)',
};

interface StripeDividerProps {
  color?: StripeColor;
  className?: string;
}

/**
 * Hand-drawn stripe divider used to mark chapter starts. Three short ink
 * strokes with subtle vertical jitter. CSS-only animation keeps cost low.
 */
export function StripeDivider({ color = 'lime', className }: StripeDividerProps) {
  const stroke = STROKE_VAR[color];
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`flex items-center gap-2 ${className ?? ''}`}
    >
      <svg
        width="64"
        height="14"
        viewBox="0 0 64 14"
        fill="none"
      >
        <path
          d="M2 7 L 18 5"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M22 8 L 38 6"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M42 7 L 60 9"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
```

- [ ] **Step 6.4: Re-run test and confirm 4/4 pass (with Bas approval).**

- [ ] **Step 6.5: Commit.**

```bash
git -C /c/marketingreset/the-marketing-reset add src/components/brand/StripeDivider.tsx src/components/brand/StripeDivider.test.tsx
git -C /c/marketingreset/the-marketing-reset commit -m "feat(rebrand): add <StripeDivider> chapter-marker component"
```

---

## Task 7: Quality gates — full suite

- [ ] **Step 7.1: Type-check.** Ask Bas: *"OK to run `pnpm -C /c/marketingreset/the-marketing-reset type-check` ?"* Wait for yes. Expected raw output: `> tsc --noEmit` followed by no errors. Paste full output.

- [ ] **Step 7.2: Lint.** Ask Bas: *"OK to run `pnpm -C /c/marketingreset/the-marketing-reset lint` ?"* Wait for yes. Expected: `> eslint` with 0 errors / 0 warnings. Paste full output.

- [ ] **Step 7.3: Unit tests.** Ask Bas: *"OK to run `pnpm -C /c/marketingreset/the-marketing-reset test` (vitest unit tests, no DB connection — Highlight + SunBadge + StripeDivider add 13 tests; existing 83 should still pass for total 96)?"* Wait for yes. Paste full output. Expected: `Tests  96 passed (96)`.

- [ ] **Step 7.4: Build.** Ask Bas: *"OK to run `pnpm -C /c/marketingreset/the-marketing-reset build` (production build to validate font + token wiring)?"* Wait for yes. Paste full output. Expected: `✓ Compiled successfully` and route count `28 routes` (no new pages).

- [ ] **Step 7.5: If any gate fails, do not proceed.** Report exact error to Bas. Bas decides next step (fix vs. rollback). No rationalizing.

---

## Task 8: Visual smoke + spec sign-off

- [ ] **Step 8.1: Visual smoke on dev.** Push a confirmation screen to the visual companion (`.superpowers/brainstorm/<session>/content/slice-1-confirm.html`) showing: (a) the live Lemonade swatches rendered using the new tokens via `bg-lapis-500` / `bg-pacific-400` / `bg-oat-300` / `bg-lemonade-400` / `bg-limeade-400` / `bg-lime-500`; (b) Fraunces wordmark sample; (c) Inter body sample; (d) a `<Highlight>understand</Highlight>` demo; (e) a `<SunBadge size={120} />` and `<SunBadge variant="ringed" size={120} />`; (f) a `<StripeDivider color="pacific" />`. Bas reviews on `localhost:55379`.

- [ ] **Step 8.2: Bas confirms.** Wait for Bas's terminal "approved" before marking the slice done. If feedback, iterate before moving on.

- [ ] **Step 8.3: Update HANDOFF.md** to note slice 1 complete on `feat/jawdrop-rebrand-2026`, list components added, note that EcoTrust tokens still in place pending per-chapter migration.

- [ ] **Step 8.4: Final commit on the branch.**

```bash
git -C /c/marketingreset/the-marketing-reset add HANDOFF.md
git -C /c/marketingreset/the-marketing-reset commit -m "docs: HANDOFF — slice 1 design system complete"
```

- [ ] **Step 8.5: Do NOT push or merge yet.** Branch stays local until all 8 slices are reviewed end-to-end. Push happens only with Bas's explicit go after staging verification (per spec section 8 Rollout).

---

## Self-Review

**Spec coverage check** (against `2026-04-12-jawdrop-rebrand-design.md`):
- Spec §4.1 Palette → Task 1 ✓
- Spec §4.2 Typography → Task 2 ✓
- Spec §4.3 Motion System (no new deps, Framer-only) → Task 3 + Task 4 ✓
- Spec §4.6 Shared Motifs (yellow sun disc, hand-drawn stripe dividers, highlighter stroke) → Tasks 4, 5, 6 ✓
- Spec §4.5 Non-Negotiables (`prefers-reduced-motion` honored, AA contrast) → Task 4 (reduced-motion test) + Task 8 (visual smoke confirms contrast against intended bg)
- Spec §7.1 New files (motion + brand directories) → Tasks 4, 5, 6 ✓
- Spec §7.2 Files modified (globals.css, layout.tsx) → Tasks 1, 2 ✓
- Spec §7.5 Zero-touch — confirmed: validation, schema, auth, db, env, csrf, api, dashboard not touched in this slice
- Spec §4.4 Signature Motion Moments (8 total) → only `Highlight` (#01) is foundationally needed for slice 1; the other 7 (Strikethrough Hero, Sun Arc, Noise→Signal, Audience Mosaic, Reset Button, Plan Reveal, Tactile Stripes) build per-chapter in slices 2-7. Documented dependency.
- Spec §7.1 mentions `BookPageNumber.tsx`, `ChapterTag.tsx`, `PageCurlTransition.tsx`, `StrikethroughCycler.tsx`, `NoiseToSignal.tsx`, `PlanReveal.tsx`, `ResetButton.tsx`, `AudienceMosaic.tsx`, `AudienceTile.tsx`, `SunArc.tsx` — deferred to chapter-specific slices where they are first used (avoids creating components without their consumer in scope).

**Placeholder scan:** No "TBD", no "implement later", no "add appropriate error handling". Every code block is complete.

**Type consistency:** `HighlightColor` defined in Task 4; `StripeColor` defined in Task 6 — different unions intentionally (Highlight needs accent colors, Stripe needs neutral dividers). `SunVariant` defined in Task 5. No cross-task name collisions.

**Spec gap discovered:** The spec assumed `tailwind.config.ts` would be modified, but the project uses Tailwind v4 with CSS-first config. Plan adapts: all token wiring goes through `globals.css @theme inline` block. No spec contradiction — the spec's "tokens swapped, scales regenerated" intent is fulfilled.

**Component naming gap:** Spec refers to `site-header.tsx` / `site-footer.tsx`; the codebase uses `public-header.tsx` / `public-footer.tsx`. Slice 1 does not touch either, but later slices will use the actual filenames.

**Risk re-check:** The additive-tokens approach means existing pages keep rendering with EcoTrust styling. Worst case if slice 1 lands and slice 2 is delayed: the live site (when this branch eventually deploys) looks identical to today, plus three unused components in the bundle (~3 KB gzipped). Acceptable.

---

## Slice 1 Acceptance Criteria

- [ ] All Lemonade tokens reachable via Tailwind utilities (`bg-pacific-400`, `text-lapis-700`, etc.)
- [ ] Fraunces and Inter fonts loading from Google Fonts in network tab
- [ ] `font-display` and `font-body` Tailwind utilities resolve correctly
- [ ] `<Highlight>`, `<SunBadge>`, `<StripeDivider>` render correctly in visual smoke
- [ ] All quality gates green (type-check 0, lint 0/0, test 96/96, build 28 routes)
- [ ] No regression on existing pages (home, about, how-it-works, contact, get-started, not-ready, login, dashboard) — visual diff inspection against pre-slice screenshot
- [ ] EcoTrust tokens still resolve (`bg-brand-700`, `text-warm-800`, etc.) — coexistence verified
- [ ] Bas signs off on visual smoke
- [ ] Slice committed (~7 commits) on `feat/jawdrop-rebrand-2026`, branch not yet pushed
