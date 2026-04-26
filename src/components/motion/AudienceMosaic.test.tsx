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

  it('uses an article element per tile', () => {
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

  it('uses Lapis background per spec', () => {
    const html = renderToStaticMarkup(<AudienceMosaic tiles={TILES} />);
    expect(html).toContain('bg-lapis-700');
  });
});
