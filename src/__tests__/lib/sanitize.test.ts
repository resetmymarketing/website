import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeString, sanitizeEmail } from '@/lib/sanitize';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#39;world&#39;');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('does not double-escape', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  it('handles strings with no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('sanitizeString', () => {
  it('trims and escapes', () => {
    expect(sanitizeString('  <b>bold</b>  ')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('trims and lowercases', () => {
    expect(sanitizeEmail('  Jane@Example.COM  ')).toBe('jane@example.com');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeEmail(42)).toBe('');
  });
});
