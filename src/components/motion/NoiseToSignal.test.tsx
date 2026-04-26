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

  it('renders the signal headline at full opacity from frame 1', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain('One sentence.');
    expect(html).toContain('The one that fits you.');
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

  it('italicizes the first sentence of the signal headline', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toMatch(/<span class="italic"[^>]*>One sentence\.<\/span>/);
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
    expect(html).toContain('One sentence.');
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

  it('applies Limeade strikethrough to the chips', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain('line-through');
    expect(html).toContain('var(--limeade-500)');
  });
});
