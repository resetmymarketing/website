import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
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
    const html = renderToStaticMarkup(<Highlight>understand</Highlight>);
    expect(html).toContain('understand');
  });

  it('renders an SVG stroke beneath the text', () => {
    const html = renderToStaticMarkup(<Highlight>love</Highlight>);
    expect(html).toContain('<svg');
    expect(html).toContain('<path');
  });

  it('binds the color prop to the stroke', () => {
    const html = renderToStaticMarkup(<Highlight color="lemonade">clarity</Highlight>);
    expect(html).toContain('var(--lemonade-400)');
  });

  it('defaults to limeade when color prop is omitted', () => {
    const html = renderToStaticMarkup(<Highlight>noise</Highlight>);
    expect(html).toContain('var(--limeade-400)');
  });

  it('marks the SVG aria-hidden so screen readers ignore the decoration', () => {
    const html = renderToStaticMarkup(<Highlight>plan</Highlight>);
    expect(html).toContain('aria-hidden="true"');
  });

  it('still renders correctly when prefers-reduced-motion is set', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(<Highlight>quiet</Highlight>);
    expect(html).toContain('quiet');
    expect(html).toContain('<path');
  });
});
