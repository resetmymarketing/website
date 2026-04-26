import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudienceTile } from './AudienceTile';

describe('AudienceTile', () => {
  it('renders the label', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Salons" testimonial="Stylists who care." />,
    );
    expect(html).toContain('Salons');
  });

  it('renders the testimonial in the hover layer', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Bakeries" testimonial="Real flour, real ovens." />,
    );
    expect(html).toContain('Real flour, real ovens.');
  });

  it('falls back to a color block when no image is provided', () => {
    const html = renderToStaticMarkup(
      <AudienceTile label="Florists" testimonial="Beauty for a living." />,
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('background:');
  });

  it('renders an image when imageSrc is provided', () => {
    const html = renderToStaticMarkup(
      <AudienceTile
        label="Coffee Shops"
        testimonial="Third place."
        imageSrc="/images/audience/coffee.jpg"
        imageAlt="A barista pouring espresso"
      />,
    );
    expect(html).toContain('coffee.jpg');
    expect(html).toContain('A barista pouring espresso');
  });
});
