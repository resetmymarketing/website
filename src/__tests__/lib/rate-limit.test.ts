import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../../lib/rate-limit';

describe('checkRateLimit', () => {
  const config = { maxRequests: 3, windowMs: 60000 };

  it('allows requests under the limit', () => {
    const key = `test-under-${Date.now()}`;
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks requests over the limit', () => {
    const key = `test-over-${Date.now()}`;
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks remaining count accurately', () => {
    const key = `test-remaining-${Date.now()}`;
    expect(checkRateLimit(key, config).remaining).toBe(2);
    expect(checkRateLimit(key, config).remaining).toBe(1);
    expect(checkRateLimit(key, config).remaining).toBe(0);
  });

  it('uses separate counters for different keys', () => {
    const key1 = `test-sep1-${Date.now()}`;
    const key2 = `test-sep2-${Date.now()}`;
    checkRateLimit(key1, config);
    checkRateLimit(key1, config);
    checkRateLimit(key1, config);
    const result = checkRateLimit(key2, config);
    expect(result.allowed).toBe(true);
  });
});
