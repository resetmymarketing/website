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

  it('renders the resolution headline and body', () => {
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain(SAMPLE.headline);
    expect(html).toContain(SAMPLE.body);
  });

  it('still includes both columns under reduced motion', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(
      <NoiseToSignal
        noise={SAMPLE.noise}
        signalHeadline={SAMPLE.headline}
        signalBody={SAMPLE.body}
      />,
    );
    expect(html).toContain(SAMPLE.noise[0]);
    expect(html).toContain(SAMPLE.headline);
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
});
