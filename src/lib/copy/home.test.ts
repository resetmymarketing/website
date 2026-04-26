import { describe, expect, it } from 'vitest';
import {
  HERO_COPY,
  WHO_THIS_IS_FOR_COPY,
  THREE_SHIFTS_COPY,
  NOISE_TO_SIGNAL_COPY,
  AUDIENCE_MOSAIC_COPY,
  FINAL_CTA_COPY,
} from './home';

describe('home copy schema', () => {
  it('hero has exactly three cycler tactics', () => {
    expect(HERO_COPY.cyclerTactics.length).toBe(3);
  });

  it('hero resolution contains the emphasis word', () => {
    expect(HERO_COPY.resolution).toContain(HERO_COPY.resolutionEmphasis);
  });

  it('who-this-is-for has exactly four category tags', () => {
    expect(WHO_THIS_IS_FOR_COPY.tags.length).toBe(4);
  });

  it('three shifts has exactly three pillars', () => {
    expect(THREE_SHIFTS_COPY.pillars.length).toBe(3);
  });

  it('three shifts pillar numbers are 01, 02, 03 in order', () => {
    expect(THREE_SHIFTS_COPY.pillars.map((p) => p.number)).toEqual(['01', '02', '03']);
  });

  it('noise-to-signal has between 8 and 12 noise chips', () => {
    expect(NOISE_TO_SIGNAL_COPY.noiseChips.length).toBeGreaterThanOrEqual(8);
    expect(NOISE_TO_SIGNAL_COPY.noiseChips.length).toBeLessThanOrEqual(12);
  });

  it('audience mosaic has between 6 and 8 tiles per spec', () => {
    expect(AUDIENCE_MOSAIC_COPY.tiles.length).toBeGreaterThanOrEqual(6);
    expect(AUDIENCE_MOSAIC_COPY.tiles.length).toBeLessThanOrEqual(8);
  });

  it('every audience tile has a non-empty testimonial', () => {
    AUDIENCE_MOSAIC_COPY.tiles.forEach((tile) => {
      expect(tile.testimonial.length).toBeGreaterThan(10);
    });
  });

  it('final CTA has a label and href', () => {
    expect(FINAL_CTA_COPY.cta.label.length).toBeGreaterThan(0);
    expect(FINAL_CTA_COPY.cta.href.startsWith('/')).toBe(true);
  });
});
