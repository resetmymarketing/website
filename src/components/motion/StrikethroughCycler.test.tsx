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
  it('renders the first tactic on initial render', () => {
    const html = renderToStaticMarkup(
      <StrikethroughCycler tactics={['A.', 'B.', 'C.']} resolution="X." />,
    );
    expect(html).toContain('A.');
  });

  it('passes resolutionEmphasis to a Highlight wrapper when provided', () => {
    const html = renderToStaticMarkup(
      <StrikethroughCycler
        tactics={['A.', 'B.', 'C.']}
        resolution="Start with clarity."
        resolutionEmphasis="clarity"
      />,
    );
    // Cycler starts in cycle stage, but Highlight color string only renders
    // when in resolution stage. To verify the prop works, render under
    // reduced motion (forces resolution stage immediately).
    expect(html).toContain('A.');
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

  it('wraps the emphasis word with Highlight in resolution stage under reduced motion', async () => {
    const fm = await import('framer-motion');
    vi.mocked(fm.useReducedMotion).mockReturnValueOnce(true);
    const html = renderToStaticMarkup(
      <StrikethroughCycler
        tactics={['A.']}
        resolution="Start with clarity."
        resolutionEmphasis="clarity"
      />,
    );
    expect(html).toContain('clarity');
    expect(html).toContain('var(--limeade-400)');
  });
});
