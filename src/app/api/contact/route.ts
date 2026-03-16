import { NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validation';
import { sanitizeString, sanitizeEmail } from '@/lib/sanitize';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/schema';
import { validateOrigin, csrfError } from '@/lib/csrf';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const CONTACT_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
};

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return csrfError();
    }

    const key = `contact:${getRateLimitKey(request)}`;
    const rateLimit = checkRateLimit(key, CONTACT_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, businessName, message } = parsed.data;

    await db.insert(contactSubmissions).values({
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      businessName: businessName ? sanitizeString(businessName) : null,
      message: sanitizeString(message),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process your request. Please try again later.' },
      { status: 500 },
    );
  }
}
