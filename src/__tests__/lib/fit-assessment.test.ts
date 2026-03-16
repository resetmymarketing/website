import { describe, it, expect } from 'vitest';
import { assessFit } from '../../lib/fit-assessment';

describe('assessFit', () => {
  it('returns red rating for null intake data', () => {
    const result = assessFit(null);
    expect(result.rating).toBe('red');
    expect(result.score).toBe(0);
    expect(result.flags).toHaveLength(0);
  });

  it('returns red rating for empty intake data', () => {
    const result = assessFit({});
    expect(result.rating).toBe('red');
    expect(result.score).toBe(0);
    expect(result.flags.every((f) => !f.met)).toBe(true);
  });

  it('returns green rating when all criteria are met', () => {
    const result = assessFit({
      q02: 'We offer branding and social media management services',
      q03: 'Been in business for 5 years now',
      q04: 'Small business owners who need help with marketing',
      q06: 'Using Instagram and Facebook for organic content',
      q09: '5 hours per week',
      q11: 'A clear content plan and brand voice that attracts clients',
    });
    expect(result.rating).toBe('green');
    expect(result.score).toBe(100);
    expect(result.flags.every((f) => f.met)).toBe(true);
  });

  it('returns yellow rating for partial criteria', () => {
    const result = assessFit({
      q02: 'We offer branding and social media management services',
      q04: 'Small business owners who need help with marketing',
      q09: '5 hours',
    });
    expect(result.rating).toBe('yellow');
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(70);
  });

  it('handles array values by joining them', () => {
    const result = assessFit({
      q02: ['Branding', 'Social media', 'Content creation'],
      q03: 'Three years in business running things',
      q04: 'Service-based business owners needing strategy',
      q06: 'Instagram, TikTok, and email marketing',
      q09: '3 hours',
      q11: 'Consistent content and clear messaging strategy',
    });
    expect(result.rating).toBe('green');
  });

  it('requires minimum length for substantive answers', () => {
    const result = assessFit({
      q02: 'Yes', // too short
      q04: 'Anyone', // too short
      q11: 'Revenue', // too short
    });
    // These short answers won't pass the 10-char minimum
    expect(result.flags.filter((f) => f.met).length).toBeLessThan(3);
  });

  it('includes correct flag details', () => {
    const result = assessFit({
      q02: 'We provide complete marketing strategy services',
    });
    const q02Flag = result.flags.find((f) => f.field === 'q02');
    expect(q02Flag).toBeDefined();
    expect(q02Flag?.met).toBe(true);
    expect(q02Flag?.weight).toBe(20);
  });

  it('summary reflects the rating', () => {
    const green = assessFit({
      q02: 'Complete branding and marketing services',
      q03: 'Ten years of business experience here',
      q04: 'Small business owners needing marketing clarity',
      q06: 'Instagram, Facebook, email, and networking events',
      q09: '5 hours per week',
      q11: 'A marketing plan I can actually follow consistently',
    });
    expect(green.summary).toContain('Strong fit');

    const red = assessFit({});
    expect(red.summary).toContain('Weak fit');
  });
});
