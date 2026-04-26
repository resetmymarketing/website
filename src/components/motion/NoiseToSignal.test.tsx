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
  noise: ['One.', 'Two.', 'Three.', 'Four.'] as const,
  headline: 'One sentence. The one that fits you.',
  body: 'The Reset gives you the one direction that fits.',
};

describe('NoiseToSignal', () => {
  it('renders every noise chip up to the available position slots', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    SAMPLE.noise.forEach((chip) => {
      expect(html).toContain(chip);
    });
  });

  it('renders every word of the signal headline as a separate span', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    ['One', 'sentence.', 'The', 'one', 'that', 'fits', 'you.'].forEach((word) => {
      expect(html).toContain(word);
    });
  });

  it('renders the body copy', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain(SAMPLE.body);
  });

  it('italicizes only the first sentence words', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toMatch(/<span class="[^"]*\bitalic\b[^"]*"[^>]*>One/);
    expect(html).toMatch(/<span class="[^"]*\bitalic\b[^"]*"[^>]*>sentence\./);
    // Words after the first sentence should NOT have italic
    expect(html).toMatch(/<span class="(?:(?!italic)[^"])*"[^>]*>The/);
  });

  it('still renders signal under reduced motion', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain('One');
    expect(html).toContain(SAMPLE.body);
  });

  it('uses Pacific-50 background per spec', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain('bg-pacific-50');
  });

  it('renders a Limeade strike bar overlaid on each chip', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain('bg-limeade-500');
    // One strike bar per chip
    const strikeMatches = html.match(/bg-limeade-500/g) ?? [];
    expect(strikeMatches.length).toBeGreaterThanOrEqual(SAMPLE.noise.length);
  });
});
