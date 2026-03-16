/**
 * CSRF / Origin validation for mutation requests.
 *
 * Validates that POST/PUT/PATCH/DELETE requests originate from
 * the same origin as the application. This prevents cross-site
 * request forgery attacks.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function validateOrigin(request: Request): boolean {
  // Safe methods don't need origin validation
  if (SAFE_METHODS.has(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // If no origin header, check referer as fallback
  if (!origin) {
    const referer = request.headers.get('referer');
    if (!referer) {
      // No origin or referer - block by default for safety
      return false;
    }
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function csrfError(): Response {
  return new Response(JSON.stringify({ error: 'Invalid request origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
