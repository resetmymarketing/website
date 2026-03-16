import { describe, it, expect } from 'vitest';
import { validateOrigin } from '../../lib/csrf';

function makeRequest(method: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/test', {
    method,
    headers,
  });
}

describe('validateOrigin', () => {
  it('allows GET requests without origin', () => {
    const req = makeRequest('GET');
    expect(validateOrigin(req)).toBe(true);
  });

  it('allows HEAD requests without origin', () => {
    const req = makeRequest('HEAD');
    expect(validateOrigin(req)).toBe(true);
  });

  it('allows OPTIONS requests without origin', () => {
    const req = makeRequest('OPTIONS');
    expect(validateOrigin(req)).toBe(true);
  });

  it('blocks POST without origin or referer', () => {
    const req = makeRequest('POST', { host: 'localhost:3000' });
    expect(validateOrigin(req)).toBe(false);
  });

  it('allows POST with matching origin', () => {
    const req = makeRequest('POST', {
      host: 'localhost:3000',
      origin: 'http://localhost:3000',
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it('blocks POST with mismatched origin', () => {
    const req = makeRequest('POST', {
      host: 'localhost:3000',
      origin: 'http://evil.com',
    });
    expect(validateOrigin(req)).toBe(false);
  });

  it('allows POST with matching referer when no origin', () => {
    const req = makeRequest('POST', {
      host: 'localhost:3000',
      referer: 'http://localhost:3000/login',
    });
    expect(validateOrigin(req)).toBe(true);
  });

  it('blocks POST with mismatched referer', () => {
    const req = makeRequest('POST', {
      host: 'localhost:3000',
      referer: 'http://evil.com/phish',
    });
    expect(validateOrigin(req)).toBe(false);
  });

  it('blocks POST with invalid origin URL', () => {
    const req = makeRequest('POST', {
      host: 'localhost:3000',
      origin: 'not-a-url',
    });
    expect(validateOrigin(req)).toBe(false);
  });
});
