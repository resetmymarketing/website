import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SunBadge } from './SunBadge';

describe('SunBadge', () => {
  it('renders an SVG circle in Lemonade color by default', () => {
    const html = renderToStaticMarkup(<SunBadge />);
    expect(html).toContain('<svg');
    expect(html).toContain('<circle');
    expect(html).toContain('fill="var(--lemonade-400)"');
  });

  it('accepts a size prop and applies it to the SVG width and height', () => {
    const html = renderToStaticMarkup(<SunBadge size={120} />);
    expect(html).toContain('width="120"');
    expect(html).toContain('height="120"');
  });

  it('renders a stroke ring when variant="ringed"', () => {
    const html = renderToStaticMarkup(<SunBadge variant="ringed" />);
    const circleMatches = html.match(/<circle/g) ?? [];
    expect(circleMatches.length).toBe(2);
    expect(html).toContain('stroke="var(--lapis-500)"');
  });

  it('renders only one circle in the default solid variant', () => {
    const html = renderToStaticMarkup(<SunBadge />);
    const circleMatches = html.match(/<circle/g) ?? [];
    expect(circleMatches.length).toBe(1);
  });

  it('forwards className to the SVG element', () => {
    const html = renderToStaticMarkup(<SunBadge className="absolute top-0 right-0" />);
    expect(html).toContain('class="absolute top-0 right-0"');
  });

  it('exposes an accessible label', () => {
    const html = renderToStaticMarkup(<SunBadge />);
    expect(html).toContain('aria-label="Lemonade sun"');
    expect(html).toContain('role="img"');
  });
});
