import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AwningBand } from './AwningBand';

describe('AwningBand', () => {
  it('renders an SVG with a tiled pattern', () => {
    const html = renderToStaticMarkup(<AwningBand />);
    expect(html).toContain('<svg');
    expect(html).toContain('<pattern');
  });

  it('uses Pacific blue as the default colored stripe', () => {
    const html = renderToStaticMarkup(<AwningBand />);
    expect(html).toContain('fill="var(--pacific-500)"');
  });

  it('binds the color prop to the colored stripe fill', () => {
    const html = renderToStaticMarkup(<AwningBand color="lemonade" />);
    expect(html).toContain('fill="var(--lemonade-400)"');
  });

  it('always renders the white stripe alongside the colored one', () => {
    const html = renderToStaticMarkup(<AwningBand color="lemonade" />);
    expect(html).toContain('fill="#ffffff"');
  });

  it('forwards className to the SVG element', () => {
    const html = renderToStaticMarkup(<AwningBand className="z-20 relative" />);
    expect(html).toContain('z-20 relative');
  });

  it('marks the SVG aria-hidden so screen readers ignore the decoration', () => {
    const html = renderToStaticMarkup(<AwningBand />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });

  it('honors custom stripe and band dimensions', () => {
    const html = renderToStaticMarkup(
      <AwningBand stripeWidth={40} bandHeight={28} scallopHeight={16} />,
    );
    expect(html).toContain('height="44"');
    expect(html).toContain('width="80"');
  });
});
