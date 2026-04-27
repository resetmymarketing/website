import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ColorBand } from './ColorBand';

describe('ColorBand', () => {
  it('renders a div with role and aria-hidden for decoration', () => {
    const html = renderToStaticMarkup(<ColorBand />);
    expect(html).toContain('role="presentation"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('defaults to lemonade background', () => {
    const html = renderToStaticMarkup(<ColorBand />);
    expect(html).toContain('background-color:var(--lemonade-400)');
  });

  it('binds the color prop to the background variable', () => {
    const html = renderToStaticMarkup(<ColorBand color="pacific" />);
    expect(html).toContain('background-color:var(--pacific-500)');
  });

  it('defaults to 8px height', () => {
    const html = renderToStaticMarkup(<ColorBand />);
    expect(html).toContain('height:8px');
  });

  it('honors custom height', () => {
    const html = renderToStaticMarkup(<ColorBand height={14} />);
    expect(html).toContain('height:14px');
  });

  it('forwards className', () => {
    const html = renderToStaticMarkup(<ColorBand className="my-band" />);
    expect(html).toContain('my-band');
  });
});
