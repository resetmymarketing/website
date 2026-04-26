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

  it('marks the wrapper aria-hidden so screen readers ignore the decoration', () => {
    const html = renderToStaticMarkup(<SunArc />);
    expect(html).toContain('aria-hidden="true"');
  });

  it('still renders when prefers-reduced-motion is set', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(<SunArc />);
    expect(html).toContain('aria-label="Lemonade sun"');
  });
});
