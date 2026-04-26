import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StripeDivider } from './StripeDivider';

describe('StripeDivider', () => {
  it('renders an SVG element with three stripe paths', () => {
    const html = renderToStaticMarkup(<StripeDivider />);
    expect(html).toContain('<svg');
    const pathMatches = html.match(/<path/g) ?? [];
    expect(pathMatches.length).toBe(3);
  });

  it('binds the color prop to the stroke CSS variable', () => {
    const html = renderToStaticMarkup(<StripeDivider color="pacific" />);
    expect(html).toContain('stroke="var(--pacific-500)"');
  });

  it('defaults to lime color when prop is omitted', () => {
    const html = renderToStaticMarkup(<StripeDivider />);
    expect(html).toContain('stroke="var(--lime-500)"');
  });

  it('forwards className to the wrapping element', () => {
    const html = renderToStaticMarkup(<StripeDivider className="my-8" />);
    expect(html).toContain('my-8');
  });

  it('marks the wrapper aria-hidden so screen readers ignore the decoration', () => {
    const html = renderToStaticMarkup(<StripeDivider />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });
});
