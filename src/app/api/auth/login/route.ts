import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyCredentials, createSession } from '@/lib/auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { validateOrigin, csrfError } from '@/lib/csrf';

const LOGIN_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export async function POST(request: Request) {
  try {
    // CSRF validation
    if (!validateOrigin(request)) {
      return csrfError();
    }

    // Rate limiting
    const key = `login:${getRateLimitKey(request)}`;
    const rateLimit = checkRateLimit(key, LOGIN_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        },
      );
    }

    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const user = await verifyCredentials(parsed.data.email, parsed.data.password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process login. Please try again.' },
      { status: 500 },
    );
  }
}
